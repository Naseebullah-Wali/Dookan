import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const supabaseUrl = 'https://vmkicfgzgwdfpdnisarn.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZta2ljZmd6Z3dkZnBkbmlzYXJuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMzQzMDcwNiwiZXhwIjoyMDQ5MDA2NzA2fQ.sb_secret_MTgd4FX1bDInHcSI3I-2sw_CH40QRaA'

async function executeSQL(sql) {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`
        },
        body: JSON.stringify({ query: sql })
    })

    if (!response.ok) {
        const error = await response.text()
        throw new Error(`SQL execution failed: ${error}`)
    }

    return await response.json()
}

async function setupDatabase() {
    console.log('🚀 Setting up Supabase database...\n')

    try {
        // Read schema file
        console.log('📄 Reading schema file...')
        const schema = readFileSync(join(__dirname, 'supabase-schema.sql'), 'utf-8')

        console.log('🔨 Creating database schema...')
        console.log('   This may take a moment...\n')

        // Execute schema
        await executeSQL(schema)
        console.log('✅ Schema created successfully!\n')

        // Read seed file
        console.log('📄 Reading seed data file...')
        const seed = readFileSync(join(__dirname, 'supabase-seed.sql'), 'utf-8')

        console.log('🌱 Inserting demo data...')
        await executeSQL(seed)
        console.log('✅ Demo data inserted successfully!\n')

        console.log('🎉 Database setup complete!')
        console.log('📊 You can view your data at:')
        console.log(`   ${supabaseUrl.replace('https://', 'https://supabase.com/dashboard/project/')}/editor\n`)

    } catch (error) {
        console.error('❌ Setup failed:', error.message)
        console.log('\n⚠️  Manual setup required:')
        console.log('   1. Go to: https://supabase.com/dashboard/project/vmkicfgzgwdfpdnisarn/sql/new')
        console.log('   2. Copy contents of: supabase-schema.sql')
        console.log('   3. Paste and click "Run"')
        console.log('   4. Copy contents of: supabase-seed.sql')
        console.log('   5. Paste and click "Run"\n')
    }
}

setupDatabase()
