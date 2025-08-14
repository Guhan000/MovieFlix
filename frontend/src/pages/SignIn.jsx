import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SignIn = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { login, guestLogin, error } = useAuth();
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

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      navigate('/dashboard'); // We'll create this later
    }
    
    setIsLoading(false);
  };

  const handleGuestLogin = async () => {
    setIsLoading(true);
    const result = await guestLogin();
    
    if (result.success) {
      navigate('/dashboard');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 to-black"></div>
      
      <div className="relative z-10 w-full max-w-md mx-auto p-6">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="text-red-600 text-4xl font-bold">MOVIEFLIX</Link>
        </div>

        {/* Sign In Form */}
        <div className="bg-black/75 backdrop-blur-sm p-8 rounded-lg border border-gray-800">
          <h1 className="text-3xl font-bold text-white mb-6 text-center">Sign In</h1>
          
          {error && (
            <div className="bg-red-600/20 border border-red-600 text-red-300 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="email"
                name="email"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-3 text-lg font-semibold disabled:opacity-50"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {/* Guest Login */}
          <div className="mt-4">
            <button
              onClick={handleGuestLogin}
              disabled={isLoading}
              className="w-full btn-secondary py-3 text-lg font-semibold disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : 'Continue as Guest'}
            </button>
          </div>

          {/* Additional Options */}
          <div className="mt-6 text-center text-gray-400">
            <div className="flex items-center justify-between text-sm mb-4">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2 bg-gray-700 border-gray-600" />
                Remember me
              </label>
              <a href="#" className="hover:text-white">Need help?</a>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="mt-6 text-center text-gray-400">
            <p>
              New to MovieFlix?{' '}
              <Link to="/signup" className="text-white hover:underline font-semibold">
                Sign up now
              </Link>
            </p>
          </div>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-gray-800/50 rounded border border-gray-700">
            <h3 className="text-sm font-semibold text-gray-300 mb-2">Demo Credentials:</h3>
            <div className="text-xs text-gray-400 space-y-1">
              <p><strong>Email:</strong> guest@movieflix.com</p>
              <p><strong>Password:</strong> guest123</p>
              <p className="text-yellow-400 mt-2">Or use "Continue as Guest" button</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>This page is protected by Google reCAPTCHA to ensure you're not a bot.</p>
          <div className="mt-2">
            <a href="#" className="hover:underline">Learn more</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
