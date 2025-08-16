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
        className="absolute top-6 right-6 z-20 theme-toggle group"
        title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      >
        <div className={`theme-toggle-handle flex items-center justify-center ${isDark ? 'dark' : ''}`}>
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
          <h1 className="text-3xl font-bold text-primary mb-2">Join MovieFlix</h1>
          <p className="text-secondary text-lg">Create your account and start your cinematic journey</p>
        </div>

        {/* Form */}
        <div className="glass-card p-8 border-0 animate-slide-up">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-primary mb-3">
                👤 Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className={`input-field ${validationErrors.name ? 'border-red-500 bg-red-500/5' : ''}`}
                placeholder="Enter your full name"
              />
              {validationErrors.name && (
                <p className="text-red-400 text-sm mt-2 flex items-center">
                  <span className="mr-1">⚠️</span>
                  {validationErrors.name}
                </p>
              )}
            </div>

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
                className={`input-field ${validationErrors.email ? 'border-red-500 bg-red-500/5' : ''}`}
                placeholder="Enter your email address"
              />
              {validationErrors.email && (
                <p className="text-red-400 text-sm mt-2 flex items-center">
                  <span className="mr-1">⚠️</span>
                  {validationErrors.email}
                </p>
              )}
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
                className={`input-field ${validationErrors.password ? 'border-red-500 bg-red-500/5' : ''}`}
                placeholder="Create a secure password"
              />
              {validationErrors.password && (
                <p className="text-red-400 text-sm mt-2 flex items-center">
                  <span className="mr-1">⚠️</span>
                  {validationErrors.password}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-primary mb-3">
                🔐 Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`input-field ${validationErrors.confirmPassword ? 'border-red-500 bg-red-500/5' : ''}`}
                placeholder="Confirm your password"
              />
              {validationErrors.confirmPassword && (
                <p className="text-red-400 text-sm mt-2 flex items-center">
                  <span className="mr-1">⚠️</span>
                  {validationErrors.confirmPassword}
                </p>
              )}
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
                  <span>Creating Account...</span>
                </span>
              ) : (
                'Create Account ✨'
              )}
            </button>
          </form>

          {/* Terms and Privacy */}
          <div className="mt-6 text-xs text-muted text-center">
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
          <div className="text-center mt-8 animate-fade-in" style={{animationDelay: '0.3s'}}>
            <p className="text-secondary">
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

export default SignUp;
