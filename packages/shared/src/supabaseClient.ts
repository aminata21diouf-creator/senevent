import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

let client: SupabaseClient<Database> | null = null;

export function initSupabase(url: string, anonKey: string): SupabaseClient<Database> {
  if (!client) {
    client = createClient<Database>(url, anonKey);
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