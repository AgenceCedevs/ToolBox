# Publication sur GitHub et déploiement sur Render

Ce guide publie sur GitHub le monorepo avec les branches `main`, `render` et `dev`.

`feat/...` (unitaire) → `dev` (intégration) → `render` (préprod client) → `main` (production Clever Cloud)

- `feat/...` contient une page en cours de travail.
- `dev` sert à l'intégration : on y assemble plusieurs `feat` pour voir comment elles cohabitent.
- `render` sert à la préproduction : c'est ce que le client voit et valide, **par lot**.
- `main` sert à la production, déployée sur Clever Cloud.

<!-- ==================================== -->
# 01 - Vérifier l'état du dépôt local

```bash
git status
git log --oneline -5
```

La branche courante doit être `main` et l'historique doit contenir tes commits.

<!-- ==================================== -->
# 02 - Vérifier qu'aucun secret n'est suivi par Git

```bash
git ls-files | grep -E "(^|/)\.env$"
```

La commande ne doit rien afficher.

<!-- ==================================== -->
# 03 - Créer les branches `render` et `dev`

```bash
git show-ref --verify --quiet refs/heads/render || git branch render
git show-ref --verify --quiet refs/heads/dev || git branch dev
git branch --list
```

`render` et `dev` sont créées sur le même commit que `main` si elles n'existent pas encore.

<!-- ==================================== -->
# 04 - Créer le dépôt distant GitHub

- Aller sur https://github.com/new
- Donner un nom au dépôt
- **Ne rien cocher** (ni README, ni .gitignore, ni licence)
- Cliquer sur **Create repository**

<!-- ==================================== -->
# 05 - Lier le dépôt et pousser `main`, `render` et `dev`

Récupérer le lien HTTPS du dépôt, puis :

```bash
git remote add origin https://github.com/AgenceCedevs/appStarter.git
git config --local credential.username AgenceCedevs
git push -u origin main render dev
```

`git config --local credential.username` associe ce dépôt au bon compte GitHub (utile si plusieurs comptes sont enregistrés dans Git Credential Manager). Remplacer `AgenceCedevs` par le compte propriétaire du dépôt.

<!-- ==================================== -->
# 06 - Vérifier les connexions (en cas d'erreur au push)

```bash
git remote -v          # URL du remote
git ls-remote origin   # test de l'accès au dépôt
```

<!-- ==================================== -->
# 07 - Basculer sur la branche `dev`

```bash
git switch dev
```

<!-- ==================================== -->
# 08 - Render (préproduction, branche `render`) : créer le Static Site

- Aller sur https://dashboard.render.com
- Cliquer sur **New +** dans l'en-tête puis **Static Site**
- Sélectionner le dépôt GitHub
- Renseigner :
  - **Name** : nom du site
  - **Branch** : `render`
  - **Root Directory** : `web`
  - **Build Command** : `npm install && npm run build`
  - **Publish Directory** : `dist`
- Cliquer sur **Deploy Static Site**

Le premier déploiement affiche une page en erreur tant que les variables d'environnement ne sont pas renseignées (étape suivante).

<!-- ==================================== -->
# 09 - Render : variables d'environnement

Vite intègre les variables `VITE_*` **au moment du build** : sans elles, les valeurs sont `undefined` et l'application plante (ex. `Invalid URL`).

Dans le Static Site, ouvrir l'onglet **Environment**, puis cliquer sur **Add variable** pour **chaque** variable :

| Clé | Valeur |
|---|---|
| `VITE_APP_NAME` | nom du projet (ex. `app Starter`) |
| `VITE_APP_URL` | URL complète du site, avec `https://` (ex. `https://appstarter.onrender.com`) |

- Une ligne par variable : ne jamais modifier une ligne existante pour y mettre une autre variable.
- Pas d'espace ni de guillemets autour des valeurs.
- La liste doit correspondre aux variables de `web/.env.sample`. Pour les retrouver : `grep -rn "import.meta.env" web/src`.
- Cliquer sur **Save and deploy** : toute modification de variable nécessite un nouveau build.

🟡 Le site peut n'apparaître qu'après 1 à 2 min.

<!-- ==================================== -->
# 10 - Render : routage SPA

Dans le Static Site, ouvrir l'onglet **Redirects/Rewrites**, puis cliquer sur **Add Rule**.
Ajouter :

- **Source** : `/*`
- **Destination** : `/index.html`
- **Action** : `Rewrite`
- Cliquer sur **Save Changes**

Sans cette règle, un rechargement de page sur une route autre que `/` renvoie une 404.

<!-- ==================================== -->
# 11 - Vérifier le déploiement

- Onglet **Logs** du Static Site pour suivre le build
- Ouvrir l'URL `.onrender.com`
- Tester le rechargement sur une sous-route
- Vérifier que `VITE_APP_NAME` et `VITE_APP_URL` sont bien pris en compte (nom affiché, balises `og:url` et `canonical` correctes dans les sources de la page)

<!-- ==================================== -->
# 12 - Travailler sur `dev`, valider avec le client, publier en production

Le client valide **par lot** : le contenu de `dev` est montré en préprod, puis publié en bloc.

Render redéploie automatiquement la préproduction à chaque push sur `render` qui modifie des fichiers dans `web/` (Root Directory).

## Démarrer une page

```bash
git switch dev
git pull
git switch -c feat/nouvelle-page

# --- tu crées la page, puis à chaque étape ---
git add .
git status
git commit -m "feat: ajout de la page nouvelle-page"
git push -u origin feat/nouvelle-page   # -u seulement au 1er push, ensuite : git push
```

## Intégrer dans `dev`

```bash
git switch dev
git pull
git merge feat/nouvelle-page
git push
```

Ne supprime pas la branche `feat` tant que le lot n'est pas validé. Répète ces deux étapes pour chaque page du lot.

## Montrer au client (préprod)

```bash
git switch render
git pull
git merge dev
git push
git switch dev
```

Render redéploie. Le client voit tout le lot.

## Cas A : le client valide le lot → production

```bash
git switch main
git pull
git merge dev
git push
git switch dev
```

- `git merge dev` publie tout le lot validé dans `main`.
- `git push` envoie `main` sur GitHub et déclenche le déploiement sur Clever Cloud.
- `git switch dev` te remet sur `dev`, pour ne pas travailler sur `main` par erreur.

Nettoyage des branches `feat` du lot :

```bash
git branch -d feat/nouvelle-page
git push origin --delete feat/nouvelle-page   # optionnel
```

## Cas B : le client demande des modifications

Tu corriges dans la `feat` concernée, puis tu repasses par `dev` et `render` :

```bash
git switch feat/nouvelle-page

# --- tu corriges, puis ---
git add .
git commit -m "fix: retours client sur nouvelle-page"
git push

git switch dev
git pull
git merge feat/nouvelle-page
git push

git switch render
git pull
git merge dev
git push
git switch dev
```

Le client revalide, puis tu passes au cas A.

## Cas C : le client refuse une page du lot

Il faut l'enlever de `dev` (`main` ne l'a jamais reçue), puis mettre à jour la préprod :

```bash
git switch dev
git pull
git log --oneline -10                  # repère le hash du commit de merge de la page
git revert -m 1 <hash-du-merge>
git push

git switch render
git pull
git merge dev
git push
git switch dev
```

La branche `feat/nouvelle-page` existe toujours, tu peux la reprendre plus tard.

⚠️ Pour la re-fusionner dans `dev`, il faut d'abord annuler le revert (`git revert <hash-du-revert>` sur `dev`). Sinon Git considère les changements comme déjà intégrés puis retirés, et le merge n'apportera rien.

<!-- ==================================== -->
# 13 - Correctif urgent en production (hotfix)

Si `main` doit être corrigé alors que `dev` contient un lot non validé, on part de `main` :

```bash
git switch main
git pull
git switch -c fix/urgence
# --- tu corriges, puis ---
git add .
git commit -m "fix: description du correctif"

git switch main
git merge fix/urgence
git push                               # déploiement Clever Cloud

git switch dev
git pull
git merge main                         # le correctif rejoint dev
git push

git switch render
git pull
git merge main                         # le correctif rejoint la préprod
git push
git switch dev
git branch -d fix/urgence
```
