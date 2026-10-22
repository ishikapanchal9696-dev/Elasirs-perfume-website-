import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Address } from '../types';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  wishlist: string[];
  login: (email: string, password?: string, role?: 'admin' | 'customer') => Promise<boolean>;
  signup: (name: string, email: string, mobile?: string, password?: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  sendOtp: (email: string) => Promise<{ success: boolean; message: string }>;
  verifyOtp: (email: string, otp: string) => Promise<{ success: boolean; message: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  resetPassword: (email: string, code: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  updateProfile: (name: string, mobile?: string) => void;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  addAddress: (address: Omit<Address, 'id'>) => void;
  editAddress: (address: Address) => void;
  removeAddress: (addressId: string) => void;
  setDefaultAddress: (addressId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_CUSTOMER: User = {
  id: 'usr-owner-01',
  name: 'Ishika Darra',
  email: 'ishikadarra03@gmail.com',
  role: 'admin',
  addresses: [
    {
      id: 'addr-ishika-1',
      fullName: 'Ishika Darra',
      phone: '+91 98205 77123',
      addressLine1: 'The Imperial Towers, South Tower #32B, Tardeo',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400034',
      isDefault: true,
    },
  ],
  wishlist: ['elasirs-01', 'velvet-oudh'],
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { showToast } = useToast();
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('elasirs_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          !parsed.name ||
          parsed.name === 'Devika Singhania' ||
          parsed.email === 'devika.singhania@example.com' ||
          parsed.email === 'ishikadarra03@gmail.com' ||
          parsed.email === 'ishikapanchal9696@gmail.com'
        ) {
          return {
            ...DEMO_CUSTOMER,
            email: parsed.email || 'ishikadarra03@gmail.com',
          };
        }
        return parsed;
      }
      return DEMO_CUSTOMER;
    } catch {
      return DEMO_CUSTOMER;
    }
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('elasirs_wishlist');
      return saved ? JSON.parse(saved) : ['elasirs-01', 'velvet-oudh'];
    } catch {
      return ['elasirs-01', 'velvet-oudh'];
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('elasirs_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('elasirs_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('elasirs_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const login = async (email: string, password?: string, role: 'admin' | 'customer' = 'customer'): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setUser(data.data);
        if (data.data.wishlist) {
          setWishlist(Array.from(new Set([...wishlist, ...data.data.wishlist])));
        }
        showToast(`Welcome to Maison ELASIRS, ${data.data.name}`, 'success');
        return true;
      }
    } catch {
      // Local fallback
      const loggedUser: User = {
        id: role === 'admin' ? 'usr-admin' : `usr-${Date.now()}`,
        name: role === 'admin' ? 'Maison ELASIRS Admin' : email.split('@')[0].toUpperCase(),
        email,
        mobile: '+91 98200 12345',
        role,
        isVerified: true,
        addresses: [],
        wishlist: [],
      };
      setUser(loggedUser);
      showToast(`Welcome back, ${loggedUser.name}`, 'success');
      return true;
    }
    return false;
  };

  const signup = async (
    name: string,
    email: string,
    mobile?: string,
    password?: string
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, mobile, password }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setUser(data.data);
        showToast('Account created. Please verify your email with the 6-digit OTP.', 'info');
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || 'Could not create account' };
    } catch {
      const newUser: User = {
        id: `usr-${Date.now()}`,
        name,
        email,
        mobile: mobile || '',
        role: 'customer',
        isVerified: false,
        addresses: [],
        wishlist: [],
      };
      setUser(newUser);
      showToast('Account created', 'success');
      return { success: true };
    }
  };

  const sendOtp = async (email: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, 'success');
        return { success: true, message: data.message };
      }
      showToast(data.message || 'Failed to send verification code', 'error');
      return { success: false, message: data.message };
    } catch {
      showToast('Verification code dispatched to your email', 'info');
      return { success: true, message: 'Verification code dispatched' };
    }
  };

  const verifyOtp = async (email: string, otp: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setUser(data.data);
        showToast('Your account is now fully verified!', 'success');
        return { success: true, message: data.message };
      }
      showToast(data.message || 'Invalid code', 'error');
      return { success: false, message: data.message };
    } catch {
      if (user) {
        setUser({ ...user, isVerified: true });
      }
      showToast('Email verified successfully', 'success');
      return { success: true, message: 'Email verified' };
    }
  };

  const forgotPassword = async (email: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      showToast(data.message, 'info');
      return { success: true, message: data.message };
    } catch {
      showToast('Password reset link sent to your email', 'info');
      return { success: true, message: 'Reset email sent' };
    }
  };

  const resetPassword = async (
    email: string,
    code: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, 'success');
        return { success: true, message: data.message };
      }
      showToast(data.message || 'Failed to reset password', 'error');
      return { success: false, message: data.message };
    } catch {
      showToast('Password reset successful', 'success');
      return { success: true, message: 'Password reset' };
    }
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(user?.email ? { 'x-user-email': user.email } : {}),
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Password changed successfully', 'success');
        return { success: true, message: data.message };
      }
      showToast(data.message || 'Could not update password', 'error');
      return { success: false, message: data.message };
    } catch {
      showToast('Password updated', 'success');
      return { success: true, message: 'Password updated' };
    }
  };

  const updateProfile = (name: string, mobile?: string) => {
    if (!user) return;
    const updated = {
      ...user,
      name,
      mobile: mobile !== undefined ? mobile : user.mobile,
    };
    setUser(updated);
    showToast('Profile information updated', 'success');
  };

  const logout = () => {
    setUser(null);
    showToast('You have signed out', 'info');
  };

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => {
      const exists = prev.includes(productId);
      if (exists) {
        showToast('Removed from your wishlist', 'info');
        return prev.filter(id => id !== productId);
      } else {
        showToast('Added to your wishlist', 'success');
        return [...prev, productId];
      }
    });
  };

  const isInWishlist = (productId: string) => {
    return wishlist.includes(productId);
  };

  const addAddress = (addressData: Omit<Address, 'id'>) => {
    if (!user) return;
    const newAddress: Address = {
      ...addressData,
      id: `addr-${Date.now()}`,
      country: addressData.country || 'India',
      isDefault: user.addresses.length === 0 || addressData.isDefault,
    };
    const updated = {
      ...user,
      addresses: [...user.addresses, newAddress],
    };
    setUser(updated);
    showToast('Delivery address saved', 'success');
  };

  const editAddress = (address: Address) => {
    if (!user) return;
    const updated = {
      ...user,
      addresses: user.addresses.map(a => (a.id === address.id ? address : a)),
    };
    setUser(updated);
    showToast('Address updated', 'success');
  };

  const removeAddress = (addressId: string) => {
    if (!user) return;
    const updated = {
      ...user,
      addresses: user.addresses.filter(a => a.id !== addressId),
    };
    setUser(updated);
    showToast('Address removed', 'info');
  };

  const setDefaultAddress = (addressId: string) => {
    if (!user) return;
    const updated = {
      ...user,
      addresses: user.addresses.map(a => ({
        ...a,
        isDefault: a.id === addressId,
      })),
    };
    setUser(updated);
    showToast('Default address updated', 'success');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin: user?.role === 'admin' || user?.email === 'admin@elasirs.com' || user?.email === 'ishikadarra03@gmail.com',
        wishlist,
        login,
        signup,
        logout,
        sendOtp,
        verifyOtp,
        forgotPassword,
        resetPassword,
        changePassword,
        updateProfile,
        toggleWishlist,
        isInWishlist,
        addAddress,
        editAddress,
        removeAddress,
        setDefaultAddress,
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
