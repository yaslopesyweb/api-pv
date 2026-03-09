
# README - api-pv

## 🚀 Como Rodar o Projeto

### Pré-requisitos
- Node.js (v14+)
- npm ou yarn
- Banco de dados configurado

### Instalação

```bash
# Clone o repositório
git clone https://github.com/yaslopesyweb/api-pv.git
cd api-pv

# Instale as dependências
npm install
```

### Configuração

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
DATABASE_URL=your_database_connection_string
PORT=3000
NODE_ENV=development
```

### Executar a Aplicação

```bash
# Modo desenvolvimento
npm run dev

# Modo produção
npm run build
npm start
```

## 📊 Banco de Dados

### Tables Utilizadas

| Tabela | Descrição |
|--------|-----------|
| `users` | Dados dos usuários |
| `projects` | Projetos cadastrados |
| `tasks` | Tarefas do projeto |
| `logs` | Registro de operações |

### Migrations

```bash
npm run migrate
npm run seed  # (opcional) popular banco com dados iniciais
```

## 📝 Notas

- Consulte a documentação de API para mais detalhes
- Certifique-se de que o banco de dados está em execução antes de iniciar
