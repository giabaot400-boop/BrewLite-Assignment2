import { AssertionError } from "node:assert";

/** Only local, handwritten assertion messages are eligible for diagnostic output. */
export function safeAssertionMessage(error, fallback) {
  return error instanceof AssertionError && error.generatedMessage === false
    ? error.message.split(/[\r\n]/, 1)[0].slice(0, 300)
    : fallback;
}
