# 🤖 Chatbot Embeddable - Guide de Configuration

## Comment ça marche

Votre site expose un widget chatbot que vos clients peuvent intégrer sur leur site avec **une seule ligne de code**. Vous gardez le contrôle des clés API et de la configuration.

---

## 📋 Étapes pour ajouter un nouveau client

### 1. Obtenir une clé API Groq pour le client

1. Allez sur [console.groq.com](https://console.groq.com)
2. Créez une nouvelle clé API pour ce client
3. Notez la clé (ex: `gsk_abc123...`)

### 2. Ajouter la clé dans les variables d'environnement

Dans votre fichier `.env.local` (ou sur Vercel), ajoutez :

```env
CLIENT_NOMDUCLIENT_GROQ_KEY=gsk_abc123...
```

### 3. Configurer le client dans l'API

Ouvrez `/app/api/embed/chat/route.ts` et ajoutez le client dans `CLIENTS_CONFIG` :

```typescript
const CLIENTS_CONFIG = {
    // Clients existants...
    
    'nom-du-client': {
        apiKey: process.env.CLIENT_NOMDUCLIENT_GROQ_KEY || '',
        botName: 'Assistant MonClient',
        companyName: 'MonClient Entreprise',
        // Optionnel: prompt personnalisé
        systemPrompt: `Tu es l'assistant IA de MonClient...`,
    },
};
```

### 4. Donner le code d'intégration au client

Le client n'a qu'à ajouter cette ligne dans le `<body>` de son site :

```html
<script src="https://votre-domaine.com/embed/chatbot.js" data-client-id="nom-du-client"></script>
```

Remplacez :

- `votre-domaine.com` par votre domaine (ex: `novasolutions.fr`)
- `nom-du-client` par l'ID que vous avez défini

---

## 🎨 Personnalisation avancée

### Prompt personnalisé

Chaque client peut avoir son propre prompt système :

```typescript
'client-restaurant': {
    apiKey: process.env.CLIENT_RESTAURANT_GROQ_KEY || '',
    botName: 'Chef Bot',
    companyName: 'Restaurant Le Gourmet',
    systemPrompt: `Tu es Chef Bot, l'assistant du Restaurant Le Gourmet.
    
    Ton rôle :
    - Présenter le menu du jour
    - Prendre des réservations
    - Répondre aux questions sur les allergènes
    
    Horaires : Mardi-Dimanche 12h-14h et 19h-22h
    Adresse : 123 rue de la Gastronomie, Paris
    
    Pour les réservations, collecte : date, heure, nombre de personnes, nom, téléphone.`,
},
```

### Webhook pour les réservations

Si le client veut recevoir les RDV sur son propre système :

Dans `/app/api/embed/booking/route.ts` :

```typescript
const CLIENT_WEBHOOKS = {
    'nom-du-client': 'https://webhook.site/xxx',
    'autre-client': 'https://n8n.autreclient.com/webhook/rdv',
};
```

---

## 🔐 Sécurité

- ✅ Les clés API sont stockées sur VOTRE serveur (jamais exposées)
- ✅ CORS configuré pour accepter les requêtes cross-origin
- ✅ Rate limiting par client+IP (30 req/min)
- ✅ Validation des entrées

---

## 📁 Fichiers créés

| Fichier | Description |
|---------|-------------|
| `/public/embed/chatbot.js` | Script que les clients intègrent |
| `/app/api/embed/chat/route.ts` | API multi-clients avec clés séparées |
| `/app/api/embed/booking/route.ts` | Réception des RDV |

---

## 🚀 Exemple complet

### Côté serveur (vous)

`.env.local` :

```env
CLIENT_SPA_LUXE_GROQ_KEY=gsk_xxx123
```

`/app/api/embed/chat/route.ts` :

```typescript
'spa-luxe': {
    apiKey: process.env.CLIENT_SPA_LUXE_GROQ_KEY || '',
    botName: 'Jade',
    companyName: 'Spa Luxe Paris',
    systemPrompt: `Tu es Jade, conseillère bien-être du Spa Luxe Paris...`,
},
```

### Côté client (le site du client)

```html
<!DOCTYPE html>
<html>
<head>
    <title>Spa Luxe Paris</title>
</head>
<body>
    <!-- Contenu du site... -->
    
    <!-- UNE SEULE LIGNE À AJOUTER -->
    <script src="https://novasolutions.fr/embed/chatbot.js" data-client-id="spa-luxe"></script>
</body>
</html>
```

C'est tout ! Le chatbot apparaît en bas à droite du site. 🎉
