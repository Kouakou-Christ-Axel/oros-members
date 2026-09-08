@AGENTS.md

# OROS MEMBERS (SGMO)

Application de gestion des membres, serviteurs et responsables de l'Église OROS.
Cahier des charges complet : `Cahier de Charges - SGMO.pdf` (racine du repo).

## Utilisateurs (2 comptes fixes, pas d'inscription publique)

- **Pasteur** : accès total (créer, modifier, supprimer, imprimer, import Excel, export PDF, statistiques).
- **Assistante** : accès presque complet (créer, modifier, imprimer, import Excel) — **suppression définitive réservée au Pasteur** (pas de workflow d'approbation, voir Règles métier clés).

## Deux axes distincts (ne pas fusionner en un seul enum)

**Le design (maquette Claude Design, voir §Source du design) fait foi ici, pas le cahier des charges** — il modélise le membre différemment et de façon plus simple. Le cahier posait une échelle unique à 10-11 niveaux ; le design la remplace par deux axes indépendants + des jalons datés. Ça répond aussi à l'ancienne question "11 ou 10 niveaux ?" : elle ne se pose plus, le modèle a changé.

**Assiduité** (`st`, 5 valeurs, vocabulaire figé dans `guidelines/status-vocabulary.card.html` du design system) : Nouveau, Régulier, Irrégulier, Déserteur, Actif.

**Parcours / ministère** (`pk`, nullable, 3 valeurs) : Serviteur, Leader, Pasteur consacré. Un membre sans parcours a `pk = null`. Attention à l'étiquette : la valeur d'enum est `pasteur`, l'affichage est toujours "Pasteur consacré" (jamais "Pasteur principal", utilisé une fois dans `Departments.jsx` pour la colonne Fonction — ne pas en faire une deuxième valeur d'enum).

**Jalons datés indépendants** (pas des enums, juste des champs sur la fiche) : date de baptême, passage par l'« École des nouveaux convertis ». Le funnel du tableau de bord les compte séparément (Nouveau → Baptisé → École des nouveaux convertis → Serviteur → Leader → Pasteur consacré) — 6 étapes, pas 10.

Chaque changement d'assiduité, de parcours, ou de département doit être ajouté à l'**historique** du membre (append-only, jamais de suppression/écrasement d'une entrée passée) — visible dans l'onglet Historique de la fiche (`MemberFiche.jsx`).

## Règles métier clés

- **Dédoublonnage import Excel** : un membre existe déjà si téléphone identique, OU email identique, OU (nom + prénom + date de naissance) identiques → mise à jour automatique au lieu de création d'un doublon.
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
    import/route.ts              # POST — upload + parsing Excel
proxy.ts                        # anciennement "middleware.ts" — voir Conventions
lib/
  db.ts                         # client Prisma
  auth/
    session.ts                  # encrypt/decrypt + createSession/updateSession/deleteSession (jose)
    dal.ts                      # verifySession() — Data Access Layer, cache() React
  actions/                      # Server Actions par domaine : membres.ts, serviteurs.ts, departements.ts, import-export.ts
  validations/                  # schémas zod par domaine
prisma/
  schema.prisma
```

Une Server Action par mutation, colocalisée dans `lib/actions/<domaine>.ts` (`'use server'` en haut de fichier). Chaque action revérifie `verifySession()` + le rôle — jamais de confiance dans l'UI seule (une action est un endpoint public déguisé, cf. doc Next.js `authentication.md`).

**Suppression = soft-delete au niveau du schéma, pas juste un `disabled` en façade.** "Aucune information n'est perdue" (§10) → `deleted_at` sur `Membre`, jamais un vrai `DELETE`. Le contrôle de rôle (Pasteur uniquement) est vérifié dans la Server Action, pas seulement dans le composant qui grise le bouton (voir Règles métier clés pour ce que le design montre réellement).

## Découpage des fichiers et composants

- **Limite indicative : ~150-200 lignes par fichier** (hors imports/types). Un composant qui grossit au-delà doit être scindé — c'est un signal qu'il mélange plusieurs responsabilités, pas juste "trop de JSX".
- Un composant = une responsabilité. Pas de `MembrePage` monolithique qui fait le fetch, la logique métier, le formulaire *et* le tableau : séparer en Server Component (fetch + orchestration) + composants enfants dédiés à l'affichage (`MembreTable`, `MembreCard`, `MembreForm`) + Server Action pour la mutation.
- **Réutilisable entre plusieurs pages** → `components/<domaine>/` (ex. `components/membres/membre-card.tsx`, `components/membres/statut-badge.tsx`).
- **Spécifique à une seule route** → colocalisé dans un dossier privé `_components/` du segment (convention Next.js, non routable — voir `project-structure.md`), pas dans `components/` global.
- Un fichier `lib/actions/<domaine>.ts` par domaine (§Architecture). S'il dépasse ~200 lignes, scinder par sous-opération plutôt que garder un fichier fourre-tout : `lib/actions/membres/create.ts`, `update.ts`, `delete.ts`, `import.ts`.
- Extraire toute logique métier (calcul de statut, dédoublonnage, formatage) hors des composants et des Server Actions vers `lib/<domaine>.ts` — les composants ne font que de l'orchestration/affichage, les Server Actions ne font que valider + appeler `lib/` + revalider.

## Conventions Next.js (spécifiques à cette version, next 16.3.4 — voir `node_modules/next/dist/docs/`)

- **`proxy.ts` remplace `middleware.ts`** depuis Next.js 16 (même fonctionnalité, nouveau nom/fichier). Ne pas créer `middleware.ts`.
- **Cache Components désactivé** (`cacheComponents` absent de `next.config.ts`) — décision délibérée : cette appli est un dashboard interne authentifié où quasi tout est dynamique par utilisateur (aucune page publique/partagée à mettre en cache). Ne pas l'activer sans une vraie page candidate au cache statique — sinon c'est de la complexité (`use cache`, `<Suspense>` partout) sans bénéfice.
- Mutations via **Server Actions** (`'use server'`), pas de `fetch` vers sa propre API interne. Exception : `@tanstack/react-query` peut orchestrer une Server Action côté client (`useMutation({ mutationFn: monServerAction })`) quand on a besoin de retry/polling/état de chargement fin — ce n'est pas un appel réseau vers une API, juste un wrapper client autour de la même Server Action.
- Auth : DAL (`lib/auth/dal.ts`) avec `verifySession()` mémoïsé par `React.cache`, appelé en haut de chaque page/layout protégé et dans chaque Server Action sensible.
- Session cookie : `httpOnly`, `secure`, `sameSite: 'lax'`. Durée courte (~30 min) et **rafraîchie à chaque requête authentifiée** dans `proxy.ts` (sliding expiration) — c'est ce qui réalise la "déconnexion automatique après inactivité" du §18, pas un cookie longue durée.

## Packages (à installer seulement quand la fonctionnalité correspondante démarre — pas d'un coup)

| Besoin | Choix | Pourquoi |
|---|---|---|
| ORM / BDD | `prisma` + `@prisma/client`, PostgreSQL | Recommandé par le cahier des charges, migrations versionnées |
| Session | `jose` | Signature/vérification JWT du cookie de session, léger, recommandé par la doc Next.js auth |
| Mot de passe | `bcryptjs` | Hash, pur JS (pas de build natif à gérer sous Windows) |
| Validation | `zod` | Schémas de formulaire, recommandé par la doc Next.js |
| Import Excel (.xlsx **et** .xls) | SheetJS, installé **depuis leur CDN** (`https://cdn.sheetjs.com`), pas `xlsx` sur npm | Le paquet `xlsx` publié sur npm est figé à une vieille version (0.18.5) avec des CVE connues — SheetJS distribue les versions à jour hors npm depuis leur propre registre. Vérifier l'URL de tarball actuelle sur sheetjs.com au moment de l'installer. `exceljs` ne lit pas le `.xls` legacy (BIFF), donc à écarter si le `.xls` doit vraiment être supporté |
| Fiche individuelle imprimable | Aucun paquet — feuille de style d'impression (`@media print`) + `window.print()` | C'est ce que fait le design (`PrintSheet`) ; le navigateur sait déjà générer un PDF depuis une page imprimable ("Enregistrer en PDF" dans la boîte d'impression), pas besoin de générer le PDF côté serveur pour ça |
| Export PDF de listes (§15, si un vrai besoin serveur apparaît) | `@react-pdf/renderer` (à confirmer) | Seulement si l'export en masse (liste de fiches, pas une fiche seule) doit produire un PDF côté serveur sans passer par le navigateur — **vérifier la compatibilité React 19.2 à l'installation** ; repli sur `pdf-lib` si le peer range bloque |
| Export CSV | aucun paquet — construction de la chaîne CSV à la main | Format trivial, le stdlib suffit (règle YAGNI) |
| Graphiques dashboard | `recharts` | Standard avec shadcn/ui charts, suffisant pour le `BarChart` du design (arrivées par mois/semaine) |
| Tableaux (membres, serviteurs, import) | `@tanstack/react-table` + le composant `Table` shadcn/du design system pour le rendu | Tri, sélection multiple et pagination déjà présents dans les maquettes (`MembersList`, `Departments`) — TanStack Table gère la logique de colonnes/lignes, le design system fournit le HTML/CSS (`data-slot="table"` etc.). **Répartition avec `nuqs` ci-dessous : `nuqs` possède l'état de recherche/filtre (dans l'URL), TanStack Table possède le tri/la sélection/la pagination.** Pagination **client** uniquement (812 lignes max actuellement) — pas de pagination serveur tant que le volume ne l'impose pas |
| Icônes | `lucide-react` | Les noms d'icônes du design (`users-round`, `hand-heart`, `file-spreadsheet`...) sont des icônes Lucide ; le composant `Icon` du design system en est un wrapper |
| UI | `shadcn/ui` (new-york, déjà sur Tailwind v4) | Voir section shadcn/ui ci-dessous — le design system est explicitement construit dessus |
| Formulaires | `<form>` natif + Server Actions + `useActionState`, **pas** react-hook-form | Le formulaire d'inscription (§6) a beaucoup de champs mais une seule branche conditionnelle simple ("Si Oui") — gérable en state React basique. Ajouter react-hook-form seulement si l'UX de validation live devient un vrai problème |
| État de recherche/filtre dans l'URL | `nuqs` | Recherche avancée (§13) et filtres de liste (statut, département, niveau...) doivent être partageables/bookmarkables — `nuqs` donne des hooks typés au-dessus de `searchParams` sans réinventer le parsing à la main |
| Cache client + états async pour les flux interactifs uniquement | `@tanstack/react-query` | **Pas** utilisé pour les pages CRUD classiques (Server Components suffisent) — réservé à l'import Excel (aperçu multi-étapes sur un Route Handler) et au rafraîchissement périodique des compteurs du tableau de bord. Voir la note dans Conventions Next.js sur son usage avec les Server Actions |

## Source du design (maquette Claude Design)

Deux projets Claude Design, lus via l'outil `DesignSync` (méthodes `list_files`/`get_file`, lecture seule pour nous) :

- **UI Kit "Dashboard Oros single page"** (`projectId 384c445b-355f-4eff-8a36-bda412684d27`) : le click-through complet (`app/OROS MEMBERS.html` + `App.jsx`, `Dashboard.jsx`, `Departments.jsx`, `ImportExcel.jsx`, `Login.jsx`, `MemberFiche.jsx`, `MemberForm.jsx`, `MembersList.jsx`, `Profil.jsx`, `Shell.jsx`, `data.js` avec les fausses données). C'est la référence pour les écrans et le comportement.
- **"OROS Members Design System"** (`projectId fc0e3eae-b2e1-43fc-9c90-5dcfc7858d9e`) : les **vraies sources** des composants — `components/ui/*.jsx` (primitives) et `components/oros/*.jsx` (composants métier), chacune avec un `.d.ts` et un `.prompt.md` qui documente le comportement voulu, plus `tokens/*.css`, `base/*.css`, `guidelines/*.card.html` (référence visuelle par sujet : couleurs, typo, statuts...).

**Toujours lire les sources dans le projet Design System, jamais le `_ds_bundle.js` compilé** (192 Ko minifié, illisible et inutile à modifier).

## shadcn/ui — confirmé par le design lui-même

`tokens/shadcn.css` du Design System le dit explicitement : *"OROS Members is built on shadcn/ui (new-york, Tailwind v4 / v4 registry)"*. Ce fichier mappe la palette OROS sur les noms de variables shadcn exacts (`--primary`, `--muted-foreground`, `--sidebar`, etc. en oklch) — un `npx shadcn add <composant>` hérite donc déjà du thème OROS sans reprise.

- Initialiser avec `npx shadcn@latest init` (style new-york, Tailwind v4 déjà en place), puis copier `tokens/shadcn.css` (et les autres fichiers de `tokens/`/`base/` du Design System) dans `app/globals.css` — ne pas retaper les valeurs à la main.
- Primitives déjà spécifiées dans le Design System (`components/ui/`), à installer via `npx shadcn add <nom>` puis comparer au `.jsx`/`.prompt.md` fourni pour les ajustements OROS : Alert, Avatar, Badge, Breadcrumb, Button, Card, Checkbox, Dialog, DropdownMenu, Empty, Field, Input, Kbd, Label, NativeSelect, Pagination, Progress, RadioGroup, Separator, Skeleton, Switch, Table, Tabs, Textarea, Tooltip. Ne pas réinventer ces composants — porter les sources fournies.
- Composants métier OROS (`components/oros/` dans le Design System → `components/oros/` dans le repo Next.js), construits sur les primitives ci-dessus : `AppShell`/`Sidebar`/`Topbar`/`Page`/`PageHeader` (layout), `StatCard`, `BarChart`/`Legend`/`Meter`, `StatusBadge` (assiduité + parcours, vocabulaire figé — voir §Deux axes distincts), `MemberIdentity`/`MemberPhoto`, `FilterBar`/`SearchField`/`FilterChip`, `DefinitionList`/`SectionTitle`, `SpiritualTimeline`, `PrintSheet`.
- **Exception au pattern `Form`/`FormField` de shadcn** : le design n'utilise pas react-hook-form — il compose `Field`/`FieldGrid` + primitives natives (`Input`, `NativeSelect`...) directement, ce qui confirme le choix déjà pris dans ce fichier (voir tableau Packages).
- Ordre de portage recommandé (voir aussi Sub-agents) : tokens CSS → primitives `components/ui/` → composants métier `components/oros/` → écrans. Ne pas lancer plusieurs agents `dev-frontend` en parallèle sur des écrans tant que la couche composants n'existe pas, sous peine que chacun réinvente sa propre variante de `StatusBadge`.

## Sécurité (§18 du cahier des charges)

- Connexion obligatoire, mot de passe hashé (`bcryptjs`), jamais en clair même en base.
- Déconnexion automatique après inactivité : cookie de session à courte durée + rafraîchi à chaque requête (voir Conventions ci-dessus), pas un cookie de 7 jours.
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
