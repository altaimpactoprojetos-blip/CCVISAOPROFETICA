import { env } from "cloudflare:workers";

export const dynamic = "force-dynamic";

export function GET() {
  const supabaseUrl = String(env.SUPABASE_URL ?? "").trim();
  const supabasePublishableKey = String(env.SUPABASE_PUBLISHABLE_KEY ?? "").trim();

  if (!supabaseUrl || !supabasePublishableKey) {
    return Response.json(
      { error: "O acesso com Google ainda não está configurado." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  return Response.json(
    { supabaseUrl, supabasePublishableKey },
    { headers: { "Cache-Control": "no-store" } },
  );
}
