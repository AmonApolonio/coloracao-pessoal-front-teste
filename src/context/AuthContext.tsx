import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import EnvConfig from '../config/envConfig';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in on app startup
    const savedAuth = localStorage.getItem('auth');
    if (savedAuth) {
      try {
        const { username, password, timestamp } = JSON.parse(savedAuth);
        
        // Check if session is still valid (24 hours)
        const now = Date.now();
        const sessionDuration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
        
        if (now - timestamp < sessionDuration) {
          // Verify credentials against environment variables
          const envUsername = EnvConfig.getEnvVariable('VITE_USERNAME');
          const envPassword = EnvConfig.getEnvVariable('VITE_PASSWORD');
          
          if (username === envUsername && password === envPassword) {
            setIsAuthenticated(true);
          } else {
            // Clear invalid session
            localStorage.removeItem('auth');
          }
        } else {
          // Clear expired session
          localStorage.removeItem('auth');
        }
      } catch (error) {
        // Clear corrupted session data
        localStorage.removeItem('auth');
      }
    }
    
    setLoading(false);
  }, []);

  const login = (username: string, password: string): boolean => {
    const envUsername = EnvConfig.getEnvVariable('VITE_USERNAME');
    const envPassword = EnvConfig.getEnvVariable('VITE_PASSWORD');
    
    if (username === envUsername && password === envPassword) {
      // Save auth state to localStorage
      const authData = {
        username,
        password,
        timestamp: Date.now()
      };
      localStorage.setItem('auth', JSON.stringify(authData));
      setIsAuthenticated(true);
      return true;
    }
    
    return false;
  };

  const logout = () => {
    localStorage.removeItem('auth');
    setIsAuthenticated(false);
  };

  const value = {
    isAuthenticated,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
