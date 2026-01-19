import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../scripts/services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const initializeAuth = async () => {
      try {
        console.log('[AuthProvider] Starting initialization...');
        
        // Inicializar o authService primeiro
        // O init() agora aguarda o primeiro callback do Firebase Auth
        await authService.init();
        
        if (!isMounted) return;
        
        // Buscar usuário atual (deve estar restaurado pelo init)
        let currentUser = authService.getCurrentUser();
        
        // Se getCurrentUser retornou uma Promise (caso raro), aguardar
        if (currentUser && typeof currentUser.then === 'function') {
          currentUser = await currentUser;
        }
        
        if (!isMounted) return;
        
        console.log('[AuthProvider] Initialized, current user from authService:', currentUser?.uid || 'null');
        
        if (currentUser && currentUser.uid) {
          setUser(currentUser);
          console.log('[AuthProvider] User set in state:', currentUser.uid);
        } else {
          setUser(null);
          console.log('[AuthProvider] No user found, state set to null');
        }
      } catch (error) {
        console.error('[AuthProvider] Error initializing auth:', error);
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          console.log('[AuthProvider] Initialization complete, loading set to false');
        }
      }
    };

    initializeAuth();
    
    // Cleanup
    return () => {
      isMounted = false;
    };
  }, []);
  
  // Escutar mudanças no authService em um useEffect separado
  // Isso garante que se o Firebase Auth detectar uma mudança depois da inicialização,
  // o estado do React será atualizado
  useEffect(() => {
    let isMounted = true;
    let lastUserId = user?.uid || null;
    
    const checkUserInterval = setInterval(() => {
      if (!isMounted) {
        clearInterval(checkUserInterval);
        return;
      }
      
      const currentUser = authService.getCurrentUser();
      const currentUserId = currentUser?.uid || null;
      
      if (currentUserId !== lastUserId) {
        console.log('[AuthProvider] User changed detected, updating state');
        lastUserId = currentUserId;
        setUser(currentUser);
      }
    }, 1000); // Verificar a cada segundo
    
    return () => {
      isMounted = false;
      clearInterval(checkUserInterval);
    };
  }, [user?.uid]);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('Error during logout:', error);
      setUser(null); // Força limpeza mesmo em caso de erro
    }
  };

  const value = {
    user,
    loading,
    onLogin: handleLogin,
    onLogout: handleLogout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
