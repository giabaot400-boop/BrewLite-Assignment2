import assert from "node:assert/strict";
import { test } from "node:test";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const project = fileURLToPath(new URL("../", import.meta.url));
const backend = "apps/api/.env";
const frontend = "apps/web/.env.local";

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), "brewlite-a2-setup-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  for (const path of ["scripts", "apps/api", "apps/web"]) mkdirSync(join(root, path), { recursive: true });
  for (const path of ["scripts/setup-env.mjs", "apps/api/.env.example", "apps/web/.env.local.example"]) {
    copyFileSync(join(project, path), join(root, path));
  }
  return root;
}

const read = (root, path) => readFileSync(join(root, path), "utf8");
const secret = (value) => value.match(/^AUTH_JWT_SECRET=([a-f0-9]{64})$/m)?.[1];
function run(root) {
  return spawnSync(process.execPath, ["scripts/setup-env.mjs"], { cwd: root, encoding: "utf8" });
}
function succeeds(root) {
  const result = run(root);
  assert.equal(result.status, 0, result.stderr);
  return result;
}

test("fresh setup creates A2 config and a 32-byte random secret encoded as hex", (t) => {
  const root = fixture(t);
  succeeds(root);
  const config = read(root, backend);
  assert.match(config, /\/brewlite_a2\?schema=public/);
  assert.ok(secret(config));
  assert.equal(Buffer.from(secret(config), "hex").length, 32);
});

test("frontend defaults use API, explicit BFF origin and an A2 cookie name", (t) => {
  const root = fixture(t);
  succeeds(root);
  const config = read(root, frontend);
  assert.match(config, /^NEXT_PUBLIC_PRODUCTS_SOURCE=api$/m);
  assert.match(config, /^BACKEND_INTERNAL_URL=http:\/\/localhost:3001$/m);
  assert.match(config, /^APP_ORIGIN=http:\/\/localhost:3000$/m);
  assert.match(config, /^AUTH_COOKIE_NAME=brewlite_a2_session$/m);
});

test("generated secret is not printed in setup output", (t) => {
  const root = fixture(t);
  const result = succeeds(root);
  const value = secret(read(root, backend));
  assert.ok(value);
  assert.ok(!result.stdout.includes(value) && !result.stderr.includes(value));
});

test("second setup run preserves both config files byte for byte", (t) => {
  const root = fixture(t);
  succeeds(root);
  const oldBackend = read(root, backend);
  const oldFrontend = read(root, frontend);
  succeeds(root);
  assert.equal(read(root, backend), oldBackend);
  assert.equal(read(root, frontend), oldFrontend);
});

test("separate fresh setups generate different secrets", (t) => {
  const first = fixture(t);
  const second = fixture(t);
  succeeds(first);
  succeeds(second);
  assert.notEqual(secret(read(first, backend)), secret(read(second, backend)));
});

test("existing backend config is preserved and is not logged", (t) => {
  const root = fixture(t);
  const value = "DATABASE_URL=postgresql://fixture:private_value@localhost:5432/existing\r\nAUTH_JWT_SECRET=existing_fixture_secret\r\n";
  writeFileSync(join(root, backend), value);
  const result = succeeds(root);
  assert.equal(read(root, backend), value);
  assert.ok(!result.stdout.includes("private_value") && !result.stdout.includes("existing_fixture_secret"));
});

test("inherited path migration preserves local config content", (t) => {
  const root = fixture(t);
  for (const path of ["frontend", "backend"]) mkdirSync(join(root, path));
  writeFileSync(join(root, "frontend/.env.local"), "APP_ORIGIN=http://fixture.test\n");
  writeFileSync(join(root, "backend/.env"), "AUTH_JWT_SECRET=legacy_fixture_value\r\n");
  succeeds(root);
  assert.equal(read(root, frontend), "APP_ORIGIN=http://fixture.test\n");
  assert.equal(read(root, backend), "AUTH_JWT_SECRET=legacy_fixture_value\r\n");
});

test("a destination conflict stops migration before any config is moved", (t) => {
  const root = fixture(t);
  for (const path of ["frontend", "backend"]) mkdirSync(join(root, path));
  writeFileSync(join(root, "frontend/.env.local"), "old frontend");
  writeFileSync(join(root, "backend/.env"), "old backend");
  writeFileSync(join(root, backend), "existing target");
  assert.notEqual(run(root).status, 0);
  assert.equal(read(root, "frontend/.env.local"), "old frontend");
  assert.equal(read(root, "backend/.env"), "old backend");
  assert.equal(read(root, backend), "existing target");
  assert.ok(!existsSync(join(root, frontend)));
});
