import { transactionRepository, accountRepository, categoryRepository } from '../repositories/index.js';
import { getMonthKey } from '../utils/dateUtils.js';
import { dashboardService } from './dashboardService.js';

/**
 * Serviço de transações
 * Sempre filtra por monthKey e usa paginação
 */
class TransactionService {
  /**
   * Cria nova transação
   * Denormaliza accountName e categoryName
   */
  async create(transactionData) {
    console.log('[TransactionService] create - Received transactionData:', transactionData);
    
    let date;
    if (transactionData.date instanceof Date) {
      date = transactionData.date;
      console.log('[TransactionService] create - Date is already a Date object:', date);
    } else if (typeof transactionData.date === 'string') {
      console.log('[TransactionService] create - Date is string:', transactionData.date);
      // Se for string no formato YYYY-MM-DD, criar Date no timezone local
      if (transactionData.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = transactionData.date.split('-').map(Number);
        console.log('[TransactionService] create - Parsing YYYY-MM-DD:', { year, month, day });
        date = new Date(year, month - 1, day); // month - 1 porque Date usa 0-11
        console.log('[TransactionService] create - Created Date (local):', date);
        console.log('[TransactionService] create - Date.getFullYear():', date.getFullYear());
        console.log('[TransactionService] create - Date.getMonth():', date.getMonth());
        console.log('[TransactionService] create - Date.getDate():', date.getDate());
      } else {
        console.log('[TransactionService] create - Not YYYY-MM-DD format, using new Date()');
        date = new Date(transactionData.date);
      }
    } else {
      console.log('[TransactionService] create - Date is other type, using new Date()');
      date = new Date(transactionData.date);
    }
    
    const monthKey = getMonthKey(date);
    console.log('[TransactionService] create - Final date:', date);
    console.log('[TransactionService] create - Calculated monthKey:', monthKey);
    console.log('[TransactionService] create - Date.getFullYear():', date.getFullYear());
    console.log('[TransactionService] create - Date.getMonth() + 1:', date.getMonth() + 1);

    // Buscar account e category para denormalizar (accountId pode ser opcional)
    const [account, category] = await Promise.all([
      transactionData.accountId ? accountRepository.getById(transactionData.accountId).catch(() => null) : Promise.resolve(null),
      transactionData.categoryId ? categoryRepository.getById(transactionData.categoryId).catch(() => null) : Promise.resolve(null),
    ]);

    // IMPORTANTE: Calcular monthKey ANTES de converter para ISO string
    // A conversão para ISO pode mudar o mês devido ao timezone
    const monthKey = getMonthKey(date);
    console.log('[TransactionService] create - MonthKey calculated BEFORE ISO conversion:', monthKey);
    
    // Converter para ISO string para salvar no Firestore
    const dateISO = date.toISOString();
    console.log('[TransactionService] create - Date ISO string:', dateISO);
    
    const transaction = {
      ...transactionData,
      date: dateISO,
      monthKey, // Usar monthKey calculado ANTES da conversão
      accountName: account?.name || '',
      bankName: account?.name || '', // Alias para compatibilidade
      categoryName: category?.name || '',
    };
    
    console.log('[TransactionService] create - Final transaction monthKey:', transaction.monthKey);

    const created = await transactionRepository.create(transaction);
    
    // Recalcular resumo mensal após criar transação
    await dashboardService.calculateMonthlySummary(monthKey).catch(err => {
      console.error('Error calculating monthly summary:', err);
    });

    return created;
  }

  /**
   * Atualiza transação
   * Atualiza denormalização se accountId ou categoryId mudarem
   */
  async update(id, updates) {
    const existingTransaction = await transactionRepository.getById(id);
    if (!existingTransaction) {
      throw new Error('Transaction not found');
    }

    let accountName = existingTransaction.accountName || existingTransaction.bankName;
    let categoryName = existingTransaction.categoryName;

    // Se mudou accountId, buscar novo nome
    if (updates.accountId && updates.accountId !== existingTransaction.accountId) {
      const account = await accountRepository.getById(updates.accountId);
      accountName = account?.name || '';
    }

    // Se mudou categoryId, buscar novo nome
    if (updates.categoryId && updates.categoryId !== existingTransaction.categoryId) {
      const category = await categoryRepository.getById(updates.categoryId);
      categoryName = category?.name || '';
    }

    // Se mudou data, recalcular monthKey
    let newMonthKey = existingTransaction.monthKey;
    if (updates.date) {
      const date = updates.date instanceof Date 
        ? updates.date 
        : new Date(updates.date);
      newMonthKey = getMonthKey(date);
      updates.monthKey = newMonthKey;
      updates.date = date.toISOString();
    }

    const updated = await transactionRepository.update(id, {
      ...updates,
      accountName,
      bankName: accountName, // Alias para compatibilidade
      categoryName,
    });

    // Recalcular resumos mensais (mês antigo e novo, se mudou)
    const monthKey = newMonthKey;
    await dashboardService.calculateMonthlySummary(monthKey).catch(err => {
      console.error('Error calculating monthly summary:', err);
    });
    
    // Se mudou de mês, recalcular o mês antigo também
    if (newMonthKey !== existingTransaction.monthKey) {
      await dashboardService.calculateMonthlySummary(existingTransaction.monthKey).catch(err => {
        console.error('Error calculating monthly summary (old month):', err);
      });
    }

    return updated;
  }

  /**
   * Deleta transação
   */
  async delete(id) {
    // Buscar transação antes de deletar para obter monthKey
    const transaction = await this.getById(id);
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    const monthKey = transaction.monthKey;
    
    // Deletar transação
    await transactionRepository.delete(id);
    
    // Recalcular resumo mensal após deletar
    await dashboardService.calculateMonthlySummary(monthKey).catch(err => {
      console.error('Error calculating monthly summary:', err);
    });

    return true;
  }

  /**
   * Obtém transações por mês (com paginação)
   */
  async getByMonth(monthKey, limit = 50, startAfter = null) {
    return await transactionRepository.getByMonth(monthKey, limit, startAfter);
  }

  /**
   * Obtém transações recentes
   */
  async getRecent(limit = 10) {
    return await transactionRepository.getRecent(limit);
  }

  /**
   * Obtém transação por ID
   */
  async getById(id) {
    if (transactionRepository.getById) {
      return await transactionRepository.getById(id);
    }
    // Fallback se método não existir
    const recent = await transactionRepository.getRecent(1000);
    return recent.find(t => t.id === id) || null;
  }
}

export const transactionService = new TransactionService();
