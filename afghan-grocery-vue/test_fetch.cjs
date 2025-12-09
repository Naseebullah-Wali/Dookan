
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vmkicfgzgwdfpdnisarn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZta2ljZmd6Z3dkZnBkbmlzYXJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5NjUxMDYsImV4cCI6MjA4MDU0MTEwNn0.ZwE7sZO6kGIEKy8TjZnUhiPRQr86rSZ-jYRCyso8bg4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConfig() {
    console.log("Fetching featured products...");
    try {
        const { data, error } = await supabase
            .from('products')
            .select('id, name_en, image, featured')
            .eq('featured', true)
            .limit(5);

        if (error) {
            console.error("Error:", error);
        } else {
            console.log("Featured Products Data:");
            data.forEach(p => {
                console.log(`- ID: ${p.id}, Image: '${p.image}'`);
            });
        }
    } catch (e) {
        console.error("Exception:", e);
    }
}

testConfig();
