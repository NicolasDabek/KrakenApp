import { createFileRoute } from "@tanstack/react-router";
import { handleV1, V1_CORS } from "@/lib/trading/v1-handler";

export const Route = createFileRoute("/api/v1/$")({
  server: {
    handlers: {
      GET: async ({ request, params }) => handleV1("GET", request, params._splat ?? ""),
      POST: async ({ request, params }) => handleV1("POST", request, params._splat ?? ""),
      DELETE: async ({ request, params }) => handleV1("DELETE", request, params._splat ?? ""),
      OPTIONS: async () => new Response(null, { status: 204, headers: V1_CORS }),
    },
  },
});
