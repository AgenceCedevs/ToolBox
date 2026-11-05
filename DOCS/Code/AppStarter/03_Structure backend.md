# 03_Structure backend
Ce module configure le backend Express en TypeScript, charge les variables d’environnement et met en place une route de santé permettant de vérifier le bon fonctionnement du serveur.

À la fin de ce module :

- Le backend démarre sur http://localhost:3310 et se relance automatiquement à chaque sauvegarde.
- L’endpoint /api/health fournit un statut indiquant que le serveur fonctionne correctement.
- CORS est configuré pour accepter les requêtes depuis le frontend sur http://localhost:5173.
- Biome valide le code sans erreur.
<!-- ------------------------------------ -->
# 01 - server > Vérifier les dépendances

Les dépendances du serveur ont déjà été déclarées dans server/package.json.

▷ Vérifier les dépendances installées dans le package server.

```bash
npm list -w server | head -20
🔵 Sortie attendue
server@ /home/user/appStarter/server
├── bcrypt@latest
├── cookie-parser@latest
├── cors@latest
├── dotenv@latest
├── express@latest
├── jsonwebtoken@latest
├── multer@latest
├── pg@latest
└── cloudinary@latest
```
🔵 Info
Si une dépendance manque, la commande npm install à la racine l'installera. Ne relancer que si des lignes rouges apparaissent dans l'éditeur.

<!-- ------------------------------------ -->
# 02 - server > Créer les dossiers et fichiers avec touch
Les fichiers .ts sont créés avec touch, le contenu sera collé dans l'éditeur aux étapes suivantes.

▷ Créer la structure des dossiers et les fichiers vides.

```bash

mkdir -p server/src/routes
touch server/src/index.ts
touch server/src/routes/health.router.ts
```
<!-- ------------------------------------ -->
# 03 - server > Mettre à jour package.json
Le package.json du serveur doit passer en modules ES, disposer des scripts nécessaires et supprimer les champs inutiles.

▷ Exécuter ces commandes pour mettre à jour le package.json.

```bash
cd server
npm pkg set type="module"
npm pkg set private=true
npm pkg set scripts.dev="tsx watch src/index.ts"
npm pkg set scripts.start="node dist/index.js"
npm pkg set scripts.build="tsc"
npm pkg delete scripts.test
npm pkg delete description
npm pkg delete main
npm pkg delete keywords
npm pkg delete author
npm pkg delete license
cd ..
```

🔵 Info
Ces commandes passent le serveur en ES modules ("type": "module"), ajoutent les scripts dev, start et build, et nettoient les champs inutiles du package.json.

<!-- ------------------------------------ -->
# 04 - server > Mettre à jour tsconfig.json
Le serveur nécessite sa propre configuration TypeScript, optimisée pour Node.js avec support des ES modules.

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
<!-- ------------------------------------ -->
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

<!-- ------------------------------------ -->
# 06 - server > src > Remplir index.ts
Le flag --watch de tsx assure le rechargement automatique.

▷ Ouvrir le fichier server/src/index.ts et coller le contenu suivant.

```typescript

import cors from "cors";
import "dotenv/config";
import express from "express";
import healthRouter from "./routes/health.router.js";

const BLUE = "[34m";
const RESET = "[0m";

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

<!-- ------------------------------------ -->
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

<!-- ------------------------------------ -->
# 08 - racine > Vérifier le workspace server/ avec Biome
▷ Corriger les éventuels problèmes de format et vérifier qu'aucune erreur ne subsiste.

```bash

npm run fix
🔵 Sortie attendue
> appStarter@1.0.0 fix
> biome lint --write . && biome format --write .

Checked 38 files in 86ms. No fixes applied.
Formatted 37 files in 34ms. No fixes applied.
```

🟡 Attention
Si Biome affiche encore des erreurs après l’exécution de npm run fix, il faudra les corriger manuellement avant de poursuivre.

<!-- ------------------------------------ -->
# 09 - racine > Lancer le backend
Depuis la racine du monorepo.

▷ Lancer uniquement le workspace server/.

```bash

npm run dev:server
```
🔵 Sortie attendue

```text
> appstarter2@1.0.0 dev:server
> npm run dev -w server

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

<!-- ------------------------------------ -->
# 10 - racine > Tester la route /api/health
▷ Ouvrir http://localhost:3310/api/health dans le navigateur et vérifier que la route répond correctement.

```html
http://localhost:3310/api/health
```
🔵 Sortie attendue
```text
{"status":"ok","message":"Server is running","timestamp":"2025-03-17T10:42:35.127Z"}
```
<!-- ------------------------------------ -->
# 11 - racine > Sauvegarder les modifications
▷ Ajouter les fichiers et commiter les modifications.

```bash
git add .
git commit -m "feat: description de vos modifications"
```
