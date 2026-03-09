// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const db = require('./src/models/database');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Middleware para log de requisições (útil para debug)
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Rotas
app.use('/api', require('./src/routes/alunoRoutes'));
app.use('/api', require('./src/routes/pagamentoRoutes'));
app.use('/api', require('./src/routes/pedidoRoutes')); // ← NOVA ROTA DE PEDIDOS

// Rota de health check
app.get('/health', async (req, res) => {
    // Testar conexão com banco
    const dbStatus = await db.testConnection().catch(() => false);
    
    res.json({ 
        status: 'OK', 
        timestamp: new Date(),
        banco: dbStatus ? 'conectado' : 'desconectado',
        servico: 'poliedro-backend',
        versao: '1.0.0'
    });
});

// Rota de métricas (para o Zabbix/Prometheus depois)
app.get('/metrics', (req, res) => {
    res.json({
        uptime: process.uptime(),
        memoria: process.memoryUsage(),
        conexoes_ativas: db.pool?.totalCount || 0,
        conexoes_ociosas: db.pool?.idleCount || 0
    });
});

// Tratamento de erro 404 (rota não encontrada)
app.use((req, res) => {
    res.status(404).json({ erro: 'Rota não encontrada' });
});

// Tratamento de erros global
app.use((err, req, res, next) => {
    console.error('❌ Erro global:', err.stack);
    res.status(500).json({ 
        erro: 'Erro interno do servidor',
        mensagem: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Iniciar servidor
app.listen(port, async () => {
    console.log(`🚀 Servidor rodando em http://localhost:${port}`);
    console.log(`📚 Rotas disponíveis:`);
    console.log(`   - POST /api/alunos`);
    console.log(`   - GET  /api/alunos`);
    console.log(`   - POST /api/pagamentos`);
    console.log(`   - GET  /api/pagamentos`);
    console.log(`   - POST /api/pedidos`); // ← NOVA ROTA
    console.log(`   - GET  /api/pedidos`);
    console.log(`   - GET  /api/pedidos/:id`);
    console.log(`   - PATCH /api/pedidos/:id/status`);
    console.log(`   - GET  /health`);
    console.log(`   - GET  /metrics`);
    
    // Testar conexão com banco ao iniciar
    const conectado = await db.testConnection();
    if (!conectado) {
        console.warn('⚠️  Servidor iniciado sem conexão com banco de dados');
    }
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Encerrando servidor...');
    await db.close();
    process.exit(0);
});