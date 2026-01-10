import { Routes, Route, Navigate } from 'react-router-dom';
import { Login } from '../pages/Login/Login';
import { Dashboard } from '../pages/Dashboard/Dashboard';
import { Transactions } from '../pages/Transactions/Transactions';
import { Banks } from '../pages/Banks/Banks';
import { Categories } from '../pages/Categories/Categories';
import { MonthlyBills } from '../pages/MonthlyBills/MonthlyBills';
import { useAuth } from './providers';
import { Navbar } from '../blocks/Navbar/Navbar';

function ProtectedRoute({ children, user, onLogout }) {
  const { user: authUser, loading } = useAuth();

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!authUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <Navbar user={authUser} onLogout={onLogout} />
      {children}
    </>
  );
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export function AppRoutes() {
  const { user, onLogin, onLogout } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login onLogin={onLogin} />
          </PublicRoute>
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute user={user} onLogout={onLogout}>
            <Dashboard user={user} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/transactions"
        element={
          <ProtectedRoute user={user} onLogout={onLogout}>
            <Transactions user={user} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/banks"
        element={
          <ProtectedRoute user={user} onLogout={onLogout}>
            <Banks user={user} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/categories"
        element={
          <ProtectedRoute user={user} onLogout={onLogout}>
            <Categories user={user} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/monthly-bills"
        element={
          <ProtectedRoute user={user} onLogout={onLogout}>
            <MonthlyBills user={user} />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
