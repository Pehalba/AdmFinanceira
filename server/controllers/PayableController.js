import express from 'express';
import { storage } from '../data/Storage.js';

const router = express.Router();

// Helper para getMonthKey
function getMonthKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * POST /api/payables
 * Cria nova despesa mensal
 */
router.post('/', async (req, res, next) => {
  try {
    const payable = await storage.create('payables', req.body);
    res.status(201).json(payable);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/payables
 * Lista despesas mensais (filtrado por monthKey ou upcoming)
 */
router.get('/', async (req, res, next) => {
  try {
    const { monthKey, limit = 100, recurringBillId } = req.query;
    let payables = await storage.findAll('payables');

    // Filtrar por monthKey se fornecido
    if (monthKey) {
      payables = payables.filter(p => p.monthKey === monthKey);
      
      // Se também tem recurringBillId, buscar específico
      if (recurringBillId) {
        payables = payables.filter(p => p.recurringBillId === recurringBillId);
      }
      
      // Ordenar por vencimento
      payables.sort((a, b) => {
        const dateA = new Date(a.dueDate || a.createdAt);
        const dateB = new Date(b.dueDate || b.createdAt);
        return dateA - dateB;
      });
      
      payables = payables.slice(0, parseInt(limit));
    }

    res.json(payables);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/payables/upcoming
 * Lista despesas próximas (próximos 15 dias)
 */
router.get('/upcoming', async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 15;
    const limit = parseInt(req.query.limit) || 10;
    
    const payables = await storage.findAll('payables');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + days);
    
    let filtered = payables.filter(p => {
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
    
    res.json(filtered.slice(0, limit));
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/payables/:id
 * Obtém despesa mensal por ID
 */
router.get('/:id', async (req, res, next) => {
  try {
    const payable = await storage.findById('payables', req.params.id);
    if (!payable) {
      return res.status(404).json({ error: 'Despesa mensal não encontrada' });
    }
    res.json(payable);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/payables/:id
 * Atualiza despesa mensal
 */
router.put('/:id', async (req, res, next) => {
  try {
    const existing = await storage.findById('payables', req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Despesa mensal não encontrada' });
    }

    const updates = { ...req.body };
    
    // Se mudou status para paid, adicionar paidAtISO
    if (updates.status === 'paid' && existing.status !== 'paid') {
      updates.paidAtISO = new Date().toISOString();
    }
    // Se mudou de paid para open, remover paidAtISO
    if (updates.status === 'open' && existing.status === 'paid') {
      updates.paidAtISO = null;
    }

    const payable = await storage.update('payables', req.params.id, updates);
    res.json(payable);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/payables/:id
 * Deleta despesa mensal
 */
router.delete('/:id', async (req, res, next) => {
  try {
    await storage.delete('payables', req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/payables/generate
 * Gera despesas mensais a partir de contas recorrentes
 */
router.post('/generate', async (req, res, next) => {
  try {
    const { monthKey } = req.body;
    if (!monthKey) {
      return res.status(400).json({ error: 'monthKey é obrigatório' });
    }

    // Buscar contas recorrentes ativas
    const allBills = await storage.findAll('recurring_bills');
    const activeBills = allBills.filter(b => b.active !== false);
    
    // Buscar despesas existentes do mês
    const existingPayables = await storage.find('payables', (p) => p.monthKey === monthKey);
    
    const created = [];
    
    for (const bill of activeBills) {
      // Verificar se já existe para este mês (chave: recurringBillId + monthKey)
      const exists = existingPayables.find(
        p => p.recurringBillId === bill.id && p.monthKey === monthKey
      );
      
      if (exists) {
        continue; // Não duplicar
      }

      // Buscar bank e category para denormalizar
      const [bank, category] = await Promise.all([
        storage.findById('accounts', bill.accountId || bill.bankId),
        storage.findById('categories', bill.categoryId),
      ]);

      // Calcular dueDate (usar dueDay do recurringBill ou dia 1 do mês)
      const [year, month] = monthKey.split('-').map(Number);
      const day = bill.dueDay || bill.day || 1;
      const dueDate = new Date(year, month - 1, day);

      const payable = await storage.create('payables', {
        recurringBillId: bill.id,
        monthKey,
        title: bill.name,
        amount: bill.amount,
        dueDate: dueDate.toISOString(),
        accountId: bill.accountId || bill.bankId,
        categoryId: bill.categoryId,
        bankName: bank?.name || '',
        categoryName: category?.name || '',
        notes: bill.description || '',
        status: 'open',
      });

      created.push(payable);
    }

    res.status(201).json({ created: created.length, payables: created });
  } catch (error) {
    next(error);
  }
});

export const PayableController = router;
