# OROS MEMBERS (SGMO)

Application de gestion des membres, serviteurs et responsables de l'Église OROS.
Next.js 16 (App Router, Server Actions) · Prisma 7 · PostgreSQL · Better Auth · shadcn/ui · Tailwind v4.

Deux comptes fixes (pas d'inscription publique) : **Pasteur** (accès total) et **Assistante** (tout sauf la suppression définitive).

## Prérequis

- Node.js 20+ et npm
- Docker (pour PostgreSQL local)

## Lancer l'application

```bash
# 1. Dépendances
npm install

# 2. Variables d'environnement
cp .env.example .env
#    puis remplacer BETTER_AUTH_SECRET par un secret généré :
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# 3. Base de données (PostgreSQL sur le port hôte 5433)
docker compose up -d

# 4. Client Prisma + schéma
npx prisma generate --config prisma7.config.ts
npx prisma db push --config prisma7.config.ts

# 5. (optionnel) Données fictives de la maquette
npm run db:seed

# 6. Créer les deux comptes (une seule fois)
npx auth create-admin --config lib/auth/auth.ts --email pasteur@oros.local --password '<mdp>' --name Pasteur --role pasteur
npx auth create-admin --config lib/auth/auth.ts --email assistante@oros.local --password '<mdp>' --name Assistante --role assistante

# 7. Démarrer
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000) et se connecter avec l'un des comptes créés.

> `BETTER_AUTH_URL` doit valoir `http://localhost:3000` : si `next dev` démarre sur un autre port, la connexion est refusée (origine invalide). Libérer le port 3000 avant de lancer.

## Scripts

| Commande | Rôle |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` / `npm start` | Build et serveur de production |
| `npm run lint` | ESLint |
| `npm run typecheck` | Vérification TypeScript |
| `npm run db:seed` | Données fictives (jamais de vraies données de membres) |

## Documentation

Conventions, architecture et décisions : voir [`CLAUDE.md`](./CLAUDE.md).
