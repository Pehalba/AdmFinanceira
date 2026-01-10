/**
 * Stubs para implementação Firestore futura
 * Seguindo as regras de baixo custo especificadas
 */

import {
  ITransactionRepository,
  IAccountRepository,
  ICategoryRepository,
  IMonthlySummaryRepository,
  IRecurringBillRepository,
  IPayableRepository,
  IUserMetaRepository,
} from "./IRepository.js";

/**
 * Implementação Firestore - STUB
 * TODO: Implementar quando migrar para Firestore
 *
 * Regras:
 * - Não usar realtime listeners por padrão
 * - Transações sempre filtradas por monthKey + paginação (limit 50)
 * - Denormalizar accountName e categoryName dentro de transactions
 */

export class FirestoreTransactionRepository extends ITransactionRepository {
  async create(transaction) {
    // TODO: Implementar
    // const docRef = await db.collection('transactions').add({
    //   ...transaction,
    //   monthKey: getMonthKey(new Date(transaction.date)),
    //   accountName: account?.name || '',
    //   categoryName: category?.name || '',
    // });
    throw new Error("Firestore not implemented yet");
  }

  async update(id, updates) {
    // TODO: Implementar
    throw new Error("Firestore not implemented yet");
  }

  async delete(id) {
    // TODO: Implementar
    throw new Error("Firestore not implemented yet");
  }

  async getByMonth(monthKey, limit = 50, startAfter = null) {
    // TODO: Implementar
    // let query = db.collection('transactions')
    //   .where('monthKey', '==', monthKey)
    //   .orderBy('date', 'desc')
    //   .limit(limit);
    // if (startAfter) {
    //   query = query.startAfter(startAfter);
    // }
    // const snapshot = await query.get();
    throw new Error("Firestore not implemented yet");
  }

  async getRecent(limit = 10) {
    // TODO: Implementar
    // const snapshot = await db.collection('transactions')
    //   .orderBy('date', 'desc')
    //   .limit(limit)
    //   .get();
    throw new Error("Firestore not implemented yet");
  }
}

export class FirestoreAccountRepository extends IAccountRepository {
  async create(account) {
    // TODO: Implementar
    throw new Error("Firestore not implemented yet");
  }

  async update(id, updates) {
    // TODO: Implementar
    throw new Error("Firestore not implemented yet");
  }

  async delete(id) {
    // TODO: Implementar
    throw new Error("Firestore not implemented yet");
  }

  async getAll() {
    // TODO: Implementar
    // const snapshot = await db.collection(`users/${uid}/accounts`).get();
    throw new Error("Firestore not implemented yet");
  }

  async getById(id) {
    // TODO: Implementar
    throw new Error("Firestore not implemented yet");
  }
}

export class FirestoreCategoryRepository extends ICategoryRepository {
  async create(category) {
    // TODO: Implementar
    throw new Error("Firestore not implemented yet");
  }

  async update(id, updates) {
    // TODO: Implementar
    throw new Error("Firestore not implemented yet");
  }

  async delete(id) {
    // TODO: Implementar
    throw new Error("Firestore not implemented yet");
  }

  async getAll() {
    // TODO: Implementar
    // const snapshot = await db.collection(`users/${uid}/categories`).get();
    throw new Error("Firestore not implemented yet");
  }

  async getById(id) {
    // TODO: Implementar
    throw new Error("Firestore not implemented yet");
  }
}

export class FirestoreMonthlySummaryRepository extends IMonthlySummaryRepository {
  async getByMonth(monthKey) {
    // TODO: Implementar
    // const doc = await db.doc(`monthlySummaries/${monthKey}`).get();
    // return doc.exists ? { id: doc.id, ...doc.data() } : null;
    throw new Error("Firestore not implemented yet");
  }

  async upsert(monthKey, summary) {
    // TODO: Implementar
    // await db.doc(`monthlySummaries/${monthKey}`).set(summary, { merge: true });
    throw new Error("Firestore not implemented yet");
  }
}

export class FirestoreRecurringBillRepository extends IRecurringBillRepository {
  async create(bill) {
    // TODO: Implementar
    throw new Error("Firestore not implemented yet");
  }

  async update(id, updates) {
    // TODO: Implementar
    throw new Error("Firestore not implemented yet");
  }

  async delete(id) {
    // TODO: Implementar
    throw new Error("Firestore not implemented yet");
  }

  async getActive(limit = 10) {
    // TODO: Implementar
    // const snapshot = await db.collection('recurringBills')
    //   .where('active', '==', true)
    //   .limit(limit)
    //   .get();
    throw new Error("Firestore not implemented yet");
  }
}

export class FirestoreUserMetaRepository extends IUserMetaRepository {
  async getAppMeta(uid) {
    // TODO: Implementar
    // const doc = await db.doc(`users/${uid}/meta/app`).get();
    // return doc.exists ? doc.data() : null;
    throw new Error("Firestore not implemented yet");
  }

  async updateAppMeta(uid, appMeta) {
    // TODO: Implementar
    // await db.doc(`users/${uid}/meta/app`).set(appMeta, { merge: true });
    throw new Error("Firestore not implemented yet");
  }
}

export class FirestorePayableRepository extends IPayableRepository {
  async create(payable) {
    // TODO: Implementar
    // const docRef = await db.collection('payables').add({
    //   ...payable,
    //   monthKey: getMonthKey(new Date(payable.dueDate)),
    //   bankName: bank?.name || '',
    //   categoryName: category?.name || '',
    // });
    throw new Error("Firestore not implemented yet");
  }

  async update(id, updates) {
    // TODO: Implementar
    // await db.doc(`payables/${id}`).update(updates);
    throw new Error("Firestore not implemented yet");
  }

  async delete(id) {
    // TODO: Implementar
    // await db.doc(`payables/${id}`).delete();
    throw new Error("Firestore not implemented yet");
  }

  async getByMonth(monthKey, limit = 100) {
    // TODO: Implementar
    // const snapshot = await db.collection('payables')
    //   .where('monthKey', '==', monthKey)
    //   .orderBy('dueDate', 'asc')
    //   .limit(limit)
    //   .get();
    throw new Error("Firestore not implemented yet");
  }

  async getUpcoming(days = 15, limit = 10) {
    // TODO: Implementar
    // const today = new Date();
    // const futureDate = new Date(today);
    // futureDate.setDate(today.getDate() + days);
    // const snapshot = await db.collection('payables')
    //   .where('status', '==', 'open')
    //   .where('dueDate', '>=', today)
    //   .where('dueDate', '<=', futureDate)
    //   .orderBy('dueDate', 'asc')
    //   .limit(limit)
    //   .get();
    throw new Error("Firestore not implemented yet");
  }

  async getById(id) {
    // TODO: Implementar
    // const doc = await db.doc(`payables/${id}`).get();
    // return doc.exists ? { id: doc.id, ...doc.data() } : null;
    throw new Error("Firestore not implemented yet");
  }

  async findByRecurringBillAndMonth(recurringBillId, monthKey) {
    // TODO: Implementar
    // const snapshot = await db.collection('payables')
    //   .where('recurringBillId', '==', recurringBillId)
    //   .where('monthKey', '==', monthKey)
    //   .limit(1)
    //   .get();
    // return snapshot.empty ? null : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    throw new Error("Firestore not implemented yet");
  }
}
