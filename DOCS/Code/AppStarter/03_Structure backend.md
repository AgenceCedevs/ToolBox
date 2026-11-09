# 03_Structure backend
Ce module configure le backend Express en TypeScript, charge les variables d’environnement et met en place une route de santé permettant de vérifier le bon fonctionnement du serveur.

À la fin de ce module :

- Le backend démarre sur le port `PORT` configuré dans `server/.env` (3310 par défaut) et se relance automatiquement à chaque sauvegarde.
- L’endpoint /api/health fournit un statut indiquant que le serveur fonctionne correctement.
- CORS est configuré avec `CLIENT_URL` dans `server/.env` (http://localhost:5173 par défaut).
- Biome valide le code sans erreur.
<!-- ==================================== -->
# 01 - server > Vérifier les dépendances

Les dépendances du serveur ont déjà été déclarées dans server/package.json.

▷ Vérifier les dépendances installées dans le package server.

```bash
npm list -w server --depth=0
```
🔵 Sortie attendue
```text
appStarter@1.0.0 C:\Users\Cédric\desktop\LOCAL\appStarter
└─┬ server@1.0.0 -> .\server
  ├── @appStarter/shared@1.0.0 -> .\shared
  ├── @types/bcrypt@6.0.0
  ├── @types/cookie-parser@1.4.10
  ├── @types/cors@2.8.19
  ├── @types/express@5.0.6
  ├── @types/jsonwebtoken@9.0.10
  ├── @types/multer@2.3.0
  ├── @types/node@26.6.6
  ├── @types/pg@8.23.1
  ├── bcrypt@6.0.0
  ├── cloudinary@2.11.0
  ├── cookie-parser@1.4.7
  ├── cors@2.8.6
  ├── dotenv@18.0.9
  ├── express@5.3.0
  ├── jsonwebtoken@9.0.3
  ├── multer@2.5.0
  ├── pg@8.23.1
  ├── tsx@4.23.15
  └── typescript@7.0.2
```
🔵 Info
Si une dépendance manque, la commande npm install à la racine l'installera. Ne relancer que si des lignes rouges apparaissent dans l'éditeur.

Les ports et l'origine CORS sont des valeurs d'environnement. Si le port web change, mettre à jour `WEB_PORT` dans le `.env` racine, `CLIENT_URL` dans `server/.env` et `VITE_API_URL` dans `web/.env` en conséquence. Le proxy Vite lit le port backend depuis `server/.env`.

<!-- ==================================== -->
# 02 - server > Créer les dossiers et fichiers avec touch
Les fichiers .ts sont créés avec touch, le contenu sera collé dans l'éditeur aux étapes suivantes.

▷ Créer la structure des dossiers et les fichiers vides.

```bash
mkdir -p server/src/routes
touch server/src/index.ts
touch server/src/routes/health.router.ts
```
<!-- ==================================== -->
# 03 - server > Mettre à jour package.json
Le package.json du serveur déclare le format ES modules utilisé par la compilation, les dépendances et les scripts de développement, de build et de démarrage.

▷ Ouvrir server/package.json et remplacer son contenu par le manifeste suivant. Les dépendances doivent également être installées à la racine du monorepo.

```json
{
	"name": "server",
	"version": "1.0.0",
	"description": "",
	"main": "dist/index.js",
	"scripts": {
		"dev": "tsx watch src/index.ts",
		"build": "tsc -p tsconfig.json",
		"start": "node dist/index.js"
	},
	"keywords": [],
	"author": "",
	"license": "ISC",
	"type": "module",
	"dependencies": {
		"@appStarter/shared": "*",
		"bcrypt": "latest",
		"cloudinary": "latest",
		"cookie-parser": "latest",
		"cors": "latest",
		"dotenv": "latest",
		"express": "^5",
		"jsonwebtoken": "latest",
		"multer": "latest",
		"pg": "latest"
	},
	"devDependencies": {
		"@types/bcrypt": "latest",
		"@types/cookie-parser": "latest",
		"@types/cors": "latest",
		"@types/express": "latest",
		"@types/jsonwebtoken": "latest",
		"@types/multer": "latest",
		"@types/node": "latest",
		"@types/pg": "latest",
		"tsx": "latest",
		"typescript": "latest"
	}
}
```

🔵 Info
Le script `dev` lance le serveur avec rechargement automatique. Le script `build` compile `server/src/` vers `server/dist/`, et `start` exécute ensuite ce build. Le type `module` doit rester cohérent avec le `tsconfig.json` du serveur.

<!-- ==================================== -->
# 04 - server > Mettre à jour tsconfig.json
Le serveur nécessite sa propre configuration TypeScript, optimisée pour Node.js avec le mode `NodeNext`.

▷ Ouvrir le fichier server/tsconfig.json et remplacer le contenu existant par le contenu suivant.

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "types": ["node"]
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```
<!-- ==================================== -->
# 05 - server > src > routes > Remplir health.router.ts
La route de santé est un endpoint simple qui vérifie que le serveur est actif. Elle est utile pour les vérifications de disponibilité en production et pour tester la connexion frontend-backend en développement.

▷ Ouvrir le fichier server/src/routes/health.router.ts et coller le contenu suivant.

```typescript
import type { Request, Response } from "express";
import { Router } from "express";

const healthRouter = Router();

healthRouter.get("/", (_req: Request, res: Response) => {
	res.json({
		status: "ok",
		message: "Server is running",
		timestamp: new Date().toISOString(),
	});
});

export default healthRouter;
```

🔵 Info
Le underscore _req indique au linter que le paramètre est intentionnellement inutilisé, il supprime les avertissements TypeScript.

<!-- ==================================== -->
# 06 - server > src > Remplir index.ts
Le flag --watch de tsx assure le rechargement automatique.

▷ Ouvrir le fichier server/src/index.ts et coller le contenu suivant.

```typescript
import cors from "cors";
import "dotenv/config";
import express from "express";
import healthRouter from "./routes/health.router.js";

const BLUE = "\x1b[34m";
const RESET = "\x1b[0m";

const app = express();
const PORT = process.env.PORT || 3310;
const NODE_ENV = process.env.NODE_ENV || "development";

// ── Middlewares ───────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
	cors({
		origin: (origin, callback) => {
			if (!origin) return callback(null, true);
			if (origin.startsWith("http://localhost:")) {
				return callback(null, true);
			}
			return callback(new Error("Not allowed by CORS"));
		},
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

	console.log("=========================================\n");
});

export default app;
```

<!-- ==================================== -->
<!-- ==================================== -->
<!-- ==================================== -->
# 07 - racine > Mettre à jour tsconfig.json
🟡 Attention
Attention, on switch à la racine !

Maintenant que server/tsconfig.json est configuré, le tsconfig.json racine doit référencer le serveur.

▷ Ouvrir le fichier tsconfig.json à la racine et remplacer le contenu existant par le contenu suivant.

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "types": ["node"]
  },
  "include": ["setup/**/*", "server/src/**/*.ts"]
}
```
🔵 Info
La référence web/ sera ajoutée quand le frontend nécessitera le tsconfig racine. Pour l'instant, on inclut uniquement les scripts setup/ et le code server/.

<!-- ==================================== -->
# 08 - racine > Vérifier le workspace server/ avec Biome
▷ Corriger les éventuels problèmes de format et vérifier qu'aucune erreur ne subsiste.

```bash
npm run fix
```

🔵 Sortie attendue
```text
> appStarter@1.0.0 fix
> biome lint --write . && biome format --write .

Checked 51 files in 86ms. No fixes applied.
Formatted 47 files in 34ms. No fixes applied.
```

🟡 Attention
Si Biome affiche encore des erreurs après l’exécution de npm run fix, il faudra les corriger manuellement avant de poursuivre.

<!-- ==================================== -->
# 09 - racine > Lancer le backend
Depuis la racine du monorepo.

▷ Lancer uniquement le workspace server/.

```bash
npm run dev:server
```
🔵 Sortie attendue

```text
> appstarter2@1.0.0 dev:server
> npm run build:shared && npm run dev -w server

> appstarter2@1.0.0 build:shared
> npm run build -w shared

> @appstarter/shared@1.0.0 build
> tsc -p tsconfig.esm.json && tsc -p tsconfig.cjs.json && node write-build-metadata.cjs

> server@1.0.0 dev
> tsx watch src/index.ts

=========================================
🔵 SERVER BACKEND
=========================================
🔵 NODE_ENV : development
🟢 Serveur démarré sur : http://localhost:3310
=========================================
```
🟡 Attention
Si le port 3310 est déjà utilisé, modifier PORT dans server/.env et relancer. Le terminal affichera le nouveau port.

<!-- ==================================== -->
# 10 - racine > Tester la route /api/health
▷ Ouvrir http://localhost:3310/api/health dans le navigateur et vérifier que la route répond correctement.

```html
http://localhost:3310/api/health
```
🔵 Sortie attendue
```text
{"status":"ok","message":"Server is running","timestamp":"2025-03-17T10:42:35.127Z"}
```
<!-- ==================================== -->
# 11 - racine > Sauvegarder les modifications
▷ Ajouter les fichiers et commiter les modifications.

```bash
git add .
git commit -m "Base Monorepo 03"
```
