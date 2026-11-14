/** Keep fixture runners on a separate local A2 database before opening a connection. */
function parseTarget(value: string | undefined): URL {
  let url: URL;
  try { url = new URL(value ?? ""); }
  catch { throw new Error("A valid PostgreSQL target is required."); }
  if (!["postgres:", "postgresql:"].includes(url.protocol)) {
    throw new Error("Only a PostgreSQL target is allowed.");
  }
  for (const [key, value] of url.searchParams) {
    if (key !== "schema" || value !== "public" || url.searchParams.getAll(key).length !== 1) {
      throw new Error("Only one public schema parameter is allowed; connection overrides are blocked.");
    }
  }
  return url;
}

export function assertA2TestTarget(value: string | undefined, enabled: string | undefined): URL {
  if (enabled !== "1") throw new Error("Explicit A2_INTEGRATION_TEST=1 is required.");
  const url = parseTarget(value);
  if (!["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)
      || url.pathname !== "/brewlite_a2_test") {
    throw new Error("Workflow checks require the local brewlite_a2_test database.");
  }
  return url;
}

export function assertA2DemoTarget(value: string | undefined, enabled: string | undefined): URL {
  if (enabled !== "true") throw new Error("Explicit DEMO_SEED_ENABLED=true is required.");
  const url = parseTarget(value);
  if (!["localhost", "127.0.0.1", "[::1]", "db"].includes(url.hostname)
      || url.pathname !== "/brewlite_a2") {
    throw new Error("Demo seed requires the local/Compose brewlite_a2 database.");
  }
  return url;
}
