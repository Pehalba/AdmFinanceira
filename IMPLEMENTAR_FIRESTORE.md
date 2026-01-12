# 🔥 Implementar Firestore - Guia de Passos

## ⚠️ IMPORTANTE: Configurar Firebase Console Primeiro!

Antes de implementar, você PRECISA:

1. ✅ **Criar Firestore Database** no console do Firebase
2. ✅ **Configurar Authentication** (Email/Senha)
3. ✅ **Configurar regras de segurança** (copiar do README_FIREBASE.md)

## 📋 Status da Implementação

- [ ] FirestoreAuthRepository - Login/Cadastro com Firebase Auth
- [ ] FirestoreTransactionRepository
- [ ] FirestoreAccountRepository  
- [ ] FirestoreCategoryRepository
- [ ] FirestoreMonthlySummaryRepository
- [ ] FirestoreRecurringBillRepository
- [ ] FirestoreMonthlyExpenseTemplateRepository
- [ ] FirestoreMonthlyExpenseStatusRepository
- [ ] FirestoreUserMetaRepository
- [ ] FirestorePayableRepository (deprecated)

## 🔄 Após Implementar

1. Trocar repositórios em `src/scripts/repositories/index.js`
2. Testar login/cadastro
3. Testar CRUD de transações, contas, categorias
4. Verificar sincronização entre dispositivos

## 📝 Notas

- Usar Firestore v9 (modular API)
- Não usar realtime listeners por padrão
- Sempre filtrar por uid para segurança
- Denormalizar dados quando necessário (accountName, categoryName)
