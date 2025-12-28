const bcrypt = require('bcryptjs');

// Générer un hash pour le mot de passe "test123"
const password = process.argv[2] || 'test123';
const hash = bcrypt.hashSync(password, 10);

console.log('='.repeat(60));
console.log('GÉNÉRATEUR DE HASH DE MOT DE PASSE');
console.log('='.repeat(60));
console.log(`\nMot de passe: ${password}`);
console.log(`Hash bcrypt: ${hash}`);
console.log('\nCopiez ce SQL dans Supabase SQL Editor:\n');
console.log('----------');
console.log(`INSERT INTO users (email, password_hash, name, role)
VALUES (
    'test@novasolutions.fr',
    '${hash}',
    'Utilisateur Test',
    'admin'
);`);
console.log('----------\n');
