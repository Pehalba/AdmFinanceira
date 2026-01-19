import { accountRepository, userMetaRepository, transactionRepository } from '../repositories/index.js';
import { cacheManager } from '../cache/cacheManager.js';
import { getMonthKey } from '../utils/dateUtils.js';

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
   * Recalcula o saldo de todas as contas do usuário baseado em todas as transações
   * Útil para corrigir saldos incorretos após deletar transações
   */
  async recalculateAllBalances(uid) {
    try {
      console.log('[AccountService] recalculateAllBalances - Starting recalculation for uid:', uid);
      
      // Buscar todas as contas
      const accounts = await this.getAll(uid, true);
      
      // Buscar todas as transações do usuário
      // Vamos buscar por vários meses para garantir que pegamos todas
      const currentDate = new Date();
      const transactions = [];
      
      // Buscar transações dos últimos 12 meses
      for (let i = 0; i < 12; i++) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const monthKey = getMonthKey(date);
        try {
          const monthTransactions = await transactionRepository.getByMonth(monthKey, 1000);
          transactions.push(...monthTransactions);
        } catch (error) {
          console.warn(`[AccountService] recalculateAllBalances - Error fetching transactions for ${monthKey}:`, error);
        }
      }
      
      console.log('[AccountService] recalculateAllBalances - Found', transactions.length, 'transactions');
      
      // Inicializar saldos de todas as contas como 0
      const balances = {};
      accounts.forEach(account => {
        balances[account.id] = 0;
      });
      
      // Processar cada transação
      transactions.forEach(transaction => {
        if (!transaction.accountId) return; // Pular transações sem conta
        
        const accountId = transaction.accountId;
        if (!balances.hasOwnProperty(accountId)) {
          // Se a conta não existe mais, ignorar
          return;
        }
        
        const amount = transaction.amount || 0;
        const type = transaction.type || 'expense';
        
        if (type === 'income') {
          // Receita: soma
          balances[accountId] += Math.abs(amount);
        } else {
          // Despesa: subtrai
          balances[accountId] -= Math.abs(amount);
        }
      });
      
      // Atualizar saldo de cada conta
      const updatePromises = accounts.map(account => {
        const newBalance = balances[account.id] || 0;
        console.log(`[AccountService] recalculateAllBalances - Account ${account.name}: ${account.balance} -> ${newBalance}`);
        
        return accountRepository.update(account.id, {
          balance: newBalance,
          uid: uid,
        }).catch(err => {
          console.error(`[AccountService] recalculateAllBalances - Error updating account ${account.id}:`, err);
        });
      });
      
      await Promise.all(updatePromises);
      
      // Invalidar cache
      await this.invalidateCache(uid);
      
      console.log('[AccountService] recalculateAllBalances - Recalculation complete');
      
      return balances;
    } catch (error) {
      console.error('[AccountService] recalculateAllBalances - Error:', error);
      throw error;
    }
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
