import assert from "node:assert/strict";
import { safeAssertionMessage } from "./assertion-message.mjs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const catalog = ["americano", "cappuccino", "coffee-milk", "peach-tea"];
export function assertRailwayStockTarget(env, execute) {
  const url = new URL(env.DATABASE_URL);
  assert(["postgres:", "postgresql:"].includes(url.protocol), "Only PostgreSQL connections are allowed.");
  assert(url.hostname.endsWith(".railway.internal") && url.pathname === "/brewlite_a2", "Requires the private Railway A2 database.");
  for (const key of ["RAILWAY_PROJECT_ID", "RAILWAY_ENVIRONMENT_ID"]) assert(/^[a-f0-9-]{36}$/i.test(env[key] ?? ""), "Run inside the identified Railway service.");
  assert([...url.searchParams].every(([k, v]) => k === "schema" && v === "public") && url.searchParams.getAll("schema").length <= 1, "Connection overrides are blocked.");
  if (execute) assert.equal(env.ALLOW_A2_RAILWAY_STOCK_INIT, "1", "Explicit one-time stock initialization is required.");
  return url;
}

export async function initializeRailwayStock(client, execute = false, expectedDatabase = "brewlite_a2") {
  assert(["brewlite_a2", "brewlite_a2_test"].includes(expectedDatabase), "Unsupported A2 database name.");
  await client.query(`BEGIN ISOLATION LEVEL SERIALIZABLE${execute ? "" : " READ ONLY"}`);
  try {
    if (execute) await client.query("SELECT pg_advisory_xact_lock(hashtext('brewlite-a2-railway-initial-stock-v1'))");
    const identity = (await client.query("SELECT current_database() AS name, current_setting('server_version') AS version")).rows[0];
    assert.equal(identity.name, expectedDatabase, "Connected database differs from the intended A2 target."); assert(identity.version.startsWith("17."), "PostgreSQL 17 is required.");
    const products = (await client.query(`SELECT id, stock, reserved_stock, stock_version FROM products ORDER BY id${execute ? " FOR UPDATE" : ""}`)).rows;
    assert.deepEqual(products.map(p => p.id), catalog, "Only the four known catalog products are allowed during first initialization.");
    assert(products.every(p => p.stock === 0 && p.reserved_stock === 0 && p.stock_version === 0), "Stock has already been initialized or changed; refusing to reset it.");
    const orders = (await client.query("SELECT count(*)::int AS total, count(*) FILTER (WHERE checkout_policy_version <> 1)::int AS modern FROM orders")).rows[0];
    assert.equal(orders.modern, 0, "New workflow orders exist; use reviewed inventory operations instead.");
    assert.equal((await client.query("SELECT count(*)::int AS count FROM stock_reservations")).rows[0].count, 0, "Reservations exist; refusing initialization.");
    if (execute) {
      const result = await client.query("UPDATE products SET stock = 10, stock_version = stock_version + 1 WHERE id = ANY($1::text[]) AND stock = 0 AND reserved_stock = 0 AND stock_version = 0", [catalog]);
      assert.equal(result.rowCount, 4, "Initialization conflict.");
    }
    await client.query("COMMIT");
    return { mode: execute ? "initialized" : "plan-only", products: 4, stockPerProduct: 10, preservedLegacyOrders: orders.total };
  } catch (error) { await client.query("ROLLBACK"); throw error; }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  let client;
  try {
    const args = process.argv.slice(2);
    assert(args.length <= 1 && [undefined, "--plan", "--execute"].includes(args[0]), "Use --plan or --execute.");
    await import("dotenv/config");
    const execute = args[0] === "--execute";
    assertRailwayStockTarget(process.env, execute);
    const { Client } = await import("pg");
    client = new Client({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 10000,
      options: "-c timezone=UTC -c search_path=public -c statement_timeout=15000 -c lock_timeout=5000" });
    await client.connect();
    console.log(JSON.stringify(await initializeRailwayStock(client, execute)));
  } catch (error) { console.error("RAILWAY_STOCK_INIT_NOT_CONFIRMED: " + safeAssertionMessage(error, "Inspect the private A2 target and stock state before retry; no database reset is performed.")); process.exitCode = 1; }
  finally { if (client) await client.end().catch(() => {}); }
}
