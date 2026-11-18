Depuis DEV
```bash
git push dev
```

# Commiter DEV

```bash
git status
git add .
git commit -m "Update files"
```
# sauvegader DEV

```bash
git push dev
```

# Fusionner DEV avec RENDER
```bash
git switch render
git pull origin render
git merge dev
```

# Pousser RENDER: déclenche le déploiement
```bash
git push origin render
```

# Revenir sur dev pour continuer à travailler
```bash
git switch dev
```

# Fusionner RENDER avec MAIN
```bash
git switch main
git pull origin main
git merge render
git push origin main
git switch dev
```
