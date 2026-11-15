import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { setTimeout as delay } from "node:timers/promises";

const endpoint = "https://backboard.railway.com/graphql/v2";
const migration = "npm exec --workspace apps/api -- prisma migrate deploy";
const namespace = "ghcr.io/giabaot400-boop/brewlite-a2-";
export const operations = {
  context: `query Context($environmentId: String!, $api: String!, $web: String!, $projectId: String!) {
    projectToken { projectId environmentId }
    api: service(id: $api) { id projectId }
    web: service(id: $web) { id projectId }
    apiInstance: serviceInstance(serviceId: $api, environmentId: $environmentId) { source { image repo } numReplicas latestDeployment { id status } }
    webInstance: serviceInstance(serviceId: $web, environmentId: $environmentId) { source { image repo } numReplicas latestDeployment { id status } }
    webVariables: variablesForServiceDeployment(projectId: $projectId, environmentId: $environmentId, serviceId: $web)
    apiVariables: variablesForServiceDeployment(projectId: $projectId, environmentId: $environmentId, serviceId: $api)
  }`,
  update: `mutation Update($serviceId: String!, $environmentId: String!, $input: ServiceInstanceUpdateInput!) {
    serviceInstanceUpdate(serviceId: $serviceId, environmentId: $environmentId, input: $input)
  }`,
  config: `query Config($serviceId: String!, $environmentId: String!) {
    serviceInstance(serviceId: $serviceId, environmentId: $environmentId) { source { image repo } preDeployCommand healthcheckPath }
  }`,
  deploy: `mutation Deploy($serviceId: String!, $environmentId: String!) {
    serviceInstanceDeployV2(serviceId: $serviceId, environmentId: $environmentId)
  }`,
  status: `query Status($id: String!) { deployment(id: $id) { id status serviceId environmentId projectId } }`,
};

function pinnedImage(image, service) {
  const prefix = `${namespace}${service}@sha256:`;
  assert(typeof image === "string" && image.startsWith(prefix) && /^[a-f0-9]{64}$/.test(image.slice(prefix.length)), "Expected a pinned BrewLite A2 image digest.");
  return image;
}
export function releaseConfig(env) {
  assert(/^[a-f0-9]{40}$/.test(env.GITHUB_SHA ?? ""), "A full source SHA is required.");
  const keys = ["RAILWAY_PROJECT_ID", "RAILWAY_ENVIRONMENT_ID", "RAILWAY_API_SERVICE_ID", "RAILWAY_WEB_SERVICE_ID"];
  for (const key of keys) assert(/^[a-f0-9-]{36}$/i.test(env[key] ?? ""), `Missing/invalid ${key}.`);
  assert.notEqual(env.RAILWAY_API_SERVICE_ID, env.RAILWAY_WEB_SERVICE_ID, "Web/API must be distinct services.");
  const url = new URL(env.SMOKE_BASE_URL);
  assert(url.protocol === "https:" && !url.username && !url.password && url.pathname === "/" && !url.search && !url.hash, "Use the public HTTPS origin.");
  return {
    sourceSha: env.GITHUB_SHA, projectId: env.RAILWAY_PROJECT_ID, environmentId: env.RAILWAY_ENVIRONMENT_ID,
    origin: url.origin, api: { id: env.RAILWAY_API_SERVICE_ID, image: pinnedImage(env.API_IMAGE, "api") },
    web: { id: env.RAILWAY_WEB_SERVICE_ID, image: pinnedImage(env.WEB_IMAGE, "web") },
  };
}

export function railwayClient(token, fetcher = fetch) {
  assert(token && !/[\r\n]/.test(token), "Project token is required.");
  return async (query, variables) => {
    let response, body;
    try {
      response = await fetcher(endpoint, { method: "POST", headers: { "Content-Type": "application/json", "Project-Access-Token": token },
        body: JSON.stringify({ query, variables }), signal: AbortSignal.timeout(30000), redirect: "error" });
      body = await response.json();
    } catch { throw Error("Railway API request failed; inspect the dashboard without printing credentials."); }
    assert(response.ok && !body.errors?.length && body.data, "Railway rejected the request; no API payload is printed.");
    return body.data;
  };
}

export function validateContext(context, config) {
  assert.equal(context.projectToken.projectId, config.projectId, "Wrong Railway project token.");
  assert.equal(context.projectToken.environmentId, config.environmentId, "Wrong Railway environment token.");
  for (const kind of ["api", "web"]) {
    assert.equal(context[kind].id, config[kind].id); assert.equal(context[kind].projectId, config.projectId);
    assert(!context[`${kind}Instance`].source?.repo, "Disconnect GitHub source before image-based delivery.");
    pinnedImage(context[`${kind}Instance`].source?.image, kind);
    assert(Number.isInteger(context[`${kind}Instance`].numReplicas) && context[`${kind}Instance`].numReplicas > 0, "Record the active replica count before releasing.");
    assert.equal(context[`${kind}Instance`].latestDeployment?.status, "SUCCESS", "Record/recover the previous active deployment before releasing.");
  }
  const web = context.webVariables, api = context.apiVariables;
  assert.equal(web.CHECKOUT_V2_ENABLED, "1", "Set the Web runtime checkout flag first.");
  assert.equal(web.APP_ORIGIN, config.origin, "Web origin mismatch.");
  assert.equal(web.AUTH_COOKIE_NAME, "brewlite_a2_session", "Use the A2 cookie namespace.");
  const upstream = new URL(web.BACKEND_INTERNAL_URL), database = new URL(api.DATABASE_URL);
  assert(upstream.protocol === "http:" && upstream.hostname.endsWith(".railway.internal") && upstream.port === "3001", "Use private API port 3001.");
  assert(["postgres:", "postgresql:"].includes(database.protocol) && database.hostname.endsWith(".railway.internal") && database.pathname === "/brewlite_a2", "Use the private A2 database.");
  assert.equal(api.FRONTEND_ORIGIN, config.origin, "API origin mismatch.");
  assert.equal(web.PORT, "3000"); assert.equal(api.PORT, "3001");
}

export async function deployRelease(config, call, { wait = delay, timeoutMs = 900000, now = Date.now, checkpoint = async () => {} } = {}) {
  const report = { sourceSha: config.sourceSha, startedAt: new Date().toISOString(), projectId: config.projectId,
    environmentId: config.environmentId, passed: false, services: [] };
  try {
    const context = await call(operations.context, { projectId: config.projectId, environmentId: config.environmentId, api: config.api.id, web: config.web.id });
    validateContext(context, config);
    // API first: a failed pre-deploy migration prevents the new API from starting.
    for (const kind of ["api", "web"]) {
      const target = config[kind], previous = context[`${kind}Instance`];
      const entry = { service: kind, serviceId: target.id, previousImage: previous.source.image,
        previousDeploymentId: previous.latestDeployment.id, image: target.image, deploymentId: null, status: "UPDATING" };
      report.services.push(entry); await checkpoint(report);
      const preDeployCommand = kind === "api" ? [migration] : [];
      const healthcheckPath = kind === "api" ? "/health" : "/api/health";
      const variables = { serviceId: target.id, environmentId: config.environmentId };
      assert.equal((await call(operations.update, { ...variables, input: { source: { image: target.image },
        preDeployCommand, healthcheckPath, numReplicas: previous.numReplicas } })).serviceInstanceUpdate, true);
      const saved = (await call(operations.config, variables)).serviceInstance;
      assert.equal(saved.source?.image, target.image); assert(!saved.source?.repo);
      assert.deepEqual(saved.preDeployCommand ?? [], preDeployCommand); assert.equal(saved.healthcheckPath, healthcheckPath);
      entry.deploymentId = (await call(operations.deploy, variables)).serviceInstanceDeployV2;
      assert.equal(typeof entry.deploymentId, "string"); await checkpoint(report);
      const until = now() + timeoutMs;
      while (true) {
        const status = (await call(operations.status, { id: entry.deploymentId })).deployment;
        assert.equal(status.id, entry.deploymentId); assert.equal(status.serviceId, target.id);
        assert.equal(status.environmentId, config.environmentId); assert.equal(status.projectId, config.projectId);
        entry.status = status.status; await checkpoint(report);
        if (status.status === "SUCCESS") break;
        if (["FAILED", "CRASHED", "REMOVED", "SKIPPED"].includes(status.status)) throw Error("Deployment failed.");
        assert(now() < until, "Deployment wait timed out; inspect/cancel the recorded deployment before retry.");
        await wait(5000);
      }
    }
    report.passed = true;
  } catch {
    report.error = "Release stopped. Inspect recorded deployment IDs. Follow docs/deployment.md before any rollback; database changes are not reversed automatically.";
  }
  report.finishedAt = new Date().toISOString(); await checkpoint(report);
  return report;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2); assert(args.length <= 1 && [undefined, "--plan", "--deploy"].includes(args[0]), "Use --plan or --deploy.");
    const config = releaseConfig(process.env);
    if (args[0] !== "--deploy") {
      console.log(JSON.stringify({ mode: "plan-only", ...config }, null, 2));
    } else {
      assert.equal(process.env.RAILWAY_DEPLOY_READY, "true", "Complete backup/migration/stock preparation and set RAILWAY_DEPLOY_READY=true first.");
      const path = "delivery-artifacts/railway-deploy.json";
      const checkpoint = async r => { await mkdir(dirname(path), { recursive: true }); await writeFile(path, JSON.stringify(r, null, 2) + "\n"); };
      const result = await deployRelease(config, railwayClient(process.env.RAILWAY_PROJECT_TOKEN), { checkpoint });
      console.log(result.passed ? "RAILWAY_DEPLOY_PASSED; run smoke next." : "RAILWAY_DEPLOY_FAILED; inspect the sanitized artifact and dashboard.");
      if (!result.passed) process.exitCode = 1;
    }
  } catch { console.error("RAILWAY_RELEASE_FAILED: check required configuration/secret and docs/deployment.md. No credentials are logged."); process.exitCode = 1; }
}
