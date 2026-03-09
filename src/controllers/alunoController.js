// src/controllers/alunoController.js
const Aluno = require('../models/Aluno');

// Validações auxiliares
const validarCPF = (cpf) => {
    // Remove caracteres não numéricos
    const cpfLimpo = cpf.replace(/[^\d]/g, '');
    return cpfLimpo.length === 11;
};

const validarEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

const validarTelefone = (telefone) => {
    const telefoneLimpo = telefone.replace(/[^\d]/g, '');
    return telefoneLimpo.length >= 10 && telefoneLimpo.length <= 11;
};

// Criar novo aluno
exports.criarAluno = async (req, res) => {
    console.log('📝 Recebendo dados do formulário:', req.body);
    
    try {
        const { nomeCompleto, cpf, email, telefone } = req.body;

        // Validações
        const erros = [];

        if (!nomeCompleto || nomeCompleto.trim().length < 3) {
            erros.push('Nome completo deve ter pelo menos 3 caracteres');
        }

        if (!cpf || !validarCPF(cpf)) {
            erros.push('CPF inválido');
        }

        if (!email || !validarEmail(email)) {
            erros.push('Email inválido');
        }

        if (!telefone || !validarTelefone(telefone)) {
            erros.push('Telefone inválido');
        }

        // Se houver erros, retorna 400
        if (erros.length > 0) {
            return res.status(400).json({ 
                erro: 'Dados inválidos',
                detalhes: erros 
            });
        }

        // Limpar formatação dos campos
        const dadosLimpos = {
            nomeCompleto: nomeCompleto.trim(),
            cpf: cpf.replace(/[^\d]/g, ''),
            email: email.trim().toLowerCase(),
            telefone: telefone.replace(/[^\d]/g, '')
        };

        // Verificar se email já existe
        const emailExistente = await Aluno.buscarPorEmail(dadosLimpos.email);
        if (emailExistente) {
            return res.status(409).json({ 
                erro: 'Email já cadastrado' 
            });
        }

        // Verificar se CPF já existe
        const cpfExistente = await Aluno.buscarPorCpf(dadosLimpos.cpf);
        if (cpfExistente) {
            return res.status(409).json({ 
                erro: 'CPF já cadastrado' 
            });
        }

        // Criar aluno no banco
        const novoAluno = await Aluno.criar(dadosLimpos);

        console.log('✅ Aluno criado com sucesso:', novoAluno);

        res.status(201).json({
            sucesso: true,
            mensagem: 'Aluno cadastrado com sucesso',
            aluno: novoAluno
        });

    } catch (error) {
        console.error('❌ Erro ao criar aluno:', error);
        res.status(500).json({ 
            erro: 'Erro interno do servidor' 
        });
    }
};

// Listar todos os alunos
exports.listarAlunos = async (req, res) => {
    try {
        const alunos = await Aluno.listarTodos();
        
        res.json({
            sucesso: true,
            quantidade: alunos.length,
            alunos
        });
    } catch (error) {
        console.error('❌ Erro ao listar alunos:', error);
        res.status(500).json({ 
            erro: 'Erro interno do servidor' 
        });
    }
};

// Buscar aluno por ID
exports.buscarAluno = async (req, res) => {
    try {
        const { id } = req.params;
        
        const aluno = await Aluno.buscarPorId(id);
        
        if (!aluno) {
            return res.status(404).json({ 
                erro: 'Aluno não encontrado' 
            });
        }

        res.json({
            sucesso: true,
            aluno
        });
    } catch (error) {
        console.error('❌ Erro ao buscar aluno:', error);
        res.status(500).json({ 
            erro: 'Erro interno do servidor' 
        });
    }
};