Déploiement-Render
Section 1 - Objectif
Cette fiche te guide pour déployer ton projet sur deux environnements Render distincts : un site officiel de production branché sur main, et un site de validation client branché sur dev. Chaque push sur l'une ou l'autre branche déclenchera automatiquement un redéploiement sur l'environnement correspondant.

🔵 Info
Prérequis : avoir terminé la fiche F99-T-02 — Publication sur GitHub(dépôt GitHub avec les branches main et dev configurées). Tu dois aussi avoir un compte sur render.com.

Architecture des deux environnements
```text
▼ Replier
📋 Copier
GitHub
├── branche main  ──→  Render PRODUCTION  (ex: monprojet.onrender.com)
│                      Site officiel, stable, visible par tous
│
└── branche dev   ──→  Render STAGING     (ex: monprojet-dev.onrender.com)
                       Validation client, version en cours, accès restreint
```
🔄 Analogie
C'est comme avoir deux vitrines d'un même magasin : la vitrine principale ouverte au public (production sur main), et une vitrine arrière réservée aux clients VIP pour valider les nouveautés avant qu'elles soient exposées à tout le monde (staging sur dev).

Section 2 - Déployer l'environnement de production (main)
On commence par créer le site de production sur Render, branché sur la branche main. C'est ce site qui sera l'adresse officielle du projet.

2.1 — Render > Créer un compte
Rends-toi sur render.com et crée un compte si ce n'est pas déjà fait. Connecte ton compte GitHub à Render lors de l'inscription ou depuis les paramètres.

2.2 — Render > Créer un nouveau Static Site
Dans le dashboard Render, clique sur + New
Sélectionne Static Site
Render te demande de sélectionner un dépôt GitHub — choisis ton dépôt
2.3 — Render > Configurer le site de production
Remplis les champs de configuration comme suit :

text
▼ Replier
📋 Copier
Name             : monprojet          (le nom public de ton site)
Branch           : main               ← IMPORTANT : branche de production
Build Command    : cd client && npm install && npm run build
Publish Directory: client/dist
Auto-Deploy      : Yes                (redéploie automatiquement à chaque push sur main)
🔵 Info
Le champ Name définit l'URL de ton site : si tu mets monprojet, l'adresse sera monprojet.onrender.com. Choisis un nom clair et professionnel.

2.4 — Render > Lancer le premier déploiement
Clique sur Create Static Site. Render va cloner ton dépôt, exécuter la commande de build et déployer le résultat. Surveille les logs pour voir la progression — ça prend généralement 1 à 3 minutes.

🔵 Info
Dans les logs, tu dois voir apparaître la ligne Build successfulpuis Deploy live. Si tu vois une erreur, lis le message — c'est souvent une dépendance manquante ou un chemin incorrect.

2.5 — Render > Configurer la redirection SPA
Sans cette règle, toutes les routes React autres que / renverront une erreur 404 quand l'utilisateur actualise la page ou accède directement à une URL.

Dans les paramètres du site, clique sur Redirects/Rewrites
Clique sur Add Rule
Remplis les champs :
text
▼ Replier
📋 Copier
Source     : /*
Destination: /index.html
Action     : Rewrite
Clique sur Save Changes
🟡 Attention
Sans cette règle Rewrite, un utilisateur qui va directement sur monprojet.onrender.com/dashboard verra une page 404 blanche. C'est parce que Render cherche un fichier dashboard/index.htmlqui n'existe pas — React gère les routes côté client, pas côté serveur.

2.6 — Render > Vérifier le site de production
Clique sur l'URL affichée en haut de la page dans Render. Tu dois voir ton application s'afficher correctement.

Section 3 - Déployer l'environnement de validation (dev)
On crée un second site sur Render, identique au premier mais branché sur dev. C'est sur ce site que le client pourra valider les nouvelles fonctionnalités avant qu'elles passent en production.

3.1 — Render > Créer un second Static Site
Dans le dashboard Render, clique à nouveau sur + New
Sélectionne Static Site
Sélectionne le même dépôt GitHub
3.2 — Render > Configurer le site de staging
La configuration est identique au site de production, sauf le nom et la branche :

text
▼ Replier
📋 Copier
Name             : monprojet-dev      ← nom différent du site de prod
Branch           : dev                ← IMPORTANT : branche de développement
Build Command    : cd client && npm install && npm run build
Publish Directory: client/dist
Auto-Deploy      : Yes
🔵 Info
L'URL du site de staging sera monprojet-dev.onrender.com. C'est cette adresse que tu partageras avec ton client pour la validation, jamais l'adresse de production.

3.3 — Render > Configurer la redirection SPA sur le site staging
Même règle que sur le site de production — elle est obligatoire sur les deux sites :

text
▼ Replier
📋 Copier
Source     : /*
Destination: /index.html
Action     : Rewrite
3.4 — Render > Vérifier le site de staging
Clique sur l'URL du site staging. Tu dois voir la même application que sur la production puisque dev et main ont le même contenu au départ.

Section 4 - Tester le déploiement automatique
On va vérifier que chaque push sur la bonne branche déclenche bien le bon redéploiement.

4.1 — Tester le déploiement du site staging (dev)
Fais une petite modification visible dans ton application — par exemple, change un texte dans HomePage.tsx — puis pousse sur dev :

bash
▼ Replier
📋 Copier
# S'assurer d'être sur dev
git checkout dev

# Ajouter, commiter et pousser
git add .
git commit -m "test: modification pour tester le déploiement staging"
git push origin dev
🔵 Info
Dans le dashboard Render, tu dois voir le site monprojet-devpasser en statut In progress puis Live après 1-3 minutes. Le site monprojet (production) lui, ne doit pas bouger.

4.2 — Tester le déploiement du site de production (main)
Fusionne dev dans main et pousse pour vérifier que la production se met à jour :

bash
▼ Replier
📋 Copier
# Basculer sur main
git checkout main

# Fusionner dev dans main
git merge dev

# Pousser main → déclenche le redéploiement du site officiel
git push origin main

# Revenir sur dev pour continuer à travailler
git checkout dev
Le site de production monprojet.onrender.com doit maintenant afficher la même modification que le site staging.

Section 5 - Variables d'environnement sur Render
Ton application utilise un fichier .env en local. Ce fichier n'est pas sur GitHub (normal, il est dans le .gitignore). Il faut donc déclarer les variables manuellement dans Render pour chaque site.

5.1 — Render > Ajouter les variables sur le site de production
Dans les paramètres du site de production, clique sur Environment
Clique sur Add Environment Variable
Ajoute les variables dont ton frontend a besoin :
text
▼ Replier
📋 Copier
VITE_API_URL    = https://ton-api-prod.onrender.com/api
NODE_ENV        = production
5.2 — Render > Ajouter les variables sur le site de staging
Même procédure sur le site staging, mais avec les valeurs pointant vers l'API de staging si tu en as une, ou vers la prod si tu n'en as qu'une :

text
▼ Replier
📋 Copier
VITE_API_URL    = https://ton-api-dev.onrender.com/api
NODE_ENV        = staging
🟡 Attention
Pour les Static Sites React avec Vite, seules les variables préfixées par VITE_sont accessibles dans le code frontend. Les autres sont ignorées par Vite au moment du build.

🔵 Info
Après avoir ajouté ou modifié des variables d'environnement sur Render, tu dois redéclencher manuellement un déploiement pour que les changements soient pris en compte. Clique sur Manual Deploy > Deploy latest commit.

Section 6 - Résumé des deux environnements
Tableau récapitulatif
text
▼ Replier
📋 Copier
┌─────────────────┬──────────────────────────┬──────────────────────────┐
│                 │  PRODUCTION              │  STAGING                 │
├─────────────────┼──────────────────────────┼──────────────────────────┤
│ Branche GitHub  │  main                    │  dev                     │
│ URL Render      │  monprojet.onrender.com  │  monprojet-dev.onrender  │
│ Usage           │  Site officiel public    │  Validation client       │
│ Mise à jour     │  git push origin main    │  git push origin dev     │
│ Auto-deploy     │  Oui                     │  Oui                     │
│ Rewrite rule    │  /* → /index.html        │  /* → /index.html        │
└─────────────────┴──────────────────────────┴──────────────────────────┘
Workflow complet de mise en production
bash
▼ Replier
📋 Copier
# 1. Travailler sur dev (ou une branche feature fusionnée dans dev)
git checkout dev
git add .
git commit -m "feat: nouvelle fonctionnalite"
git push origin dev
# → Le site monprojet-dev.onrender.com se met à jour automatiquement

# 2. Faire valider par le client sur monprojet-dev.onrender.com

# 3. Une fois validé, fusionner dev dans main pour mettre en production
git checkout main
git merge dev
git push origin main
# → Le site monprojet.onrender.com se met à jour automatiquement

# 4. Revenir sur dev pour continuer
git checkout dev
Points clés à retenir
Deux sites Render distincts : un par branche, jamais le même
Branch = main : site de production, accessible au public
Branch = dev : site de staging, pour validation avant mise en ligne
Auto-Deploy activé : chaque push déclenche automatiquement le bon site
Rewrite obligatoire : à configurer sur les deux sites pour éviter les 404
Variables VITE_ : seules les variables préfixées VITE_ sont accessibles dans React
Redéployer après un changement de variable : les variables ne s'appliquent qu'au prochain build
Ne jamais partager l'URL de prod pour les tests : toujours utiliser l'URL staging
