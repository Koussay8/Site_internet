const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const supabaseUrl = 'https://rvjpezmescqykhgfgssp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2anBlem1lc2NxeWtoZ2Znc3NwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4NDkyMDYsImV4cCI6MjA4MjQyNTIwNn0.wr8M4zX0f9Hvi1PyG2SKh9QvxZrxLMN2vJULaWc5Kpc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function addAdmin() {
    console.log('=== AJOUT DE L\'UTILISATEUR admin@nova.com ===\n');

    // Générer le hash du mot de passe
    const password = 'nova2024';
    const passwordHash = await bcrypt.hash(password, 12);

    console.log('Mot de passe:', password);
    console.log('Hash généré:', passwordHash);
    console.log('');

    // Ajouter l'utilisateur
    const { data, error } = await supabase
        .from('clients')
        .insert({
            company_name: 'Admin',
            email: 'admin@nova.com',
            password_hash: passwordHash,
            applications: ['cv-profiler'],
            is_active: true
        })
        .select()
        .single();

    if (error) {
        console.error('❌ Erreur:', error.message);
    } else {
        console.log('✅ Utilisateur créé avec succès!');
        console.log('Email:', data.email);
        console.log('Company:', data.company_name);
        console.log('');
        console.log('🔑 Identifiants de connexion:');
        console.log('   Email: admin@nova.com');
        console.log('   Mot de passe: nova2024');
    }
}

addAdmin().catch(console.error);
