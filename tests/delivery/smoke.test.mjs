import test from "node:test";
import assert from "node:assert/strict";
import { runSmoke, smokeOrigin } from "../smoke.mjs";

test("production target rejects credentials, arbitrary HTTP, paths and query parameters", () => {
  for (const url of ["http://production.test", "https://user:password@production.test", "https://production.test/private", "https://production.test/?token=secret", "file:///etc/passwd"]) assert.throws(() => smokeOrigin(url, true));
  assert.equal(smokeOrigin("http://127.0.0.1:3300", true), "http://127.0.0.1:3300");
});

const sourceSha = "a".repeat(40);
function fixture({ buildSha = sourceSha, health = 200, v2 = true, catalog = [{ id: "coffee", name: "Coffee", price: 35000 }], badIcon = false } = {}) {
  const calls = [];
  const fetcher = async (url, init) => {
    calls.push({ url, method: init.method });
    const pathname = new URL(url).pathname;
    if (pathname === "/api/health") return Response.json({ status: "ok", api: "ok", checkoutV2Enabled: v2, buildSha }, { status: health, headers: { "Cache-Control": "no-store" } });
    if (pathname === "/api/products") return Response.json(catalog, { headers: { "Cache-Control": "no-store" } });
    if (pathname === "/manifest.webmanifest") return Response.json({ name: "BrewLite", display: "standalone", icons: [{ src: "/icons/icon-192.png" }, { src: "/icons/icon-512.png" }] });
    if (pathname === "/sw.js") return new Response("self.addEventListener('fetch', handler)");
    if (pathname.startsWith("/icons/")) return new Response(badIcon ? "invalid" : Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    return new Response("<title>BrewLite</title>", { headers: { "Content-Type": "text/html" } });
  };
  return { fetcher, calls };
}

test("smoke covers health/catalog/product/PWA using GET only", async () => {
  const f = fixture(), r = await runSmoke({ origin: "https://fixture.test", fetcher: f.fetcher, expectedSha: sourceSha });
  assert.equal(r.passed, true); assert.equal(r.checks.length, 8); assert(f.calls.every(c => c.method === "GET"));
});
for (const [name, options] of [["health HTTP error", { health: 503 }], ["legacy checkout flag", { v2: false }], ["empty catalog", { catalog: [] }], ["invalid icon", { badIcon: true }]]) {
  test(`smoke fails on ${name} and stops at the first failing check`, async () => {
    const f = fixture(options), r = await runSmoke({ origin: "https://fixture.test", fetcher: f.fetcher, expectedSha: sourceSha });
    assert.equal(r.passed, false); assert.equal(r.checks.at(-1).passed, false); assert(f.calls.every(c => c.method === "GET"));
  });
}

for (const buildSha of ["b".repeat(40), null]) test(`smoke rejects stale or unidentified server build: ${buildSha}`, async () => {
  const f = fixture({ buildSha });
  const r = await runSmoke({ origin: "https://fixture.test", fetcher: f.fetcher, expectedSha: sourceSha });
  assert.equal(r.passed, false);
  assert.equal(r.expectedSourceSha, sourceSha);
  assert.equal(r.observedSourceSha, buildSha);
  assert.equal(r.checks.at(-1).name, "Web and private API process health");
});
