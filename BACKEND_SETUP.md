# SCRIPT GOOGLE APPS - Version Corrigée

**IMPORTANT:** Ce script écrit maintenant dans 2 feuilles:

- **Feuille 1** (ou "Formulaire") : pour les contacts
- **Prise de RDV** : pour les rendez-vous chatbot

Copiez ce code dans Google Apps Script (Extensions > Apps Script) :

```javascript
/**
 * NovaSolutions - Backend Script v2
 * Calendar + Email + 2 Feuilles
 */

const CONFIG = {
  SHEET_CONTACT: 'Feuille 1',      // Feuille pour les contacts du formulaire
  SHEET_RDV: 'Prise de RDV',       // Feuille pour les RDV chatbot
  CALENDAR_ID: 'primary',
  COMPANY_NAME: 'NovaSolutions',
  MEETING_DURATION_MINUTES: 30,
  TIMEZONE: 'Europe/Paris'
};

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    const doc = SpreadsheetApp.getActiveSpreadsheet();
    const sheetContact = doc.getSheetByName(CONFIG.SHEET_CONTACT);
    const sheetRdv = doc.getSheetByName(CONFIG.SHEET_RDV);
    
    // Créer la feuille RDV si elle n'existe pas
    let rdvSheet = sheetRdv;
    if (!rdvSheet) {
      rdvSheet = doc.insertSheet(CONFIG.SHEET_RDV);
      rdvSheet.appendRow(['Date/Heure', 'Nom', 'Contact', 'Date RDV', 'Sujet', 'Source', 'Statut']);
    }
    
    const rawData = e.postData.contents;
    let data;
    try {
      data = JSON.parse(rawData);
    } catch (err) {
      data = {};
      const params = rawData.split('&');
      for (let i = 0; i < params.length; i++) {
        const pair = params[i].split('=');
        data[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
      }
    }
    
    const timestamp = new Date();

    if (data.type === 'chatbot_booking') {
      // === RDV CHATBOT ===
      const hasEmail = isValidEmail(data.contact);
      const rdvDate = parseRdvDate(data.date);
      
      // Écrire dans FEUILLE RDV
      rdvSheet.appendRow([
        timestamp, 
        data.nom || "", 
        data.contact || "", 
        data.date || "", 
        data.sujet || "", 
        "Chatbot",
        rdvDate ? "Confirmé" : "À confirmer"
      ]);
      
      // Créer événement Calendar si date valide
      if (hasEmail && rdvDate) {
        const calResult = createCalendarEvent(data, rdvDate);
        Logger.log('Calendar result: ' + calResult);
        sendConfirmationEmail(data, rdvDate, 'chatbot');
      } else if (hasEmail) {
        sendConfirmationEmail(data, null, 'chatbot');
      }
      
    } else {
      // === CONTACT FORMULAIRE ===
      sheetContact.appendRow([
        timestamp, 
        "CONTACT_FORM", 
        data.name || "", 
        data.email || "", 
        "", 
        data.message || "", 
        "Formulaire"
      ]);
      
      if (isValidEmail(data.email)) {
        sendConfirmationEmail({nom: data.name, contact: data.email, sujet: data.message}, null, 'contact');
      }
    }

    return ContentService.createTextOutput(JSON.stringify({success: true})).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    Logger.log('Error: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({error: error.toString()})).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function isValidEmail(str) {
  if (!str) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str.trim());
}

function parseRdvDate(dateStr) {
  if (!dateStr) return null;
  const now = new Date();
  const str = dateStr.toLowerCase();
  const jours = {'lundi':1,'mardi':2,'mercredi':3,'jeudi':4,'vendredi':5,'samedi':6,'dimanche':0};
  
  let targetDay = null;
  for (const [nom, num] of Object.entries(jours)) {
    if (str.includes(nom)) { targetDay = num; break; }
  }
  
  const heureMatch = str.match(/(\d{1,2})\s*[h:]\s*(\d{0,2})?/);
  let heure = 10, minutes = 0;
  if (heureMatch) {
    heure = parseInt(heureMatch[1]);
    minutes = heureMatch[2] ? parseInt(heureMatch[2]) : 0;
  }
  
  let rdvDate = new Date(now);
  if (targetDay !== null) {
    let daysUntil = targetDay - now.getDay();
    if (daysUntil <= 0) daysUntil += 7;
    rdvDate.setDate(now.getDate() + daysUntil);
  } else if (str.includes('demain')) {
    rdvDate.setDate(now.getDate() + 1);
  } else {
    rdvDate.setDate(now.getDate() + 1);
  }
  
  rdvDate.setHours(heure, minutes, 0, 0);
  return rdvDate;
}

function createCalendarEvent(data, rdvDate) {
  try {
    const calendar = CalendarApp.getDefaultCalendar();
    const endTime = new Date(rdvDate.getTime() + CONFIG.MEETING_DURATION_MINUTES * 60000);
    
    const event = calendar.createEvent('🗓️ RDV - ' + (data.nom || 'Prospect'), rdvDate, endTime, {
      description: '👤 Contact: ' + data.contact + '\n📝 Sujet: ' + data.sujet,
      guests: data.contact,
      sendInvites: true
    });
    
    Logger.log('Event created: ' + event.getId());
    return 'success';
  } catch (e) {
    Logger.log('Calendar error: ' + e.toString());
    return 'error: ' + e.toString();
  }
}

function sendConfirmationEmail(data, rdvDate, source) {
  try {
    const email = data.contact;
    if (!isValidEmail(email)) return;
    
    const nom = data.nom || 'Cher client';
    const dateStr = rdvDate ? Utilities.formatDate(rdvDate, CONFIG.TIMEZONE, "EEEE d MMMM yyyy 'à' HH'h'mm") : 'À confirmer';
    const sujet = source === 'chatbot' ? '✅ Votre RDV est confirmé - ' + CONFIG.COMPANY_NAME : '📬 Message reçu - ' + CONFIG.COMPANY_NAME;
    
    const html = '<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="margin:0;padding:0;background:#0a0a0f;font-family:Segoe UI,Roboto,Arial,sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0f;padding:40px 20px;"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#0f0f1a 0%,#1a1a2e 50%,#16213e 100%);border-radius:24px;overflow:hidden;box-shadow:0 25px 50px rgba(0,0,0,0.5);"><tr><td style="background:linear-gradient(135deg,#a855f7 0%,#6366f1 50%,#3b82f6 100%);padding:40px;text-align:center;"><h1 style="margin:0;font-size:32px;font-weight:800;color:#fff;">✨ ' + CONFIG.COMPANY_NAME + '</h1><p style="margin:10px 0 0;color:rgba(255,255,255,0.9);font-size:14px;">Agence d\'Automatisation IA</p></td></tr><tr><td style="padding:40px;"><h2 style="margin:0 0 20px;font-size:24px;color:#fff;">Bonjour ' + nom + ' 👋</h2>' + (source === 'chatbot' ? '<p style="margin:0 0 25px;color:rgba(255,255,255,0.85);font-size:16px;line-height:1.7;">Excellente nouvelle ! Votre rendez-vous est <strong style="color:#a855f7;">confirmé</strong>.</p><table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,rgba(168,85,247,0.15) 0%,rgba(59,130,246,0.15) 100%);border-radius:16px;border-left:4px solid #a855f7;margin:25px 0;"><tr><td style="padding:25px;"><p style="margin:0 0 10px;color:rgba(255,255,255,0.6);font-size:14px;">📅 Date</p><p style="margin:0 0 15px;color:#fff;font-size:16px;font-weight:600;">' + dateStr + '</p><p style="margin:0 0 10px;color:rgba(255,255,255,0.6);font-size:14px;">📝 Sujet</p><p style="margin:0;color:#fff;font-size:16px;font-weight:600;">' + (data.sujet || 'Automatisation IA') + '</p></td></tr></table><p style="margin:25px 0;color:rgba(255,255,255,0.85);font-size:15px;">📩 Une invitation Calendar vous a été envoyée.</p>' : '<p style="margin:0 0 25px;color:rgba(255,255,255,0.85);font-size:16px;line-height:1.7;">Nous avons bien reçu votre message.</p><table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(255,255,255,0.05);border-radius:16px;border-left:4px solid #3b82f6;margin:25px 0;"><tr><td style="padding:25px;"><p style="margin:0 0 10px;color:rgba(255,255,255,0.6);font-size:14px;">💬 Votre message</p><p style="margin:0;color:#fff;font-size:15px;font-style:italic;">"' + (data.sujet || 'Demande de contact') + '"</p></td></tr></table><p style="margin:25px 0;color:rgba(255,255,255,0.85);font-size:15px;">Notre équipe vous répondra rapidement.</p>') + '<p style="margin:30px 0 0;padding-top:25px;border-top:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.85);font-size:15px;">À très bientôt,<br><strong style="color:#a855f7;">L\'équipe ' + CONFIG.COMPANY_NAME + '</strong></p></td></tr><tr><td style="background:rgba(0,0,0,0.3);padding:25px;text-align:center;"><p style="margin:0;color:rgba(255,255,255,0.5);font-size:12px;">© ' + new Date().getFullYear() + ' ' + CONFIG.COMPANY_NAME + '</p></td></tr></table></td></tr></table></body></html>';
    
    GmailApp.sendEmail(email, sujet, 'Confirmation', {htmlBody: html, name: CONFIG.COMPANY_NAME});
    Logger.log('Email sent to: ' + email);
  } catch (e) {
    Logger.log('Email error: ' + e.toString());
  }
}

// === FONCTIONS DE TEST ===

// Test 1: PRISE DE RDV (Chatbot)
function testRDV() {
  const testData = {
    type: 'chatbot_booking',
    nom: 'Jean Dupont',
    contact: 'votre@email.com', // ⚠️ Remplacez par votre email !
    date: 'demain à 14h',
    sujet: 'Automatisation IA pour mon entreprise'
  };
  
  const mockEvent = {
    postData: {
      contents: JSON.stringify(testData)
    }
  };
  
  const result = doPost(mockEvent);
  Logger.log('=== TEST RDV ===');
  Logger.log(result.getContent());
  Logger.log('Vérifiez: 1) Feuille "Prise de RDV" 2) Google Calendar 3) Votre boîte email');
}

// Test 2: FORMULAIRE DE CONTACT
function testFormulaire() {
  const testData = {
    type: 'contact',
    name: 'Marie Martin',
    email: 'votre@email.com', // ⚠️ Remplacez par votre email !
    message: 'Je souhaite en savoir plus sur vos services IA'
  };
  
  const mockEvent = {
    postData: {
      contents: JSON.stringify(testData)
    }
  };
  
  const result = doPost(mockEvent);
  Logger.log('=== TEST FORMULAIRE ===');
  Logger.log(result.getContent());
  Logger.log('Vérifiez: 1) Feuille 1 (Formulaire) 2) Votre boîte email');
}
```

## Instructions de mise à jour

1. **Ouvrez Google Sheets** > Extensions > Apps Script
2. **Remplacez TOUT le code** par celui ci-dessus
3. **Créez la feuille "Prise de RDV"** manuellement si elle n'existe pas:
   - Clic droit sur l'onglet "Feuille 1" > Dupliquer
   - Renommez en "Prise de RDV"
   - Effacez le contenu et ajoutez les colonnes: `Date/Heure | Nom | Contact | Date RDV | Sujet | Source | Statut`
4. **Enregistrez** (Ctrl+S)
5. **Déployez** > Gérer > bouton Modifier (crayon) > Nouvelle version > Déployer

## Comment tester

| Test | Fonction | Ce qui doit se passer |
|------|----------|----------------------|
| **RDV Chatbot** | `Exécuter > testRDV` | ✅ Ligne dans "Prise de RDV" + Email + Calendar |
| **Formulaire** | `Exécuter > testFormulaire` | ✅ Ligne dans "Feuille 1" + Email |

> ⚠️ **N'oubliez pas** de remplacer `votre@email.com` par votre vraie adresse avant de tester !

## Changements clés

| Avant | Après |
|-------|-------|
| 1 seule feuille | 2 feuilles séparées |
| Pas de logging | Logging pour debug |
| Création auto feuille RDV | Crée la feuille si manquante |
