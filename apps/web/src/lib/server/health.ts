/** Public process-health proxy. Catalog smoke separately checks database reads. */
export async function processHealth(
  base: string,
  checkoutV2Enabled: boolean,
  fetcher: typeof fetch = fetch,
): Promise<Response> {
  const headers = { "Cache-Control": "no-store" };
  try {
    const upstream = await fetcher(`${base.replace(/\/+$/, "")}/health`, {
      cache: "no-store", redirect: "error", signal: AbortSignal.timeout(8000),
    });
    const body: unknown = await upstream.json();
    if (!upstream.ok || typeof body !== "object" || body === null
        || !("status" in body) || body.status !== "ok"
        || !("service" in body) || body.service !== "brewlite-api") throw Error("Unhealthy");
    return Response.json({ status: "ok", service: "brewlite-web", api: "ok", checkoutV2Enabled }, { headers });
  } catch {
    // Never reflect internal URLs, exception messages or upstream response bodies.
    return Response.json({ status: "unavailable", service: "brewlite-web" }, { status: 503, headers });
  }
}
