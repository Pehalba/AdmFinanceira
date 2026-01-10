# 🚀 Guia Rápido - Como Iniciar o Projeto

## ❌ NÃO FAÇA ISSO:
- ❌ Não abra o arquivo `index.html` diretamente no navegador
- ❌ Não use Live Server do VS Code na porta 5500
- ❌ Não use qualquer servidor HTTP simples

## ✅ FAÇA ISSO:

### 1. Abra o terminal na raiz do projeto

```bash
cd "C:\Users\PC Pedro Alba\Desktop\Programação\Financeiro"
```

### 2. Inicie o servidor Vite:

```bash
npm run dev
```

### 3. Você verá algo como:

```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

### 4. Acesse a aplicação:

Abra seu navegador em: **http://localhost:5173/**

## 🔍 Por que isso é necessário?

- **Vite** precisa compilar os arquivos `.jsx` para JavaScript
- O servidor Vite processa módulos ES6
- Hot Module Replacement (HMR) permite atualizações em tempo real
- O proxy da API (`/api`) só funciona com o Vite dev server

## 📝 Modos de Uso

### Modo 1: Apenas Frontend (localStorage)
```bash
npm run dev
```
Acesse: http://localhost:5173/

### Modo 2: Frontend + Servidor Local
**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```
Acesse: http://localhost:5173/

**IMPORTANTE:** Lembre-se de configurar para usar HTTPRepository em `src/scripts/repositories/index.js`

## ⚠️ Problemas Comuns

### Tela branca com erros no console?
- ✅ Use `npm run dev` (Vite dev server)
- ❌ Não abra index.html diretamente

### Erro de MIME type "text/jsx"?
- ✅ Use `npm run dev`
- ❌ Não use Live Server ou servidor HTTP simples

### Não encontra módulos?
- ✅ Certifique-se de estar na raiz do projeto
- ✅ Execute `npm install` primeiro
- ✅ Use `npm run dev`
