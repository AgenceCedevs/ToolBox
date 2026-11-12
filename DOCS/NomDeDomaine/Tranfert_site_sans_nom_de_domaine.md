# Phase 1 : transfert du domaine, sans le site

- **Cédevs** : tu demandes au prestataire le code de transfert (code EPP/ AuthCode), l'export complet de la zone DNS et le déverrouillage du domaine. Tu lui demandes aussi de confirmer qu'il garde la messagerie active chez lui pendant et après le transfert.
- **Prestataire** : il te donne le code de transfert et l’export complet de la zone DNS, et il déverrouille le domaine s’il est verrouillé.
- **Cédevs** : tu relèves tous les enregistrements de messagerie dans cette zone : les MX, le SPF, le DKIM, le DMARC et les éventuels CNAME ou TXT liés aux mails.
- **Cédevs** : tu lances le transfert chez LWS avec le code, et tu recrées dans la zone DNS LWS tous les enregistrements de la zone, à l’identique, pour que rien ne change.
- **Prestataire** : il valide le transfert de son côté si on le lui demande, et il garde la messagerie active chez lui.
- **Cédevs** : une fois le transfert terminé, tu envoies un mail de test depuis et vers une adresse du domaine pour vérifier que la messagerie fonctionne toujours.

# Phase 2 : intégration du site, une fois codé

- **Cédevs** : tu mets le site en ligne sur ton hébergement et tu notes l’adresse IP ou le nom cible à utiliser.
- **Cédevs** : dans la zone DNS chez LWS, tu modifies seulement l’enregistrement A, ou le CNAME du www, pour pointer vers le nouveau site. Tu ne touches à aucun enregistrement de messagerie.
- **Cédevs** : tu actives le certificat HTTPS sur le nouveau site.
- **Cédevs** : tu vérifies que le site s’affiche bien sur le domaine, et qu’un mail de test passe toujours.
