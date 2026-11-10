# Publication sur GitHub et déploiement sur Render

Ce guide publie sur GitHub le monorepo avec les branches `main` et `dev`.

- `main` servira à la production.
- `dev` servira à la préproduction.

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
# 03 - Créer la branche `dev`

```bash
git show-ref --verify --quiet refs/heads/dev || git branch dev
git branch --list
```

`dev` est créée sur le même commit que `main` si elle n'existe pas encore.

<!-- ==================================== -->
# 04 - Créer le dépôt distant GitHub

- Aller sur https://github.com/new
- Donner un nom au dépôt
- **Ne rien cocher** (ni README, ni .gitignore, ni licence)
- Cliquer sur **Create repository**

<!-- ==================================== -->
# 05 - Lier le dépôt et pousser `main` et `dev`

Récupérer le lien HTTPS du dépôt, puis :

```bash
git remote add origin https://github.com/AgenceCedevs/appStarter.git
git config --local credential.username AgenceCedevs
git push -u origin main dev
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
# 08 - Render (préproduction, branche `dev`) : créer le Static Site

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

🟡 le site peut apparaitre que 1 a 2 min apres

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
# 12 - Travailler sur `dev` et déployer en production

## Pousser son travail sur `dev` (préproduction)

```bash
git switch dev
git add .
git status
git commit -m "feat: description du travail"
git push
```

Render redéploie automatiquement la préproduction à chaque push sur `dev` qui modifie des fichiers dans `web/` (Root Directory).

## Fusionner `dev` dans `main` (production)

```bash
git switch main
git pull
git merge dev
git push
git switch dev
```

- `git pull` récupère l'état de `main` sur GitHub avant de fusionner, pour éviter un rejet au push.
- `git merge dev` intègre tout le travail de `dev` dans `main`.
- `git push` envoie `main` sur GitHub (et déclenche le déploiement de la production sur Clever Cloud (selon ta configuration)).
- `git switch dev` te remet sur `dev`, pour ne pas travailler sur `main` par erreur.


# ============ DÉMARRER LA NOUVELLE PAGE ============
git switch dev
git pull
git switch -c feat/nouvelle-page

# --- tu crées la page, puis à chaque étape ---
git add .
git status
git commit -m "feat: ajout de la page nouvelle-page"
git push -u origin feat/nouvelle-page   # -u seulement au 1er push, ensuite : git push

# ============ MONTRER AU CLIENT (préprod) ============
git switch dev
git pull
git merge feat/nouvelle-page
git push
# ne supprime PAS la branche tant que le client n'a pas validé

# ============ CAS A : le client valide → production ============
git switch main
git pull
git merge dev
git push
git switch dev
git branch -d feat/nouvelle-page
git push origin --delete feat/nouvelle-page   # optionnel

# ============ CAS B : le client demande des modifications ============
git switch dev
git pull
git switch -c fix/nouvelle-page-retours

# --- tu corriges, puis ---
git add .
git commit -m "fix: retours client sur nouvelle-page"
git push -u origin fix/nouvelle-page-retours

git switch dev
git pull
git merge fix/nouvelle-page-retours
git push
git branch -d fix/nouvelle-page-retours
git push origin --delete fix/nouvelle-page-retours   # optionnel
# → le client revalide, puis CAS A

# ============ CAS C : le client refuse la page ============
git switch dev
git pull
git log --oneline -10                  # repère le hash du commit de merge
git revert -m 1 <hash-du-merge>
git push
# la branche feat/nouvelle-page existe toujours, tu peux la reprendre plus tard
