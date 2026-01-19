import { transactionRepository, accountRepository, categoryRepository } from '../repositories/index.js';
import { getMonthKey } from '../utils/dateUtils.js';
import { dashboardService } from './dashboardService.js';
import { accountService } from './accountService.js';

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
    
    console.log('[TransactionService] create - Final date object:', date);
    console.log('[TransactionService] create - Date.getFullYear():', date.getFullYear());
    console.log('[TransactionService] create - Date.getMonth() + 1:', date.getMonth() + 1);
    console.log('[TransactionService] create - Date.getDate():', date.getDate());

    // Buscar account e category para denormalizar (accountId pode ser opcional)
    console.log('[TransactionService] create - Fetching account and category:', {
      accountId: transactionData.accountId,
      categoryId: transactionData.categoryId
    });
    const [account, category] = await Promise.all([
      transactionData.accountId ? accountRepository.getById(transactionData.accountId).catch((err) => {
        console.error('[TransactionService] create - Error fetching account:', err);
        return null;
      }) : Promise.resolve(null),
      transactionData.categoryId ? categoryRepository.getById(transactionData.categoryId).catch(() => null) : Promise.resolve(null),
    ]);
    console.log('[TransactionService] create - Account found:', account ? { id: account.id, name: account.name, balance: account.balance } : 'null');

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
    
    // Atualizar saldo da conta se accountId foi fornecido
    if (transactionData.accountId) {
      if (!account) {
        console.error('[TransactionService] create - AccountId provided but account not found:', transactionData.accountId);
        // Tentar buscar novamente com uid explícito
        try {
          const retryAccount = await accountRepository.getById(transactionData.accountId);
          if (retryAccount) {
            console.log('[TransactionService] create - Account found on retry:', retryAccount.id);
            // Usar a conta encontrada no retry
            const currentBalance = retryAccount.balance || 0;
            const transactionAmount = transactionData.amount || 0;
            
            let newBalance;
            if (transactionData.type === 'income') {
              newBalance = currentBalance + Math.abs(transactionAmount);
            } else {
              newBalance = currentBalance - Math.abs(transactionAmount);
            }
            
            const accountUid = retryAccount.uid || transactionData.uid;
            if (accountUid) {
              await accountRepository.update(transactionData.accountId, {
                balance: newBalance,
                uid: accountUid,
              });
              await accountService.invalidateCache(accountUid).catch(() => {});
            }
          } else {
            console.error('[TransactionService] create - Account still not found after retry');
          }
        } catch (retryError) {
          console.error('[TransactionService] create - Error retrying account fetch:', retryError);
        }
      } else {
        // Conta foi encontrada normalmente
        const currentBalance = account.balance || 0;
        const transactionAmount = transactionData.amount || 0;
        
        // Calcular novo saldo baseado no tipo da transação
        let newBalance;
        if (transactionData.type === 'income') {
          // Receita: soma o valor positivo
          newBalance = currentBalance + Math.abs(transactionAmount);
        } else {
          // Despesa: subtrai o valor (mesmo que venha positivo do formulário)
          newBalance = currentBalance - Math.abs(transactionAmount);
        }
        
        console.log('[TransactionService] create - Updating account balance:', {
          accountId: transactionData.accountId,
          accountName: account.name,
          currentBalance,
          transactionAmount,
          transactionType: transactionData.type,
          newBalance,
        });
        
        const accountUid = account.uid || transactionData.uid;
        if (accountUid) {
          const updateResult = await accountRepository.update(transactionData.accountId, {
            balance: newBalance,
            uid: accountUid,
          }).catch(err => {
            console.error('[TransactionService] create - Error updating account balance:', err);
            throw err;
          });
          
          console.log('[TransactionService] create - Account balance updated successfully:', {
            accountId: transactionData.accountId,
            newBalance: updateResult?.balance
          });
          
          // Invalidar cache de accounts para forçar recarregamento
          await accountService.invalidateCache(accountUid).catch(err => {
            console.error('[TransactionService] create - Error invalidating account cache:', err);
          });
        } else {
          console.warn('[TransactionService] create - No uid found for account update:', {
            accountUid: account.uid,
            transactionUid: transactionData.uid,
          });
        }
      }
    } else {
      console.log('[TransactionService] create - No accountId provided, skipping balance update');
    }
    
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

    // Atualizar saldo da conta se necessário
    const oldAmount = existingTransaction.amount || 0;
    const newAmount = updates.amount !== undefined ? updates.amount : oldAmount;
    const oldType = existingTransaction.type || 'expense';
    const newType = updates.type !== undefined ? updates.type : oldType;
    const oldAccountId = existingTransaction.accountId;
    const newAccountId = updates.accountId !== undefined ? updates.accountId : oldAccountId;
    
    // Se mudou a conta ou o valor, atualizar saldos
    if (oldAccountId || newAccountId) {
      // Reverter saldo da conta antiga (se mudou de conta ou valor)
      if (oldAccountId && (oldAccountId !== newAccountId || oldAmount !== newAmount || oldType !== newType)) {
        const oldAccount = await accountRepository.getById(oldAccountId).catch(() => null);
        if (oldAccount) {
          const oldBalance = oldAccount.balance || 0;
          // Reverter: se era receita, subtrai; se era despesa, soma
          let revertedBalance;
          if (oldType === 'income') {
            revertedBalance = oldBalance - Math.abs(oldAmount);
          } else {
            revertedBalance = oldBalance + Math.abs(oldAmount);
          }
          
          const oldAccountUid = oldAccount.uid || existingTransaction.uid;
          if (oldAccountUid) {
            await accountRepository.update(oldAccountId, {
              balance: revertedBalance,
              uid: oldAccountUid,
            }).catch(err => {
              console.error('[TransactionService] update - Error reverting old account balance:', err);
            });
            
            // Invalidar cache de accounts para forçar recarregamento
            await accountService.invalidateCache(oldAccountUid).catch(err => {
              console.error('[TransactionService] update - Error invalidating old account cache:', err);
            });
          }
        }
      }
      
      // Atualizar saldo da conta nova (ou mesma conta se só mudou valor)
      if (newAccountId) {
        const newAccount = await accountRepository.getById(newAccountId).catch(() => null);
        if (newAccount) {
          let newBalance = newAccount.balance || 0;
          
          if (oldAccountId === newAccountId) {
            // Mesma conta: já revertemos acima, agora aplicar novo valor
            if (newType === 'income') {
              newBalance = newBalance + Math.abs(newAmount);
            } else {
              newBalance = newBalance - Math.abs(newAmount);
            }
          } else {
            // Conta diferente: aplicar novo valor diretamente
            if (newType === 'income') {
              newBalance = newBalance + Math.abs(newAmount);
            } else {
              newBalance = newBalance - Math.abs(newAmount);
            }
          }
          
          const newAccountUid = newAccount.uid || existingTransaction.uid || updates.uid;
          if (newAccountUid) {
            await accountRepository.update(newAccountId, {
              balance: newBalance,
              uid: newAccountUid,
            }).catch(err => {
              console.error('[TransactionService] update - Error updating new account balance:', err);
            });
            
            // Invalidar cache de accounts para forçar recarregamento
            await accountService.invalidateCache(newAccountUid).catch(err => {
              console.error('[TransactionService] update - Error invalidating account cache:', err);
            });
          }
        }
      }
    }

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
    // Buscar transação antes de deletar para obter monthKey e accountId
    const transaction = await this.getById(id);
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    const monthKey = transaction.monthKey;
    
    // Reverter saldo da conta se tinha accountId
    if (transaction.accountId) {
      const account = await accountRepository.getById(transaction.accountId).catch(() => null);
      if (account) {
        const currentBalance = account.balance || 0;
        const transactionAmount = transaction.amount || 0;
        const transactionType = transaction.type || 'expense';
        
        // Reverter: se era receita, subtrai; se era despesa, soma
        let revertedBalance;
        if (transactionType === 'income') {
          revertedBalance = currentBalance - Math.abs(transactionAmount);
        } else {
          revertedBalance = currentBalance + Math.abs(transactionAmount);
        }
        
        console.log('[TransactionService] delete - Reverting account balance:', {
          accountId: transaction.accountId,
          currentBalance,
          transactionAmount,
          transactionType,
          revertedBalance,
        });
        
        const accountUid = account.uid || transaction.uid;
        if (accountUid) {
          await accountRepository.update(transaction.accountId, {
            balance: revertedBalance,
            uid: accountUid,
          }).catch(err => {
            console.error('[TransactionService] delete - Error reverting account balance:', err);
          });
          
          // Invalidar cache de accounts para forçar recarregamento
          await accountService.invalidateCache(accountUid).catch(err => {
            console.error('[TransactionService] delete - Error invalidating account cache:', err);
          });
        }
      }
    }
    
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
