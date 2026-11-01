import React, { createContext, useContext, useState, useEffect } from 'react';
import type { IUser, IAddress } from '../types/index.ts';
import { useToast } from './ToastContext.tsx';

interface AuthContextType {
  user: IUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  googleClientId: string;
  login: (email: string, password: string) => Promise<boolean>;
  adminLogin: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, confirmPassword?: string) => Promise<boolean>;
  googleLogin: (credential?: { name?: string; email?: string; googleId?: string; profileImage?: string; idToken?: string }) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<IUser>) => Promise<boolean>;
  addAddress: (address: Omit<IAddress, 'id'>) => Promise<boolean>;
  removeAddress: (id: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('deity_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [googleClientId, setGoogleClientId] = useState<string>('1052374708506-q7as92m0pm73q6dml6vlmu8o0pul7s7l.apps.googleusercontent.com');
  const { showToast } = useToast();

  useEffect(() => {
    // Fetch backend config
    fetch('/api/config')
      .then(res => res.json())
      .then(cfg => {
        if (cfg.googleClientId) {
          setGoogleClientId(cfg.googleClientId);
        }
      })
      .catch(err => console.log('Config load notice:', err));

    const fetchUser = async () => {
      const storedToken = localStorage.getItem('deity_token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${storedToken}` }
        });
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
          setToken(storedToken);
        } else {
          localStorage.removeItem('deity_token');
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.error('Error fetching auth user:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        showToast(data.message || 'Login failed. Check credentials.', 'error');
        return false;
      }

      localStorage.setItem('deity_token', data.token);
      setToken(data.token);
      setUser(data.user);
      showToast(data.message || 'Logged in successfully!', 'success');
      return true;
    } catch (err) {
      showToast('Network error during login.', 'error');
      return false;
    }
  };

  const adminLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        showToast(data.message || 'Admin authentication rejected.', 'error');
        return false;
      }

      localStorage.setItem('deity_token', data.token);
      setToken(data.token);
      setUser(data.user);
      showToast('Admin authorization verified.', 'success');
      return true;
    } catch (err) {
      showToast('Admin server communication failed.', 'error');
      return false;
    }
  };

  const register = async (name: string, email: string, password: string, confirmPassword?: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, confirmPassword })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        showToast(data.message || 'Registration failed.', 'error');
        return false;
      }

      localStorage.setItem('deity_token', data.token);
      setToken(data.token);
      setUser(data.user);
      showToast(data.message || 'Welcome to DEITY CAPS!', 'success');
      return true;
    } catch (err) {
      showToast('Network error during registration.', 'error');
      return false;
    }
  };

  const googleLogin = async (customProfile?: { name: string; email: string; googleId?: string; profileImage?: string }): Promise<boolean> => {
    try {
      const profileData = customProfile || {
        name: 'Streetwear Enthusiast',
        email: `deity.fan.${Math.floor(100 + Math.random() * 900)}@gmail.com`,
        googleId: `g_${Date.now()}`,
        profileImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
      };

      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        showToast(data.message || 'Google sign in failed.', 'error');
        return false;
      }

      localStorage.setItem('deity_token', data.token);
      setToken(data.token);
      setUser(data.user);
      showToast(`Welcome ${data.user.name}! Connected with Google.`, 'success');
      return true;
    } catch (err) {
      showToast('Google OAuth service error.', 'error');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('deity_token');
    setToken(null);
    setUser(null);
    showToast('Signed out of DEITY CAPS.', 'info');
  };

  const updateProfile = async (updates: Partial<IUser>): Promise<boolean> => {
    if (!token) return false;
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        showToast('Profile details updated!', 'success');
        return true;
      }
      showToast(data.message || 'Profile update failed.', 'error');
      return false;
    } catch (err) {
      showToast('Failed to update profile.', 'error');
      return false;
    }
  };

  const addAddress = async (address: Omit<IAddress, 'id'>): Promise<boolean> => {
    if (!token) return false;
    try {
      const res = await fetch('/api/auth/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(address)
      });
      const data = await res.json();
      if (data.success && data.addresses) {
        setUser(prev => prev ? { ...prev, addresses: data.addresses } : null);
        showToast('Delivery address saved!', 'success');
        return true;
      }
      showToast(data.message || 'Failed to save address.', 'error');
      return false;
    } catch (err) {
      showToast('Network error while saving address.', 'error');
      return false;
    }
  };

  const removeAddress = async (id: string): Promise<boolean> => {
    if (!token) return false;
    try {
      const res = await fetch(`/api/auth/addresses/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.addresses) {
        setUser(prev => prev ? { ...prev, addresses: data.addresses } : null);
        showToast('Address removed.', 'info');
        return true;
      }
      return false;
    } catch (err) {
      showToast('Failed to remove address.', 'error');
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user),
        isAdmin: user?.role === 'admin',
        isLoading,
        googleClientId,
        login,
        adminLogin,
        register,
        googleLogin,
        logout,
        updateProfile,
        addAddress,
        removeAddress
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
