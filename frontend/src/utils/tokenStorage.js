// Enhanced token storage with security improvements
class TokenStorage {
  constructor() {
    this.storageType = this.detectStorageType();
  }

  detectStorageType() {
    // Check if we can use secure httpOnly cookies (when implemented)
    // For now, use localStorage with security enhancements
    return 'localStorage';
  }

  // Get token from storage
  getToken() {
    try {
      return localStorage.getItem('movieflix_token');
    } catch (error) {
      console.warn('Error reading token:', error);
      return null;
    }
  }

  // Set token with security enhancements
  setToken(token) {
    try {
      localStorage.setItem('movieflix_token', token);
      
      // Set expiration time (7 days from now)
      const expirationTime = Date.now() + (7 * 24 * 60 * 60 * 1000);
      localStorage.setItem('movieflix_token_exp', expirationTime.toString());
      
      return true;
    } catch (error) {
      console.warn('Error storing token:', error);
      return false;
    }
  }

  // Get user data from storage
  getUserData() {
    try {
      const userData = localStorage.getItem('movieflix_user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.warn('Error reading user data:', error);
      return null;
    }
  }

  // Set user data with security
  setUserData(userData) {
    try {
      // Don't store sensitive data
      const safeUserData = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        subscription: userData.subscription,
        role: userData.role
      };
      
      localStorage.setItem('movieflix_user', JSON.stringify(safeUserData));
      return true;
    } catch (error) {
      console.warn('Error storing user data:', error);
      return false;
    }
  }

  // Check if token is expired
  isTokenExpired() {
    try {
      const expiration = localStorage.getItem('movieflix_token_exp');
      if (!expiration) return true;
      
      return Date.now() > parseInt(expiration);
    } catch (error) {
      return true;
    }
  }

  // Clear all auth data
  clearAuth() {
    try {
      localStorage.removeItem('movieflix_token');
      localStorage.removeItem('movieflix_user');
      localStorage.removeItem('movieflix_token_exp');
      
      // Clear old token names for backwards compatibility
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch (error) {
      console.warn('Error clearing auth data:', error);
    }
  }

  // Migrate old tokens
  migrateOldTokens() {
    try {
      const oldToken = localStorage.getItem('token');
      const oldUser = localStorage.getItem('user');
      
      if (oldToken && !this.getToken()) {
        this.setToken(oldToken);
        localStorage.removeItem('token');
      }
      
      if (oldUser && !this.getUserData()) {
        this.setUserData(JSON.parse(oldUser));
        localStorage.removeItem('user');
      }
    } catch (error) {
      console.warn('Error migrating old tokens:', error);
    }
  }
}

export const tokenStorage = new TokenStorage();
