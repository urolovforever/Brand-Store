import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = authService.getToken();
    if (token) {
      try {
        const isValid = await authService.verifyToken();
        if (isValid) {
          const userData = await authService.getCurrentUser();
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          // Try to refresh token
          try {
            await authService.refreshToken();
            const userData = await authService.getCurrentUser();
            setUser(userData);
            setIsAuthenticated(true);
          } catch (error) {
            logout();
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        logout();
      }
    }
    setLoading(false);
  };

  const login = async (username, password) => {
    try {
      await authService.login(username, password);
      const userData = await authService.getCurrentUser();
      setUser(userData);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.detail || error.message || 'Invalid username or password'
      };
    }
  };

  const register = async (userData) => {
    try {
      await authService.register(userData);
      // After successful registration, log the user in
      await login(userData.username, userData.password);
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: error.message || 'Registration failed'
      };
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateProfile = async (userData) => {
    try {
      const updatedUser = await authService.updateProfile(userData);
      setUser(updatedUser);
      return { success: true };
    } catch (error) {
      console.error('Profile update error:', error);
      return {
        success: false,
        message: error.message || 'Failed to update profile'
      };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await authService.changePassword(currentPassword, newPassword);
      return { success: true };
    } catch (error) {
      console.error('Password change error:', error);
      return {
        success: false,
        message: error.message || 'Failed to change password'
      };
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
