import {
  ITransactionRepository,
  IAccountRepository,
  ICategoryRepository,
  IMonthlySummaryRepository,
  IRecurringBillRepository,
  IUserMetaRepository,
  IAuthRepository,
  IPayableRepository,
  IMonthlyExpenseTemplateRepository,
  IMonthlyExpenseStatusRepository,
} from './IRepository.js';
import { getMonthKey } from '../utils/dateUtils.js';

/**
 * Implementação Fake usando localStorage para MVP
 */

const STORAGE_KEYS = {
  TRANSACTIONS: 'financeiro_transactions',
  ACCOUNTS: 'financeiro_accounts',
  CATEGORIES: 'financeiro_categories',
  MONTHLY_SUMMARIES: 'financeiro_monthly_summaries',
  RECURRING_BILLS: 'financeiro_recurring_bills',
  PAYABLES: 'financeiro_payables', // Deprecated - manter para migração
  MONTHLY_EXPENSE_TEMPLATES: 'financeiro_monthly_expense_templates',
  MONTHLY_EXPENSE_STATUS: 'financeiro_monthly_expense_status',
  USER_META: 'financeiro_user_meta',
  CURRENT_USER: 'financeiro_current_user',
};

function loadFromStorage(key, defaultValue = []) {
  try {
    const data = localStorage.getItem(key);
    if (data === null || data === undefined) {
      return defaultValue;
    }
    return JSON.parse(data);
  } catch (error) {
    console.error(`[loadFromStorage] Error loading key ${key}:`, error);
    return defaultValue;
  }
}

function saveToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export class FakeTransactionRepository extends ITransactionRepository {
  async create(transaction) {
    const transactions = loadFromStorage(STORAGE_KEYS.TRANSACTIONS);
    const newTransaction = {
      id: generateId(),
      ...transaction,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    transactions.push(newTransaction);
    saveToStorage(STORAGE_KEYS.TRANSACTIONS, transactions);
    return newTransaction;
  }

  async update(id, updates) {
    const transactions = loadFromStorage(STORAGE_KEYS.TRANSACTIONS);
    const index = transactions.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Transaction not found');
    transactions[index] = {
      ...transactions[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    saveToStorage(STORAGE_KEYS.TRANSACTIONS, transactions);
    return transactions[index];
  }

  async delete(id) {
    const transactions = loadFromStorage(STORAGE_KEYS.TRANSACTIONS);
    const filtered = transactions.filter(t => t.id !== id);
    saveToStorage(STORAGE_KEYS.TRANSACTIONS, filtered);
    return true;
  }

  async getByMonth(monthKey, limit = 50, startAfter = null) {
    const transactions = loadFromStorage(STORAGE_KEYS.TRANSACTIONS);
    let filtered = transactions.filter(t => t.monthKey === monthKey);
    
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (startAfter) {
      const startIndex = filtered.findIndex(t => t.id === startAfter);
      filtered = filtered.slice(startIndex + 1);
    }
    
    return filtered.slice(0, limit);
  }

  async getRecent(limit = 10) {
    const transactions = loadFromStorage(STORAGE_KEYS.TRANSACTIONS);
    return transactions
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, limit);
  }

  async getById(id) {
    const transactions = loadFromStorage(STORAGE_KEYS.TRANSACTIONS);
    return transactions.find(t => t.id === id) || null;
  }
}

export class FakeAccountRepository extends IAccountRepository {
  async create(account) {
    const accounts = loadFromStorage(STORAGE_KEYS.ACCOUNTS);
    const newAccount = {
      id: generateId(),
      ...account,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    accounts.push(newAccount);
    saveToStorage(STORAGE_KEYS.ACCOUNTS, accounts);
    return newAccount;
  }

  async update(id, updates) {
    const accounts = loadFromStorage(STORAGE_KEYS.ACCOUNTS);
    const index = accounts.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Account not found');
    accounts[index] = {
      ...accounts[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    saveToStorage(STORAGE_KEYS.ACCOUNTS, accounts);
    return accounts[index];
  }

  async delete(id) {
    const accounts = loadFromStorage(STORAGE_KEYS.ACCOUNTS);
    const filtered = accounts.filter(a => a.id !== id);
    saveToStorage(STORAGE_KEYS.ACCOUNTS, filtered);
    return true;
  }

  async getAll() {
    return loadFromStorage(STORAGE_KEYS.ACCOUNTS);
  }

  async getById(id) {
    const accounts = loadFromStorage(STORAGE_KEYS.ACCOUNTS);
    return accounts.find(a => a.id === id) || null;
  }
}

export class FakeCategoryRepository extends ICategoryRepository {
  async create(category) {
    const categories = loadFromStorage(STORAGE_KEYS.CATEGORIES);
    const newCategory = {
      id: generateId(),
      ...category,
      uid: category.uid || null, // Garantir que uid está presente
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    console.log('[FakeCategoryRepository] Creating category:', { id: newCategory.id, name: newCategory.name, type: newCategory.type, uid: newCategory.uid });
    categories.push(newCategory);
    saveToStorage(STORAGE_KEYS.CATEGORIES, categories);
    console.log('[FakeCategoryRepository] Total categories in storage:', categories.length);
    return newCategory;
  }

  async update(id, updates) {
    const categories = loadFromStorage(STORAGE_KEYS.CATEGORIES);
    const index = categories.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Category not found');
    categories[index] = {
      ...categories[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    saveToStorage(STORAGE_KEYS.CATEGORIES, categories);
    return categories[index];
  }

  async delete(id) {
    const categories = loadFromStorage(STORAGE_KEYS.CATEGORIES);
    const filtered = categories.filter(c => c.id !== id);
    saveToStorage(STORAGE_KEYS.CATEGORIES, filtered);
    return true;
  }

  async getAll() {
    return loadFromStorage(STORAGE_KEYS.CATEGORIES);
  }

  async getById(id) {
    const categories = loadFromStorage(STORAGE_KEYS.CATEGORIES);
    return categories.find(c => c.id === id) || null;
  }
}

export class FakeMonthlySummaryRepository extends IMonthlySummaryRepository {
  async getByMonth(monthKey) {
    const summaries = loadFromStorage(STORAGE_KEYS.MONTHLY_SUMMARIES);
    return summaries.find(s => s.monthKey === monthKey) || null;
  }

  async upsert(monthKey, summary) {
    const summaries = loadFromStorage(STORAGE_KEYS.MONTHLY_SUMMARIES);
    const index = summaries.findIndex(s => s.monthKey === monthKey);
    const data = {
      monthKey,
      ...summary,
      updatedAt: new Date().toISOString(),
    };
    if (index === -1) {
      summaries.push(data);
    } else {
      summaries[index] = data;
    }
    saveToStorage(STORAGE_KEYS.MONTHLY_SUMMARIES, summaries);
    return data;
  }
}

export class FakeRecurringBillRepository extends IRecurringBillRepository {
  async create(bill) {
    const bills = loadFromStorage(STORAGE_KEYS.RECURRING_BILLS);
    const newBill = {
      id: generateId(),
      ...bill,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    bills.push(newBill);
    saveToStorage(STORAGE_KEYS.RECURRING_BILLS, bills);
    return newBill;
  }

  async update(id, updates) {
    const bills = loadFromStorage(STORAGE_KEYS.RECURRING_BILLS);
    const index = bills.findIndex(b => b.id === id);
    if (index === -1) throw new Error('Recurring bill not found');
    bills[index] = {
      ...bills[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    saveToStorage(STORAGE_KEYS.RECURRING_BILLS, bills);
    return bills[index];
  }

  async delete(id) {
    const bills = loadFromStorage(STORAGE_KEYS.RECURRING_BILLS);
    const filtered = bills.filter(b => b.id !== id);
    saveToStorage(STORAGE_KEYS.RECURRING_BILLS, filtered);
    return true;
  }

  async getActive(limit = 10) {
    const bills = loadFromStorage(STORAGE_KEYS.RECURRING_BILLS);
    return bills
      .filter(b => b.active !== false)
      .slice(0, limit);
  }
}

export class FakeUserMetaRepository extends IUserMetaRepository {
  async getAppMeta(uid) {
    const meta = loadFromStorage(STORAGE_KEYS.USER_META, {});
    return meta[uid]?.app || null;
  }

  async updateAppMeta(uid, appMeta) {
    const meta = loadFromStorage(STORAGE_KEYS.USER_META, {});
    if (!meta[uid]) meta[uid] = {};
    meta[uid].app = {
      ...meta[uid].app,
      ...appMeta,
    };
    saveToStorage(STORAGE_KEYS.USER_META, meta);
    return meta[uid].app;
  }
}

export class FakeAuthRepository extends IAuthRepository {
  async signup(email, password, userData = {}) {
    const users = loadFromStorage('financeiro_users', []);
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      throw new Error('Email already in use');
    }
    
    const uid = generateId();
    const newUser = {
      uid,
      email,
      ...userData,
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    saveToStorage('financeiro_users', users);
    // Salvar na chave padrão
    saveToStorage(STORAGE_KEYS.CURRENT_USER, newUser);
    console.log('[FakeAuthRepository] signup - User created and saved to', STORAGE_KEYS.CURRENT_USER + ':', newUser.uid, newUser.email);
    return newUser;
  }

  async login(email, password) {
    const users = loadFromStorage('financeiro_users', []);
    const user = users.find(u => u.email === email);
    if (!user) {
      throw new Error('Invalid email or password');
    }
    
    // Validar que o usuário tem uid antes de salvar
    if (!user.uid) {
      console.error('[FakeAuthRepository] login - User has no uid!', user);
      throw new Error('Invalid user data');
    }
    
    // Salvar na chave padrão
    saveToStorage(STORAGE_KEYS.CURRENT_USER, user);
    console.log('[FakeAuthRepository] login - User saved to', STORAGE_KEYS.CURRENT_USER + ':', user.uid, user.email);
    return user;
  }

  async logout() {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    console.log('[FakeAuthRepository] logout - Removed user from storage');
    return true;
  }

  getCurrentUser() {
    console.log('[FakeAuthRepository] getCurrentUser - Checking localStorage key:', STORAGE_KEYS.CURRENT_USER);
    
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      
      if (!stored || stored === 'null' || stored === 'undefined' || stored === '') {
        console.log('[FakeAuthRepository] getCurrentUser - No data in storage');
        return null;
      }
      
      const user = JSON.parse(stored);
      console.log('[FakeAuthRepository] getCurrentUser - Parsed user:', user);
      
      // Validar que é um objeto válido com uid
      if (user && typeof user === 'object' && user.uid && typeof user.uid === 'string' && user.uid.trim() !== '') {
        console.log('[FakeAuthRepository] getCurrentUser - Valid user found:', user.uid, 'email:', user.email);
        return user;
      } else {
        console.warn('[FakeAuthRepository] getCurrentUser - Invalid user object:', user, 'clearing storage');
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        return null;
      }
    } catch (error) {
      console.error('[FakeAuthRepository] getCurrentUser - Error reading from storage:', error);
      // Limpar chave corrompida
      try {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      } catch (e) {
        // Ignorar erro ao limpar
      }
      return null;
    }
  }

  async onAuthStateChanged(callback) {
    // Para Fake, não há listeners reais, apenas simulação
    // Buscar usuário atual e chamar callback imediatamente
    // getCurrentUser é síncrono, não precisa await
    const user = this.getCurrentUser();
    console.log('[FakeAuthRepository] onAuthStateChanged - Current user:', user?.uid || 'null');
    if (callback) {
      // Chamar callback imediatamente (síncrono)
      callback(user);
    }
    
    // Retornar unsubscribe function (vazia pois não há listener real)
    return () => {
      console.log('[FakeAuthRepository] onAuthStateChanged - Unsubscribed');
    };
  }
}

export class FakePayableRepository extends IPayableRepository {
  async create(payable) {
    const payables = loadFromStorage(STORAGE_KEYS.PAYABLES);
    const newPayable = {
      id: generateId(),
      ...payable,
      status: payable.status || 'open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    payables.push(newPayable);
    saveToStorage(STORAGE_KEYS.PAYABLES, payables);
    return newPayable;
  }

  async update(id, updates) {
    const payables = loadFromStorage(STORAGE_KEYS.PAYABLES);
    const index = payables.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Payable not found');
    
    // Se mudou status para paid, adicionar paidAtISO
    if (updates.status === 'paid' && payables[index].status !== 'paid') {
      updates.paidAtISO = new Date().toISOString();
    }
    // Se mudou de paid para open, remover paidAtISO
    if (updates.status === 'open' && payables[index].status === 'paid') {
      updates.paidAtISO = null;
    }
    
    payables[index] = {
      ...payables[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    saveToStorage(STORAGE_KEYS.PAYABLES, payables);
    return payables[index];
  }

  async delete(id) {
    const payables = loadFromStorage(STORAGE_KEYS.PAYABLES);
    const filtered = payables.filter(p => p.id !== id);
    saveToStorage(STORAGE_KEYS.PAYABLES, filtered);
    return true;
  }

  async getByMonth(monthKey, limit = 100) {
    const payables = loadFromStorage(STORAGE_KEYS.PAYABLES);
    let filtered = payables.filter(p => p.monthKey === monthKey);
    
    // Ordenar por vencimento (dueDate)
    filtered.sort((a, b) => {
      const dateA = new Date(a.dueDate || a.createdAt);
      const dateB = new Date(b.dueDate || b.createdAt);
      return dateA - dateB;
    });
    
    return filtered.slice(0, limit);
  }

  async getUpcoming(days = 15, limit = 10) {
    const payables = loadFromStorage(STORAGE_KEYS.PAYABLES);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + days);
    
    const filtered = payables.filter(p => {
      if (p.status !== 'open') return false;
      const dueDate = new Date(p.dueDate || p.createdAt);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate >= today && dueDate <= futureDate;
    });
    
    filtered.sort((a, b) => {
      const dateA = new Date(a.dueDate || a.createdAt);
      const dateB = new Date(b.dueDate || b.createdAt);
      return dateA - dateB;
    });
    
    return filtered.slice(0, limit);
  }

  async getById(id) {
    const payables = loadFromStorage(STORAGE_KEYS.PAYABLES);
    return payables.find(p => p.id === id) || null;
  }

  async findByRecurringBillAndMonth(recurringBillId, monthKey) {
    const payables = loadFromStorage(STORAGE_KEYS.PAYABLES);
    return payables.find(
      p => p.recurringBillId === recurringBillId && p.monthKey === monthKey
    ) || null;
  }
}

/**
 * Templates de despesas mensais recorrentes
 * Define o que é a despesa (nome, valor, dia, categoria, etc.)
 */
export class FakeMonthlyExpenseTemplateRepository extends IMonthlyExpenseTemplateRepository {
  async create(template) {
    const templates = loadFromStorage(STORAGE_KEYS.MONTHLY_EXPENSE_TEMPLATES);
    const newTemplate = {
      id: generateId(),
      ...template,
      active: template.active !== false, // Default: true
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    templates.push(newTemplate);
    saveToStorage(STORAGE_KEYS.MONTHLY_EXPENSE_TEMPLATES, templates);
    return newTemplate;
  }

  async update(id, updates) {
    const templates = loadFromStorage(STORAGE_KEYS.MONTHLY_EXPENSE_TEMPLATES);
    const index = templates.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Template not found');
    
    templates[index] = {
      ...templates[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    saveToStorage(STORAGE_KEYS.MONTHLY_EXPENSE_TEMPLATES, templates);
    return templates[index];
  }

  async delete(id) {
    const templates = loadFromStorage(STORAGE_KEYS.MONTHLY_EXPENSE_TEMPLATES);
    const filtered = templates.filter(t => t.id !== id);
    saveToStorage(STORAGE_KEYS.MONTHLY_EXPENSE_TEMPLATES, filtered);
    return true;
  }

  async getAll(uid, limit = 100) {
    if (!uid) {
      console.warn('[FakeMonthlyExpenseTemplateRepository] getAll - No uid provided, returning empty array');
      return [];
    }
    
    const templates = loadFromStorage(STORAGE_KEYS.MONTHLY_EXPENSE_TEMPLATES);
    // Filtrar apenas templates deste usuário (não incluir templates sem uid)
    const filtered = templates.filter(t => t.uid === uid);
    return filtered.slice(0, limit);
  }

  async getActive(uid, limit = 100) {
    if (!uid) {
      console.warn('[FakeMonthlyExpenseTemplateRepository] getActive - No uid provided, returning empty array');
      return [];
    }
    
    const templates = loadFromStorage(STORAGE_KEYS.MONTHLY_EXPENSE_TEMPLATES);
    console.log(`[FakeMonthlyExpenseTemplateRepository] getActive - All templates:`, templates.length, 'total, filtering by uid:', uid);
    
    // Filtrar apenas templates deste usuário (não incluir templates sem uid)
    const filtered = templates.filter(
      t => {
        const matchesUid = t.uid === uid; // Apenas templates com uid correspondente
        const isActive = t.active !== false;
        if (!matchesUid || !isActive) {
          console.log(`[FakeMonthlyExpenseTemplateRepository] getActive - Template ${t.id} "${t.title}" filtered out: uid=${t.uid} (match=${matchesUid}), active=${t.active}`);
        }
        return matchesUid && isActive;
      }
    );
    console.log(`[FakeMonthlyExpenseTemplateRepository] getActive - Filtered templates:`, filtered.length, 'active for uid', uid);
    return filtered.slice(0, limit);
  }

  async getById(id) {
    const templates = loadFromStorage(STORAGE_KEYS.MONTHLY_EXPENSE_TEMPLATES);
    return templates.find(t => t.id === id) || null;
  }
}

/**
 * Status mensal das despesas
 * Define o status de cada despesa em cada mês (pago/não pago, transação vinculada)
 */
export class FakeMonthlyExpenseStatusRepository extends IMonthlyExpenseStatusRepository {
  async create(status) {
    const statuses = loadFromStorage(STORAGE_KEYS.MONTHLY_EXPENSE_STATUS);
    const newStatus = {
      id: generateId(),
      ...status,
      status: status.status || 'open',
      updatedAt: new Date().toISOString(),
    };
    statuses.push(newStatus);
    saveToStorage(STORAGE_KEYS.MONTHLY_EXPENSE_STATUS, statuses);
    return newStatus;
  }

  async update(id, updates) {
    const statuses = loadFromStorage(STORAGE_KEYS.MONTHLY_EXPENSE_STATUS);
    const index = statuses.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Status not found');
    
    // Se mudou status para paid, adicionar paidAtISO
    if (updates.status === 'paid' && statuses[index].status !== 'paid') {
      updates.paidAtISO = new Date().toISOString();
    }
    // Se mudou de paid para open, remover paidAtISO
    if (updates.status === 'open' && statuses[index].status === 'paid') {
      updates.paidAtISO = null;
      updates.linkedTransactionId = null; // Remover transação vinculada
    }
    
    statuses[index] = {
      ...statuses[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    saveToStorage(STORAGE_KEYS.MONTHLY_EXPENSE_STATUS, statuses);
    return statuses[index];
  }

  async delete(id) {
    const statuses = loadFromStorage(STORAGE_KEYS.MONTHLY_EXPENSE_STATUS);
    const filtered = statuses.filter(s => s.id !== id);
    saveToStorage(STORAGE_KEYS.MONTHLY_EXPENSE_STATUS, filtered);
    return true;
  }

  async getByMonth(monthKey, limit = 100) {
    const statuses = loadFromStorage(STORAGE_KEYS.MONTHLY_EXPENSE_STATUS);
    const filtered = statuses.filter(s => s.monthKey === monthKey);
    
    // Ordenar por templateId (mantém ordem dos templates)
    filtered.sort((a, b) => {
      if (a.templateId < b.templateId) return -1;
      if (a.templateId > b.templateId) return 1;
      return 0;
    });
    
    return filtered.slice(0, limit);
  }

  async getByTemplateAndMonth(templateId, monthKey) {
    const statuses = loadFromStorage(STORAGE_KEYS.MONTHLY_EXPENSE_STATUS);
    return statuses.find(
      s => s.templateId === templateId && s.monthKey === monthKey
    ) || null;
  }

  async getUpcoming(days = 15, limit = 10) {
    const statuses = loadFromStorage(STORAGE_KEYS.MONTHLY_EXPENSE_STATUS);
    const templates = loadFromStorage(STORAGE_KEYS.MONTHLY_EXPENSE_TEMPLATES);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + days);
    
    const currentMonthKey = getMonthKey(today);
    const nextMonthKey = getMonthKey(new Date(today.getFullYear(), today.getMonth() + 1, 1));
    
    // Buscar statuses dos próximos meses que estão abertos
    const filtered = statuses.filter(s => {
      if (s.status !== 'open') return false;
      if (s.monthKey !== currentMonthKey && s.monthKey !== nextMonthKey) return false;
      
      // Buscar template para calcular vencimento
      const template = templates.find(t => t.id === s.templateId);
      if (!template || template.active === false) return false;
      
      const [year, month] = s.monthKey.split('-').map(Number);
      const day = template.dueDay || 10;
      const dueDate = new Date(year, month - 1, day);
      dueDate.setHours(0, 0, 0, 0);
      
      return dueDate >= today && dueDate <= futureDate;
    });
    
    // Ordenar por vencimento
    filtered.sort((a, b) => {
      const templateA = templates.find(t => t.id === a.templateId);
      const templateB = templates.find(t => t.id === b.templateId);
      const [yearA, monthA] = a.monthKey.split('-').map(Number);
      const [yearB, monthB] = b.monthKey.split('-').map(Number);
      const dayA = templateA?.dueDay || 10;
      const dayB = templateB?.dueDay || 10;
      const dateA = new Date(yearA, monthA - 1, dayA);
      const dateB = new Date(yearB, monthB - 1, dayB);
      return dateA - dateB;
    });
    
    return filtered.slice(0, limit);
  }

  async getById(id) {
    const statuses = loadFromStorage(STORAGE_KEYS.MONTHLY_EXPENSE_STATUS);
    return statuses.find(s => s.id === id) || null;
  }

  /**
   * Garante que existe um status para o mês (cria se não existir)
   * Usado para reset mensal automático
   */
  async ensureStatusForMonth(templateId, monthKey) {
    console.log(`[FakeMonthlyExpenseStatusRepository] ensureStatusForMonth - Checking for template ${templateId}, month ${monthKey}`);
    const existing = await this.getByTemplateAndMonth(templateId, monthKey);
    if (existing) {
      console.log(`[FakeMonthlyExpenseStatusRepository] ensureStatusForMonth - Existing status found:`, existing.id);
      return existing;
    }
    
    // Criar novo status (sempre começa como 'open')
    console.log(`[FakeMonthlyExpenseStatusRepository] ensureStatusForMonth - Creating new status for template ${templateId}, month ${monthKey}`);
    const newStatus = await this.create({
      templateId,
      monthKey,
      status: 'open',
      linkedTransactionId: null,
      paidAtISO: null,
    });
    console.log(`[FakeMonthlyExpenseStatusRepository] ensureStatusForMonth - Created status:`, newStatus.id);
    return newStatus;
  }
}
