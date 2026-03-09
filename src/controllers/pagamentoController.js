// src/controllers/pagamentoController.js
const Pagamento = require('../models/Pagamento');
const Aluno = require('../models/Aluno');
const Pedido = require('../models/Pedido'); // ← ADICIONADO

exports.processarPagamento = async (req, res) => {
    console.log('💳 Recebendo dados de pagamento:', req.body);
    
    try {
        const { 
            aluno_id,
            pedido_id, // ← ADICIONADO
            formaPagamento, 
            responsavelFinanceiro, 
            cartao, 
            valor,
            parcelas 
        } = req.body;

        // Validações básicas
        if (!aluno_id) {
            return res.status(400).json({ erro: 'ID do aluno não informado' });
        }

        if (!pedido_id) { // ← NOVA VALIDAÇÃO
            return res.status(400).json({ erro: 'ID do pedido não informado' });
        }

        if (!formaPagamento) {
            return res.status(400).json({ erro: 'Forma de pagamento não informada' });
        }

        if (!valor) {
            return res.status(400).json({ erro: 'Valor não informado' });
        }

        // Verificar se aluno existe
        const aluno = await Aluno.buscarPorId(aluno_id);
        if (!aluno) {
            return res.status(404).json({ erro: 'Aluno não encontrado' });
        }

        // Verificar se pedido existe
        const pedido = await Pedido.buscarPorId(pedido_id); // ← NOVO
        if (!pedido) {
            return res.status(404).json({ erro: 'Pedido não encontrado' });
        }

        // Verificar se pedido já não foi pago
        if (pedido.status === 'pago') { // ← NOVO
            return res.status(400).json({ erro: 'Pedido já foi pago' });
        }

        // Validações específicas por forma de pagamento
        let cartaoNumero = null;
        let cartaoValidade = null;
        let cartaoNome = null;
        let cartaoRecorrente = false;

        if (formaPagamento === 'cartao') {
            if (!cartao) {
                return res.status(400).json({ erro: 'Dados do cartão não informados' });
            }

            // Validar cartão
            if (!cartao.numero || cartao.numero.length !== 16) {
                return res.status(400).json({ erro: 'Número do cartão inválido' });
            }

            if (!cartao.validade || !cartao.validade.match(/^\d{2}\/\d{2}$/)) {
                return res.status(400).json({ erro: 'Data de validade inválida' });
            }

            if (!cartao.nome || cartao.nome.trim().length < 3) {
                return res.status(400).json({ erro: 'Nome no cartão inválido' });
            }

            // Guardar apenas os últimos 4 dígitos
            cartaoNumero = cartao.numero.slice(-4);
            cartaoValidade = cartao.validade;
            cartaoNome = cartao.nome;
            cartaoRecorrente = cartao.recorrente || false;
        }

        // Simular processamento com gateway de pagamento
        console.log('⏳ Processando pagamento...');
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Gerar protocolo único
        const protocolo = await Pagamento.gerarProtocolo();

        // Salvar no banco
        const novoPagamento = await Pagamento.criar({
            aluno_id,
            forma_pagamento: formaPagamento,
            responsavel_financeiro: responsavelFinanceiro,
            valor,
            parcelas: parcelas || 1,
            cartao_numero: cartaoNumero,
            cartao_validade: cartaoValidade,
            cartao_nome: cartaoNome,
            cartao_recorrente: cartaoRecorrente,
            protocolo,
            status: 'aprovado'
        });

        // ATUALIZAR STATUS DO PEDIDO ← NOVO
        await Pedido.atualizarStatus(pedido_id, 'pago', novoPagamento.id);

        console.log('✅ Pagamento processado com sucesso:', novoPagamento);
        console.log('✅ Pedido atualizado para pago:', pedido_id);

        res.status(201).json({
            sucesso: true,
            mensagem: 'Pagamento processado com sucesso',
            pagamento: novoPagamento,
            pedido: { // ← NOVO
                id: pedido_id,
                status: 'pago'
            }
        });

    } catch (error) {
        console.error('❌ Erro no processamento do pagamento:', error);
        res.status(500).json({ 
            erro: 'Erro interno ao processar pagamento' 
        });
    }
};

exports.listarPagamentos = async (req, res) => {
    try {
        const { status, forma_pagamento } = req.query;
        
        const pagamentos = await Pagamento.listarTodos({
            status,
            forma_pagamento
        });

        res.json({
            sucesso: true,
            quantidade: pagamentos.length,
            pagamentos
        });
    } catch (error) {
        console.error('❌ Erro ao listar pagamentos:', error);
        res.status(500).json({ 
            erro: 'Erro interno do servidor' 
        });
    }
};

exports.buscarPagamento = async (req, res) => {
    try {
        const { id } = req.params;
        
        const pagamento = await Pagamento.buscarPorId(id);
        
        if (!pagamento) {
            return res.status(404).json({ 
                erro: 'Pagamento não encontrado' 
            });
        }

        // Buscar pedido associado (opcional)
        let pedido = null;
        if (pagamento.pedido_id) {
            pedido = await Pedido.buscarPorId(pagamento.pedido_id);
        }

        res.json({
            sucesso: true,
            pagamento,
            pedido: pedido ? { id: pedido.id, status: pedido.status } : null
        });
    } catch (error) {
        console.error('❌ Erro ao buscar pagamento:', error);
        res.status(500).json({ 
            erro: 'Erro interno do servidor' 
        });
    }
};

exports.buscarPagamentosPorAluno = async (req, res) => {
    try {
        const { aluno_id } = req.params;
        
        const pagamentos = await Pagamento.buscarPorAlunoId(aluno_id);

        res.json({
            sucesso: true,
            quantidade: pagamentos.length,
            pagamentos
        });
    } catch (error) {
        console.error('❌ Erro ao buscar pagamentos do aluno:', error);
        res.status(500).json({ 
            erro: 'Erro interno do servidor' 
        });
    }
};