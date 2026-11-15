import { checkoutV2IntegrationEnabled } from "@/lib/server/checkout-integration";
import { processHealth } from "@/lib/server/health";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  const base = process.env.BACKEND_INTERNAL_URL || process.env.BACKEND_URL || "http://localhost:3001";
  return processHealth(base, checkoutV2IntegrationEnabled(), fetch, process.env.BREWLITE_BUILD_SHA);
}
