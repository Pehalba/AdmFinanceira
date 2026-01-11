/**
 * Implementação Firestore
 * Usando API modular do Firestore v9
 * Seguindo as regras de baixo custo especificadas
 */

import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
} from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
} from "firebase/auth";
import { db, auth } from "../../../firebase.config.js";
import {
  ITransactionRepository,
  IAccountRepository,
  ICategoryRepository,
  IMonthlySummaryRepository,
  IRecurringBillRepository,
  IPayableRepository,
  IUserMetaRepository,
  IAuthRepository,
  IMonthlyExpenseTemplateRepository,
  IMonthlyExpenseStatusRepository,
} from "./IRepository.js";
import { getMonthKey } from "../utils/dateUtils.js";

/**
 * FirestoreAuthRepository - Autenticação com Firebase Auth
 */
export class FirestoreAuthRepository extends IAuthRepository {
  constructor() {
    super();
    this.currentUser = null;
    this.unsubscribe = null;
  }

  async signup(email, password, userData = {}) {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const firebaseUser = userCredential.user;

      const user = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        ...userData,
        createdAt: new Date().toISOString(),
      };

      this.currentUser = user;
      console.log("[FirestoreAuthRepository] signup - User created:", user.uid);
      return user;
    } catch (error) {
      console.error("[FirestoreAuthRepository] signup error:", error);
      if (error.code === "auth/email-already-in-use") {
        throw new Error("Email already in use");
      }
      throw error;
    }
  }

  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const firebaseUser = userCredential.user;

      const user = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
      };

      this.currentUser = user;
      console.log(
        "[FirestoreAuthRepository] login - User logged in:",
        user.uid
      );
      return user;
    } catch (error) {
      console.error("[FirestoreAuthRepository] login error:", error);
      if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password"
      ) {
        throw new Error("Invalid email or password");
      }
      throw error;
    }
  }

  async logout() {
    try {
      await signOut(auth);
      this.currentUser = null;
      console.log("[FirestoreAuthRepository] logout - User logged out");
      return true;
    } catch (error) {
      console.error("[FirestoreAuthRepository] logout error:", error);
      throw error;
    }
  }

  getCurrentUser() {
    const user = auth.currentUser;
    if (user) {
      const userObj = {
        uid: user.uid,
        email: user.email,
      };
      this.currentUser = userObj;
      return userObj;
    }
    this.currentUser = null;
    return null;
  }

  async onAuthStateChanged(callback) {
    this.unsubscribe = firebaseOnAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const user = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
        };
        this.currentUser = user;
        callback(user);
      } else {
        this.currentUser = null;
        callback(null);
      }
    });

    return () => {
      if (this.unsubscribe) {
        this.unsubscribe();
        this.unsubscribe = null;
      }
    };
  }
}

/**
 * FirestoreTransactionRepository
 * Transações filtradas por monthKey + paginação
 * Denormalização de accountName e categoryName
 */
export class FirestoreTransactionRepository extends ITransactionRepository {
  async create(transaction) {
    try {
      const data = {
        ...transaction,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      // Converter date para Timestamp se necessário
      if (data.date) {
        data.date =
          data.date instanceof Date
            ? Timestamp.fromDate(data.date)
            : Timestamp.fromDate(new Date(data.date));
      }

      const docRef = await addDoc(collection(db, "transactions"), data);
      const docSnap = await getDoc(docRef);
      return { id: docRef.id, ...docSnap.data() };
    } catch (error) {
      console.error("[FirestoreTransactionRepository] create error:", error);
      throw error;
    }
  }

  async update(id, updates) {
    try {
      const docRef = doc(db, "transactions", id);
      const updateData = {
        ...updates,
        updatedAt: Timestamp.now(),
      };

      // Converter date para Timestamp se necessário
      if (updateData.date) {
        updateData.date =
          updateData.date instanceof Date
            ? Timestamp.fromDate(updateData.date)
            : Timestamp.fromDate(new Date(updateData.date));
      }

      await updateDoc(docRef, updateData);
      const docSnap = await getDoc(docRef);
      return { id: docSnap.id, ...docSnap.data() };
    } catch (error) {
      console.error("[FirestoreTransactionRepository] update error:", error);
      throw error;
    }
  }

  async delete(id) {
    try {
      await deleteDoc(doc(db, "transactions", id));
      return true;
    } catch (error) {
      console.error("[FirestoreTransactionRepository] delete error:", error);
      throw error;
    }
  }

  async getByMonth(monthKey, limitCount = 50, startAfterDoc = null) {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) {
        console.warn(
          "[FirestoreTransactionRepository] getByMonth - No user authenticated"
        );
        return [];
      }

      let q = query(
        collection(db, "transactions"),
        where("uid", "==", uid),
        where("monthKey", "==", monthKey),
        orderBy("date", "desc"),
        limit(limitCount)
      );

      if (startAfterDoc) {
        q = query(q, startAfter(startAfterDoc));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate?.()?.toISOString() || doc.data().date,
      }));
    } catch (error) {
      console.error(
        "[FirestoreTransactionRepository] getByMonth error:",
        error
      );
      throw error;
    }
  }

  async getRecent(limitCount = 10) {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) {
        console.warn(
          "[FirestoreTransactionRepository] getRecent - No user authenticated"
        );
        return [];
      }

      const q = query(
        collection(db, "transactions"),
        where("uid", "==", uid),
        orderBy("date", "desc"),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate?.()?.toISOString() || doc.data().date,
      }));
    } catch (error) {
      console.error("[FirestoreTransactionRepository] getRecent error:", error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const docSnap = await getDoc(doc(db, "transactions", id));
      if (!docSnap.exists()) return null;
      return {
        id: docSnap.id,
        ...docSnap.data(),
        date:
          docSnap.data().date?.toDate?.()?.toISOString() || docSnap.data().date,
      };
    } catch (error) {
      console.error("[FirestoreTransactionRepository] getById error:", error);
      throw error;
    }
  }
}

/**
 * FirestoreAccountRepository
 * Subcollection: users/{uid}/accounts
 */
export class FirestoreAccountRepository extends IAccountRepository {
  async create(account) {
    try {
      if (!account.uid) throw new Error("uid is required");

      const data = {
        ...account,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(
        collection(db, "users", account.uid, "accounts"),
        data
      );
      const docSnap = await getDoc(docRef);
      return { id: docRef.id, ...docSnap.data() };
    } catch (error) {
      console.error("[FirestoreAccountRepository] create error:", error);
      throw error;
    }
  }

  async update(id, updates) {
    try {
      // Precisamos do uid para atualizar
      if (!updates.uid) throw new Error("uid is required for update");

      const docRef = doc(db, "users", updates.uid, "accounts", id);
      const updateData = {
        ...updates,
        updatedAt: Timestamp.now(),
      };
      delete updateData.uid; // Não atualizar uid

      await updateDoc(docRef, updateData);
      const docSnap = await getDoc(docRef);
      return { id: docSnap.id, ...docSnap.data() };
    } catch (error) {
      console.error("[FirestoreAccountRepository] update error:", error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) {
        throw new Error("No user authenticated");
      }

      await deleteDoc(doc(db, "users", uid, "accounts", id));
      return true;
    } catch (error) {
      console.error("[FirestoreAccountRepository] delete error:", error);
      throw error;
    }
  }

  async getAll() {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) {
        console.warn(
          "[FirestoreAccountRepository] getAll - No user authenticated"
        );
        return [];
      }

      const snapshot = await getDocs(collection(db, "users", uid, "accounts"));
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("[FirestoreAccountRepository] getAll error:", error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) {
        console.warn(
          "[FirestoreAccountRepository] getById - No user authenticated"
        );
        return null;
      }

      const docSnap = await getDoc(doc(db, "users", uid, "accounts", id));
      if (!docSnap.exists()) return null;
      return { id: docSnap.id, ...docSnap.data() };
    } catch (error) {
      console.error("[FirestoreAccountRepository] getById error:", error);
      throw error;
    }
  }
}

/**
 * FirestoreCategoryRepository
 * Subcollection: users/{uid}/categories
 */
export class FirestoreCategoryRepository extends ICategoryRepository {
  async create(category) {
    try {
      if (!category.uid) throw new Error("uid is required");

      const data = {
        ...category,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(
        collection(db, "users", category.uid, "categories"),
        data
      );
      const docSnap = await getDoc(docRef);
      return { id: docRef.id, ...docSnap.data() };
    } catch (error) {
      console.error("[FirestoreCategoryRepository] create error:", error);
      throw error;
    }
  }

  async update(id, updates) {
    try {
      if (!updates.uid) throw new Error("uid is required for update");

      const docRef = doc(db, "users", updates.uid, "categories", id);
      const updateData = {
        ...updates,
        updatedAt: Timestamp.now(),
      };
      delete updateData.uid;

      await updateDoc(docRef, updateData);
      const docSnap = await getDoc(docRef);
      return { id: docSnap.id, ...docSnap.data() };
    } catch (error) {
      console.error("[FirestoreCategoryRepository] update error:", error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) {
        throw new Error("No user authenticated");
      }

      await deleteDoc(doc(db, "users", uid, "categories", id));
      return true;
    } catch (error) {
      console.error("[FirestoreCategoryRepository] delete error:", error);
      throw error;
    }
  }

  async getAll() {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) {
        console.warn(
          "[FirestoreCategoryRepository] getAll - No user authenticated"
        );
        return [];
      }

      const snapshot = await getDocs(
        collection(db, "users", uid, "categories")
      );
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("[FirestoreCategoryRepository] getAll error:", error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) {
        console.warn(
          "[FirestoreCategoryRepository] getById - No user authenticated"
        );
        return null;
      }

      const docSnap = await getDoc(doc(db, "users", uid, "categories", id));
      if (!docSnap.exists()) return null;
      return { id: docSnap.id, ...docSnap.data() };
    } catch (error) {
      console.error("[FirestoreCategoryRepository] getById error:", error);
      throw error;
    }
  }
}

/**
 * FirestoreMonthlySummaryRepository
 * Collection: monthlySummaries/{monthKey}
 */
export class FirestoreMonthlySummaryRepository extends IMonthlySummaryRepository {
  async getByMonth(monthKey) {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) {
        console.warn(
          "[FirestoreMonthlySummaryRepository] getByMonth - No user authenticated"
        );
        return null;
      }

      // monthlySummaries/{uid}_{monthKey}
      const docSnap = await getDoc(
        doc(db, "monthlySummaries", `${uid}_${monthKey}`)
      );
      if (!docSnap.exists()) return null;
      return { id: docSnap.id, ...docSnap.data() };
    } catch (error) {
      console.error(
        "[FirestoreMonthlySummaryRepository] getByMonth error:",
        error
      );
      throw error;
    }
  }

  async upsert(monthKey, summary) {
    try {
      const uid = auth.currentUser?.uid || summary.uid;
      if (!uid) {
        throw new Error(
          "uid is required - user must be authenticated or summary must have uid"
        );
      }

      const docId = `${uid}_${monthKey}`;
      const docRef = doc(db, "monthlySummaries", docId);

      const data = {
        ...summary,
        uid,
        monthKey,
        updatedAt: Timestamp.now(),
      };

      await setDoc(docRef, data, { merge: true });
      const docSnap = await getDoc(docRef);
      return { id: docSnap.id, ...docSnap.data() };
    } catch (error) {
      console.error("[FirestoreMonthlySummaryRepository] upsert error:", error);
      throw error;
    }
  }
}

/**
 * FirestoreRecurringBillRepository
 * Subcollection: users/{uid}/recurringBills
 */
export class FirestoreRecurringBillRepository extends IRecurringBillRepository {
  async create(bill) {
    try {
      if (!bill.uid) throw new Error("uid is required");

      const data = {
        ...bill,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(
        collection(db, "users", bill.uid, "recurringBills"),
        data
      );
      const docSnap = await getDoc(docRef);
      return { id: docRef.id, ...docSnap.data() };
    } catch (error) {
      console.error("[FirestoreRecurringBillRepository] create error:", error);
      throw error;
    }
  }

  async update(id, updates) {
    try {
      if (!updates.uid) throw new Error("uid is required for update");

      const docRef = doc(db, "users", updates.uid, "recurringBills", id);
      const updateData = {
        ...updates,
        updatedAt: Timestamp.now(),
      };
      delete updateData.uid;

      await updateDoc(docRef, updateData);
      const docSnap = await getDoc(docRef);
      return { id: docSnap.id, ...docSnap.data() };
    } catch (error) {
      console.error("[FirestoreRecurringBillRepository] update error:", error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) {
        throw new Error("No user authenticated");
      }

      await deleteDoc(doc(db, "users", uid, "recurringBills", id));
      return true;
    } catch (error) {
      console.error("[FirestoreRecurringBillRepository] delete error:", error);
      throw error;
    }
  }

  async getActive(limitCount = 10) {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) {
        console.warn(
          "[FirestoreRecurringBillRepository] getActive - No user authenticated"
        );
        return [];
      }

      const q = query(
        collection(db, "users", uid, "recurringBills"),
        where("active", "==", true),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error(
        "[FirestoreRecurringBillRepository] getActive error:",
        error
      );
      throw error;
    }
  }
}

/**
 * FirestoreMonthlyExpenseTemplateRepository
 * Subcollection: users/{uid}/monthlyExpenseTemplates
 */
export class FirestoreMonthlyExpenseTemplateRepository extends IMonthlyExpenseTemplateRepository {
  async create(template) {
    try {
      if (!template.uid) throw new Error("uid is required");

      const data = {
        ...template,
        active: template.active !== false,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(
        collection(db, "users", template.uid, "monthlyExpenseTemplates"),
        data
      );
      const docSnap = await getDoc(docRef);
      return { id: docRef.id, ...docSnap.data() };
    } catch (error) {
      console.error(
        "[FirestoreMonthlyExpenseTemplateRepository] create error:",
        error
      );
      throw error;
    }
  }

  async update(id, updates) {
    try {
      if (!updates.uid) throw new Error("uid is required for update");

      const docRef = doc(
        db,
        "users",
        updates.uid,
        "monthlyExpenseTemplates",
        id
      );
      const updateData = {
        ...updates,
        updatedAt: Timestamp.now(),
      };
      delete updateData.uid;

      await updateDoc(docRef, updateData);
      const docSnap = await getDoc(docRef);
      return { id: docSnap.id, ...docSnap.data() };
    } catch (error) {
      console.error(
        "[FirestoreMonthlyExpenseTemplateRepository] update error:",
        error
      );
      throw error;
    }
  }

  async delete(id) {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) {
        throw new Error("No user authenticated");
      }

      await deleteDoc(doc(db, "users", uid, "monthlyExpenseTemplates", id));
      return true;
    } catch (error) {
      console.error(
        "[FirestoreMonthlyExpenseTemplateRepository] delete error:",
        error
      );
      throw error;
    }
  }

  async getAll(uid, limitCount = 100) {
    try {
      // Se uid não fornecido, obter do auth
      const finalUid = uid || auth.currentUser?.uid;
      if (!finalUid) {
        console.warn(
          "[FirestoreMonthlyExpenseTemplateRepository] getAll - No user authenticated"
        );
        return [];
      }

      const q = query(
        collection(db, "users", finalUid, "monthlyExpenseTemplates"),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error(
        "[FirestoreMonthlyExpenseTemplateRepository] getAll error:",
        error
      );
      throw error;
    }
  }

  async getActive(uid, limitCount = 100) {
    try {
      // Se uid não fornecido, obter do auth
      const finalUid = uid || auth.currentUser?.uid;
      if (!finalUid) {
        console.warn(
          "[FirestoreMonthlyExpenseTemplateRepository] getActive - No user authenticated"
        );
        return [];
      }

      const q = query(
        collection(db, "users", finalUid, "monthlyExpenseTemplates"),
        where("active", "==", true),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error(
        "[FirestoreMonthlyExpenseTemplateRepository] getActive error:",
        error
      );
      throw error;
    }
  }

  async getById(id) {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) {
        console.warn(
          "[FirestoreMonthlyExpenseTemplateRepository] getById - No user authenticated"
        );
        return null;
      }

      const docSnap = await getDoc(
        doc(db, "users", uid, "monthlyExpenseTemplates", id)
      );
      if (!docSnap.exists()) return null;
      return { id: docSnap.id, ...docSnap.data() };
    } catch (error) {
      console.error(
        "[FirestoreMonthlyExpenseTemplateRepository] getById error:",
        error
      );
      throw error;
    }
  }
}

/**
 * FirestoreMonthlyExpenseStatusRepository
 * Subcollection: users/{uid}/monthlyExpenseStatus
 */
export class FirestoreMonthlyExpenseStatusRepository extends IMonthlyExpenseStatusRepository {
  async create(status) {
    try {
      if (!status.uid) throw new Error("uid is required");

      const data = {
        ...status,
        status: status.status || "open",
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(
        collection(db, "users", status.uid, "monthlyExpenseStatus"),
        data
      );
      const docSnap = await getDoc(docRef);
      return { id: docRef.id, ...docSnap.data() };
    } catch (error) {
      console.error(
        "[FirestoreMonthlyExpenseStatusRepository] create error:",
        error
      );
      throw error;
    }
  }

  async update(id, updates) {
    try {
      if (!updates.uid) throw new Error("uid is required for update");

      // Se mudou status para paid, adicionar paidAtISO
      if (updates.status === "paid") {
        updates.paidAtISO = new Date().toISOString();
      }
      // Se mudou de paid para open, remover paidAtISO
      if (updates.status === "open") {
        updates.paidAtISO = null;
        updates.linkedTransactionId = null;
      }

      const docRef = doc(db, "users", updates.uid, "monthlyExpenseStatus", id);
      const updateData = {
        ...updates,
        updatedAt: Timestamp.now(),
      };
      delete updateData.uid;

      await updateDoc(docRef, updateData);
      const docSnap = await getDoc(docRef);
      return { id: docSnap.id, ...docSnap.data() };
    } catch (error) {
      console.error(
        "[FirestoreMonthlyExpenseStatusRepository] update error:",
        error
      );
      throw error;
    }
  }

  async delete(id) {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) {
        throw new Error("No user authenticated");
      }

      await deleteDoc(doc(db, "users", uid, "monthlyExpenseStatus", id));
      return true;
    } catch (error) {
      console.error(
        "[FirestoreMonthlyExpenseStatusRepository] delete error:",
        error
      );
      throw error;
    }
  }

  async getByMonth(monthKey, limitCount = 100) {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) {
        console.warn(
          "[FirestoreMonthlyExpenseStatusRepository] getByMonth - No user authenticated"
        );
        return [];
      }

      const q = query(
        collection(db, "users", uid, "monthlyExpenseStatus"),
        where("monthKey", "==", monthKey),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error(
        "[FirestoreMonthlyExpenseStatusRepository] getByMonth error:",
        error
      );
      throw error;
    }
  }

  async getByTemplateAndMonth(templateId, monthKey) {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) {
        console.warn(
          "[FirestoreMonthlyExpenseStatusRepository] getByTemplateAndMonth - No user authenticated"
        );
        return null;
      }

      const q = query(
        collection(db, "users", uid, "monthlyExpenseStatus"),
        where("templateId", "==", templateId),
        where("monthKey", "==", monthKey),
        limit(1)
      );

      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;
      return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    } catch (error) {
      console.error(
        "[FirestoreMonthlyExpenseStatusRepository] getByTemplateAndMonth error:",
        error
      );
      throw error;
    }
  }

  async getUpcoming(days = 15, limitCount = 10) {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) {
        console.warn(
          "[FirestoreMonthlyExpenseStatusRepository] getUpcoming - No user authenticated"
        );
        return [];
      }

      // Implementação simplificada - buscar status abertos do mês atual e próximo
      const today = new Date();
      const currentMonthKey = getMonthKey(today);
      const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
      const nextMonthKey = getMonthKey(nextMonth);

      const q = query(
        collection(db, "users", uid, "monthlyExpenseStatus"),
        where("status", "==", "open"),
        where("monthKey", "in", [currentMonthKey, nextMonthKey]),
        limit(limitCount * 2) // Buscar mais para filtrar depois
      );

      const snapshot = await getDocs(q);
      // Filtrar e ordenar no cliente (simplificado)
      // Em produção, seria melhor fazer isso no servidor
      const statuses = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return statuses.slice(0, limitCount);
    } catch (error) {
      console.error(
        "[FirestoreMonthlyExpenseStatusRepository] getUpcoming error:",
        error
      );
      throw error;
    }
  }

  async getById(id) {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) {
        console.warn(
          "[FirestoreMonthlyExpenseStatusRepository] getById - No user authenticated"
        );
        return null;
      }

      const docSnap = await getDoc(
        doc(db, "users", uid, "monthlyExpenseStatus", id)
      );
      if (!docSnap.exists()) return null;
      return { id: docSnap.id, ...docSnap.data() };
    } catch (error) {
      console.error(
        "[FirestoreMonthlyExpenseStatusRepository] getById error:",
        error
      );
      throw error;
    }
  }

  async ensureStatusForMonth(templateId, monthKey) {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) {
        throw new Error("No user authenticated");
      }

      // Tentar buscar status existente
      const existing = await this.getByTemplateAndMonth(templateId, monthKey);
      if (existing) {
        return existing;
      }

      // Criar novo status
      return await this.create({
        uid,
        templateId,
        monthKey,
        status: "open",
      });
    } catch (error) {
      console.error(
        "[FirestoreMonthlyExpenseStatusRepository] ensureStatusForMonth error:",
        error
      );
      throw error;
    }
  }
}

/**
 * FirestoreUserMetaRepository
 * Document: users/{uid}/meta/app
 */
export class FirestoreUserMetaRepository extends IUserMetaRepository {
  async getAppMeta(uid) {
    try {
      if (!uid) return null;

      const docSnap = await getDoc(doc(db, "users", uid, "meta", "app"));
      if (!docSnap.exists()) return null;
      return docSnap.data();
    } catch (error) {
      console.error("[FirestoreUserMetaRepository] getAppMeta error:", error);
      throw error;
    }
  }

  async updateAppMeta(uid, appMeta) {
    try {
      if (!uid) throw new Error("uid is required");

      const docRef = doc(db, "users", uid, "meta", "app");
      await setDoc(docRef, appMeta, { merge: true });
      const docSnap = await getDoc(docRef);
      return docSnap.data();
    } catch (error) {
      console.error(
        "[FirestoreUserMetaRepository] updateAppMeta error:",
        error
      );
      throw error;
    }
  }
}

/**
 * FirestorePayableRepository - DEPRECATED
 * Mantido para compatibilidade
 */
export class FirestorePayableRepository extends IPayableRepository {
  async create(payable) {
    throw new Error(
      "PayableRepository is deprecated - Use MonthlyExpenseTemplateRepository and MonthlyExpenseStatusRepository"
    );
  }

  async update(id, updates) {
    throw new Error(
      "PayableRepository is deprecated - Use MonthlyExpenseTemplateRepository and MonthlyExpenseStatusRepository"
    );
  }

  async delete(id) {
    throw new Error(
      "PayableRepository is deprecated - Use MonthlyExpenseTemplateRepository and MonthlyExpenseStatusRepository"
    );
  }

  async getByMonth(monthKey, limit = 100) {
    throw new Error(
      "PayableRepository is deprecated - Use MonthlyExpenseTemplateRepository and MonthlyExpenseStatusRepository"
    );
  }

  async getUpcoming(days = 15, limit = 10) {
    throw new Error(
      "PayableRepository is deprecated - Use MonthlyExpenseTemplateRepository and MonthlyExpenseStatusRepository"
    );
  }

  async getById(id) {
    throw new Error(
      "PayableRepository is deprecated - Use MonthlyExpenseTemplateRepository and MonthlyExpenseStatusRepository"
    );
  }

  async findByRecurringBillAndMonth(recurringBillId, monthKey) {
    throw new Error(
      "PayableRepository is deprecated - Use MonthlyExpenseTemplateRepository and MonthlyExpenseStatusRepository"
    );
  }
}
