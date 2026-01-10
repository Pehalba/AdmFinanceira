# 🚀 Guia Completo: Deploy no GitHub Pages

Este guia explica passo a passo como fazer o deploy do projeto no GitHub Pages.

## 📋 Passo a Passo Completo

### 1. Preparar o Repositório (Primeiro Commit)

Se ainda não fez o commit inicial:

```bash
# Verificar status
git status

# Adicionar todos os arquivos
git add .

# Fazer o primeiro commit
git commit -m "feat: projeto inicial - app de finanças pessoais

- Setup Vite + React com GitHub Pages configurado
- Sistema completo: Dashboard, Transactions, Banks, Categories, MonthlyBills
- Autenticação com localStorage
- Layout responsivo mobile-first
- Workflow GitHub Actions para deploy automático
- Configurado para GitHub Pages com base path dinâmico"

# Criar repositório no GitHub primeiro (github.com/new)
# Nome: financeiro (ou outro de sua escolha)

# Conectar ao repositório remoto
git remote add origin https://github.com/SEU_USUARIO/financeiro.git

# Renomear branch para main (se necessário)
git branch -M main

# Fazer push
git push -u origin main
```

### 2. Habilitar GitHub Pages

1. Acesse seu repositório: `https://github.com/SEU_USUARIO/financeiro`
2. Vá em **Settings** (Configurações)
3. No menu lateral, clique em **Pages**
4. Em **Source**, selecione:
   - **Deploy from a branch** (padrão)
   - **Branch**: `gh-pages` ou `main`
   - **Folder**: `/ (root)` ou `/docs`
5. Clique em **Save**

**⚠️ IMPORTANTE:** O workflow do GitHub Actions vai criar automaticamente a branch `gh-pages`, então você pode deixar como está ou escolher "Deploy from a branch" > "gh-pages".

### 3. Configurar Permissões do GitHub Actions

1. No repositório, vá em **Settings** > **Actions** > **General**
2. Role até **Workflow permissions**
3. Selecione:
   - ✅ **Read and write permissions**
   - ✅ **Allow GitHub Actions to create and approve pull requests**
4. Clique em **Save**

### 4. Verificar Workflow

O workflow `.github/workflows/deploy.yml` já está configurado e vai:
- ✅ Executar automaticamente a cada push na branch `main`
- ✅ Fazer build do projeto
- ✅ Publicar no GitHub Pages

### 5. Fazer Deploy

#### Opção A: Deploy Automático (Recomendado)

Basta fazer push:

```bash
git add .
git commit -m "feat: configuração para GitHub Pages"
git push origin main
```

O workflow será executado automaticamente!

#### Opção B: Deploy Manual via GitHub Actions

1. No GitHub, vá em **Actions**
2. Selecione o workflow **Deploy to GitHub Pages**
3. Clique em **Run workflow**
4. Selecione a branch `main`
5. Clique em **Run workflow**

### 6. Acompanhar o Deploy

1. Vá em **Actions** no repositório
2. Clique no workflow mais recente
3. Acompanhe a execução:
   - **Verde** = Sucesso ✅
   - **Vermelho** = Erro ❌ (clique para ver logs)

### 7. Acessar o Site

Após o deploy bem-sucedido (pode levar alguns minutos), acesse:

```
https://SEU_USUARIO.github.io/financeiro/
```

**⚠️ IMPORTANTE:** Substitua `SEU_USUARIO` pelo seu nome de usuário do GitHub e `financeiro` pelo nome do seu repositório.

## 🔧 Configurações Aplicadas

### ✅ Arquivos Configurados

1. **`.github/workflows/deploy.yml`**
   - Workflow de deploy automático
   - Executa build e publica no GitHub Pages

2. **`vite.config.js`**
   - Base path configurado para GitHub Pages
   - Detecta automaticamente o nome do repositório

3. **`src/app/App.jsx`**
   - `BrowserRouter` com basename dinâmico
   - Detecta automaticamente o base path do GitHub Pages
   - Handler para redirects do 404.html

4. **`404.html`**
   - Redireciona para index.html mantendo o path
   - Necessário para SPA routing no GitHub Pages

5. **`package.json`**
   - Script `build:github` adicionado

### ✅ Funcionalidades

- ✅ Base path automático (detecta nome do repositório)
- ✅ SPA routing funcionando (404.html + React Router)
- ✅ Deploy automático a cada push
- ✅ Assets (CSS/JS) carregam corretamente
- ✅ Navegação entre páginas funciona
- ✅ Funciona em desenvolvimento local e produção

## 🧪 Testar Localmente Antes do Deploy

### 1. Testar Build Local

```bash
# Build local
npm run build

# Preview local
npm run preview
```

Acesse `http://localhost:4173/` e verifique se tudo funciona.

### 2. Testar Build com Base Path (Simular GitHub Pages)

```bash
# Build com base path
npm run build:github

# Ou manualmente:
GITHUB_PAGES=true GITHUB_REPOSITORY=usuario/financeiro npm run build

# Preview local
npm run preview
```

## ⚠️ Problemas Comuns e Soluções

### Problema 1: Workflow falha no build

**Causa:** Erros no código ou dependências faltando.

**Solução:**
1. Veja os logs em **Actions** > workflow mais recente
2. Teste localmente: `npm run build`
3. Corrija os erros
4. Faça push novamente

### Problema 2: 404 ao navegar para rotas

**Causa:** GitHub Pages não suporta SPA routing diretamente.

**Solução:**
- ✅ Já configurado! O `404.html` + `BrowserRouter` com basename resolve isso.
- Se ainda ocorrer, verifique se o `404.html` está na pasta `dist/` após o build.

### Problema 3: Assets (CSS/JS) não carregam

**Causa:** Base path incorreto.

**Solução:**
1. Verifique se `vite.config.js` está configurado corretamente
2. Verifique se o nome do repositório está correto na URL
3. Teste localmente: `npm run build` e verifique os caminhos no `dist/index.html`

### Problema 4: Site não atualiza após deploy

**Causa:** Cache do navegador ou deploy ainda não concluído.

**Solução:**
1. Aguarde alguns minutos
2. Limpe o cache do navegador (Ctrl+Shift+R)
3. Verifique se o workflow terminou em **Actions**

### Problema 5: Workflow não executa automaticamente

**Causa:** Permissões não configuradas ou branch incorreta.

**Solução:**
1. Verifique **Settings** > **Actions** > **General** > **Workflow permissions**
2. Verifique se está fazendo push para a branch `main` (ou a configurada no workflow)
3. Verifique o nome do workflow em `.github/workflows/deploy.yml`

## 🔄 Atualizar Site Publicado

Para atualizar o site após fazer mudanças:

```bash
git add .
git commit -m "feat: descrição das mudanças"
git push origin main
```

O workflow executará automaticamente e atualizará o site!

## 📝 Notas Importantes

### Modo de Funcionamento

No GitHub Pages, o projeto funciona em **modo Fake (localStorage)**:
- ✅ Dados salvos no localStorage do navegador
- ✅ Cada usuário tem seus próprios dados localmente
- ✅ Não há servidor backend (usar FakeRepository)

### Para Usar Firebase (Futuro)

Quando conectar ao Firebase:
1. Configure Firebase Hosting (melhor opção) ou use Vercel/Netlify
2. GitHub Pages continuará funcionando em modo Fake até migrar
3. Firebase Hosting é gratuito e integrado ao Firebase

### Domínio Customizado (Opcional)

Para usar domínio customizado:

1. No GitHub: **Settings** > **Pages** > **Custom domain**
2. Adicione seu domínio
3. Configure DNS no seu provedor de domínio
4. O GitHub fornece os registros DNS necessários

## 📚 Próximos Passos

1. ✅ Deploy no GitHub Pages (FEITO)
2. ⏭️ Testar todas as funcionalidades no site publicado
3. ⏭️ Conectar ao Firebase (opcional)
4. ⏭️ Configurar domínio customizado (opcional)

## 🔗 Links Úteis

- [Documentação GitHub Pages](https://docs.github.com/en/pages)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Vite Deploy Guide](https://vitejs.dev/guide/static-deploy.html#github-pages)
- [React Router Basename](https://reactrouter.com/en/main/router-components/browser-router#basename)

---

**✅ Tudo configurado!** Faça push para a branch `main` e o deploy será automático! 🚀
