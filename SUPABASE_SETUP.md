# Configuration de la Base de Données Supabase

## Table `users` requise

Pour que l'authentification fonctionne, vous devez avoir une table `users` dans votre base de données Supabase avec la structure suivante :

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT,
    role TEXT DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX idx_users_email ON users(email);
```

## Ajouter un utilisateur de test

Pour créer un utilisateur de test avec le mot de passe "test123", utilisez ce code :

```javascript
const bcrypt = require('bcryptjs');
const password = 'test123';
const hash = bcrypt.hashSync(password, 10);
console.log('Hash du mot de passe:', hash);
```

Ensuite, insérez l'utilisateur dans Supabase :

```sql
INSERT INTO users (email, password_hash, name, role)
VALUES (
    'test@novasolutions.fr',
    '$2a$10$abcdefghijklmnopqrstuvwxyz123456789',  -- Remplacez par le hash généré
    'Utilisateur Test',
    'admin'
);
```

## Variables d'environnement requises

Dans le fichier `.env.local`, assurez-vous d'avoir :

```
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_anon_key
JWT_SECRET=un-secret-tres-securise-pour-jwt
```

## Test de connexion

1. Email: `test@novasolutions.fr`
2. Mot de passe: `test123` (ou celui que vous avez choisi)

## Notes importantes

- Les mots de passe sont hashés avec bcrypt (10 rounds)
- Les tokens JWT expirent après 7 jours
- L'email est automatiquement converti en minuscules
- Le champ `role` peut être : `user`, `admin`, etc.
