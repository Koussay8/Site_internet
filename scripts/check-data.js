// Script pour diagnostiquer les données dans Supabase
// Exécutez: node scripts/check-data.js

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://rvjpezmescqykhgfgssp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2anBlem1lc2NxeWtoZ2Znc3NwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4NDkyMDYsImV4cCI6MjA4MjQyNTIwNn0.wr8M4zX0f9Hvi1PyG2SKh9QvxZrxLMN2vJULaWc5Kpc';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkData() {
    console.log('📊 DIAGNOSTIC DES DONNÉES SUPABASE\n');
    console.log('================================\n');

    const tables = ['clients', 'candidates', 'jobs', 'playgrounds', 'forms'];

    for (const table of tables) {
        const { data, error, count } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: false });

        if (error) {
            console.log(`❌ ${table}: ERREUR - ${error.message}`);
        } else {
            console.log(`📦 ${table}: ${data?.length || 0} enregistrement(s)`);
            if (data && data.length > 0 && data.length <= 5) {
                data.forEach((item, i) => {
                    const display = item.name || item.email || item.title || item.id;
                    console.log(`   ${i + 1}. ${display}`);
                });
            }
        }
        console.log('');
    }
}

checkData().catch(console.error);
