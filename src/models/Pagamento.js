// src/models/Pagamento.js
const db = require('./database');

class Pagamento {
    static async criar(dados) {
        const {
            aluno_id,
            forma_pagamento,
            responsavel_financeiro,
            valor,
            parcelas,
            cartao_numero,
            cartao_validade,
            cartao_nome,
            cartao_recorrente,
            protocolo,
            status = 'aprovado'
        } = dados;

        const query = `
            INSERT INTO pagamentos (
                aluno_id, forma_pagamento, responsavel_financeiro, valor, parcelas,
                cartao_numero, cartao_validade, cartao_nome, cartao_recorrente,
                protocolo, status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING id, protocolo, valor, forma_pagamento, status, created_at
        `;

        const values = [
            aluno_id,
            forma_pagamento,
            responsavel_financeiro || false,
            valor,
            parcelas || null,
            cartao_numero || null,
            cartao_validade || null,
            cartao_nome || null,
            cartao_recorrente || false,
            protocolo,
            status
        ];

        try {
            const result = await db.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error('Erro ao criar pagamento:', error);
            throw error;
        }
    }

    static async buscarPorId(id) {
        const query = `
            SELECT p.*, a.nome_completo, a.email 
            FROM pagamentos p
            LEFT JOIN alunos a ON p.aluno_id = a.id
            WHERE p.id = $1
        `;
        const result = await db.query(query, [id]);
        return result.rows[0];
    }

    static async buscarPorAlunoId(aluno_id) {
        const query = `
            SELECT * FROM pagamentos 
            WHERE aluno_id = $1 
            ORDER BY created_at DESC
        `;
        const result = await db.query(query, [aluno_id]);
        return result.rows;
    }

    static async listarTodos(filtros = {}) {
        let query = `
            SELECT p.*, a.nome_completo, a.email 
            FROM pagamentos p
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

        if (filtros.forma_pagamento) {
            query += ` AND p.forma_pagamento = $${paramIndex}`;
            values.push(filtros.forma_pagamento);
            paramIndex++;
        }

        query += ` ORDER BY p.created_at DESC LIMIT 100`;

        const result = await db.query(query, values);
        return result.rows;
    }

    static async atualizarStatus(id, status) {
        const query = `
            UPDATE pagamentos 
            SET status = $1 
            WHERE id = $2 
            RETURNING id, protocolo, status
        `;
        const result = await db.query(query, [status, id]);
        return result.rows[0];
    }

    static async gerarProtocolo() {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        return `PAG-${timestamp}-${random}`;
    }
}

module.exports = Pagamento;