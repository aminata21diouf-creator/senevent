import { getSupabase } from "./supabaseClient";

export async function sInscrire(email: string, motDePasse: string) {
  const { data, error } = await getSupabase().auth.signUp({
    email,
    password: motDePasse,
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
