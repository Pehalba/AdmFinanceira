# ⚙️ Configurar GitHub Pages - Próximos Passos

## ✅ O que já está feito:

- [x] Repositório criado no GitHub: https://github.com/Pehalba/AdmFinanceira
- [x] Código enviado para o GitHub (push feito)
- [x] Workflow de deploy configurado
- [x] Vite configurado para GitHub Pages

## 📋 O que fazer agora:

### 1. Habilitar GitHub Pages (IMPORTANTE)

1. Acesse: https://github.com/Pehalba/AdmFinanceira/settings/pages
2. Em **Source**, selecione:
   - **Deploy from a branch**
   - **Branch**: `gh-pages` (será criado automaticamente pelo workflow)
   - **Folder**: `/ (root)`
3. Clique em **Save**

### 2. Configurar Permissões do GitHub Actions

1. Acesse: https://github.com/Pehalba/AdmFinanceira/settings/actions
2. Role até **Workflow permissions**
3. Selecione:
   - ✅ **Read and write permissions**
   - ✅ **Allow GitHub Actions to create and approve pull requests**
4. Clique em **Save**

### 3. Verificar Deploy Automático

Após habilitar GitHub Pages e configurar permissões:

1. Vá em **Actions**: https://github.com/Pehalba/AdmFinanceira/actions
2. O workflow **Deploy to GitHub Pages** deve executar automaticamente
3. Aguarde até aparecer ✅ verde
4. Clique no workflow para ver a URL do site

### 4. Acessar o Site Publicado

Após o deploy bem-sucedido, seu site estará em:

```
https://pehalba.github.io/AdmFinanceira/
```

⚠️ **Pode levar alguns minutos para ficar disponível após o primeiro deploy!**

## 🔄 Atualizar o Site

Para atualizar o site após fazer mudanças:

```bash
git add .
git commit -m "descrição das mudanças"
git push origin main
```

O deploy será automático!

## ⚠️ Se o Workflow Não Executar

1. Verifique se habilitou GitHub Pages (passo 1)
2. Verifique se configurou permissões (passo 2)
3. Vá em **Actions** e clique em **Run workflow** manualmente
4. Verifique os logs se houver erro

## 📝 Notas Importantes

- O site funcionará em **modo Fake (localStorage)** - dados salvos localmente no navegador
- Cada usuário terá seus próprios dados
- Para usar Firebase, será necessário configurar depois

---

**Próximo passo: Habilitar GitHub Pages nas configurações do repositório!** 🚀
