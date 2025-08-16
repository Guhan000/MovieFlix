import axios from 'axios';
import { tokenStorage } from './tokenStorage';

const API_BASE_URL = `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'}/api`;

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable cookies for future httpOnly implementation
});

// Request interceptor to add token to requests
api.interceptors.request.use(
  (config) => {
    const token = tokenStorage.getToken();
    
    // Check if token is expired before using it
    if (token && !tokenStorage.isTokenExpired()) {
      config.headers.Authorization = `Bearer ${token}`;
    } else if (token && tokenStorage.isTokenExpired()) {
      // Token expired, clear it
      tokenStorage.clearAuth();
      console.warn('🔒 Token expired, redirecting to login');
      window.location.href = '/signin';
      return Promise.reject(new Error('Token expired'));
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.warn('🔒 Unauthorized access, clearing auth and redirecting');
      tokenStorage.clearAuth();
      
      // Only redirect if not already on auth pages
      const currentPath = window.location.pathname;
      if (!currentPath.includes('signin') && !currentPath.includes('signup')) {
        window.location.href = '/signin';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API functions
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  guestLogin: () => api.post('/auth/guest'),
  checkHealth: () => api.get('/health'),
};

export default api;
