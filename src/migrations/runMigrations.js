// src/migrations/runMigrations.js
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

class MigrationRunner {
    constructor() {
        this.pool = new Pool({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            database: process.env.DB_NAME,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
        });
    }

    async run() {
        const client = await this.pool.connect();
        try {
            console.log('🚀 Iniciando migrations...');

            // Criar tabela de controle de migrations se não existir
            await client.query(`
                CREATE TABLE IF NOT EXISTS migrations (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(255) NOT NULL UNIQUE,
                    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // Ler todos os arquivos SQL
            const migrationsPath = __dirname;
            const files = fs.readdirSync(migrationsPath)
                .filter(file => file.endsWith('.sql'))
                .sort();

            for (const file of files) {
                // Verificar se migration já foi executada
                const result = await client.query(
                    'SELECT * FROM migrations WHERE name = $1',
                    [file]
                );

                if (result.rows.length > 0) {
                    console.log(`⏭️  ${file} (já executada)`);
                    continue;
                }

                // Ler e executar o arquivo SQL
                const filePath = path.join(migrationsPath, file);
                const sql = fs.readFileSync(filePath, 'utf8');

                try {
                    await client.query(sql);
                    await client.query(
                        'INSERT INTO migrations (name) VALUES ($1)',
                        [file]
                    );
                    console.log(`✅ ${file} (executada)`);
                } catch (error) {
                    console.error(`❌ Erro ao executar ${file}:`, error.message);
                    throw error;
                }
            }

            console.log('✨ Migrations completadas!');
        } catch (error) {
            console.error('❌ Erro nas migrations:', error);
            process.exit(1);
        } finally {
            client.release();
            await this.pool.end();
        }
    }
}

// Executar se for o arquivo principal
if (require.main === module) {
    const runner = new MigrationRunner();
    runner.run();
}

module.exports = MigrationRunner;
