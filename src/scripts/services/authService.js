import { authRepository, userMetaRepository } from '../repositories/index.js';
import { cacheManager } from '../cache/cacheManager.js';
import { isValidEmail, isValidPassword } from '../utils/validationUtils.js';
import { accountService } from './accountService.js';
import { categoryService } from './categoryService.js';

/**
 * Serviço de autenticação
 */
class AuthService {
  constructor() {
    this.currentUser = null;
    this.unsubscribe = null;
  }

  /**
   * Inicializa listener de autenticação
   */
  async init() {
    if (this.unsubscribe) {
      console.log('[AuthService] init - Already initialized, skipping');
      return;
    }
    
    console.log('[AuthService] init - Starting initialization...');
    
    // Primeiro, tentar restaurar o usuário atual do localStorage/repositório
    // getCurrentUser pode ser async no FakeRepository, mas vamos chamar como sync primeiro
    let storedUser = null;
    try {
      storedUser = authRepository.getCurrentUser();
      // Se getCurrentUser retornou uma Promise, aguardar
      if (storedUser && typeof storedUser.then === 'function') {
        storedUser = await storedUser;
      }
      
      if (storedUser && storedUser.uid) {
        this.currentUser = storedUser;
        console.log('[AuthService] init - Restored user from storage:', storedUser.uid, 'email:', storedUser.email);
      } else {
        console.log('[AuthService] init - No valid user found in storage. storedUser:', storedUser);
        if (storedUser) {
          console.log('[AuthService] init - storedUser keys:', Object.keys(storedUser));
          console.log('[AuthService] init - storedUser.uid:', storedUser.uid);
        }
      }
    } catch (error) {
      console.error('[AuthService] init - Error restoring user:', error);
    }
    
    // Configurar listener para mudanças futuras
    this.unsubscribe = await authRepository.onAuthStateChanged((user) => {
      console.log('[AuthService] onAuthStateChanged - User changed:', user?.uid || 'null');
      this.currentUser = user;
      if (!user || !user.uid) {
        cacheManager.clear();
        // Limpar também do localStorage quando deslogar
        if (typeof Storage !== 'undefined') {
          localStorage.removeItem('financeiro_current_user');
        }
      } else {
        // Salvar no localStorage quando logar (ambas as chaves para compatibilidade)
        if (typeof Storage !== 'undefined') {
          try {
            const userJson = JSON.stringify(user);
            localStorage.setItem('financeiro_current_user', userJson);
            console.log('[AuthService] onAuthStateChanged - User saved to localStorage');
          } catch (e) {
            console.error('[AuthService] onAuthStateChanged - Error saving user:', e);
          }
        }
      }
    });
    
    // Se ainda não tinha usuário restaurado, verificar novamente após configurar o listener
    if (!this.currentUser || !this.currentUser.uid) {
      try {
        let user = authRepository.getCurrentUser();
        if (user && typeof user.then === 'function') {
          user = await user;
        }
        if (user && user.uid) {
          this.currentUser = user;
          console.log('[AuthService] init - Restored user after listener setup:', user.uid);
        }
      } catch (error) {
        console.error('[AuthService] init - Error in second restore attempt:', error);
      }
    }
    
    console.log('[AuthService] init - Initialization complete, current user:', this.currentUser?.uid || 'null');
  }

  /**
   * Cleanup ao desmontar
   */
  cleanup() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }

  /**
   * Cadastro de novo usuário
   * Retorna dados provisionados (account padrão + categorias padrão)
   * SEM fazer releitura - os dados são retornados diretamente
   */
  async signup(email, password, userData = {}) {
    if (!isValidEmail(email)) {
      throw new Error('Email inválido');
    }
    if (!isValidPassword(password)) {
      throw new Error('Senha deve ter no mínimo 6 caracteres');
    }

    try {
      // Criar usuário (HTTP já retorna dados provisionados, Fake precisa provisionar)
      const result = await authRepository.signup(email, password, userData);

      // Se já retornou dados provisionados (HTTP), usar direto
      // Se não (Fake), provisionar localmente
      if (result.defaultAccount && result.defaultCategories) {
        // HTTP Repository - dados já vêm do servidor
        this.currentUser = result.user;
        
        // Salvar no localStorage para HTTP
        if (this.currentUser && typeof Storage !== 'undefined') {
          localStorage.setItem('financeiro_current_user', JSON.stringify(this.currentUser));
        }
        
        const version = Date.now();
        cacheManager.saveAccounts([result.defaultAccount], version);
        cacheManager.saveCategories(result.defaultCategories, version);
        return result;
      } else {
        // Fake Repository - precisa provisionar localmente
        const user = result.user || result;
        this.currentUser = user;
        
        const { defaultAccount, defaultCategories } = await this.provisionInitialData(user.uid);

        // Salvar no cache local imediatamente
        const version = Date.now();
        cacheManager.saveAccounts([defaultAccount], version);
        cacheManager.saveCategories(defaultCategories, version);

        // Retornar dados criados
        return {
          user,
          defaultAccount,
          defaultCategories,
        };
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Login
   */
  async login(email, password) {
    if (!isValidEmail(email)) {
      throw new Error('Email inválido');
    }

    try {
      const user = await authRepository.login(email, password);
      this.currentUser = user;
      
      // Salvar no localStorage para HTTP
      if (user && typeof Storage !== 'undefined') {
        localStorage.setItem('financeiro_current_user', JSON.stringify(user));
      }
      
      return user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Logout
   */
  async logout() {
    await authRepository.logout();
    this.currentUser = null;
    cacheManager.clear();
    
    // Limpar também do localStorage (caso esteja usando HTTP)
    if (typeof Storage !== 'undefined') {
      localStorage.removeItem('financeiro_current_user');
    }
  }

  /**
   * Obtém usuário atual
   */
  getCurrentUser() {
    // Primeiro verifica se está na memória
    if (this.currentUser && this.currentUser.uid) {
      console.log('[AuthService] getCurrentUser - Returning from memory:', this.currentUser.uid);
      return this.currentUser;
    }
    
    // Depois tenta buscar do repositório (localStorage para Fake/HTTP)
    // getCurrentUser pode ser síncrono (Fake) ou async (HTTP), mas vamos tratar como síncrono primeiro
    let user = null;
    try {
      user = authRepository.getCurrentUser();
      // Se retornou Promise, não aguardar aqui (deve ser tratado pelo caller)
      if (user && typeof user.then === 'function') {
        console.warn('[AuthService] getCurrentUser - Repository returned Promise, this should not happen with Fake');
        return null; // Retornar null e deixar o caller aguardar
      }
      
      if (user && user.uid) {
        // Atualizar na memória também
        this.currentUser = user;
        console.log('[AuthService] getCurrentUser - Found in repository, returning:', user.uid);
        return user;
      }
    } catch (error) {
      console.error('[AuthService] getCurrentUser - Error from repository:', error);
    }
    
    // Por último, tenta buscar direto do localStorage (fallback)
    if (typeof Storage !== 'undefined') {
      try {
        // Tentar ambas as chaves
        let stored = localStorage.getItem('financeiro_current_user');
        if (!stored) {
          stored = localStorage.getItem('financeiro_current_user');
        }
        
        if (stored && stored !== 'null' && stored !== 'undefined') {
          const parsedUser = JSON.parse(stored);
          if (parsedUser && parsedUser.uid) {
            this.currentUser = parsedUser;
            console.log('[AuthService] getCurrentUser - Found in localStorage fallback, returning:', parsedUser.uid);
            return parsedUser;
          }
        }
      } catch (error) {
        console.error('[AuthService] getCurrentUser - Error reading from localStorage:', error);
      }
    }
    
    console.log('[AuthService] getCurrentUser - No user found, returning null');
    return null;
  }

  /**
   * Provisiona dados iniciais do usuário
   * Retorna dados criados diretamente (sem releitura)
   */
  async provisionInitialData(uid) {
    // Criar conta padrão
    const defaultAccount = await accountService.create({
      name: 'Conta Principal',
      type: 'checking',
      balance: 0,
      uid,
    });

    // Criar categorias padrão
    const defaultCategories = await Promise.all([
      categoryService.create({
        name: 'Alimentação',
        type: 'expense',
        color: '#FF6B6B',
        uid,
      }),
      categoryService.create({
        name: 'Transporte',
        type: 'expense',
        color: '#4ECDC4',
        uid,
      }),
      categoryService.create({
        name: 'Moradia',
        type: 'expense',
        color: '#45B7D1',
        uid,
      }),
      categoryService.create({
        name: 'Salário',
        type: 'income',
        color: '#96CEB4',
        uid,
      }),
      categoryService.create({
        name: 'Outros',
        type: 'expense',
        color: '#FFEAA7',
        uid,
      }),
    ]);

    return {
      defaultAccount,
      defaultCategories,
    };
  }

  /**
   * Verifica meta do usuário e atualiza cache se necessário
   * Retorna { shouldLoadAccounts, shouldLoadCategories }
   */
  async checkAndUpdateCache(uid) {
    // Ler apenas meta/app (1 leitura)
    const appMeta = await userMetaRepository.getAppMeta(uid);
    
    if (!appMeta) {
      // Se não existe meta, precisa carregar tudo
      return { shouldLoadAccounts: true, shouldLoadCategories: true };
    }

    const accountsVersion = appMeta.accountsVersion || 0;
    const categoriesVersion = appMeta.categoriesVersion || 0;

    // Verificar cache
    const shouldLoadAccounts = !cacheManager.isAccountsCacheValid(accountsVersion);
    const shouldLoadCategories = !cacheManager.isCategoriesCacheValid(categoriesVersion);

    return { shouldLoadAccounts, shouldLoadCategories };
  }
}

export const authService = new AuthService();
