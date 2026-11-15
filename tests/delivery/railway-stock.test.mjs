import test from "node:test";
import assert from "node:assert/strict";
import { assertRailwayStockTarget, initializeRailwayStock } from "../../apps/api/prisma/initialize-railway-stock.mjs";

const env = { DATABASE_URL: "postgresql://fixture:password@postgres.railway.internal:5432/brewlite_a2?schema=public",
  RAILWAY_PROJECT_ID: "00000000-0000-4000-8000-000000000001", RAILWAY_ENVIRONMENT_ID: "00000000-0000-4000-8000-000000000002" };
test("Railway initializer cannot run against local/A1/public targets or without explicit execute flag", () => {
  for (const url of ["postgresql://localhost/brewlite_a2", "postgresql://db.railway.internal/brewlite_s3_demo", "postgresql://db.example.com/brewlite_a2", env.DATABASE_URL + "&host=other"]) assert.throws(() => assertRailwayStockTarget({ ...env, DATABASE_URL: url }, false));
  assert.throws(() => assertRailwayStockTarget(env, true));
  assertRailwayStockTarget({ ...env, ALLOW_A2_RAILWAY_STOCK_INIT: "1" }, true);
});
function fixture({ used = false, modern = 0, reservations = 0, updateCount = 4 } = {}) {
  const queries = [];
  return { queries, async query(sql) {
    queries.push(sql);
    if (sql.startsWith("SELECT current_database")) return { rows: [{ name: "brewlite_a2", version: "17.12" }] };
    if (sql.startsWith("SELECT id")) return { rows: ["americano", "cappuccino", "coffee-milk", "peach-tea"].map(id => ({ id, stock: used ? 5 : 0, reserved_stock: 0, stock_version: used ? 1 : 0 })) };
    if (sql.includes("FROM orders")) return { rows: [{ total: 1, modern }] };
    if (sql.includes("FROM stock_reservations")) return { rows: [{ count: reservations }] };
    return { rows: [], rowCount: updateCount };
  } };
}
test("stock plan is read-only and allows preserving legacy orders", async () => {
  const f = fixture(), r = await initializeRailwayStock(f, false);
  assert.equal(r.mode, "plan-only"); assert.equal(r.preservedLegacyOrders, 1);
  assert(f.queries[0].includes("READ ONLY")); assert(!f.queries.some(q => q.startsWith("UPDATE")));
});
for (const options of [{ used: true }, { modern: 1 }, { reservations: 1 }]) test(`stock mutation is refused before UPDATE: ${JSON.stringify(options)}`, async () => {
  const f = fixture(options); await assert.rejects(initializeRailwayStock(f, true));
  assert.equal(f.queries.at(-1), "ROLLBACK"); assert(!f.queries.some(q => q.startsWith("UPDATE")));
});
test("partial update rolls back rather than leaving partial inventory", async () => {
  const f = fixture({ updateCount: 3 }); await assert.rejects(initializeRailwayStock(f, true)); assert.equal(f.queries.at(-1), "ROLLBACK");
});
