# 🗂️ Migrations

Este diretório contém os arquivos de migração do banco de dados.

## 📋 Arquivos de Migração

- `001_create_tables.sql` - Cria as tabelas iniciais (alunos, pagamentos, pedidos, pedido_itens)
- `runMigrations.js` - Script para executar automaticamente as migrations

## 🚀 Como Usar

### Opção 1: Executar automaticamente (Recomendado)

```bash
node src/migrations/runMigrations.js
```

Este script:
- Cria uma tabela de controle (`migrations`) para rastrear quais migrations foram executadas
- Lê todos os arquivos `.sql` em ordem alfabética
- Executa apenas as migrations que ainda não foram rodadas
- Registra o status de cada migration

### Opção 2: Montar o package.json

Adicione ao seu `package.json`:

```json
{
  "scripts": {
    "migration": "node src/migrations/runMigrations.js"
  }
}
```

Depois execute:

```bash
npm run migration
```

### Opção 3: Executar manualmente no banco de dados

Você também pode executar o SQL manualmente através de um cliente PostgreSQL:

```bash
psql -U seu_usuario -d seu_banco -f src/migrations/001_create_tables.sql
```

## 📊 Estrutura das Tabelas

### alunos
- `id` (PK)
- `nome_completo`
- `cpf` (UNIQUE)
- `email` (UNIQUE)
- `telefone`
- `created_at`
- `updated_at`

### pagamentos
- `id` (PK)
- `aluno_id` (FK → alunos)
- `forma_pagamento`
- `responsavel_financeiro`
- `valor`
- `parcelas`
- `cartao_*` (campos para cartão)
- `protocolo` (UNIQUE)
- `status`
- `created_at`
- `updated_at`

### pedidos
- `id` (PK)
- `aluno_id` (FK → alunos)
- `numero_pedido` (UNIQUE)
- `status`
- `total`
- `parcelas`
- `forma_pagamento`
- `pagamento_id` (FK → pagamentos)
- `created_at`
- `updated_at`

### pedido_itens
- `id` (PK)
- `pedido_id` (FK → pedidos)
- `curso_id`
- `curso_titulo`
- `quantidade`
- `preco_unitario`
- `created_at`
- `updated_at`

## ⚙️ Variáveis de Ambiente Necessárias

No arquivo `.env`, certifique-se de ter:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=seu_banco
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
```

## 📌 Notas Importantes

- As migrations são executadas em ordem alfabética
- Cada migration é registrada na tabela `migrations` para evitar duplicação
- Todos os índices são criados automaticamente para melhor performance
- Há relacionamentos com `ON DELETE CASCADE` para garantir integridade referencial
