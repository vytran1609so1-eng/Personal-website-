import { createClient } from "@supabase/supabase-js";

/**
 * Supabase connection — SERVER SIDE ONLY.
 *
 * The service-role key is never sent to the browser: every read and write goes
 * through the route handlers in app/api/. That is why none of these variables
 * are prefixed with NEXT_PUBLIC_.
 *
 * Environment variables (in .env.local locally, and in Vercel →
 * Settings → Environment Variables when deployed):
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   ADMIN_PASSWORD
 */
export function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export const isConfigured = () =>
  Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

export const ENTRIES_TABLE = "portfolio_entries";
export const SETTINGS_TABLE = "site_settings";
export const GUESTBOOK_TABLE = "guestbook_entries";
export const IMAGE_BUCKET = "portfolio-images";

/** Constant-time comparison of the admin password sent in x-admin-password. */
export function authorized(request) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const given = request.headers.get("x-admin-password") ?? "";
  if (given.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ given.charCodeAt(i);
  }
  return diff === 0;
}
