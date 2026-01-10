import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";

export function Navbar({ user, onLogout }) {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar__container">
        <Link to="/" className="navbar__logo">
          Financeiro
        </Link>
        {user && (
          <>
            <div className="navbar__links">
              <Link
                to="/"
                className={`navbar__link ${
                  isActive("/") ? "navbar__link--active" : ""
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/transactions"
                className={`navbar__link ${
                  isActive("/transactions") ? "navbar__link--active" : ""
                }`}
              >
                Transações
              </Link>
              <Link
                to="/banks"
                className={`navbar__link ${
                  isActive("/banks") ? "navbar__link--active" : ""
                }`}
              >
                Bancos
              </Link>
              <Link
                to="/categories"
                className={`navbar__link ${
                  isActive("/categories") ? "navbar__link--active" : ""
                }`}
              >
                Categorias
              </Link>
              <Link
                to="/monthly-bills"
                className={`navbar__link ${
                  isActive("/monthly-bills") ? "navbar__link--active" : ""
                }`}
              >
                Despesas Mensais
              </Link>
            </div>
            <div className="navbar__user">
              <span className="navbar__email">{user.email}</span>
              <button className="navbar__logout" onClick={onLogout}>
                Sair
              </button>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}
