import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../blocks/Button/Button';
import { Input } from '../../blocks/Input/Input';
import { Card } from '../../blocks/Card/Card';
import { authService } from '../../scripts/services/authService';
import './Login.css';

export function Login({ onLogin }) {
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('[Login] Starting', isSignup ? 'signup' : 'login', 'for:', email);
      if (isSignup) {
        const result = await authService.signup(email, password);
        console.log('[Login] Signup successful:', result);
        // Dados já estão no cache do signup (no authService)
        if (onLogin) {
          // Se for HTTP, retorna { user, defaultAccount, defaultCategories }
          // Se for Fake, retorna o mesmo formato
          const user = result.user || result;
          console.log('[Login] Calling onLogin with user:', user);
          onLogin(user);
        }
      } else {
        const user = await authService.login(email, password);
        console.log('[Login] Login successful:', user);
        if (onLogin) {
          onLogin(user);
        }
      }
      navigate('/');
    } catch (err) {
      console.error('[Login] Error:', err);
      console.error('[Login] Error message:', err.message);
      console.error('[Login] Error stack:', err.stack);
      setError(err.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login">
      <Card className="login__card">
        <h1 className="login__title">
          {isSignup ? 'Criar Conta' : 'Entrar'}
        </h1>
        <p className="login__subtitle">
          {isSignup
            ? 'Gerencie suas finanças pessoais de forma simples'
            : 'Acesse sua conta'}
        </p>

        <form onSubmit={handleSubmit} className="login__form">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />

          <Input
            label="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />

          {error && <div className="login__error">{error}</div>}

          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="login__button"
          >
            {loading ? 'Carregando...' : isSignup ? 'Criar Conta' : 'Entrar'}
          </Button>

          <button
            type="button"
            onClick={() => {
              setIsSignup(!isSignup);
              setError('');
            }}
            className="login__toggle"
            disabled={loading}
          >
            {isSignup
              ? 'Já tem uma conta? Entre aqui'
              : 'Não tem conta? Cadastre-se'}
          </button>
        </form>
      </Card>
    </div>
  );
}
