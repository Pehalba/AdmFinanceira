import express from 'express';
import { storage } from '../data/Storage.js';

const router = express.Router();

/**
 * POST /api/transactions
 * Cria nova transação
 */
router.post('/', async (req, res, next) => {
  try {
    const transaction = await storage.create('transactions', req.body);
    res.status(201).json(transaction);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/transactions
 * Lista transações (filtrado por monthKey ou recentes)
 */
router.get('/', async (req, res, next) => {
  try {
    const { monthKey, limit = 50, startAfter } = req.query;
    let transactions = await storage.findAll('transactions');

    // Filtrar por monthKey se fornecido
    if (monthKey) {
      transactions = transactions.filter((t) => t.monthKey === monthKey);
      transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      // Paginação
      if (startAfter) {
        const startIndex = transactions.findIndex((t) => t.id === startAfter);
        transactions = transactions.slice(startIndex + 1);
      }
      
      transactions = transactions.slice(0, parseInt(limit));
    } else {
      // Transações recentes
      transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
      transactions = transactions.slice(0, parseInt(limit));
    }

    res.json(transactions);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/transactions/:id
 * Obtém transação por ID
 */
router.get('/:id', async (req, res, next) => {
  try {
    const transaction = await storage.findById('transactions', req.params.id);
    if (!transaction) {
      return res.status(404).json({ error: 'Transação não encontrada' });
    }
    res.json(transaction);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/transactions/:id
 * Atualiza transação
 */
router.put('/:id', async (req, res, next) => {
  try {
    const transaction = await storage.update('transactions', req.params.id, req.body);
    res.json(transaction);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/transactions/:id
 * Deleta transação
 */
router.delete('/:id', async (req, res, next) => {
  try {
    await storage.delete('transactions', req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export const TransactionController = router;
