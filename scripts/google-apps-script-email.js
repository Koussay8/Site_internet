/**
 * =====================================================
 * GOOGLE APPS SCRIPT - ENVOI D'EMAILS TRANSACTIONNELS
 * =====================================================
 * 
 * Ce script doit être déployé sur Google Apps Script.
 * URL du déploiement à mettre dans GOOGLE_SCRIPT_URL (env)
 * 
 * INSTALLATION:
 * 1. Aller sur https://script.google.com
 * 2. Créer un nouveau projet
 * 3. Coller ce code
 * 4. Déployer > Nouveau déploiement > Application web
 * 5. Exécuter en tant que: Moi-même
 * 6. Qui a accès: Tout le monde
 * 7. Copier l'URL du déploiement dans .env.local
 */

function doPost(e) {
    try {
        var data = JSON.parse(e.postData.contents);

        // Vérifier le type de requête
        if (data.type === 'send_email') {
            return sendEmail(data);
        }

        // Comportement existant (contact form, etc.)
        return handleContactForm(data);

    } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({
            success: false,
            error: error.message
        })).setMimeType(ContentService.MimeType.JSON);
    }
}

/**
 * Envoyer un email transactionnel
 */
function sendEmail(data) {
    var to = data.to;
    var subject = data.subject;
    var htmlBody = data.html;
    var textBody = data.text || '';

    if (!to || !subject || (!htmlBody && !textBody)) {
        return ContentService.createTextOutput(JSON.stringify({
            success: false,
            error: 'Paramètres manquants'
        })).setMimeType(ContentService.MimeType.JSON);
    }

    try {
        GmailApp.sendEmail(to, subject, textBody, {
            htmlBody: htmlBody,
            name: 'NovaSolutions',
            // replyTo: 'contact@novasolutions.fr' // Optionnel
        });

        // Logger l'envoi
        logEmail(to, subject, 'success');

        return ContentService.createTextOutput(JSON.stringify({
            success: true,
            message: 'Email envoyé'
        })).setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
        logEmail(to, subject, 'error: ' + error.message);

        return ContentService.createTextOutput(JSON.stringify({
            success: false,
            error: error.message
        })).setMimeType(ContentService.MimeType.JSON);
    }
}

/**
 * Handle contact form (comportement existant)
 */
function handleContactForm(data) {
    // Récupérer les données
    var nom = data.nom || data.name || '';
    var email = data.email || '';
    var message = data.message || '';
    var type = data.type || 'contact';

    // Optionnel: Ajouter à un Google Sheet
    // var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    // sheet.appendRow([new Date(), nom, email, message, type]);

    // Optionnel: Envoyer une notification
    if (email && type !== 'send_email') {
        try {
            GmailApp.sendEmail('contact@novasolutions.fr',
                'Nouveau contact: ' + nom,
                'Email: ' + email + '\n\nMessage:\n' + message,
                { name: 'NovaSolutions Bot' }
            );
        } catch (e) {
            // Ignorer les erreurs de notification
        }
    }

    return ContentService.createTextOutput(JSON.stringify({
        success: true
    })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Logger les emails envoyés (optionnel)
 */
function logEmail(to, subject, status) {
    try {
        // Optionnel: Logger dans un Google Sheet
        // var sheet = SpreadsheetApp.openById('SHEET_ID').getSheetByName('Logs');
        // sheet.appendRow([new Date(), to, subject, status]);

        Logger.log('Email: ' + to + ' | ' + subject + ' | ' + status);
    } catch (e) {
        // Ignorer
    }
}

/**
 * Test function
 */
function testSendEmail() {
    var result = sendEmail({
        type: 'send_email',
        to: 'test@example.com',
        subject: 'Test NovaSolutions',
        html: '<h1>Test</h1><p>Ceci est un test.</p>'
    });

    Logger.log(result.getContent());
}
