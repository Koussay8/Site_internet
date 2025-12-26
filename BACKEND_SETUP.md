# SCRIPT GOOGLE SHEETS (Mise à jour)

Pour que le Chatbot puisse enregistrer les RDV et que le formulaire fonctionne toujours, voici le NOUVEAU code à coller dans votre script Google Apps.

## 1. Copiez ce code

Allez dans votre Google Sheet > Extensions > Apps Script, effacez tout et collez ceci :

```javascript
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    const doc = SpreadsheetApp.getActiveSpreadsheet();
    const sheetName = 'Feuille 1'; // Assurez-vous que c'est le bon nom
    const sheet = doc.getSheetByName(sheetName);

    // Récupérer les données
    const rawData = e.postData.contents;
    let data;
    
    // Essayer de lire en JSON (Chatbot) ou Formulaire classique
    try {
      data = JSON.parse(rawData);
    } catch (err) {
      // Si ce n'est pas du JSON, c'est probablement le formulaire standard
      data = {};
      const params = rawData.split('&');
      for (let i = 0; i < params.length; i++) {
        const pair = params[i].split('=');
        data[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
      }
    }

    const timestamp = new Date();

    // Cas 1 : Réservation Chatbot
    if (data.type === 'chatbot_booking') {
      // Colonnes : Date, Type, Nom/Contact, Email, Sujet, Info Extra
      sheet.appendRow([
        timestamp,
        "BOT_RDV", 
        data.contact || "Non précisé", 
        data.date || "Non précisé",
        data.sujet || "Non précisé",
        "Réservation via Chatbot"
      ]);
    } 
    // Cas 2 : Formulaire de Contact
    else {
      // Colonnes : Date, Type, Nom, Email, Message, Info Extra
      sheet.appendRow([
        timestamp,
        "CONTACT_FORM",
        data.name || "Inconnu",
        data.email || "Inconnu",
        data.message || "",
        "Source: Site Web"
      ]);
    }

    return ContentService.createTextOutput(JSON.stringify({ "result": "success" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (e) {
    return ContentService.createTextOutput(JSON.stringify({ "result": "error", "error": e }))
      .setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}
```

## 2. Important : Redéployer

1. Cliquez sur **Déployer** > **Nouveau déploiement**.
2. Type : **Application Web**.
3. Accès : **Tout le monde** (IMPORTANT).
4. Cliquez sur **Déployer**.
5. Copiez la **nouvelle URL** (si elle change) et mettez-la à jour dans le fichier `main.js` si nécessaire (mais souvent elle reste la même si vous faites "Gérer les déploiements" > "Modifier" > "Nouvelle version").
