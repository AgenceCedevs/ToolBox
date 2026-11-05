Git-publication-sur-GitHub
Les étapes
1 — Revenir à la racine du projet
S'assurer d'être dans le dossier racine du monorepo. Taper pwd pour vérifier le chemin courant, il doit se terminer par le nom du projet.

bash
▼ Replier
📋 Copier
cd ..
2 — Formater les fichiers avec Biome
Avant le premier commit, appliquer le formatage Biome à tous les fichiers du projet. Cela garantit une cohérence de style avant la publication sur GitHub.

bash
▼ Replier
📋 Copier
npx @biomejs/biome format --write .
🔵 Sortie attendue
Formatted 45 files in 2.34s
🔵 Info
Cette commande parcoure le projet et formate tous les fichiers reconnus (TypeScript, JSX, JSON, etc.) selon la configurationbiome.json de la racine. Aucune modification fonctionnelle, juste du formatage.

3 — Initialiser le dépôt Git local
Créer un dépôt Git local dans le dossier racine. Cela crée un dossier caché .git/ qui contient l'historique des commits.

bash
▼ Replier
📋 Copier
git init
🔵 Sortie attendue
Initialized empty Git repository in C:\Users\Cédric\desktop\LOCAL\appStarter\.git\
4 — Vérifier les fichiers à suivre
Afficher le statut du dépôt Git. Les fichiers affichés en rouge sont ceux non encore suivis. Grâce au .gitignore créé en T-01, les dossiers sensibles ne doivent pas apparaître.

bash
▼ Replier
📋 Copier
git status
🔵 Sortie attendue
On branch master

No commits yet

Untracked files:
  (use "git add <file>..." to include in what will be committed)
        .env
        .gitignore
        .vscode/
        biome.json
        docker-compose.yml
        mobile/
        package.json
        package-lock.json
        server/
        setup/
        tsconfig.json
        web/

nothing added to commit but untracked files present (tracked by git)
🟡 Attention
Important : Vérifier que node_modules/ n'apparaît pas dans la liste. Si c'est le cas, vérifier que le fichier .gitignore existe à la racine et qu'il contient bien la ligne node_modules/.

🔵 Info
Le .env figure dans la liste mais est dans le .gitignore à l'étape suivante. C'est l'étape 5 qui ajoutera les fichiers au staging (Git vérifiera le .gitignore à ce moment-là).

5 — Ajouter les fichiers au staging
Ajouter tous les fichiers du projet au staging Git, en excluant automatiquement ceux listés dans .gitignore.

bash
▼ Replier
📋 Copier
git add .
🔵 Info
Cette commande lit le .gitignore et ignore les fichiers sensibles. node_modules/, .env et .vscode/ ne sont pas ajoutés au staging.

6 — Vérifier l'intégration dans le staging
Afficher le statut du dépôt après l'ajout. Les fichiers en vert sont prêts à être committés.

bash
▼ Replier
📋 Copier
git status
🔵 Sortie attendue
On branch master

No commits yet

Changes to be committed:
  (use "git rm --cached <file>..." to unstage)
        new file:   .gitignore
        new file:   biome.json
        new file:   docker-compose.yml
        new file:   package.json
        new file:   package-lock.json
        new file:   tsconfig.json
        new file:   mobile/package.json
        new file:   server/.env
        new file:   server/
🔵 Info
Les fichiers en vert (Changes to be committed) sont prêts à être committés. node_modules/, .env (racine) et .vscode/ n'apparaissent pas, ils sont correctement ignorés par .gitignore.

7 — Créer un commit avec un message
Enregistrer tous les fichiers du staging dans un commit local avec un message descriptif.

bash
▼ Replier
📋 Copier
git commit -m "first project commit"
🔵 Sortie attendue
[master (root-commit) a1b2c3d] first project commit
 52 files changed, 1850 insertions(+)
 create mode 100644 .gitignore
 create mode 100644 biome.json
 create mode 100644 docker-compose.yml
 create mode 100644 package.json
 ...
🔵 Info
Le premier commit est maintenant enregistré dans le dépôt local. Le hash a1b2c3d (variable selon ton cas) identifie de manière unique ce commit.

8 — Lier Git au dépôt GitHub
Connecter le dépôt local au dépôt distant sur GitHub.

Option 1 — SSH (recommandé si SSH est configuré) :

bash
▼ Replier
📋 Copier
git remote add origin "CLÉ SSH"
Option 2 — HTTPS (plus simple, pas de clé SSH) :

bash
▼ Replier
📋 Copier
git remote add origin "LIEN HTTPS"
🔵 Info
SSH ou HTTPS ?
SSH : Requiert une clé privée configurée, plus sécurisé pour le long terme, pas de mot de passe à chaque push.
HTTPS : Utilise un token GitHub (généré en Settings > Developer settings > Personal access tokens), plus simple pour débuter.

9 — Vérifier la connexion au dépôt distant
Afficher la liste des dépôts distants liés au dépôt local. Doit afficher origin pointant vers GitHub.

bash
▼ Replier
📋 Copier
git remote -v
🔵 Sortie attendue
origin  git@github.com:USERNAME/REPO_NAME.git (fetch)
origin  git@github.com:USERNAME/REPO_NAME.git (push)
🔴 Erreur fréquente
Si aucune sortie n'apparaît, vérifier que la commande de l'étape 8 a été lancée correctement. Relancer la commande avec la bonne URL.

10 — Envoyer le projet sur GitHub
Pousser tous les commits du dépôt local vers GitHub, branche main. Le flag -u établit un lien de suivi entre la branche locale et la branche distante.

bash
▼ Replier
📋 Copier
git push -u origin main
🔵 Sortie attendue
Enumerating objects: 52, done.
Counting objects: 100% (52/52), done.
Delta compression using up to 8 threads
Compressing objects: 100% (40/40), done.
Writing objects: 100% (52/52), 25.50 KiB | 850.00 KiB/s, done.
Total 52 (delta 0), reused 0 (delta 0), pack-reused 0
To github.com:USERNAME/REPO_NAME.git
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
🟡 Attention
Si l'erreur fatal: 'main' does not have all commits s'affiche, la branche locale s'appelle master. Lancer à la place :

bash
▼ Replier
📋 Copier
git push -u origin master
Puis renommer la branche en main sur GitHub en passant par les Settings du dépôt.

🔵 Info
À partir de là, chaque git push (sans argument) enverra les commits vers GitHub automatiquement.

11 — Vérifier le dépôt sur GitHub
Ouvrir le navigateur et aller sur https://github.com/USERNAME/REPO_NAME. Vérifier que :

La branche main est affichée avec tous les fichiers du projet.
Le dossier node_modules/ n'apparaît pas (bloqué par .gitignore).
Le fichier .env n'apparaît pas (bloqué par .gitignore).
Le dernier commit affiche le message "first project commit".
🔵 Info
🟢 Félicitations ! Le projet est publié sur GitHub. À partir de maintenant, chaque commit local peut être poussé sur GitHub avec git push.
