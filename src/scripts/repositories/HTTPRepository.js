/**
 * Implementação HTTP usando Fetch API
 * Conecta com servidor Express local
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Helper para fazer requisições HTTP
 */
async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    // Se não tem conteúdo, retorna true (sucesso)
    if (response.status === 204) {
      return true;
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

export class HTTPTransactionRepository {
  async create(transaction) {
    return await fetchAPI('/transactions', {
      method: 'POST',
      body: transaction,
    });
  }

  async update(id, updates) {
    return await fetchAPI(`/transactions/${id}`, {
      method: 'PUT',
      body: updates,
    });
  }

  async delete(id) {
    return await fetchAPI(`/transactions/${id}`, {
      method: 'DELETE',
    });
  }

  async getByMonth(monthKey, limit = 50, startAfter = null) {
    const params = new URLSearchParams({ monthKey, limit: String(limit) });
    if (startAfter) {
      params.append('startAfter', startAfter);
    }
    return await fetchAPI(`/transactions?${params.toString()}`);
  }

  async getRecent(limit = 10) {
    return await fetchAPI(`/transactions?limit=${limit}`);
  }

  async getById(id) {
    return await fetchAPI(`/transactions/${id}`);
  }
}

export class HTTPAccountRepository {
  async create(account) {
    return await fetchAPI('/accounts', {
      method: 'POST',
      body: account,
    });
  }

  async update(id, updates) {
    return await fetchAPI(`/accounts/${id}`, {
      method: 'PUT',
      body: updates,
    });
  }

  async delete(id) {
    return await fetchAPI(`/accounts/${id}`, {
      method: 'DELETE',
    });
  }

  async getAll() {
    return await fetchAPI('/accounts');
  }

  async getById(id) {
    return await fetchAPI(`/accounts/${id}`);
  }
}

export class HTTPCategoryRepository {
  async create(category) {
    return await fetchAPI('/categories', {
      method: 'POST',
      body: category,
    });
  }

  async update(id, updates) {
    return await fetchAPI(`/categories/${id}`, {
      method: 'PUT',
      body: updates,
    });
  }

  async delete(id) {
    return await fetchAPI(`/categories/${id}`, {
      method: 'DELETE',
    });
  }

  async getAll() {
    return await fetchAPI('/categories');
  }

  async getById(id) {
    return await fetchAPI(`/categories/${id}`);
  }
}

export class HTTPMonthlySummaryRepository {
  async getByMonth(monthKey) {
    return await fetchAPI(`/monthly-summaries/${monthKey}`);
  }

  async upsert(monthKey, summary) {
    return await fetchAPI('/monthly-summaries', {
      method: 'POST',
      body: { monthKey, ...summary },
    });
  }
}

export class HTTPRecurringBillRepository {
  async create(bill) {
    return await fetchAPI('/recurring-bills', {
      method: 'POST',
      body: bill,
    });
  }

  async update(id, updates) {
    return await fetchAPI(`/recurring-bills/${id}`, {
      method: 'PUT',
      body: updates,
    });
  }

  async delete(id) {
    return await fetchAPI(`/recurring-bills/${id}`, {
      method: 'DELETE',
    });
  }

  async getActive(limit = 10) {
    return await fetchAPI(`/recurring-bills?limit=${limit}`);
  }
}

export class HTTPPayableRepository {
  async create(payable) {
    return await fetchAPI('/payables', {
      method: 'POST',
      body: payable,
    });
  }

  async update(id, updates) {
    return await fetchAPI(`/payables/${id}`, {
      method: 'PUT',
      body: updates,
    });
  }

  async delete(id) {
    return await fetchAPI(`/payables/${id}`, {
      method: 'DELETE',
    });
  }

  async getByMonth(monthKey, limit = 100) {
    return await fetchAPI(`/payables?monthKey=${monthKey}&limit=${limit}`);
  }

  async getUpcoming(days = 15, limit = 10) {
    return await fetchAPI(`/payables/upcoming?days=${days}&limit=${limit}`);
  }

  async getById(id) {
    return await fetchAPI(`/payables/${id}`);
  }

  async findByRecurringBillAndMonth(recurringBillId, monthKey) {
    const result = await fetchAPI(`/payables?recurringBillId=${recurringBillId}&monthKey=${monthKey}`);
    return Array.isArray(result) ? result[0] || null : result;
  }
}

export class HTTPUserMetaRepository {
  async getAppMeta(uid) {
    return await fetchAPI(`/users/${uid}/meta/app`);
  }

  async updateAppMeta(uid, appMeta) {
    return await fetchAPI(`/users/${uid}/meta/app`, {
      method: 'PUT',
      body: appMeta,
    });
  }
}

export class HTTPPayableRepository {
  async create(payable) {
    return await fetchAPI('/payables', {
      method: 'POST',
      body: payable,
    });
  }

  async update(id, updates) {
    return await fetchAPI(`/payables/${id}`, {
      method: 'PUT',
      body: updates,
    });
  }

  async delete(id) {
    return await fetchAPI(`/payables/${id}`, {
      method: 'DELETE',
    });
  }

  async getByMonth(monthKey, limit = 100) {
    return await fetchAPI(`/payables?monthKey=${monthKey}&limit=${limit}`);
  }

  async getUpcoming(days = 15, limit = 10) {
    return await fetchAPI(`/payables/upcoming?days=${days}&limit=${limit}`);
  }

  async getById(id) {
    return await fetchAPI(`/payables/${id}`);
  }

  async findByRecurringBillAndMonth(recurringBillId, monthKey) {
    const result = await fetchAPI(`/payables?recurringBillId=${recurringBillId}&monthKey=${monthKey}`);
    return Array.isArray(result) ? result[0] || null : result;
  }
}

export class HTTPAuthRepository {
  constructor() {
    this.currentUser = null;
  }

  async signup(email, password, userData = {}) {
    // HTTP já retorna { user, defaultAccount, defaultCategories }
    const result = await fetchAPI('/auth/signup', {
      method: 'POST',
      body: { email, password, ...userData },
    });
    
    // Armazenar usuário atual
    this.currentUser = result.user || result;
    
    // Retornar no formato esperado
    return result;
  }

  async login(email, password) {
    const user = await fetchAPI('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    
    this.currentUser = user;
    return user;
  }

  async logout() {
    // Em produção, invalidar token no servidor
    this.currentUser = null;
    localStorage.removeItem('financeiro_current_user');
    return true;
  }

  async getCurrentUser() {
    // Tentar recuperar do localStorage ou do estado interno
    if (this.currentUser) {
      return this.currentUser;
    }
    
    try {
      const stored = localStorage.getItem('financeiro_current_user');
      if (stored) {
        this.currentUser = JSON.parse(stored);
        return this.currentUser;
      }
    } catch (e) {
      // Ignorar erro
    }
    
    return null;
  }

  async onAuthStateChanged(callback) {
    // Verificar usuário atual
    const user = await this.getCurrentUser();
    callback(user);
    
    // Em produção, implementar com token JWT e WebSockets/SSE
    // Por enquanto, retorna unsubscribe vazio
    return () => {};
  }
}
