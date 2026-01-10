import express from 'express';
import { storage } from '../data/Storage.js';

const router = express.Router();

/**
 * GET /api/monthly-summaries/:monthKey
 * Obtém resumo mensal
 */
router.get('/:monthKey', async (req, res, next) => {
  try {
    const summaries = await storage.find('monthly_summaries', (s) => s.monthKey === req.params.monthKey);
    if (summaries.length === 0) {
      return res.json(null);
    }
    res.json(summaries[0]);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/monthly-summaries
 * Cria ou atualiza resumo mensal (upsert)
 */
router.post('/', async (req, res, next) => {
  try {
    const { monthKey, ...summaryData } = req.body;
    
    if (!monthKey) {
      return res.status(400).json({ error: 'monthKey é obrigatório' });
    }

    const summaries = await storage.find('monthly_summaries', (s) => s.monthKey === monthKey);
    
    if (summaries.length > 0) {
      // Atualizar existente
      const updated = await storage.update('monthly_summaries', summaries[0].id, {
        monthKey,
        ...summaryData,
      });
      res.json(updated);
    } else {
      // Criar novo
      const created = await storage.create('monthly_summaries', {
        monthKey,
        ...summaryData,
      });
      res.status(201).json(created);
    }
  } catch (error) {
    next(error);
  }
});

export const MonthlySummaryController = router;
