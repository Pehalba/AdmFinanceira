# 🐛 Debug - Página Branca no GitHub Pages

## Problema
A página está aparecendo toda branca no GitHub Pages.

## Possíveis Causas

### 1. Assets não estão carregando (404)
**Sintoma:** Console mostra erros 404 para arquivos JS/CSS

**Solução:**
- Verificar se o base path está correto no `vite.config.js`
- Verificar se o workflow está passando `GITHUB_REPOSITORY` corretamente
- Verificar se o build foi feito com as variáveis de ambiente corretas

### 2. Erro de JavaScript
**Sintoma:** Página branca sem erros no console (ou com erros silenciosos)

**Solução:**
- ✅ Adicionado `ErrorBoundary` para capturar erros do React
- ✅ Adicionado tratamento de erros globais no `main.jsx`
- Verificar console do navegador para ver erros específicos

### 3. Problema com o build
**Sintoma:** Build falha ou assets não são gerados corretamente

**Solução:**
1. Verificar Actions: https://github.com/Pehalba/AdmFinanceira/actions
2. Ver se o workflow executou com sucesso
3. Verificar logs do build

## Como Verificar

### 1. Verificar Console do Navegador
1. Abra: https://pehalba.github.io/AdmFinanceira/
2. Pressione F12 (DevTools)
3. Vá na aba "Console"
4. Procure por erros em vermelho

### 2. Verificar Network (Rede)
1. No DevTools, vá na aba "Network"
2. Recarregue a página (F5)
3. Verifique se os arquivos JS/CSS estão sendo carregados
4. Se aparecer 404, o base path está incorreto

### 3. Verificar Actions no GitHub
1. Acesse: https://github.com/Pehalba/AdmFinanceira/actions
2. Veja se o workflow "Deploy to GitHub Pages" executou
3. Clique no workflow para ver os logs
4. Verifique se o build foi bem-sucedido

### 4. Verificar Build Local
```bash
# Build com base path do GitHub Pages
GITHUB_PAGES=true GITHUB_REPOSITORY=Pehalba/AdmFinanceira npm run build

# Verificar index.html gerado
cat dist/index.html | head -20

# Deve mostrar paths como: /AdmFinanceira/assets/...
```

## Correções Aplicadas

1. ✅ Adicionado `ErrorBoundary` para capturar erros do React
2. ✅ Adicionado tratamento de erros globais no `main.jsx`
3. ✅ Melhorado workflow para mostrar logs do build
4. ✅ Garantido que o base path está sendo usado corretamente

## Próximos Passos

1. Aguardar o deploy completar (pode levar 2-5 minutos)
2. Limpar cache do navegador (Ctrl+Shift+R)
3. Verificar console do navegador para ver se há erros
4. Se ainda estiver branco, verificar logs do workflow no GitHub Actions

## Testar Localmente

Para testar como ficará no GitHub Pages:

```bash
# Build com base path
GITHUB_PAGES=true GITHUB_REPOSITORY=Pehalba/AdmFinanceira npm run build

# Preview local
npm run preview

# Acesse: http://localhost:4173/AdmFinanceira/
```

Se funcionar localmente mas não no GitHub Pages, o problema é com o deploy ou com o base path no servidor.
