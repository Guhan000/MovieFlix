import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';

const SignIn = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { login, guestLogin, error } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        toast.success('Welcome back!');
        navigate('/dashboard');
      } else {
        toast.error(result.message || 'Sign in failed');
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setIsLoading(true);
    
    try {
      const result = await guestLogin();
      
      if (result.success) {
        toast.success('Signed in as guest!');
        navigate('/dashboard');
      } else {
        toast.error(result.message || 'Guest login failed');
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-10 pb-10 bg-primary flex items-center justify-center relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-hero opacity-20"></div>
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-64 h-64 bg-gradient-primary rounded-full opacity-10 blur-3xl animate-float"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-gradient-secondary rounded-full opacity-10 blur-3xl animate-float" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-gradient-hero rounded-full opacity-5 blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
      </div>
      
      {/* Enhanced Theme Toggle */}
      <div className="absolute top-6 right-6 z-20 flex items-center space-x-3">
        <span className="text-sm text-muted font-medium hidden sm:block">
          {isDark ? 'Dark' : 'Light'}
        </span>
        <button
          onClick={toggleTheme}
          className={`theme-toggle group ${isDark ? 'dark' : ''}`}
          title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        >
          <div className="theme-toggle-handle">
            <span className="text-xs transition-all duration-300 transform group-hover:scale-110">
              {isDark ? '🌙' : '☀️'}
            </span>
          </div>
          {/* Toggle Track Labels */}
          <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-xs text-muted opacity-60">
            ☀️
          </span>
          <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-muted opacity-60">
            🌙
          </span>
        </button>
      </div>
      
      <div className="relative z-10 w-full max-w-lg mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <Link to="/" className="text-gradient text-3xl sm:text-4xl font-black mb-3 inline-block hover:scale-105 transition-all duration-300 animate-glow">
            MOVIEFLIX
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-2">Welcome Back</h1>
          <p className="text-secondary text-base sm:text-lg">Sign in to your account to continue exploring</p>
        </div>

        {/* Form */}
        <div className="glass-card p-6 sm:p-8 border-0 animate-slide-up" style={{ backdropFilter: 'blur(20px)', backgroundColor: 'rgb(var(--bg-primary) / 0.95)' }}>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-primary mb-2">
                📧 Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="input-field"
                placeholder="Enter your email address"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-primary mb-2">
                🔒 Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="input-field"
                placeholder="Enter your password"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg p-3 backdrop-blur-sm">
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-3 text-base font-semibold mt-6"
            >
              {isLoading ? (
                <span className="flex items-center justify-center space-x-2">
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Signing in...</span>
                </span>
              ) : (
                'Sign In ✨'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgb(var(--border-primary) / 0.3), transparent)' }}></div>
            <span className="px-4 text-muted text-sm font-medium">OR</span>
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgb(var(--border-primary) / 0.3), transparent)' }}></div>
          </div>

          {/* Guest Login */}
          <button
            onClick={handleGuestLogin}
            disabled={isLoading}
            className="btn-ghost w-full py-3 text-base font-semibold"
          >
            {isLoading ? (
              <span className="flex items-center justify-center space-x-2">
                <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>
                <span>Signing in...</span>
              </span>
            ) : (
              '🎬 Continue as Guest'
            )}
          </button>

          {/* Demo Credentials */}
          <div className="mt-6 bg-secondary/30 border border-primary/10 p-4 rounded-lg backdrop-blur-sm">
            <h3 className="text-sm font-bold text-primary mb-2 flex items-center">
              🎭 Demo Credentials
            </h3>
            <div className="text-sm text-secondary space-y-1">
              <p><span className="font-medium">Email:</span> guest@movieflix.com</p>
              <p><span className="font-medium">Password:</span> guest123</p>
              <p className="text-gradient font-semibold mt-2 text-xs">Or simply use the "Continue as Guest" button</p>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center mt-6 animate-fade-in" style={{animationDelay: '0.3s'}}>
            <p className="text-secondary text-sm">
              New to MovieFlix?{' '}
              <Link 
                to="/signup" 
                className="text-gradient font-bold hover:scale-105 inline-block transition-all duration-300"
              >
                Sign up now →
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-4 animate-fade-in" style={{animationDelay: '0.5s'}}>
          <Link 
            to="/" 
            className="text-muted hover:text-secondary text-sm transition-colors inline-flex items-center space-x-1"
          >
            <span>← Back to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
