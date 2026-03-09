// src/routes/pedidoRoutes.js
const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedidoController');

router.post('/pedidos', pedidoController.criarPedido);
router.get('/pedidos', pedidoController.listarPedidos);
router.get('/pedidos/:id', pedidoController.buscarPedido);
router.get('/pedidos/numero/:numero', pedidoController.buscarPorNumero);
router.patch('/pedidos/:id/status', pedidoController.atualizarStatus);

module.exports = router;