// src/controllers/pedidoController.js
const Pedido = require('../models/Pedido');
const Aluno = require('../models/Aluno');
const Pagamento = require('../models/Pagamento');
const { logger } = require('../lib/logger');
const MetricsService = require('../services/metricsService');

exports.criarPedido = async (req, res) => {
    logger.info('Recebendo dados do pedido', { body: req.body });
    
    try {
        const { aluno_id, itens, total, parcelas } = req.body;

        // Validações
        if (!aluno_id) {
            return res.status(400).json({ erro: 'ID do aluno não informado' });
        }

        if (!itens || !Array.isArray(itens) || itens.length === 0) {
            return res.status(400).json({ erro: 'Itens do pedido não informados' });
        }

        if (!total || total <= 0) {
            return res.status(400).json({ erro: 'Total inválido' });
        }

        // Verificar se aluno existe
        const aluno = await Aluno.buscarPorId(aluno_id);
        if (!aluno) {
            return res.status(404).json({ erro: 'Aluno não encontrado' });
        }

        // Gerar número do pedido
        const numero_pedido = await Pedido.gerarNumeroPedido();

        // Preparar itens para o banco
        const itensFormatados = itens.map(item => ({
            curso_id: item.id,
            curso_titulo: item.titulo,
            quantidade: item.quantidade,
            preco_unitario: item.preco
        }));

        // Criar pedido
        const novoPedido = await Pedido.criar(
            {
                aluno_id,
                numero_pedido,
                total,
                parcelas,
                status: 'aguardando_pagamento'
            },
            itensFormatados
        );

        // 🚀 MÉTRICAS DE NEGÓCIO
        MetricsService.recordPedidoCriado(novoPedido, aluno_id);
        MetricsService.recordItensPedido(novoPedido.id, itensFormatados, aluno_id);
        MetricsService.recordCheckoutInicio(aluno_id, total);

        logger.info('Pedido criado com sucesso', { pedido: novoPedido });

        res.status(201).json({
            sucesso: true,
            mensagem: 'Pedido criado com sucesso',
            pedido: {
                id: novoPedido.id,
                numero: novoPedido.numero_pedido,
                total: novoPedido.total,
                status: novoPedido.status,
                created_at: novoPedido.created_at
            }
        });

    } catch (error) {
        logger.error('Erro ao criar pedido', { error: error.message });
        res.status(500).json({ erro: 'Erro interno ao criar pedido' });
    }
};

exports.buscarPedido = async (req, res) => {
    try {
        const { id } = req.params;
        
        const pedido = await Pedido.buscarPorId(id);
        
        if (!pedido) {
            return res.status(404).json({ erro: 'Pedido não encontrado' });
        }

        // Buscar itens do pedido
        const itens = await Pedido.buscarItens(id);

        res.json({
            sucesso: true,
            pedido: {
                ...pedido,
                itens
            }
        });

    } catch (error) {
        logger.error('Erro ao buscar pedido', { error: error.message });
        res.status(500).json({ erro: 'Erro interno do servidor' });
    }
};

exports.buscarPorNumero = async (req, res) => {
    try {
        const { numero } = req.params;
        
        const pedido = await Pedido.buscarPorNumero(numero);
        
        if (!pedido) {
            return res.status(404).json({ erro: 'Pedido não encontrado' });
        }

        const itens = await Pedido.buscarItens(pedido.id);

        res.json({
            sucesso: true,
            pedido: {
                ...pedido,
                itens
            }
        });

    } catch (error) {
        logger.error('Erro ao buscar pedido', { error: error.message });
        res.status(500).json({ erro: 'Erro interno do servidor' });
    }
};

exports.listarPedidos = async (req, res) => {
    try {
        const { status, aluno_id } = req.query;
        
        const pedidos = await Pedido.listar({ status, aluno_id });

        res.json({
            sucesso: true,
            quantidade: pedidos.length,
            pedidos
        });

    } catch (error) {
        logger.error('Erro ao listar pedidos', { error: error.message });
        res.status(500).json({ erro: 'Erro interno do servidor' });
    }
};

exports.atualizarStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, pagamento_id } = req.body;

        const pedidoAtualizado = await Pedido.atualizarStatus(id, status, pagamento_id);

        if (!pedidoAtualizado) {
            return res.status(404).json({ erro: 'Pedido não encontrado' });
        }

        res.json({
            sucesso: true,
            mensagem: 'Status atualizado com sucesso',
            pedido: pedidoAtualizado
        });

    } catch (error) {
        logger.error('Erro ao atualizar status', { error: error.message });
        res.status(500).json({ erro: 'Erro interno do servidor' });
    }
};