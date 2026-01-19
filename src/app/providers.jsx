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
        await authService.init();
        
        // Aguardar um pouco para garantir que o listener foi configurado e usuário foi restaurado
        // Firebase Auth pode demorar um pouco para restaurar a sessão
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (!isMounted) return;
        
        // Buscar usuário atual (deve estar restaurado pelo init)
        let currentUser = authService.getCurrentUser();
        
        // Se getCurrentUser retornou uma Promise (caso raro), aguardar
        if (currentUser && typeof currentUser.then === 'function') {
          currentUser = await currentUser;
        }
        
        if (!isMounted) return;
        
        console.log('[AuthProvider] Initialized, current user from authService:', currentUser?.uid || 'null');
        
        // Se ainda não tem usuário, tentar buscar direto do localStorage como fallback
        if (!currentUser || !currentUser.uid) {
          console.log('[AuthProvider] No user from authService, trying localStorage fallback...');
          if (typeof Storage !== 'undefined') {
            try {
              const stored = localStorage.getItem('financeiro_current_user');
              if (stored && stored !== 'null' && stored !== 'undefined') {
                currentUser = JSON.parse(stored);
                console.log('[AuthProvider] Found user in localStorage fallback:', currentUser?.uid || 'null');
                // Atualizar no authService também
                if (currentUser && currentUser.uid) {
                  authService.currentUser = currentUser;
                }
              }
            } catch (error) {
              console.error('[AuthProvider] Error reading from localStorage fallback:', error);
            }
          }
        }
        
        if (!isMounted) return;
        
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
