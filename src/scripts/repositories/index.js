/**
 * Exporta repositórios - permite trocar facilmente entre Fake, HTTP e Firestore
 * 
 * Para mudar o tipo de repositório, altere o import abaixo:
 * - FakeRepository: localStorage (MVP)
 * - HTTPRepository: Servidor Express local
 * - FirestoreRepository: Firebase Firestore (futuro)
 */

// Opção 1: Fake (localStorage) - MVP
import {
  FakeTransactionRepository,
  FakeAccountRepository,
  FakeCategoryRepository,
  FakeMonthlySummaryRepository,
  FakeRecurringBillRepository,
  FakePayableRepository,
  FakeMonthlyExpenseTemplateRepository,
  FakeMonthlyExpenseStatusRepository,
  FakeUserMetaRepository,
  FakeAuthRepository,
} from './FakeRepository.js';

// Opção 2: HTTP (Servidor Express local) - Para testes locais
// import {
//   HTTPTransactionRepository,
//   HTTPAccountRepository,
//   HTTPCategoryRepository,
//   HTTPMonthlySummaryRepository,
//   HTTPRecurringBillRepository,
//   HTTPUserMetaRepository,
//   HTTPAuthRepository,
// } from './HTTPRepository.js';

// Opção 3: Firestore (stub) - Futuro
// import { ... } from './FirestoreRepository.js';

// ============================================
// CONFIGURAÇÃO: Escolha qual usar aqui
// ============================================

// Usando Fake (localStorage)
export const transactionRepository = new FakeTransactionRepository();
export const accountRepository = new FakeAccountRepository();
export const categoryRepository = new FakeCategoryRepository();
export const monthlySummaryRepository = new FakeMonthlySummaryRepository();
export const recurringBillRepository = new FakeRecurringBillRepository();
export const payableRepository = new FakePayableRepository(); // Deprecated - usar template + status
export const monthlyExpenseTemplateRepository = new FakeMonthlyExpenseTemplateRepository();
export const monthlyExpenseStatusRepository = new FakeMonthlyExpenseStatusRepository();
export const userMetaRepository = new FakeUserMetaRepository();
export const authRepository = new FakeAuthRepository();

// Para usar HTTP (servidor local), descomente:
// export const transactionRepository = new HTTPTransactionRepository();
// export const accountRepository = new HTTPAccountRepository();
// export const categoryRepository = new HTTPCategoryRepository();
// export const monthlySummaryRepository = new HTTPMonthlySummaryRepository();
// export const recurringBillRepository = new HTTPRecurringBillRepository();
// export const userMetaRepository = new HTTPUserMetaRepository();
// export const authRepository = new HTTPAuthRepository();
