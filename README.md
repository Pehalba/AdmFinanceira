# Financeiro - App de Finanças Pessoais

Aplicação React para controle de finanças pessoais, desenvolvida com Vite + React (JavaScript), seguindo padrão DOM inspirado no projeto Around. Projeto preparado para evoluir de MVP local (localStorage) para mini-SaaS com Firestore.

## 🚀 Tecnologias

### Frontend
- **Vite** - Build tool e dev server
- **React 18** - Biblioteca UI
- **React Router DOM** - Roteamento
- **JavaScript (ES6+)** - Linguagem
- **CSS3** - Estilização com metodologia BEM

### Backend (Servidor Local)
- **Express.js** - Framework Node.js
- **CORS** - Cross-Origin Resource Sharing
- **JSON File Storage** - Persistência em arquivos JSON

## 📁 Estrutura do Projeto

```
financeiro/
├── src/                    # Frontend React
│   ├── pages/              # Telas/Rotas da aplicação
│   ├── blocks/             # Componentes reutilizáveis (BEM)
│   ├── scripts/            # Lógica de negócio
│   │   ├── repositories/   # Camada de dados
│   │   │   ├── IRepository.js
│   │   │   ├── FakeRepository.js (localStorage)
│   │   │   ├── HTTPRepository.js (API REST)
│   │   │   └── FirestoreRepository.js (stub)
│   │   ├── services/       # Serviços de negócio
│   │   ├── cache/          # Gerenciamento de cache
│   │   └── utils/          # Utilitários
│   ├── app/                # Configuração da aplicação
│   └── main.jsx            # Entry point
│
└── server/                 # Backend Express (Opcional)
    ├── controllers/        # Controllers da API
    ├── data/               # Sistema de armazenamento
    │   └── Storage.js      # Gerenciador de arquivos JSON
    ├── data/db/            # Dados armazenados (gerado automaticamente)
    ├── server.js           # Servidor Express
    └── package.json
```

## 🎨 Padrão CSS - BEM

Todos os componentes seguem a metodologia BEM (Block Element Modifier):

```css
/* Block */
.button { }

/* Element */
.button__label { }

/* Modifier */
.button--primary { }
.button--danger { }
```

### Regra de CSS por Componente

- ✅ Cada componente/page tem seu próprio arquivo `.css` na mesma pasta
- ✅ Importação no componente: `import "./X.css";`
- ✅ `index.css` contém apenas estilos globais (reset/base)

## 🔧 Instalação e Desenvolvimento

### Pré-requisitos

- Node.js 18+ e npm/yarn/pnpm

### Instalação

#### Frontend

```bash
npm install
```

#### Backend (Opcional - para servidor local)

```bash
cd server
npm install
cd ..
```

### Modos de Execução

#### 1. Modo Fake (localStorage) - Padrão

Usa localStorage diretamente, sem servidor:

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`

#### 2. Modo Servidor Local (HTTP) - Recomendado para testes

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

O servidor estará disponível em `http://localhost:3001`

**Terminal 2 - Frontend:**
```bash
# No diretório raiz
npm run dev
```

A aplicação estará disponível em `http://localhost:5173` e fará chamadas para a API em `http://localhost:3001`

**Configurar para usar HTTP:**

Edite `src/scripts/repositories/index.js` e descomente as linhas do HTTPRepository:

```javascript
// Trocar de:
export const transactionRepository = new FakeTransactionRepository();
// Para:
export const transactionRepository = new HTTPTransactionRepository();
```

Repita para todos os repositórios.

### Build para Produção

```bash
npm run build
```

### Preview da Build

```bash
npm run preview
```

## 📦 Funcionalidades

### ✅ Modos Disponíveis

#### 1. Fake (localStorage) - MVP
- **Autenticação**: Login e Cadastro (localStorage)
- **Dashboard**: Resumo mensal com gráficos e widgets
- **Transações**: CRUD completo
- **Bancos**: Gerenciamento de bancos (contas bancárias)
- **Categorias**: Gerenciamento de categorias
- **Despesas Mensais**: Checklist de contas a pagar mensais
- **Cache Local**: Sistema de versionamento
- **Persistência**: Dados salvos no navegador (localStorage)

#### 2. Servidor Local (HTTP) - Testes
- **API REST**: Endpoints completos com Express.js
- **Persistência**: Dados salvos em arquivos JSON (`server/data/db/`)
- **Autenticação**: Sistema básico de autenticação
- **CORS**: Configurado para desenvolvimento
- **Provisionamento**: Signup cria dados iniciais automaticamente
- **Mesma funcionalidade** do modo Fake, mas com servidor separado

#### 3. Firestore (Preparado) - Futuro
- Interfaces e stubs criados para migração futura
- Regras de otimização para baixo custo já implementadas

## 🗄️ Arquitetura de Dados

### Modo Fake (localStorage)

Dados armazenados localmente usando localStorage:

- `financeiro_transactions` - Transações
- `financeiro_accounts` - Bancos (contas bancárias)
- `financeiro_categories` - Categorias
- `financeiro_monthly_summaries` - Resumos mensais
- `financeiro_recurring_bills` - Contas recorrentes
- `financeiro_payables` - Despesas mensais (contas a pagar)
- `financeiro_user_meta` - Metadados do usuário
- `financeiro_cache_*` - Cache versionado

### Modo Servidor Local (HTTP)

Dados armazenados em arquivos JSON em `server/data/db/`:

- `transactions.json` - Transações
- `accounts.json` - Bancos (contas bancárias)
- `categories.json` - Categorias
- `monthly_summaries.json` - Resumos mensais
- `recurring_bills.json` - Contas recorrentes
- `payables.json` - Despesas mensais (contas a pagar)
- `users.json` - Usuários
- `user_meta.json` - Metadados dos usuários

**API Endpoints:**
- `POST /api/auth/signup` - Criar conta
- `POST /api/auth/login` - Login
- `GET /api/transactions?monthKey=YYYY-MM&limit=50` - Listar transações
- `POST /api/transactions` - Criar transação
- `PUT /api/transactions/:id` - Atualizar transação
- `DELETE /api/transactions/:id` - Deletar transação
- `GET /api/accounts` - Listar bancos
- `GET /api/categories` - Listar categorias
- `GET /api/monthly-summaries/:monthKey` - Resumo mensal
- `GET /api/payables?monthKey=YYYY-MM&limit=100` - Listar despesas mensais
- `GET /api/payables/upcoming?days=15&limit=10` - Próximas despesas
- `POST /api/payables` - Criar despesa mensal
- `PUT /api/payables/:id` - Atualizar despesa mensal (marcar como pago)
- `POST /api/payables/generate` - Gerar despesas a partir de contas recorrentes
- `DELETE /api/payables/:id` - Deletar despesa mensal
- E mais...

### Firestore (Futuro)

#### Regras de Baixo Custo

**Transações:**
- Sempre filtradas por `monthKey` (YYYY-MM) + paginação (limit 50)
- Denormalização de `accountName`, `bankName` e `categoryName` dentro de `transactions`
- Sem realtime listeners por padrão

**Despesas Mensais (Payables):**
- Sempre filtradas por `monthKey` (YYYY-MM) + limit
- Denormalização de `bankName` e `categoryName` dentro de `payables`
- Chave única: `recurringBillId + monthKey` (evita duplicação)
- Status: `open` ou `paid` (com `paidAtISO` quando pago)
- Sem realtime listeners por padrão

**Dashboard:**
Máximo 4 leituras:
1. `monthlySummaries/{YYYY-MM}` (1 doc)
2. `recurringBills` ativas (limit 10)
3. `payables` próximas (próximos 15 dias, limit 10, status=open)
4. Transações recentes (limit 10) - opcional

**Cache de Accounts/Categories:**
- Carregar 1 vez e cachear localmente com versionamento
- Meta doc: `users/{uid}/meta/app { accountsVersion, categoriesVersion }`
- No login: ler apenas `meta/app` (1 leitura)
- Buscar accounts/categories apenas se cache vazio ou versão mudou

#### Signup sem Releituras

- Ao criar usuário, provisionar 1 conta padrão + categorias padrão
- Retornar dados criados diretamente (sem fazer "get" para confirmar)
- Salvar em cache local imediatamente

## 🔐 Autenticação

### Fluxo de Signup

1. Usuário preenche email e senha
2. Sistema cria usuário
3. **Provisão automática** (sem releitura):
   - Cria banco padrão: "Conta Principal"
   - Cria 5 categorias padrão:
     - Alimentação (despesa)
     - Transporte (despesa)
     - Moradia (despesa)
     - Salário (receita)
     - Outros (despesa)
4. Retorna dados criados
5. Salva no cache local com versionamento

### Fluxo de Login

1. Usuário faz login
2. Sistema lê `users/{uid}/meta/app` (1 leitura)
3. Compara versões do cache local com servidor
4. Carrega accounts/categories apenas se necessário

## 📱 Páginas

### `/login`
Tela de autenticação (login e cadastro)

### `/` (Dashboard)
- **Resumo mensal** (receitas, despesas, saldo)
- **Gráficos:**
  - Receitas vs Despesas (barras horizontais)
  - Despesas por Categoria (barras horizontais, top 8 categorias)
- **Widgets:**
  - Próximas Despesas Mensais (próximos 15 dias, limit 10, status=open)
  - Contas Recorrentes ativas (limit 10)
  - Transações recentes (limit 10)
- Seletor de mês

### `/transactions`
- Lista de transações filtradas por mês
- Formulário para criar nova transação
- Edição de transações
- Exclusão de transações
- Filtro por banco (renomeado de "Conta")
- Paginação (limit 50)

### `/banks` (Bancos)
- Lista de bancos cadastrados (contas bancárias)
- Formulário para criar novo banco
- Exclusão de bancos
- Tipos: corrente, poupança, investimento, crédito, outro
- Exemplos: Banco do Brasil, Nubank, etc.

### `/categories`
- Lista de categorias
- Formulário para criar nova categoria
- Exclusão de categorias
- Tipos: receita ou despesa
- Cores personalizáveis

### `/monthly-bills` (Despesas Mensais)
- Lista de despesas mensais do mês selecionado (checklist)
- Ordenadas por vencimento
- Cada item: título, vencimento, valor, banco, categoria, status (open/paid)
- Checkbox para marcar/desmarcar como pago (atualiza status e paidAtISO)
- Botão "Nova Despesa Mensal" para criar manualmente
- Botão "Gerar do Mês" para criar automaticamente a partir de Contas Recorrentes
- Filtro por mês (monthKey YYYY-MM)

## 🛠️ Services

### authService
- `signup(email, password, userData)` - Cadastro com provisionamento
- `login(email, password)` - Login
- `logout()` - Logout e limpeza de cache
- `checkAndUpdateCache(uid)` - Verifica e atualiza cache

### transactionService
- `create(transactionData)` - Cria com denormalização
- `update(id, updates)` - Atualiza com recalculo de denormalização
- `delete(id)` - Exclui transação
- `getByMonth(monthKey, limit, startAfter)` - Busca por mês com paginação
- `getRecent(limit)` - Transações recentes

### accountService / categoryService
- `create(data)` - Cria e invalida cache
- `update(id, updates)` - Atualiza e invalida cache
- `delete(id, uid)` - Exclui e invalida cache
- `getAll(uid, forceReload)` - Busca com cache
- `getById(id)` - Busca por ID

### payableService
- `create(payableData)` - Cria despesa mensal com denormalização
- `update(id, updates)` - Atualiza (gerencia status e paidAtISO)
- `toggleStatus(id)` - Alterna entre open/paid
- `delete(id)` - Exclui despesa mensal
- `getByMonth(monthKey, limit)` - Lista despesas do mês (ordenadas por vencimento)
- `getUpcoming(days, limit)` - Próximas despesas (próximos N dias, status=open)
- `generateFromRecurringBills(monthKey)` - Gera despesas a partir de contas recorrentes (não duplica)

### dashboardService
- `getDashboardData(monthKey)` - Carrega dados otimizados (max 4 leituras)
- `calculateMonthlySummary(monthKey)` - Calcula e salva resumo mensal

## 📝 Repositórios

### FakeRepository (localStorage)
Implementação completa usando localStorage do navegador.
- Todos os repositórios: Transaction, Account, Category, MonthlySummary, RecurringBill, **Payable**, UserMeta, Auth

### HTTPRepository (Servidor Local)
Implementação usando Fetch API para chamar servidor Express local.
- Todos os repositórios: Transaction, Account, Category, MonthlySummary, RecurringBill, **Payable**, UserMeta, Auth
- Proxy configurado no `vite.config.js` para redirecionar `/api` para `http://localhost:3001`

### FirestoreRepository (Stub)
Interfaces e comentários com TODO para implementação futura.
- Todos os repositórios incluindo **PayableRepository** com stubs preparados

### Troca de Repositório

Edite `src/scripts/repositories/index.js`:

```javascript
// Opção 1: Fake (localStorage) - Padrão
import { FakeTransactionRepository } from './FakeRepository.js';
export const transactionRepository = new FakeTransactionRepository();

// Opção 2: HTTP (Servidor Local) - Para testes
import { HTTPTransactionRepository } from './HTTPRepository.js';
export const transactionRepository = new HTTPTransactionRepository();

// Opção 3: Firestore (futuro)
import { FirestoreTransactionRepository } from './FirestoreRepository.js';
export const transactionRepository = new FirestoreTransactionRepository();
```

**Importante:** Troque TODOS os repositórios ao mesmo tempo (transaction, account, category, payable, etc.).

## 🧪 Cache Manager

Sistema de cache local com versionamento:

```javascript
import { cacheManager } from './scripts/cache/cacheManager.js';

// Salvar
cacheManager.saveAccounts(accounts, version);
cacheManager.saveCategories(categories, version);

// Carregar
const accounts = cacheManager.getAccounts();
const categories = cacheManager.getCategories();

// Verificar versão
const isValid = cacheManager.isAccountsCacheValid(serverVersion);

// Limpar
cacheManager.clear();
cacheManager.clearAccounts();
cacheManager.clearCategories();
```

## 🧪 Testando o Sistema

### Com Servidor Local (Recomendado)

1. **Inicie o backend:**
   ```bash
   cd server
   npm run dev
   ```

2. **Configure para usar HTTP:**
   - Edite `src/scripts/repositories/index.js`
   - Descomente as linhas do HTTPRepository
   - Comente as linhas do FakeRepository

3. **Inicie o frontend:**
   ```bash
   npm run dev
   ```

4. **Teste o sistema:**
   - Crie uma conta nova
   - Verifique que os dados são salvos em `server/data/db/`
   - Teste CRUD completo de transações, contas e categorias
   - Verifique os logs do servidor

### Com localStorage (Fake)

1. **Configure para usar Fake:**
   - Edite `src/scripts/repositories/index.js`
   - Mantenha FakeRepository ativo (padrão)

2. **Inicie o frontend:**
   ```bash
   npm run dev
   ```

3. **Teste o sistema:**
   - Dados serão salvos no localStorage do navegador
   - Abra DevTools > Application > Local Storage para ver os dados

## 🎯 Próximos Passos (Firestore)

1. ✅ Testar com servidor local (FEITO)
2. Configurar Firebase/Firestore
3. Implementar métodos em `FirestoreRepository.js`
4. Configurar regras de segurança no Firestore
5. Adicionar Firebase Auth
6. Implementar Cloud Functions (opcional)
7. Adicionar testes unitários e E2E
8. Deploy (Vercel, Netlify, Firebase Hosting)

## 📄 Licença

Este projeto é de uso pessoal/educacional.

## 👤 Autor

Desenvolvido seguindo padrões de arquitetura escalável e otimização de custos.

---

**Nota:** Este projeto está em MVP com localStorage. A estrutura está preparada para migração para Firestore seguindo as regras de otimização de custos especificadas.
