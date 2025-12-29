// Script pour ajouter l'utilisateur admin
// Exécutez: node scripts/add-admin.js

const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

// Remplacez par votre vraie URL Supabase
const SUPABASE_URL = 'https://rvjpezmescqykhgfgssp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2anBlem1lc2NxeWtoZ2Znc3NwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4NDkyMDYsImV4cCI6MjA4MjQyNTIwNn0.wr8M4zX0f9Hvi1PyG2SKh9QvxZrxLMN2vJULaWc5Kpc';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function addAdmin() {
    console.log('🔐 Ajout de l\'utilisateur admin...\n');

    const email = 'admin@nova.com';
    const password = 'nova2024';
    const companyName = 'NovaSolutions';

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Vérifier si l'utilisateur existe déjà
    const { data: existing } = await supabase
        .from('clients')
        .select('id')
        .eq('email', email)
        .single();

    if (existing) {
        console.log('⚠️  L\'utilisateur existe déjà. Mise à jour du mot de passe...');

        const { error } = await supabase
            .from('clients')
            .update({ password_hash: hashedPassword })
            .eq('email', email);

        if (error) {
            console.error('❌ Erreur:', error.message);
        } else {
            console.log('✅ Mot de passe mis à jour!');
        }
    } else {
        // Créer le nouvel utilisateur
        const { data, error } = await supabase
            .from('clients')
            .insert({
                email,
                password_hash: hashedPassword,
                company_name: companyName,
            })
            .select()
            .single();

        if (error) {
            console.error('❌ Erreur:', error.message);
        } else {
            console.log('✅ Utilisateur créé avec succès!');
            console.log('   ID:', data.id);
        }
    }

    console.log('\n📧 Email: admin@nova.com');
    console.log('🔑 Mot de passe: nova2024');
    console.log('\nVous pouvez maintenant vous connecter!');
}

addAdmin().catch(console.error);
