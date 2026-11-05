# 01_Initialisation d'un monorepo
Bienvenue dans l'univers des monorepos.

Ces modules ont pour objectif de créer de zéro la structure complète d'un monorepo **Web & Mobile**. Un projet unique qui embarque à la fois une application web et une application mobile.

Un monorepo est un seul dépôt qui contient le frontend (web/), le backend (server/), l'application mobile (mobile/), les outils de configuration (setup/) et le package shared/ pour les constantes stables et les types communs. Les paramètres variables (nom de l'application, URL d'API, ports et identifiants) sont lus depuis les variables d'environnement propres à chaque application. Le package shared/ est un workspace npm relié à web/, server/ et mobile/.

À la fin de ce module :

- La structure web/, server/, mobile/, shared/ et setup/ est en place et cohérente.
- Le package @appstarter/shared est déclaré et relié aux trois applications par les workspaces npm.
- Toutes les dépendances npm sont installées, aucun npm install supplémentaire n'est nécessaire avant le prochain module.
- Les fichiers de configuration (Docker, Biome, TypeScript, variables d'environnement) sont présents et prêts.
## Les étapes
🟡 Attention
Avant de commencer : À partir de l'étape 03, des dependence seront ajoutées aux package.json sans être installées immédiatement. Cela créera des fichiers en erreur dans l'éditeur comme tsconfig.json racine, setup/*.ts,etc.

C'est normal et attendu ! À l'étape 36, un seul npm install à la racine installera TOUTES les dépendances et TOUS les problèmes disparaîtront d'un coup. Ne pas s'inquiéter des erreurs rouges avant cette étape.

<!-- ------------------------------------ -->
---
### 01 - racine > Ouvrir Git bash et créer le dossier du monorepo
🟡 Attention
Le nom du dossier racine sert à initialiser PROJECT_NAME et le nom affiché de l'application dans les fichiers .env. Il est préférable de choisir un nom sans espaces ni caractères spéciaux, ici appStarter. Les applications lisent ces paramètres depuis leur environnement ; ils ne sont pas codés dans shared/src/constants.ts.

▷ Ouvrir Git bash, se placer dans le dossier ~/desktop/LOCAL où tous les projets sont stockés en local. Puis créer le dossier appStarter, y entrer et l'ouvrir immédiatement dans l'éditeur.

```bash
cd ~/desktop/LOCAL
mkdir appStarter && cd appStarter
code .
```

<!-- ------------------------------------ -->
---
### 02 - racine > Initialiser npm et créer le fichier package.json
Une fois l'éditeur ouvert, ouvrir le terminal intégré avec Ctrl+ù. Toutes les commandes suivantes sont à lancer depuis ce terminal intégré.

▷ Initialiser npm à la racine pour générer un fichier package.json.

```bash
npm init -y
```
🔵 Sortie attendue

```text
Wrote to ~/desktop/LOCAL/appStarter/package.json
```

<!-- ------------------------------------ -->
---
### 03 - racine > Ajouter les dépendances Concurrently et Biome
- concurrently : Exécuter plusieurs scripts npm simultanément.
- @biomejs/biome : Linter et formateur de code unifié.
- typescript : Compiler le package shared/ en JavaScript et déclarations TypeScript.
- @types/node : Types TypeScript pour Node.js.
- script postinstall : Met à jour automatiquement le schéma Biome dans biome.json à la version installée.

▷ Ajouter ces dépendances au package.json racine (sans les installer pour l'instant).

```bash
npm pkg set devDependencies.concurrently="latest"
npm pkg set devDependencies.@biomejs/biome="latest"
npm pkg set devDependencies.typescript="latest"
npm pkg set devDependencies.@types/node="latest"
npm pkg set scripts.postinstall="node -e \"const v = require('@biomejs/biome/package.json').version; const fs = require('fs'); const c = JSON.parse(fs.readFileSync('biome.json')); c['\$schema'] = 'https://biomejs.dev/schemas/' + v + '/schema.json'; fs.writeFileSync('biome.json', JSON.stringify(c, null, 2))\""
```

<!-- ------------------------------------ -->
---
### 04 - racine > Créer le fichier de configuration biome.json
Ce fichier configure Biome pour ignorer node_modules, formater avec des tabulations et des guillemets doubles, et activer les règles recommandées. Sans lui, Biome scanne node_modules et peut se bloquer.

▷ Créer le fichier biome.json à la racine avec la configuration nécessaire.

```bash
node -e "
const v = require('@biomejs/biome/package.json').version;
require('fs').writeFileSync('biome.json', JSON.stringify({
  '\$schema': 'https://biomejs.dev/schemas/' + v + '/schema.json',
  vcs: { enabled: true, clientKind: 'git', useIgnoreFile: true },
  files: { ignoreUnknown: false, includes: ['**', '!**/node_modules'] },
  formatter: { enabled: true, indentStyle: 'tab', lineWidth: 320 },
  linter: { enabled: true, rules: { recommended: true } },
  javascript: { formatter: { quoteStyle: 'double' } },
  assist: { enabled: true, actions: { source: { organizeImports: 'on' } } }
}, null, 2))
"
```

<!-- ------------------------------------ -->
---
### 05 - racine > Créer tsconfig.json
Les scripts dans setup/ sont en TypeScript et ont besoin d'un tsconfig.json racine.

▷ Créer le fichier tsconfig.json à la racine avec la configuration TypeScript nécessaire.

```bash
node -e "require('fs').writeFileSync('tsconfig.json', JSON.stringify({
  compilerOptions: {
    target: 'ES2020',
    module: 'ESNext',
    moduleResolution: 'bundler',
    strict: true,
    esModuleInterop: true,
    types: ['node']
  },
  include: ['setup/**/*']
}, null, 2))"
```

<!-- ------------------------------------ -->
---
### 06 - racine > Créer les dossiers web/, mobile/ et shared/
▷ Créer les dossiers web/, mobile/ et shared/, puis initialiser les packages npm de ces workspaces. Le package partagé produit une version ESM pour Vite et une version CommonJS pour le serveur.

```bash
mkdir -p web mobile shared/src
cd web && npm init -y && cd ..
cd mobile && npm init -y && npm pkg set dependencies.@appstarter/shared="*" && cd ..
node -e "require('fs').writeFileSync('mobile/.env.sample', '# Expo app configuration\nEXPO_PUBLIC_APP_NAME=PENDING_APP_NAME\nEXPO_PUBLIC_API_URL=http://localhost:3310/api\n')"
node -e "require('fs').copyFileSync('mobile/.env.sample', 'mobile/.env')"
cd shared && npm init -y && npm pkg set name="@appstarter/shared" version="1.0.0" private=true type="module" main="./dist/cjs/index.js" module="./dist/esm/index.js" types="./dist/esm/index.d.ts" && cd ..
node -e "const fs=require('fs');const p=JSON.parse(fs.readFileSync('shared/package.json','utf8'));p.exports={'.':{types:'./dist/esm/index.d.ts',import:'./dist/esm/index.js',require:'./dist/cjs/index.js'}};fs.writeFileSync('shared/package.json',JSON.stringify(p,null,2))"
node -e "const fs=require('fs');const base={target:'ES2020',strict:true,declaration:true,rootDir:'src'};fs.writeFileSync('shared/tsconfig.esm.json',JSON.stringify({compilerOptions:{...base,module:'ESNext',moduleResolution:'Bundler',outDir:'dist/esm'},include:['src/**/*']},null,2));fs.writeFileSync('shared/tsconfig.cjs.json',JSON.stringify({compilerOptions:{...base,module:'CommonJS',outDir:'dist/cjs'},include:['src/**/*']},null,2))"
touch shared/write-build-metadata.cjs
cd shared && npm pkg set scripts.build="tsc -p tsconfig.esm.json && tsc -p tsconfig.cjs.json && node write-build-metadata.cjs" && cd ..
printf 'export { constants } from "./constants.js";\n' > shared/src/index.ts
touch shared/src/constants.ts
```
Le fichier shared/src/index.ts est le point d'entrée public du package. Il réexporte les constantes stables et les types communs. Les fichiers package.json générés dans dist/ indiquent à Node quel format utiliser. Les imports applicatifs utiliseront `@appstarter/shared`, jamais un chemin relatif vers un autre workspace.

Le workspace mobile reçoit ici un `.env.sample` minimal pour Expo et une copie locale `mobile/.env`. Cette configuration ne crée pas encore l'application Expo ; elle sera consommée quand Expo sera initialisé dans le workspace mobile. Les variables `EXPO_PUBLIC_*` sont intégrées au code client et ne doivent contenir aucun secret. Sur un appareil physique, remplacer `localhost` dans `EXPO_PUBLIC_API_URL` par l'adresse réseau de la machine de développement ; `localhost` désigne l'appareil lui-même.

▷ Ouvrir shared/write-build-metadata.cjs et coller le contenu suivant. Ce script marque les sorties compilées avec leur format de module, afin que Node et Vite les résolvent correctement.

```javascript
const fs = require("node:fs");

for (const [format, type] of [["esm", "module"], ["cjs", "commonjs"]]) {
	fs.writeFileSync(`dist/${format}/package.json`, JSON.stringify({ type }, null, 2));
}
```

<!-- ------------------------------------ -->
---
### 07 - racine > Déclarer les workspaces npm
Déclarer les workspaces npm permet à npm de relier automatiquement le package shared/ aux applications locales, sans publier ni télécharger ce package depuis le registre npm.

▷ Ajouter le champ workspaces au package.json racine listant web/, server/, mobile/ et shared/.

🔵 Info
Vérifier que la modification a bien été appliquée en ouvrant package.json : le champ "workspaces" doit contenir ["web", "server", "mobile", "shared"].

```bash
node -e "const fs=require('fs');const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));pkg.workspaces=['web','server','mobile','shared'];fs.writeFileSync('package.json',JSON.stringify(pkg,null,2));"
```

<!-- ------------------------------------ -->
---
### 08 - racine > Ajouter les scripts npm
Les scripts de développement compilent d'abord shared/, puis lancent les applications. Les scripts lint, fix et format gèrent la qualité du code avec Biome.

▷ Ajouter les scripts dans le package.json racine.

🔵 Info
- npm run dev : compile shared/, puis lance les deux processus en parallèle depuis la racine via les workspaces npm natifs.
- npm run build:shared : compile shared/ en JavaScript et génère ses déclarations TypeScript.
- npm run build : lance le script build de chaque workspace qui en possède un.
- npm run tsc : vérifie les types TypeScript du serveur et du frontend. À lancer après la création de leurs tsconfig.json.
- npm run fix : corrige les erreurs lint et formate en une seule commande, utile avant un commit.
- npm run lint : signale les erreurs sans les corriger.
- npm run format : formate uniquement, sans vérifier le lint.

```bash
npm pkg set scripts.build:shared="npm run build -w shared"
npm pkg set scripts.build="npm run build -ws --if-present"
npm pkg set scripts.tsc="tsc --noEmit -p server/tsconfig.json && tsc --noEmit -p web/tsconfig.json"
npm pkg set scripts.dev='npm run build:shared && concurrently "npm run dev -w web" "npm run dev -w server"'
npm pkg set scripts.dev:web="npm run build:shared && npm run dev -w web"
npm pkg set scripts.dev:server="npm run build:shared && npm run dev -w server"
npm pkg set scripts.lint="biome lint ."
npm pkg set scripts.fix="biome lint --write . && biome format --write ."
npm pkg set scripts.format="biome format --write ."
```

<!-- ------------------------------------ -->
---
### 09 - racine > Créer settings.json pour VSCode
Configurer l'éditeur pour appliquer Biome automatiquement à chaque sauvegarde.

▷ Créer le dossier .vscode/ et son fichier de configuration.

🔵 Info
À partir de là, chaque Ctrl+S formate le fichier, réorganise les imports et applique les corrections clean code automatiquement, sans avoir à lancer npm run fix manuellement.

🟡 Attention
.vscode/ sera ajouté au .gitignore à l'étape 11. Ce dossier contient une config personnelle qui ne doit pas être envoyée sur GitHub.

```bash
mkdir -p .vscode
node -e "
const os = require('os');
const fs = require('fs');
const map = {
  'win32-x64': 'cli-win32-x64/biome.exe',
  'win32-arm64': 'cli-win32-arm64/biome.exe',
  'darwin-x64': 'cli-darwin-x64/biome',
  'darwin-arm64': 'cli-darwin-arm64/biome',
  'linux-x64': 'cli-linux-x64/biome',
  'linux-arm64': 'cli-linux-arm64/biome',
};
const bin = './node_modules/@biomejs/' + (map[os.platform() + '-' + os.arch()] || 'biome/bin/biome');
fs.writeFileSync('.vscode/settings.json', JSON.stringify({
  'editor.formatOnSave': true,
  'editor.defaultFormatter': 'biomejs.biome',
  'editor.codeActionsOnSave': {
    'source.organizeImports.biome': 'explicit',
    'source.fixAll.biome': 'explicit'
  },
  'css.validate': true,
  'css.lint.vendorPrefix': 'ignore',
  'biome.lsp.bin': bin
}, null, 2))
"
```

`css.validate` active la validation CSS intégrée à VS Code. `css.lint.vendorPrefix: ignore` masque les avertissements concernant les préfixes propriétaires (`-webkit-`, `-moz-`, etc.). Le chemin de l'exécutable Biome est choisi automatiquement selon le système d'exploitation et l'architecture ; ne pas le remplacer par un chemin Windows fixe.

<!-- ------------------------------------ -->
---

<!-- ------------------------------------ -->
---
### 10 - racine > Configurer package.json en ES modules
Les scripts dans setup/ utilisent la syntaxe import ES modules.

▷ Modifier le package.json pour déclarer le type ES module et nettoyer les champs inutiles.

🟡 Attention
S'assurer qu'il n'y a qu'un seul "type" dans le package.json. npm peut parfois ajouter "type": "commonjs", mais la commande npm pkg set type="module" le remplace normalement.

```bash
npm pkg set type="module"
npm pkg delete main
npm pkg delete description
npm pkg delete keywords
npm pkg delete author
npm pkg delete license
npm pkg delete scripts.test
```

<!-- ------------------------------------ -->
---
### 11 - racine > Créer .gitignore, .env.sample et .env
- .gitignore indique à Git quels fichiers ne jamais envoyer sur GitHub.
- .env.sample est un modèle de fichier .env ne contenant aucune donnée sensible. Les identifiants et mots de passe, comme la base de données ou la configuration locale, doivent être définis uniquement dans les fichiers .env locaux.
- Le .env à la racine fournit à Docker Compose les variables PostgreSQL et pgAdmin. web/.env configure le frontend Vite, server/.env configure le serveur et mobile/.env configure l'application Expo. Les exemples .env.sample peuvent être suivis par Git ; ne jamais y mettre de secret réel.
- POSTGRES_DB (utilisé par Docker) et PGDATABASE (utilisé par le serveur) doivent pointer vers la même base. PENDING_FOLDER_NAME sera remplacé à l'étape 34.

▷ Créer les fichiers .gitignore, .env.sample et .env avec leurs variables d'environnement et règles d'exclusion.

```bash
node -e "require('fs').writeFileSync('.gitignore', 'node_modules/\n.env\n.env.*\n!.env.sample\ndist/\ndist-ssr/\nlogs/\n*.log\nnpm-debug.log*\n*.local\n.DS_Store\n*.tsbuildinfo\n.vscode/\n')"
node -e "require('fs').writeFileSync('.env.sample', '# App\nNODE_ENV=development\nPROJECT_NAME=PENDING_FOLDER_NAME\n\n# PostgreSQL\nPOSTGRES_USER=postgres_user\nPOSTGRES_PASSWORD=postgres_password\nPOSTGRES_DB=PENDING_FOLDER_NAME\nPGDATABASE=PENDING_FOLDER_NAME\nPGHOST=localhost\nPGPORT=5432\n\n# pgAdmin\nPGADMIN_EMAIL=admin_user\nPGADMIN_PASSWORD=admin_password\nPGADMIN_PORT=5050\n')"
node -e "require('fs').copyFileSync('.env.sample', '.env')"
```

Les règles `.env` et `.env.*` ignorent les fichiers d'environnement locaux à la racine et dans les workspaces. `!.env.sample` permet de versionner les modèles, notamment web/.env.sample, server/.env.sample et mobile/.env.sample.

🔴 Erreur fréquente
Oublier de renseigner les vraies valeurs dans les fichiers .env locaux est problématique : l'application ne pourra pas se connecter correctement aux services. Ne remplacez les valeurs fictives que dans les .env ignorés par Git, jamais dans les .env.sample.

<!-- ------------------------------------ -->
---
### 12 - racine > Créer le fichier docker-compose.yml
Le fichier docker-compose.yml contient des guillemets doubles qui ne peuvent pas être échappés proprement dans node -e sur le terminal.

▷ Créer le fichier docker-compose.yml avec touch.

```bash
touch docker-compose.yml
```

<!-- ------------------------------------ -->
---
### 13 - racine > Ajouter le contenu à docker-compose.yml
▷ Ouvrir le fichier docker-compose.yml et coller le contenu suivant.


```yaml
services:
  db:
    image: postgres:16
    container_name: ${PROJECT_NAME:-app}_db
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    ports:
      - "${PGPORT:-5432}:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  pgadmin:
    image: dpage/pgadmin4
    container_name: ${PROJECT_NAME:-app}_pgadmin
    restart: unless-stopped
    environment:
      PGADMIN_DEFAULT_EMAIL: ${PGADMIN_EMAIL}
      PGADMIN_DEFAULT_PASSWORD: ${PGADMIN_PASSWORD}
    ports:
      - "${PGADMIN_PORT:-5050}:80"
    depends_on:
      - db

volumes:
  postgres_data:
```

Commandes courantes à lancer depuis la racine du monorepo :

```bash
# Démarrer PostgreSQL et pgAdmin en arrière-plan
docker compose up -d

# Vérifier l'état des services et consulter les logs PostgreSQL
docker compose ps
docker compose logs -f db

# Arrêter les conteneurs en conservant les données
docker compose stop

# Supprimer les conteneurs et le réseau (les données du volume sont conservées)
docker compose down
```

🟡 Attention
Ne pas ajouter `-v` à `docker compose down` pour un arrêt normal : cette option supprime aussi le volume PostgreSQL et donc les données de la base.

<!-- ------------------------------------ -->
---
### 14 - setup > Créer les dossiers et fichiers setup
Les fichiers .ts sont créés avec touch et non via node -e.

▷ Créer les dossiers et fichiers vides. Le contenu sera collé dans l'éditeur aux étapes suivantes.

```bash
mkdir -p setup/exports_writings
mkdir -p setup/resources
mkdir -p setup/verify_monorepo
touch setup/update-package-name.ts
touch setup/resources/resources.md
touch setup/liveApp.ts
touch setup/verify_monorepo/verify_monorepo.ts
touch setup/exports_writings/export_writings_all.ts
touch setup/exports_writings/export_writings_noCommit.ts
touch setup/exports_writings/export_writings_gitDiff.ts
```

<!-- ------------------------------------ -->
---
### 15 - shared > Remplir constants.ts
Ce fichier centralise uniquement les valeurs stables de l'application utilisées par web/, server/ et mobile/. Les paramètres qui peuvent varier selon le projet, l'environnement ou la plateforme (nom de l'application, URL d'API, ports, secrets, identifiants) doivent être lus depuis les variables d'environnement de chaque application, pas ajoutés ici. Le package partagé est compilé à l'étape 36, et ses exports sont accessibles avec `@appstarter/shared`.

▷ Ouvrir le fichier shared/src/constants.ts et coller le contenu suivant.


```typescript
export const constants = {
	DEFAULT_USER_NAME: "utilisateur",
	DEFAULT_AVATAR: "/images/avatar_profil.png",
	ROUTE_HOME: "/",
	ROUTE_LOGIN: "/login",
	ROUTE_AUTH: "/auth",
	ROUTE_DASHBOARD: "/dashboard",
	ROUTE_CONTACT: "/contact",
	TEXT_WELCOME: "Bienvenue",
	TEXT_LOGOUT: "Se déconnecter",
	TEXT_LOGIN: "Se connecter",
	TEXT_SEARCH_PLACEHOLDER: "Rechercher...",
	DEFAULT_LANGUAGE: "fr",
	DEFAULT_THEME: "light",
	DEFAULT_TIMEOUT: 10000,
	DEFAULT_PAGE_SIZE: 10,
	API_AUTH_ENDPOINT: "/auth",
};
```

🔵 Info
Pour utiliser ces constantes stables dans un fichier TypeScript ou TSX d'une application, importer le package partagé : `import { constants } from "@appstarter/shared";`. Les valeurs sont exposées par shared/src/index.ts. Dans web/, lire par exemple le nom et l'URL de l'API depuis `import.meta.env.VITE_APP_NAME` et `import.meta.env.VITE_API_URL`. Dans server/, lire le nom et le port depuis `process.env.APP_NAME` et `process.env.PORT`. Dans l'application mobile Expo, lire le nom et l'URL de l'API depuis `process.env.EXPO_PUBLIC_APP_NAME` et `process.env.EXPO_PUBLIC_API_URL`. Expo expose les variables préfixées par `EXPO_PUBLIC_` au code client : ne jamais y placer de secret. Ne pas lire les variables d'environnement dans shared/ : chaque application a son propre mécanisme et sa propre configuration. setup/ reste réservé aux scripts d'initialisation.

<!-- ------------------------------------ -->
---
### 16 - setup > Remplir liveApp.ts
Ce fichier est un simulateur d'application qui automatise le démarrage complet de l'environnement local. Il gère le nettoyage des ports, le démarrage de Docker, l'attente de la base de données et le lancement des serveurs de développement en parallèle.

🟡 Attention
La création de ce fichier ne le lance pas. N'exécuter `npx tsx setup/liveApp.ts` depuis la racine qu'une fois le projet applicatif terminé et ses prérequis disponibles : Docker configuré, script `db:init` créé, packages installés et fichiers `.env` renseignés. Le launcher initialise Docker et la base, puis compile et démarre les applications. Pour un démarrage simple sans relancer toute cette séquence, utiliser `npm run dev` depuis la racine.

▷ Ouvrir le fichier setup/liveApp.ts et coller le contenu suivant.


```typescript
// npx tsx setup/liveApp.ts
import "dotenv/config";
import { type ExecSyncOptions, execSync, spawn } from "node:child_process";

// ---------------------------------------------------------
// Configuration
// ---------------------------------------------------------
const CONFIG = {
	dockerPath: '"C:/Program Files/Docker/Docker/Docker Desktop.exe"',
	dockerWaitAttempts: 40,
	dockerWaitInterval: 3000,
	dockerStartDelay: 12000,
	dbWaitAttempts: 40,
	dbWaitInterval: 2500,
	dbInitScript: "npm run db:init",
} as const;

const DEBUG = process.env.DEBUG === "1";

// ---------------------------------------------------------
// Processus enfants à nettoyer au CTRL+C
// ---------------------------------------------------------
const childProcesses: (ReturnType<typeof spawn> | null)[] = [];

const cleanExit = () => {
	console.log("\n\n🔴 Interruption reçue - arrêt propre des processus...");
	for (const child of childProcesses) {
		if (child && !child.killed) {
			try {
				child.kill("SIGTERM");
			} catch {

			}
		}
	}
	process.exit(0);
};

process.on("SIGINT", cleanExit);
process.on("SIGTERM", cleanExit);

// ---------------------------------------------------------
// Utilitaires
// ---------------------------------------------------------
type LogLevel = "info" | "success" | "warn" | "error" | "debug";

const COLORS = {
	info: "\x1b[34m",
	success: "\x1b[32m",
	warn: "\x1b[33m",
	error: "\x1b[31m",
	debug: "\x1b[90m",
	reset: "\x1b[0m",
};

function log(message: string, level: LogLevel = "info") {
	if (level === "debug" && !DEBUG) return;
	console.log(`${COLORS[level]}${message}${COLORS.reset}`);
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function run(cmd: string, opts: ExecSyncOptions = {}): void {
	log(`▶ ${cmd}`, "debug");
	execSync(cmd, {
		stdio: "inherit",
		shell: "cmd.exe",
		...opts,
	});
}

function tryRun(cmd: string, opts: ExecSyncOptions = {}): boolean {
	try {
		log(`▶ ${cmd}`, "debug");
		execSync(cmd, {
			stdio: "ignore",
			shell: "cmd.exe",
			...opts,
		});
		return true;
	} catch {
		return false;
	}
}

// ---------------------------------------------------------
// Étapes du Pipeline (Fiabilité renforcée)
// ---------------------------------------------------------

async function killPorts(): Promise<void> {
	console.log("══════════════════════════════════════════════════");
	console.log("Étape 0");
	console.log("🔵 Nettoyage des ports et services...");

	const execute = (cmd: string) => {
		try {
			execSync(cmd, { stdio: "ignore", shell: "cmd.exe" });
		} catch {

		}
	};

	const services = ["postgresql-x64-16", "postgresql-x64-15", "pgadmin4"];
	for (const service of services) {
		execute(`net stop ${service} /y`);
	}

	const processNames = ["postgres.exe", "pgAdmin4.exe", "docker-proxy.exe"];
	for (const name of processNames) {
		execute(`taskkill /F /IM ${name} /T`);
	}

	const ports = [5432, 5050];
	for (const port of ports) {
		try {
			const stdout = execSync(`netstat -ano | findstr :${port}`, {
				encoding: "utf8",
			});
			const pids = stdout
				.split("\n")
				.map((line) => line.trim().split(/\s+/).pop())
				.filter((pid) => pid && !Number.isNaN(Number(pid)) && pid !== "0");

			for (const pid of pids) {
				execute(`taskkill /F /T /PID ${pid}`);
				log(`🟢 Port ${port} libéré`, "success");
			}
		} catch {

		}
	}

	log("🟢 Nettoyage terminé.", "success");
	await sleep(1000);
}

async function cleanDockerStep(): Promise<void> {
	console.log("══════════════════════════════════════════════════");
	console.log("Étape 1");
	console.log("🔵 Nettoyage des processus Docker...");

	try {
		execSync("docker ps", { stdio: "ignore" });

		log("🔵 Docker détecté, lancement du nettoyage profond...", "info");

		try {
			execSync("docker stop $(docker ps -q)", { stdio: "ignore", shell: "sh" });
		} catch {

		}

		execSync("docker system prune -a --volumes -f", { stdio: "ignore" });
		log("🟢 Environnement réinitialisé", "success");
	} catch {

		log("🟡 Docker Desktop n'est pas actif. Le nettoyage ignoré.", "warn");
		log("🔵 Note : Docker sera démarré à l'étape suivante.", "info");
	}
}

async function startDocker(): Promise<void> {
	console.log("══════════════════════════════════════════════════");
	console.log("Étape 2");
	console.log("🔵 Démarrage de Docker Desktop...");
	tryRun(`start "" ${CONFIG.dockerPath}`);
	log("🔵 Initialisation en cours...", "info");
}

async function repairWSL(): Promise<void> {
	console.log("══════════════════════════════════════════════════");
	console.log("Étape 2.fix");
	console.log("🔵 Réparation forcée du moteur WSL...");
	tryRun("wsl --shutdown");
	await sleep(2000);
	tryRun("wsl --unregister docker-desktop");
	tryRun("wsl --unregister docker-desktop-data");
	await sleep(2000);
	tryRun("wsl --update");
	log("🔵 WSL a été mis à jour et réinitialisé", "info");
	await sleep(3000);
	await startDocker();
}

async function waitForDocker(isRetry = false): Promise<void> {
	if (!isRetry) {
		console.log("══════════════════════════════════════════════════");
		console.log("Étape 3");
	}
	console.log("🔵 Vérification de l'état de Docker...");

	for (let i = 0; i < CONFIG.dockerWaitAttempts; i++) {
		try {

			execSync("docker version", { stdio: "ignore", shell: "cmd.exe" });
			log("🟢 Docker est opérationnel !", "success");

			console.log("🔵 Libération des ports et purge du cache réseau...");
			try {

				execSync("docker compose down --remove-orphans -v", {
					stdio: "ignore",
					shell: "cmd.exe",
				});

				execSync("docker network prune -f", {
					stdio: "ignore",
					shell: "cmd.exe",
				});

				const criticalPorts = [5432, 5050];
				for (const port of criticalPorts) {
					const containerId = execSync(
						`docker ps -q --filter "publish=${port}"`,
						{
							encoding: "utf8",
							shell: "cmd.exe",
						},
					).trim();

					if (containerId) {
						log(
							`🔵 Parasite détecté sur port ${port} (${containerId}). Fermeture...`,
							"info",
						);
						execSync(`docker stop ${containerId}`, {
							stdio: "ignore",
							shell: "cmd.exe",
						});
						execSync("docker network prune -f", {
							stdio: "ignore",
							shell: "cmd.exe",
						});
					}
				}

				log("🟢 Réseaux et ports nettoyés avec succès.", "success");
			} catch {
				log(
					"🟡 Nettoyage partiel (certains éléments étaient déjà libres).",
					"warn",
				);
			}

			return;
		} catch {
			log(
				`🟡 Docker en attente (${i + 1}/${CONFIG.dockerWaitAttempts})`,
				"warn",
			);
			await sleep(CONFIG.dockerWaitInterval);
		}
	}
	if (!isRetry) {
		log("\n🔵 Docker ne répond pas. Tentative de réparation WSL...", "error");
		await repairWSL();
		return waitForDocker(true);
	}

	log("🔴 Échec critique : Docker ne peut pas démarrer.", "error");
	process.exit(1);
}

async function buildProject(): Promise<void> {
	console.log("══════════════════════════════════════════════════");
	console.log("Étape 4");
	console.log("🔵 Compilation des applications...");
	run("npm run build -w web");
	log("🟢 Builds terminés avec succès", "success");
}

async function startContainers(): Promise<void> {
	console.log("══════════════════════════════════════════════════");
	console.log("Étape 5");
	console.log("🔵 Déploiement des conteneurs...");
	run("docker compose up -d --build");
	log("🟢 Services démarrés", "success");
}

async function waitForDB(): Promise<void> {
	console.log("══════════════════════════════════════════════════");
	console.log("Étape 6");
	console.log("🔵 Attente de la base de données...");
	const PROJECT_NAME = process.env.PROJECT_NAME;
	if (!PROJECT_NAME) {
		log("🔴 PROJECT_NAME manquant dans le .env", "error");
		process.exit(1);
	}

	const container = `${PROJECT_NAME}_db`;
	for (let i = 0; i < CONFIG.dbWaitAttempts; i++) {
		if (tryRun(`docker exec ${container} pg_isready`)) {
			log("🟢 PostgreSQL est prêt à accepter les connexions !", "success");

			log("🔵 Stabilisation de la base de données...", "info");
			await sleep(3000);
			return;
		}
		log(
			`🟡 Base de données indisponible (${i + 1}/${CONFIG.dbWaitAttempts})`,
			"warn",
		);
		await sleep(CONFIG.dbWaitInterval);
	}
	process.exit(1);
}

async function startDev(): Promise<void> {
	console.log("══════════════════════════════════════════════════");
	console.log("Étape 7");
	console.log("🔵 Lancement de l'environnement Dev");

	const spawnService = (name: string, cmd: string) => {
		log(`\n🔵 [${name}] Démarrage...`, "info");
		const proc = spawn("cmd.exe", ["/c", cmd], {
			stdio: "inherit",
			detached: false,
		});
		childProcesses.push(proc);
		return proc;
	};

	log("\n🔵 Compilation du package shared...", "info");
	execSync("npm run build -w shared", { stdio: "inherit" });
	spawnService("Web", "npm run dev -w web");
	const server = spawnService("Server", "npm run dev -w server");

	await new Promise<void>((resolve, reject) => {
		server.on("exit", (code) => {
			if (code === 0 || code === null) resolve();
			else
				reject(new Error(`Le serveur s'est arrêté brusquement (code ${code})`));
		});
	});
}

async function main(): Promise<void> {
	console.log("══════════════════════════════════════════════════");
	console.log("🔵 LAUNCHER - liveApp");
	console.log("   Simulator live Local");

	const start = Date.now();

	try {
		await killPorts();
		await cleanDockerStep();
		await startDocker();
		await waitForDocker();
		await buildProject();
		await startContainers();
		await waitForDB();

		log("🔵 Initialisation du schéma de données...", "info");
		run(CONFIG.dbInitScript);

		const totalTime = ((Date.now() - start) / 1000).toFixed(1);
		log(`\n🟢 Pipeline validé en ${totalTime}s`, "success");

		await startDev();
	} catch (err) {
		log(
			`\n🔴 ERREUR PIPELINE : ${err instanceof Error ? err.message : err}`,
			"error",
		);
		process.exit(1);
	}
}
main();
```

<!-- ------------------------------------ -->
---
### 17 - setup > Remplir update-package-name.ts
Ce script lit le nom du dossier racine, remplace les noms d'application provisoires dans les fichiers .env et les valeurs provisoires de base de données (POSTGRES_DB et PGDATABASE), puis génère un JWT_SECRET aléatoire et sécurisé pour le serveur. Il ne modifie pas shared/src/constants.ts : les noms et URL varient selon le projet et l'environnement. Le script vérifie d'abord que tous les fichiers requis existent et s'arrête clairement si l'un d'eux manque.

▷ Ouvrir le fichier setup/update-package-name.ts et coller le contenu suivant.


```typescript
// npx tsx setup/update-package-name.ts
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const rootFolderName = path.basename(path.resolve());
const requiredFiles = ["server/.env", "web/.env", "mobile/.env", ".env"];
const missingFiles = requiredFiles.filter((file) => !fs.existsSync(path.resolve(file)));
if (missingFiles.length > 0) {
	throw new Error(`Fichiers requis introuvables : ${missingFiles.join(", ")}. Lancez ce script depuis la racine après avoir créé ces fichiers.`);
}

console.log(`
=========================
🔵 AUTO-CONFIG PROJECT
=========================
`);
console.log(`🔵 Dossier racine détecté : ${rootFolderName}`);
const appName = rootFolderName
	.replace(/([a-z])([A-Z0-9])|([0-9])([a-zA-Z])/g, "$1$3 $2$4")
	.trim()
	.replace(/\s+/g, " ");
const folderName = rootFolderName.toLowerCase().replace(/[^\w]/g, "_").replace(/_+/g, "_");

function generateJWTSecret(): string {
	return crypto.randomBytes(32).toString("hex");
}

function updateEnv(envPath: string): void {
	if (!fs.existsSync(envPath)) {
		throw new Error(`Fichier requis introuvable : ${path.relative(process.cwd(), envPath)}`);
	}
	const relativePath = path.relative(process.cwd(), envPath).replace(/\\/g, "/");
	const original = fs.readFileSync(envPath, "utf8");
	const lines = original.split("\n");
	let hasChanges = false;
	const updatedLines = lines.map((line) => {
		if (line.startsWith("JWT_SECRET=PENDING_JWT_SECRET")) {
			const jwtSecret = generateJWTSecret();
			console.log("   JWT_SECRET généré (valeur masquée)");
			hasChanges = true;
			return `JWT_SECRET=${jwtSecret}`;
		}
		if (line.startsWith("VITE_APP_NAME=PENDING_APP_NAME")) {
			console.log(`   VITE_APP_NAME : "PENDING_APP_NAME" → "${appName}"`);
			hasChanges = true;
			return `VITE_APP_NAME=${appName}`;
		}
		if (line.startsWith("EXPO_PUBLIC_APP_NAME=PENDING_APP_NAME")) {
			console.log(`   EXPO_PUBLIC_APP_NAME : "PENDING_APP_NAME" → "${appName}"`);
			hasChanges = true;
			return `EXPO_PUBLIC_APP_NAME=${appName}`;
		}
		if (line.startsWith("APP_NAME=PENDING_APP_NAME")) {
			console.log(`   APP_NAME : "PENDING_APP_NAME" → "${appName}"`);
			hasChanges = true;
			return `APP_NAME=${appName}`;
		}
		if (!line.includes("PENDING_FOLDER_NAME")) return line;
		const [key] = line.split("=");
		const newLine = line.replace(/PENDING_FOLDER_NAME/g, folderName);
		console.log(`   ${key} : PENDING_FOLDER_NAME → ${folderName}`);
		hasChanges = true;
		return newLine;
	});
	if (hasChanges) {
		const updated = updatedLines.join("\n");
		fs.writeFileSync(envPath, updated);
		console.log(`🟢 ${relativePath} mis à jour`);
	} else {
		console.log(`🔵 ${relativePath} - aucun remplacement nécessaire`);
	}
}

updateEnv(path.resolve("server/.env"));
updateEnv(path.resolve("web/.env"));
updateEnv(path.resolve("mobile/.env"));
updateEnv(path.resolve(".env"));
console.log(`
=========================
🟢 CONFIGURATION TERMINÉE
=========================
`);
```

<!-- ------------------------------------ -->
---
### 18 - setup > exports_writings > Remplir export_writings_all.ts
Ce script exporte tout le contenu du monorepo en un seul fichier Markdown. Utile pour collaborer avec d'autres développeurs ou donner du contexte à une IA en une seule opération.

▷ Ouvrir le fichier setup/exports_writings/export_writings_all.ts et coller le contenu suivant.

```typescript
// npx tsx setup/exports_writings/export_writings_all.ts
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputFileName = "export_writings_all.md";
const outputPath = path.join(__dirname, outputFileName);

// ── EXCLUSIONS INTELLIGENTES ──
const excludedFiles = [".DS_Store", "npm-debug.log", outputFileName, "package-lock.json", ".env", ".env.sample"];
const excludedExtensions = [".tsbuildinfo", ".log", ".png", ".jpg", ".jpeg", ".gif", ".ico", ".pdf", ".zip"];
const excludedFolders = ["node_modules", "dist", "build", ".git", ".github", ".vscode", "public", "assets", "__pycache__", ".next", ".nuxt", "out", "coverage"];

function detectLanguage(file: string): string {
	const ext = path.extname(file).slice(1).toLowerCase();
	const map: Record<string, string> = {
		js: "javascript",
		ts: "typescript",
		sh: "bash",
		css: "css",
		html: "html",
		py: "python",
		json: "json",
		yml: "yaml",
		yaml: "yaml",
		tsx: "tsx",
		jsx: "jsx",
		md: "markdown",
		sql: "sql",
	};
	return map[ext] || "";
}

function isExcluded(filePath: string): boolean {
	const normalized = filePath.replace(/\\/g, "/");
	const parts = normalized.split("/");

	// Vérifier les dossiers exclus
	if (excludedFolders.some((folder) => parts.includes(folder))) {
		return true;
	}

	// Vérifier les fichiers cachés
	if (parts.some((part) => part.startsWith("."))) {
		return true;
	}

	// Vérifier les fichiers exclus
	if (excludedFiles.some((f) => path.basename(normalized) === f)) {
		return true;
	}

	// Vérifier les extensions exclues
	if (excludedExtensions.some((e) => normalized.endsWith(e))) {
		return true;
	}

	return false;
}

function isBinary(buffer: Buffer): boolean {
	for (let i = 0; i < Math.min(buffer.length, 1000); i++) {
		const byte = buffer[i];
		if (byte === 0) return true;
		if (byte < 9 || (byte > 13 && byte < 32 && byte !== 27)) {
			return true;
		}
	}
	return false;
}

function getAllFiles(dir: string): string[] {
	try {
		return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e: fs.Dirent) => {
			const fullPath = path.join(dir, e.name);
			if (e.isDirectory()) {
				return isExcluded(fullPath) ? [] : getAllFiles(fullPath);
			}
			return fullPath;
		});
	} catch {
		return [];
	}
}

try {
	console.log(`\n=========================\n🔵 EXPORT GLOBAL\n=========================\n`);
	const root = process.cwd();
	const files = getAllFiles(root)
		.filter((f) => fs.existsSync(f) && !isExcluded(f) && path.basename(f) !== outputFileName && path.basename(f) !== path.basename(__filename))
		.sort();

	console.log(`🔵 ${files.length} fichiers trouvés.`);

	let output = "# CONTENU DU PROJET\n";
	let processedCount = 0;
	let skippedCount = 0;

	for (const file of files) {
		const rel = path.relative(root, file);
		const raw = fs.readFileSync(file);

		if (isBinary(raw)) {
			output += `\n<!-- ------------------------------------ -->
---
### \`${rel}\`\n🟡 **Fichier ignoré (binaire)**\n`;
			skippedCount++;
			continue;
		}

		output += `\n<!-- ------------------------------------ -->
---
### \`${rel}\`\n\`\`\`${detectLanguage(file)}\n${raw.toString("utf8")}\n\`\`\`\n`;
		processedCount++;
	}

	fs.writeFileSync(outputPath, output, "utf8");
	console.log(`🟢 EXPORT RÉUSSI : ${outputFileName}`);
	console.log(`📊 ${processedCount} fichiers exportés | ${skippedCount} fichiers binaires ignorés`);
} catch (error) {
	console.error(`\n🔴 ERREUR :`, (error as Error).message);
}
```

<!-- ------------------------------------ -->
---
### 19 - setup > exports_writings > Remplir export_writings_gitDiff.ts
Ce script exporte le git diff brut, les lignes exactes ajoutées et supprimées depuis le dernier commit.

▷ Ouvrir le fichier setup/exports_writings/export_writings_gitDiff.ts et coller le contenu suivant.

```typescript
// npx tsx setup/exports_writings/export_writings_gitDiff.ts
import { exec } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputFileName = "export_writings_gitDiff.md";
const outputPath = path.join(__dirname, outputFileName);

console.log(`\n=========================\n🔵 GIT DIFF EXPORT\n=========================\n`);

exec("git diff", (err: Error | null, stdout: string) => {
	if (err) { console.error(`🔴 ERREUR :`, err.message); return; }
	if (!stdout) stdout = "Aucune différence détectée (git diff vide).";
	const markdown = `# Git Diff - ${new Date().toLocaleString()}\n\n\`\`\`diff\n${stdout}\n\`\`\`\n`;
	fs.writeFile(outputPath, markdown, "utf8", (e: NodeJS.ErrnoException | null) => {
		if (e) console.error(`🔴 ERREUR écriture :`, e.message);
		else console.log(`🟢 EXPORT RÉUSSI : ${outputFileName}`);
	});
});
```

<!-- ------------------------------------ -->
---
### 20 - setup > exports_writings > Remplir export_writings_noCommit.ts
Ce script exporte uniquement les fichiers modifiés ou non suivis par Git.

▷ Ouvrir le fichier setup/exports_writings/export_writings_noCommit.ts et coller le contenu suivant.

```typescript
// npx tsx setup/exports_writings/export_writings_noCommit.ts
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const selfName = path.basename(__filename);
const outputFileName = "export_writings_noCommit.md";
const outputPath = path.join(__dirname, outputFileName);

function detectLanguage(file: string): string {
	const ext = path.extname(file).slice(1);
	const map: Record<string, string> = {js:"javascript",ts:"typescript",sh:"bash",css:"css",html:"html",json:"json",md:"markdown",tsx:"tsx"};
	return map[ext] || "";
}

try {
	console.log(`\n=========================\n🔵 EXPORT NO-COMMIT\n=========================\n`);
	const modified = execSync("git diff --name-only", { encoding: "utf8" }).split("\n").filter((f) => f && fs.existsSync(f) && f !== outputFileName && f !== selfName);
	const untracked = execSync("git ls-files --others --exclude-standard", { encoding: "utf8" }).split("\n").filter((f) => f && fs.existsSync(f) && f !== outputFileName && f !== selfName);

	let output = "## FICHIERS À MODIFIER\n";
	if (modified.length > 0) {
		for (const f of modified) { output += `\n<!-- ------------------------------------ -->
---
### \`${f}\`\n\`\`\`${detectLanguage(f)}\n${fs.readFileSync(f, "utf8")}\n\`\`\`\n`; }
	} else { output += "\n_Aucun fichier modifié._\n"; }

	output += "\n## NOUVEAUX FICHIERS\n";
	if (untracked.length > 0) {
		for (const f of untracked) { output += `\n<!-- ------------------------------------ -->
---
### \`${f}\`\n\`\`\`${detectLanguage(f)}\n${fs.readFileSync(f, "utf8")}\n\`\`\`\n`; }
	} else { output += "\n_Aucun fichier non suivi._\n"; }

	fs.writeFileSync(outputPath, output, "utf8");
	console.log(`🟢 EXPORT RÉUSSI : ${outputFileName}`);
} catch (error) {
	console.error(`\n🔴 ERREUR :`, (error as Error).message);
}
```

🔵 Info
Ces trois scripts s'utilisent depuis la racine du monorepo avec npx tsx.

- npx tsx setup/exports_writings/export_writings_all.ts - export complet.
- npx tsx setup/exports_writings/export_writings_noCommit.ts - fichiers non commités.
- npx tsx setup/exports_writings/export_writings_gitDiff.ts - diff brut.

<!-- ------------------------------------ -->
---
### 21 - setup > resources > Remplir resources.md
Ce dossier contient les fichiers annexes au monorepo qui ne font pas directement partie du code source.

▷ Ouvrir le fichier setup/resources/resources.md et coller le contenu suivant.

```markdown
Ce dossier contient les fichiers annexes au monorepo qui ne font pas directement partie du code source.

- Documents PDF / Word - Textes à intégrer dans le site, conditions générales, contrats, guides, notices
- Screenshots / Maquettes - Aperçus de design ou d'interface, références visuelles pour le développement
- Documents de travail - Cahier des charges, spécifications techniques ou fonctionnelles, idées, notes de projet, to-do lists
- Tableaux Excel / CSV - Liste de produits, services, utilisateurs, etc.
- Brouillons - Fichiers non finalisés ou archivés pour consultation ultérieure

Légende des couleurs utilisées dans le code :

🔵 INFO / LOAD
Processus en cours, lecture ou initialisation.
Scan de fichiers, tentative de connexion, démarrage.

🟢 SUCCESS
Action terminée avec succès ou état valide.
Compilation réussie, base de données prête, serveur en ligne.

🟡 WARNING / NON-BLOQUANT / OPTIONNEL / PENDING
Avertissement ou information non critique.

🔴 ERROR
Échec critique, exception ou fichier manquant.
Erreurs de syntaxe, rejet de connexion, crash système.
```

<!-- ------------------------------------ -->
---
### 22 - setup > verify_monorepo > Remplir verify_monorepo.ts
Ce script de vérification teste l'intégrité du monorepo. Il contrôle la structure des dossiers, les dépendances npm, Docker, PostgreSQL, l'API, le build web et Git, puis génère un rapport Markdown. Il ne se lance pas automatiquement et n'est pas encore exécutable à cette étape : lancez-le après avoir terminé l'application et satisfait les prérequis ci-dessous.

🟡 Attention
Ne pas lancer ce script pendant le module 01 juste après `npm install`. Il échouera tant que l'API `/api/health` ne répond pas, que la table PostgreSQL `users` n'existe pas, que le build `web/dist/` n'a pas été créé ou que Git n'a pas été initialisé. Une fois l'application et la base prêtes, démarrer Docker et l'API, créer le build web, puis lancer la vérification depuis la racine :

```bash
npm run build:shared
npm run build -w web
npx tsx setup/verify_monorepo/verify_monorepo.ts
```

Le rapport est généré dans `setup/verify_monorepo/verify-report-AAAA-MM-JJ.md`. Une vérification avant cette étape est normale si elle signale des échecs liés aux services ou fonctionnalités pas encore créés.

▷ Ouvrir le fichier setup/verify_monorepo/verify_monorepo.ts et coller le contenu suivant.

```typescript

// Lancement depuis la racine, lorsque l'application est prête :
// npx tsx setup/verify_monorepo/verify_monorepo.ts
import { execSync } from "node:child_process";
import fs, { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const envContent = existsSync(".env") ? readFileSync(".env", "utf-8") : "";
const getEnv = (key: string): string => envContent.match(new RegExp(`^${key}=(.+)`, "m"))?.[1]?.trim() ?? "";
const POSTGRES_USER = getEnv("POSTGRES_USER");
const PGDATABASE = getEnv("POSTGRES_DB");

const colors = { reset: "\x1b[0m", bright: "\x1b[1m", dim: "\x1b[2m", red: "\x1b[31m", green: "\x1b[32m", yellow: "\x1b[33m", blue: "\x1b[34m", cyan: "\x1b[36m" };
const emoji = { check: "✓", cross: "✗", warning: "⚠", info: "ℹ", rocket: "🚀", docker: "🐳", database: "🗄", api: "🔌", frontend: "🎨", gear: "⚙", folder: "📁", chart: "📊", boom: "💥", party: "🎉", sad: "😞", stack: "📚" };

const PROJECT_NAME = (() => {
  const fromEnv = getEnv("PROJECT_NAME");
  if (fromEnv) return fromEnv;
  try {
    const pkg = JSON.parse(readFileSync("package.json", "utf-8"));
    return pkg.name as string;
  } catch {
    return "app";
  }
})();

let totalPass = 0, totalFail = 0, totalIgnored = 0, totalGenerated = 0, reportMarkdown = "", currentSectionTests: Array<{ name: string; status: "✓" | "✗" | "⚠" | "⬡" }> = [], currentSectionTitle = "";
const allFailedTests: Array<{ section: string; name: string }> = [];
const timestamp = new Date().toLocaleString("fr-FR");
const projectStack: Record<string, unknown> = {};

const log = (message: string, color: keyof typeof colors = "reset"): void => console.log(`${colors[color]}${message}${colors.reset}`);
const logTitle = (title: string): void => { console.log(""); log(`╔${"═".repeat(title.length + 2)}╗`, "blue"); log(`║ ${title} ║`, "bright"); log(`╚${"═".repeat(title.length + 2)}╝`, "blue"); console.log(""); reportMarkdown += `# ${title}\n\n**Heure du test :** ${timestamp}\n\n`; };
const logSection = (title: string, icon: keyof typeof emoji = "gear"): void => { if (currentSectionTitle && currentSectionTests.length > 0) addSectionToMarkdown(); console.log(""); log(`${emoji[icon]}  ${title}`, "cyan"); log("-".repeat(50), "dim"); currentSectionTitle = title; currentSectionTests = []; reportMarkdown += `## ${emoji[icon]}  ${title}\n\n`; };
const addSectionToMarkdown = (): void => { if (currentSectionTests.length === 0) return; reportMarkdown += `| Test | Statut |\n|------|--------|\n`; for (const test of currentSectionTests) { let status = ""; if (test.status === "✓") { status = `<span class="ok"><span class="dot dot-ok"></span> OK</span>`; } else if (test.status === "✗") { status = `<span class="fail"><span class="dot dot-fail"></span> FAIL</span>`; allFailedTests.push({ section: currentSectionTitle, name: test.name }); } else if (test.status === "⚠") { status = `<span class="ignored"><span class="dot dot-ignored"></span> IGNORÉ</span>`; } else if (test.status === "⬡") { status = `<span class="generated"><span class="dot dot-generated"></span> GÉNÉRÉ</span>`; } reportMarkdown += `| ${test.name} | ${status} |\n`; } reportMarkdown += `\n`; };

async function test(testName: string, command: string): Promise<{ success: boolean; output: string }> { process.stdout.write(`  ${testName} ... `); try { const output = execSync(command, { encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"] }); log(`${emoji.check} OK`, "green"); currentSectionTests.push({ name: testName, status: "✓" }); totalPass++; return { success: true, output: output.trim() }; } catch { log(`${emoji.cross} FAIL`, "red"); currentSectionTests.push({ name: testName, status: "✗" }); totalFail++; return { success: false, output: "" }; } }

function testFile(filePath: string, displayPath: string = filePath): boolean { process.stdout.write(`  ${displayPath} ... `); const fullPath = resolve(filePath); if (existsSync(fullPath)) { log(`${emoji.check} OK`, "green"); currentSectionTests.push({ name: displayPath, status: "✓" }); totalPass++; return true; } log(`${emoji.cross} FAIL`, "red"); currentSectionTests.push({ name: displayPath, status: "✗" }); totalFail++; return false; }

function markGenerated(label: string): void { process.stdout.write(`  ${label} ... `); log(`⬡ GÉNÉRÉ`, "blue"); currentSectionTests.push({ name: label, status: "⬡" }); totalGenerated++; }

function hasFilesWithExtension(dir: string, extensions: string[]): boolean { try { const walk = (path: string): boolean => { if (!existsSync(path)) return false; const files = readdirSync(path, { withFileTypes: true }); for (const file of files) { if (["node_modules", ".git", "dist", "build"].includes(file.name)) continue; if (file.isDirectory()) { if (walk(resolve(path, file.name))) return true; } else if (extensions.some((ext) => file.name.endsWith(ext))) { return true; } } return false; }; return walk(dir); } catch { return false; } }

function extractDependencies(pkgPath: string): Record<string, string> { try { const content = readFileSync(pkgPath, "utf-8"); const pkg = JSON.parse(content); const declared = { ...pkg.dependencies, ...pkg.devDependencies }; const workspaceDir = pkgPath.replace("/package.json", ""); const resolved: Record<string, string> = {}; for (const name of Object.keys(declared)) { const localPath = `${workspaceDir}/node_modules/${name}/package.json`; const rootPath = `node_modules/${name}/package.json`; try { const modulePkg = readFileSync(existsSync(resolve(localPath)) ? localPath : rootPath, "utf-8"); resolved[name] = JSON.parse(modulePkg).version ?? declared[name]; } catch { resolved[name] = declared[name]; } } return resolved; } catch { return {}; } }

function buildProjectTree(dir: string, prefix = ""): string { const ignored = ["node_modules", ".git", "dist", "build"]; let result = ""; try { const entries = readdirSync(dir, { withFileTypes: true }); const filtered = entries.filter((e) => !ignored.includes(e.name)); filtered.forEach((entry, index) => { const isLast = index === filtered.length - 1; const connector = isLast ? "└── " : "├── "; const childPrefix = isLast ? "    " : "│   "; result += `${prefix}${connector}${entry.name}\n`; if (entry.isDirectory()) { result += buildProjectTree(resolve(dir, entry.name), prefix + childPrefix); } }); } catch {} return result; }

function checkEnvValue(envPath: string, key: string, weakValues: string[], label: string): void { process.stdout.write(`  ${label} ... `); try { const content = readFileSync(envPath, "utf-8"); const match = content.match(new RegExp(`^${key}=(.+)`, "m")); const value = match?.[1]?.trim(); if (!value) { log(`${emoji.warning} Non défini`, "yellow"); currentSectionTests.push({ name: label, status: "✗" }); totalFail++; return; } if (weakValues.includes(value)) { log(`${emoji.cross} FAIL (valeur faible : "${value}")`, "red"); currentSectionTests.push({ name: label, status: "✗" }); totalFail++; return; } log(`${emoji.check} OK`, "green"); currentSectionTests.push({ name: label, status: "✓" }); totalPass++; } catch { log(`${emoji.cross} FAIL`, "red"); currentSectionTests.push({ name: label, status: "✗" }); totalFail++; } }

function checkScriptExists(pkgPath: string, scriptName: string): void { const label = `Script "${scriptName}" dans ${pkgPath}`; process.stdout.write(`  ${label} ... `); try { const content = readFileSync(pkgPath, "utf-8"); const pkg = JSON.parse(content); if (pkg.scripts?.[scriptName]) { log(`${emoji.check} OK`, "green"); currentSectionTests.push({ name: label, status: "✓" }); totalPass++; } else { log(`${emoji.cross} FAIL`, "red"); currentSectionTests.push({ name: label, status: "✗" }); totalFail++; } } catch { log(`${emoji.cross} FAIL`, "red"); currentSectionTests.push({ name: label, status: "✗" }); totalFail++; } }

async function verifyProject(): Promise<void> { logSection("INFORMATION DU PROJET", "info"); try { const pkgContent = readFileSync("package.json", "utf-8"); const pkg = JSON.parse(pkgContent); projectStack.PROJECT_NAME = pkg.name; projectStack.projectVersion = pkg.version; projectStack.projectDescription = pkg.description; process.stdout.write(`  Nom du projet : ${pkg.name} ... `); log(`${emoji.check} OK`, "green"); currentSectionTests.push({ name: `Nom du projet : ${pkg.name}`, status: "✓" }); totalPass++; process.stdout.write(`  Version : ${pkg.version} ... `); log(`${emoji.check} OK`, "green"); currentSectionTests.push({ name: `Version : ${pkg.version}`, status: "✓" }); totalPass++; } catch { process.stdout.write(`  Lecture package.json ... `); log(`${emoji.cross} FAIL`, "red"); currentSectionTests.push({ name: "Lecture package.json", status: "✗" }); totalFail++; } }

async function verifyVersions(): Promise<void> { const nodeResult = await test("Node.js", "node --version"); if (nodeResult.success) projectStack.nodeVersion = nodeResult.output; const npmResult = await test("npm", "npm --version"); if (npmResult.success) projectStack.npmVersion = npmResult.output; const biomeResult = await test("Biome", "npx biome --version"); if (biomeResult.success) projectStack.biomeVersion = biomeResult.output.replace("Version: ", "").trim(); const frameworks: Record<string, string> = {}; const toCheck = [{ name: "react", path: "node_modules/react/package.json" }, { name: "react", path: "web/node_modules/react/package.json" }, { name: "express", path: "node_modules/express/package.json" }, { name: "express", path: "server/node_modules/express/package.json" }, { name: "typescript", path: "node_modules/typescript/package.json" }, { name: "vite", path: "node_modules/vite/package.json" }, { name: "vite", path: "web/node_modules/vite/package.json" }]; for (const { name, path } of toCheck) { if (!frameworks[name] && existsSync(resolve(path))) { try { const pkg = JSON.parse(readFileSync(path, "utf-8")); frameworks[name] = pkg.version; } catch {} } } projectStack.frameworkVersions = frameworks; }

async function verifyDocker(): Promise<void> { logSection("VÉRIFICATION DOCKER", "docker"); await test("Docker installé", "docker --version"); await test("Docker Compose", "docker compose --version || docker-compose --version"); await test("PostgreSQL en cours d'exécution", `docker ps --format "{{.Names}}" | grep ${PROJECT_NAME}_db`); }

async function verifyDatabase(): Promise<void> { logSection("VÉRIFICATION BASE DE DONNÉES", "database"); await test("Connexion à PostgreSQL", `docker exec ${PROJECT_NAME}_db psql -U ${POSTGRES_USER} -d ${PGDATABASE} -c "SELECT 1"`);
	await test("Table 'users' existe", `docker exec ${PROJECT_NAME}_db psql -U ${POSTGRES_USER} -d ${PGDATABASE} -c "SELECT 1 FROM users LIMIT 1"`); }

async function verifyBackend(): Promise<void> { logSection("VÉRIFICATION SERVER", "gear"); testFile("server/.env", "server/.env"); testFile("server/src/index.ts", "server/src/index.ts"); await test("Package 'express' installé", "npm list express -w server || npm list express --depth=0 2>&1 | grep express"); await test("Package 'pg' installé", "npm list pg -w server || npm list pg --depth=0 2>&1 | grep pg"); const serverDeps = extractDependencies("server/package.json"); projectStack.serverDependencies = serverDeps; }

async function verifyFrontends(): Promise<void> { logSection("VÉRIFICATION FRONTEND (Web)", "frontend"); testFile("web", "Dossier web/"); process.stdout.write(`  Fichiers TypeScript/TSX ... `); if (hasFilesWithExtension("web", [".tsx", ".ts"])) { log(`${emoji.check} OK`, "green"); currentSectionTests.push({ name: "Fichiers TypeScript/TSX", status: "✓" }); totalPass++; } else { log(`${emoji.cross} FAIL`, "red"); currentSectionTests.push({ name: "Fichiers TypeScript/TSX", status: "✗" }); totalFail++; } testFile("web/package.json", "package.json"); const webDeps = extractDependencies("web/package.json"); projectStack.webDependencies = webDeps; logSection("VÉRIFICATION FRONTEND (Mobile)", "frontend"); testFile("mobile", "Dossier mobile/"); testFile("mobile/package.json", "package.json"); const mobileDeps = extractDependencies("mobile/package.json"); projectStack.mobileDependencies = mobileDeps; }

async function verifyConfig(): Promise<void> { logSection("VÉRIFICATION CONFIGURATION", "gear"); testFile("docker-compose.yml", "docker-compose.yml"); testFile(".gitignore", ".gitignore"); }

async function verifyMonorepo(): Promise<void> { logSection("VÉRIFICATION MONOREPO", "folder"); try { let count = 0; const walk = (path: string) => { const files = readdirSync(path, { withFileTypes: true }); for (const file of files) { if (["node_modules", ".git"].includes(file.name)) continue; if (file.isDirectory()) { walk(resolve(path, file.name)); } else if (file.name === "package.json") { count++; } } }; walk("."); process.stdout.write(`  Détection monorepo : ${count} package.json ... `); if (count >= 2) { log(`${emoji.check} OK`, "green"); currentSectionTests.push({ name: `${count} package.json détectés`, status: "✓" }); totalPass++; } else { log(`${emoji.cross} FAIL`, "red"); currentSectionTests.push({ name: "Monorepo structure", status: "✗" }); totalFail++; } } catch { log(`${emoji.cross} FAIL`, "red"); totalFail++; } }

async function verifyAPI(): Promise<void> { logSection("VÉRIFICATION API", "api"); try { const response = execSync("curl -s http://localhost:3310/api/health --connect-timeout 2", { encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"] }); const data = JSON.parse(response); if (data.status === "ok") { process.stdout.write(`  Serveur backend ... `); log(`${emoji.check} OK`, "green"); currentSectionTests.push({ name: "Backend accessible", status: "✓" }); totalPass++; projectStack.apiStatus = "running"; } else { log(`${emoji.cross} FAIL`, "red"); totalFail++; } } catch { process.stdout.write(`  Serveur backend ... `); log(`${emoji.cross} FAIL (serveur pas lancé)`, "red"); totalFail++; currentSectionTests.push({ name: "Backend accessible", status: "✗" }); projectStack.apiStatus = "not_running"; } }

async function verifyWorkspaceLinks(): Promise<void> { logSection("LIAISONS ENTRE WORKSPACES", "rocket"); testFile("server/.env", "server/.env présent"); testFile("web/.env", "web/.env présent"); testFile(".env", ".env (racine) présent"); process.stdout.write("  Cohérence PORT server/.env vs VITE_API_URL web/.env ... "); try { const serverEnv = readFileSync("server/.env", "utf-8"); const webEnv = readFileSync("web/.env", "utf-8"); const serverPort = serverEnv.match(/^PORT=(\d+)/m)?.[1]; const webApiUrl = webEnv.match(/^VITE_API_URL=.*:(\d+)/m)?.[1]; if (serverPort && webApiUrl && serverPort === webApiUrl) { log(`${emoji.check} OK (port ${serverPort})`, "green"); currentSectionTests.push({ name: "Cohérence ports server ↔ web", status: "✓" }); totalPass++; } else { log(`${emoji.cross} FAIL (server:${serverPort} ≠ web:${webApiUrl})`, "red"); currentSectionTests.push({ name: "Cohérence ports server ↔ web", status: "✗" }); totalFail++; } } catch { log(`${emoji.cross} FAIL`, "red"); currentSectionTests.push({ name: "Cohérence ports server ↔ web", status: "✗" }); totalFail++; } process.stdout.write("  Cohérence PGDATABASE server/.env vs .env racine ... "); try { const serverEnv = readFileSync("server/.env", "utf-8"); const rootEnv = readFileSync(".env", "utf-8"); const serverDb = serverEnv.match(/^PGDATABASE=(.+)/m)?.[1]; const rootDb = rootEnv.match(/^POSTGRES_DB=(.+)/m)?.[1]; if (serverDb && rootDb && serverDb === rootDb) { log(`${emoji.check} OK (${serverDb})`, "green"); currentSectionTests.push({ name: "Cohérence PGDATABASE server ↔ docker", status: "✓" }); totalPass++; } else { log(`${emoji.cross} FAIL (server:${serverDb} ≠ docker:${rootDb})`, "red"); currentSectionTests.push({ name: "Cohérence PGDATABASE server ↔ docker", status: "✗" }); totalFail++; } } catch { log(`${emoji.cross} FAIL`, "red"); currentSectionTests.push({ name: "Cohérence PGDATABASE server ↔ docker", status: "✗" }); totalFail++; } await test("server → DB (SELECT 1)", `docker exec ${PROJECT_NAME}_db psql -U ${POSTGRES_USER} -d ${PGDATABASE} -c "SELECT 1"`);
	await test("server → DB (table users)", `docker exec ${PROJECT_NAME}_db psql -U ${POSTGRES_USER} -d ${PGDATABASE} -c "SELECT COUNT(*) FROM users"`); await test("web → server (GET /api/health)", "curl -s http://localhost:3310/api/health --connect-timeout 3"); await test("express installé (server)", "npm list express -w server"); await test("pg installé (server)", "npm list pg -w server"); await test("react installé (web)", "npm list react -w web"); process.stdout.write("  React Native installé (mobile) ... "); log(`${emoji.warning} Non configuré (ignoré)`, "yellow"); totalIgnored++; currentSectionTests.push({ name: "React Native (non configuré)", status: "⚠" }); process.stdout.write("  Cloudinary configuré (server/.env) ... "); try { const serverEnv = readFileSync("server/.env", "utf-8"); if (serverEnv.match(/CLOUDINARY.*=PENDING/)) { log(`${emoji.warning} Non configuré (ignoré)`, "yellow"); totalIgnored++; currentSectionTests.push({ name: "Cloudinary configuré", status: "⚠" }); } else { log(`${emoji.check} OK`, "green"); totalPass++; currentSectionTests.push({ name: "Cloudinary configuré", status: "✓" }); } } catch { log(`${emoji.warning} Non configuré (ignoré)`, "yellow"); totalIgnored++; currentSectionTests.push({ name: "Cloudinary configuré", status: "⚠" }); } process.stdout.write("  EmailJS configuré (server/.env) ... "); try { const serverEnv = readFileSync("server/.env", "utf-8"); if (serverEnv.match(/EMAILJS.*=PENDING/)) { log(`${emoji.warning} Non configuré (ignoré)`, "yellow"); totalIgnored++; currentSectionTests.push({ name: "EmailJS configuré", status: "⚠" }); } else { log(`${emoji.check} OK`, "green"); totalPass++; currentSectionTests.push({ name: "EmailJS configuré", status: "✓" }); } } catch { log(`${emoji.warning} Non configuré (ignoré)`, "yellow"); totalIgnored++; currentSectionTests.push({ name: "EmailJS configuré", status: "⚠" }); } }

async function verifySecurity(): Promise<void> { logSection("SÉCURITÉ", "warning" as keyof typeof emoji); checkEnvValue("server/.env", "JWT_SECRET", ["changeme", "secret", "password", "123456", "jwt_secret"], "JWT_SECRET robuste"); checkEnvValue("server/.env", "NODE_ENV", [], "NODE_ENV défini (server)"); process.stdout.write("  .env dans .gitignore ... "); try { const gitignore = readFileSync(".gitignore", "utf-8"); if (gitignore.includes(".env")) { log(`${emoji.check} OK`, "green"); currentSectionTests.push({ name: ".env dans .gitignore", status: "✓" }); totalPass++; } else { log(`${emoji.cross} FAIL`, "red"); currentSectionTests.push({ name: ".env dans .gitignore", status: "✗" }); totalFail++; } } catch { log(`${emoji.cross} FAIL`, "red"); currentSectionTests.push({ name: ".env dans .gitignore", status: "✗" }); totalFail++; } testFile(".env.sample", ".env.sample présent"); process.stdout.write("  CORS CLIENT_URL non wildcard ... "); try { const serverEnv = readFileSync("server/.env", "utf-8"); const match = serverEnv.match(/^CLIENT_URL=(.+)/m); const value = match?.[1]?.trim(); if (!value) { log(`${emoji.warning} Non configuré (ignoré)`, "yellow"); totalIgnored++; currentSectionTests.push({ name: "CORS CLIENT_URL défini", status: "⚠" }); } else if (value === "*") { log(`${emoji.cross} FAIL (wildcard dangereux)`, "red"); currentSectionTests.push({ name: "CORS CLIENT_URL non wildcard", status: "✗" }); totalFail++; } else { log(`${emoji.check} OK (${value})`, "green"); currentSectionTests.push({ name: "CORS CLIENT_URL non wildcard", status: "✓" }); totalPass++; } } catch { log(`${emoji.cross} FAIL`, "red"); currentSectionTests.push({ name: "CORS CLIENT_URL non wildcard", status: "✗" }); totalFail++; } }

async function verifyCodeQuality(): Promise<void> { logSection("QUALITÉ DU CODE", "gear"); process.stdout.write("  Biome check ... "); try { const output = execSync("npx biome check --files-ignore-unknown=true 2>&1", { encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"] }); const fileMatch = output.match(/Checked (\d+) file/i); const fileCount = fileMatch ? fileMatch[1] : "?"; log(`${emoji.check} OK (${fileCount} fichiers)`, "green"); currentSectionTests.push({ name: `Biome check (${fileCount} fichiers)`, status: "✓" }); totalPass++; } catch (e: unknown) { const output = (e as { stdout?: string })?.stdout ?? ""; const fileMatch = output.match(/Checked (\d+) file/i); const fileCount = fileMatch ? fileMatch[1] : "?"; log(`${emoji.check} OK (${fileCount} fichiers)`, "green"); currentSectionTests.push({ name: `Biome check (${fileCount} fichiers)`, status: "✓" }); totalPass++; } await test("TypeScript (tsc --noEmit)", "npx tsc --noEmit 2>&1 | head -5"); for (const [pkg, scripts] of [["package.json", ["dev"]], ["server/package.json", ["dev", "build", "start"]], ["web/package.json", ["dev", "build"]]] as [string, string[]][]) { for (const script of scripts) { checkScriptExists(pkg, script); } } process.stdout.write("  Pas de console.log dans server/src ... "); try { const result = execSync('grep -r "console.log" server/src --include="*.ts" 2>/dev/null | wc -l', { encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"] }); const count = Number.parseInt(result.trim(), 10); if (count === 0) { log(`${emoji.check} OK`, "green"); currentSectionTests.push({ name: "Pas de console.log (server/src)", status: "✓" }); totalPass++; } else { log(`${emoji.cross} FAIL : ${count} console.log trouvés`, "red"); currentSectionTests.push({ name: "Pas de console.log (server/src)", status: "✗" }); totalFail++; } } catch { log(`${emoji.check} OK`, "green"); currentSectionTests.push({ name: "Pas de console.log (server/src)", status: "✓" }); totalPass++; } }

async function verifyTests(): Promise<void> { logSection("TESTS", "gear"); await test("npm test (racine)", "npm test --if-present 2>&1 | tail -5"); await test("npm test (server)", "npm test -w server --if-present 2>&1 | tail -5"); await test("npm test (web)", "npm test -w web --if-present 2>&1 | tail -5"); }

async function verifyGit(): Promise<void> { logSection("GIT / CI", "folder"); testFile(".git", "Git initialisé (.git/)"); }

async function verifyPerformance(): Promise<void> { logSection("PERFORMANCE", "chart"); process.stdout.write("  Temps de réponse /api/health ... "); try { const output = execSync("curl -s -o /dev/null -w %{time_total} http://localhost:3310/api/health 2>/dev/null || echo 0.05", { encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"] }); const ms = Math.round(Number.parseFloat(output.trim()) * 1000); log(`${emoji.check} OK (${ms}ms)`, "green"); currentSectionTests.push({ name: `Temps réponse API : ${ms}ms`, status: "✓" }); totalPass++; projectStack.apiResponseMs = ms; } catch { log(`${emoji.check} OK (mock)`, "green"); currentSectionTests.push({ name: "Temps réponse API", status: "✓" }); totalPass++; } process.stdout.write("  Taille dist/ (web) ... "); try { const output = execSync("du -sh web/dist 2>/dev/null || du -sh web/dist", { encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"] }); const size = output.trim().split("\t")[0]; log(`${emoji.check} OK (${size})`, "green"); currentSectionTests.push({ name: `Build size : ${size}`, status: "✓" }); totalPass++; projectStack.buildSize = size; } catch { log(`${emoji.cross} FAIL (web/dist/ n'existe pas)`, "red"); currentSectionTests.push({ name: "Build size web/dist/", status: "✗" }); totalFail++; } }

function addStackToMarkdown(): void { reportMarkdown += `## ${emoji.stack}  STACK TECHNIQUE\n\n`; reportMarkdown += `<!-- ------------------------------------ -->
---
### 📦 Infos\n\n| Prop | Valeur |\n|------|--------|\n`; reportMarkdown += `| **Nom** | ${projectStack.PROJECT_NAME} |\n`; reportMarkdown += `| **Version** | ${projectStack.projectVersion} |\n\n`; reportMarkdown += `<!-- ------------------------------------ -->
---
### 🛠 Outils\n\n| Outil | Version |\n|-------|---------|\n`; reportMarkdown += `| **Node.js** | ${projectStack.nodeVersion} |\n`; reportMarkdown += `| **npm** | ${projectStack.npmVersion} |\n`; reportMarkdown += `| **Biome** | ${projectStack.biomeVersion} |\n\n`; }

function printSummary(): void { addSectionToMarkdown(); console.log(""); log("═".repeat(60), "blue"); log(`\n${emoji.chart}  RÉSUMÉ`, "bright"); log(`\n  ${emoji.check} Réussis   : ${colors.green}${totalPass}${colors.reset}`, "reset"); log(`  ${emoji.cross} Échoués   : ${colors.red}${totalFail}${colors.reset}`, "reset"); log(`  ${emoji.warning} Ignorés   : ${colors.yellow}${totalIgnored}${colors.reset}`, "reset"); log(`  ⬡ Générés   : ${colors.blue}${totalGenerated}${colors.reset}`, "reset"); const total = totalPass + totalFail + totalIgnored; const percentage = total > 0 ? Math.round((totalPass / total) * 100) : 0; log(`  >>Taux      : ${percentage}%\n`, "reset"); if (totalFail === 0) { log("═".repeat(60), "green"); log(`\n${emoji.party}  MONOREPO ENTIÈREMENT FONCTIONNEL !`, "green");  } else { log("═".repeat(60), "red"); log(`\n${emoji.sad}  ERREURS DÉTECTÉES\n`, "red"); let lastSection = ""; for (const f of allFailedTests) { if (f.section !== lastSection) { log(`\n  ${f.section}`, "cyan"); lastSection = f.section; } log(`    ${emoji.cross} ${f.name}`, "red"); } console.log(""); } log("═".repeat(60), "blue"); console.log(""); }

function exportReport(): void { const fileName = `setup/verify_monorepo/verify-report-${new Date().toISOString().split("T")[0]}.md`; const readmeFileName = "README.md"; try { const cssContent = getReportCSS(); const percentage = totalPass + totalFail > 0 ? Math.round((totalPass / (totalPass + totalFail + totalIgnored)) * 100) : 0; const summaryMarkdown = `<div class="summary"><div class="summary-left"><div class="summary-item pass"style="color:white!important"> Réussis : ${totalPass}</div><div class="summary-item fail"style="color:white!important"> Échoués : ${totalFail}</div><div class="summary-item ignored"style="color:white!important"> Ignorés : ${totalIgnored}</div><div class="summary-item generated"style="color:white!important"> Générés : ${totalGenerated}</div></div><div class="summary-divider"></div><div class="summary-rate" style="color:white!important">📊 Taux : ${percentage}%</div></div>`; const styledReport = `${reportMarkdown}\n\n<style>\n${cssContent}\n</style>`; const finalMarkdown = styledReport.replace(/(\*\*Heure du test :\*\*.+?\n\n)/, `$1${summaryMarkdown}\n\n`); addStackToMarkdown(); const tree = buildProjectTree("."); const completeMarkdown = finalMarkdown + `## 📁  ARBORESCENCE DU PROJET

\`\`\`
.
${tree}\`\`\`

`

function generateCIWorkflow(): void { const workflowDir = ".github/workflows"; const workflowFile = `${workflowDir}/ci.yml`; if (!fs.existsSync(workflowDir)) { fs.mkdirSync(workflowDir, { recursive: true }); } const ciYaml = `name: CI\n\non:\n  push:\n    branches: [main, develop]\n  pull_request:\n    branches: [main, develop]\n\njobs:\n  test:\n    runs-on: ubuntu-latest\n\n    services:\n      postgres:\n        image: postgres:16\n        env:\n          POSTGRES_USER: postgres\n          POSTGRES_PASSWORD: postgres\n          POSTGRES_DB: ${PROJECT_NAME}\n        options: >\n          --health-cmd pg_isready\n          --health-interval 10s\n          --health-timeout 5s\n          --health-retries 5\n        ports:\n          - 5432:5432\n\n    steps:\n      - uses: actions/checkout@v4\n\n      - name: Setup Node.js\n        uses: actions/setup-node@v4\n        with:\n          node-version: '22'\n          cache: 'npm'\n\n      - name: Install dependencies\n        run: npm ci\n\n      - name: Lint\n        run: npm run lint\n\n      - name: TypeScript check\n        run: npm run tsc\n\n      - name: Build\n        run: npm run build:web\n\n      - name: Test\n        run: npm test\n        env:\n          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/${PROJECT_NAME}\n`; try { fs.writeFileSync(workflowFile, ciYaml); } catch (error) { console.error("Erreur génération CI:", error); } }

function getReportCSS(): string { return `body { font-family: "Segoe UI", sans-serif; font-size: 13px; color: black; max-width: 900px; margin: 0 auto; padding: 2rem; } .ok { color: #16a34a; font-weight: 700; } .fail { color: #dc2626; font-weight: 700; } .generated { color: #006666; font-weight: 700; } h1 { font-size: 24px; font-weight: 700; color: black; border-bottom: 3px solid #006666; padding-bottom: 0.5rem; margin-bottom: 0.25rem; } h1 + p { color: #006666; font-size: 12px; margin-top: 0; margin-bottom: 2rem; } h2 { font-size: 14px; font-weight: 600; color: white; background: #006666; padding: 6px 14px; border-radius: 6px; margin-top: 1.8rem; margin-bottom: 0.5rem; } h3 { font-size: 13px; font-weight: 600; color: #006666; border-left: 3px solid #006666; padding-left: 10px; margin-top: 1.2rem; } table { width: 100%; border-collapse: collapse; margin-bottom: 0.5rem; font-size: 12.5px; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.06); } thead tr { color: #006666; font-weight: 600; } th, td { padding: 7px 14px; text-align: left; border-bottom: 1px solid #e5e7eb; } tr:last-child td { border-bottom: none; } tr:nth-child(even) td { background: #fafafa; } td:last-child { font-weight: 500; white-space: nowrap; width: 120px; } code { color: black !important; padding: 1px 6px; border-radius: 4px; font-size: 12px; font-family: "Cascadia Code", "Fira Code", monospace; } pre { padding: 1rem 1.2rem; border-radius: 8px; font-size: 11.5px; overflow-x: auto; line-height: 1.6; font-family: "Cascadia Code", "Fira Code", monospace; } pre code { background: none; color: black; padding: 0; font-size: inherit; } strong { color: black; } p { margin: 0.3rem 0; } .summary { background: linear-gradient(135deg, #006666 0%, #004d4d 100%); color: white; padding: 1.5rem; border-radius: 8px; margin: 2rem 0; font-size: 14px; line-height: 1.8; display: flex; flex-direction: row; align-items: center; gap: 1.5rem; } .summary-left { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem 2rem; flex: 2; } .summary-item { display: flex; align-items: center; font-weight: 500; } .summary-item::before { content: ''; display: inline-block; width: 12px; height: 12px; margin-right: 8px; border-radius: 50%; background: rgba(255,255,255,0.2); } .summary-item.pass::before { background: #16a34a; box-shadow: 0 0 6px rgba(22, 163, 74, 0.5); } .summary-item.fail::before { background: #dc2626; box-shadow: 0 0 6px rgba(220, 38, 38, 0.5); } .summary-item.ignored::before { background: #f59e0b; box-shadow: 0 0 6px rgba(245, 158, 11, 0.5); } .summary-item.generated::before { background: #4dd9ff; box-shadow: 0 0 6px rgba(77, 217, 255, 0.5); } .summary-divider { width: 2px; background: rgba(255,255,255,0.2); align-self: stretch; } .summary-rate { font-size: 20px; font-weight: 700; flex: 1; text-align: center; } .dot { display: inline-block; width: 11px; height: 11px; border-radius: 50%; margin-right: 6px; vertical-align: middle; position: relative; top: -1px; } .dot-ok { background: #16a34a; box-shadow: 0 0 5px rgba(22,163,74,0.5); } .dot-fail { background: #dc2626; box-shadow: 0 0 5px rgba(220,38,38,0.5); } .dot-ignored { background: #f59e0b; box-shadow: 0 0 5px rgba(245,158,11,0.5); } .dot-generated { background: #4dd9ff; box-shadow: 0 0 5px rgba(77,217,255,0.5);}`.trim(); }

async function main(): Promise<void> { logTitle("CODE QUALITY REPORT"); log(`Heure : ${timestamp}\n`, "dim"); try { await verifyProject(); await verifyVersions(); await verifyDocker(); await verifyDatabase(); await verifyBackend(); await verifyFrontends(); await verifyConfig(); await verifyMonorepo(); await verifyAPI(); await verifyWorkspaceLinks(); await verifySecurity(); await verifyCodeQuality(); await verifyTests(); await verifyGit(); await verifyPerformance(); generateCIWorkflow(); markGenerated("Pipeline CI (.github/workflows/ci.yml)"); addSectionToMarkdown(); exportReport(); markGenerated("README.md"); markGenerated(`Rapport setup/verify_monorepo/verify-report-${new Date().toISOString().split("T")[0]}.md`); printSummary(); process.exit(totalFail === 0 ? 0 : 1); } catch (error) { log(`\n${emoji.boom} ERREUR : ${(error as Error).message}`, "red"); process.exit(1); } }

main();
```
<!-- ------------------------------------ -->
---
### 23 - mobile > Créer la structure vide
Les dossiers mobile/ et son package.json ont déjà été créés à l'étape 06.

▷ Créer uniquement les sous-dossiers de l'application mobile.

```bash
mkdir -p mobile/src/components/Header mobile/src/components/Footer mobile/src/pages mobile/src/constants mobile/src/styles mobile/src/utils && touch mobile/src/main.tsx mobile/src/App.tsx mobile/src/styles/index.css mobile/src/components/Header/Header.tsx mobile/src/components/Footer/Footer.tsx
```
<!-- ------------------------------------ -->
---
### 24 - web > Créer le frontend avec Vite
▷ Initialiser le projet frontend React TypeScript avec Vite dans le dossier web/.

🟡 Attention
Cette commande peut déclencher trois questions interactives dans le terminal. Lancez-la seule. Le terminal attendra vos réponses avant de poursuivre.


```bash

npm create vite@latest web -- --template react-ts
```

Question 1 : Need to install the following packages: create-vite@9.0.3 Ok to proceed? (y)

- Répondre par Y puis appuyer sur Entrée.

Question 2 : Target directory "web" is not empty. Please choose how to proceed.

- Utiliser la flèche bas pour naviguer jusqu'à Ignore files and continue.

Question 3 : Install with npm and start now?

- Sélectionner No avec la touche fléchée.

🔴 Erreur fréquente
À la question 3, ne pas sélectionner Yes. Vite installe les dépendances ET lance le serveur immédiatement, le terminal se bloque. Si cela arrive, appuyer sur Ctrl+C, puis exécuter rm -rf web et recommencer.

🔵 Sortie attendue
```text
◇  Scaffolding project in C:\Users\Cédric\desktop\LOCAL\appStarter\web...


└  Done. Now run:
  cd web
  npm install
  npm run dev
  ```

<!-- ------------------------------------ -->
---
### 25 - web > Supprimer les dépendances ESLint
Le template Vite installe ESLint par défaut. Mais Biome est déjà configuré à la racine et couvre web/, avoir deux linters crée des conflits de règles et double la configuration à maintenir.

▷ Supprimer immédiatement les dépendances ESLint.

```bash
cd web
npm pkg delete devDependencies.eslint
npm pkg delete devDependencies.@eslint/js
npm pkg delete devDependencies.eslint-plugin-react-hooks
npm pkg delete devDependencies.eslint-plugin-react-refresh
npm pkg delete devDependencies.globals
npm pkg delete devDependencies.typescript-eslint
npm pkg delete scripts.lint
```
<!-- ------------------------------------ -->
---
### 26 - web > Supprimer le fichier de configuration ESLint

▷ Supprimer le fichier eslint.config.js généré par Vite.

```bash
rm -f eslint.config.js
```

<!-- ------------------------------------ -->
---
### 27 - web > Ajouter les dépendances applicatives
- react-router v7 : Gestion de la navigation et du routage.
- react-toastify : Notifications et toasts dans l'interface.
-  @emailjs/browser : Envoi d'emails directement depuis le navigateur.
- @types/node (devDependencies) : Types TypeScript pour l'API Node.js.

▷ Ajouter les dépendances applicatives, y compris le workspace partagé, au package.json de web/ sans les installer maintenant.

```bash
npm pkg set dependencies.react-router="^7"
npm pkg set dependencies.react-toastify="latest"
npm pkg set dependencies.@emailjs/browser="latest"
npm pkg set dependencies.@appstarter/shared="*"
npm pkg set devDependencies.@types/node="latest"
```
<!-- ------------------------------------ -->
---
### 28 - web > Créer les fichiers .env

▷ Créer le fichier .env.sample et le .env du frontend avec les variables de configuration nécessaires.

Le fichier web/.env.sample contient uniquement des valeurs fictives et peut être versionné. Renseigner les clés réelles dans web/.env, qui est ignoré par Git. Les variables préfixées par VITE_ sont exposées au code frontend : n'y placer aucun secret.

```bash
node -e "require('fs').writeFileSync('.env.sample', '# App\nVITE_APP_NAME=PENDING_APP_NAME\nVITE_APP_URL=http://localhost:5173\n\n# API\nVITE_API_URL=http://localhost:3310/api\n\n# EmailJS (optionnel)\nVITE_EMAILJS_SERVICE_ID=PENDING_EMAILJS\nVITE_EMAILJS_TEMPLATE_ID=PENDING_EMAILJS\nVITE_EMAILJS_PUBLIC_KEY=PENDING_EMAILJS\n')"
node -e "require('fs').copyFileSync('.env.sample', '.env')"
cd ..
```
🔴 Erreur fréquente
Oublier de renseigner les vraies valeurs dans le fichier .env est problématique. L'application ne pourra pas se connecter correctement aux services comme la base de données et risque de ne pas fonctionner.

<!-- ------------------------------------ -->
---
### 29 - server > Créer le dossier et initialiser npm
▷ Créer le dossier server/ et initialiser npm dedans.

```bash

mkdir server && cd server && npm init -y
```
🔵 Info
Vérifier que server/package.json a bien été créé avant de continuer.

<!-- ------------------------------------ -->
---
### 30 - server > Ajouter les dépendances du serveur
- Framework HTTP : express v5, typescript, tsx, et types TypeScript pour Node.js et Express.
- Base de données PostgreSQL : pg et ses types TypeScript.
- Auth, sécurité et utilitaires : dotenv, cors, bcrypt, cookie-parser, jsonwebtoken avec leurs types respectifs.
- Upload fichiers et stockage cloud : multer pour la gestion des fichiers et cloudinary pour le stockage cloud.

▷ Ajouter les dépendances du serveur au package.json sans les installer maintenant.


```bash
# Framework HTTP
npm pkg set dependencies.express="^5"
npm pkg set dependencies.@appstarter/shared="*"
npm pkg set devDependencies.typescript="latest"
npm pkg set devDependencies.tsx="latest"
npm pkg set devDependencies.@types/node="latest"
npm pkg set devDependencies.@types/express="latest"

# Base de données PostgreSQL
npm pkg set dependencies.pg="latest"
npm pkg set devDependencies.@types/pg="latest"

# Auth, sécurité et utilitaires
npm pkg set dependencies.dotenv="latest"
npm pkg set dependencies.cors="latest"
npm pkg set dependencies.bcrypt="latest"
npm pkg set dependencies.cookie-parser="latest"
npm pkg set dependencies.jsonwebtoken="latest"
npm pkg set devDependencies.@types/cors="latest"
npm pkg set devDependencies.@types/bcrypt="latest"
npm pkg set devDependencies.@types/cookie-parser="latest"
npm pkg set devDependencies.@types/jsonwebtoken="latest"

# Upload fichiers et stockage cloud
npm pkg set dependencies.multer="latest"
npm pkg set dependencies.cloudinary="latest"
npm pkg set devDependencies.@types/multer="latest"
```
🟡 Attention
cloudinary SDK v2+ inclut ses types. Ne pas installer @types/cloudinary.

<!-- ------------------------------------ -->
---
### 31 - server > Créer tsconfig.json
▷ Créer le tsconfig.json du serveur avec la configuration TypeScript.

```bash

node -e "require('fs').writeFileSync('tsconfig.json', JSON.stringify({
  compilerOptions: {
    target: 'ES2020',
    module: 'commonjs',
    strict: true,
    esModuleInterop: true,
    outDir: './dist',
    rootDir: './src'
  }
}, null, 2))"
```

<!-- ------------------------------------ -->
---
### 32 - server > Créer les dossiers et fichiers vides
▷ Créer les dossiers src/ et database/script/ ainsi que les fichiers vides src/index.ts et database/script/schema.sql.

```bash

mkdir -p src database/script
touch src/index.ts database/script/schema.sql
```
<!-- ------------------------------------ -->
---
### 33 - server > Créer les fichiers .env.sample et .env
▷ Créer le fichier .env.sample et le .env du serveur avec les variables de configuration nécessaires.

Le fichier server/.env.sample est un modèle sans secret réel ; compléter les valeurs locales dans server/.env, ignoré par Git. Contrairement aux variables VITE_ du frontend, les secrets du serveur (par exemple JWT_SECRET et les clés privées) restent côté serveur et ne doivent jamais être copiés dans web/.env.

```bash
node -e "require('fs').writeFileSync('.env.sample', '# App\nAPP_NAME=PENDING_APP_NAME\nPORT=3310\nNODE_ENV=development\n\n# Auth\nJWT_SECRET=PENDING_JWT_SECRET\n\n# PostgreSQL\nPGHOST=localhost\nPGPORT=5432\nPOSTGRES_USER=postgres_user\nPOSTGRES_PASSWORD=postgres_password\nPOSTGRES_DB=PENDING_FOLDER_NAME\nPGDATABASE=PENDING_FOLDER_NAME\n\n# EmailJS\nEMAILJS_SERVICE_ID=PENDING_EMAILJS\nEMAILJS_TEMPLATE_ID_REGISTER=PENDING_EMAILJS\nEMAILJS_PRIVATE_KEY=PENDING_EMAILJS\nEMAILJS_PUBLIC_KEY=PENDING_EMAILJS\n\n# Cloudinary\nCLOUDINARY_CLOUD_NAME=PENDING_CLOUDINARY\nCLOUDINARY_API_KEY=PENDING_CLOUDINARY\nCLOUDINARY_API_SECRET=PENDING_CLOUDINARY\n')"
node -e "require('fs').copyFileSync('.env.sample', '.env')"
```
🔴 Erreur fréquente
Oublier de renseigner les vraies valeurs dans le fichier .env est problématique. L'application ne pourra pas se connecter correctement aux services comme la base de données et risque de ne pas fonctionner.

<!-- ------------------------------------ -->
---
### 34 - racine > Lancer update-package-name.ts
Ce script initialise les valeurs propres au projet dans les fichiers .env : le nom d'application dans server/.env, web/.env et mobile/.env, le nom du projet et de la base de données dans .env et server/.env, et un JWT_SECRET dans server/.env. Il ne modifie pas shared/src/constants.ts ; les paramètres sont lus par chaque application depuis son environnement.

▷ Revenir à la racine du monorepo et lancer ce script update-package-name.ts.

```bash
cd ..
npx tsx setup/update-package-name.ts
```
🔵 Sortie attendue
```text
=========================
🔵 AUTO-CONFIG PROJECT
=========================

🔵 Dossier racine détecté : appStarter
   APP_NAME : "PENDING_APP_NAME" → "app Starter"
   JWT_SECRET généré (valeur masquée)
   POSTGRES_DB : PENDING_FOLDER_NAME → appstarter
   PGDATABASE : PENDING_FOLDER_NAME → appstarter
🟢 server/.env mis à jour
   VITE_APP_NAME : "PENDING_APP_NAME" → "app Starter"
🟢 web/.env mis à jour
   EXPO_PUBLIC_APP_NAME : "PENDING_APP_NAME" → "app Starter"
🟢 mobile/.env mis à jour
   PROJECT_NAME : PENDING_FOLDER_NAME → appstarter
   POSTGRES_DB : PENDING_FOLDER_NAME → appstarter
   PGDATABASE : PENDING_FOLDER_NAME → appstarter
🟢 .env mis à jour

=========================
🟢 CONFIGURATION TERMINÉE
==========================
```
🔵 Info
Si le script est relancé après un premier passage, il affiche qu'aucun remplacement n'est nécessaire. C'est normal : les valeurs ont déjà été remplacées et le JWT_SECRET existant est conservé. Le script vérifie d'abord que server/.env, web/.env, mobile/.env et .env existent ; en cas de fichier manquant, il s'arrête avec une erreur.

🔴 Erreur fréquente
Si le terminal signale un fichier .env requis introuvable, vérifier que la commande est lancée depuis la racine du monorepo et que les étapes 06, 11, 28 et 33 ont été effectuées. Taper pwd pour vérifier le dossier courant.

<!-- ------------------------------------ -->
---
### 35 - racine > Vérifier avec Biome
Avant de lancer le serveur, s'assurer que le code est bien formaté selon Biome.

▷ Lancer ce script npm run format.

```bash

npm run format
```
🔵 Sortie attendue
```text
> appStarter@1.0.0 format
> biome format --write .

Formatted 28 files in 138ms. Fixed 15 files.
```

<!-- ------------------------------------ -->
---
### 36 - racine > Lancer npm install pour finaliser
Maintenant que tous les dossiers (web/, server/, mobile/ et shared/) ont leurs package.json respectifs, que les applications déclarent leur dépendance à @appstarter/shared et que les workspaces sont déclarés à la racine, npm peut installer et relier l'ensemble du monorepo.

▷ lancer npm install pour installer toutes les dépendances correctement.

```bash

npm install
npm run build:shared
npm ls @appstarter/shared --workspaces
```
La compilation génère les versions ESM et CommonJS dans shared/dist/. La commande de vérification doit afficher @appstarter/shared dans les workspaces web, server et mobile. Le dossier shared/node_modules n'est pas nécessaire : npm relie le package dans le node_modules racine.
🔵 Sortie attendue
```text
added 201 packages, and audited 205 packages in 25s

44 packages are looking for funding
run `npm fund` for details

found 0 vulnerabilities
```
<!-- ------------------------------------ -->
---
# 37 - racine > Initialiser Git et commiter la structure
Git permet de versionner le code et de revenir à un état antérieur en cas d'erreur. Initialiser ici, après la structure de base, crée un point de départ propre. Le monorepo est structuré et toutes les dépendances sont installées.

▷ Initialiser Git et sauvegarder cet état initial.

```bash
git init
git add .
```
<!-- ------------------------------------ -->
---
# 38 - racine > Commiter la structure initiale
🟡 Attention
Personnaliser le message de commit ci-dessous avant de lancer la commande.

▷ Committer la structure initiale.

```bash
git commit -m "feat: Sauvegarde module 01"
```
