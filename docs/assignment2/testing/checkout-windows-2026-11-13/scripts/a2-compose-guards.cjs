'use strict';
const assert = require('node:assert/strict');
const PROJECT = 'brewlite-a2-checkout';
const BASE = 'http://localhost:3100';
const COOKIE = 'brewlite_a2_session';

function assertDatabaseTarget(value) {
  let u;
  try { u = new URL(value); } catch { throw Error('Invalid A2 Compose database target.'); }
  assert(['postgres:', 'postgresql:'].includes(u.protocol), 'Expected PostgreSQL.');
  assert.equal(u.hostname, 'db', 'Expected the Compose db service.');
  assert.equal(u.port, '5432');
  assert.equal(u.pathname, '/brewlite_a2', 'This helper only permits the A2 Compose database.');
  assert.equal(u.username, 'brewlite');
  assert.equal(u.hash, '');
  for (const [k, v] of u.searchParams) {
    assert(k === 'schema' && v === 'public' && u.searchParams.getAll(k).length === 1,
      'Connection overrides and other schemas are blocked.');
  }
}

function assertComposeConfig(c) {
  assert.equal(c.name, PROJECT, 'Unexpected Compose project.');
  assert.deepEqual(Object.keys(c.services).sort(), ['backend', 'db', 'frontend']);
  const { db, backend, frontend } = c.services;
  assert.equal(db.environment.POSTGRES_DB, 'brewlite_a2');
  assert.equal(db.environment.POSTGRES_USER, 'brewlite');
  assertDatabaseTarget(backend.environment.DATABASE_URL);
  assert.equal(backend.environment.MOCK_PAYMENT_OUTCOME, 'SUCCEEDED', 'Start with SUCCEEDED outcome.');
  assert.equal(String(backend.environment.DEMO_WORKFLOW_ENABLED), 'false', 'Global demo CLI must stay disabled.');
  assert.equal(backend.environment.FRONTEND_ORIGIN, BASE);
  assert.equal(String(frontend.environment.CHECKOUT_V2_ENABLED), '1');
  assert.equal(frontend.environment.APP_ORIGIN, BASE);
  assert.equal(frontend.environment.BACKEND_INTERNAL_URL, 'http://backend:3001');
  assert.equal(frontend.environment.AUTH_COOKIE_NAME, COOKIE);
  assert(!db.ports?.length && !backend.ports?.length, 'DB/backend host ports must stay private.');
  assert.equal(frontend.ports?.length, 1, 'Expected exactly one frontend port.');
  const p = frontend.ports[0];
  assert(p.host_ip === '127.0.0.1' && String(p.published) === '3100' && String(p.target) === '3000',
    'Only 127.0.0.1:3100 -> 3000 is permitted.');
  assert.equal(backend.image, 'brewlite-a2-api:local');
  assert.equal(frontend.image, 'brewlite-a2-web:local');
  assert.equal(db.image, 'postgres:17-bookworm');
  const volumes = db.volumes || [];
  assert.equal(volumes.length, 1);
  assert(volumes[0].type === 'volume' && volumes[0].source === 'postgres_data'
    && volumes[0].target === '/var/lib/postgresql/data', 'Unexpected database mount.');
  assert.equal(c.volumes.postgres_data.name, PROJECT + '_postgres_data');
  for (const s of Object.values(c.services)) {
    assert(!s.container_name, 'Custom container names are blocked.');
    assert(s.network_mode === undefined, 'Custom network mode is blocked.');
    assert(!s.volumes_from?.length, 'Inherited mounts are blocked.');
  }
  assert(!backend.volumes?.length && !frontend.volumes?.length, 'Runtime source bind mounts are blocked.');
}

function assertRuntime(rows, root) {
  const path = require('node:path');
  const fold = p => process.platform === 'win32' ? path.resolve(p).toLowerCase() : path.resolve(p);
  assert.equal(rows.length, 3);
  const services = [];
  for (const r of rows) {
    const labels = r.Config.Labels || {};
    assert.equal(labels['com.docker.compose.project'], PROJECT);
    const service = labels['com.docker.compose.service'];
    assert(['db', 'backend', 'frontend'].includes(service));
    services.push(service);
    assert.equal(fold(labels['com.docker.compose.project.working_dir'] || ''), fold(root),
      'Running containers belong to a different source directory.');
    const networks = Object.keys(r.NetworkSettings.Networks || {});
    assert.deepEqual(networks, [PROJECT + '_default'], 'Unexpected runtime network.');
    const ports = Object.values(r.NetworkSettings.Ports || {}).flatMap(v => v || []);
    if (service === 'frontend') {
      assert.deepEqual(ports.map(p => [p.HostIp, p.HostPort]), [['127.0.0.1', '3100']]);
      assert.equal(r.Mounts.length, 0);
    } else if (service === 'backend') {
      assert.equal(ports.length, 0); assert.equal(r.Mounts.length, 0);
      const env = Object.fromEntries(r.Config.Env.map(x => { const i = x.indexOf('='); return [x.slice(0, i), x.slice(i + 1)]; }));
      assertDatabaseTarget(env.DATABASE_URL);
      assert.equal(env.MOCK_PAYMENT_OUTCOME, 'SUCCEEDED');
      assert.equal(env.DEMO_WORKFLOW_ENABLED, 'false');
    } else {
      assert.equal(ports.length, 0); assert.equal(r.Mounts.length, 1);
      assert.equal(r.Mounts[0].Type, 'volume');
      assert.equal(r.Mounts[0].Name, PROJECT + '_postgres_data');
      assert.equal(r.Mounts[0].Destination, '/var/lib/postgresql/data');
    }
  }
  assert.deepEqual(services.sort(), ['backend', 'db', 'frontend']);
}
module.exports = { PROJECT, BASE, COOKIE, assertDatabaseTarget, assertComposeConfig, assertRuntime };
