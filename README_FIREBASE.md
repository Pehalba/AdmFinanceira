# Configuração do Firebase - Guia Completo

Este guia explica como conectar o projeto ao Firebase Firestore após fazer o commit inicial no GitHub.

## 📋 Pré-requisitos

1. ✅ Projeto versionado no GitHub
2. ✅ Conta no Firebase (https://firebase.google.com)
3. ✅ Node.js 18+ instalado

## 🔥 Passo a Passo

### 1. Criar Projeto no Firebase Console

1. Acesse https://console.firebase.google.com/
2. Clique em "Adicionar projeto"
3. Nome do projeto: `financeiro` (ou outro nome de sua preferência)
4. Ative/desative Google Analytics conforme preferir
5. Clique em "Criar projeto"

### 2. Configurar Firestore Database

1. No menu lateral, clique em **Firestore Database**
2. Clique em "Criar banco de dados"
3. Escolha modo de produção ou teste (comece em teste)
4. Escolha uma localização (ex: `southamerica-east1` para Brasil)
5. Clique em "Concluir"

### 3. Configurar Authentication

1. No menu lateral, clique em **Authentication**
2. Clique em "Começar"
3. Habilite **Email/Senha**
4. Salve

### 4. Obter Credenciais do Firebase

1. No menu lateral, clique no ícone de ⚙️ (Configurações do projeto)
2. Role até "Seus apps"
3. Clique no ícone `</>` (Web)
4. Dê um nome para o app (ex: `Financeiro Web`)
5. Copie as credenciais que aparecerem (ou clique em "Configuração")

### 5. Instalar Firebase SDK

```bash
npm install firebase
```

### 6. Criar Arquivo de Configuração

1. Copie o arquivo de exemplo:

   ```bash
   cp firebase.config.example.js firebase.config.js
   ```

2. Edite `firebase.config.js` e substitua as credenciais:

```javascript
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "SUA_API_KEY_AQUI",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto-id",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
```

⚠️ **IMPORTANTE**: O arquivo `firebase.config.js` está no `.gitignore` e **NÃO deve ser commitado**!

### 7. Configurar Regras de Segurança do Firestore

No Firebase Console > Firestore Database > Regras, cole:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper function para verificar se usuário está autenticado
    function isAuthenticated() {
      return request.auth != null;
    }

    // Helper function para verificar se o usuário é o dono do documento
    function isOwner(uid) {
      return isAuthenticated() && request.auth.uid == uid;
    }

    // Transações: apenas o dono pode ler/escrever
    // IMPORTANTE: Para queries funcionarem, a regra precisa validar o uid do documento
    match /transactions/{transactionId} {
      // Para leitura: verificar se o documento pertence ao usuário autenticado
      allow read: if isAuthenticated() && 
                     (resource == null || resource.data.uid == request.auth.uid);
      // Para escrita (update/delete): verificar se o documento pertence ao usuário
      allow update, delete: if isAuthenticated() && 
                               resource.data.uid == request.auth.uid;
      // Para criação: verificar se o uid sendo criado é do usuário autenticado
      allow create: if isAuthenticated() && 
                       request.resource.data.uid == request.auth.uid;
    }

    // Accounts: subcollection de users
    match /users/{uid}/accounts/{accountId} {
      allow read, write: if isOwner(uid);
    }

    // Categories: subcollection de users
    match /users/{uid}/categories/{categoryId} {
      allow read, write: if isOwner(uid);
    }

    // Monthly Summaries: formato do documento é {uid}_{monthKey}
    // Exemplo: QGazAdNJKLc2TFY4ippouIXcARE2_2026-02
    match /monthlySummaries/{docId} {
      // Extrair uid do início do docId (antes do primeiro underscore)
      function getUidFromDocId() {
        return docId.split('_')[0];
      }
      // Permitir leitura apenas se o uid no docId corresponde ao usuário autenticado
      allow read: if isAuthenticated() && 
                     getUidFromDocId() == request.auth.uid;
      // Permitir escrita apenas se o uid no docId corresponde ao usuário autenticado
      allow write: if isAuthenticated() && 
                      getUidFromDocId() == request.auth.uid;
    }

    // User Meta: apenas o dono pode ler/escrever
    match /users/{uid}/meta/app {
      allow read, write: if isOwner(uid);
    }

    // Monthly Expense Templates: apenas o dono
    match /users/{uid}/monthlyExpenseTemplates/{templateId} {
      allow read, write: if isOwner(uid);
    }

    // Monthly Expense Status: apenas o dono
    match /users/{uid}/monthlyExpenseStatus/{statusId} {
      allow read, write: if isOwner(uid);
    }

    // Recurring Bills: apenas o dono
    match /users/{uid}/recurringBills/{billId} {
      allow read, write: if isOwner(uid);
    }

    // Payables (deprecated): apenas o dono
    match /users/{uid}/payables/{payableId} {
      allow read, write: if isOwner(uid);
    }
  }
}
```

### 8. Implementar FirestoreRepository

Após a configuração, você precisará:

1. Editar `src/scripts/repositories/FirestoreRepository.js` e implementar os métodos
2. Editar `src/scripts/repositories/index.js` e trocar para FirestoreRepository

### 9. Testar a Conexão

```bash
npm run dev
```

Faça login/cadastro e verifique se os dados aparecem no Firebase Console.

## 🚨 Segurança

- ✅ `firebase.config.js` está no `.gitignore`
- ✅ Nunca commite credenciais do Firebase
- ✅ Use variáveis de ambiente em produção
- ✅ Configure regras de segurança adequadas
- ✅ Revise as regras antes de ir para produção

## 📚 Próximos Passos

Depois de conectar ao Firebase:

1. Migrar dados do localStorage para Firestore (script de migração)
2. Testar todas as funcionalidades
3. Configurar Cloud Functions (opcional)
4. Deploy em produção (Firebase Hosting, Vercel, Netlify)

## 🔗 Links Úteis

- [Documentação Firebase](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Auth](https://firebase.google.com/docs/auth)
