import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const isActivePage = (path) => {
    return location.pathname === path;
  };

  // Don't show header on certain pages
  const hideHeaderPaths = ['/signin', '/signup'];
  if (!isAuthenticated && hideHeaderPaths.includes(location.pathname)) {
    return null;
  }

  return (
    <header className="glass-card sticky top-0 z-50 border-0">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0 animate-fade-in">
            <Link 
              to={isAuthenticated ? "/dashboard" : "/"} 
              className="text-gradient text-2xl font-bold hover:scale-105 transition-all duration-300 animate-glow"
            >
              MOVIEFLIX
            </Link>
          </div>

          {/* Desktop Navigation */}
          {isAuthenticated && (
            <nav className="hidden lg:flex items-center space-x-2 animate-slide-up">
              <Link
                to="/dashboard"
                className={`nav-link ${isActivePage('/dashboard') ? 'active' : ''}`}
              >
                🏠 Dashboard
              </Link>
              <Link
                to="/movies"
                className={`nav-link ${isActivePage('/movies') ? 'active' : ''}`}
              >
                🔍 Search
              </Link>
              <Link
                to="/favorites"
                className={`nav-link ${isActivePage('/favorites') ? 'active' : ''}`}
              >
                ❤️ Favorites
              </Link>
              <Link
                to="/statistics"
                className={`nav-link ${isActivePage('/statistics') ? 'active' : ''}`}
              >
                📊 Analytics
              </Link>
            </nav>
          )}

          {/* Right Side Controls */}
          <div className="flex items-center space-x-4 animate-fade-in">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`theme-toggle group ${isDark ? 'dark' : ''}`}
              title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            >
              <div className="theme-toggle-handle">
                <span className="text-xs">
                  {isDark ? '🌙' : '☀️'}
                </span>
              </div>
            </button>

            {isAuthenticated ? (
              <>
                {/* User Info - Desktop */}
                <div className="hidden lg:flex items-center space-x-4">
                  <div className="glass-card px-4 py-2 border-0">
                    <div className="text-sm">
                      <span className="text-muted">Welcome, </span>
                      <span className="text-primary font-semibold">{user?.name}</span>
                      {user?.role === 'admin' && (
                        <span className="ml-2 px-2 py-1 bg-gradient-secondary text-xs rounded-full text-white font-medium">
                          ADMIN
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="btn-primary text-sm px-4 py-2"
                  >
                    Logout
                  </button>
                </div>

                {/* Mobile Menu Button */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="lg:hidden glass-card p-2 border-0 hover:scale-105 active:scale-95 transition-all duration-200"
                >
                  <svg 
                    className="h-6 w-6 text-primary" 
                    stroke="currentColor" 
                    fill="none" 
                    viewBox="0 0 24 24"
                  >
                    {isMobileMenuOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/signin"
                  className="btn-ghost text-sm"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="btn-primary text-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isAuthenticated && isMobileMenuOpen && (
          <div className="lg:hidden animate-slide-up">
            <div className="glass-card mx-4 mb-4 p-6 border-0">
              <div className="space-y-3">
                <Link
                  to="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`nav-link block text-lg ${isActivePage('/dashboard') ? 'active' : ''}`}
                >
                  🏠 Dashboard
                </Link>
                <Link
                  to="/movies"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`nav-link block text-lg ${isActivePage('/movies') ? 'active' : ''}`}
                >
                  🔍 Search Movies
                </Link>
                <Link
                  to="/favorites"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`nav-link block text-lg ${isActivePage('/favorites') ? 'active' : ''}`}
                >
                  ❤️ Favorites
                </Link>
                <Link
                  to="/statistics"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`nav-link block text-lg ${isActivePage('/statistics') ? 'active' : ''}`}
                >
                  📊 Analytics
                </Link>
                
                {/* Mobile User Info */}
                <div className="border-t pt-6 mt-6" style={{ borderColor: 'rgb(var(--border-primary))' }}>
                  <div className="glass-card p-4 border-0 mb-4">
                    <div className="text-sm text-muted">Signed in as</div>
                    <div className="text-lg font-semibold text-primary">{user?.name}</div>
                    {user?.role === 'admin' && (
                      <div className="text-xs bg-gradient-secondary text-white px-2 py-1 rounded-full inline-block mt-2">
                        Administrator
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="btn-primary w-full"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
