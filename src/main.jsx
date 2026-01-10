import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app/App.jsx'
import ErrorBoundary from './app/ErrorBoundary.jsx'
import './index.css'

// Adicionar tratamento de erros globais
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

try {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>,
  );
} catch (error) {
  console.error('Failed to render app:', error);
  document.getElementById('root').innerHTML = `
    <div style="padding: 2rem; font-family: system-ui, sans-serif;">
      <h1 style="color: #d32f2f;">Erro ao inicializar a aplicação</h1>
      <p>Erro: ${error.message}</p>
      <button onclick="window.location.reload()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #1976d2; color: white; border: none; border-radius: 4px; cursor: pointer;">
        Recarregar página
      </button>
    </div>
  `;
}
