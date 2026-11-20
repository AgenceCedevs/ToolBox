# Le terminal et Git Bash

## Généralités

- **Terminal = Console = CLI**
- Permet de naviguer dans les fichiers, créer, supprimer, copier, déplacer et renommer avec des commandes textuelles.
- Les terminaux les plus connus : **CMD**, **PowerShell**, **Git Bash**.

### Bonnes pratiques

- Faire attention à l'orthographe des dossiers et fichiers.
- Mettre le nom entre guillemets s'il est composé.
- L'autocomplétion se fait avec la touche `Tab`.
- Pas d'espace entre les mots.
- **Ne jamais travailler sur la branche `main`.**
- Ne pas envoyer de fichier vide.

> Les commandes marquées d'une `*` sont des commandes Git importantes.

---

## Navigation

| Action | Commande |
| --- | --- |
| Savoir où on se trouve | `pwd` |
| Accéder à un répertoire | `cd "nom du dossier"/"nom du sous-dossier"/...` |
| Remonter d'un niveau (parent) | `cd ..` |
| Dossier utilisateur | `cd ~` |
| Revenir à la racine | `cd` |
| Nettoyer le terminal | `clear` |
| Ouvrir VS Code | `code .` |

## Affichage et listing

| Action | Commande |
| --- | --- |
| Afficher les fichiers | `ls` |
| Afficher les fichiers cachés | `ls -a` |
| Afficher les fichiers cachés uniquement | `ls -d` |
| Afficher les fichiers verticalement | `ls -1` |
| Afficher les permissions | `ls -l` |
| Énumérer tous les fichiers des sous-répertoires | `ls -R` |
| Afficher le contenu d'un fichier | `cat "nom du fichier"` |
| Comparer le texte de deux fichiers | `diff "nom du fichier 1" "nom du fichier 2"` |

## Raccourcis clavier

| Action | Raccourci |
| --- | --- |
| Annuler | `Ctrl + C` |
| Compléter par autocomplétion | `Tab` |
| Afficher la commande précédente | `↑` (flèche du haut) |
| Afficher la commande suivante | `↓` (flèche du bas) |
| Répéter la dernière commande | `!!` |

## Fichiers et dossiers

| Action | Commande |
| --- | --- |
| Créer un fichier | `touch "nom du fichier"` |
| Créer un fichier vide pour garder un dossier dans Git | `.gitkeep` |
| Créer un répertoire | `mkdir "nom du répertoire"` |
| Écrire dans un fichier | `echo "texte" > "nom du fichier"` |
| Copier un fichier | `cp "nom du fichier à copier" "nom de la copie"` |
| Copier un répertoire | `cp -r "répertoire à copier" "répertoire de destination"` |
| Déplacer un fichier | `mv "nom du fichier" "chemin de destination"` |
| Déplacer un fichier dans le dossier parent | `mv "chemin de départ" "nom du dossier"` |
| Renommer un fichier | `mv "ancien nom" "nouveau nom"` |
| Supprimer un fichier | `rm "nom du fichier"` |
| Supprimer un dossier | `rm -r "nom du dossier"` |
| Supprimer un dossier radicalement | `rm -rf "nom du dossier"` |

## Recherche

| Action | Commande |
| --- | --- |
| Rechercher du texte dans un fichier | `grep "mot" "nom du fichier"` |
| Rechercher un fichier / un répertoire | `find "répertoire" -name "nom"` |
| Localiser un fichier | `locate "nom"` |

## Git

### État et initialisation

| Action | Commande |
| --- | --- |
| `*` Afficher l'état du répertoire de travail et de la zone de préparation | `git status` |
| `*` Transformer un dossier classique en projet Git local | `git init` |
| `*` Importer un projet depuis GitHub | `git clone "clé SSH GitHub"` |
| Récupérer les URL des dépôts distants configurés | `git remote -v` |
| Revenir sur les versions antérieures | `git checkout` |

### Branches

| Action | Commande |
| --- | --- |
| Liste des branches | `git branch` |
| Créer une branche | `git branch "nom de la branche"` |
| Créer une branche et basculer dessus | `git switch -c "nom"` |
| Basculer d'une branche à l'autre | `git switch "nom"` |
| Fusionner la branche distante et la branche locale | `git merge origin/main` |

### Sauvegarde et envoi

| Action | Commande |
| --- | --- |
| `*` Placer tous les fichiers dans la zone intermédiaire (staging) | `git add .` |
| `*` Placer un fichier dans la zone intermédiaire (staging) | `git add "nom du fichier"` |
| `*` Réaliser un commit | `git commit -m "description courte en anglais"` |
| `*` Envoyer le travail (première fois) | `git push origin nom-de-la-branche` |
| `*` Envoyer le travail | `git push` |

### Récupération

| Action | Commande |
| --- | --- |
| `*` Récupérer le travail | `git pull -u origin "nom de la branche"` |
| Récupérer localement la branche distante | `git fetch` |
| Récupérer localement la branche distante sans fusion | `git fetch origin` |

---

## Lier un projet Git et GitHub

1. **GitHub** : créer un repository sur la plateforme (« projet »).
2. **GitHub** : récupérer la ligne `git remote add` en bas de la page.
3. **Git** : créer le dossier projet qui accueillera le projet.
4. **Git** : créer un fichier `index.html` afin que le dossier ne soit pas vide (important).
5. **Git** : se rendre dans le dossier à lier.
6. **Git** : `git init` pour créer le dossier passerelle.
7. **Git** : `git status` pour vérifier les fichiers à exporter.
8. **Git** : `git add .` pour mettre les fichiers dans la zone de staging.
9. **Git** : `git status` pour vérifier l'intégration des fichiers dans la zone de staging.
10. **Git** : `git commit -m "first commit"` pour valider les fichiers.
11. **Git** : `git remote add origin https://github.com/CedricGOUYON/Test-23h15.git`
12. **Git** : `git push -u origin main` pour envoyer le dossier sur GitHub.

## Envoyer les mises à jour depuis le terminal Git

1. Se rendre dans le dossier projet.
2. `git status`
3. `git add .`
4. `git commit -m "second commit"`
5. `git push`

## Récupérer les mises à jour depuis le terminal Git

1. Se rendre dans le dossier projet.
2. `git pull`
