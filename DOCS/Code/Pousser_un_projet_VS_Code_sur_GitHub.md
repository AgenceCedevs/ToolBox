# Pousser un projet VS Code sur GitHub

## 1. Créer le dépôt sur GitHub

1. Aller sur https://github.com/new
2. Donner un nom au dépôt
3. **Ne rien cocher** (ni README, ni .gitignore, ni licence)
4. Cliquer sur **Create repository**

## 2. Initialiser Git dans le dossier

1. Ouvrir le dossier du projet dans VS Code
2. Ouvrir le terminal (`` Ctrl+ù `` ou menu Terminal > Nouveau terminal) à la racine du projet :

```bash
git init
```

## 3. Créer un `.gitignore`

À la racine du projet, créer un fichier `.gitignore` :

```
node_modules
dist
.env
.env.*
*.log
*.tsbuildinfo
coverage
.DS_Store
```

## 4. Premier commit

```bash
git add .
git commit -m "Initial commit"
```

## 5. Lier le dépôt et pousser

Remplacer l'URL par celle du dépôt GitHub :

```bash
git branch -M main
git remote add origin https://github.com/TON-PSEUDO/TON-REPO.git
git push -u origin main
```

## 6. Vérifier les connexions (en cas d'erreur au push)

```bash
git remote -v          # URL du remote
git ls-remote origin   # test de l'accès au dépôt
git status             # état du dépôt local
```

## Commandes utiles ensuite

```bash
git status                  # voir les fichiers modifiés
git add .                   # ajouter les modifications
git commit -m "message"     # enregistrer
git push                    # envoyer sur GitHub
git pull                    # récupérer les changements distants
```
