@AGENTS.md

# OROS MEMBERS (SGMO)

Application de gestion des membres, serviteurs et responsables de l'Église OROS.
Cahier des charges complet : `Cahier de Charges - SGMO.pdf` (racine du repo).

## Utilisateurs (2 comptes fixes, pas d'inscription publique)

- **Pasteur** : accès total (créer, modifier, supprimer, imprimer, exporter).
- **Assistante** : accès presque complet (créer, modifier, imprimer, exporter) — **suppression définitive réservée au Pasteur** (pas de workflow d'approbation, voir Règles métier clés).

## Deux axes distincts (ne pas fusionner en un seul enum)

**Le design (maquette Claude Design, voir §Source du design) fait foi ici, pas le cahier des charges** — il modélise le membre différemment et de façon plus simple. Le cahier posait une échelle unique à 10-11 niveaux ; le design la remplace par deux axes indépendants + des jalons datés. Ça répond aussi à l'ancienne question "11 ou 10 niveaux ?" : elle ne se pose plus, le modèle a changé.

**Assiduité** (`st`, 5 valeurs, vocabulaire figé dans `guidelines/status-vocabulary.card.html` du design system) : Nouveau, Régulier, Irrégulier, Déserteur, Actif.

**Parcours / ministère** (`pk`, nullable, 3 valeurs) : Serviteur, Leader, Pasteur consacré. Un membre sans parcours a `pk = null`. Attention à l'étiquette : la valeur d'enum est `pasteur`, l'affichage est toujours "Pasteur consacré" (jamais "Pasteur principal", utilisé une fois dans `Departments.jsx` pour la colonne Fonction — ne pas en faire une deuxième valeur d'enum).

**Jalons datés indépendants** (pas des enums, juste des champs sur la fiche) : date de baptême, passage par l'« École des nouveaux convertis ». Le funnel du tableau de bord les compte séparément (Nouveau → Baptisé → École des nouveaux convertis → Serviteur → Leader → Pasteur consacré) — 6 étapes, pas 10.

Chaque changement d'assiduité, de parcours, ou de département doit être ajouté à l'**historique** du membre (append-only, jamais de suppression/écrasement d'une entrée passée) — visible dans l'onglet Historique de la fiche (`MemberFiche.jsx`).

## Règles métier clés

- **Départements** : liste modifiable par le Pasteur. Le design ajoute une notion de **capacité** par département (effectif cible vs serviteurs affectés, affiché en `Meter`) — pas dans le cahier des charges, à garder puisque le design l'utilise partout (dashboard, écran Départements).
- **Fiche individuelle imprimable** : le design fait ça avec une feuille de style d'impression (`PrintSheet` + `base/print.css` + `window.print()`), **pas** un PDF généré côté serveur. Voir Packages pour la nuance avec l'export PDF de listes.
- Tout supprime/modifie doit passer par le **journal des actions**.
- **Suppression = rôle uniquement, pas de workflow d'approbation.** Le design grise simplement le bouton Supprimer pour l'Assistante (`disabled={role !== "pasteur"}`) — pas d'état "en attente de validation". Implémenter comme un soft-delete (`deleted_at`, réservé au rôle Pasteur), sans état intermédiaire `pending_deletion`.
- **Extension de périmètre par rapport au cahier des charges** (à noter, pas à re-valider avant de coder) : le design ajoute le suivi du baptême, de l'« École des nouveaux convertis », de la dernière présence, et des champs employeur/niveau d'études/notes pastorales — ce sont des items "Version 2" du cahier (§20) que le design intègre dès la v1. Il ajoute aussi une règle non écrite dans le cahier : passage automatique en "Régulier" après trois mois de présence.

## Stack (décidée)

Next.js **full-stack** (App Router + Server Actions comme backend, Route Handlers pour les exports fichiers) + PostgreSQL. Pas de service NestJS/Laravel séparé : pour une appli à 2 comptes fixes, un second service à déployer/maintenir n'apporte rien (YAGNI). Interface en français, responsive (desktop/tablette/mobile). **Palette réelle (design) : terracotta en primaire (`oklch(0.572 0.155 33)`), gris chauds, sidebar sombre `warm-900`** — le "vert/blanc" du cahier des charges (§20 NB) est obsolète, ignoré au profit de `tokens/shadcn.css` et `tokens/colors.css` du Design System.

## Architecture

Modules (repris de la recommandation du cahier des charges §20, adaptés en dossiers `app/`) :

```
app/
  (auth)/login/                 # page de connexion
  (dashboard)/
    dashboard/                  # tableau de bord + stats + graphiques
    membres/                    # liste, fiche, formulaire, historique
    serviteurs/                 # gestion des serviteurs
    departements/               # CRUD départements
    parametrage/                # paramètres généraux, gestion des 2 comptes
  api/
    export/[type]/route.ts      # GET — export Excel/PDF/CSV (fichier binaire, pas un Server Action)
proxy.ts                        # anciennement "middleware.ts" — check cookie optimiste, voir Conventions
lib/
  db.ts                         # client Prisma (singleton + PrismaPg adapter)
  auth/
    auth.ts                     # instance serveur Better Auth (prismaAdapter, admin plugin)
    client.ts                   # createAuthClient — hooks côté client (formulaire de connexion...)
    dal.ts                      # getSession()/requireSession()/requireRole() — cache() React, la vraie barrière
    permissions.ts              # access control : rôles pasteur/assistante
  actions/                      # Server Actions par domaine : membres.ts, serviteurs.ts, departements.ts
  validations/                  # schémas zod par domaine
prisma/
  schema.prisma                 # + modèles Better Auth (User/Session/Account/Verification, générés)
generated/prisma/                # client Prisma généré — gitignored, jamais éditer à la main
```

Une Server Action par mutation, colocalisée dans `lib/actions/<domaine>.ts` (`'use server'` en haut de fichier). Chaque action revérifie `verifySession()` + le rôle — jamais de confiance dans l'UI seule (une action est un endpoint public déguisé, cf. doc Next.js `authentication.md`).

**Suppression = soft-delete au niveau du schéma, pas juste un `disabled` en façade.** "Aucune information n'est perdue" (§10) → `deleted_at` sur `Membre`, jamais un vrai `DELETE`. Le contrôle de rôle (Pasteur uniquement) est vérifié dans la Server Action, pas seulement dans le composant qui grise le bouton (voir Règles métier clés pour ce que le design montre réellement).

## Découpage des fichiers et composants

- **Limite indicative : ~150-200 lignes par fichier** (hors imports/types). Un composant qui grossit au-delà doit être scindé — c'est un signal qu'il mélange plusieurs responsabilités, pas juste "trop de JSX".
- Un composant = une responsabilité. Pas de `MembrePage` monolithique qui fait le fetch, la logique métier, le formulaire *et* le tableau : séparer en Server Component (fetch + orchestration) + composants enfants dédiés à l'affichage (`MembreTable`, `MembreCard`, `MembreForm`) + Server Action pour la mutation.
- Tous les composants vivent dans `@/components/<domaine>/` (ex. `components/membres/membre-card.tsx`, `components/auth/login-form.tsx`) — y compris ceux spécifiques à une seule route. Pas de dossier privé `_components/` colocalisé dans les segments `app/`.
- Un fichier `lib/actions/<domaine>.ts` par domaine (§Architecture). S'il dépasse ~200 lignes, scinder par sous-opération plutôt que garder un fichier fourre-tout : `lib/actions/membres/create.ts`, `update.ts`, `delete.ts`.
- Extraire toute logique métier (calcul de statut, dédoublonnage, formatage) hors des composants et des Server Actions vers `lib/<domaine>.ts` — les composants ne font que de l'orchestration/affichage, les Server Actions ne font que valider + appeler `lib/` + revalider.

## Conventions Next.js (spécifiques à cette version, next 16.3.4 — voir `node_modules/next/dist/docs/`)

- **`proxy.ts` remplace `middleware.ts`** depuis Next.js 16 (même fonctionnalité, nouveau nom/fichier). Ne pas créer `middleware.ts`.
- **Cache Components désactivé** (`cacheComponents` absent de `next.config.ts`) — décision délibérée : cette appli est un dashboard interne authentifié où quasi tout est dynamique par utilisateur (aucune page publique/partagée à mettre en cache). Ne pas l'activer sans une vraie page candidate au cache statique — sinon c'est de la complexité (`use cache`, `<Suspense>` partout) sans bénéfice.
- Mutations via **Server Actions** (`'use server'`), pas de `fetch` vers sa propre API interne. Exception : `@tanstack/react-query` peut orchestrer une Server Action côté client (`useMutation({ mutationFn: monServerAction })`) quand on a besoin de retry/polling/état de chargement fin — ce n'est pas un appel réseau vers une API, juste un wrapper client autour de la même Server Action.
- **Filtres, recherche et tri de listes = `nuqs`, toujours** (jamais `useState` local pour un filtre, jamais de parsing manuel de `searchParams` côté client). Hooks `useQueryState`/`parseAs*` dans un composant client ; ajouter `shallow: false` pour que la page serveur relise l'URL et refasse la requête Prisma ; `debounce` sur la saisie texte. Côté serveur, la page lit `searchParams` (Promise) et valide les valeurs (ex. `isScope`). `NuqsAdapter` est monté dans `app/layout.tsx`. Référence : `components/membres/membres-toolbar.tsx`.
- Auth : **Better Auth** (voir §Authentification ci-dessous). DAL (`lib/auth/dal.ts`) avec `getSession()`/`requireSession()`/`requireRole()` mémoïsés par `React.cache`, appelés en haut de chaque page/layout protégé et dans chaque Server Action sensible. `proxy.ts` ne fait qu'une vérification optimiste du cookie (`getSessionCookie`, pas de requête DB) — la session n'est **réellement** validée que dans la DAL.
- Session : `expiresIn: 30 min`, `updateAge: 5 min` (glissant) dans la config Better Auth — c'est ce qui réalise la "déconnexion automatique après inactivité" du §18, pas un cookie longue durée.

## Packages (à installer seulement quand la fonctionnalité correspondante démarre — pas d'un coup)

| Besoin | Choix | Pourquoi |
|---|---|---|
| ORM / BDD | `prisma` + `@prisma/client` **v7 (pas la v8 RC)** + `@prisma/adapter-pg` + `pg`, PostgreSQL | Recommandé par le cahier des charges. Prisma 7 impose un driver adapter (`prisma.config.ts`, generator `provider = "prisma-client"` avec `output` explicite) — voir §Authentification pour le détail |
| Authentification | `better-auth` + `@better-auth/prisma-adapter` | Décision explicite de l'utilisateur (remplace le couple jose/bcryptjs prévu initialement). Voir §Authentification |
| Validation | `zod` + `@hookform/resolvers` (`zodResolver`) | Schémas de formulaire branchés sur `react-hook-form` via `resolver: zodResolver(schema)` — voir ligne Formulaires |
| Export Excel (.xlsx) | SheetJS, installé **depuis leur CDN** (`https://cdn.sheetjs.com`), pas `xlsx` sur npm | Le paquet `xlsx` publié sur npm est figé à une vieille version (0.18.5) avec des CVE connues — SheetJS distribue les versions à jour hors npm. Utilisé uniquement pour écrire les exports (l'import Excel a été retiré du périmètre) |
| Fiche individuelle imprimable | Aucun paquet — feuille de style d'impression (`@media print`) + `window.print()` | C'est ce que fait le design (`PrintSheet`) ; le navigateur sait déjà générer un PDF depuis une page imprimable ("Enregistrer en PDF" dans la boîte d'impression), pas besoin de générer le PDF côté serveur pour ça |
| Export PDF de listes (§15, si un vrai besoin serveur apparaît) | `@react-pdf/renderer` (à confirmer) | Seulement si l'export en masse (liste de fiches, pas une fiche seule) doit produire un PDF côté serveur sans passer par le navigateur — **vérifier la compatibilité React 19.2 à l'installation** ; repli sur `pdf-lib` si le peer range bloque |
| Export CSV | aucun paquet — construction de la chaîne CSV à la main | Format trivial, le stdlib suffit (règle YAGNI) |
| Graphiques dashboard | `recharts` | Standard avec shadcn/ui charts, suffisant pour le `BarChart` du design (arrivées par mois/semaine) |
| Tableaux (membres, serviteurs) | `@tanstack/react-table` + le composant `Table` shadcn/du design system pour le rendu | Tri, sélection multiple et pagination déjà présents dans les maquettes (`MembersList`, `Departments`) — TanStack Table gère la logique de colonnes/lignes, le design system fournit le HTML/CSS (`data-slot="table"` etc.). **Répartition avec `nuqs` ci-dessous : `nuqs` possède l'état de recherche/filtre (dans l'URL), TanStack Table possède le tri/la sélection/la pagination.** Pagination **client** uniquement (812 lignes max actuellement) — pas de pagination serveur tant que le volume ne l'impose pas |
| Icônes | `lucide-react` | Les noms d'icônes du design (`users-round`, `hand-heart`, `file-spreadsheet`...) sont des icônes Lucide ; le composant `Icon` du design system en est un wrapper |
| UI | `shadcn/ui` (new-york, déjà sur Tailwind v4) | Voir section shadcn/ui ci-dessous — le design system est explicitement construit dessus |
| Formulaires | `react-hook-form` (+ `zod` pour les schémas de validation) | Décision explicite de l'utilisateur (remplace le choix initial `<form>` natif + `useActionState`) |
| État de recherche/filtre dans l'URL | `nuqs` | Recherche avancée (§13) et filtres de liste (statut, département, niveau...) doivent être partageables/bookmarkables — `nuqs` donne des hooks typés au-dessus de `searchParams` sans réinventer le parsing à la main |
| Cache client + états async pour les flux interactifs uniquement | `@tanstack/react-query` | **Pas** utilisé pour les pages CRUD classiques (Server Components suffisent) — réservé au rafraîchissement périodique des compteurs du tableau de bord. Voir la note dans Conventions Next.js sur son usage avec les Server Actions |

## Source du design (maquette Claude Design)

Deux projets Claude Design, lus via l'outil `DesignSync` (méthodes `list_files`/`get_file`, lecture seule pour nous) :

- **UI Kit "Dashboard Oros single page"** (`projectId 384c445b-355f-4eff-8a36-bda412684d27`) : le click-through complet (`app/OROS MEMBERS.html` + `App.jsx`, `Dashboard.jsx`, `Departments.jsx`, `ImportExcel.jsx`, `Login.jsx`, `MemberFiche.jsx`, `MemberForm.jsx`, `MembersList.jsx`, `Profil.jsx`, `Shell.jsx`, `data.js` avec les fausses données). C'est la référence pour les écrans et le comportement.
- **"OROS Members Design System"** (`projectId fc0e3eae-b2e1-43fc-9c90-5dcfc7858d9e`) : les **vraies sources** des composants — `components/ui/*.jsx` (primitives) et `components/oros/*.jsx` (composants métier), chacune avec un `.d.ts` et un `.prompt.md` qui documente le comportement voulu, plus `tokens/*.css`, `base/*.css`, `guidelines/*.card.html` (référence visuelle par sujet : couleurs, typo, statuts...).

**Toujours lire les sources dans le projet Design System, jamais le `_ds_bundle.js` compilé** (192 Ko minifié, illisible et inutile à modifier).

## shadcn/ui — confirmé par le design lui-même

`tokens/shadcn.css` du Design System le dit explicitement : *"OROS Members is built on shadcn/ui (new-york, Tailwind v4 / v4 registry)"*. Ce fichier mappe la palette OROS sur les noms de variables shadcn exacts (`--primary`, `--muted-foreground`, `--sidebar`, etc. en oklch) — un `npx shadcn add <composant>` hérite donc déjà du thème OROS sans reprise.

- Initialiser avec `npx shadcn@latest init` (style new-york, Tailwind v4 déjà en place), puis copier `tokens/shadcn.css` (et les autres fichiers de `tokens/`/`base/` du Design System) dans `app/globals.css` — ne pas retaper les valeurs à la main.
- Primitives déjà spécifiées dans le Design System (`components/ui/`), à installer via `npx shadcn add <nom>` puis comparer au `.jsx`/`.prompt.md` fourni pour les ajustements OROS : Alert, Avatar, Badge, Breadcrumb, Button, Card, Checkbox, Dialog, DropdownMenu, Empty, Field, Input, Kbd, Label, NativeSelect, Pagination, Progress, RadioGroup, Separator, Skeleton, Switch, Table, Tabs, Textarea, Tooltip. Ne pas réinventer ces composants — porter les sources fournies.
- Composants métier OROS (`components/oros/` dans le Design System → `components/oros/` dans le repo Next.js), construits sur les primitives ci-dessus : `Topbar`/`Page`/`PageHeader` (layout de contenu), `StatCard`, `BarChart`/`Legend`/`Meter`, `StatusBadge` (assiduité + parcours, vocabulaire figé — voir §Deux axes distincts), `MemberIdentity`/`MemberPhoto`, `FilterBar`/`SearchField`/`FilterChip`, `DefinitionList`/`SectionTitle`, `SpiritualTimeline`, `PrintSheet`. La sidebar elle-même utilise le **vrai composant Sidebar shadcn** porté en plain CSS (`components/ui/sidebar.tsx`, pas la version simplifiée du design) — collapse interactif (bouton + Ctrl/Cmd+B, état persisté en cookie), pas seulement le collapse par breakpoint du prototype.
- Le design compose `Field`/`FieldGrid` + primitives natives (`Input`, `NativeSelect`...) directement plutôt que le pattern `Form`/`FormField` de shadcn (pensé pour react-hook-form) — brancher `react-hook-form` (`register`, `formState.errors`) sur ces primitives existantes plutôt que d'en réintroduire une couche `Form`/`FormField` séparée (voir tableau Packages).
- Ordre de portage recommandé (voir aussi Sub-agents) : tokens CSS → primitives `components/ui/` → composants métier `components/oros/` → écrans. Ne pas lancer plusieurs agents `dev-frontend` en parallèle sur des écrans tant que la couche composants n'existe pas, sous peine que chacun réinvente sa propre variante de `StatusBadge`.

## Authentification (Better Auth)

- **Postgres local en Docker** : `docker-compose.yml` à la racine, service `postgres` sur le **port hôte 5433** (pas 5432 — déjà pris sur cette machine) mappé vers 5432 dans le conteneur. `docker compose up -d` pour démarrer. Le volume `oros_postgres_data` persiste les données entre redémarrages.
- `.env` (gitignored) contient `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` — `.env.example` (commité) documente les clés attendues sans valeurs réelles. Régénérer un secret : `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`.
- **2 comptes fixes, pas d'inscription publique** : `emailAndPassword.disableSignUp: true` dans `lib/auth/auth.ts` — la route `/api/auth/sign-up/email` répond 400 même si on l'appelle directement. Les comptes sont créés une fois avec la CLI Better Auth, jamais via un formulaire d'inscription :
  ```bash
  npx auth create-admin --config lib/auth/auth.ts --email pasteur@oros.local --password '<mdp>' --name Pasteur --role pasteur
  npx auth create-admin --config lib/auth/auth.ts --email assistante@oros.local --password '<mdp>' --name Assistante --role assistante
  ```
- **Rôles = access control Better Auth**, pas des chaînes comparées à la main. `lib/auth/permissions.ts` définit `pasteur` (tout, y compris `membre:delete`) et `assistante` (tout sauf `delete`) via le plugin `admin`. Une Server Action qui doit vérifier "réservé au Pasteur" appelle `requireRole("pasteur")` de la DAL — ne pas réintroduire des `if (role !== "pasteur")` éparpillés.
- **Schéma Prisma** : les modèles `User`/`Session`/`Account`/`Verification` sont **générés par Better Auth**, pas écrits à la main. Après toute modification de `lib/auth/auth.ts` (nouveau plugin, champ supplémentaire) : `npx auth generate --config lib/auth/auth.ts` puis `npx prisma generate` puis `npx prisma db push` (ou `migrate dev` une fois en prod).
- Le client Prisma généré vit dans `generated/prisma/` (pas dans `app/generated/` — on garde `app/` réservé au routing Next.js), gitignored, importé via `@/generated/prisma/client`.

## Décisions d'implémentation (écrans livrés)

- **Base : `npx prisma db push --config prisma7.config.ts`**, pas `migrate dev` — la base locale a été créée avec `db push` et `migrate dev` voudrait la réinitialiser (perte des comptes). Pas de dossier `prisma/migrations` pour l'instant ; à introduire avant la prod. Seed factice : `npm run db:seed` (données de la maquette, jamais de vraies données).
- **TanStack Table = v9** (`useTable` + `tableFeatures`), seule version compatible React Compiler. Ne pas rétrograder en v8 ni ajouter d'`eslint-disable`.
- **Fichiers `"use server"`** : n'exporter que des fonctions `async` déclarées (`export async function`), jamais de `const x = () => …` (le build échoue, le typecheck ne le voit pas). Toujours lancer `npm run build` avant de conclure une série d'écrans.
- **Mutations métier** : `lib/actions/membres/{create,update,delete}.ts`, `lib/actions/departements.ts`. Création/modification de fiche ouverte aux deux rôles ; suppression de fiche et gestion des départements = `requireRole("pasteur")`. Chaque changement d'assiduité/parcours/département ajoute une ligne à `HistoriqueMembre` ; chaque mutation écrit dans `JournalAction`.
- **Export** : `app/api/export/[type]` (membres, serviteurs, departements ; xlsx ou csv). Les notes pastorales ne sont jamais exportées.
- **Règle « Régulier après 3 mois »** : `lib/regles.ts`, déclenchée par `after()` à l'ouverture du tableau de bord (idempotente, entrée d'historique « Système »). À déplacer dans une tâche planifiée si besoin.
- **Non livré (hors maquette ou hors périmètre)** : **Retirés du périmètre à la demande de l'utilisateur : import Excel et écran Statistiques** (pages, API, `lib/import` supprimés ; ne pas les recréer sans nouvelle demande). Paramètres (« écran non maquetté »), photo du membre (upload), changement de statut/affectation en masse, transfert de département, sauvegarde BDD (infra), création des comptes (CLI Better Auth, voir §Authentification).
- **Environnement local** : `BETTER_AUTH_URL` = `http://localhost:3000` ; si `next dev` démarre sur un autre port, la connexion est refusée (origine invalide). Libérer le port 3000 avant `npm run dev`.

## Sécurité (§18 du cahier des charges)

- Connexion obligatoire. Mot de passe hashé par Better Auth (`scrypt`, natif Node — voir doc Better Auth), jamais en clair même en base.
- Déconnexion automatique après inactivité : session Better Auth à courte durée + rafraîchie sur activité (voir §Conventions Next.js et §Authentification), pas un cookie de 7 jours.
- Journalisation : chaque création/modification/suppression passe par une table `journal_actions` (qui, quoi, quand).
- Sauvegarde automatique de la BDD : à mettre en place côté infra (pg_dump planifié ou snapshot managé), hors scope du code applicatif.
- Ne jamais committer de vraies données de membres (photos, exports Excel/CSV/PDF) — `.gitignore` bloque déjà `/uploads/`, `/exports/`, `/public/uploads/` à la racine, et un hook Claude Code avertit sur `git add`/`git commit` si un fichier `.xlsx`/`.xls` ou un dossier `uploads/`/`exports/` niché ailleurs (donc non couvert par le `.gitignore` racine) semble être en train d'être staged.

## Sub-agents spécialisés

Déléguer plutôt que tout faire dans le fil principal, dès que la tâche est assez isolée pour être confiée sans perdre le contexte :

| Tâche | Agent |
|---|---|
| Page, composant, formulaire, styling, tout ce qui touche à l'UI | `dev-frontend` |
| Bug qui ne saute pas aux yeux, touche plusieurs fichiers/couches, ou est intermittent | `backend-bug-hunter` (investigue et propose, ne modifie jamais le code lui-même) |
| Comparaison rendu vs maquette | `design-fidelity-checker` — une maquette existe (voir §Source du design), donc à utiliser dès qu'un écran porté doit être vérifié contre elle |

Le reste (Server Actions, schéma Prisma, logique métier) reste dans le fil principal ou passe par `dev-frontend` — c'est le même codebase TypeScript, pas un backend séparé qui justifierait un agent dédié.

Ne pas déléguer les micro-tâches (un typo, un import manquant, une ligne évidente) — ça ajoute de la latence sans valeur. Réserver la délégation à ce qui a un scope clair et vaut la peine d'être isolé du contexte principal.

Ces noms d'agents viennent de la configuration Claude Code locale, pas du repo — si l'un d'eux n'existe pas dans ta session, coder directement plutôt que de bloquer dessus.

## Revue de code — avant tout commit

1. **`npm run lint` et `npm run typecheck`** doivent passer (le hook Claude Code lance déjà `eslint --fix` après chaque écriture `.ts`/`.tsx`, mais ça ne remplace pas un run complet).
2. **`convention-drift-check`** (agent) sur le diff — vérifie la cohérence avec les conventions de ce fichier (découpage, shadcn, Server Actions, etc.) avant de committer ou d'ouvrir une PR.
3. **`/code-review`** (skill) sur le diff — bugs de correction, simplifications, doublons de logique. Niveau `medium` suffit pour une session normale ; monter à `high` avant un merge important.
4. Ces deux passes sont complémentaires, pas redondantes : `convention-drift-check` vérifie "est-ce que ça respecte nos règles", `/code-review` vérifie "est-ce que c'est correct et pas over-engineered".

## Procédure de travail

1. Avant de coder une fonctionnalité Next.js dont tu n'es pas sûr à 100 % (routing, cache, auth, forms...), lire le guide correspondant dans `node_modules/next/dist/docs/01-app/` — cette version (16.3.4) a des changements par rapport à ce que tu connais (`proxy.ts`, Cache Components, etc.), voir AGENTS.md.
2. Toute nouvelle mutation (Server Action) revérifie la session et le rôle — ne jamais supposer que l'UI a déjà filtré.
3. Toute nouvelle table Prisma qui touche à des données personnelles (téléphone, adresse, photo) : vérifier si elle doit apparaître dans le "Journal des actions" et si un champ doit être exclu des exports par défaut.
4. `Cahier de Charges - SGMO.pdf` est actuellement non trackée par git (`??`) — décision de l'utilisateur à prendre : la committer (documentation du projet) ou la garder locale. Ne pas la committer sans demander.
5. Avant de committer, suivre la section "Revue de code" ci-dessus.
6. `.agents/skills/`, `.windsurf/skills/`, `.claude/skills/prisma-*`, `skills-lock.json` : docs Prisma auto-installées par `prisma init` (markdown seul, pas de code exécuté) pour que d'autres outils IA sur ce repo aient la doc à jour. Laissés en l'état, pas générés par nous.
