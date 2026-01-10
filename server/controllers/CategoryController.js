import express from 'express';
import { storage } from '../data/Storage.js';

const router = express.Router();

/**
 * POST /api/categories
 * Cria nova categoria
 */
router.post('/', async (req, res, next) => {
  try {
    const category = await storage.create('categories', req.body);
    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/categories
 * Lista todas as categorias
 */
router.get('/', async (req, res, next) => {
  try {
    const categories = await storage.findAll('categories');
    res.json(categories);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/categories/:id
 * Obtém categoria por ID
 */
router.get('/:id', async (req, res, next) => {
  try {
    const category = await storage.findById('categories', req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }
    res.json(category);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/categories/:id
 * Atualiza categoria
 */
router.put('/:id', async (req, res, next) => {
  try {
    const category = await storage.update('categories', req.params.id, req.body);
    res.json(category);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/categories/:id
 * Deleta categoria
 */
router.delete('/:id', async (req, res, next) => {
  try {
    await storage.delete('categories', req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export const CategoryController = router;
