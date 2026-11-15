import test, { before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { Client } from "pg";
import { assertA2TestTarget } from "../../apps/api/src/database/a2-test-target.ts";
import { initializeRailwayStock } from "../../apps/api/prisma/initialize-railway-stock.mjs";

assertA2TestTarget(process.env.DATABASE_URL, process.env.A2_INTEGRATION_TEST);
const schema = `a2_stock_${randomUUID().replaceAll("-", "")}`;
const client = new Client({ connectionString: process.env.DATABASE_URL });
const ids = ["americano", "cappuccino", "coffee-milk", "peach-tea"];
before(async () => {
  await client.connect(); await client.query(`CREATE SCHEMA "${schema}"`); await client.query(`SET search_path TO "${schema}"`);
  assert.equal((await client.query("SELECT current_schema() AS name")).rows[0].name, schema);
  await client.query(`CREATE TABLE products(id text PRIMARY KEY, stock int NOT NULL, reserved_stock int NOT NULL, stock_version int NOT NULL);
    CREATE TABLE orders(id text PRIMARY KEY, checkout_policy_version int NOT NULL, snapshot jsonb NOT NULL);
    CREATE TABLE stock_reservations(id text PRIMARY KEY);`);
});
beforeEach(async () => {
  await client.query(`DROP TRIGGER IF EXISTS injected_stock_failure ON products; TRUNCATE products, orders, stock_reservations`);
  for (const id of ids) await client.query("INSERT INTO products VALUES ($1,0,0,0)", [id]);
  await client.query("INSERT INTO orders VALUES ('legacy',1,$1)", [JSON.stringify({ total: 57000, status: "PENDING", key: "immutable" })]);
});
after(async () => {
  try { await client.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`); } finally { await client.end(); }
});
const run = (execute = true, connection = client) => initializeRailwayStock(connection, execute, "brewlite_a2_test");

test("real PostgreSQL plan writes nothing; initialization preserves the legacy snapshot", async () => {
  const legacy = (await client.query("SELECT * FROM orders ORDER BY id")).rows;
  assert.equal((await run(false)).mode, "plan-only");
  assert((await client.query("SELECT * FROM products")).rows.every(p => p.stock === 0 && p.stock_version === 0));
  assert.equal((await run()).preservedLegacyOrders, 1);
  assert((await client.query("SELECT * FROM products")).rows.every(p => p.stock === 10 && p.stock_version === 1 && p.reserved_stock === 0));
  assert.deepEqual((await client.query("SELECT * FROM orders ORDER BY id")).rows, legacy);
  await assert.rejects(run());
  assert((await client.query("SELECT * FROM products")).rows.every(p => p.stock === 10 && p.stock_version === 1));
});
test("a modern order blocks the operation without changing stock", async () => {
  await client.query("INSERT INTO orders VALUES ('modern',2,'{}')"); await assert.rejects(run());
  assert((await client.query("SELECT * FROM products")).rows.every(p => p.stock === 0));
});
test("a reservation blocks the operation without changing stock", async () => {
  await client.query("INSERT INTO stock_reservations VALUES ('reserved')"); await assert.rejects(run());
  assert((await client.query("SELECT * FROM products")).rows.every(p => p.stock === 0));
});
test("a database error partway through UPDATE rolls back every product", async () => {
  await client.query(`CREATE OR REPLACE FUNCTION fail_stock() RETURNS trigger LANGUAGE plpgsql AS $$
    BEGIN IF NEW.id = 'coffee-milk' THEN RAISE EXCEPTION 'injected fixture failure'; END IF; RETURN NEW; END $$;
    CREATE TRIGGER injected_stock_failure BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION fail_stock();`);
  await assert.rejects(run());
  assert((await client.query("SELECT * FROM products")).rows.every(p => p.stock === 0 && p.stock_version === 0));
  assert.equal((await client.query("SELECT count(*)::int AS count FROM orders")).rows[0].count, 1);
});
test("two connections cannot initialize the same stock twice", async () => {
  const other = new Client({ connectionString: process.env.DATABASE_URL }); await other.connect();
  try {
    await other.query(`SET search_path TO "${schema}"`);
    const outcomes = await Promise.allSettled([run(), run(true, other)]);
    assert.equal(outcomes.filter(r => r.status === "fulfilled").length, 1);
    assert((await client.query("SELECT * FROM products")).rows.every(p => p.stock === 10 && p.stock_version === 1));
  } finally { await other.end(); }
});
