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
  const f = fixture(), r = await runSmoke({ origin: "https://fixture.test", fetcher: f.fetcher, expectedSha: sourceSha, wait: async () => {} });
  assert.equal(r.passed, true); assert.equal(r.checks.length, 8); assert(f.calls.every(c => c.method === "GET"));
});
for (const [name, options] of [["health HTTP error", { health: 503 }], ["legacy checkout flag", { v2: false }], ["empty catalog", { catalog: [] }], ["invalid icon", { badIcon: true }]]) {
  test(`smoke fails on ${name} and stops at the first failing check`, async () => {
    const f = fixture(options), r = await runSmoke({ origin: "https://fixture.test", fetcher: f.fetcher, expectedSha: sourceSha, wait: async () => {} });
    assert.equal(r.passed, false); assert.equal(r.checks.at(-1).passed, false); assert(f.calls.every(c => c.method === "GET"));
  });
}

for (const buildSha of ["b".repeat(40), null]) test(`smoke rejects stale or unidentified server build: ${buildSha}`, async () => {
  const f = fixture({ buildSha });
  const r = await runSmoke({ origin: "https://fixture.test", fetcher: f.fetcher, expectedSha: sourceSha, wait: async () => {} });
  assert.equal(r.passed, false);
  assert.equal(r.expectedSourceSha, sourceSha);
  assert.equal(r.observedSourceSha, buildSha);
  assert.equal(r.checks.at(-1).name, "Web and private API process health");
});

test("health retries old replica and temporary outage until the requested build is ready", async () => {
  const f = fixture(), sleeps = []; let attempts = 0;
  const fetcher = async (url, init) => {
    if (new URL(url).pathname === "/api/health") {
      attempts++;
      if (attempts === 1) return Response.json({ status: "ok", api: "ok", buildSha: "b".repeat(40), checkoutV2Enabled: true }, { headers: { "Cache-Control": "no-store" } });
      if (attempts === 2) return Response.json({}, { status: 503 });
    }
    return f.fetcher(url, init);
  };
  const r = await runSmoke({ origin: "https://fixture.test", fetcher, expectedSha: sourceSha, wait: async ms => sleeps.push(ms) });
  assert.equal(r.passed, true); assert.equal(r.healthAttempts, 3);
  assert.equal(r.observedSourceSha, sourceSha); assert.deepEqual(sleeps, [10000, 10000]);
  assert.equal(f.calls.filter(c => c.url.endsWith("/api/products")).length, 1);
  assert.equal(r.checks.length, 8);
});
test("persistent stale build stops at the attempt limit before catalog", async () => {
  const f = fixture({ buildSha: "b".repeat(40) }); let sleeps = 0;
  const r = await runSmoke({ origin: "https://fixture.test", fetcher: f.fetcher, expectedSha: sourceSha, healthAttempts: 3, wait: async () => { sleeps++; } });
  assert.equal(r.passed, false); assert.equal(r.healthAttempts, 3); assert.equal(sleeps, 2);
  assert.equal(f.calls.length, 4); assert.equal(r.checks.length, 2);
});
test("health retry respects the deadline and bounds individual requests", async () => {
  const f = fixture(); let clock = 0, sleeps = 0;
  const fetcher = async (url, init) => {
    if (new URL(url).pathname === "/api/health") {
      assert(init.signal instanceof AbortSignal);
      clock = 120001; return Response.json({}, { status: 503 });
    }
    return f.fetcher(url, init);
  };
  const r = await runSmoke({ origin: "https://fixture.test", fetcher, expectedSha: sourceSha, now: () => clock, wait: async () => { sleeps++; } });
  assert.equal(r.passed, false); assert.equal(r.healthAttempts, 1); assert.equal(sleeps, 0);
});
test("non-health checks still fail immediately without retry", async () => {
  const f = fixture({ catalog: [] }); let sleeps = 0;
  const r = await runSmoke({ origin: "https://fixture.test", fetcher: f.fetcher, expectedSha: sourceSha, wait: async () => { sleeps++; } });
  assert.equal(r.passed, false); assert.equal(r.healthAttempts, 1); assert.equal(sleeps, 0);
  assert.equal(f.calls.filter(c => c.url.endsWith("/api/products")).length, 1);
});
