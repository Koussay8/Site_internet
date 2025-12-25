# Backend Google Sheets - Guide de Configuration

## Pourquoi Google Sheets ?

C'est la solution **100% gratuite** avec **stockage illimité** pour les formulaires.

---

## Étapes de Configuration

### 1. Créer une Google Sheet

1. Va sur [sheets.google.com](https://sheets.google.com)
2. Crée une nouvelle feuille
3. Nomme les colonnes en ligne 1 : **Date | Nom | Email | Message**

### 2. Créer le Script

1. Dans Google Sheets, va dans **Extensions → Apps Script**
2. Supprime le code existant et colle ceci :

```javascript
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = JSON.parse(e.postData.contents);
    
    sheet.appendRow([
      new Date(),
      data.nom,
      data.email,
      data.message
    ]);
    
    return ContentService
      .createTextOutput(JSON.stringify({result: 'success'}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(error) {
    return ContentService
      .createTextOutput(JSON.stringify({result: 'error', error: error.message}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

1. **Sauvegarde** (Ctrl+S)

### 3. Déployer le Script

1. Clique sur **Déployer → Nouveau déploiement**
2. Type : **Application Web**
3. Exécuter en tant que : **Moi**
4. Accès : **Tout le monde**
5. Clique **Déployer** et **autorise** l'accès
6. **Copie l'URL** fournie

### 4. Mettre l'URL dans le Site

1. Ouvre `src/main.js`
2. Trouve la ligne :

   ```javascript
   const SCRIPT_URL = 'YOUR_GOOGLE_SCRIPT_URL_HERE';
   ```

3. Remplace par ton URL copiée

---

## ✅ C'est fait

Chaque soumission du formulaire sera automatiquement enregistrée dans ta Google Sheet.
