# Récupérer _private après perte du dossier local

## 1. Restaurer la clé (coller le texte base64 depuis le gestionnaire de mots de passe)
```bash
echo "TON_TEXTE_BASE64_ICI" | base64 -d > ~/Desktop/docs-private.key
chmod 600 ~/Desktop/docs-private.key
ls -l ~/Desktop/docs-private.key   # doit afficher 148 octets
```

## 2. Vérifier git-crypt
```bash
git-crypt --version || winget install AGWA.git-crypt
```

## 3. Recloner et déverrouiller
```bash
cd ~/Desktop
git clone <URL_DU_DEPOT> test-clone
cd test-clone
git-crypt unlock ~/Desktop/docs-private.key
```

## 4. Vérifier
```bash
git-crypt status
ls DOCS/_private
head DOCS/_private/<NOM_DU_FICHIER>
```
