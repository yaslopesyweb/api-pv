// src/routes/alunoRoutes.js
const express = require('express');
const router = express.Router();
const alunoController = require('../controllers/alunoController');

// Rotas públicas (por enquanto)
router.post('/alunos', alunoController.criarAluno);
router.get('/alunos', alunoController.listarAlunos);
router.get('/alunos/:id', alunoController.buscarAluno);

module.exports = router;