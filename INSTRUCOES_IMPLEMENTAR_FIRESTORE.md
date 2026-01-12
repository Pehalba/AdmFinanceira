# 🔥 Instruções: Implementar Repositórios Firestore

## ⚠️ IMPORTANTE: Antes de Implementar

**Você PRECISA configurar no Firebase Console primeiro:**

1. ✅ Criar Firestore Database
2. ✅ Configurar Authentication (Email/Senha)
3. ✅ Configurar regras de segurança (copiar do README_FIREBASE.md linhas 84-146)

## 📝 O que Será Implementado

A implementação dos repositórios Firestore é **grande e complexa**. Ela inclui:

1. **FirestoreAuthRepository** - Login/Cadastro com Firebase Auth
2. **FirestoreTransactionRepository** - CRUD de transações
3. **FirestoreAccountRepository** - CRUD de contas (subcollection users/{uid}/accounts)
4. **FirestoreCategoryRepository** - CRUD de categorias (subcollection users/{uid}/categories)
5. **FirestoreMonthlySummaryRepository** - Resumos mensais
6. **FirestoreRecurringBillRepository** - Contas recorrentes
7. **FirestoreMonthlyExpenseTemplateRepository** - Templates de despesas mensais
8. **FirestoreMonthlyExpenseStatusRepository** - Status mensal das despesas
9. **FirestoreUserMetaRepository** - Metadados do usuário
10. **FirestorePayableRepository** - Deprecated (manter para compatibilidade)

## 🔧 Estrutura do Firestore

```
transactions/
  {transactionId}/
    uid: string
    monthKey: string (YYYY-MM)
    date: timestamp
    amount: number
    description: string
    accountId: string
    accountName: string (denormalizado)
    categoryId: string
    categoryName: string (denormalizado)
    ...

users/
  {uid}/
    accounts/
      {accountId}/ ...
    categories/
      {categoryId}/ ...
    recurringBills/
      {billId}/ ...
    monthlyExpenseTemplates/
      {templateId}/ ...
    monthlyExpenseStatus/
      {statusId}/ ...
    meta/
      app/ { accountsVersion, categoriesVersion }

monthlySummaries/
  {monthKey}/ { uid, totalIncome, totalExpense, byCategory, ... }
```

## 🚀 Próximo Passo

Depois que você configurar o Firestore/Auth no console, posso implementar todos os repositórios.

**Você quer que eu implemente agora mesmo, ou prefere configurar o Firebase Console primeiro?**

Se quiser que eu implemente agora, vou criar todos os repositórios e depois você configura o console. Mas é importante configurar as regras de segurança antes de usar em produção!
