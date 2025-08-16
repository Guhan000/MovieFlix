import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';

const SignUp = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { register, error } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const { toast } = useToast();
  
  // Get email from location state if coming from landing page
  const prefilledEmail = location.state?.email || '';
  
  const [formData, setFormData] = useState({
    name: '',
    email: prefilledEmail,
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    
    // Clear validation error when user starts typing
    if (validationErrors[e.target.name]) {
      setValidationErrors({
        ...validationErrors,
        [e.target.name]: ''
      });
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.warning('Please fix the form errors before submitting');
      return;
    }

    setIsLoading(true);

    try {
      const result = await register(formData.name, formData.email, formData.password);
      
      if (result.success) {
        toast.success('Account created successfully! Welcome to MovieFlix!');
        navigate('/dashboard');
      } else {
        toast.error(result.message || 'Registration failed');
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-10 pb-10  bg-primary flex items-center justify-center relative overflow-hidden">
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
          <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-2">Join MovieFlix</h1>
          <p className="text-secondary text-base sm:text-lg">Create your account and start your cinematic journey</p>
        </div>

        {/* Form */}
        <div className="glass-card p-6 sm:p-8 border-0 animate-slide-up" style={{ backdropFilter: 'blur(20px)', backgroundColor: 'rgb(var(--bg-primary) / 0.95)' }}>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-primary mb-2">
                👤 Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className={`input-field ${validationErrors.name ? 'border-red-500/50 bg-red-500/5' : ''}`}
                placeholder="Enter your full name"
              />
              {validationErrors.name && (
                <p className="text-red-400 text-xs mt-1 flex items-center">
                  <span className="mr-1">⚠️</span>
                  {validationErrors.name}
                </p>
              )}
            </div>

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
                className={`input-field ${validationErrors.email ? 'border-red-500/50 bg-red-500/5' : ''}`}
                placeholder="Enter your email address"
              />
              {validationErrors.email && (
                <p className="text-red-400 text-xs mt-1 flex items-center">
                  <span className="mr-1">⚠️</span>
                  {validationErrors.email}
                </p>
              )}
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
                className={`input-field ${validationErrors.password ? 'border-red-500/50 bg-red-500/5' : ''}`}
                placeholder="Create a secure password"
              />
              {validationErrors.password && (
                <p className="text-red-400 text-xs mt-1 flex items-center">
                  <span className="mr-1">⚠️</span>
                  {validationErrors.password}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-primary mb-2">
                🔐 Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`input-field ${validationErrors.confirmPassword ? 'border-red-500/50 bg-red-500/5' : ''}`}
                placeholder="Confirm your password"
              />
              {validationErrors.confirmPassword && (
                <p className="text-red-400 text-xs mt-1 flex items-center">
                  <span className="mr-1">⚠️</span>
                  {validationErrors.confirmPassword}
                </p>
              )}
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
                  <span>Creating Account...</span>
                </span>
              ) : (
                'Create Account ✨'
              )}
            </button>
          </form>

          {/* Terms and Privacy */}
          <div className="mt-5 text-xs text-muted text-center">
            <p>
              By creating an account, you agree to our{' '}
              <a href="#" className="text-gradient font-semibold hover:scale-105 inline-block transition-all duration-300">
                Terms of Service
              </a>
              {' '}and{' '}
              <a href="#" className="text-gradient font-semibold hover:scale-105 inline-block transition-all duration-300">
                Privacy Policy
              </a>
            </p>
          </div>

          {/* Sign In Link */}
          <div className="text-center mt-6 animate-fade-in" style={{animationDelay: '0.3s'}}>
            <p className="text-secondary text-sm">
              Already have an account?{' '}
              <Link 
                to="/signin" 
                className="text-gradient font-bold hover:scale-105 inline-block transition-all duration-300"
              >
                Sign in instead →
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

export default SignUp;
