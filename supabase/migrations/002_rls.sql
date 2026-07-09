-- Activer RLS sur les 3 tables
alter table public.profiles enable row level security;
alter table public.evenements enable row level security;
alter table public.inscriptions enable row level security;

-- Politiques evenements
create policy "evenements_select_public"
  on public.evenements for select using (true);

create policy "evenements_insert_auth"
  on public.evenements for insert to authenticated
  with check (organisateur_id = auth.uid());

create policy "evenements_update_owner"
  on public.evenements for update to authenticated
  using (organisateur_id = auth.uid());

create policy "evenements_delete_owner"
  on public.evenements for delete to authenticated
  using (organisateur_id = auth.uid());

-- Politiques profiles
create policy "profiles_select_public"
  on public.profiles for select using (true);

create policy "profiles_insert_self"
  on public.profiles for insert to authenticated
  with check (id = auth.uid());

create policy "profiles_update_self"
  on public.profiles for update to authenticated
  using (id = auth.uid());

-- Politiques inscriptions
create policy "inscriptions_select_public"
  on public.inscriptions for select using (true);

create policy "inscriptions_insert_self"
  on public.inscriptions for insert to authenticated
  with check (utilisateur_id = auth.uid());

create policy "inscriptions_delete_self"
  on public.inscriptions for delete to authenticated
  using (utilisateur_id = auth.uid());