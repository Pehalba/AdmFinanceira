import { 
  monthlyExpenseTemplateRepository, 
  monthlyExpenseStatusRepository, 
  transactionRepository,
  categoryRepository 
} from '../repositories/index.js';
import { transactionService } from './transactionService.js';
import { dashboardService } from './dashboardService.js';
import { getMonthKey } from '../utils/dateUtils.js';

/**
 * Serviço de Despesas Mensais Recorrentes
 * Gerencia templates recorrentes e status mensal
 */
class PayableService {
  /**
   * Cria novo template de despesa mensal (recorrente)
   * O template aparecerá em todos os meses futuros e no mês atual
   */
  async createTemplate(templateData) {
    // Buscar categoria para denormalizar
    const category = await categoryRepository.getById(templateData.categoryId || '');
    
    const template = {
      ...templateData,
      title: templateData.title || '',
      amount: parseFloat(templateData.amount) || 0,
      dueDay: parseInt(templateData.dueDay, 10) || 10,
      categoryId: templateData.categoryId || '',
      categoryName: category?.name || '',
      notes: templateData.notes || '',
      active: templateData.active !== false, // Default: true
      uid: templateData.uid,
    };

    const created = await monthlyExpenseTemplateRepository.create(template);
    
    // Garantir que existe status para o mês atual (se especificado)
    if (templateData.initialMonthKey) {
      await monthlyExpenseStatusRepository.ensureStatusForMonth(
        created.id, 
        templateData.initialMonthKey
      );
    }

    return created;
  }

  /**
   * Atualiza template de despesa mensal
   * Afeta apenas meses futuros (status já criados não são alterados)
   */
  async updateTemplate(id, updates) {
    const existing = await monthlyExpenseTemplateRepository.getById(id);
    if (!existing) {
      throw new Error('Template not found');
    }

    // Se mudou categoryId, buscar novo nome
    let categoryName = existing.categoryName;
    if (updates.categoryId && updates.categoryId !== existing.categoryId) {
      const category = await categoryRepository.getById(updates.categoryId);
      categoryName = category?.name || '';
    }

    return await monthlyExpenseTemplateRepository.update(id, {
      ...updates,
      categoryName,
    });
  }

  /**
   * Deleta template de despesa mensal
   * Também remove todos os status mensais relacionados
   */
  async deleteTemplate(id) {
    // Buscar todos os status deste template
    // Como não temos método getAll, vamos buscar por vários meses ou usar uma abordagem diferente
    // Por enquanto, deletar apenas quando necessário (ao deletar o template)
    // Os status ficam órfãos mas não causam problema (podem ser limpos depois)
    
    // Deletar template primeiro
    const deleted = await monthlyExpenseTemplateRepository.delete(id);
    
    // TODO: Implementar limpeza de status órfãos se necessário
    // Por enquanto, deixamos os status existentes (não causam problema)
    
    return deleted;
  }

  /**
   * Obtém templates ativos
   */
  async getTemplates(uid, activeOnly = true) {
    if (activeOnly) {
      return await monthlyExpenseTemplateRepository.getActive(uid, 1000);
    }
    return await monthlyExpenseTemplateRepository.getAll(uid, 1000);
  }

  /**
   * Obtém despesas por mês (templates + status)
   * Garante que existe status para todos os templates ativos do mês
   */
  async getByMonth(monthKey, uid) {
    if (!uid) {
      throw new Error('uid is required');
    }
    
    if (!monthKey || !monthKey.match(/^\d{4}-\d{2}$/)) {
      throw new Error('Invalid monthKey format. Expected YYYY-MM');
    }
    
    try {
      // Buscar templates ativos
      console.log(`[PayableService] getByMonth - Fetching active templates for uid: ${uid}, monthKey: ${monthKey}`);
      const templates = await monthlyExpenseTemplateRepository.getActive(uid, 1000);
      console.log(`[PayableService] getByMonth - Found ${templates?.length || 0} active templates for uid ${uid}`);
      
      if (!templates || templates.length === 0) {
        console.log(`[PayableService] getByMonth - No active templates found for uid ${uid}, returning empty array`);
        return []; // Sem templates, retornar array vazio
      }
      
      console.log(`[PayableService] getByMonth - Templates found:`, templates.map(t => ({ id: t.id, title: t.title, uid: t.uid })));
      
      // Garantir status para todos os templates (reset mensal automático)
      console.log(`[PayableService] getByMonth - Ensuring status for ${templates.length} templates in month ${monthKey}`);
      const statusPromises = templates.map(async template => {
        try {
          const status = await monthlyExpenseStatusRepository.ensureStatusForMonth(template.id, monthKey);
          console.log(`[PayableService] getByMonth - Ensured status for template ${template.id}:`, status?.id || 'created');
          return status;
        } catch (err) {
          console.error(`[PayableService] Error ensuring status for template ${template.id}:`, err);
          return null; // Retornar null em caso de erro para não quebrar o Promise.all
        }
      });
      await Promise.all(statusPromises);

      // Aguardar um pouco para garantir que os status foram salvos (principalmente para localStorage)
      // Isso é necessário porque localStorage é síncrono mas pode haver problemas de timing
      await new Promise(resolve => setTimeout(resolve, 10));

      // Buscar status do mês e filtrar apenas os que pertencem aos templates deste usuário
      const allStatuses = await monthlyExpenseStatusRepository.getByMonth(monthKey, 1000);
      const templateIds = new Set(templates.map(t => t.id));
      const statuses = allStatuses.filter(s => templateIds.has(s.templateId));
      
      console.log(`[PayableService] getByMonth - Found ${templates.length} templates, ${allStatuses.length} total statuses in month ${monthKey}, ${statuses.length} matching statuses for user templates`);
      console.log(`[PayableService] getByMonth - Template IDs:`, Array.from(templateIds));
      console.log(`[PayableService] getByMonth - Status template IDs:`, statuses.map(s => s.templateId));
      
      // Combinar templates com status
      const result = templates.map(template => {
        const status = statuses.find(s => s.templateId === template.id);
        console.log(`[PayableService] getByMonth - Template ${template.id} "${template.title}": status =`, status?.id ? `${status.status} (${status.id})` : 'NONE');
        const [year, month] = monthKey.split('-').map(Number);
        const day = template.dueDay || 10;
        let dueDate = new Date(year, month - 1, day);
        
        // Validar data
        if (isNaN(dueDate.getTime())) {
          console.error(`Invalid date for template ${template.id}:`, year, month, day);
          dueDate = new Date(year, month - 1, 10); // Fallback para dia 10
        }
        
        // Usar amountOverride do status se existir, senão usar o valor do template
        const amount = (status?.amountOverride !== undefined && status?.amountOverride !== null) 
          ? status.amountOverride 
          : (template.amount || 0);
        
        return {
          id: status?.id || null, // ID do status (para atualizações)
          templateId: template.id,
          title: template.title || '',
          amount: amount,
          amountOverride: status?.amountOverride, // Incluir para saber se foi sobrescrito
          dueDay: template.dueDay || 10,
          dueDate: dueDate.toISOString(),
          categoryId: template.categoryId || '',
          categoryName: template.categoryName || '',
          notes: template.notes || '',
          status: status?.status || 'open',
          paidAtISO: status?.paidAtISO || null,
          linkedTransactionId: status?.linkedTransactionId || null,
          monthKey,
        };
      });

      // Ordenar por dia de vencimento
      result.sort((a, b) => (a.dueDay || 10) - (b.dueDay || 10));

      return result;
    } catch (error) {
      console.error('Error in getByMonth:', error);
      throw error;
    }
  }

  /**
   * Obtém despesas próximas (próximos 15 dias)
   */
  async getUpcoming(days = 15, limit = 10, uid) {
    // Buscar templates ativos primeiro
    const templates = await monthlyExpenseTemplateRepository.getActive(uid, 1000);
    
    // Garantir status para o mês atual e próximo
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Zerar horas para comparação de data
    const currentMonthKey = getMonthKey(today);
    const nextMonthKey = getMonthKey(new Date(today.getFullYear(), today.getMonth() + 1, 1));
    
    // Calcular data limite (hoje + dias)
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + days);
    
    // Garantir status para todos os templates
    const statusPromises = templates.map(template => 
      Promise.all([
        monthlyExpenseStatusRepository.ensureStatusForMonth(template.id, currentMonthKey),
        monthlyExpenseStatusRepository.ensureStatusForMonth(template.id, nextMonthKey),
      ])
    );
    await Promise.all(statusPromises.flat());
    
    // Buscar statuses próximos
    const statuses = await monthlyExpenseStatusRepository.getUpcoming(days, limit * 2);
    
    // Combinar status com templates e filtrar por data
    const result = statuses.map(status => {
      const template = templates.find(t => t.id === status.templateId);
      if (!template) return null;
      
      const [year, month] = status.monthKey.split('-').map(Number);
      const day = template.dueDay || 10;
      const dueDate = new Date(year, month - 1, day);
      dueDate.setHours(0, 0, 0, 0);
      
      // Filtrar apenas despesas abertas com data futura (a partir de hoje)
      if (status.status !== 'open' || dueDate < today) {
        return null;
      }
      
      // Filtrar apenas despesas dentro do período (até hoje + dias)
      if (dueDate > futureDate) {
        return null;
      }
      
      return {
        id: status.id,
        templateId: template.id,
        title: template.title,
        amount: (status.amountOverride !== undefined && status.amountOverride !== null) 
          ? status.amountOverride 
          : (template.amount || 0),
        dueDate: dueDate.toISOString(),
        categoryName: template.categoryName,
        status: status.status,
        monthKey: status.monthKey,
      };
    }).filter(Boolean);
    
    // Ordenar por data de vencimento e limitar
    result.sort((a, b) => {
      const dateA = new Date(a.dueDate);
      const dateB = new Date(b.dueDate);
      return dateA - dateB;
    });
    
    return result.slice(0, limit);
  }

  /**
   * Marca despesa como paga no mês
   * Cria transação automática e atualiza saldo da conta bancária
   */
  async markAsPaid(statusId, monthKey, uid, accountId = null) {
    const status = await monthlyExpenseStatusRepository.getById(statusId);
    if (!status) {
      throw new Error('Status not found');
    }

    if (status.status === 'paid') {
      return status; // Já está pago
    }

    // Buscar template
    const template = await monthlyExpenseTemplateRepository.getById(status.templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    // Calcular data de vencimento
    const [year, month] = monthKey.split('-').map(Number);
    const day = template.dueDay || 10;
    const dueDate = new Date(year, month - 1, day);
    
    // Usar amountOverride se existir, senão usar o valor do template
    const amount = (status.amountOverride !== undefined && status.amountOverride !== null)
      ? status.amountOverride
      : (template.amount || 0);
    
    // Criar transação automática com accountId (transactionService.create() já atualiza o saldo)
    console.log('[PayableService] markAsPaid - Creating transaction:', {
      accountId: accountId,
      amount: amount,
      monthKey: monthKey,
      uid: uid
    });
    
    if (!accountId) {
      console.warn('[PayableService] markAsPaid - WARNING: No accountId provided! Balance will not be updated.');
    }
    
    const transaction = await transactionService.create({
      uid,
      type: 'expense',
      description: template.title,
      amount: -Math.abs(amount), // Negativo para despesa
      date: dueDate.toISOString(),
      monthKey,
      categoryId: template.categoryId || '',
      categoryName: template.categoryName || '',
      accountId: accountId, // Conta bancária para descontar
      autoCreated: true, // Marca como criada automaticamente
      linkedPayableStatusId: statusId, // Link para status
    });
    console.log('[PayableService] markAsPaid - Transaction created:', {
      id: transaction.id,
      accountId: transaction.accountId,
      amount: transaction.amount
    });

    // Atualizar status
    const updateData = {
      uid: uid, // Necessário para o update
      status: 'paid',
      paidAtISO: new Date().toISOString(),
      linkedTransactionId: transaction.id,
    };
    console.log('[PayableService] markAsPaid - Updating status with:', {
      statusId,
      uid: uid,
      hasUid: !!uid
    });
    return await monthlyExpenseStatusRepository.update(statusId, updateData);
  }

  /**
   * Marca despesa como não paga (open)
   * Remove transação automática se existir
   */
  async markAsOpen(statusId, monthKey, uid) {
    const status = await monthlyExpenseStatusRepository.getById(statusId);
    if (!status) {
      throw new Error('Status not found');
    }

    if (status.status === 'open') {
      return status; // Já está aberto
    }

    // Se tem transação vinculada, deletar (transactionService.delete() já recalcula o dashboard)
    if (status.linkedTransactionId) {
      try {
        const transaction = await transactionRepository.getById(status.linkedTransactionId);
        // Só deletar se foi criada automaticamente
        if (transaction?.autoCreated) {
          console.log('[PayableService] markAsOpen - Deleting linked transaction:', status.linkedTransactionId);
          // Usar transactionService para garantir recálculo do dashboard
          await transactionService.delete(status.linkedTransactionId);
          console.log('[PayableService] markAsOpen - Transaction deleted, dashboard should be recalculated');
        }
      } catch (error) {
        console.error('[PayableService] markAsOpen - Error deleting linked transaction:', error);
        // Mesmo com erro, tentar recalcular o resumo mensal
        if (monthKey) {
          await dashboardService.calculateMonthlySummary(monthKey).catch(err => {
            console.error('[PayableService] markAsOpen - Error recalculating monthly summary:', err);
          });
        }
      }
    } else {
      // Se não tinha transação vinculada, recalcular mesmo assim para garantir
      if (monthKey) {
        await dashboardService.calculateMonthlySummary(monthKey).catch(err => {
          console.error('[PayableService] markAsOpen - Error recalculating monthly summary:', err);
        });
      }
    }

    // Atualizar status
    const updateData = {
      uid: uid, // Necessário para o update
      status: 'open',
      paidAtISO: null,
      linkedTransactionId: null,
    };
    console.log('[PayableService] markAsOpen - Updating status with:', {
      statusId,
      uid: uid,
      hasUid: !!uid
    });
    return await monthlyExpenseStatusRepository.update(statusId, updateData);
  }

  /**
   * Toggle status paid/open
   */
  async toggleStatus(statusId, monthKey, uid) {
    const status = await monthlyExpenseStatusRepository.getById(statusId);
    if (!status) {
      throw new Error('Status not found');
    }

    if (status.status === 'paid') {
      // Quando desmarca, precisa passar monthKey e uid
      return await this.markAsOpen(statusId, monthKey, uid);
    } else {
      return await this.markAsPaid(statusId, monthKey, uid, accountId);
    }
  }

  /**
   * Atualiza o valor da despesa para o mês específico
   * Sobrescreve o valor do template apenas para este mês
   */
  async updateAmount(statusId, newAmount, monthKey, uid) {
    if (!statusId) {
      throw new Error('Status ID is required');
    }
    
    const status = await monthlyExpenseStatusRepository.getById(statusId);
    if (!status) {
      throw new Error('Status not found');
    }

    const amount = parseFloat(newAmount);
    if (isNaN(amount) || amount < 0) {
      throw new Error('Valor inválido');
    }

    // Atualizar status com amountOverride
    const updatedStatus = await monthlyExpenseStatusRepository.update(statusId, {
      amountOverride: amount,
      uid, // Necessário para o update
    });

    // Se a despesa já está paga e tem transação vinculada, atualizar a transação também
    if (status.status === 'paid' && status.linkedTransactionId) {
      try {
        const transaction = await transactionRepository.getById(status.linkedTransactionId);
        if (transaction && transaction.autoCreated) {
          // Atualizar valor da transação (usar valor negativo para despesa)
          await transactionRepository.update(status.linkedTransactionId, {
            amount: -Math.abs(amount),
            uid,
          });
        }
      } catch (error) {
        console.warn('Error updating linked transaction:', error);
        // Não falhar se não conseguir atualizar a transação
      }
    }

    return updatedStatus;
  }

  /**
   * Gera despesas mensais a partir de contas recorrentes (legado)
   * Cria templates a partir de recurring bills
   */
  async generateFromRecurringBills(monthKey, uid) {
    // Este método mantém compatibilidade com o sistema antigo
    // Por enquanto, não faz nada (templates devem ser criados manualmente)
    // TODO: Implementar migração de recurring bills para templates se necessário
    return [];
  }
}

export const payableService = new PayableService();
