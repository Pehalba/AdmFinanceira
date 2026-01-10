/**
 * Gerenciador de cache local com versionamento
 * Armazena accounts e categories no localStorage com versionamento
 */

const CACHE_KEYS = {
  ACCOUNTS: 'financeiro_cache_accounts',
  CATEGORIES: 'financeiro_cache_categories',
  ACCOUNTS_VERSION: 'financeiro_cache_accounts_version',
  CATEGORIES_VERSION: 'financeiro_cache_categories_version',
};

function saveToCache(key, data, versionKey, version) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    localStorage.setItem(versionKey, String(version || Date.now()));
    return true;
  } catch (error) {
    console.error('Error saving to cache:', error);
    return false;
  }
}

function loadFromCache(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading from cache:', error);
    return null;
  }
}

function getCacheVersion(versionKey) {
  try {
    const version = localStorage.getItem(versionKey);
    return version ? Number(version) : null;
  } catch {
    return null;
  }
}

export const cacheManager = {
  /**
   * Salva accounts no cache com versão
   */
  saveAccounts(accounts, version) {
    return saveToCache(
      CACHE_KEYS.ACCOUNTS,
      accounts,
      CACHE_KEYS.ACCOUNTS_VERSION,
      version
    );
  },

  /**
   * Obtém accounts do cache
   */
  getAccounts() {
    return loadFromCache(CACHE_KEYS.ACCOUNTS);
  },

  /**
   * Obtém versão do cache de accounts
   */
  getAccountsVersion() {
    return getCacheVersion(CACHE_KEYS.ACCOUNTS_VERSION);
  },

  /**
   * Verifica se cache de accounts está atualizado
   */
  isAccountsCacheValid(serverVersion) {
    const cachedVersion = this.getAccountsVersion();
    if (!cachedVersion || !serverVersion) return false;
    return cachedVersion >= serverVersion;
  },

  /**
   * Salva categories no cache com versão
   */
  saveCategories(categories, version) {
    return saveToCache(
      CACHE_KEYS.CATEGORIES,
      categories,
      CACHE_KEYS.CATEGORIES_VERSION,
      version
    );
  },

  /**
   * Obtém categories do cache
   */
  getCategories() {
    return loadFromCache(CACHE_KEYS.CATEGORIES);
  },

  /**
   * Obtém versão do cache de categories
   */
  getCategoriesVersion() {
    return getCacheVersion(CACHE_KEYS.CATEGORIES_VERSION);
  },

  /**
   * Verifica se cache de categories está atualizado
   */
  isCategoriesCacheValid(serverVersion) {
    const cachedVersion = this.getCategoriesVersion();
    if (!cachedVersion || !serverVersion) return false;
    return cachedVersion >= serverVersion;
  },

  /**
   * Limpa todo o cache
   */
  clear() {
    Object.values(CACHE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  },

  /**
   * Limpa apenas cache de accounts
   */
  clearAccounts() {
    localStorage.removeItem(CACHE_KEYS.ACCOUNTS);
    localStorage.removeItem(CACHE_KEYS.ACCOUNTS_VERSION);
  },

  /**
   * Limpa apenas cache de categories
   */
  clearCategories() {
    localStorage.removeItem(CACHE_KEYS.CATEGORIES);
    localStorage.removeItem(CACHE_KEYS.CATEGORIES_VERSION);
  },
};
