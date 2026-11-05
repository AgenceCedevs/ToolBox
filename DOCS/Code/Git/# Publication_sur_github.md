# Publication sur GitHub

Ce guide publie sur GitHub le monorepo préparé au [module 01](../AppStarter/01_Initialisation%20d'un%20monorepo.md), avec les branches `main` et `dev`. `main` servira à la production et `dev` à la préproduction du [module 05](../AppStarter/05%20-%20D%C3%A9ploiement%20production%20et%20pr%C3%A9production.md).

## 1 - Vérifier la racine et le `.gitignore`

Ouvrir le terminal à la racine du monorepo et vérifier les fichiers ignorés avant de les ajouter.

```bash
git status
```

Le `.gitignore` doit exclure au minimum `.env`, `server/.env`, `web/.env`, `mobile/.env`, `node_modules/` et les dossiers personnels comme `.vscode/`. Aucun secret ni fichier `.env` ne doit apparaître parmi les fichiers à publier.

## 2 - Vérifier la branche et le commit initial

```bash
git branch --show-current
git log -1 --oneline
```

Le module 01 initialise Git, crée le commit initial et nomme la branche `main`. Si le dépôt a été créé avec une ancienne version du module et que la branche courante est encore la branche initiale (par exemple `master`), et que `main` n'existe pas déjà en local, la renommer en `main` avant de continuer :

```bash
git branch -M main
```

Vérifier ensuite le `.gitignore`, puis préparer les changements restants s'il y en a :

```bash
git add .
git status
```

Avant tout commit, vérifier une dernière fois que les fichiers `.env` et les secrets ne sont pas dans le staging. Si `git status` affiche des changements à enregistrer, créer un commit :

```bash
git commit -m "chore: préparer la publication GitHub"
```

## 3 - Créer le dépôt distant GitHub

Créer un dépôt vide sur GitHub, sans README, licence ni `.gitignore` générés à distance : cela évite de créer un historique concurrent avec le commit local.

Ajouter l'URL SSH ou HTTPS du dépôt comme remote `origin` :

```bash
git remote add origin "<URL_DU_DEPOT_GITHUB>"
git remote -v
```

Remplacer `<URL_DU_DEPOT_GITHUB>` par l'URL fournie par GitHub. Ne pas inscrire de token personnel dans cette URL ni dans un fichier du projet.

## 4 - Publier `main` et créer `dev`

Pousser d'abord `main`, puis créer `dev` à partir du même commit initial :

```bash
git push -u origin main
git switch -c dev
git push -u origin dev
```

Les deux branches sont maintenant disponibles sur GitHub. Elles contiennent le même commit initial ; elles évolueront séparément par la suite.

## 5 - Vérifier GitHub

Sur la page GitHub du dépôt, vérifier que :

- les branches `main` et `dev` existent ;
- les fichiers attendus sont présents ;
- `.env`, `server/.env`, `web/.env` et `mobile/.env` sont absents ;
- `node_modules/` et `.vscode/` sont absents.

🔴 Erreur à éviter
Ne pousse jamais un fichier `.env` ou un secret. Si un secret a été publié, le révoquer ou le renouveler immédiatement ; supprimer le fichier dans un commit ultérieur ne l'efface pas de l'historique Git.

## Workflow courant

Travailler sur `dev`, pousser les changements pour la validation, puis fusionner dans `main` après approbation :

```bash
git switch dev
git add .
git commit -m "feat: description de la modification"
git push origin dev

# Après validation :
git switch main
git pull --ff-only origin main
git merge dev
git push origin main
git switch dev
```

Les plateformes de préproduction et de production configurées dans le [module 05 AppStarter](../AppStarter/05%20-%20D%C3%A9ploiement%20production%20et%20pr%C3%A9production.md) suivent respectivement `dev` et `main`.
