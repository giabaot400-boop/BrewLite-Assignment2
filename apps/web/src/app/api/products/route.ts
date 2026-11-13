export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  const base = (
    process.env.BACKEND_INTERNAL_URL ||
    process.env.BACKEND_URL ||
    "http://localhost:3001"
  ).replace(/\/+$/, "");

  try {
    const upstream = await fetch(`${base}/products`, {
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(8000),
    });

    const body: unknown = await upstream.json();

    return Response.json(body, {
      status: upstream.status,
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return Response.json(
      {
        error: {
          code: "UPSTREAM_UNAVAILABLE",
          message: "Không tải được danh sách sản phẩm.",
        },
      },
      {
        status: 502,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }
}