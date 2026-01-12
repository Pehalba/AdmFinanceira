# 🔄 Plano de Sincronização entre Dispositivos

## 📊 Situação Atual

- ❌ **localStorage**: Dados ficam apenas no navegador local
- ❌ **Sem sincronização**: Cada dispositivo tem seus próprios dados
- ❌ **Sem backup**: Se limpar o navegador, perde tudo

## ✅ Solução: Firebase Firestore

- ✅ **Firestore**: Dados na nuvem do Firebase
- ✅ **Sincronização automática**: Login no mesmo usuário = mesmos dados
- ✅ **Backup automático**: Dados seguros na nuvem
- ✅ **Multi-dispositivo**: Celular, computador, tablet - tudo sincronizado

## 🔧 O que Precisamos Fazer

### 1. Configurar Firebase (✅ JÁ FEITO)
- ✅ firebase.config.js criado
- ⚠️ **FALTANDO**: Criar banco Firestore no console
- ⚠️ **FALTANDO**: Configurar Authentication (Email/Senha)
- ⚠️ **FALTANDO**: Configurar regras de segurança

### 2. Implementar Repositórios Firestore
- [ ] FirestoreAuthRepository (login/cadastro)
- [ ] FirestoreTransactionRepository
- [ ] FirestoreAccountRepository
- [ ] FirestoreCategoryRepository
- [ ] FirestoreMonthlySummaryRepository
- [ ] FirestoreRecurringBillRepository
- [ ] FirestoreMonthlyExpenseTemplateRepository
- [ ] FirestoreMonthlyExpenseStatusRepository
- [ ] FirestoreUserMetaRepository

### 3. Migrar do localStorage para Firestore
- [ ] Trocar repositórios em `src/scripts/repositories/index.js`
- [ ] Testar login/cadastro
- [ ] Testar CRUD de transações, contas, categorias
- [ ] Verificar sincronização entre dispositivos

### 4. (Opcional) Migrar Dados Existentes
- Script para migrar dados do localStorage para Firestore
- Apenas para não perder dados já cadastrados

## ⚠️ IMPORTANTE

Depois de migrar para Firestore:
- **Você perderá os dados do localStorage** (mas eles continuarão salvos no navegador)
- **Novos dados irão para o Firestore** (sincronizados)
- Você pode migrar os dados existentes depois (script opcional)

## 🎯 Próximo Passo

1. Implementar os repositórios do Firestore
2. Você configurar Firestore/Auth no console do Firebase
3. Trocar de FakeRepository para FirestoreRepository
4. Testar e verificar sincronização
