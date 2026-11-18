# Déploiement DEV > RENDER > MAIN

## Phase 1 : Préparer DEV

### 1. Vérifier le code

```bash
npx biome check --write .
npx tsc --noEmit
npm run build
```

> Si une commande échoue, corriger avant de continuer.

### 2. Commiter DEV

```bash
git status
git add .
git commit -m "Update files"
```

> Si `git status` indique « nothing to commit », passer à l'étape 3.

### 3. Sauvegarder DEV

```bash
git push origin dev
```

## Phase 2 : DEV vers RENDER (test)

### 4. Fusionner DEV dans RENDER

```bash
git switch render
git pull origin render
git merge dev
```

### 5. Pousser RENDER (déclenche le déploiement)

```bash
git push origin render
```

### 6. Revenir sur DEV (tests, modifs éventuelles)

```bash
git switch dev
```

> Si des modifs sont nécessaires : les faire sur DEV, puis refaire les phases 1 et 2.

## Phase 3 : RENDER vers MAIN (quand tout est validé)

### 7. Fusionner RENDER dans MAIN

```bash
git switch main
git pull origin main
git merge render
git push origin main
```

### 8. Revenir sur DEV

```bash
git switch dev
```
