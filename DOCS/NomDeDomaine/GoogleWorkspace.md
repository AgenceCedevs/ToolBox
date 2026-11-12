1.	**Client** : il s’inscrit sur Google Workspace en indiquant le nom de domaine, puis il choisit la vérification du domaine par enregistrement TXT.
2.	**Client** : il copie la valeur TXT affichée par Google et te l’envoie.
3.	**Cédevs** : tu te connectes à l’espace LWS, tu ouvres la gestion de la zone DNS du domaine, et tu ajoutes l’enregistrement TXT de vérification.
4.	**Cédevs** : tu préviens le **Client** que c’est en place.
5.	**Client** : il clique sur vérifier le domaine dans Google Workspace, en réessayant un peu plus tard si ça ne passe pas tout de suite.
6.	**Client** : une fois le domaine validé, il récupère les enregistrements MX donnés par Google et te les envoie.
7.	**Cédevs** : tu ajoutes ces enregistrements MX dans la zone DNS chez LWS, et tu supprimes les anciens MX s’il y en a.
8.	**Client** : il active l’authentification des mails dans la console d’administration Google, ce qui génère la clé DKIM, et te l’envoie.
9.	**Cédevs** : tu ajoutes l’enregistrement DKIM, ainsi que l’enregistrement SPF de Google, dans la zone DNS chez LWS.
10.	**Client** : il démarre l’authentification DKIM dans la console Google, puis teste l’envoi et la réception de mails.
