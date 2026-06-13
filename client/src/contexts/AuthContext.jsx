import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/api';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing token on app start
    const token = localStorage.getItem('token');
    const storedUserType = localStorage.getItem('userType');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUserType && storedUser) {
      setUser(JSON.parse(storedUser));
      setUserType(storedUserType);
      apiService.setAuthToken(token);
    }
    
    setIsLoading(false);
  }, []);

  const login = async (credentials, type) => {
    try {
      const endpoint = type === 'admin' ? '/api/auth/admin/login' : '/api/auth/user/login';
      const response = await apiService.post(endpoint, credentials);
      
      const userData = type === 'admin' ? response.admin : response.user;
      const token = response.token;
      
      setUser(userData);
      setUserType(type);
      
      // Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('userType', type);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Set token for future requests
      apiService.setAuthToken(token);
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const logout = async () => {
    try {
      await apiService.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear state and localStorage regardless of API call success
      setUser(null);
      setUserType(null);
      localStorage.removeItem('token');
      localStorage.removeItem('userType');
      localStorage.removeItem('user');
      apiService.setAuthToken(null);
    }
  };

  const value = {
    user,
    userType,
    isLoading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}