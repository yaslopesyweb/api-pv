// src/migrations/seed.js
const { Pool } = require('pg');

class Seeder {
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
            console.log('🌱 Iniciando seed do banco de dados...');

            // Inserir alunos de exemplo
            const alunosInsert = `
                INSERT INTO alunos (nome_completo, cpf, email, telefone)
                VALUES 
                    ('João Silva Santos', '12345678901', 'joao@example.com', '11987654321'),
                    ('Maria Oliveira Costa', '98765432101', 'maria@example.com', '11987654322'),
                    ('Pedro Ferreira Lima', '55555555555', 'pedro@example.com', '11987654323')
                ON CONFLICT (cpf, email) DO NOTHING
            `;
            await client.query(alunosInsert);
            console.log('✅ Alunos inseridos');

            // Inserir pagamentos de exemplo
            const pagamentosInsert = `
                INSERT INTO pagamentos (
                    aluno_id, forma_pagamento, responsavel_financeiro, 
                    valor, parcelas, protocolo, status
                )
                SELECT 
                    id, 'cartao', false, 5000.00, 6, 
                    'PROT-' || id || '-2026', 'aprovado'
                FROM alunos
                WHERE email = 'joao@example.com'
                ON CONFLICT (protocolo) DO NOTHING
            `;
            await client.query(pagamentosInsert);
            console.log('✅ Pagamentos inseridos');

            // Inserir pedidos de exemplo
            const pedidosInsert = `
                INSERT INTO pedidos (
                    aluno_id, numero_pedido, status, total, 
                    forma_pagamento, pagamento_id
                )
                SELECT 
                    a.id, 'PED-2026-' || LPAD(a.id::text, 4, '0'), 
                    'aguardando_pagamento', 1500.00, 'cartao', p.id
                FROM alunos a
                LEFT JOIN pagamentos p ON a.id = p.aluno_id AND p.protocolo LIKE 'PROT-' || a.id || '%'
                WHERE a.email = 'joao@example.com'
                ON CONFLICT (numero_pedido) DO NOTHING
            `;
            await client.query(pedidosInsert);
            console.log('✅ Pedidos inseridos');

            // Inserir itens dos pedidos
            const itensInsert = `
                INSERT INTO pedido_itens (
                    pedido_id, curso_id, curso_titulo, quantidade, preco_unitario
                )
                SELECT 
                    id, 1, 'Curso de Node.js', 1, 1500.00
                FROM pedidos
                WHERE numero_pedido LIKE 'PED-2026-%'
                ON CONFLICT DO NOTHING
            `;
            await client.query(itensInsert);
            console.log('✅ Itens dos pedidos inseridos');

            console.log('✨ Seed completado!');
        } catch (error) {
            console.error('❌ Erro no seed:', error);
            process.exit(1);
        } finally {
            client.release();
            await this.pool.end();
        }
    }
}

// Executar se for o arquivo principal
if (require.main === module) {
    const seeder = new Seeder();
    seeder.run();
}

module.exports = Seeder;
