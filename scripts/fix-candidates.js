// Script pour lier les candidats orphelins à l'admin
// Exécutez: node scripts/fix-candidates.js

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://rvjpezmescqykhgfgssp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2anBlem1lc2NxeWtoZ2Znc3NwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4NDkyMDYsImV4cCI6MjA4MjQyNTIwNn0.wr8M4zX0f9Hvi1PyG2SKh9QvxZrxLMN2vJULaWc5Kpc';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function fixCandidates() {
    console.log('🔍 Recherche de l\'utilisateur admin...\n');

    // Trouver l'admin
    const { data: admin, error: adminError } = await supabase
        .from('clients')
        .select('id, email')
        .eq('email', 'admin@nova.com')
        .single();

    if (adminError || !admin) {
        console.error('❌ Admin non trouvé:', adminError?.message);
        return;
    }

    console.log('✅ Admin trouvé:', admin.email);
    console.log('   ID:', admin.id);

    // Compter les candidats existants
    const { data: allCandidates, error: countError } = await supabase
        .from('candidates')
        .select('id, name, user_id');

    if (countError) {
        console.error('❌ Erreur:', countError.message);
        return;
    }

    console.log(`\n📊 Total candidats: ${allCandidates?.length || 0}`);

    // Trouver les candidats avec user_id différent ou null
    const orphans = allCandidates?.filter(c => c.user_id !== admin.id) || [];
    console.log(`   - Liés à l'admin: ${(allCandidates?.length || 0) - orphans.length}`);
    console.log(`   - Orphelins: ${orphans.length}`);

    if (orphans.length === 0) {
        console.log('\n✅ Tous les candidats sont déjà liés à l\'admin!');
        return;
    }

    // Mettre à jour les candidats orphelins
    console.log('\n🔧 Mise à jour des candidats orphelins...');

    const { error: updateError } = await supabase
        .from('candidates')
        .update({ user_id: admin.id })
        .neq('user_id', admin.id);

    if (updateError) {
        // Essayer de mettre à jour ceux qui ont user_id NULL
        const { error: nullError } = await supabase
            .from('candidates')
            .update({ user_id: admin.id })
            .is('user_id', null);

        if (nullError) {
            console.error('❌ Erreur:', nullError.message);
            return;
        }
    }

    console.log('✅ Candidats mis à jour!');
    console.log('\nRafraîchissez la page candidats sur le site.');
}

fixCandidates().catch(console.error);
