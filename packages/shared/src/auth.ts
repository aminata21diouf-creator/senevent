import { getSupabase } from "./supabaseClient";

export async function sInscrire(
  email: string,
  motDePasse: string,
  nom?: string
) {
  const { data, error } = await getSupabase().auth.signUp({
    email,
    password: motDePasse,
    ...(nom ? { options: { data: { nom } } } : {}),
  });
  if (error) throw error;
  return data;
}

export async function seConnecter(email: string, motDePasse: string) {
  const { data, error } = await getSupabase().auth.signInWithPassword({
    email,
    password: motDePasse,
  });
  if (error) throw error;
  return data;
}

export async function seDeconnecter() {
  const { error } = await getSupabase().auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data } = await getSupabase().auth.getSession();
  return data.session;
}

// Cree (ou met a jour) le profil public lie au compte auth.
// Necessaire avant de creer un evenement : organisateur_id reference profiles(id).
export async function creerProfil(id: string, nom: string) {
  const { error } = await getSupabase()
    .from("profiles")
    .upsert({ id, nom }, { onConflict: "id", ignoreDuplicates: true });

  if (error) throw error;
}
