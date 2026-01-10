import express from 'express';
import { storage } from '../data/Storage.js';

const router = express.Router();

/**
 * GET /api/users/:uid/meta/app
 * Obtém meta do app do usuário
 */
router.get('/:uid/meta/app', async (req, res, next) => {
  try {
    const { uid } = req.params;
    const metaDocs = await storage.find('user_meta', (m) => m.uid === uid && m.type === 'app');
    
    if (metaDocs.length === 0) {
      return res.json(null);
    }
    
    res.json(metaDocs[0].data);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/users/:uid/meta/app
 * Atualiza meta do app do usuário (upsert)
 */
router.put('/:uid/meta/app', async (req, res, next) => {
  try {
    const { uid } = req.params;
    const metaDocs = await storage.find('user_meta', (m) => m.uid === uid && m.type === 'app');
    
    if (metaDocs.length > 0) {
      // Atualizar existente
      const updated = await storage.update('user_meta', metaDocs[0].id, {
        uid,
        type: 'app',
        data: {
          ...metaDocs[0].data,
          ...req.body,
        },
      });
      res.json(updated.data);
    } else {
      // Criar novo
      const created = await storage.create('user_meta', {
        uid,
        type: 'app',
        data: req.body,
      });
      res.status(201).json(created.data);
    }
  } catch (error) {
    next(error);
  }
});

export const UserMetaController = router;
