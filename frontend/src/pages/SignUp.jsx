import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const { register, error } = useAuth();
  const navigate = useNavigate();

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
      return;
    }

    setIsLoading(true);

    const result = await register(formData.name, formData.email, formData.password);
    
    if (result.success) {
      navigate('/dashboard');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center py-12">
      <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 to-black"></div>
      
      <div className="relative z-10 w-full max-w-md mx-auto p-6">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="text-red-600 text-4xl font-bold">MOVIEFLIX</Link>
        </div>

        {/* Sign Up Form */}
        <div className="bg-black/75 backdrop-blur-sm p-8 rounded-lg border border-gray-800">
          <h1 className="text-3xl font-bold text-white mb-6 text-center">Sign Up</h1>
          
          {error && (
            <div className="bg-red-600/20 border border-red-600 text-red-300 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                className={`input-field ${validationErrors.name ? 'border-red-500' : ''}`}
                required
              />
              {validationErrors.name && (
                <p className="text-red-400 text-sm mt-1">{validationErrors.name}</p>
              )}
            </div>

            <div>
              <input
                type="email"
                name="email"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
                className={`input-field ${validationErrors.email ? 'border-red-500' : ''}`}
                required
              />
              {validationErrors.email && (
                <p className="text-red-400 text-sm mt-1">{validationErrors.email}</p>
              )}
            </div>

            <div>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className={`input-field ${validationErrors.password ? 'border-red-500' : ''}`}
                required
              />
              {validationErrors.password && (
                <p className="text-red-400 text-sm mt-1">{validationErrors.password}</p>
              )}
            </div>

            <div>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`input-field ${validationErrors.confirmPassword ? 'border-red-500' : ''}`}
                required
              />
              {validationErrors.confirmPassword && (
                <p className="text-red-400 text-sm mt-1">{validationErrors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-3 text-lg font-semibold disabled:opacity-50"
            >
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          {/* Terms and Privacy */}
          <div className="mt-4 text-xs text-gray-400">
            <p>
              By signing up, you agree to our{' '}
              <a href="#" className="hover:text-white underline">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="hover:text-white underline">Privacy Policy</a>
            </p>
          </div>

          {/* Sign In Link */}
          <div className="mt-6 text-center text-gray-400">
            <p>
              Already have an account?{' '}
              <Link to="/signin" className="text-white hover:underline font-semibold">
                Sign in
              </Link>
            </p>
          </div>

          {/* Subscription Plans Preview */}
          <div className="mt-6 p-4 bg-gray-800/50 rounded border border-gray-700">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">Choose Your Plan:</h3>
            <div className="space-y-2 text-xs text-gray-400">
              <div className="flex justify-between">
                <span>Basic Plan</span>
                <span className="text-white">$8.99/month</span>
              </div>
              <div className="flex justify-between">
                <span>Premium Plan</span>
                <span className="text-white">$15.99/month</span>
              </div>
              <p className="text-yellow-400 mt-2">7-day free trial for new users!</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Questions? Call 1-844-505-2993</p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
