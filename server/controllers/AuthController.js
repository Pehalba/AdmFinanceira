import express from 'express';
import { storage } from '../data/Storage.js';

const router = express.Router();

/**
 * POST /api/auth/signup
 * Cria novo usuário e provisiona dados iniciais (sem releitura)
 */
router.post('/signup', async (req, res, next) => {
  try {
    const { email, password, ...userData } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    // Verificar se email já existe
    const users = await storage.find('users', (u) => u.email === email);
    if (users.length > 0) {
      return res.status(400).json({ error: 'Email já está em uso' });
    }

    const uid = storage.generateId();

    // Criar usuário
    const user = await storage.create('users', {
      email,
      password, // Em produção, usar bcrypt
      ...userData,
      uid,
    });

    // Provisionar dados iniciais (sem releitura - retornar dados criados)
    const defaultAccount = await storage.create('accounts', {
      name: 'Conta Principal',
      type: 'checking',
      balance: 0,
      uid,
    });

    const defaultCategories = await Promise.all([
      storage.create('categories', {
        name: 'Alimentação',
        type: 'expense',
        color: '#FF6B6B',
        uid,
      }),
      storage.create('categories', {
        name: 'Transporte',
        type: 'expense',
        color: '#4ECDC4',
        uid,
      }),
      storage.create('categories', {
        name: 'Moradia',
        type: 'expense',
        color: '#45B7D1',
        uid,
      }),
      storage.create('categories', {
        name: 'Salário',
        type: 'income',
        color: '#96CEB4',
        uid,
      }),
      storage.create('categories', {
        name: 'Outros',
        type: 'expense',
        color: '#FFEAA7',
        uid,
      }),
    ]);

    // Remover senha da resposta
    const { password: _, ...userResponse } = user;

    // Retornar usuário + dados provisionados
    res.status(201).json({
      user: userResponse,
      defaultAccount,
      defaultCategories,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/login
 * Faz login
 */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    // Buscar usuário
    const users = await storage.find('users', (u) => u.email === email);
    if (users.length === 0 || users[0].password !== password) {
      return res.status(401).json({ error: 'Email ou senha inválidos' });
    }

    const user = users[0];
    const { password: _, ...userResponse } = user;

    res.json(userResponse);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/auth/current
 * Obtém usuário atual (mock - em produção usar JWT)
 */
router.get('/current', async (req, res, next) => {
  try {
    const { uid } = req.query;
    if (!uid) {
      return res.status(400).json({ error: 'UID é obrigatório' });
    }

    const user = await storage.findById('users', uid);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const { password: _, ...userResponse } = user;
    res.json(userResponse);
  } catch (error) {
    next(error);
  }
});

export const AuthController = router;
