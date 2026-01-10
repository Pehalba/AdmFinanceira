/**
 * Interface base para repositórios
 * Define contratos para implementações Fake e Firestore
 */

export class ITransactionRepository {
  async create(transaction) {
    throw new Error('Not implemented');
  }

  async update(id, updates) {
    throw new Error('Not implemented');
  }

  async delete(id) {
    throw new Error('Not implemented');
  }

  async getByMonth(monthKey, limit = 50, startAfter = null) {
    throw new Error('Not implemented');
  }

  async getRecent(limit = 10) {
    throw new Error('Not implemented');
  }
}

export class IAccountRepository {
  async create(account) {
    throw new Error('Not implemented');
  }

  async update(id, updates) {
    throw new Error('Not implemented');
  }

  async delete(id) {
    throw new Error('Not implemented');
  }

  async getAll() {
    throw new Error('Not implemented');
  }

  async getById(id) {
    throw new Error('Not implemented');
  }
}

export class ICategoryRepository {
  async create(category) {
    throw new Error('Not implemented');
  }

  async update(id, updates) {
    throw new Error('Not implemented');
  }

  async delete(id) {
    throw new Error('Not implemented');
  }

  async getAll() {
    throw new Error('Not implemented');
  }

  async getById(id) {
    throw new Error('Not implemented');
  }
}

export class IMonthlySummaryRepository {
  async getByMonth(monthKey) {
    throw new Error('Not implemented');
  }

  async upsert(monthKey, summary) {
    throw new Error('Not implemented');
  }
}

export class IRecurringBillRepository {
  async create(bill) {
    throw new Error('Not implemented');
  }

  async update(id, updates) {
    throw new Error('Not implemented');
  }

  async delete(id) {
    throw new Error('Not implemented');
  }

  async getActive(limit = 10) {
    throw new Error('Not implemented');
  }
}

export class IUserMetaRepository {
  async getAppMeta(uid) {
    throw new Error('Not implemented');
  }

  async updateAppMeta(uid, meta) {
    throw new Error('Not implemented');
  }
}

export class IAuthRepository {
  async signup(email, password, userData) {
    throw new Error('Not implemented');
  }

  async login(email, password) {
    throw new Error('Not implemented');
  }

  async logout() {
    throw new Error('Not implemented');
  }

  async getCurrentUser() {
    throw new Error('Not implemented');
  }

  async onAuthStateChanged(callback) {
    throw new Error('Not implemented');
  }
}

/**
 * Templates de despesas mensais recorrentes
 * Define o que é a despesa (nome, valor, dia, categoria, etc.)
 */
export class IMonthlyExpenseTemplateRepository {
  async create(template) {
    throw new Error('Not implemented');
  }

  async update(id, updates) {
    throw new Error('Not implemented');
  }

  async delete(id) {
    throw new Error('Not implemented');
  }

  async getAll(uid, limit = 100) {
    throw new Error('Not implemented');
  }

  async getActive(uid, limit = 100) {
    throw new Error('Not implemented');
  }

  async getById(id) {
    throw new Error('Not implemented');
  }
}

/**
 * Status mensal das despesas
 * Define o status de cada despesa em cada mês (pago/não pago, transação vinculada)
 */
export class IMonthlyExpenseStatusRepository {
  async create(status) {
    throw new Error('Not implemented');
  }

  async update(id, updates) {
    throw new Error('Not implemented');
  }

  async delete(id) {
    throw new Error('Not implemented');
  }

  async getByMonth(monthKey, limit = 100) {
    throw new Error('Not implemented');
  }

  async getByTemplateAndMonth(templateId, monthKey) {
    throw new Error('Not implemented');
  }

  async getUpcoming(days = 15, limit = 10) {
    throw new Error('Not implemented');
  }

  async getById(id) {
    throw new Error('Not implemented');
  }

  /**
   * Garante que existe um status para o mês (cria se não existir)
   * Usado para reset mensal automático
   */
  async ensureStatusForMonth(templateId, monthKey) {
    throw new Error('Not implemented');
  }
}

// Mantido para compatibilidade (será removido depois)
export class IPayableRepository {
  async create(payable) {
    throw new Error('Not implemented - Use IMonthlyExpenseTemplateRepository and IMonthlyExpenseStatusRepository');
  }

  async update(id, updates) {
    throw new Error('Not implemented - Use IMonthlyExpenseTemplateRepository and IMonthlyExpenseStatusRepository');
  }

  async delete(id) {
    throw new Error('Not implemented - Use IMonthlyExpenseTemplateRepository and IMonthlyExpenseStatusRepository');
  }

  async getByMonth(monthKey, limit = 100) {
    throw new Error('Not implemented - Use IMonthlyExpenseTemplateRepository and IMonthlyExpenseStatusRepository');
  }

  async getUpcoming(days = 15, limit = 10) {
    throw new Error('Not implemented - Use IMonthlyExpenseTemplateRepository and IMonthlyExpenseStatusRepository');
  }

  async getById(id) {
    throw new Error('Not implemented - Use IMonthlyExpenseTemplateRepository and IMonthlyExpenseStatusRepository');
  }

  async findByRecurringBillAndMonth(recurringBillId, monthKey) {
    throw new Error('Not implemented - Use IMonthlyExpenseTemplateRepository and IMonthlyExpenseStatusRepository');
  }
}
