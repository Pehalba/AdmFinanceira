import { useEffect } from 'react';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import { AuthProvider } from './providers';
import { AppRoutes } from './routes';
import './App.css';

// Componente para lidar com redirect do 404.html
function RedirectHandler() {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Verificar se há redirect salvo do 404.html
    const savedRedirect = sessionStorage.getItem('githubPagesRedirect');
    if (savedRedirect) {
      sessionStorage.removeItem('githubPagesRedirect');
      // Navegar para a rota correta
      navigate(savedRedirect, { replace: true });
    }
  }, [navigate]);
  
  return null;
}

// Detectar base path para GitHub Pages
// Se estiver em produção e a URL tiver o nome do repositório, usar como basename
function getBasename() {
  // No GitHub Pages, a URL será: https://usuario.github.io/repositorio/
  const pathname = window.location.pathname;
  const hostname = window.location.hostname;
  
  // Se estiver em github.io, detectar o nome do repositório
  if (hostname.includes('github.io')) {
    const pathParts = pathname.split('/').filter(Boolean);
    
    // O primeiro elemento é o nome do repositório
    // Ex: /financeiro/ -> basename = '/financeiro'
    if (pathParts.length > 0) {
      const possibleRepoName = pathParts[0];
      // Verificar se não é um arquivo (sem extensão) e não é 'index.html'
      if (possibleRepoName && !possibleRepoName.includes('.') && possibleRepoName !== 'index.html') {
        return `/${possibleRepoName}`;
      }
    }
  }
  
  // Para desenvolvimento local ou domínio customizado
  return '/';
}

function App() {
  const basename = getBasename();
  
  return (
    <BrowserRouter basename={basename}>
      <RedirectHandler />
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
