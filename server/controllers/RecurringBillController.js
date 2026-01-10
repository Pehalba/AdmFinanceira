import express from 'express';
import { storage } from '../data/Storage.js';

const router = express.Router();

/**
 * POST /api/recurring-bills
 * Cria nova conta recorrente
 */
router.post('/', async (req, res, next) => {
  try {
    const bill = await storage.create('recurring_bills', req.body);
    res.status(201).json(bill);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/recurring-bills
 * Lista contas recorrentes ativas (opcional limit)
 */
router.get('/', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const allBills = await storage.findAll('recurring_bills');
    const activeBills = allBills.filter(b => b.active !== false).slice(0, limit);
    res.json(activeBills);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/recurring-bills/:id
 * Obtém conta recorrente por ID
 */
router.get('/:id', async (req, res, next) => {
  try {
    const bill = await storage.findById('recurring_bills', req.params.id);
    if (!bill) {
      return res.status(404).json({ error: 'Conta recorrente não encontrada' });
    }
    res.json(bill);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/recurring-bills/:id
 * Atualiza conta recorrente
 */
router.put('/:id', async (req, res, next) => {
  try {
    const bill = await storage.update('recurring_bills', req.params.id, req.body);
    res.json(bill);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/recurring-bills/:id
 * Deleta conta recorrente
 */
router.delete('/:id', async (req, res, next) => {
  try {
    await storage.delete('recurring_bills', req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export const RecurringBillController = router;
