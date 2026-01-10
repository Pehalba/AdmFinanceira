import { accountRepository, userMetaRepository } from '../repositories/index.js';
import { cacheManager } from '../cache/cacheManager.js';

/**
 * Serviço de contas
 */
class AccountService {
  /**
   * Cria nova conta
   */
  async create(accountData) {
    const account = await accountRepository.create(accountData);
    await this.invalidateCache(accountData.uid);
    return account;
  }

  /**
   * Atualiza conta
   */
  async update(id, updates) {
    const account = await accountRepository.update(id, updates);
    // TODO: Obter uid do account para invalidar cache
    await this.invalidateCache(updates.uid);
    return account;
  }

  /**
   * Deleta conta
   */
  async delete(id, uid) {
    await accountRepository.delete(id);
    await this.invalidateCache(uid);
  }

  /**
   * Obtém todas as contas (usa cache se disponível)
   */
  async getAll(uid, forceReload = false) {
    if (!forceReload) {
      const cached = cacheManager.getAccounts();
      if (cached && cached.length > 0) {
        return cached;
      }
    }

    const accounts = await accountRepository.getAll();
    
    // Salvar no cache
    const version = Date.now();
    cacheManager.saveAccounts(accounts, version);
    
    // Atualizar versão no meta
    await this.updateMetaVersion(uid, version, 'accounts');

    return accounts;
  }

  /**
   * Obtém conta por ID
   */
  async getById(id) {
    return await accountRepository.getById(id);
  }

  /**
   * Invalida cache de accounts
   */
  async invalidateCache(uid) {
    cacheManager.clearAccounts();
    const version = Date.now();
    await this.updateMetaVersion(uid, version, 'accounts');
  }

  /**
   * Atualiza versão no meta
   */
  async updateMetaVersion(uid, version, type) {
    const appMeta = await userMetaRepository.getAppMeta(uid) || {};
    const fieldName = `${type}Version`;
    await userMetaRepository.updateAppMeta(uid, {
      ...appMeta,
      [fieldName]: version,
    });
  }
}

export const accountService = new AccountService();
