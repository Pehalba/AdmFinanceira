# Guia: Primeiro Commit e Push para o GitHub

## 📋 Passo a Passo

### 1. Verificar Status dos Arquivos

```bash
git status
```

### 2. Adicionar Arquivos ao Staging

```bash
# Adicionar todos os arquivos (exceto os do .gitignore)
git add .

# OU adicionar arquivos específicos:
git add src/
git add package.json
git add README.md
git add .gitignore
```

### 3. Verificar o que será commitado

```bash
git status
```

### 4. Fazer o Primeiro Commit

```bash
git commit -m "feat: projeto inicial - app de finanças pessoais

- Setup Vite + React
- Estrutura de páginas (Dashboard, Transactions, Banks, Categories, MonthlyBills)
- Sistema de autenticação (localStorage)
- Repositórios: FakeRepository (localStorage), HTTPRepository (servidor local)
- Services: auth, transaction, account, category, dashboard, payable
- Componentes reutilizáveis com BEM CSS
- Layout responsivo mobile-first
- Servidor Express local opcional
- Preparado para migração Firebase"
```

### 5. Criar Repositório no GitHub

1. Acesse https://github.com/new
2. Nome do repositório: `financeiro` (ou outro nome)
3. Descrição: "App de finanças pessoais - React + Vite + Firebase"
4. Escolha: **Público** ou **Privado**
5. **NÃO** marque "Initialize with README" (já temos arquivos)
6. Clique em "Create repository"

### 6. Conectar ao Repositório Remoto

```bash
# Substitua SEU_USUARIO pelo seu nome de usuário do GitHub
git remote add origin https://github.com/SEU_USUARIO/financeiro.git

# OU se preferir SSH:
git remote add origin git@github.com:SEU_USUARIO/financeiro.git
```

### 7. Renomear Branch (Opcional - se necessário)

```bash
# Se sua branch principal não for 'main':
git branch -M main
```

### 8. Fazer Push para o GitHub

```bash
git push -u origin main
```

Se pedir credenciais:
- **Username**: seu nome de usuário do GitHub
- **Password**: use um **Personal Access Token** (não sua senha)
  - Como criar: GitHub > Settings > Developer settings > Personal access tokens > Tokens (classic)
  - Ou configure SSH keys

### 9. Verificar no GitHub

Acesse `https://github.com/SEU_USUARIO/financeiro` e verifique se todos os arquivos foram enviados.

## ✅ Checklist Antes do Commit

- [x] `.gitignore` configurado corretamente
- [ ] `firebase.config.js` não está sendo commitado (deve estar no .gitignore)
- [ ] `node_modules/` não está sendo commitado
- [ ] `dist/` e `build/` não estão sendo commitados
- [ ] Arquivos sensíveis estão no .gitignore
- [ ] README.md atualizado
- [ ] Código funcionando localmente

## 🚨 Importante: Arquivos que NÃO devem ser commitados

- ✅ `node_modules/` - dependências (instalar com `npm install`)
- ✅ `dist/` ou `build/` - arquivos compilados
- ✅ `firebase.config.js` - credenciais sensíveis (quando criar)
- ✅ `.env` - variáveis de ambiente
- ✅ `server/data/db/` - dados de teste do servidor local
- ✅ `*.local` - arquivos locais

## 📝 Comandos Úteis

### Ver histórico de commits
```bash
git log --oneline
```

### Ver diferenças antes de commit
```bash
git diff
```

### Desfazer última mudança (antes de commit)
```bash
git restore arquivo.js
```

### Ver arquivos que serão commitados
```bash
git status
```

### Adicionar um arquivo específico
```bash
git add caminho/do/arquivo.js
```

### Commit com mensagem mais detalhada
```bash
git commit -m "tipo: descrição curta" -m "Descrição detalhada do que foi feito

- Item 1
- Item 2
- Item 3"
```

## 🎯 Próximos Passos Após o Push

1. ✅ Projeto versionado no GitHub
2. Instalar Firebase: `npm install firebase`
3. Configurar Firebase (ver `README_FIREBASE.md`)
4. Implementar FirestoreRepository
5. Migrar dados do localStorage para Firestore
6. Deploy em produção
