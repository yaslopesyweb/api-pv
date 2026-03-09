// src/models/Aluno.js
const db = require('./database');

class Aluno {
    // Criar um novo aluno
    static async criar(dados) {
        const { nomeCompleto, cpf, email, telefone } = dados;
        
        const query = `
            INSERT INTO alunos (nome_completo, cpf, email, telefone)
            VALUES ($1, $2, $3, $4)
            RETURNING id, nome_completo, email, created_at
        `;
        
        const values = [nomeCompleto, cpf, email, telefone];
        
        try {
            const result = await db.query(query, values);
            return result.rows[0];
        } catch (error) {
            // Erro de unique constraint (CPF ou email duplicado)
            if (error.code === '23505') {
                if (error.constraint === 'alunos_cpf_key') {
                    throw new Error('CPF já cadastrado');
                }
                if (error.constraint === 'alunos_email_key') {
                    throw new Error('Email já cadastrado');
                }
            }
            throw error;
        }
    }

    // Buscar aluno por ID
    static async buscarPorId(id) {
        const query = 'SELECT id, nome_completo, email, telefone, created_at FROM alunos WHERE id = $1';
        const result = await db.query(query, [id]);
        return result.rows[0];
    }

    // Buscar aluno por email
    static async buscarPorEmail(email) {
        const query = 'SELECT id, nome_completo, email, telefone, created_at FROM alunos WHERE email = $1';
        const result = await db.query(query, [email]);
        return result.rows[0];
    }

    // Buscar aluno por CPF
    static async buscarPorCpf(cpf) {
        const query = 'SELECT id, nome_completo, email, telefone, created_at FROM alunos WHERE cpf = $1';
        const result = await db.query(query, [cpf]);
        return result.rows[0];
    }

    // Listar todos os alunos
    static async listarTodos() {
        const query = 'SELECT id, nome_completo, email, telefone, created_at FROM alunos ORDER BY created_at DESC';
        const result = await db.query(query);
        return result.rows;
    }
}

module.exports = Aluno;