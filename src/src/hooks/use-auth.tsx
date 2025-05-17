import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import DataService from '@/services/dataService';

// Define the shape of our user data
export interface User {
  _id?: string;
  name: string;
  email: string;
  department: string;
  year: string;
  avatar?: string;
  token?: string;
  isLoggedIn: boolean;
  isProfileComplete?: boolean;
  location?: string;
}

// Define the shape of our context
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (data: { email: string; password: string }) => Promise<boolean>;
  register: (data: any) => Promise<boolean>;
  logout: () => void;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('unimart_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser && parsedUser.isLoggedIn) {
          setUser(parsedUser);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('unimart_user');
      }
    }
  }, []);

  // Login function - now connects to the API
  const login = async (userData: { email: string; password: string }): Promise<boolean> => {
    try {
      const dataService = DataService.getInstance();
      const user = await dataService.login(userData.email, userData.password);
      
      // Store user in local storage
      localStorage.setItem('unimart_user', JSON.stringify(user));
      
      // Update state
      setUser(user);
      setIsAuthenticated(true);
      
      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  // Register function - now connects to the API
  const register = async (userData: any): Promise<boolean> => {
    try {
      const dataService = DataService.getInstance();
      const user = await dataService.register(userData);
      
      // Store user in local storage
      localStorage.setItem('unimart_user', JSON.stringify(user));
      
      // Update state
      setUser(user);
      setIsAuthenticated(true);
      
      return true;
    } catch (error) {
      console.error("Registration error:", error);
      return false;
    }
  };

  const logout = () => {
    // Clear user from localStorage and state
    localStorage.removeItem('unimart_user');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
