# Publication sur GitHub et déploiement sur Render

Ce guide publie sur GitHub le monorepo avec les branches `main` et `dev`.

- `main` servira à la production.
- `dev` servira à la préproduction.

<!-- ==================================== -->
## 01 - Vérifier l'état du dépôt local

```bash
git status
git log --oneline -5
```

La branche courante doit être `main` et l'historique doit contenir tes commits.

<!-- ==================================== -->
## 02 - Vérifier qu'aucun secret n'est suivi par Git

```bash
git ls-files | grep -E "(^|/)\.env$"
```

La commande ne doit rien afficher. Sinon, retirer le fichier de l'index :

```bash
git rm --cached <chemin/du/.env>
git commit -m "chore: untrack .env"
```

> Un fichier déjà committé reste dans l'historique. S'il contenait des secrets, les régénérer avant de pousser.

<!-- ==================================== -->
## 03 - Créer la branche `dev`

```bash
git show-ref --verify --quiet refs/heads/dev || git branch dev
git branch --list
```

`dev` est créée au même commit que `main` si elle n'existe pas encore.

<!-- ==================================== -->
## 04 - Créer le dépôt distant GitHub

- Aller sur https://github.com/new
- Donner un nom au dépôt
- **Ne rien cocher** (ni README, ni .gitignore, ni licence)
- Cliquer sur **Create repository**

<!-- ==================================== -->
## 05 - Lier le dépôt et pousser `main` et `dev`

```bash
git remote add origin https://github.com/<organisation>/<depot>.git
git push -u origin main dev
```

<!-- ==================================== -->
## 06 - Vérifier les connexions (en cas d'erreur au push)

```bash
git remote -v          # URL du remote
git ls-remote origin   # test de l'accès au dépôt
```

<!-- ==================================== -->
## 07 - Render (préproduction, branche `dev`) : créer le Static Site

- Aller sur https://dashboard.render.com
- Cliquer sur **New +** dans l'en-tête puis **Static Site**
- Sélectionner le dépôt GitHub
- Renseigner :
  - **Name** : nom du site
  - **Branch** : `dev`
  - **Root Directory** : `web`
  - **Build Command** : `npm install && npm run build`
  - **Publish Directory** : `dist`
- Cliquer sur **Deploy Static Site**

<!-- ==================================== -->
## 08 - Render : routage SPA

Dans le Static Site, ouvrir l'onglet **Redirects/Rewrites**, puis cliquer sur **Add Rule**.
ajouter :

- **Source** : `/*`
- **Destination** : `/index.html`
- **Action** : `Rewrite`
- Cliquer sur **Save Changes**

Sans cette règle, un rechargement de page sur une route autre que `/` renvoie une 404.

<!-- ==================================== -->
## 09 - Render : définir les variables d'environnement

Dans le Static Site, onglet **Environment**, ajouter :

| Clé | Valeur |
|---|---|
| `VITE_APP_NAME` | nom du projet |

> Les variables `VITE_*` sont intégrées au build et visibles publiquement. Un changement de valeur nécessite un nouveau déploiement. Ne jamais y mettre de secret.

<!-- ==================================== -->
## 10 - Vérifier le déploiement

- Onglet **Logs** du Static Site pour suivre le build
- Ouvrir l'URL `.onrender.com`
- Tester le rechargement sur une sous-route
- Vérifier que \VITE_APP_NAME` est bien pris en compte`

<!-- ==================================== -->
## 11 - Travailler sur `dev` et déployer en production

### Pousser son travail sur `dev` (préproduction)

```bash
git switch dev
git add .
git status
git commit -m "feat: description du travail"
git push
```

Render redéploie automatiquement la préproduction à chaque push sur `dev`.

### Fusionner `dev` dans `main` (production)

```bash
git switch main
git pull
git merge dev
git push
git switch dev
```

- `git pull` récupère l'état de `main` sur GitHub avant de fusionner, pour éviter un rejet au push.
- `git merge dev` intègre tout le travail de `dev` dans `main`.
- `git push` envoie `main` sur GitHub (et déclenche le déploiement sur Clever Cloud selon ta configuration).
- `git switch dev` te remet sur `dev`, pour ne pas travailler sur `main` par erreur.
