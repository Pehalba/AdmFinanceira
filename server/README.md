# Financeiro - Servidor Local

Backend Express.js para testes locais antes de migrar para Firestore.

## 🚀 Início Rápido

```bash
# Instalar dependências
npm install

# Iniciar servidor em modo desenvolvimento (watch)
npm run dev

# Ou iniciar servidor normalmente
npm start
```

O servidor estará disponível em `http://localhost:3001`

## 📁 Estrutura

```
server/
├── controllers/        # Controllers da API REST
│   ├── AuthController.js
│   ├── TransactionController.js
│   ├── AccountController.js
│   ├── CategoryController.js
│   ├── MonthlySummaryController.js
│   ├── RecurringBillController.js
│   └── UserMetaController.js
├── data/               # Sistema de armazenamento
│   ├── Storage.js      # Gerenciador de arquivos JSON
│   └── db/             # Dados armazenados (gerado automaticamente)
│       ├── transactions.json
│       ├── accounts.json
│       ├── categories.json
│       └── ...
├── server.js           # Servidor Express principal
└── package.json
```

## 📡 API Endpoints

### Autenticação

- `POST /api/auth/signup` - Criar conta (provisiona dados iniciais)
- `POST /api/auth/login` - Login
- `GET /api/auth/current?uid=xxx` - Obter usuário atual

### Transações

- `GET /api/transactions?monthKey=YYYY-MM&limit=50` - Listar por mês
- `GET /api/transactions?limit=10` - Transações recentes
- `GET /api/transactions/:id` - Obter por ID
- `POST /api/transactions` - Criar
- `PUT /api/transactions/:id` - Atualizar
- `DELETE /api/transactions/:id` - Deletar

### Contas

- `GET /api/accounts` - Listar todas
- `GET /api/accounts/:id` - Obter por ID
- `POST /api/accounts` - Criar
- `PUT /api/accounts/:id` - Atualizar
- `DELETE /api/accounts/:id` - Deletar

### Categorias

- `GET /api/categories` - Listar todas
- `GET /api/categories/:id` - Obter por ID
- `POST /api/categories` - Criar
- `PUT /api/categories/:id` - Atualizar
- `DELETE /api/categories/:id` - Deletar

### Resumos Mensais

- `GET /api/monthly-summaries/:monthKey` - Obter resumo do mês
- `POST /api/monthly-summaries` - Criar/Atualizar (upsert)

### Contas Recorrentes

- `GET /api/recurring-bills?limit=10` - Listar ativas
- `POST /api/recurring-bills` - Criar
- `PUT /api/recurring-bills/:id` - Atualizar
- `DELETE /api/recurring-bills/:id` - Deletar

### Meta do Usuário

- `GET /api/users/:uid/meta/app` - Obter meta do app
- `PUT /api/users/:uid/meta/app` - Atualizar meta (upsert)

## 💾 Persistência

Os dados são salvos em arquivos JSON na pasta `data/db/`:

- Cada collection tem seu próprio arquivo
- Formato: `{collection}.json`
- Estrutura: Array de objetos JSON

**Exemplo de `accounts.json`:**
```json
[
  {
    "id": "abc123",
    "name": "Conta Principal",
    "type": "checking",
    "balance": 1000,
    "uid": "user123",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

## 🔧 Configuração

### Porta

A porta padrão é `3001`. Para mudar:

```bash
PORT=3002 npm run dev
```

### CORS

CORS está configurado para permitir requisições de `http://localhost:5173` (Vite dev server).

## 📝 Notas

- **Autenticação**: Sistema básico (em produção usar JWT + bcrypt)
- **Validação**: Básica (adicionar validação completa conforme necessário)
- **Segurança**: Apenas para desenvolvimento local
- **Performance**: Adequado para testes locais

## 🎯 Próximos Passos

1. Adicionar validação de dados (Joi, Zod, etc.)
2. Implementar autenticação JWT
3. Adicionar hash de senhas (bcrypt)
4. Adicionar rate limiting
5. Adicionar logs estruturados
6. Migrar para banco de dados (PostgreSQL, MongoDB, etc.)
7. Ou migrar para Firestore conforme planejado
