# Nettoyer et optimiser son PC Windows

> Les commandes `Windows + R` pour libérer de l'espace, alléger le démarrage et garder un PC propre.

## Contexte

Avec le temps, Windows accumule des fichiers temporaires, des caches, des programmes inutiles et des applications lancées au démarrage. Ces commandes permettent de faire le ménage sans logiciel tiers.

## 1. Supprimer les fichiers inutiles

| Commande | Rôle |
| --- | --- |
| `cleanmgr` | Nettoyage de disque : temporaires, miniatures, rapports d'erreurs, corbeille |
| `cleanmgr /sageset:1` | Crée un profil de nettoyage personnalisé (on coche ce qu'on veut) |
| `cleanmgr /sagerun:1` | Relance ce profil en un clic, sans refaire les choix |
| `%temp%` | Fichiers temporaires de l'utilisateur |
| `temp` | Fichiers temporaires de Windows (droits administrateur demandés) |
| `ms-settings:storagesense` | Assistant de stockage : nettoyage automatique des temporaires |
| `appwiz.cpl` | Programmes et fonctionnalités : désinstaller un logiciel |
| `ms-settings:appsfeatures` | Applications installées, triables par taille et par date |


## 3. Alléger le démarrage

| Commande | Rôle |
| --- | --- |
| `ms-settings:startupapps` | Activer ou désactiver les applications au démarrage |
| `taskmgr` | Onglet **Applications de démarrage** (colonne *Impact sur le démarrage*) |
| `shell:startup` | Dossier des programmes lancés au démarrage |
| `msconfig` | Configuration du système (onglet Démarrage et Services) |

Désactiver uniquement ce qu'on reconnaît (lanceurs de jeux, mises à jour d'éditeurs, applications de messagerie). Ne pas toucher aux entrées liées à l'antivirus, aux pilotes ou à Microsoft.

## 4. Gérer les disques

| Commande | Rôle |
| --- | --- |
| `diskmgmt.msc` | Gestion des disques et partitions |
| `dfrgui` | Optimiser les lecteurs : défragmentation (HDD) ou TRIM (SSD) |
| `ms-settings:storagepolicies` | Voir ce qui occupe la place (applications, temporaires, fichiers) |

## 5. Nettoyage avancé (terminal administrateur)

Ouvrir **Invite de commandes (administrateur)**, puis lancer :

| Commande | Rôle |
| --- | --- |
| `DISM /Online /Cleanup-Image /StartComponentCleanup` | Nettoie les anciens composants Windows (WinSxS) |
| `sfc /scannow` | Vérifie et répare les fichiers système corrompus |
| `chkdsk C: /scan` | Analyse le disque à la recherche d'erreurs |

## 6. Surveiller ce qui ralentit le PC

| Commande | Rôle |
| --- | --- |
| `taskmgr` | Voir quels processus consomment CPU, RAM et disque |
| `resmon` | Moniteur de ressources détaillé |
| `mdsched` | Diagnostic de la mémoire RAM (redémarrage requis) |
| `eventvwr` | Observateur d'événements : repérer les erreurs répétées |

## À ne pas faire

- Vider le dossier `prefetch` : inutile, Windows le gère seul, et cela ne rend pas le PC plus rapide
- Supprimer des fichiers dans `C:\Windows` à la main (à part `temp`)
- Utiliser un « nettoyeur de registre » : gain nul et risque de casser Windows
- Cocher **Téléchargements** dans `cleanmgr` sans vérifier : ce dossier contient des fichiers personnels

## Routine de nettoyage conseillée

1. `cleanmgr` puis **Nettoyer les fichiers système**
2. `%temp%` puis `temp` : tout supprimer
3. `appwiz.cpl` : désinstaller les logiciels inutiles
4. `ms-settings:startupapps` : désactiver le superflu au démarrage
5. `dfrgui` : optimiser les lecteurs
6. Vider la corbeille
7. Redémarrer le PC

À faire environ une fois par mois.

## Sources

- [Libérer de l'espace disque sous Windows](https://support.microsoft.com/fr-fr/windows)
- [Documentation DISM](https://learn.microsoft.com/fr-fr/windows-hardware/manufacture/desktop/dism-image-management-command-line-options-s14)
