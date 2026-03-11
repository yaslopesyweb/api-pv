// backend/src/services/metricsService.js
const { logger } = require('../lib/logger');

class MetricsService {
    /**
     * Registra um novo aluno cadastrado
     */
    static recordAlunoCadastrado(aluno) {
        const logData = {
            business: {
                transaction: 'aluno_cadastrado',
                aluno: {
                    id: aluno.id,
                    email: aluno.email,
                    created_at: aluno.created_at
                }
            }
        };

        logger.info('📊 [METRICA] Aluno cadastrado', logData);
    }

    /**
     * Registra um novo pedido criado (início do funil)
     */
    static recordPedidoCriado(pedido, alunoId) {
        const logData = {
            business: {
                transaction: 'pedido_criado',
                pedido: {
                    id: pedido.id,
                    numero: pedido.numero,
                    total: pedido.total,
                    parcelas: pedido.parcelas,
                    status: pedido.status
                },
                aluno: {
                    id: alunoId
                }
            }
        };

        logger.info('📊 [METRICA] Pedido criado', logData);
    }

    /**
     * Registra os itens de um pedido (cursos comprados)
     */
    static recordItensPedido(pedidoId, itens, alunoId) {
        itens.forEach(item => {
            const logData = {
                business: {
                    transaction: 'curso_comprado',
                    curso: {
                        id: item.curso_id,
                        titulo: item.curso_titulo,
                        quantidade: item.quantidade,
                        preco_unitario: item.preco_unitario
                    },
                    pedido: {
                        id: pedidoId
                    },
                    aluno: {
                        id: alunoId
                    },
                    valor_total: item.preco_unitario * item.quantidade
                }
            };

            logger.info('📊 [METRICA] Curso comprado', logData);
        });
    }

    /**
     * Registra um pagamento aprovado (conversão e receita)
     */
    static recordPagamentoAprovado(pagamento, pedidoId, alunoId) {
        const logData = {
            business: {
                transaction: 'pagamento_aprovado',
                pagamento: {
                    id: pagamento.id,
                    protocolo: pagamento.protocolo,
                    forma: pagamento.forma_pagamento,
                    parcelas: pagamento.parcelas
                },
                pedido: {
                    id: pedidoId
                },
                aluno: {
                    id: alunoId
                },
                valor: pagamento.valor,
                // Para facilitar agregações no Kibana
                metrics: {
                    receita: pagamento.valor,
                    conversao: 1
                }
            }
        };

        logger.info('📊 [METRICA] Pagamento aprovado', logData);
    }

    /**
     * Registra um checkout iniciado (topo do funil)
     */
    static recordCheckoutInicio(alunoId, valorTotal) {
        const logData = {
            business: {
                transaction: 'checkout_iniciado',
                aluno: {
                    id: alunoId
                },
                valor: valorTotal
            }
        };

        logger.info('📊 [METRICA] Checkout iniciado', logData);
    }
}

module.exports = MetricsService;