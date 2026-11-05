# 05 - Déploiement production et préproduction

Ce module déploie le monorepo sur deux environnements séparés : `main` en production sur Clever Cloud et `dev` en préproduction sur Render, pour que le client valide les changements avant leur mise en production.

À la fin de ce module :

- Les branches `main` et `dev` existent sur GitHub.
- Les modifications poussées sur `main` mettent à jour la production Clever Cloud.
- Les modifications poussées sur `dev` mettent à jour la préproduction Render.
- Le frontend, l'API et PostgreSQL disposent chacun de ressources distinctes pour chaque environnement.
- Les URL, secrets et identifiants sont configurés dans les plateformes, pas inscrits en dur dans le code ou dans Git.

🔵 Prérequis
Terminer les [modules 01 à 04](./01_Initialisation%20d'un%20monorepo.md), publier le dépôt sur GitHub et avoir accès à des comptes Clever Cloud et Render. Le dépôt doit contenir le commit initial et un `package-lock.json` à la racine.

## Architecture cible

```text
GitHub
├── main ──→ Clever Cloud PRODUCTION
│            ├── site statique (web/)
│            ├── application Node.js (server/)
│            └── PostgreSQL de production
│
└── dev ───→ Render PRÉPRODUCTION
             ├── Static Site (web/)
             ├── Web Service (server/)
             └── PostgreSQL de préproduction
```

Les services du monorepo doivent être créés depuis la racine du dépôt. Ne définis pas `web/` ou `server/` comme répertoire racine de build : ces workspaces dépendent du package `shared/` et du `package-lock.json` racine.

🟡 Attention
Ne connecte jamais la préproduction à la base de production. Les données, identifiants et URL des deux environnements doivent être distincts.

## 01 - racine > Créer et publier les branches `main` et `dev`

Vérifier que le commit initial existe et que `origin` pointe vers le dépôt GitHub. Le module 01 nomme explicitement la branche initiale `main`; cette étape vérifie et publie les deux branches sans renommer une branche de travail existante. Si `dev` n'existe pas encore en local, remplacer `git switch dev` par la commande de création indiquée ci-dessous.

▷ Depuis la racine du monorepo, exécuter :

```bash
git status
git branch --list
git switch main
git push -u origin main
git switch dev
git push -u origin dev
```

🔵 Sortie attendue
Les deux branches `main` et `dev` apparaissent dans le dépôt GitHub et pointent initialement sur le même commit.

🟡 Attention
Si `main` n'existe pas encore dans un dépôt créé avec une ancienne version du module 01, vérifier que la branche courante est bien la branche initiale puis la renommer avec `git branch -M main`. Si `dev` n'existe ni en local ni sur GitHub, la créer depuis `main` avec `git switch -c dev`; si elle existe seulement sur GitHub, utiliser `git switch --track origin/dev`. Dans les deux cas, pousser ensuite `dev` avec `git push -u origin dev`. Si `origin` n'existe pas, terminer d'abord la publication GitHub décrite dans [Publication sur GitHub](../Git/%23%20Publication_sur_github.md). Si GitHub a déjà un commit qui n'existe pas en local (par exemple un README créé à distance), synchroniser les historiques avant le push ; ne force pas le push.

## 02 - Clever Cloud > Préparer les ressources de production

Créer sur Clever Cloud une application Static pour le frontend, une application Node.js pour l'API, et un addon PostgreSQL. Connecter les deux applications au même dépôt GitHub et choisir `main` comme branche de déploiement pour chacune.

🔵 Info
Dans les informations de chaque application Clever Cloud connectée à GitHub, sélectionner `main` comme branche de déploiement. L'intégration GitHub redéploie ensuite l'application lorsqu'un nouveau commit est poussé sur cette branche. Les réglages de branche se font sur chaque application.

### 2.1 - Clever Cloud > Configurer le site statique

Sur l'application Static, définir les variables d'environnement suivantes. Les valeurs sont relatives à la racine du dépôt :

| Variable | Valeur |
|---|---|
| `CC_BUILD_COMMAND` | `npm ci --include=dev && npm run build:shared && npm run build -w web` |
| `CC_WEBROOT` | `web/dist` |
| `VITE_APP_NAME` | Nom de l'application |
| `VITE_APP_URL` | URL publique du frontend |
| `VITE_API_URL` | URL publique de l'API suivie de `/api` |

`VITE_API_URL`, `VITE_APP_NAME` et `VITE_APP_URL` sont utilisées lors de la compilation du frontend. Après avoir obtenu les domaines fournis par Clever Cloud, renseigner leurs vraies valeurs dans le tableau de bord puis relancer le déploiement.

Ne place aucune clé privée, mot de passe ou autre secret dans une variable `VITE_*` : ces valeurs sont intégrées au JavaScript envoyé au navigateur. Pour `CLIENT_URL`, utiliser uniquement l'origine du frontend (schéma et domaine), sans chemin ni barre oblique finale.

Pour que les URL gérées par React fonctionnent aussi après actualisation, créer un fichier `Caddyfile` à la racine du dépôt. Clever Cloud détecte ce fichier et l'utilise pour servir le site :

```caddyfile
:8080 {
	root * {$CC_WEBROOT}
	try_files {path} /index.html
	file_server
}
```

Cette règle renvoie les routes qui ne correspondent pas à un fichier statique vers `index.html`, où le routeur React les traite.

### 2.2 - Clever Cloud > Configurer l'API

Sur l'application Node.js, conserver la racine du dépôt et définir :

| Variable | Valeur |
|---|---|
| `CC_NODE_DEV_DEPENDENCIES` | `install` |
| `CC_POST_BUILD_HOOK` | `npm run build:shared && npm run build -w server` |
| `CC_RUN_COMMAND` | `npm start` |
| `NODE_ENV` | `production` |
| `PORT` | `8080` |
| `CLIENT_URL` | URL publique du frontend Clever Cloud |
| `CC_HEALTH_CHECK_PATH` | `/api/health` |
| `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE` | Valeurs de l'addon PostgreSQL de production |

Le hook de compilation construit `shared/` avant `server/`. `CC_NODE_DEV_DEPENDENCIES=install` est nécessaire, car TypeScript et les outils de compilation sont des dépendances de développement. Le script `start` à la racine, ajouté au module 01, démarre le workspace serveur.

Créer et lier l'addon PostgreSQL à cette application, puis renseigner les variables `PG*` attendues par le client de base de données du module 04 avec les valeurs exposées par l'addon. Ne pas mettre ces identifiants dans un fichier versionné. Après l'attribution du domaine du frontend, renseigner `CLIENT_URL` avec son origine exacte et redéployer l'API.

🔵 Info
Clever Cloud attend que l'application Node.js écoute sur le port public `8080`. L'API lit déjà `PORT` depuis l'environnement ; le port local `3310` reste réservé au développement.

### 2.3 - Clever Cloud > Initialiser la base de production

Appliquer une fois le schéma `server/database/script/schema.sql` à la base de production, avec un outil SQL autorisé par le fournisseur et les paramètres de connexion de l'addon. Vérifier la cible avant toute exécution.

🔴 Attention
Ne lance pas `npm run db:init` pour initialiser une base hébergée : le script du module 04 démarre Docker Compose et est destiné à la base locale. N'exécute pas de commande de suppression ou de réinitialisation sur la base de production.

## 03 - Render > Préparer les ressources de préproduction

Créer un PostgreSQL, un Web Service pour l'API et un Static Site pour le frontend. Pour chacun des deux services applicatifs, connecter le dépôt GitHub et sélectionner la branche `dev`. Laisser le répertoire racine vide pour que Render utilise la racine du monorepo.

### 3.1 - Render > Configurer la base PostgreSQL

Créer une base de préproduction dans la même région que les services Render. Copier ses paramètres de connexion internes depuis le tableau de bord. Ils seront renseignés sur le Web Service sous les noms `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD` et `PGDATABASE`.

Appliquer une fois `server/database/script/schema.sql` à cette base avec un outil SQL adapté. Vérifier que la connexion pointe bien vers la base de préproduction, jamais vers la production.

### 3.2 - Render > Configurer le Web Service de l'API

Renseigner les commandes depuis la racine du dépôt :

| Réglage | Valeur |
|---|---|
| Branch | `dev` |
| Root Directory | Laisser vide |
| Build Command | `npm ci --include=dev && npm run build:shared && npm run build -w server` |
| Start Command | `npm start` |

Dans **Environment**, ajouter `NODE_ENV=production`, `CLIENT_URL` avec l'origine du Static Site Render, ainsi que les cinq variables PostgreSQL avec les valeurs internes de la base Render. Render fournit `PORT` au Web Service : ne pas le remplacer par le port local. Après l'attribution du domaine du Static Site, vérifier `CLIENT_URL` et redéployer l'API si nécessaire.

### 3.3 - Render > Configurer le Static Site du frontend

Renseigner les réglages suivants :

| Réglage | Valeur |
|---|---|
| Branch | `dev` |
| Root Directory | Laisser vide |
| Build Command | `npm ci --include=dev && npm run build:shared && npm run build -w web` |
| Publish Directory | `web/dist` |
| Auto-Deploy | Activé |

Pour éviter que Render lance aussi une installation automatique distincte, ajouter `SKIP_INSTALL_DEPS=true` dans l'environnement du Static Site. Ajouter également `VITE_APP_NAME`, `VITE_APP_URL` et `VITE_API_URL` avec les valeurs de préproduction. `VITE_API_URL` doit pointer vers le Web Service Render et se terminer par `/api`.

Dans **Redirects/Rewrites**, ajouter la règle SPA suivante :

| Source | Destination | Action |
|---|---|---|
| `/*` | `/index.html` | Rewrite |

Cette règle permet au routeur React de traiter les URL de pages internes, y compris après actualisation du navigateur.

### 3.4 - Render > Initialiser et vérifier l'API

Créer d'abord la base, puis les services applicatifs. Vérifier les logs de build et attendre le statut **Live** pour chaque service. Après l'obtention des domaines Render, mettre à jour `CLIENT_URL` sur l'API et `VITE_API_URL` sur le Static Site avec les domaines réels. Enregistrer les changements et redéployer l'API ; pour le Static Site, lancer **Save, rebuild, and deploy** afin que Vite incorpore la bonne URL.

## 04 - Vérifier les deux environnements

Après le déploiement, vérifier les points suivants pour chaque environnement :

1. L'URL du frontend affiche l'application.
2. Une URL de page interne fonctionne aussi après actualisation.
3. L'endpoint `https://<URL_API>/api/health` répond avec le statut de santé attendu.
4. Les logs de l'API confirment la connexion à la base correspondante.
5. Les logs de déploiement indiquent le commit et la branche attendus.
6. La préproduction ne contient aucune donnée ni aucun secret de production.

Si un paramètre `VITE_*` change, reconstruire le frontend : ces variables sont intégrées au bundle pendant le build. Les variables de l'API et de la base sont configurées séparément dans le service backend.

## 05 - Workflow de validation puis mise en production

Pousser les changements de développement sur `dev`. Render redéploie la préproduction ; transmettre son URL au client pour validation.

```bash
git switch dev
git add .
git commit -m "feat: description de la modification"
git push origin dev
```

Après validation du client, fusionner `dev` dans `main` et pousser. Clever Cloud redéploie les applications de production configurées sur `main`.

```bash
git switch main
git pull --ff-only origin main
git merge dev
git push origin main
git switch dev
```

Si la fusion présente des conflits, les résoudre puis tester avant de pousser `main`. Ne jamais pousser directement un changement non validé sur `main`.

## Récapitulatif

| Ressource | Production | Préproduction |
|---|---|---|
| Branche | `main` | `dev` |
| Hébergeur | Clever Cloud | Render |
| Frontend | Static, `web/dist` | Static Site, `web/dist` |
| API | Node.js, workspace `server` | Web Service, workspace `server` |
| Base de données | PostgreSQL Clever Cloud | PostgreSQL Render |
| Mise à jour | Push GitHub sur `main` | Push GitHub sur `dev` |
| Validation client | Non | Oui |

## Documentation officielle

- [Clever Cloud - applications Node.js](https://www.clever.cloud/developers/doc/deploy/applications/nodejs/)
- [Clever Cloud - applications statiques et commande de build](https://www.clever.cloud/developers/doc/deploy/applications/static/)
- [Clever Cloud - variables d'environnement](https://www.clever.cloud/developers/doc/develop/common-configuration/environment-variables/)
- [Clever Cloud - hooks de déploiement](https://www.clever.cloud/developers/doc/develop/common-configuration/build-hooks/)
- [Clever Cloud - PostgreSQL](https://www.clever.cloud/developers/doc/deploy/databases/postgresql/)
- [Clever Cloud - démarrage et choix de branche GitHub](https://www.clever.cloud/developers/doc/getting-started/)
- [Render - monorepo et répertoire racine](https://render.com/docs/monorepo-support)
- [Render - Static Sites](https://render.com/docs/static-sites)
- [Render - Web Services](https://render.com/docs/web-services)
- [Render - déploiements automatiques](https://render.com/docs/deploys)
- [Render - variables d'environnement](https://render.com/docs/configure-environment-variables)
- [Render - PostgreSQL](https://render.com/docs/postgresql-creating-connecting)
