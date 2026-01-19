import { Link, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import "./Navbar.css";

export function Navbar({ user, onLogout }) {
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);

  const isActive = (path) => location.pathname === path;

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    if (showProfileMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showProfileMenu]);

  return (
    <nav className="navbar">
      <div className="navbar__container">
        <div className="navbar__top">
          <Link to="/" className="navbar__logo">
            Financeiro
          </Link>
          {user && (
            <div className="navbar__user" ref={profileMenuRef}>
              <button
                className="navbar__profile-button"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                aria-label="Perfil do usuário"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M20.59 22C20.59 18.13 16.74 15 12 15C7.26 15 3.41 18.13 3.41 22"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              {showProfileMenu && (
                <div className="navbar__profile-menu">
                  <div className="navbar__profile-email">{user.email}</div>
                  <button className="navbar__profile-logout" onClick={onLogout}>
                    Sair
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        {user && (
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
              Despesas
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
