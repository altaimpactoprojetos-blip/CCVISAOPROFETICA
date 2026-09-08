import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "cloudflare:workers";

export type Database = SupabaseClient;

/**
 * Server-only Supabase client. The secret key is intentionally required here:
 * all database work happens behind the site's server routes, and the public
 * key must never be given permission to read or change administrative data.
 */
export function database(): Database {
  const url = String(env.SUPABASE_URL ?? "").trim();
  const secretKey = String(env.SUPABASE_SECRET_KEY ?? "").trim();
  if (!url || !secretKey) throw new Error("Supabase não está configurado no ambiente do site");

  return createClient(url, secretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

export function supabaseErrorCode(error: unknown): string | null {
  if (!error || typeof error !== "object") return null;
  const code = (error as {code?: unknown}).code;
  return typeof code === "string" ? code : null;
}

export function rpcNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) return Number(value);
  if (Array.isArray(value) && value.length === 1) return rpcNumber(value[0]);
  if (value && typeof value === "object") {
    if ("value" in value) return rpcNumber((value as {value?: unknown}).value);
    if ("attempts" in value) return rpcNumber((value as {attempts?: unknown}).attempts);
  }
  return null;
}
