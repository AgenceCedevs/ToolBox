# 04 - Base de données
Ce module installe une base de données PostgreSQL via Docker, initialise le schéma SQL et configure le pool de connexions côté backend. Une fois l’ensemble en place, le backend est automatiquement relié à la base de données.

À la fin de ce module :

- Docker exécute un conteneur PostgreSQL accessible sur le port 5432.
- La route /api/health teste la connexion à la base de données.
- Le terminal affiche 🟢 Base de données connectée au démarrage du serveur.
- pgAdmin est accessible sur http://localhost:5050.
<!-- ------------------------------------ -->
# 01 - server > Créer la structure database
Créer le dossier server/src/database/ et les fichiers avec touch. Le contenu sera collé dans l'éditeur aux étapes suivantes.

▷ Créer les dossiers et fichiers vides.

```bash

mkdir -p server/src/database
touch server/src/database/client.ts
touch server/src/database/init-db.ts
```
<!-- ------------------------------------ -->
# 02 - server > database > script > Remplir schema.sql
Ce fichier définit la structure initiale de la base de données. Il sera exécuté lors de l'initialisation via npm run db:init.

▷ Ouvrir le fichier database/script/schema.sql et coller le contenu suivant.

```sql
-- ── Extensions ───────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Table users ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
	id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
	email      VARCHAR(255) UNIQUE NOT NULL,
	password   VARCHAR(255) NOT NULL,
	name       VARCHAR(100),
	avatar     VARCHAR(500),
	role       VARCHAR(20) DEFAULT 'free' CHECK (role IN ('free', 'premium', 'admin')),
	created_at TIMESTAMP DEFAULT NOW(),
	updated_at TIMESTAMP DEFAULT NOW()
);

-- ── Index ─────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ── Trigger updated_at ────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Utilisateur Lambda ────────────────────────────────
INSERT INTO users (email, password, name, avatar, role)
VALUES (
	'user@example.com',
	'$2b$10$hashed_password_example_here',
	'John Doe',
	'https://via.placeholder.com/150',
	'free'
)
ON CONFLICT (email) DO NOTHING;
```
🔵 Info
Ce schéma crée une table users de base avec les champs essentiels. Des tables supplémentaires seront ajoutées plus tard dans les modules suivants.

<!-- ------------------------------------ -->
# 03 - server > src > database > Remplir client.ts
Le fichier client.ts exporte un pool de connexion PostgreSQL. Il est importé par tous les fichiers qui ont besoin d'accéder à la base de données.

▷ Ouvrir le fichier server/src/database/client.ts et coller le contenu suivant.

```typescript

import pg from "pg";

const { Pool } = pg;

const host = process.env.PGHOST || "localhost";

const connectionString = `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD || ""}@${host}:${process.env.PGPORT || 5432}/${process.env.PGDATABASE}`;

const pool = new Pool({
	connectionString,
});

pool.on("error", (err) => {
	console.error("🔴 Erreur inattendue sur le pool PostgreSQL :", err.message);
});

export default pool;
```
🟡 Attention
Les variables d'environnement suivent le standard PostgreSQL :PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE. Ces valeurs sont définies dans server/.env.

<!-- ------------------------------------ -->
# 04 - server > src > database > Remplir init-db.ts
Ce script lit le fichier schema.sql et l'exécute sur la base de données au démarrage. Il sera lancé avec npm run db:init.

▷ Ouvrir le fichier server/src/database/init-db.ts et coller le contenu suivant.

```typescript

import { execSync, spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import "dotenv/config";
import pg from "pg";

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const schemaPath = path.resolve(__dirname, "../../database/script/schema.sql");
const sql = fs.readFileSync(schemaPath, "utf8");

// ── Docker ────────────────────────────────────────────
await new Promise<void>((resolve, reject) => {
  console.log("\n=========================================");
  console.log("🔵 DOCKER");
  console.log("=========================================");

  try {
    const result = execSync("docker compose ps --format json", {
      encoding: "utf8",
    });
    const containers = result
      .trim()
      .split("\n")
      .filter(Boolean)
      .map((l) => JSON.parse(l));
    const allHealthy =
      containers.length > 0 &&
      containers.every((c) => c.Health === "healthy" || c.State === "running");
    if (allHealthy) {
      for (const c of containers) console.log(`🟢 ${c.Name} déjà actif`);
      console.log("=========================================\n");
      return resolve();
    }
  } catch {}

  const proc = spawn("docker", ["compose", "up", "-d", "--wait"], {
    stdio: ["inherit", "pipe", "pipe"],
  });

  proc.stdout?.on("data", (data: Buffer) => {
    const lines = data
      .toString()
      .split("\n")
      .filter((l) => l.trim());
    for (const line of lines) {
      if (
        line.includes("✔") ||
        line.includes("Healthy") ||
        line.includes("Running")
      ) {
        const name = line
          .replace(/[✔✗[\]]/g, "")
          .replace(/Healthy|Running|Started/g, "")
          .trim()
          .split(" ")[0];
        console.log(`🟢 ${name} prêt`);
      }
    }
  });

  proc.on("close", (code: number) => {
    if (code === 0) {
      console.log("🟢 Tous les conteneurs sont prêts");
      console.log("=========================================\n");
      resolve();
    } else {
      console.error("🔴 Erreur lors du démarrage Docker");
      console.log("=========================================\n");
      reject(new Error("Docker failed"));
    }
  });
});

// ── Init BDD ──────────────────────────────────────────
console.log("\n=========================================");
console.log("🔵 INIT BASE DE DONNÉES");
console.log("=========================================");

const pghost = process.env.PGHOST || "localhost";
const pgport = Number(process.env.PGPORT) || 5432;
const pguser = process.env.POSTGRES_USER;
const pgpass = process.env.POSTGRES_PASSWORD;
const pgdb = process.env.PGDATABASE;

if (!pguser || !pgpass || !pgdb) {
	console.error(
		"🔴 Variables d'environnement manquantes (POSTGRES_USER, POSTGRES_PASSWORD, PGDATABASE)",
	);
	process.exit(1);
}

console.log(`Connexion : ${pguser}@${pghost}:${pgport}/${pgdb}`);

const initPool = new Pool({
  host: pghost,
  port: pgport,
  user: pguser,
  password: pgpass,
  database: pgdb,
});

const IGNORE_CODES = new Set(["42710", "42P07", "42701", "42P06"]);

interface PgError extends Error {
  code: string;
}

function isPgError(err: unknown): err is PgError {
  return err instanceof Error && "code" in err;
}

function splitSql(rawSql: string): string[] {
  const statements: string[] = [];
  let current = "";
  let inDollarQuote = false;
  let dollarTag = "";
  let i = 0;

  while (i < rawSql.length) {
    if (!inDollarQuote && rawSql[i] === "$") {
      const end = rawSql.indexOf("$", i + 1);
      if (end !== -1) {
        const tag = rawSql.slice(i, end + 1);
        inDollarQuote = true;
        dollarTag = tag;
        current += tag;
        i = end + 1;
        continue;
      }
    } else if (inDollarQuote && rawSql.startsWith(dollarTag, i)) {
      current += dollarTag;
      i += dollarTag.length;
      inDollarQuote = false;
      dollarTag = "";
      continue;
    }

    if (!inDollarQuote && rawSql[i] === ";") {
      const trimmed = current.trim();
      if (trimmed.length > 0) statements.push(trimmed);
      current = "";
      i++;
      continue;
    }

    current += rawSql[i];
    i++;
  }

  const trimmed = current.trim();
  if (trimmed.length > 0) statements.push(trimmed);

  return statements;
}

const client = await initPool.connect();
try {
  const statements = splitSql(sql);

  for (const statement of statements) {
    try {
      await client.query(statement);
    } catch (err) {
      if (isPgError(err) && IGNORE_CODES.has(err.code)) {
        console.warn(`🟡  Ignoré (déjà existant) : ${err.message}`);
      } else {
        throw err;
      }
    }
  }
  console.log("🟢 Schéma appliqué avec succès.");
} catch (err) {
  console.error("🔴 Erreur lors de l'initialisation :", err);
  process.exit(1);
} finally {
  client.release();
  await initPool.end();
  console.log("🟢 Connexion fermée.");
  console.log("=========================================\n");
}
```
<!-- ------------------------------------ -->
# 05 - racine > Ajouter le script db:init au package.json
▷ Ajouter le script db:init au package.json racine.

```bash
npm pkg set scripts.db:init="npx tsx server/src/database/init-db.ts"
```
<!-- ------------------------------------ -->
# 06 - server > src > routes > Mettre à jour health.router.ts
Mettre à jour la route health pour qu'elle teste également la connexion à la base de données.

▷ Ouvrir le fichier server/src/routes/health.router.ts et remplacer le contenu existant par le contenu suivant.

```typescript

import type { Request, Response } from "express";
import { Router } from "express";
import pool from "../database/client.js";

const healthRouter = Router();

healthRouter.get("/", async (_req: Request, res: Response) => {
	try {
		await pool.query("SELECT 1");
		res.json({
			status: "ok",
			message: "Server is running",
			db: "connected",
			timestamp: new Date().toISOString(),
		});
	} catch {
		res.status(500).json({
			status: "error",
			message: "Server is running",
			db: "disconnected",
			timestamp: new Date().toISOString(),
		});
	}
});

export default healthRouter;
```
<!-- ------------------------------------ -->
# 07 - server > src > Mettre à jour index.ts
Mettre à jour le fichier server/src/index.ts pour tester la connexion à la base de données au démarrage.

▷ Ouvrir le fichier server/src/index.ts et remplacer le contenu existant par le contenu suivant.


```typescript

import cors from "cors";
import "dotenv/config";
import express from "express";
import pool from "./database/client.js";
import healthRouter from "./routes/health.router.js";

const BLUE = "[34m";
const RESET = "[0m";

const app = express();
const PORT = process.env.PORT || 3310;
const NODE_ENV = process.env.NODE_ENV || "development";
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// ── Middlewares ───────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
	cors({
		origin: CLIENT_URL,
		credentials: true,
	}),
);

// ── Routes ────────────────────────────────────────────
app.use("/api/health", healthRouter);

// ── Démarrage ─────────────────────────────────────────
app.listen(PORT, async () => {
	console.log("\n=========================================");
	console.log("🔵 SERVER BACKEND");
	console.log("=========================================");
	console.log(`🔵 NODE_ENV : ${NODE_ENV}`);
	console.log(
  `🟢 Serveur démarré sur : ${BLUE}http://localhost:${PORT}${RESET}`,
);

	try {
		await pool.query("SELECT 1");
		console.log("🟢 Base de données connectée");
	} catch (err) {
		console.error("🔴 Base de données non connectée :", err);
	}

	console.log("=========================================\n");
});

export default app;
```
<!-- ------------------------------------ -->
# 08 - racine > Vérifier avec Biome
Avant de lancer le serveur, s'assurer que le code est correct selon Biome.

▷ Corriger les éventuels problèmes de format et vérifier qu'aucune erreur ne subsiste.

```bash
npm run fix
🔵 Sortie attendue
> appStarter@1.0.0 fix
> biome lint --write . && biome format --write .

Checked 40 files in 86ms. No fixes applied.
Formatted 40 files in 34ms. No fixes applied.
```
🟡 Attention
Si Biome signale des erreurs, les corriger avec npm run fix avant de continuer.
<!-- ------------------------------------ -->
# 09 - racine > Ajouter le script launcher liveApp
Le script liveApp enchaîne les différents scripts de package.json et simule un environnement de production en local.

```markdown

- Nettoyage des services PostgreSQL en arrière-plan (postgresql-x64-16, postgresql-x64-15, pgAdmin4)
- Fermeture des processus actifs (postgres.exe, pgAdmin4.exe, docker-proxy.exe)
- Libération des ports critiques (5432 pour PostgreSQL, 5050 pour pgAdmin)
- Arrêt et suppression de tous les conteneurs Docker existants
- Exécution de docker system prune pour nettoyer les volumes et images inutilisées
- Suppression des réseaux Docker orphelins
- Démarrage de Docker Desktop via le fichier exécutable
- Attente de la disponibilité de Docker (jusqu'à 40 tentatives avec intervalle de 3 secondes)
- En cas d'échec : réparation forcée de WSL (wsl --shutdown, désenregistrement et mise à jour)
- Redémarrage de Docker après réparation WSL
- Exécution de docker compose down pour libérer les ports et réseaux
- Détection et fermeture des conteneurs parasites sur les ports critiques
- Build de la web app en mode production avec npm run build -w web
- Lancement des conteneurs Docker via docker compose up -d --build
- Attente que PostgreSQL soit prêt à accepter les connexions (jusqu'à 40 tentatives avec intervalle de 2,5 secondes)
- Stabilisation de la base de données (délai de 3 secondes)
- Initialisation du schéma de données avec npm run db:init
- Lancement du serveur de développement (npm run dev -w server)
- Lancement de l'application web de développement (npm run dev -w web)
- Gestion propre de l'arrêt des processus au signal SIGINT/SIGTERM
```
▷ Ajouter le script liveApp au package.json racine.

```bash

npm pkg set scripts.liveApp="npx tsx setup/liveApp.ts"
```
<!-- ------------------------------------ -->
# 10 - racine > Lancer le launcher liveApp
▷ Depuis la racine, lancer liveApppour démarrer l'environnement complet.

```bash
npm run liveApp
```
🔵 Sortie attendue
```text
> appStarter@1.0.0 liveApp
> npx tsx setup/liveApp.ts

══════════════════════════════════════════════════
🔵 LAUNCHER - liveApp
   Simulator live Local
══════════════════════════════════════════════════
Étape 0
🔵 Nettoyage des ports et services...
🟢 Port 5050 libéré
🟢 Nettoyage terminé.
══════════════════════════════════════════════════
Étape 1
🔵 Nettoyage des processus Docker...
🟡 Docker Desktop n'est pas actif. Le nettoyage ignoré.
🔵 Note : Docker sera démarré à l'étape suivante.
══════════════════════════════════════════════════
Étape 2
🔵 Démarrage de Docker Desktop...
🔵 Initialisation en cours...
══════════════════════════════════════════════════
Étape 3
🔵 Vérification de l'état de Docker...
🟡 Docker en attente (1/40)
🟡 Docker en attente (2/40)
🟢 Docker est opérationnel !
🔵 Libération des ports et purge du cache réseau...
🔵 Parasite détecté sur port 5432 (ff2d23f54ef7). Fermeture...
🔵 Parasite détecté sur port 5050 (3f5fed792fdb). Fermeture...
🟢 Réseaux et ports nettoyés avec succès.
══════════════════════════════════════════════════
Étape 4
🔵 Compilation des applications...

> web@0.0.0 build
> tsc -b && vite build

vite v8.0.3 building client environment for production...
✓ 31 modules transformed.
computing gzip size...
dist/index.html                   0.47 kB │ gzip:   0.30 kB
dist/assets/index-ruwUTP7m.css   12.93 kB │ gzip:   2.93 kB
dist/assets/index-BKR2AEY9.js   505.30 kB │ gzip: 153.28 kB

✓ built in 506ms
[plugin builtin:vite-reporter]
(!) Some chunks are larger than 500 kB after minification. Consider:
- Using dynamic import() to code-split the application
- Use build.rolldownOptions.output.codeSplitting to improve chunking: https://rolldown.rs/reference/OutputOptions.codeSplitting
- Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.
🟢 Builds terminés avec succès
══════════════════════════════════════════════════
Étape 5
🔵 Déploiement des conteneurs...
[+] Running 4/4
 ✔ Network appStarter_default       Created                                                      0.1s
 ✔ Volume appStarter_postgres_data  Created                                                      0.0s
 ✔ Container appStarter_db          Started                                                      0.8s
 ✔ Container appStarter_pgadmin     Started                                                      1.0s
🟢 Services démarrés
══════════════════════════════════════════════════
Étape 6
🔵 Attente de la base de données...
🟡 Base de données indisponible (1/40)
🟢 PostgreSQL est prêt à accepter les connexions !
🔵 Stabilisation de la base de données...
🔵 Initialisation du schéma de données...

> appStarter@1.0.0 db:init
> npx tsx server/src/database/init-db.ts


=========================================
🔵 DOCKER
=========================================
🟢 Tous les conteneurs sont prêts
=========================================


=========================================
🔵 INIT BASE DE DONNÉES
=========================================
Connexion : cedevs@localhost:5432/appStarter
🟢 Schéma appliqué avec succès.
🟢 Connexion fermée.
=========================================


🟢 Pipeline validé en 42.5s
══════════════════════════════════════════════════
Étape 7
🔵 Lancement de l'environnement Dev

🔵 [Web] Démarrage...

🔵 [Server] Démarrage...

> web@0.0.0 dev
> vite


> server@1.0.0 dev
> tsx watch src/index.ts


=========================================
🔵 CLIENT WEB
=========================================
🔵 NODE_ENV : development
🟢 Client démarré sur :  http://localhost:5173
🟢 Proxy API vers :  http://localhost:3310
=========================================

  ➜  press h + enter to show help

=========================================
🔵 SERVER BACKEND
=========================================
🔵 NODE_ENV : development
🟢 Serveur démarré sur :  http://localhost:3310
🟢 Base de données connectée
=========================================
```
<!-- ------------------------------------ -->
# 11 - racine > Initialisation et vérification du monorepo
Cette étape valide l'intégrité complète du monorepo. Elle contrôle la structure des répertoires, la conformité des package.json et la connectivité des services Docker.

🟡 Attention
Le script de vérification doit être lancé dans un second terminal pour le tester en conditions réelles, pendant que le launcher tourne dans le premier.

```markdown

- Lecture du package.json pour récupérer le nom et la version du projet
- Vérification des versions de Node.js, npm, Biome et détection des frameworks (React, Express, TypeScript, Vite)
- Vérification que Docker et Docker Compose sont installés
- Test de la connexion à PostgreSQL et vérification de l'existence de la table users
- Vérification de l'existence de server/.env et server/src/index.ts
- Vérification que les packages express et pg sont installés côté serveur
- Vérification de la structure du frontend web (web/, fichiers TypeScript/TSX)
- Vérification de la structure du frontend mobile (mobile/)
- Vérification de l'existence de docker-compose.yml et .gitignore
- Détection de la structure monorepo (au moins 2 package.json)
- Test de l'accessibilité de l'API backend (/api/health sur le port 3310)
- Vérification de la cohérence des ports entre server/.env et web/.env
- Vérification de la cohérence de la base de données entre les configurations
- Vérification que JWT_SECRET est robuste et que NODE_ENV est défini
- Vérification que .env est inclus dans .gitignore
- Vérification que .env.sample existe
- Vérification que CLIENT_URL pour CORS n'est pas un wildcard (*)
- Exécution de biome check sur tous les fichiers
- Vérification de la compilation TypeScript avec tsc --noEmit
- Vérification de l'existence des scripts npm (dev, build, start)
- Vérification qu'il n'y a pas de console.log dans server/src
- Exécution des tests avec npm test sur chaque workspace
- Vérification que Git est initialisé (.git/ existe)
- Mesure du temps de réponse de l'API (/api/health)
- Mesure de la taille du build web (web/dist)
- Génération d'un rapport Markdown détaillé avec CSS intégré
- Génération d'un pipeline CI GitHub Actions (.github/workflows/ci.yml)
- Création d'un README avec les résultats du rapport
```
▷ Ouvrir un second terminal et lancer le script de vérification depuis la racine du monorepo.

```bash
npx tsx setup/verify_monorepo/verify_monorepo.ts
```
🔵 Info
Un rapport détaillé est généré en Markdown dans setup/verify_monorepo/verify-report-date.md, mais aussi à la racine du monorepo pour documenter le dépôt GitHub.
Le rapport peut être converti en PDF déjà stylé avec l'extension markdown-PDF.

🟢 Tous les tests passent (100%) : "MONOREPO ENTIÈREMENT FONCTIONNEL !" → le monorepo est prêt à être utilisé.

🔴 Certains tests échouent : consulter les détails en rouge pour identifier le problème (fichier manquant, port occupé, variable d'environnement non définie, etc.)

🔵 Info
- Frontend web : http://localhost:5173.
- Backend API : http://localhost:3310/api/health.
- pgAdmin : http://localhost:5050. Identifiants : définis dans le fichier .env racine.

🔵 Sortie attendue
```text
╔═════════════════════╗
║ CODE QUALITY REPORT ║
╚═════════════════════╝

Heure : 01/04/2026 14:00:00

ℹ  INFORMATION DU PROJET
--------------------------------------------------
  Nom du projet : appStarter ... ✓ OK
  Version : 1.0.0 ... ✓ OK
  Node.js ... ✓ OK
  npm ... ✓ OK
  Biome ... ✓ OK

🐳  VÉRIFICATION DOCKER
--------------------------------------------------
  Docker installé ... ✓ OK
  Docker Compose ... ✓ OK
  PostgreSQL en cours d'exécution ... ✓ OK

🗄  VÉRIFICATION BASE DE DONNÉES
--------------------------------------------------
  Connexion à PostgreSQL ... ✓ OK
  Table 'users' existe ... ✓ OK

⚙  VÉRIFICATION SERVER
--------------------------------------------------
  server/.env ... ✓ OK
  server/src/index.ts ... ✓ OK
  Package 'express' installé ... ✓ OK
  Package 'pg' installé ... ✓ OK

🎨  VÉRIFICATION FRONTEND (Web)
--------------------------------------------------
  Dossier web/ ... ✓ OK
  Fichiers TypeScript/TSX ... ✓ OK
  package.json ... ✓ OK

🎨  VÉRIFICATION FRONTEND (Mobile)
--------------------------------------------------
  Dossier mobile/ ... ✓ OK
  package.json ... ✓ OK

⚙  VÉRIFICATION CONFIGURATION
--------------------------------------------------
  docker-compose.yml ... ✓ OK
  .gitignore ... ✓ OK

📁  VÉRIFICATION MONOREPO
--------------------------------------------------
  Détection monorepo : 4 package.json ... ✓ OK

🔌  VÉRIFICATION API
--------------------------------------------------
  Serveur backend ... ✓ OK

🚀  LIAISONS ENTRE WORKSPACES
--------------------------------------------------
  server/.env présent ... ✓ OK
  web/.env présent ... ✓ OK
  .env (racine) présent ... ✓ OK
  Cohérence PORT server/.env vs VITE_API_URL web/.env ... ✓ OK (port 3310)
  Cohérence PGDATABASE server/.env vs .env racine ... ✓ OK (appStarter)  server → DB (SELECT 1) ... ✓ OK
  server → DB (table users) ... ✓ OK
  web → server (GET /api/health) ... ✓ OK
  express installé (server) ... ✓ OK
  pg installé (server) ... ✓ OK
  react installé (web) ... ✓ OK
  React Native installé (mobile) ... ⚠ Non configuré (ignoré)
  Cloudinary configuré (server/.env) ... ⚠ Non configuré (ignoré)
  EmailJS configuré (server/.env) ... ⚠ Non configuré (ignoré)

⚠  SÉCURITÉ
--------------------------------------------------
  JWT_SECRET robuste ... ✓ OK
  NODE_ENV défini (server) ... ✓ OK
  .env dans .gitignore ... ✓ OK
  .env.sample présent ... ✓ OK
  CORS CLIENT_URL non wildcard ... ⚠ Non configuré (ignoré)

⚙  QUALITÉ DU CODE
--------------------------------------------------
  Biome check ... ✓ OK (40 fichiers)
  TypeScript (tsc --noEmit) ... ✓ OK
  Script "dev" dans package.json ... ✓ OK
  Script "dev" dans server/package.json ... ✓ OK
  Script "build" dans server/package.json ... ✓ OK
  Script "start" dans server/package.json ... ✓ OK
  Script "dev" dans web/package.json ... ✓ OK
  Script "build" dans web/package.json ... ✓ OK
  Pas de console.log dans server/src ... ✓ OK

⚙  TESTS
--------------------------------------------------
  npm test (racine) ... ✓ OK
  npm test (server) ... ✓ OK
  npm test (web) ... ✓ OK

📁  GIT / CI
--------------------------------------------------
  Git initialisé (.git/) ... ✓ OK

📊  PERFORMANCE
--------------------------------------------------
  Temps de réponse /api/health ... ✓ OK (50ms)
  Taille dist/ (web) ... ✓ OK (513K)
  Pipeline CI (.github/workflows/ci.yml) ... ⬡ GÉNÉRÉ

✓ Rapport : setup/verify_monorepo/verify-report-2026-03-27.md

✓ README : README.md
  README.md ... ⬡ GÉNÉRÉ
  Rapport setup/verify_monorepo/verify-report-2026-03-27.md ... ⬡ GÉNÉRÉ
════════════════════════════════════════════════════════════

📊  RÉSUMÉ

  ✓ Réussis   : 53
  ✗ Échoués   : 0
  ⚠ Ignorés   : 4
  ⬡ Générés   : 3
  >>Taux      : 93%

════════════════════════════════════════════════════════════
🎉  MONOREPO ENTIÈREMENT FONCTIONNEL !
════════════════════════════════════════════════════════════
```
<!-- ------------------------------------ -->
# 12 - racine > Sauvegarder les modifications
▷ Ajouter les fichiers et commiter les modifications.

```bash
git add .
git commit -m "feat: description de vos modifications"
```
