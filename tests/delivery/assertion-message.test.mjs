import test from "node:test";
import assert from "node:assert/strict";
import { safeAssertionMessage } from "../../apps/api/prisma/assertion-message.mjs";

test("handwritten assertions retain an actionable bounded single-line message", () => {
  try { assert.equal("private-actual", "expected", "Set the Web runtime checkout flag first."); }
  catch (error) { assert.equal(safeAssertionMessage(error, "failed"), "Set the Web runtime checkout flag first."); }
});
test("generated assertions and external errors cannot reflect credentials", () => {
  try { assert.equal("private-secret", "expected"); }
  catch (error) { assert.equal(safeAssertionMessage(error, "failed"), "failed"); }
  assert.equal(safeAssertionMessage(Error("postgresql://private-secret@internal"), "failed"), "failed");
  assert.equal(safeAssertionMessage({ generatedMessage: false, message: "private-secret" }, "failed"), "failed");
});
