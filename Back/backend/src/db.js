const { createClient } = require("@supabase/supabase-js");

function cleanEnvValue(value) {
  return typeof value === "string" ? value.trim().replace(/^['"]|['"]$/g, "") : value;
}

function pickEnv(keyVariants) {
  const foundKey = keyVariants.find((key) => process.env[key]);
  return foundKey ? cleanEnvValue(process.env[foundKey]) : null;
}

function validateUrl(rawUrl) {
  try {
    const url = new URL(rawUrl);
    if (!["http:", "https:"].includes(url.protocol)) {
      throw new Error("Le schéma doit être http ou https.");
    }
    return rawUrl;
  } catch (err) {
    throw new Error(
      `SUPABASE_URL invalide : ${err.message}. Exemple attendu : https://xxxxxxxxxxxx.supabase.co`
    );
  }
}

function createSupabaseClient() {
  const rawUrl =
    pickEnv(["SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_PROJECT_URL"]) ||
    null;

  const serviceKey = pickEnv([
    "SUPABASE_SERVICE_ROLE_KEY",
    "SUPABASE_KEY",
    "SUPABASE_SECRET_KEY",
  ]);

  const anonKey = pickEnv([
    "SUPABASE_ANON_KEY",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_PUBLIC_ANON_KEY",
  ]);

  const key = serviceKey || anonKey;

  if (!rawUrl || !key) {
    throw new Error(
      "Configuration Supabase manquante : fournissez SUPABASE_URL et une clé (SERVICE_ROLE ou ANON)."
    );
  }

  const url = validateUrl(rawUrl);

  if (!serviceKey) {
    console.warn(
      "[Supabase] Clé service non fournie, utilisation d'une clé anon (droits limités, RLS requis)."
    );
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

module.exports = { createSupabaseClient };

