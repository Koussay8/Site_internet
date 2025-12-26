# SCRIPT GOOGLE APPS - Email Confirmation + Calendar

Ce script gère les réservations du chatbot et du formulaire de contact, avec:

- ✅ Enregistrement dans Google Sheets
- ✅ Création d'événement Google Calendar avec Meet
- ✅ Envoi d'email de confirmation

## 1. Copiez ce code dans Google Apps Script

Allez dans votre Google Sheet > Extensions > Apps Script, effacez tout et collez ceci :

```javascript
/**
 * NovaSolutions - Backend Script
 * Gère les RDV Chatbot et le Formulaire de Contact
 * Avec confirmation Email + Invitation Google Calendar
 */

// ============================================
// CONFIGURATION - MODIFIEZ CES VALEURS
// ============================================
const CONFIG = {
  SHEET_NAME: 'Feuille 1',           // Nom de votre feuille
  CALENDAR_ID: 'primary',            // 'primary' pour votre calendrier principal
  COMPANY_NAME: 'NovaSolutions',
  COMPANY_EMAIL: 'contact@novasolutions.io',
  MEETING_DURATION_MINUTES: 30,
  TIMEZONE: 'Europe/Paris'
};

// ============================================
// POINT D'ENTRÉE - doPost
// ============================================
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    const doc = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = doc.getSheetByName(CONFIG.SHEET_NAME);
    
    // Parser les données
    const rawData = e.postData.contents;
    let data = parseData(rawData);
    
    const timestamp = new Date();
    let result = { success: false, message: '' };

    // ============================================
    // CAS 1: RÉSERVATION CHATBOT
    // ============================================
    if (data.type === 'chatbot_booking') {
      const rdvDate = parseRdvDate(data.date);
      const hasEmail = isValidEmail(data.contact);
      
      // Enregistrer dans la Sheet
      sheet.appendRow([
        timestamp,
        "BOT_RDV",
        data.nom || "Non précisé",
        data.contact || "Non précisé",
        data.date || "Non précisé",
        data.sujet || "Non précisé",
        "Chatbot",
        hasEmail ? "Email envoyé" : "Téléphone - Pas d'email"
      ]);
      
      // Si email valide → Créer Calendar + Envoyer Email
      if (hasEmail && rdvDate) {
        const calendarResult = createCalendarEvent(data, rdvDate);
        sendConfirmationEmail(data, rdvDate, calendarResult.meetLink, 'chatbot');
        result = { success: true, message: 'RDV créé + Email envoyé', meetLink: calendarResult.meetLink };
      } else if (hasEmail) {
        // Email mais date non parsable → Email simple
        sendConfirmationEmail(data, null, null, 'chatbot');
        result = { success: true, message: 'Email envoyé (date à confirmer)' };
      } else {
        result = { success: true, message: 'Enregistré (téléphone uniquement)' };
      }
    }
    // ============================================
    // CAS 2: FORMULAIRE DE CONTACT
    // ============================================
    else {
      const hasEmail = isValidEmail(data.email);
      
      // Enregistrer dans la Sheet
      sheet.appendRow([
        timestamp,
        "CONTACT_FORM",
        data.name || "Inconnu",
        data.email || "Inconnu",
        "À planifier",
        data.message || "",
        "Formulaire Web",
        hasEmail ? "Email envoyé" : "Pas d'email"
      ]);
      
      // Si email → Envoyer confirmation
      if (hasEmail) {
        const contactData = {
          nom: data.name,
          contact: data.email,
          sujet: data.message ? data.message.substring(0, 100) : 'Demande de contact'
        };
        sendConfirmationEmail(contactData, null, null, 'contact');
        result = { success: true, message: 'Formulaire reçu + Email envoyé' };
      } else {
        result = { success: true, message: 'Formulaire enregistré' };
      }
    }

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    console.error('Erreur doPost:', error);
    return ContentService.createTextOutput(JSON.stringify({ 
      success: false, 
      error: error.toString() 
    })).setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}

// ============================================
// FONCTIONS UTILITAIRES
// ============================================

function parseData(rawData) {
  try {
    return JSON.parse(rawData);
  } catch (err) {
    // Fallback pour form-urlencoded
    const data = {};
    const params = rawData.split('&');
    for (let i = 0; i < params.length; i++) {
      const pair = params[i].split('=');
      data[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
    }
    return data;
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
  
  // Mapping des jours
  const jours = {
    'lundi': 1, 'mardi': 2, 'mercredi': 3, 'jeudi': 4,
    'vendredi': 5, 'samedi': 6, 'dimanche': 0
  };
  
  // Trouver le jour
  let targetDay = null;
  for (const [nom, num] of Object.entries(jours)) {
    if (str.includes(nom)) {
      targetDay = num;
      break;
    }
  }
  
  // Trouver l'heure
  const heureMatch = str.match(/(\d{1,2})\s*[h:]\s*(\d{0,2})?/);
  let heure = 10, minutes = 0;
  if (heureMatch) {
    heure = parseInt(heureMatch[1]);
    minutes = heureMatch[2] ? parseInt(heureMatch[2]) : 0;
  }
  
  // Calculer la date
  let rdvDate = new Date(now);
  
  if (targetDay !== null) {
    const currentDay = now.getDay();
    let daysUntil = targetDay - currentDay;
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

// ============================================
// CRÉATION ÉVÉNEMENT CALENDAR AVEC MEET
// ============================================
function createCalendarEvent(data, rdvDate) {
  try {
    const calendar = CalendarApp.getCalendarById(CONFIG.CALENDAR_ID) || CalendarApp.getDefaultCalendar();
    
    const endTime = new Date(rdvDate.getTime() + CONFIG.MEETING_DURATION_MINUTES * 60000);
    
    const title = `🗓️ RDV - ${data.nom || 'Prospect'}`;
    const description = `
📋 Réservation via ${CONFIG.COMPANY_NAME}

👤 Nom: ${data.nom || 'Non précisé'}
📧 Contact: ${data.contact || 'Non précisé'}
📝 Sujet: ${data.sujet || 'Non précisé'}

---
Réservation automatique via le chatbot.
    `.trim();
    
    // Créer l'événement avec invité (pour générer Meet)
    const event = calendar.createEvent(title, rdvDate, endTime, {
      description: description,
      guests: data.contact,
      sendInvites: true
    });
    
    // Ajouter Google Meet
    let meetLink = 'Appel téléphonique';
    try {
      // Essayer d'obtenir le lien Meet via l'API avancée
      const calendarEvent = Calendar.Events.get(CONFIG.CALENDAR_ID === 'primary' ? 'primary' : CONFIG.CALENDAR_ID, event.getId().split('@')[0]);
      
      if (!calendarEvent.conferenceData) {
        // Créer une conférence Meet
        const conferenceRequest = {
          conferenceData: {
            createRequest: {
              requestId: Utilities.getUuid(),
              conferenceSolutionKey: { type: 'hangoutsMeet' }
            }
          }
        };
        
        const updatedEvent = Calendar.Events.patch(conferenceRequest, 
          CONFIG.CALENDAR_ID === 'primary' ? 'primary' : CONFIG.CALENDAR_ID, 
          event.getId().split('@')[0],
          { conferenceDataVersion: 1 }
        );
        
        if (updatedEvent.conferenceData && updatedEvent.conferenceData.entryPoints) {
          meetLink = updatedEvent.conferenceData.entryPoints.find(e => e.entryPointType === 'video')?.uri || meetLink;
        }
      } else if (calendarEvent.conferenceData.entryPoints) {
        meetLink = calendarEvent.conferenceData.entryPoints.find(e => e.entryPointType === 'video')?.uri || meetLink;
      }
    } catch (meetError) {
      console.log('Meet link non disponible, utilisation appel téléphonique');
    }
    
    return { eventId: event.getId(), meetLink: meetLink };
    
  } catch (error) {
    console.error('Erreur création calendrier:', error);
    return { eventId: null, meetLink: 'Appel téléphonique' };
  }
}

// ============================================
// ENVOI EMAIL DE CONFIRMATION
// ============================================
function sendConfirmationEmail(data, rdvDate, meetLink, source) {
  try {
    const recipientEmail = data.contact;
    if (!isValidEmail(recipientEmail)) return;
    
    const nomClient = data.nom || 'Cher(e) client(e)';
    const dateFormatted = rdvDate 
      ? Utilities.formatDate(rdvDate, CONFIG.TIMEZONE, "EEEE d MMMM yyyy 'à' HH'h'mm")
      : 'Date à confirmer';
    
    const sujet = source === 'chatbot' 
      ? `✅ Confirmation de votre RDV - ${CONFIG.COMPANY_NAME}`
      : `📬 Nous avons reçu votre message - ${CONFIG.COMPANY_NAME}`;
    
    const meetSection = meetLink && meetLink !== 'Appel téléphonique'
      ? `<a href="${meetLink}" style="display:inline-block;padding:15px 30px;background:linear-gradient(135deg,#a855f7,#3b82f6);color:white;text-decoration:none;border-radius:12px;font-weight:bold;">🎥 Rejoindre la visio</a>`
      : `<p style="color:#888;">📞 Un membre de notre équipe vous contactera.</p>`;
    
    const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #0a0a0a; color: #fff; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 20px; padding: 40px; }
    .header { text-align: center; margin-bottom: 30px; }
    .logo { font-size: 28px; font-weight: bold; background: linear-gradient(135deg, #a855f7, #3b82f6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .content { background: rgba(255,255,255,0.05); border-radius: 16px; padding: 30px; margin: 20px 0; }
    .highlight { background: linear-gradient(135deg, rgba(168,85,247,0.2), rgba(59,130,246,0.2)); border-left: 4px solid #a855f7; padding: 20px; border-radius: 12px; margin: 20px 0; }
    .footer { text-align: center; color: #888; font-size: 12px; margin-top: 30px; }
    h2 { color: #fff; }
    p { line-height: 1.8; color: rgba(255,255,255,0.85); }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">✨ ${CONFIG.COMPANY_NAME}</div>
    </div>
    
    <div class="content">
      <h2>Bonjour ${nomClient} 👋</h2>
      
      ${source === 'chatbot' ? `
        <p>Votre rendez-vous est <strong>confirmé</strong> !</p>
        
        <div class="highlight">
          <p><strong>📅 Date :</strong> ${dateFormatted}</p>
          <p><strong>📝 Sujet :</strong> ${data.sujet || 'Discussion sur vos besoins en automatisation IA'}</p>
        </div>
        
        <div style="text-align:center;margin:30px 0;">
          ${meetSection}
        </div>
      ` : `
        <p>Nous avons bien reçu votre message et vous en remercions.</p>
        
        <div class="highlight">
          <p><strong>📝 Votre message :</strong></p>
          <p style="font-style:italic;">"${data.sujet}"</p>
        </div>
        
        <p>Notre équipe vous répondra dans les plus brefs délais.</p>
      `}
      
      <p>À très bientôt,<br><strong>L'équipe ${CONFIG.COMPANY_NAME}</strong></p>
    </div>
    
    <div class="footer">
      <p>© ${new Date().getFullYear()} ${CONFIG.COMPANY_NAME} - Agence d'Automatisation IA</p>
      <p>Cet email a été envoyé automatiquement suite à votre demande.</p>
    </div>
  </div>
</body>
</html>
    `;
    
    GmailApp.sendEmail(recipientEmail, sujet, `Confirmation - ${CONFIG.COMPANY_NAME}`, {
      htmlBody: htmlBody,
      name: CONFIG.COMPANY_NAME
    });
    
    console.log('Email envoyé à:', recipientEmail);
    
  } catch (error) {
    console.error('Erreur envoi email:', error);
  }
}
```

## 2. Activer l'API Calendar (Important !)

1. Dans Apps Script, cliquez sur **Services** (icône +) à gauche
2. Recherchez **Google Calendar API**
3. Cliquez sur **Ajouter**

## 3. Redéployer le script

1. Cliquez sur **Déployer** > **Gérer les déploiements**
2. Cliquez sur l'icône ✏️ (modifier)
3. Sélectionnez **Nouvelle version**
4. Cliquez sur **Déployer**

## 4. Autorisations requises

Lors du premier déploiement, Google demandera les autorisations pour:

- ✅ Lire/écrire Google Sheets
- ✅ Lire/écrire Google Calendar
- ✅ Envoyer des emails via Gmail

> ⚠️ **Important**: Acceptez toutes les autorisations pour que le script fonctionne correctement.

## Architecture

```
┌─────────────────┐      ┌─────────────────────┐
│   Chatbot RDV   │─────▶│  Google Apps Script │
│   (BLOCK_RDV)   │      │                     │
└─────────────────┘      │  1. Sheet ✅        │
                         │  2. Calendar 📅     │
┌─────────────────┐      │  3. Email 📧        │
│ Formulaire Web  │─────▶│                     │
└─────────────────┘      └─────────────────────┘
```
