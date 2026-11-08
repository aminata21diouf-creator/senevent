# SenEvent

Application web et mobile de catalogue d'evenements — Master 1 RETEL, DMI/FST/UCAD.

SenEvent permet de consulter un catalogue d'evenements, de rechercher par titre ou par lieu,
de s'authentifier, de creer des evenements et de s'y inscrire. Les deux clients (web et mobile)
partagent la meme base Supabase et la meme logique metier.

## En ligne

- Application web : <https://senevent-equipe-1.vercel.app>
- Deploiement continu : chaque merge sur `main` met la production a jour, chaque Pull Request
  recoit une URL de previsualisation Vercel.
- Base de donnees et authentification : Supabase (projet `senevent-equipe-X`, region `eu-west-2`).

## Fonctionnalites

- Catalogue des evenements, trie par date, avec recherche par titre ou lieu.
- Fiche evenement accessible par URL directe (`/evenement/:id`) et resistant au rechargement.
- Authentification par email et mot de passe (Supabase Auth), confirmation d'email active.
- Creation d'evenement pour un utilisateur connecte.
- Inscription et desinscription a un evenement.
- Suppression reservee au proprietaire, appliquee par les politiques RLS de Supabase.
- Application mobile Expo qui consomme la meme base.

## Structure du depot

```text
senevent/
  apps/
    web/                 React + Vite + TypeScript (deploiement Vercel)
      vercel.json        reecriture SPA : toute route renvoie index.html
    mobile/              Expo / React Native
  packages/
    shared/              types, client Supabase et fonctions metier partagees
  supabase/
    migrations/          schema SQL et politiques RLS
    config.toml          configuration locale et Auth (site_url, redirects)
  .github/workflows/     CI : build du web sur chaque Pull Request
  package-lock.json      le seul lock du monorepo
  rapport/               rapports de laboratoire
```

## Developpement local

Prerequis : Node.js 20 ou plus recent, npm, un projet Supabase.

```bash
# a la racine du monorepo
npm install

# variables d'environnement du web (fichier ignore par Git)
# apps/web/.env.local
#   VITE_SUPABASE_URL=https://<ref>.supabase.co
#   VITE_SUPABASE_ANON_KEY=<cle publique anon>

npm run dev --workspace apps/web      # http://localhost:5173
npm run build --workspace apps/web    # build de production dans apps/web/dist
npm run preview --workspace apps/web  # previsualisation du build sur le port 4173
```

## Deploiement

Le projet Vercel `senevent-equipe-1` est relie au depot GitHub. Reglages :

| Reglage | Valeur |
| --- | --- |
| Root Directory | `apps/web` |
| Framework | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Variables | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (Production + Preview) |

La reecriture SPA de `apps/web/vercel.json` garantit qu'une route profonde comme
`/evenement/13` renvoie `index.html` et non une 404.

Les URL autorisees de Supabase Auth sont configurees dans `supabase/config.toml` :

- Site URL : `https://senevent-equipe-1.vercel.app`
- Redirect URLs : `https://senevent-equipe-1.vercel.app/**`, `http://localhost:5173/**`

## Qualite

- Build de production verifie en local (`tsc -b && vite build`).
- Un seul `package-lock.json`, a la racine, pour que `npm ci` soit reproductible.
- Workflow GitHub Actions `.github/workflows/build-web.yml` : `npm ci` puis build du web sur
  chaque Pull Request vers `main`.

## Documentation

Les rapports de laboratoire sont dans `rapport/`. Le Lab 10 documente le CRUD mobile,
le Lab 11 documente le deploiement web sur Vercel et la recette de production.

## Version

Version publique `1.0` — tag `v1.0-web`.
