import test from "node:test";
import assert from "node:assert/strict";
import { deployRelease, releaseConfig, railwayClient, operations } from "../../scripts/railway-deploy.mjs";

const id = n => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const env = { GITHUB_SHA: "a".repeat(40), RAILWAY_PROJECT_ID: id(1), RAILWAY_ENVIRONMENT_ID: id(2), RAILWAY_API_SERVICE_ID: id(3), RAILWAY_WEB_SERVICE_ID: id(4),
  API_IMAGE: `ghcr.io/giabaot400-boop/brewlite-a2-api@sha256:${"a".repeat(64)}`, WEB_IMAGE: `ghcr.io/giabaot400-boop/brewlite-a2-web@sha256:${"b".repeat(64)}`, SMOKE_BASE_URL: "https://brewlite-production.up.railway.app" };
function fixture({ wrongProject = false, failure = false, webFailure = false, wrongService = false, connectedRepo = false, previousFailure = false, legacyFlag = false } = {}) {
  const config = releaseConfig(env), calls = [], saved = new Map();
  const context = { projectToken: { projectId: wrongProject ? id(9) : id(1), environmentId: id(2) }, api: { id: id(3), projectId: id(1) }, web: { id: id(4), projectId: id(1) },
    webVariables: { CHECKOUT_V2_ENABLED: legacyFlag ? "0" : "1", APP_ORIGIN: config.origin, AUTH_COOKIE_NAME: "brewlite_a2_session", BACKEND_INTERNAL_URL: "http://api.railway.internal:3001", PORT: "3000" },
    apiVariables: { DATABASE_URL: "postgresql://fixture:not-logged@db.railway.internal:5432/brewlite_a2", FRONTEND_ORIGIN: config.origin, PORT: "3001" } };
  for (const kind of ["api", "web"]) context[`${kind}Instance`] = { source: { image: config[kind].image, repo: connectedRepo ? "owner/repo" : null }, numReplicas: 1, latestDeployment: { id: `old-${kind}`, status: previousFailure ? "FAILED" : "SUCCESS" } };
  const call = async (query, variables) => {
    calls.push({ query, variables });
    if (query === operations.context) return context;
    if (query === operations.update) { saved.set(variables.serviceId, variables.input); return { serviceInstanceUpdate: true }; }
    if (query === operations.config) return { serviceInstance: saved.get(variables.serviceId) };
    if (query === operations.deploy) return { serviceInstanceDeployV2: `deployment-${variables.serviceId}` };
    if (query === operations.status) return { deployment: { id: variables.id, serviceId: wrongService ? id(99) : variables.id.replace("deployment-", ""), projectId: id(1), environmentId: id(2), status: failure || (webFailure && variables.id === `deployment-${id(4)}`) ? "FAILED" : "SUCCESS" } };
    throw Error("Unexpected operation");
  };
  return { config, call, calls };
}

test("release accepts only pinned A2 digests and distinct service IDs", () => {
  assert.throws(() => releaseConfig({ ...env, API_IMAGE: "ghcr.io/other/api:latest" }));
  assert.throws(() => releaseConfig({ ...env, API_IMAGE: env.API_IMAGE.replace("ghcr.io", "ghcrXio") }));
  assert.throws(() => releaseConfig({ ...env, RAILWAY_WEB_SERVICE_ID: env.RAILWAY_API_SERVICE_ID }));
});
test("project token uses its own header; remote errors cannot echo secrets", async () => {
  const call = railwayClient("fixture-secret", async (url, init) => {
    assert.equal(url, "https://backboard.railway.com/graphql/v2");
    assert.equal(init.headers["Project-Access-Token"], "fixture-secret"); assert.equal(init.headers.Authorization, undefined);
    return Response.json({ errors: [{ message: "fixture-secret" }] });
  });
  await assert.rejects(call("query {}", {}), e => !e.message.includes("fixture-secret"));
});
test("wrong project fails before any mutation", async () => {
  const f = fixture({ wrongProject: true }), r = await deployRelease(f.config, f.call);
  assert.equal(r.passed, false); assert.equal(f.calls.length, 1);
});
test("API migration and health succeed before Web is changed; rollback pins are retained", async () => {
  const f = fixture(), r = await deployRelease(f.config, f.call);
  assert.equal(r.passed, true); assert.deepEqual(r.services.map(x => x.service), ["api", "web"]);
  const updates = f.calls.filter(c => c.query === operations.update);
  assert.equal(updates[0].variables.input.preDeployCommand[0], "npm exec --workspace apps/api -- prisma migrate deploy");
  assert.equal(updates[1].variables.input.healthcheckPath, "/api/health");
  assert.equal(r.services[0].previousDeploymentId, "old-api");
  assert(!JSON.stringify(r).includes("not-logged"));
});
test("API deployment failure prevents Web rollout and returns failure", async () => {
  const f = fixture({ failure: true }), r = await deployRelease(f.config, f.call);
  assert.equal(r.passed, false); assert.equal(r.services.length, 1);
  assert.equal(f.calls.filter(c => c.query === operations.update).length, 1);
});
test("a deployment stuck in progress times out and preserves its ID", async () => {
  const f = fixture(), original = f.call; let clock = 0;
  const call = async (q, v) => { const r = await original(q, v); if (q === operations.status) r.deployment.status = "DEPLOYING"; return r; };
  const r = await deployRelease(f.config, call, { timeoutMs: 1, now: () => clock, wait: async () => { clock = 2; } });
  assert.equal(r.passed, false); assert.equal(r.services[0].deploymentId, `deployment-${id(3)}`);
});

test("Web failure after successful API retains both deployments and never reverses migrations", async () => {
  const f = fixture({ webFailure: true }), r = await deployRelease(f.config, f.call);
  assert.equal(r.passed, false);
  assert.deepEqual(r.services.map(x => x.status), ["SUCCESS", "FAILED"]);
  assert.deepEqual(r.services.map(x => x.deploymentId), [`deployment-${id(3)}`, `deployment-${id(4)}`]);
  assert.equal(r.services[1].previousDeploymentId, "old-web");
  assert.equal(f.calls.filter(c => c.query === operations.update).length, 2);
  const apiSuccess = f.calls.findIndex(c => c.query === operations.status && c.variables.id === `deployment-${id(3)}`);
  const webUpdate = f.calls.findIndex(c => c.query === operations.update && c.variables.serviceId === id(4));
  assert(apiSuccess >= 0 && apiSuccess < webUpdate);
});
for (const option of ["connectedRepo", "previousFailure", "legacyFlag"]) test(`preflight rejects ${option} without mutations`, async () => {
  const f = fixture({ [option]: true }), r = await deployRelease(f.config, f.call);
  assert.equal(r.passed, false); assert.equal(f.calls.length, 1);
});
test("polling rejects a deployment owned by another service and stops before Web", async () => {
  const f = fixture({ wrongService: true }), r = await deployRelease(f.config, f.call);
  assert.equal(r.passed, false);
  assert.match(r.error, /another service/);
  assert.equal(r.services.length, 1);
  assert.equal(f.calls.filter(c => c.query === operations.update).length, 1);
});

for (const replicas of [null, undefined, 1, 3]) test(`release preserves scaling when legacy numReplicas is ${replicas}`, async () => {
  const f = fixture(), call = async (q, v) => {
    const data = await f.call(q, v);
    if (q === operations.context) for (const kind of ["api", "web"]) {
      data[`${kind}Instance`].numReplicas = replicas;
      data[`${kind}Instance`].multiRegionConfig = { region: { numReplicas: 3 } };
    }
    return data;
  };
  const report = await deployRelease(f.config, call);
  assert.equal(report.passed, true);
  const updates = f.calls.filter(c => c.query === operations.update);
  assert.equal(updates.length, 2);
  for (const { variables: { input } } of updates) {
    assert.deepEqual(Object.keys(input).sort(), ["healthcheckPath", "preDeployCommand", "source"]);
    assert.equal(Object.hasOwn(input, "numReplicas"), false);
    assert.equal(Object.hasOwn(input, "multiRegionConfig"), false);
  }
});
