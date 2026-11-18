# Phase 1 : transfert du domaine

## Commander le service de transfert chez LWS

- **Cédevs** : sur lws.fr, dans l'espace client, tu commandes le service de transfert :
  - Va dans la recherche de domaine, rubrique « Je possède déjà un nom de domaine », saisis le nom du domaine, laisse cochée l'option « transférer mon domaine chez LWS » et clique sur « Poursuivre ».
  - Le message « Ce domaine n'est plus disponible » est normal (il est déjà enregistré chez le prestataire) : clique sur « Transférer ».
  - Coche la case certifiant que tu es le propriétaire du domaine ou que tu as l'autorisation de demander le transfert, puis valide.
  - Vérifie dans le panier le prix et la durée ajoutée au domaine, puis règle la commande.
- **Cédevs** : tu vérifies que les informations du titulaire de ton compte LWS (nom, adresse) correspondent au vrai propriétaire du domaine. Pour un `.fr`, elles sont reprises comme coordonnées du titulaire.
- **Cédevs** : la commande crée la page « Transfert du domaine » dans ton espace client, avec la checklist LWS. Le code n'est demandé que plus tard, au moment de lancer le transfert. LWS supprime la commande sans remboursement si le transfert n'aboutit pas avant la date limite affichée.

## Préparation

- **Cédevs** : tu demandes au prestataire le déverrouillage du domaine, le code de transfert (code EPP / AuthCode) et l'export complet de la zone DNS. Le domaine doit exister depuis plus de 60 jours et ne pas avoir été transféré récemment.
- **Prestataire** : il déverrouille le domaine et te transmet le code et l'export. Si le code arrive par un lien à usage unique (type Yopass), **n'ouvre le lien qu'au moment de le coller chez LWS** et ne le republie nulle part.
- **Cédevs** : tu repères dans l'export où est hébergée la messagerie (enregistrements MX) :
  - MX vers Google, Microsoft, OVH, etc. : les mails ne dépendent pas du prestataire, il n'y a rien à migrer.
  - MX vers le prestataire (ex. Gandimail) : les boîtes s'arrêteront au transfert. Il faut sauvegarder les messages et recréer les boîtes ailleurs **avant** de continuer.
- **Cédevs** : tu relèves tous les enregistrements de messagerie : MX, SPF, DKIM, DMARC et les éventuels CNAME ou TXT liés aux mails (par exemple la vérification Google).

## Recréer la zone DNS chez LWS (avant le transfert)

- **Cédevs** : dans la zone DNS LWS, tu supprimes les enregistrements de messagerie par défaut de LWS (leur MX et leur SPF) et tu recrées ceux de l'export, à l'identique :
  - **MX** : choisis le type `MX` dans le menu déroulant, puis clique sur « Cliquez pour configurer » pour saisir la priorité et le serveur (avec le point final). **Clique ensuite sur « Ajouter »** : « Sauvegarder » seul ne crée pas la ligne. Vérifie que la ligne affiche bien `MX` dans la première colonne, et non `TXT`.
  - **SPF** : un seul enregistrement SPF par domaine.
  - **DKIM, DMARC et vérification Google** : copie les valeurs en entier, sans espace ni retour à la ligne en plus.
  - Les enregistrements de l'ancien site (A, `_acme-challenge`) sont inutiles si le site n'existe plus.
- **Cédevs** : tu exportes la zone LWS en sauvegarde et tu la compares ligne à ligne avec l'export d'origine.

## Basculer les serveurs de noms (avant la demande de transfert)

- **Prestataire** (ou toi, si tu as accès à son interface) : il remplace les serveurs de noms du domaine par ceux de LWS (`ns17` à `ns20.lwsdns.com`, ceux affichés sur la page de transfert LWS).
- **Cédevs** : tu vérifies la propagation sur dnschecker.org en type **NS**. Tu veux voir les serveurs LWS presque partout. Les caches DNS peuvent mettre de quelques heures à 48 h. Pendant ce délai, les mails ne sont pas coupés si les deux zones contiennent les mêmes enregistrements de messagerie.
- **Cédevs** : tu envoies un mail de test à une adresse du domaine depuis une autre adresse (la tienne), et tu préviens le client de ce test.
- **Client** : il confirme avoir bien reçu le mail (spams compris), puis y répond depuis l'adresse du domaine. **Tu ne lances pas le transfert tant que les deux sens ne sont pas validés.**
- **Cédevs** : tu vérifies que la réponse du client t'est bien arrivée (spams compris).

## Lancer le transfert

- **Cédevs** : sur la page LWS « Transfert du domaine », tu cliques sur « Demander le transfert » (irréversible) et tu colles uniquement le code, sans intitulé ni espace.
- **Cédevs** : tu vérifies les coordonnées du « futur propriétaire » affichées par LWS. Pour un `.fr`, elles doivent correspondre au vrai titulaire du domaine. Corrige-les dans le compte LWS avant de valider si besoin.
- **Cédevs** : tu règles la commande. Un compte LWS récent ou en cours de vérification peut avoir le prélèvement SEPA bloqué pendant environ 30 jours : paie par carte bancaire ou contacte le support LWS.
- **Cédevs** : tu préviens le client et le prestataire par un mail commun.
- **Client** : il surveille la boîte mail du domaine (spams compris). S'il reçoit un e-mail de confirmation lié au transfert, il te le transfère ou te prévient avant de cliquer sur un lien dont il ne serait pas sûr.
- **Prestataire** : il valide tout e-mail de confirmation reçu de son côté et te prévient en cas de blocage.

## Pendant et après le transfert

- **Prestataire** : il valide le transfert de son côté si on le lui demande.
- **Cédevs** : le transfert prend en général de 1 à 10 jours. Tu surveilles ta boîte mail (spams compris) pour les confirmations à valider, et tu ne touches ni à la zone DNS ni aux mails. LWS supprime la commande sans remboursement si le transfert n'aboutit pas avant la date limite affichée.
- **Cédevs** : une fois le transfert terminé, tu vérifies que la zone DNS est intacte (MX, SPF, DKIM, DMARC), tu contrôles la **date d'expiration** (un transfert n'ajoute pas toujours une année) et tu actives le renouvellement automatique chez LWS.
- **Client** : il refait un test de messagerie dans les deux sens avec toi (réception et envoi depuis l'adresse du domaine) et te confirme que tout fonctionne.
- **Cédevs** : tu confirmes la fin du transfert au client et au prestataire.

# Phase 2 : intégration du site, une fois codé

- **Cédevs** : tu mets le site en ligne sur ton hébergement et tu notes l'adresse IP ou le nom cible à utiliser.
- **Cédevs** : dans la zone DNS chez LWS, tu modifies seulement l'enregistrement A de `@` (le `www`, en CNAME vers `@`, suit), ou le CNAME du `www` si l'hébergeur l'impose. Tu ne touches à aucun enregistrement de messagerie.
- **Cédevs** : tu actives le certificat HTTPS sur le nouveau site.
- **Cédevs** : tu vérifies que le site s'affiche bien sur le domaine (avec et sans `www`).
- **Client** : il refait un test de messagerie (réception et envoi) pour confirmer que les mails passent toujours.
