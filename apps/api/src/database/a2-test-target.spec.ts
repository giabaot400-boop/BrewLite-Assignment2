import assert from "node:assert/strict";
import { test } from "node:test";
import { assertA2DemoTarget, assertA2TestTarget } from "./a2-test-target.js";

test("A2 workflow target accepts local test database and explicit opt-in", () => {
  for (const host of ["localhost", "127.0.0.1", "[::1]"]) {
    const target = assertA2TestTarget(`postgresql://tester:secret@${host}:5432/brewlite_a2_test?schema=public`, "1");
    assert.equal(target.pathname, "/brewlite_a2_test");
  }
});

test("A2 workflow target rejects A1, application, remote, and overridden targets before I/O", () => {
  const rejected = [
    "postgresql://localhost/brewlite_s3_demo", "postgresql://localhost/brewlite_s2_test",
    "postgresql://localhost/brewlite_a2", "postgresql://db/brewlite_a2_test",
    "postgresql://production.example/brewlite_a2_test", "https://localhost/brewlite_a2_test",
    "postgresql://localhost/brewlite_a2_test?host=other", "postgresql://localhost/brewlite_a2_test?hostaddr=127.0.0.2",
    "postgresql://localhost/brewlite_a2_test?schema=other", "postgresql://localhost/brewlite_a2_test?schema=public&schema=other",
    "postgresql://localhost/brewlite_a2_test?options=unsafe", undefined,
  ];
  for (const target of rejected) assert.throws(() => assertA2TestTarget(target, "1"));
  for (const flag of [undefined, "0", "true"]) assert.throws(() => assertA2TestTarget("postgresql://localhost/brewlite_a2_test", flag));
});

test("A2 demo target permits only explicitly enabled local/Compose A2 and never A1 or production", () => {
  for (const host of ["localhost", "127.0.0.1", "[::1]", "db"]) {
    assert.equal(assertA2DemoTarget(`postgresql://${host}/brewlite_a2`, "true").pathname, "/brewlite_a2");
  }
  for (const target of ["postgresql://db/brewlite_s3_demo", "postgresql://db/brewlite_a2_test",
    "postgresql://production.example/brewlite_a2", "postgresql://db/brewlite_a2?host=other"]) {
    assert.throws(() => assertA2DemoTarget(target, "true"));
  }
  assert.throws(() => assertA2DemoTarget("postgresql://db/brewlite_a2", undefined));
});
