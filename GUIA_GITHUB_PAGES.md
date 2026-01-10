# 🚀 Guia: Publicar no GitHub Pages

Este guia explica como publicar o projeto React no GitHub Pages.

## 📋 Pré-requisitos

1. ✅ Repositório criado no GitHub
2. ✅ Código commitado e feito push para o GitHub
3. ✅ Branch `main` (ou `master`) com código atualizado

## 🔧 Configuração Inicial (Uma vez apenas)

### 1. Habilitar GitHub Pages no Repositório

1. Acesse seu repositório no GitHub: `https://github.com/SEU_USUARIO/financeiro`
2. Vá em **Settings** (Configurações)
3. No menu lateral, clique em **Pages**
4. Em **Source** (Origem), selecione:
   - **Branch**: `gh-pages` ou `main`
   - **Folder**: `/ (root)` ou `/docs` (dependendo da configuração)
5. Clique em **Save**

**⚠️ IMPORTANTE:** Para usar GitHub Actions (recomendado):
- Deixe **Source** como "Deploy from a branch" inicialmente
- O workflow criará automaticamente a branch `gh-pages`

### 2. Configurar Permissões do GitHub Actions (se necessário)

1. No repositório, vá em **Settings** > **Actions** > **General**
2. Em **Workflow permissions**, selecione:
   - ✅ **Read and write permissions**
   - ✅ **Allow GitHub Actions to create and approve pull requests**
3. Role até **Pages** e certifique-se de que está habilitado

## 🚀 Deploy Automático (Recomendado)

### Como Funciona

O workflow `.github/workflows/deploy.yml` foi configurado para:
- ✅ Executar automaticamente a cada push na branch `main`
- ✅ Fazer build do projeto
- ✅ Publicar automaticamente no GitHub Pages

### Executar Deploy

#### Opção 1: Push Automático (Recomendado)

Sempre que você fizer push para a branch `main`, o deploy acontece automaticamente:

```bash
git add .
git commit -m "feat: atualização do projeto"
git push origin main
```

O workflow será executado automaticamente e você pode acompanhar em:
**Actions** > **Deploy to GitHub Pages**

#### Opção 2: Deploy Manual

1. No GitHub, vá em **Actions**
2. Selecione o workflow **Deploy to GitHub Pages**
3. Clique em **Run workflow**
4. Selecione a branch `main`
5. Clique em **Run workflow**

### Verificar Status do Deploy

1. Vá em **Actions** no repositório
2. Clique no workflow mais recente
3. Acompanhe a execução:
   - ✅ Verde = Sucesso
   - ❌ Vermelho = Erro (ver logs)

## 🌐 Acessar o Site Publicado

Após o deploy bem-sucedido, seu site estará disponível em:

```
https://SEU_USUARIO.github.io/financeiro/
```

**⚠️ IMPORTANTE:** Pode levar alguns minutos para ficar disponível após o primeiro deploy.

## 🛠️ Deploy Manual (Alternativa)

Se preferir fazer deploy manual:

### 1. Fazer Build

```bash
npm run build
```

Isso criará a pasta `dist/` com os arquivos compilados.

### 2. Opção A: Usar gh-pages (Recomendado para manual)

Instale o pacote:
```bash
npm install --save-dev gh-pages
```

Adicione no `package.json`:
```json
{
  "scripts": {
    "deploy": "npm run build && gh-pages -d dist"
  }
}
```

Execute:
```bash
npm run deploy
```

### 3. Opção B: Push manual para branch gh-pages

```bash
# Fazer build
npm run build

# Criar branch gh-pages
git checkout --orphan gh-pages
git rm -rf .

# Copiar arquivos da pasta dist
cp -r dist/* .

# Commit e push
git add .
git commit -m "Deploy to GitHub Pages"
git push origin gh-pages --force

# Voltar para branch main
git checkout main
```

## ⚙️ Configurações Importantes

### Base Path

O projeto está configurado para funcionar com GitHub Pages:

- **Vite config** (`vite.config.js`): Detecta automaticamente o base path
- **React Router** (`src/app/App.jsx`): Configura basename automaticamente
- **URL**: `https://usuario.github.io/repositorio/`

### Arquivos Configurados

- ✅ `.github/workflows/deploy.yml` - Workflow de deploy automático
- ✅ `vite.config.js` - Configurado para GitHub Pages
- ✅ `src/app/App.jsx` - BrowserRouter com basename dinâmico

## 🔍 Verificar se Está Funcionando

### 1. Verificar Build Local

```bash
npm run build
npm run preview
```

Acesse `http://localhost:4173/` e verifique se tudo funciona.

### 2. Verificar no GitHub Pages

1. Acesse `https://SEU_USUARIO.github.io/financeiro/`
2. Verifique se a aplicação carrega
3. Teste navegação entre páginas
4. Teste funcionalidades (login, cadastro, etc)

## ⚠️ Problemas Comuns

### Problema 1: 404 ao navegar para rotas

**Causa:** GitHub Pages não suporta SPA routing diretamente.

**Solução:** 
- ✅ Já configurado no projeto! O `BrowserRouter` com `basename` resolve isso.
- Se ainda ocorrer, adicione um arquivo `404.html` na raiz do dist:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Redirecionando...</title>
    <script>
      // Redirecionar para index.html mantendo o path
      sessionStorage.redirect = location.href;
      location.replace(
        location.href.split('/').slice(0, -1).join('/') + '/index.html'
      );
    </script>
  </head>
  <body>
    <h1>Redirecionando...</h1>
  </body>
</html>
```

### Problema 2: Assets não carregam (CSS/JS quebrado)

**Causa:** Base path incorreto.

**Solução:**
- Verifique se o `vite.config.js` está configurado corretamente
- Verifique se o repositório tem o nome correto na URL

### Problema 3: Workflow falha no build

**Causa:** Dependências ou erros no código.

**Solução:**
1. Veja os logs em **Actions** > **Deploy to GitHub Pages**
2. Execute localmente: `npm run build`
3. Corrija os erros
4. Faça push novamente

### Problema 4: localStorage não funciona

**Causa:** GitHub Pages usa HTTPS, localStorage deve funcionar normalmente.

**Solução:**
- Verifique se não há bloqueio do navegador
- Teste em modo anônimo

## 🔄 Atualizar Site Publicado

### Deploy Automático (Recomendado)

Basta fazer push para a branch `main`:

```bash
git add .
git commit -m "atualização"
git push origin main
```

O workflow executará automaticamente e atualizará o site.

## 📝 Notas Importantes

### Modo de Uso no GitHub Pages

No GitHub Pages, o projeto funcionará em **modo Fake (localStorage)** por padrão, pois:
- ✅ Não há servidor backend disponível
- ✅ Dados são salvos no localStorage do navegador
- ✅ Cada usuário tem seus próprios dados localmente

### Para Usar com Firebase (Futuro)

Quando conectar ao Firebase:
1. Configure o Firebase Hosting ou use Vercel/Netlify
2. Configure variáveis de ambiente para credenciais
3. GitHub Pages funcionará apenas em modo Fake até então

## 🎯 Próximos Passos

1. ✅ Deploy no GitHub Pages (FEITO)
2. ⏭️ Conectar ao Firebase
3. ⏭️ Migrar para Firebase Hosting (melhor para Firebase)
4. ⏭️ Configurar domínio customizado (opcional)

## 🔗 Links Úteis

- [Documentação GitHub Pages](https://docs.github.com/en/pages)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Vite Deploy Guide](https://vitejs.dev/guide/static-deploy.html#github-pages)
