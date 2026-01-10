import express from 'express';
import { storage } from '../data/Storage.js';

const router = express.Router();

/**
 * POST /api/accounts
 * Cria nova conta
 */
router.post('/', async (req, res, next) => {
  try {
    const account = await storage.create('accounts', req.body);
    res.status(201).json(account);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/accounts
 * Lista todas as contas
 */
router.get('/', async (req, res, next) => {
  try {
    const accounts = await storage.findAll('accounts');
    res.json(accounts);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/accounts/:id
 * Obtém conta por ID
 */
router.get('/:id', async (req, res, next) => {
  try {
    const account = await storage.findById('accounts', req.params.id);
    if (!account) {
      return res.status(404).json({ error: 'Conta não encontrada' });
    }
    res.json(account);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/accounts/:id
 * Atualiza conta
 */
router.put('/:id', async (req, res, next) => {
  try {
    const account = await storage.update('accounts', req.params.id, req.body);
    res.json(account);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/accounts/:id
 * Deleta conta
 */
router.delete('/:id', async (req, res, next) => {
  try {
    await storage.delete('accounts', req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export const AccountController = router;
