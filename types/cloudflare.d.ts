// Bindings used by this Site. Runtime resources are declared in .openai/hosting.json.
declare module "cloudflare:workers" {
  export const env: {
    /** Legacy binding retained for the example D1 route and historical tests. */
    DB: D1Database;
    SUPABASE_URL?: string;
    SUPABASE_PUBLISHABLE_KEY?: string;
    SUPABASE_SECRET_KEY?: string;
    SUPABASE_STORAGE_BUCKET?: string;
    ADMIN_SETUP_TOKEN_HASH?: string;
    ADMIN_SETUP_EXPIRES_AT?: string;
  };
}
