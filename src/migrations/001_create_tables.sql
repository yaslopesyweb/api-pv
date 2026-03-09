-- Migration: Create Initial Tables
-- Description: Cria as tabelas iniciais do banco de dados

-- Tabela de Alunos
CREATE TABLE IF NOT EXISTS alunos (
    id SERIAL PRIMARY KEY,
    nome_completo VARCHAR(255) NOT NULL,
    cpf VARCHAR(11) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    telefone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para tabela alunos
CREATE INDEX IF NOT EXISTS idx_alunos_cpf ON alunos(cpf);
CREATE INDEX IF NOT EXISTS idx_alunos_email ON alunos(email);
CREATE INDEX IF NOT EXISTS idx_alunos_created_at ON alunos(created_at);

-- Tabela de Pagamentos
CREATE TABLE IF NOT EXISTS pagamentos (
    id SERIAL PRIMARY KEY,
    aluno_id INTEGER NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
    forma_pagamento VARCHAR(50) NOT NULL,
    responsavel_financeiro BOOLEAN DEFAULT FALSE,
    valor DECIMAL(10, 2) NOT NULL,
    parcelas INTEGER,
    cartao_numero VARCHAR(16),
    cartao_validade VARCHAR(5),
    cartao_nome VARCHAR(255),
    cartao_recorrente BOOLEAN DEFAULT FALSE,
    protocolo VARCHAR(100) NOT NULL UNIQUE,
    status VARCHAR(50) DEFAULT 'aguardando',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para tabela pagamentos
CREATE INDEX IF NOT EXISTS idx_pagamentos_aluno_id ON pagamentos(aluno_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_protocolo ON pagamentos(protocolo);
CREATE INDEX IF NOT EXISTS idx_pagamentos_status ON pagamentos(status);
CREATE INDEX IF NOT EXISTS idx_pagamentos_created_at ON pagamentos(created_at);

-- Tabela de Pedidos
CREATE TABLE IF NOT EXISTS pedidos (
    id SERIAL PRIMARY KEY,
    aluno_id INTEGER NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
    numero_pedido VARCHAR(100) NOT NULL UNIQUE,
    status VARCHAR(50) DEFAULT 'aguardando_pagamento',
    total DECIMAL(10, 2) NOT NULL,
    parcelas INTEGER,
    forma_pagamento VARCHAR(50),
    pagamento_id INTEGER REFERENCES pagamentos(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para tabela pedidos
CREATE INDEX IF NOT EXISTS idx_pedidos_aluno_id ON pedidos(aluno_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_numero_pedido ON pedidos(numero_pedido);
CREATE INDEX IF NOT EXISTS idx_pedidos_status ON pedidos(status);
CREATE INDEX IF NOT EXISTS idx_pedidos_pagamento_id ON pedidos(pagamento_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_created_at ON pedidos(created_at);

-- Tabela de Itens do Pedido
CREATE TABLE IF NOT EXISTS pedido_itens (
    id SERIAL PRIMARY KEY,
    pedido_id INTEGER NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    curso_id INTEGER,
    curso_titulo VARCHAR(255) NOT NULL,
    quantidade INTEGER NOT NULL DEFAULT 1,
    preco_unitario DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para tabela pedido_itens
CREATE INDEX IF NOT EXISTS idx_pedido_itens_pedido_id ON pedido_itens(pedido_id);
CREATE INDEX IF NOT EXISTS idx_pedido_itens_curso_id ON pedido_itens(curso_id);
CREATE INDEX IF NOT EXISTS idx_pedido_itens_created_at ON pedido_itens(created_at);
