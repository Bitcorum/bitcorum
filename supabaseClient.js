import { createClient } from "@supabase/supabase-js";

// ── Bitcorum Supabase client ──────────────────────────────────────────────
// These read from environment variables so your real keys never sit in the
// repo. Set them in Vercel (Project Settings → Environment Variables) and
// in a local .env file for dev.
//
// Vite projects: use import.meta.env and prefix vars with VITE_
//   VITE_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
//   VITE_SUPABASE_ANON_KEY=your-anon-public-key
//
// Create React App projects: use process.env and prefix vars with REACT_APP_
//   REACT_APP_SUPABASE_URL=...
//   REACT_APP_SUPABASE_ANON_KEY=...
//
// Both keys come from Supabase → Settings → API. Only ever use the "anon
// public" key on the frontend — never the service_role key.

const supabaseUrl =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_URL) ||
  (typeof process !== "undefined" && process.env?.REACT_APP_SUPABASE_URL);

const supabaseAnonKey =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
  (typeof process !== "undefined" && process.env?.REACT_APP_SUPABASE_ANON_KEY);

if (!supabaseUrl || !supabaseAnonKey) {
  // Don't crash the whole app in dev — just warn loudly so it's obvious
  // why auth calls are failing.
  console.warn(
    "[Bitcorum] Supabase env vars are missing. Auth will not work until " +
    "VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY (or the REACT_APP_ equivalents) are set."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
