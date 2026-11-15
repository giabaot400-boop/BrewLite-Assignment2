import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { setTimeout as delay } from "node:timers/promises";
import { performance } from "node:perf_hooks";

export function smokeOrigin(value, allowLocal = false) {
  const url = new URL(value);
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  assert(!url.username && !url.password && !url.search && !url.hash && url.pathname === "/", "Use a plain origin without credentials/path/query.");
  assert(url.protocol === "https:" || (allowLocal && local && url.protocol === "http:"), "HTTPS is required; --allow-local only permits loopback HTTP.");
  return url.origin;
}

async function readLimited(response, limit = 2_000_000) {
  assert(response.body, "Missing response body.");
  const reader = response.body.getReader(), chunks = [];
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read(); if (done) break;
      length += value.length; assert(length <= limit, "Response exceeds smoke limit."); chunks.push(value);
    }
  } finally { await reader.cancel().catch(() => {}); }
  return Buffer.concat(chunks);
}

export async function runSmoke({ origin, fetcher = fetch, requireV2 = true, expectedSha = process.env.GITHUB_SHA,
  healthAttempts = 13, healthRetryMs = 10000, healthTimeoutMs = 120000, wait = delay, now = () => performance.now() }) {
  const report = { startedAt: new Date().toISOString(), origin, expectedSourceSha: expectedSha ?? null, observedSourceSha: null, checks: [], passed: false };
  const request = async (path, timeoutMs = 15000) => {
    const start = performance.now();
    const r = await fetcher(origin + path, { method: "GET", redirect: "error", cache: "no-store", signal: AbortSignal.timeout(timeoutMs) });
    assert.equal(r.status, 200, `${path}: expected HTTP 200, got ${r.status}`);
    return { response: r, bytes: await readLimited(r), elapsedMs: Math.round(performance.now() - start) };
  };
  const check = async (name, action) => {
    try { const result = await action(); report.checks.push({ name, passed: true, elapsedMs: result?.elapsedMs }); }
    catch { report.checks.push({ name, passed: false }); throw Error(name); }
  };
  try {
    await check("Web home", async () => {
      const r = await request("/"); assert.match(r.response.headers.get("content-type") ?? "", /text\/html/);
      assert.match(r.bytes.toString(), /BrewLite/i); return r;
    });
    await check("Web and private API process health", async () => {
      assert(Number.isInteger(healthAttempts) && healthAttempts >= 1 && healthAttempts <= 13);
      assert(Number.isInteger(healthRetryMs) && healthRetryMs >= 0 && healthRetryMs <= 10000);
      assert(Number.isInteger(healthTimeoutMs) && healthTimeoutMs > 0 && healthTimeoutMs <= 120000);
      if (expectedSha) assert.match(expectedSha, /^[a-f0-9]{40}$/);
      const deadline = now() + healthTimeoutMs;
      for (let attempt = 1; attempt <= healthAttempts; attempt++) {
        report.healthAttempts = attempt;
        report.observedSourceSha = null;
        try {
          const remaining = Math.floor(deadline - now());
          assert(remaining > 0, "Health rollout wait timed out.");
          const r = await request("/api/health", Math.min(15000, remaining)), body = JSON.parse(r.bytes.toString());
          report.observedSourceSha = body.buildSha ?? null;
          assert.equal(body.status, "ok"); assert.equal(body.api, "ok");
          if (expectedSha) assert.equal(body.buildSha, expectedSha, "Server build differs from the requested release.");
          assert.equal(r.response.headers.get("cache-control"), "no-store");
          if (requireV2) assert.equal(body.checkoutV2Enabled, true);
          return r;
        } catch (error) {
          if (attempt === healthAttempts || now() >= deadline) throw error;
          await wait(Math.min(healthRetryMs, Math.max(0, deadline - now())));
        }
      }
    });
    let product;
    await check("Catalog BFF and database read", async () => {
      const r = await request("/api/products"), body = JSON.parse(r.bytes.toString());
      assert(Array.isArray(body) && body.length > 0); assert.equal(r.response.headers.get("cache-control"), "no-store");
      for (const item of body) { assert.equal(typeof item.id, "string"); assert.equal(typeof item.name, "string"); assert(Number.isSafeInteger(item.price) && item.price >= 0); }
      product = body[0].id; return r;
    });
    await check("Product page", async () => { const r = await request(`/products/${encodeURIComponent(product)}`); assert.match(r.response.headers.get("content-type") ?? "", /text\/html/); return r; });
    await check("PWA manifest", async () => {
      const r = await request("/manifest.webmanifest"), body = JSON.parse(r.bytes.toString());
      assert.match(body.name, /BrewLite/i); assert.equal(body.display, "standalone");
      assert(body.icons.some(x => x.src === "/icons/icon-192.png")); assert(body.icons.some(x => x.src === "/icons/icon-512.png")); return r;
    });
    await check("Service worker", async () => { const r = await request("/sw.js"); assert.match(r.bytes.toString(), /addEventListener/); return r; });
    for (const size of [192, 512]) await check(`PWA icon ${size}`, async () => {
      const r = await request(`/icons/icon-${size}.png`); assert(r.bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))); return r;
    });
    report.passed = true;
  } catch { /* Failed checks remain in the report; the CLI exits nonzero. */ }
  report.finishedAt = new Date().toISOString();
  return report;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2);
    if (args.includes("--help")) {
      console.log("SMOKE_BASE_URL=https://your-web-origin npm run smoke\nOptions: --url ORIGIN --report FILE --allow-local --allow-legacy\nRead-only GET checks; no auth, order, payment, seed or cleanup mutations.");
    } else {
      const options = { allowLocal: false, requireV2: true, url: process.env.SMOKE_BASE_URL, report: undefined };
      for (let i = 0; i < args.length; i++) {
        if (args[i] === "--allow-local") options.allowLocal = true;
        else if (args[i] === "--allow-legacy") options.requireV2 = false;
        else if (["--url", "--report"].includes(args[i])) { const key = args[i].slice(2); options[key] = args[++i]; assert(options[key], "Missing option value."); }
        else throw Error("Unknown option.");
      }
      const origin = smokeOrigin(options.url, options.allowLocal);
      const result = await runSmoke({ origin, requireV2: options.requireV2 });
      if (options.report) { await mkdir(dirname(options.report), { recursive: true }); await writeFile(options.report, JSON.stringify(result, null, 2) + "\n"); }
      for (const c of result.checks) console.log(`${c.passed ? "PASS" : "FAIL"} SMOKE: ${c.name}`);
      if (!result.passed) process.exitCode = 1;
    }
  } catch { console.error("SMOKE_FAILED: check origin/options and target readiness; no response bodies or credentials are logged."); process.exitCode = 1; }
}
