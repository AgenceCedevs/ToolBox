# 04 - Base de données
Ce module démarre PostgreSQL via Docker Compose, initialise le schéma SQL de façon relançable et configure le pool de connexions du backend. Les noms, identifiants et ports proviennent des fichiers `.env` créés au module 01 ; les valeurs indiquées ci-dessous sont des valeurs locales par défaut, pas des constantes à recopier dans le code.

À la fin de ce module :

- Docker exécute PostgreSQL sur le port défini par `PGPORT` dans le `.env` racine.
- La route /api/health teste la connexion à la base de données.
- Le terminal affiche 🟢 Base de données connectée au démarrage du serveur.
- pgAdmin est accessible sur le port défini par `PGADMIN_PORT` dans le `.env` racine.
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

▷ Ouvrir le fichier server/database/script/schema.sql créé au module 01 et coller le contenu suivant.

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

DROP TRIGGER IF EXISTS trigger_users_updated_at ON users;

CREATE TRIGGER trigger_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```
🔵 Info
Ce schéma crée une table users de base avec les champs essentiels. Il peut être exécuté plusieurs fois sans créer de doublons. Aucun faux compte utilisateur n'est inséré : les comptes devront être créés par le flux d'inscription, avec un mot de passe réellement haché par le serveur.

<!-- ------------------------------------ -->
# 03 - server > src > database > Remplir client.ts
Le fichier client.ts exporte un pool de connexion PostgreSQL. Il est importé par tous les fichiers qui ont besoin d'accéder à la base de données.

▷ Ouvrir le fichier server/src/database/client.ts et coller le contenu suivant.

```typescript

import "dotenv/config";
import pg from "pg";

const { Pool } = pg;

const host = process.env.PGHOST || "localhost";
const port = Number(process.env.PGPORT) || 5432;
const user = process.env.PGUSER || process.env.POSTGRES_USER;
const password = process.env.PGPASSWORD || process.env.POSTGRES_PASSWORD;
const database = process.env.PGDATABASE || process.env.POSTGRES_DB;

if (!user || !password || !database) {
	throw new Error(
		"Variables PostgreSQL manquantes : PGUSER/POSTGRES_USER, PGPASSWORD/POSTGRES_PASSWORD et PGDATABASE/POSTGRES_DB.",
	);
}

const pool = new Pool({
	host,
	port,
	user,
	password,
	database,
});

pool.on("error", (err) => {
	console.error("🔴 Erreur inattendue sur le pool PostgreSQL :", err.message);
});

export default pool;
```
🔵 Info
Le client accepte les variables standard `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`, ainsi que les noms `POSTGRES_USER`, `POSTGRES_PASSWORD` et `POSTGRES_DB` utilisés par Docker Compose et les fichiers `.env` du module 01. Les valeurs sont lues à l'exécution ; ne les inscrivez pas dans le code.

<!-- ------------------------------------ -->
# 04 - server > src > database > Remplir init-db.ts
Ce script lit le fichier schema.sql et l'exécute sur la base de données au démarrage. Il sera lancé avec npm run db:init.

▷ Ouvrir le fichier server/src/database/init-db.ts et coller le contenu suivant.

```typescript

import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import "dotenv/config";
import pg, { type PoolClient } from "pg";

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "../../..");
const schemaPath = path.resolve(
	projectRoot,
	"server/database/script/schema.sql",
);
const sql = await readFile(schemaPath, "utf8");

const host = process.env.PGHOST || "localhost";
const port = Number(process.env.PGPORT) || 5432;
const user = process.env.PGUSER || process.env.POSTGRES_USER;
const password = process.env.PGPASSWORD || process.env.POSTGRES_PASSWORD;
const database = process.env.PGDATABASE || process.env.POSTGRES_DB;

if (!user || !password || !database) {
	throw new Error(
		"Variables PostgreSQL manquantes : PGUSER/POSTGRES_USER, PGPASSWORD/POSTGRES_PASSWORD et PGDATABASE/POSTGRES_DB.",
	);
}

const initPool = new Pool({
	host,
	port,
	user,
	password,
	database,
});

function startDatabaseContainer(): Promise<void> {
	return new Promise((resolve, reject) => {
		const docker = spawn("docker", ["compose", "up", "-d", "--wait"], {
			cwd: projectRoot,
			stdio: "inherit",
		});

		docker.once("error", reject);
		docker.once("close", (code) => {
			if (code === 0) {
				resolve();
			} else {
				reject(new Error(`docker compose s'est terminé avec le code ${code}`));
			}
		});
	});
}

async function main(): Promise<void> {
	let client: PoolClient | undefined;

	try {
		console.log("\n=========================================");
		console.log("🔵 DÉMARRAGE DE LA BASE");
		console.log("=========================================");
		await startDatabaseContainer();
		console.log(`Connexion PostgreSQL : ${user}@${host}:${port}/${database}`);

		client = await initPool.connect();
		await client.query(sql);
		console.log("🟢 Schéma appliqué avec succès.");
	} catch (error) {
		console.error("🔴 Échec de l'initialisation de la base :", error);
		process.exitCode = 1;
	} finally {
		client?.release();
		await initPool.end();
		console.log("=========================================\n");
	}
}

await main();
```

`pg` transmet ici le fichier SQL complet à PostgreSQL. Ne pas découper le SQL avec une regex ou sur les points-virgules : les fonctions PL/pgSQL contiennent elles-mêmes des points-virgules et les chaînes peuvent contenir des `$`.
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
	} catch (error) {
		console.error("🔴 Échec du contrôle PostgreSQL :", error);
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
```
🔵 Sortie attendue
```text
> appStarter@1.0.0 fix
> biome lint --write . && biome format --write .

Checked 40 files in 86ms. No fixes applied.
Formatted 40 files in 34ms. No fixes applied.
```
🟡 Attention
Si Biome signale des erreurs, les corriger avec npm run fix avant de continuer.
<!-- ------------------------------------ -->
# 09 - racine > Ajouter le script launcher liveApp
Le script liveApp vérifie Docker, construit le frontend, démarre uniquement les services décrits dans le `docker-compose.yml` du projet, initialise la base et lance les serveurs de développement. Démarrez Docker Desktop avant d'exécuter le script.

```markdown

- Vérification de Docker Desktop sans arrêter d'autres services ou conteneurs
- Attente de la disponibilité de Docker (limite et intervalle configurables par variables d'environnement)
- Build du package `shared/`, puis build de la web app en mode production
- Lancement des conteneurs Docker via docker compose up -d --build
- Attente que PostgreSQL soit prêt à accepter les connexions
- Initialisation du schéma de données avec npm run db:init
- Lancement du serveur de développement (npm run dev -w server)
- Lancement de l'application web de développement (npm run dev -w web)
- Gestion propre de l'arrêt des processus au signal SIGINT/SIGTERM
```

Le launcher ne tue aucun processus, ne libère pas les ports de force, ne supprime pas de volumes et ne réinitialise pas WSL. Si un port configuré est déjà occupé, Docker Compose affiche l'erreur : arrêtez uniquement le service concerné vous-même ou choisissez un autre port dans les fichiers `.env`.
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
🔵 Exemple de sortie avec les valeurs locales par défaut
```text
> appStarter@1.0.0 liveApp
> npx tsx setup/liveApp.ts

══════════════════════════════════════════════════
🔵 LAUNCHER - liveApp
   Simulator live Local
══════════════════════════════════════════════════
Étape 1
🔵 Aucun nettoyage global Docker n'est effectué.
🟢 Les autres conteneurs et volumes sont préservés.
══════════════════════════════════════════════════
Étape 2
🔵 Vérification de Docker Desktop...
🟡 Si Docker n'est pas actif, démarrez-le manuellement puis relancez le launcher.
══════════════════════════════════════════════════
Étape 3
🔵 Vérification de l'état de Docker...
🟡 Docker en attente (1/40)
🟡 Docker en attente (2/40)
🟢 Docker est opérationnel !
══════════════════════════════════════════════════
Étape 4
🔵 Compilation des applications...

> appStarter@1.0.0 build:shared
> npm run build -w shared

... compilation de shared ...

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
🔵 INIT BASE DE DONNÉES
=========================================
Connexion PostgreSQL : <utilisateur>@<hôte>:<port>/<base>
🟢 Schéma appliqué avec succès.
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
Lancer le script dans un second terminal pendant que le launcher tourne. Il s'agit d'un diagnostic, pas d'une suite de tests applicatifs : les scripts `test` absents sont signalés comme ignorés. Vérifier les valeurs de port affichées dans le rapport avec les fichiers `.env` si elles ont été modifiées.

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
- Test de l'accessibilité de l'API backend sur le port `PORT` configuré dans `server/.env`
- Vérification de la cohérence des ports entre server/.env et web/.env
- Vérification de la cohérence de la base de données entre les configurations
- Vérification que JWT_SECRET est robuste et que NODE_ENV est défini
- Vérification que .env est inclus dans .gitignore
- Vérification que .env.sample existe
- Vérification que CLIENT_URL pour CORS n'est pas un wildcard (*)
- Exécution de biome check sur tous les fichiers
- Vérification de la compilation TypeScript avec tsc --noEmit
- Vérification de l'existence des scripts npm (dev, build, start)
- Vérification des scripts npm test quand ils existent (un script absent est ignoré ; cela ne compte pas comme un test réussi)
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

🟢 Aucun contrôle diagnostique n'a échoué : le monorepo est prêt pour les vérifications manuelles et les tests applicatifs.

🔴 Certains tests échouent : consulter les détails en rouge pour identifier le problème (fichier manquant, port occupé, variable d'environnement non définie, etc.)

🔵 Info
- Frontend web : `http://localhost:<WEB_PORT>` (`WEB_PORT` vaut 5173 par défaut dans le `.env` racine).
- Backend API : `http://localhost:<PORT>/api/health` (`PORT` vaut 3310 par défaut dans `server/.env`).
- pgAdmin : `http://localhost:<PGADMIN_PORT>` (`PGADMIN_PORT` vaut 5050 par défaut dans le `.env` racine). Identifiants définis dans ce même fichier.

🔵 Exemple de rapport avec les valeurs locales par défaut
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
  CORS CLIENT_URL non wildcard ... ✓ OK (http://localhost:5173)

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

⚙  TESTS
--------------------------------------------------
  npm test (racine) ... à configurer : aucun test n'est défini dans le module de base
  npm test (server) ... à configurer : aucun test n'est défini dans le module de base
  npm test (web) ... à configurer : aucun test n'est défini dans le module de base

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
ℹ  DIAGNOSTIC TERMINÉ — exécutez les tests applicatifs avant de conclure
════════════════════════════════════════════════════════════
```
<!-- ------------------------------------ -->
# 12 - racine > Sauvegarder les modifications
▷ Ajouter les fichiers et commiter les modifications.

```bash
git add .
git commit -m "feat: description de vos modifications"
```
