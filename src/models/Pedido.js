// src/models/Pedido.js
const db = require('./database');

class Pedido {
    static async gerarNumeroPedido() {
        const timestamp = Date.now().toString(36);
        const random = Math.floor(Math.random() * 10000).toString(36);
        const numero = `PED-${timestamp}-${random}`.toUpperCase();
        return numero;
    }

    static async criar(dados, itens) {
        const {
            aluno_id,
            numero_pedido,
            status = 'aguardando_pagamento',
            total,
            parcelas,
            forma_pagamento = null,
            pagamento_id = null
        } = dados;

        // Iniciar transação
        const client = await db.pool.connect();
        
        try {
            await client.query('BEGIN');

            // Inserir pedido
            const pedidoQuery = `
                INSERT INTO pedidos (
                    aluno_id, numero_pedido, status, total, 
                    parcelas, forma_pagamento, pagamento_id
                ) VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING id, numero_pedido, total, status, created_at
            `;
            
            const pedidoValues = [aluno_id, numero_pedido, status, total, parcelas, forma_pagamento, pagamento_id];
            const pedidoResult = await client.query(pedidoQuery, pedidoValues);
            const pedido = pedidoResult.rows[0];

            // Inserir itens
            for (const item of itens) {
                const itemQuery = `
                    INSERT INTO pedido_itens (
                        pedido_id, curso_id, curso_titulo, quantidade, preco_unitario
                    ) VALUES ($1, $2, $3, $4, $5)
                `;
                const itemValues = [pedido.id, item.curso_id, item.curso_titulo, item.quantidade, item.preco_unitario];
                await client.query(itemQuery, itemValues);
            }

            await client.query('COMMIT');
            return pedido;

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    static async buscarPorId(id) {
        const query = `
            SELECT p.*, a.nome_completo, a.email 
            FROM pedidos p
            LEFT JOIN alunos a ON p.aluno_id = a.id
            WHERE p.id = $1
        `;
        const result = await db.query(query, [id]);
        return result.rows[0];
    }

    static async buscarPorNumero(numero_pedido) {
        const query = `
            SELECT p.*, a.nome_completo, a.email 
            FROM pedidos p
            LEFT JOIN alunos a ON p.aluno_id = a.id
            WHERE p.numero_pedido = $1
        `;
        const result = await db.query(query, [numero_pedido]);
        return result.rows[0];
    }

    static async buscarItens(pedido_id) {
        const query = `
            SELECT * FROM pedido_itens 
            WHERE pedido_id = $1
            ORDER BY id
        `;
        const result = await db.query(query, [pedido_id]);
        return result.rows;
    }

    static async buscarPorAluno(aluno_id, limite = 10) {
        const query = `
            SELECT * FROM pedidos 
            WHERE aluno_id = $1 
            ORDER BY created_at DESC 
            LIMIT $2
        `;
        const result = await db.query(query, [aluno_id, limite]);
        return result.rows;
    }

    static async atualizarStatus(id, status, pagamento_id = null) {
        const query = `
            UPDATE pedidos 
            SET status = $1, 
                pagamento_id = COALESCE($2, pagamento_id),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $3 
            RETURNING id, numero_pedido, status
        `;
        const result = await db.query(query, [status, pagamento_id, id]);
        return result.rows[0];
    }

    static async listar(filtros = {}) {
        let query = `
            SELECT p.*, a.nome_completo, a.email 
            FROM pedidos p
            LEFT JOIN alunos a ON p.aluno_id = a.id
            WHERE 1=1
        `;
        const values = [];
        let paramIndex = 1;

        if (filtros.status) {
            query += ` AND p.status = $${paramIndex}`;
            values.push(filtros.status);
            paramIndex++;
        }

        if (filtros.aluno_id) {
            query += ` AND p.aluno_id = $${paramIndex}`;
            values.push(filtros.aluno_id);
            paramIndex++;
        }

        query += ` ORDER BY p.created_at DESC LIMIT 100`;

        const result = await db.query(query, values);
        return result.rows;
    }
}

module.exports = Pedido;