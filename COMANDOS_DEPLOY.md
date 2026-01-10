# 🚀 Comandos Rápidos para Deploy no GitHub Pages

## 1️⃣ Preparar e Fazer Commit Inicial

```bash
# Ver status
git status

# Adicionar todos os arquivos
git add .

# Fazer commit
git commit -m "feat: projeto inicial com GitHub Pages configurado

- App de finanças pessoais completo
- Configurado para GitHub Pages
- Workflow de deploy automático
- Layout responsivo mobile-first"

# Criar repositório no GitHub primeiro (github.com/new)
# Nome sugerido: financeiro

# Conectar ao repositório (substitua SEU_USUARIO)
git remote add origin https://github.com/SEU_USUARIO/financeiro.git

# Renomear branch para main (se necessário)
git branch -M main

# Fazer push
git push -u origin main
```

## 2️⃣ Habilitar GitHub Pages

1. Acesse: `https://github.com/SEU_USUARIO/financeiro`
2. **Settings** > **Pages**
3. **Source**: Deploy from a branch
4. **Branch**: `gh-pages` (será criado automaticamente pelo workflow)
5. **Save**

## 3️⃣ Configurar Permissões do GitHub Actions

1. **Settings** > **Actions** > **General**
2. **Workflow permissions**: ✅ Read and write permissions
3. **Save**

## 4️⃣ Deploy Automático

Agora, toda vez que você fizer push, o deploy é automático:

```bash
git add .
git commit -m "atualização"
git push origin main
```

## 🌐 Acessar Site Publicado

Após o deploy (pode levar alguns minutos), acesse:

```
https://SEU_USUARIO.github.io/financeiro/
```

⚠️ **Substitua `SEU_USUARIO` pelo seu nome de usuário do GitHub!**

## 🔍 Verificar Deploy

1. Vá em **Actions** no repositório
2. Veja se o workflow **Deploy to GitHub Pages** está executando
3. Aguarde até aparecer ✅ verde
4. Acesse o link que aparece no final do workflow

## ⚙️ Arquivos Configurados

✅ `.github/workflows/deploy.yml` - Deploy automático
✅ `vite.config.js` - Base path para GitHub Pages
✅ `src/app/App.jsx` - BrowserRouter com basename dinâmico
✅ `404.html` - Redirecionamento para SPA routing
✅ `package.json` - Script build:github

## 📝 Testar Localmente Antes

```bash
# Build local
npm run build

# Preview
npm run preview
```

Acesse `http://localhost:4173/` para testar.

---

**Pronto!** Faça o commit e push que o deploy será automático! 🚀
