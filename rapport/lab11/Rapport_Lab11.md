# Rapport — Lab 11
## Déploiement web sur Vercel

**Aminata Diouf — Étudiante en Master 1 RETEL, UCAD**
**DAWM — Développement d'Applications Web & Mobile — 2025-2026**

| | |
|---|---|
| **Auteure** | Aminata Diouf |
| **Université** | Université Cheikh Anta Diop de Dakar (UCAD) |
| **Faculté** | Faculté des Sciences et Techniques |
| **Département** | Département de Mathématiques et Informatique |
| **Formation** | Master 1 RETEL |
| **Date** | 8 novembre 2026 |
| **Dépôt** | `senevent` |
| **Branche du lab** | `feature/lab11-vercel` |
| **Tag de sortie** | `v1.0-web` |
| **Application** | `apps/web` (React + Vite) |
| **URL de production** | <https://senevent-equipe-1.vercel.app> |

---

## Résumé

Ce lab est le dernier bloc du projet **SenEvent** : il ne reste plus à ajouter de
fonctionnalité, il faut **mettre l'application web en ligne**. Le client web existait depuis
les labs précédents et fonctionnait en local, mais il n'avait jamais été construit pour la
production ni déployé.

Le travail réalisé couvre six points :

1. **Build de production** : réparer puis vérifier `tsc -b && vite build` en local.
2. **Projet Vercel** : relier le dépôt GitHub au projet `senevent-equipe-1`, avec le bon
   *Root Directory* (`apps/web`) et les variables d'environnement Supabase.
3. **Réécriture SPA** : faire en sorte qu'une route profonde comme `/evenement/13` renvoie
   `index.html` au lieu d'une 404.
4. **Supabase Auth en production** : Site URL, URL de redirection autorisées et confirmation
   d'email réactivée.
5. **Recette de production** : dérouler les dix points du lab sur l'URL publique, en mobile
   émulé (390 × 844).
6. **Documentation et version** : README racine avec la section « En ligne », déploiement
   continu et tag `v1.0-web`.

Le résultat est une application accessible publiquement, mise à jour automatiquement à chaque
merge sur `main`, avec une prévisualisation par Pull Request.

| Indicateur | Valeur |
|---|---|
| URL de production | <https://senevent-equipe-1.vercel.app> |
| Racine | HTTP 200 |
| Route profonde `/evenement/13` | HTTP 200 après réécriture SPA |
| Déploiement continu | Actif (`source: git`, branche `main`) |
| Prévisualisation par PR | Actif (URL `*-git-<branche>-*.vercel.app`) |
| Recette | 9 points validés, 1 non testable sans téléphone |
| Tag | `v1.0-web` sur `main` (`a08840a`) |

---

## 1. Contexte et objectif

Le dépôt est un monorepo :

```text
senevent/
  apps/
    web/          React + Vite + TypeScript  -> deploiement Vercel
    mobile/       Expo / React Native
  packages/
    shared/       types, client Supabase, fonctions metier
  supabase/
    migrations/   schema SQL et politiques RLS
    config.toml   configuration Auth
  .github/workflows/build-web.yml
```

Le client web et le client mobile partagent la même base Supabase et la même logique métier
(`@senevent/shared`). Le Lab 11 ne modifie donc pas le comportement fonctionnel : il ajoute
la **chaîne de livraison** et vérifie que tout tient debout en production.

Les contraintes du lab sont les suivantes :

- un build reproductible (`npm ci`) à partir d'un seul `package-lock.json` ;
- aucune variable secrète dans le dépôt ;
- une URL publique stable ;
- le rechargement direct d'une route profonde doit fonctionner ;
- la confirmation d'email doit être active ;
- une recette explicite, avec des preuves.

---

## 2. Étape 0 — Préparer la branche de travail

Le lab se fait sur une branche dédiée, créée depuis `main` à jour. Cette branche sera poussée
et mergée par Pull Request, ce qui permet à Vercel de produire une prévisualisation avant la
mise en production.

![Capture 01 — création de la branche feature/lab11-vercel (partie 1/2)](captures/split/01-etape0-branche-1.png)

![Capture 01 — création de la branche feature/lab11-vercel (partie 2/2)](captures/split/01-etape0-branche-2.png)

La branche `feature/lab11-vercel` part du commit `2479479`, qui contient le rapport du Lab 10.
La branche reste isolée jusqu'à la validation de la prévisualisation.

---

## 3. Étape 1 — Vérifier le build local

### 3.1 Le build de production

Le script de build du web enchaîne la compilation TypeScript et le bundler Vite :

```bash
cd apps/web
npm run build     # tsc -b && vite build
```

![Capture 02 — build de production local (partie 1/2)](captures/split/02-etape1-build-1.png)

![Capture 02 — build de production local (partie 2/2)](captures/split/02-etape1-build-2.png)

Le build produit `dist/index.html` et deux fichiers hachés (`index-*.css`, `index-*.js`).
`dist/` est ignoré par Git (`apps/web/.gitignore`), ce qui est le comportement attendu : le
dossier est un artefact, pas du code source.

### 3.2 Prévisualiser le build

Avant de déployer, on sert le build local avec `vite preview` :

```bash
npm run preview
curl -sI http://localhost:4173/ | head -n 1
curl -sI http://localhost:4173/evenement/13 | head -n 1
```

![Capture 03 — prévisualisation locale du build](captures/03-etape1-preview.png)

Les deux routes répondent **200** en local. C'est le serveur de prévisualisation de Vite qui
gère le repli SPA ; en production, ce rôle sera tenu par la réécriture Vercel.

![Capture 04 — application locale servie par vite preview](captures/04-etape1-preview-app.png)

### 3.3 Un seul `package-lock.json`

`npm ci` exige un lock unique et cohérent avec le `package.json` de la racine. Le contrôle
révèle deux locks :

```bash
git ls-files | grep package-lock.json
# apps/web/package-lock.json
# package-lock.json
```

![Capture 05 — suppression du lock dupliqué (partie 1/2)](captures/split/05-etape1-lock-unique-1.png)

![Capture 05 — suppression du lock dupliqué (partie 2/2)](captures/split/05-etape1-lock-unique-2.png)

Le lock de `apps/web` est supprimé, puis `npm install` régénère le lock racine. Le commit
`900577f` ne laisse qu'un seul lock pour tout le monorepo. C'est ce qui permet à Vercel et à
la CI d'utiliser `npm ci` de façon reproductible.

### 3.4 Réparer le build avant de déployer

Le premier build de production échouait pour deux raisons cumulées :

- des composants encore en `.jsx` alors que `tsc -b` attend des modules TypeScript ;
- des imports de types non explicites, refusés par `verbatimModuleSyntax`.

La correction convertit `EvenementCarte.jsx`, `SearchBar.jsx` et `Auth.jsx` en `.tsx`, et
ajoute les imports `import type`. Le commit `35174e0` rend le build vert.

Un second problème apparaît avec `npm ci` : `apps/web` demandait une version de React
différente de celle du monorepo. La version est alignée sur `19.1.0`, puis vérifiée :

![Capture 09 — alignement de React et vérification de npm ci (partie 1/2)](captures/split/09-fix-npm-ci-1.png)

![Capture 09 — alignement de React et vérification de npm ci (partie 2/2)](captures/split/09-fix-npm-ci-2.png)

Le correctif de build est mergé directement sur `main` (commit `ef8df24`) pour que la branche
de production puisse construire l'application :

![Capture 10 — merge du correctif de build sur main (partie 1/2)](captures/split/10-merge-build-1.png)

![Capture 10 — merge du correctif de build sur main (partie 2/2)](captures/split/10-merge-build-2.png)

À ce stade, `main` construit, mais l'application n'est pas encore déployée.

### 3.5 Bonus — intégration continue

En plus du déploiement Vercel, un workflow GitHub Actions vérifie le build à chaque Pull
Request vers `main` :

![Capture 07 — workflow GitHub Actions de build du web (partie 1/2)](captures/split/07-bonus-ci-1.png)

![Capture 07 — workflow GitHub Actions de build du web (partie 2/2)](captures/split/07-bonus-ci-2.png)

Le workflow installe les dépendances avec `npm ci` puis lance `npm run build`. Il sert de
garde-fou : une PR qui casse le build est signalée avant le merge, indépendamment de Vercel.


---

## 4. Étape 2 — Créer et configurer le projet Vercel

Le projet Vercel s'appelle **`senevent-equipe-1`**. Il est relié au dépôt GitHub
`aminata21diouf-creator/senevent`.

| Réglage Vercel | Valeur |
|---|---|
| Root Directory | `apps/web` |
| Framework Preset | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm ci` (défaut) |
| Variables | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` |
| Environnements des variables | Production + Preview |
| Protection de déploiement | désactivée (URL publique accessible) |

Deux fichiers locaux sont volontairement ignorés par Git :

- `.vercel/` (identifiants du projet lié) ;
- `.env*` (variables locales, dont la clé publique Supabase).

Le commit `88f105a` ajoute ces règles au `.gitignore`. Aucun secret n'est versionné.

Les variables sont saisies dans le tableau de bord Vercel, pas dans le dépôt. La clé
`VITE_SUPABASE_ANON_KEY` est **publique par conception** : elle est visible dans le bundle,
mais les politiques RLS de Supabase limitent ce qu'elle peut faire. La clé `service_role`, qui
contourne RLS, n'est jamais exposée au client (vérifié au point 10 de la recette).

---

## 5. Étape 3 — Réécriture SPA et premier déploiement

### 5.1 Le problème des routes profondes

Une application React Router n'a qu'un seul fichier HTML. Quand l'utilisateur ouvre
directement `/evenement/13`, le navigateur demande cette URL au serveur. Sans configuration,
Vercel cherche un fichier `evenement/13` qui n'existe pas et renvoie **404**.

La solution est une réécriture : toute URL inconnue est servie par `index.html`, puis React
Router affiche la bonne page.

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

![Capture 06 — ajout de apps/web/vercel.json (partie 1/2)](captures/split/06-etape3-vercel-json-1.png)

![Capture 06 — ajout de apps/web/vercel.json (partie 2/2)](captures/split/06-etape3-vercel-json-2.png)

Le fichier est ajouté dans `apps/web/`, donc à la racine du projet Vercel (Root Directory).
C'est un point important : placé à la racine du monorepo, il serait ignoré.

### 5.2 Le premier déploiement, volontairement incomplet

Pour comprendre l'utilité de la réécriture, le premier déploiement de production est fait
**sans** `vercel.json`. La racine répond, mais la route profonde échoue :

![Capture 11 — 404 sur la route profonde en production](captures/11-etape3-404.png)

![Capture 12 — la 404 dans le navigateur](captures/12-404-navigateur.png)

Le catalogue, lui, s'affiche correctement :

![Capture 13 — catalogue de production avant réécriture](captures/13-production-catalogue.png)

C'est le symptôme classique d'une SPA mal servie : l'accueil fonctionne, mais un lien partagé
ou un rafraîchissement sur une fiche renvoie une 404.

### 5.3 La prévisualisation de la branche corrige le tir

La branche `feature/lab11-vercel` contient `vercel.json`. Elle est poussée et une Pull Request
est ouverte ; c'est elle qui déclenche la prévisualisation :

![Capture 08 — création de la PR #8 (partie 1/2)](captures/split/08-etape3-pr-1.png)

![Capture 08 — création de la PR #8 (partie 2/2)](captures/split/08-etape3-pr-2.png)

Vercel en produit une prévisualisation, et cette fois les deux routes répondent **200** :

![Capture 14 — prévisualisation de branche : racine et route profonde en 200](captures/14-preview-ok.png)

![Capture 15 — la fiche s'affiche via l'URL de prévisualisation](captures/15-preview-route-profonde.png)

La prévisualisation est commentée sur la Pull Request avec les deux codes HTTP. C'est la
preuve que le correctif fonctionne **avant** de toucher à la production.

### 5.4 Merge et production corrigée

La PR #8 est mergée dans `main`, puis la production est redéployée :

![Capture 17 — merge de la PR #8 dans main (partie 1/2)](captures/split/17-merge-main-1.png)

![Capture 17 — merge de la PR #8 dans main (partie 2/2)](captures/split/17-merge-main-2.png)

![Capture 18 — production corrigée : 200 sur la route profonde et titre SenEvent](captures/18-production-fixee.png)

![Capture 19 — la fiche événement en production](captures/19-production-route-profonde.png)

La production répond désormais **200** sur `/` et sur `/evenement/13`, et le titre de la page
est `SenEvent`. La réécriture SPA est validée en conditions réelles.

---

## 6. Étape 4 — Variables d'environnement

Les variables sont configurées dans **Vercel → Project → Settings → Environment Variables**,
pour les environnements *Production* et *Preview* :

| Variable | Rôle | Portée |
|---|---|---|
| `VITE_SUPABASE_URL` | URL du projet Supabase | Production + Preview |
| `VITE_SUPABASE_ANON_KEY` | Clé publique `anon` / `publishable` | Production + Preview |

Deux règles ont été appliquées :

1. **Aucune variable dans Git.** Le fichier local `apps/web/.env.local` est ignoré, et
   `git ls-files | grep -c '\.env'` renvoie **0**.
2. **Aucune clé privilégiée dans le client.** Le frontend ne reçoit que la clé publique. La
   clé `service_role` reste côté serveur / administration.

En local, le même fichier `.env.local` permet de continuer à développer sans toucher à la
production.

---

## 7. Étape 5 — Supabase Auth en production

### 7.1 Pourquoi configurer les URL

Après une confirmation d'email ou une réinitialisation de mot de passe, Supabase redirige
l'utilisateur vers une adresse autorisée. Par défaut, cette adresse est `http://localhost:3000`.
En production, il faut déclarer l'adresse Vercel et les adresses de développement locales.

Cette liste est une protection : Supabase refuse de rediriger vers une adresse inconnue, ce
qui empêche un attaquant de détourner un lien d'authentification.

### 7.2 Configuration versionnée

La configuration est décrite dans `supabase/config.toml` :

```toml
[auth]
site_url = "https://senevent-equipe-1.vercel.app"
additional_redirect_urls = [
  "https://senevent-equipe-1.vercel.app/**",
  "http://localhost:5173/**",
  "http://127.0.0.1:5173/**",
]

[auth.email]
enable_confirmations = true
```

![Capture 16 — configuration Auth et synchronisation du projet Supabase (partie 1/2)](captures/split/16-supabase-auth-1.png)

![Capture 16 — configuration Auth et synchronisation du projet Supabase (partie 2/2)](captures/split/16-supabase-auth-2.png)

La capture montre les valeurs locales (`site_url`, `additional_redirect_urls`,
`enable_confirmations = true`) puis `supabase config push --yes`. Le projet distant est
synchronisé (`"auth": "up_to_date"`). La seconde occurrence de `enable_confirmations` à
`false` concerne le bloc `[auth.sms]`, désactivé : elle ne remet pas en cause la confirmation
d'email.

### 7.3 Confirmation d'email

Avec `enable_confirmations = true`, un compte créé depuis l'interface n'obtient **pas** de
session immédiate : l'utilisateur doit cliquer sur le lien reçu par email. C'est le
comportement attendu en production, et c'est aussi ce qui a révélé un bug corrigé plus loin
(section 10.1).

---

## 8. Étape 6 — README, déploiement continu et tag

### 8.1 Relier Git et Vercel

La connexion Git a demandé une action côté GitHub : installer l'**application Vercel** sur le
dépôt `senevent`. Une fois l'application autorisée, la commande suivante a réussi :

```bash
npx vercel git connect https://github.com/aminata21diouf-creator/senevent
# > Connected
```

Le projet est alors lié à la branche `main` :

| Propriété du lien | Valeur |
|---|---|
| `link.type` | `github` |
| `link.repo` | `senevent` |
| `link.productionBranch` | `main` |

À partir de ce moment, chaque push sur une branche crée une prévisualisation, et chaque merge
sur `main` crée un déploiement de production **sans commande manuelle**.

### 8.2 README racine

Le README décrit l'application, l'URL publique, la structure du monorepo, le développement
local, les réglages Vercel et les URL Supabase. Il est ajouté par la PR #9 :

![Capture 20 — création de la PR README (partie 1/2)](captures/split/20-readme-pr-1.png)

![Capture 20 — création de la PR README (partie 2/2)](captures/split/20-readme-pr-2.png)

La PR déclenche automatiquement une prévisualisation (`source: git`, branche
`docs/lab11-readme`) :

![Capture 21 — prévisualisation automatique de la PR README (partie 1/2)](captures/split/21-preview-auto-1.png)

![Capture 21 — prévisualisation automatique de la PR README (partie 2/2)](captures/split/21-preview-auto-2.png)

La prévisualisation répond **200** sur la route profonde, puis la PR est mergée :

![Capture 22 — merge de la PR README (partie 1/2)](captures/split/22-merge-readme-1.png)

![Capture 22 — merge de la PR README (partie 2/2)](captures/split/22-merge-readme-2.png)

### 8.3 Déploiement automatique de production

Après le merge, Vercel détecte le commit sur `main` et déploie en production avec
`source: git`. La capture vérifie aussi les points de sécurité et d'hygiène du dépôt :

![Capture 23 — déploiement automatique et contrôles de validation (partie 1/3)](captures/split/23-deploiement-auto-1.png)

![Capture 23 — déploiement automatique et contrôles de validation (partie 2/3)](captures/split/23-deploiement-auto-2.png)

![Capture 23 — déploiement automatique et contrôles de validation (partie 3/3)](captures/split/23-deploiement-auto-3.png)

On y lit notamment :

- un déploiement `Production` `Ready` avec `source: git` sur `main` ;
- `/evenement/13` → **200** et `/evenement/1` → **200** ;
- un seul `package-lock.json` suivi ;
- aucun fichier `.env` suivi ;
- la section `## En ligne` présente dans le README.

### 8.4 Tag `v1.0-web`

Le tag est d'abord posé sur le commit de merge de la PR #8 :

![Capture 24 — premier tag v1.0-web (partie 1/2)](captures/split/24-tag-v1.0-web-1.png)

![Capture 24 — premier tag v1.0-web (partie 2/2)](captures/split/24-tag-v1.0-web-2.png)

Après les deux correctifs issus de la recette (sections 10.1 et 10.2), le tag est déplacé sur
le `main` final pour qu'il désigne exactement la version testée :

![Capture 27 — tag v1.0-web aligné sur le main final (partie 1/2)](captures/split/27-tag-final-1.png)

![Capture 27 — tag v1.0-web aligné sur le main final (partie 2/2)](captures/split/27-tag-final-2.png)

`git rev-parse HEAD` et `git rev-parse v1.0-web^{commit}` renvoient le même commit
`a08840a`, et `git ls-remote` confirme que le tag distant est identique.

Le tag désigne la **version de code testée**. Ce rapport est ajouté ensuite par un commit de
documentation : il ne modifie ni l'application ni le déploiement, et le tag reste volontairement
sur `a08840a`.

---

## 9. Recette de production

### 9.1 Méthode

La recette est faite sur l'URL publique, dans un navigateur piloté, avec une fenêtre
**390 × 844** (format iPhone 14) et un émulateur tactile. Ce n'est pas un vrai téléphone en
4G : c'est un choix assumé, documenté dans les limites. L'objectif est de vérifier le
comportement applicatif et le rendu mobile, pas la performance réseau.

Les captures sont produites automatiquement par un script qui déroule les dix points et note
chaque résultat. Deux comptes sont utilisés :

| Compte | Rôle dans la recette |
|---|---|
| `recette.lab11@example.com` / `RecetteLab11!` | Création de compte, création d'événement, inscription |
| `temoin.lab11@senevent.sn` / `RecetteLab11!` | Compte témoin pour tester la suppression |

Le compte de test est confirmé via un lien `generateLink` généré côté serveur. Ce lien est
l'équivalent exact du lien envoyé par email ; il permet de tester la redirection et la session
sans dépendre d'une boîte mail.

### 9.2 Résultats des dix points

| # | Point du lab | Résultat |
|---|---|---|
| 1 | Ouvrir l'adresse de production | **OK** — catalogue affiché |
| 2 | Ouvrir un événement puis F5 | **OK** — la fiche reste affichée |
| 3 | Coller l'URL d'une fiche dans un nouvel onglet | **OK** — la fiche s'affiche directement |
| 4 | Créer un compte et confirmer l'email | **OK avec limite** — envoi email 429, confirmation vérifiée par lien serveur |
| 5 | Se connecter et créer un événement | **OK** — événement #16 |
| 6 | Recharger la page | **OK** — l'événement est toujours là |
| 7 | S'inscrire à un événement | **OK** — le bouton passe à « Se désinscrire » |
| 8 | Ouvrir l'application mobile (Expo Go) | **NON TESTÉ** — pas de téléphone disponible |
| 9 | Autre compte : tentative de suppression | **OK** — bouton absent, suppression forcée = 0 ligne |
| 10 | Chercher `service_role` dans le code de la page | **OK** — 0 occurrence |

### 9.3 Points 1 à 3 — accès et routes profondes

![Recette 01 — catalogue en 390 × 844](recette/01-accueil-mobile.png)

Le catalogue s'affiche en mobile, sans débordement horizontal. Les cartes restent lisibles et
cliquables.

![Recette 02 — fiche après un rechargement (F5)](recette/02-fiche-apres-f5.png)

Après un rechargement complet, la fiche reste affichée : c'est la réécriture SPA qui renvoie
`index.html`, puis React Router reconstruit la page à partir de l'URL.

![Recette 03 — URL directe dans un nouvel onglet](recette/03-url-directe.png)

Une URL copiée-collée dans un onglet neuf fonctionne également. C'est le test qui distingue une
vraie SPA déployée d'une application qui ne marche qu'en navigation interne.

### 9.4 Point 4 — création de compte et confirmation d'email

![Recette 04a — formulaire d'inscription](recette/04a-inscription.png)

Le formulaire demande un nom d'affichage, un email et un mot de passe. Le nom est stocké dans
les métadonnées du compte Supabase ; il servira à créer le profil.

![Recette 04b — limite d'envoi d'emails Supabase (HTTP 429)](recette/04b-limite-email.png)

L'inscription depuis l'interface renvoie **HTTP 429** `over_email_send_rate_limit`. Ce n'est
pas un bug de l'application : le projet Supabase utilise le service d'email intégré, qui impose
une limite d'envoi très basse. L'application affiche correctement l'erreur et ne crée pas de
session.

Pour ne pas bloquer la recette, le lien de confirmation est généré côté serveur avec
`generateLink`, puis ouvert dans le navigateur :

![Recette 04c — retour sur la production après confirmation](recette/04c-retour-production.png)

La redirection revient bien sur `https://senevent-equipe-1.vercel.app`, la session est active
(bouton « Se déconnecter » visible) et `email_confirmed_at` passe de `false` à `true`. Le
profil « Awa Recette » est créé par l'application à la première session. C'est le correctif
décrit en section 10.1.

### 9.5 Points 5 à 7 — création, persistance et inscription

![Recette 05a — formulaire de création d'événement](recette/05a-formulaire-evenement.png)

Le formulaire de création reprend les champs du modèle : titre, catégorie, lieu, date, prix.
Le lieu est saisi en texte libre, la date au format `datetime-local`.

![Recette 05b — événement créé et visible dans la liste](recette/05b-evenement-cree.png)

L'événement **#16 « Recette mobile Lab 11 »** est créé par le compte de recette et apparaît
dans le catalogue.

![Recette 06 — l'événement survit au rechargement](recette/06-rechargement-persiste.png)

Après rechargement de la fiche, l'événement est toujours présent : la donnée est bien en base,
pas seulement dans l'état React.

![Recette 07 — inscription à l'événement](recette/07-inscription.png)

L'inscription fonctionne : le bouton « S'inscrire » devient « Se désinscrire », ce qui prouve
que la ligne `inscriptions` a été créée et que l'état est relu depuis Supabase.

### 9.6 Point 8 — application mobile Expo Go

Ce point n'a pas pu être exécuté : l'environnement de travail ne dispose ni de téléphone ni
d'Expo Go. Le code mobile n'a pas été modifié par ce lab et pointe vers la **même base
Supabase** que le web ; les données créées pendant la recette (événement #16, profil, inscription)
seraient donc visibles depuis l'application mobile.

Le point est documenté comme **non testé**, et non comme validé.

### 9.7 Point 9 — suppression par un autre compte

![Recette 09 — aucun bouton de suppression pour le compte témoin](recette/09-autre-compte-sans-suppression.png)

Connecté avec le compte témoin `temoin.lab11@senevent.sn`, l'utilisateur ne voit pas le bouton
« Supprimer cet événement » : l'interface masque l'action aux non-propriétaires.

Le test ne s'arrête pas à l'interface. Une suppression est forcée directement via l'API REST
avec le jeton du compte témoin :

```text
DELETE /rest/v1/evenements?id=eq.16
HTTP 200
lignes supprimees: []
evenement encore present: true
```

La politique RLS `evenements_delete_owner` (`using (organisateur_id = auth.uid())`) empêche la
suppression : zéro ligne n'est touchée et l'événement reste en base. La sécurité ne repose donc
pas seulement sur l'interface.

### 9.8 Point 10 — absence de `service_role` dans le client

Le contrôle cherche la chaîne `service_role` dans le bundle JavaScript servi par la production
et dans le code source :

![Capture 30 — contrôle service_role dans le bundle et le dépôt](captures/30-service-role.png)

Résultat :

- `service_role` : **0** occurrence dans le bundle, **0** dans `apps/` et `packages/` ;
- `sb_secret_` : **1** occurrence dans le bundle, **0** dans le code source.

L'occurrence de `sb_secret_` n'est pas une clé : c'est un **test de préfixe** interne à la
librairie `supabase-js` (`Sa = e => e.startsWith('sb_publishable_') || e.startsWith('sb_secret_')`),
utilisé pour distinguer les clés publiques des clés secrètes. Aucune valeur secrète n'est
présente dans le code livré.

### 9.9 Récapitulatif de la recette

![Capture 29 — résultats de la recette (partie 1/2)](captures/split/29-recette-resultats-1.png)

![Capture 29 — résultats de la recette (partie 2/2)](captures/split/29-recette-resultats-2.png)

Le fichier `recette/resultats.json` conserve les treize lignes de résultat (les points 4 et 9
ont plusieurs vérifications). Neuf points sont validés, un point est non testable dans
l'environnement, et la limite d'email est explicitement documentée.

---

## 10. Bugs trouvés pendant la recette et corrigés

La recette n'a pas servi qu'à cocher des cases : elle a révélé deux vrais défauts de
production. Les deux ont été corrigés par Pull Request, avec prévisualisation et merge.

### 10.1 Inscription avec confirmation d'email active

**Symptôme.** Avec `enable_confirmations = true`, `signUp` ne renvoie pas de session. Le code
d'inscription tentait alors d'insérer le profil immédiatement :

```ts
const data = await sInscrire(email, motDePasse);
if (data.user) {
  await getSupabase().from("profiles").insert({ id: data.user.id, nom });
}
```

Sans session, la requête est anonyme et la politique RLS `profiles_insert_self`
(`with check (id = auth.uid())`) la refuse. Le compte était créé, mais sans ligne `profiles` ;
la clé étrangère `evenements.organisateur_id` empêchait ensuite de créer un événement.

**Correctif.** Le nom est passé dans les métadonnées du compte (`options.data.nom`), et le
profil est créé à la **première session**, dans `App.tsx` :

```ts
useEffect(() => {
  if (!session?.user) return;
  const nom =
    session.user.user_metadata?.nom ||
    session.user.email?.split("@")[0] ||
    "Utilisateur";
  creerProfil(session.user.id, nom).catch(() => {
    // Profil deja present : rien a faire.
  });
}, [session]);
```

`Auth.tsx` affiche un message explicite (« Compte créé. Vérifiez votre email pour confirmer,
puis connectez-vous. ») au lieu de naviguer vers l'accueil sans session.

![Capture 25 — PR de correction de l'inscription (partie 1/3)](captures/split/25-fix-signup-pr-1.png)

![Capture 25 — PR de correction de l'inscription (partie 2/3)](captures/split/25-fix-signup-pr-2.png)

![Capture 25 — PR de correction de l'inscription (partie 3/3)](captures/split/25-fix-signup-pr-3.png)

![Capture 26 — merge du correctif d'inscription (partie 1/2)](captures/split/26-merge-fix-1.png)

![Capture 26 — merge du correctif d'inscription (partie 2/2)](captures/split/26-merge-fix-2.png)

La vérification en production confirme : après confirmation, le profil « Awa Recette » existe
et l'événement peut être créé.

### 10.2 Navbar inutilisable en mobile

**Symptôme.** En 390 px de large, la barre de navigation débordait horizontalement et le bouton
« Se déconnecter » n'était plus cliquable. La recette du point 9 ne pouvait pas continuer.

**Correctif.** Une media query sous 640 px fait passer la barre sur deux lignes et autorise le
retour à la ligne des liens :

```css
@media (max-width: 640px) {
  .nav {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.6rem;
    padding: 0.8rem 1rem;
  }
  .liens {
    flex-wrap: wrap;
    gap: 0.6rem 1rem;
    width: 100%;
  }
  .email {
    width: 100%;
    overflow-wrap: anywhere;
    font-size: 0.82rem;
  }
}
```

![Capture 28 — PR de correction de la navbar mobile (partie 1/3)](captures/split/28-navbar-mobile-1.png)

![Capture 28 — PR de correction de la navbar mobile (partie 2/3)](captures/split/28-navbar-mobile-2.png)

![Capture 28 — PR de correction de la navbar mobile (partie 3/3)](captures/split/28-navbar-mobile-3.png)

Après merge et redéploiement automatique, la recette complète repasse : le bouton de
déconnexion est accessible et le point 9 peut être vérifié.

---

## 11. Checklist de validation

| Critère du lab | Vérification | Preuve |
|---|---|---|
| Build de production vert | `tsc -b && vite build` | Capture 02 |
| Un seul `package-lock.json` | `git ls-files \| grep -c 'package-lock.json'` = 1 | Capture 23 |
| Aucun `.env` versionné | `git ls-files \| grep -c '\.env'` = 0 | Capture 23 |
| Projet Vercel relié à GitHub | `link.type = github`, `productionBranch = main` | Section 8.1 |
| Racine en production | HTTP 200 | Captures 18, 23 |
| Route profonde en production | `/evenement/13` HTTP 200 | Captures 18, 19 |
| Réécriture SPA | `apps/web/vercel.json` | Capture 06 |
| Prévisualisation par PR | URL `*-git-*` en 200 | Capture 21 |
| Déploiement continu | déploiement `source: git` sur `main` | Capture 23 |
| Supabase Auth configuré | `site_url`, redirects, `enable_confirmations` | Capture 16 |
| Confirmation d'email | `email_confirmed_at` false → true | Recette 04c |
| Recette des 10 points | 9 OK, 1 non testé, 1 limite documentée | Captures 29 |
| Pas de `service_role` côté client | 0 occurrence | Capture 30 |
| README avec section « En ligne » | `## En ligne` | Capture 23 |
| Tag de sortie | `v1.0-web` = `HEAD` = `a08840a` | Capture 27 |

---

## 12. Bilan et limites

### 12.1 Ce qui est livré

- Une application web publique : <https://senevent-equipe-1.vercel.app>.
- Un déploiement continu : merge sur `main` → production ; Pull Request → prévisualisation.
- Une réécriture SPA qui rend les URL profondes partageables et rechargeables.
- Une authentification Supabase configurée pour la production, confirmation d'email active.
- Un README qui documente l'URL, la structure et les réglages.
- Un tag `v1.0-web` sur la version testée.

### 12.2 Limites assumées

| Limite | Explication |
|---|---|
| Envoi d'email 429 | Le service d'email intégré Supabase limite fortement les envois. La confirmation a été vérifiée avec un lien `generateLink`, équivalent du lien envoyé. |
| Point 8 non testé | Pas de téléphone ni d'Expo Go dans l'environnement. Le mobile n'a pas été modifié par ce lab. |
| Recette en mobile émulé | 390 × 844 dans Chrome, pas un vrai téléphone en 4G. Le rendu et les parcours sont vérifiés, pas la performance réseau. |
| Dépendances | `npm audit` signale des vulnérabilités dans l'arbre de développement ; elles ne concernent pas le code applicatif livré. |

### 12.3 Ce que la recette a apporté

La recette n'était pas une formalité : elle a mis au jour deux défauts qu'aucun test local
n'aurait révélés dans ces conditions.

1. **Un défaut de logique d'authentification** : l'inscription supposait une session immédiate,
   hypothèse fausse dès que la confirmation d'email est active — c'est-à-dire en production.
2. **Un défaut de rendu mobile** : la navbar n'avait jamais été testée à 390 px.

Les deux ont été corrigés par PR, prévisualisés, mergés, puis revérifiés en production. C'est
exactement le cycle que le lab cherche à installer : **construire, déployer, observer, corriger,
redéployer**.

---

## Annexes

### A. Fichiers ajoutés ou modifiés pour le Lab 11

```text
apps/web/vercel.json                  reecriture SPA
apps/web/index.html                   langue fr, titre SenEvent
apps/web/package.json                 React aligne sur 19.1.0
apps/web/src/App.tsx                  creation du profil a la session
apps/web/src/pages/Auth.tsx           message de confirmation
apps/web/src/pages/Auth.module.css    style du message d'information
apps/web/src/components/NavBar.module.css   media query mobile
packages/shared/src/auth.ts           nom dans les metadonnees du compte
supabase/config.toml                  Site URL, redirects, confirmation
supabase/.gitignore                   ignore les artefacts Supabase
.github/workflows/build-web.yml       CI build sur Pull Request
README.md                             section En ligne
```

### B. Commandes utiles

```bash
# build et previsualisation locale
cd apps/web
npm run build
npm run preview

# deploiement manuel (secours)
npx vercel --prod

# etat des deploiements
npx vercel ls senevent-equipe-1

# configuration Supabase
npx supabase link --project-ref <ref>
npx supabase config push --yes

# verification de la production
curl -sI https://senevent-equipe-1.vercel.app/ | head -n 1
curl -sI https://senevent-equipe-1.vercel.app/evenement/13 | head -n 1
```

### C. Comptes de test

| Compte | Email | Mot de passe | Usage |
|---|---|---|---|
| Recette | `recette.lab11@example.com` | `RecetteLab11!` | Création de compte et d'événement |
| Témoin | `temoin.lab11@senevent.sn` | `RecetteLab11!` | Test de suppression refusée |
| Démo Lab 10 | `amina.lab10@senevent.sn` | `Lab10Senevent!` | Événement #13 |

### D. Liste des captures

**Terminal** (`captures/`, 30 fichiers) : 01 branche, 02 build, 03 preview locale, 04 preview
navigateur, 05 lock unique, 06 vercel.json, 07 CI, 08 PR #8, 09 npm ci, 10 merge build,
11 404 production, 12 404 navigateur, 13 catalogue production, 14 preview 200, 15 preview route
profonde, 16 Supabase Auth, 17 merge PR #8, 18 production corrigée, 19 production route
profonde, 20 PR README, 21 preview automatique, 22 merge README, 23 déploiement automatique,
24 tag initial, 25 PR correctif inscription, 26 merge correctif, 27 tag final, 28 PR navbar,
29 résultats de recette, 30 service_role.

**Recette** (`recette/`, 11 captures) : 01 accueil mobile, 02 fiche après F5, 03 URL directe,
04a inscription, 04b limite email, 04c retour production, 05a formulaire événement,
05b événement créé, 06 rechargement, 07 inscription, 09 autre compte sans suppression.

**Tag final :** `v1.0-web` — commit `a08840a`.
