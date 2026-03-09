// src/models/database.js
const { Pool } = require('pg');

class Database {
    constructor() {
        this.pool = new Pool({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            database: process.env.DB_NAME,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            max: 20, // máximo de conexões no pool
            idleTimeoutMillis: 30000, // tempo máximo que uma conexão pode ficar ociosa
            connectionTimeoutMillis: 2000, // tempo máximo para conectar
        });

        // Log quando conectar
        this.pool.on('connect', () => {
            console.log('✅ Conectado ao PostgreSQL');
        });

        // Log de erros
        this.pool.on('error', (err) => {
            console.error('❌ Erro no pool de conexões:', err);
        });
    }

    // Método para executar queries
    async query(text, params) {
        const start = Date.now();
        try {
            const result = await this.pool.query(text, params);
            const duration = Date.now() - start;
            
            // Log lento (opcional, para debug)
            if (duration > 100) {
                console.log('🐢 Query lenta:', { text, duration, rows: result.rowCount });
            }
            
            return result;
        } catch (error) {
            console.error('❌ Erro na query:', error);
            throw error;
        }
    }

    // Método para testar conexão
    async testConnection() {
        try {
            const result = await this.query('SELECT NOW()');
            console.log('✅ Banco de dados conectado:', result.rows[0].now);
            return true;
        } catch (error) {
            console.error('❌ Erro ao conectar ao banco:', error);
            return false;
        }
    }

    // Fechar conexões (útil para encerrar o app)
    async close() {
        await this.pool.end();
        console.log('🔒 Conexões com banco fechadas');
    }
}

// Exportar uma única instância (singleton)
module.exports = new Database();