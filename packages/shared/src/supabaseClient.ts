import { createClient } from "@supabase/supabase-js";
import type {
  SupabaseClient,
  SupabaseClientOptions,
} from "@supabase/supabase-js";
import type { Database } from "./database.types";

let client: SupabaseClient<Database> | null = null;

/**
 * Cree le client Supabase partage.
 *
 * Le troisieme parametre est optionnel : le web ne le passe pas et garde le
 * comportement par defaut (session dans le localStorage). Le mobile y passe
 * AsyncStorage pour conserver la session apres la fermeture de l'application.
 */
export function initSupabase(
  url: string,
  anonKey: string,
  options?: SupabaseClientOptions<"public">
): SupabaseClient<Database> {
  if (!client) {
    client = createClient<Database>(url, anonKey, options);
  }
  return client;
}

export function getSupabase(): SupabaseClient<Database> {
  if (!client) {
    throw new Error(
      "Supabase non initialisé. Appelez initSupabase(url, key) au démarrage."
    );
  }
  return client;
}