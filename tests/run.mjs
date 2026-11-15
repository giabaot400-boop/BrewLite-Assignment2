import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const commands = {
  workflow: ["--import", "tsx", "--test", "src/orders/workflow-postgres.integration.ts"],
  legacy: ["prisma/check-legacy-preservation.mjs"],
  http: ["--import", "tsx", "prisma/check-workflow-http.ts"],
  e2e: ["--import", "tsx", "prisma/check-workflow-http.ts"],
};
const [name, ...extra] = process.argv.slice(2);
if (name === "--help" || name === undefined) {
  console.log("Usage: node tests/run.mjs workflow|legacy|http|e2e");
  console.log("Prepare local brewlite_a2_test, migration/build and A2_INTEGRATION_TEST=1 first. See tests/README.md.");
} else if (!Object.hasOwn(commands, name) || extra.length) {
  console.error("Unknown test suite or extra arguments; see --help.");
  process.exitCode = 1;
} else {
  const child = spawn(process.execPath, commands[name], {
    cwd: fileURLToPath(new URL("../apps/api/", import.meta.url)),
    env: { ...process.env, A2_BROWSER_TEST: name === "e2e" ? "1" : "0" },
    stdio: "inherit",
  });
  for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => child.kill(signal));
  child.once("error", () => { console.error("Could not start the test runner."); process.exitCode = 1; });
  child.once("exit", (code) => { process.exitCode = code ?? 1; });
}
