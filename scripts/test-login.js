const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const supabaseUrl = 'https://rvjpezmescqykhgfgssp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2anBlem1lc2NxeWtoZ2Znc3NwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4NDkyMDYsImV4cCI6MjA4MjQyNTIwNn0.wr8M4zX0f9Hvi1PyG2SKh9QvxZrxLMN2vJULaWc5Kpc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLogin() {
    console.log('=== TEST DE CONNEXION ===\n');

    // 1. Lister tous les clients
    console.log('1. Récupération de tous les clients...');
    const { data: allClients, error: listError } = await supabase
        .from('clients')
        .select('id, company_name, email, is_active');

    if (listError) {
        console.error('❌ Erreur:', listError.message);
    } else {
        console.log('✅ Clients trouvés:', JSON.stringify(allClients, null, 2));
    }

    console.log('\n2. Recherche par email: admin@nova.com...');
    const { data: client, error: searchError } = await supabase
        .from('clients')
        .select('*')
        .eq('email', 'admin@nova.com')
        .single();

    if (searchError) {
        console.error('❌ Erreur:', searchError.message);
    } else if (!client) {
        console.log('❌ Aucun client trouvé');
    } else {
        console.log('✅ Client trouvé:', {
            id: client.id,
            email: client.email,
            company_name: client.company_name,
            is_active: client.is_active
        });

        // 3. Vérifier le mot de passe
        console.log('\n3. Vérification du mot de passe "nova2024"...');
        const isValid = await bcrypt.compare('nova2024', client.password_hash);
        console.log(isValid ? '✅ Mot de passe correct!' : '❌ Mot de passe incorrect');

        if (!isValid) {
            console.log('\n4. Génération d\'un nouveau hash pour "nova2024"...');
            const newHash = await bcrypt.hash('nova2024', 12);
            console.log('Nouveau hash:', newHash);
            console.log('\nExécutez cette requête SQL dans Supabase:');
            console.log(`UPDATE clients SET password_hash = '${newHash}' WHERE email = 'admin@nova.com';`);
        }
    }
}

testLogin().catch(console.error);
