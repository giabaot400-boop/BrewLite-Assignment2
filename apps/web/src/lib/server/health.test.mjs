import test from "node:test";
import assert from "node:assert/strict";
import { processHealth } from "./health.ts";

test("health uses a credential-free bounded no-store request and reports the active checkout flag", async () => {
  const response = await processHealth("http://private:3001/", true, async (url, init) => {
    assert.equal(url, "http://private:3001/health");
    assert.equal(init.cache, "no-store"); assert.equal(init.redirect, "error");
    assert(init.signal instanceof AbortSignal); assert.equal(init.headers, undefined);
    return Response.json({ status: "ok", service: "brewlite-api", ignored: "private-data" });
  });
  assert.equal(response.status, 200); assert.equal(response.headers.get("cache-control"), "no-store");
  assert.deepEqual(await response.json(), { status: "ok", service: "brewlite-web", api: "ok", checkoutV2Enabled: true });
});

for (const [name, fetcher] of [
  ["connection failure", async () => { throw Error("postgresql://private-secret@internal"); }],
  ["upstream HTTP failure", async () => Response.json({ status: "ok", service: "brewlite-api" }, { status: 500 })],
  ["malformed JSON", async () => new Response("private-error")],
  ["wrong service", async () => Response.json({ status: "ok", service: "another-app" })],
]) test(`health fails closed without reflecting internals on ${name}`, async () => {
  const response = await processHealth("http://internal", false, fetcher);
  assert.equal(response.status, 503); assert.equal(response.headers.get("cache-control"), "no-store");
  assert.deepEqual(await response.json(), { status: "unavailable", service: "brewlite-web" });
});
