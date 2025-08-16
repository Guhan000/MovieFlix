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
    <div className="min-h-screen bg-primary flex items-center justify-center relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-hero opacity-20"></div>
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-64 h-64 bg-gradient-primary rounded-full opacity-10 blur-3xl animate-float"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-gradient-secondary rounded-full opacity-10 blur-3xl animate-float" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-gradient-hero rounded-full opacity-5 blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
      </div>
      
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className={`absolute top-6 right-6 z-20 theme-toggle group ${isDark ? 'dark' : ''}`}
        title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      >
        <div className="theme-toggle-handle">
          <span className="text-xs">
            {isDark ? '🌙' : '☀️'}
          </span>
        </div>
      </button>
      
      <div className="relative z-10 w-full max-w-md mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <Link to="/" className="text-gradient text-4xl font-black mb-4 inline-block hover:scale-105 transition-all duration-300 animate-glow">
            MOVIEFLIX
          </Link>
          <h1 className="text-3xl font-bold text-primary mb-2">Welcome Back</h1>
          <p className="text-secondary text-lg">Sign in to your account to continue exploring</p>
        </div>

        {/* Form */}
        <div className="glass-card p-8 border-0 animate-slide-up">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-primary mb-3">
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
              <label htmlFor="password" className="block text-sm font-semibold text-primary mb-3">
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
              <div className="glass-card p-4 border border-red-500/50 bg-red-500/10 text-red-400 text-sm rounded-xl">
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-4 text-lg font-semibold"
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
          <div className="my-8 flex items-center">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border-primary to-transparent" style={{ background: 'linear-gradient(90deg, transparent, rgb(var(--border-primary)), transparent)' }}></div>
            <span className="px-4 text-muted text-sm font-medium">OR</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border-primary to-transparent" style={{ background: 'linear-gradient(90deg, transparent, rgb(var(--border-primary)), transparent)' }}></div>
          </div>

          {/* Guest Login */}
          <button
            onClick={handleGuestLogin}
            disabled={isLoading}
            className="btn-ghost w-full py-4 text-lg font-semibold"
          >
            {isLoading ? (
              <span className="flex items-center justify-center space-x-2">
                <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full"></div>
                <span>Signing in...</span>
              </span>
            ) : (
              '🎬 Continue as Guest'
            )}
          </button>

          {/* Demo Credentials */}
          <div className="mt-8 glass-card p-4 border-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5">
            <h3 className="text-sm font-bold text-primary mb-3 flex items-center">
              🎭 Demo Credentials
            </h3>
            <div className="text-sm text-secondary space-y-1">
              <p><span className="font-medium">Email:</span> guest@movieflix.com</p>
              <p><span className="font-medium">Password:</span> guest123</p>
              <p className="text-gradient font-semibold mt-2">Or simply use the "Continue as Guest" button</p>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center mt-8 animate-fade-in" style={{animationDelay: '0.3s'}}>
            <p className="text-secondary">
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
        <div className="text-center mt-6 animate-fade-in" style={{animationDelay: '0.5s'}}>
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
