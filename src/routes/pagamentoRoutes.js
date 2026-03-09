// src/routes/pagamentoRoutes.js
const express = require('express');
const router = express.Router();
const pagamentoController = require('../controllers/pagamentoController');

router.post('/pagamentos', pagamentoController.processarPagamento);
router.get('/pagamentos', pagamentoController.listarPagamentos);
router.get('/pagamentos/:id', pagamentoController.buscarPagamento);
router.get('/alunos/:aluno_id/pagamentos', pagamentoController.buscarPagamentosPorAluno);

module.exports = router;