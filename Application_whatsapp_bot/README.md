# 🤖 Bot WhatsApp Facture Vocale

Bot WhatsApp **100% gratuit** qui transforme vos messages vocaux en factures PDF et les envoie par email.

## 🎯 Fonctionnalités

- 🎤 Réception de messages vocaux WhatsApp
- 📝 Transcription automatique (Whisper via Groq)
- 🧠 Extraction intelligente des données (client, montant, description)
- 📄 Génération de factures PDF professionnelles
- 📧 Envoi automatique par email
- 💬 Confirmation sur WhatsApp avec copie PDF

## 📦 Stack Technique (Gratuit)

| Composant | Technologie | Limite gratuite |
|-----------|-------------|-----------------|
| WhatsApp | Baileys (open source) | Illimité |
| Transcription | Groq Whisper API | ~14,400/jour |
| IA Parsing | Groq LLaMA 3 | ~14,400/jour |
| PDF | pdfkit | Illimité |
| Email | Gmail + App Password | 500/jour |

## 🚀 Installation

### 1. Prérequis

- Node.js 18+ installé
- Compte Gmail avec 2FA activé
- Compte Groq (gratuit)

### 2. Installation des dépendances

```bash
cd /Users/koussay/Desktop/bot
npm install
```

### 3. Configuration

Modifiez le fichier `.env` avec vos informations :

```env
# Groq API (https://console.groq.com/keys)
GROQ_API_KEY=gsk_votre_cle

# Gmail (https://myaccount.google.com/apppasswords)
EMAIL_USER=votre.email@gmail.com
EMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
EMAIL_TO_DEFAULT=destinataire@example.com

# Infos entreprise
COMPANY_NAME=VotreEntreprise
COMPANY_ADDRESS=123 Rue Example
COMPANY_SIRET=123 456 789 00012
```

### 4. Lancement

```bash
npm start
```

Un QR code s'affichera. Scannez-le avec WhatsApp (Appareils connectés > Connecter un appareil).

## 📱 Utilisation

1. Envoyez un message vocal au numéro WhatsApp connecté
2. Dictez les informations de facturation, par exemple :
   > "Facture pour Jean Dupont, création de site web, 1500 euros"
3. Le bot :
   - Transcrit le message
   - Extrait les données
   - Génère le PDF
   - Envoie l'email
   - Vous confirme avec une copie

## 🎤 Exemples de messages vocaux

```
"Facture pour Marie Martin, formation IA, deux mille euros"

"Facture client Entreprise ABC, email contact@abc.com, 
développement application mobile, 5000 euros HT"

"Jean-Pierre Dubois, maintenance informatique mensuelle, 
trois cent cinquante euros"
```

## 📁 Structure du projet

```
bot/
├── .env                    # Configuration (secrets)
├── package.json            # Dépendances
├── src/
│   ├── index.js            # Point d'entrée
│   ├── whatsapp/
│   │   └── client.js       # Connexion WhatsApp
│   ├── transcription/
│   │   └── whisper.js      # API Groq Whisper
│   ├── invoice/
│   │   ├── parser.js       # Extraction données
│   │   └── generator.js    # Génération PDF
│   └── email/
│       └── sender.js       # Envoi emails
├── auth/                   # Session WhatsApp (auto-généré)
├── invoices/               # PDFs générés (auto-généré)
└── temp/                   # Fichiers temporaires (auto-généré)
```

## 🔐 Sécurité

- **Ne commitez jamais `.env`** sur Git
- Utilisez un **numéro WhatsApp dédié** pour le bot
- Configurez `ALLOWED_NUMBER` pour restreindre l'accès

## ⚠️ Limitations

- WhatsApp peut bloquer les numéros avec usage abusif
- Limite Groq : ~14,400 requêtes audio/jour
- Limite Gmail : 500 emails/jour

## 🛠️ Dépannage

### "Configuration email invalide"

1. Vérifiez que 2FA est activé sur Gmail
2. Créez un App Password : <https://myaccount.google.com/apppasswords>
3. Utilisez ce mot de passe (pas votre mot de passe Gmail normal)

### QR code ne s'affiche pas

Supprimez le dossier `auth/` et relancez le bot.

### Transcription incorrecte

Parlez clairement et mentionnez explicitement les montants en chiffres ou en lettres.

## 📄 Licence

MIT - Libre d'utilisation

---

Créé avec ❤️ par NovaSolutions
