import React, { createContext, useContext, useState, useEffect } from 'react';
import { StakeholderRole, AppUser } from '../types';
import { supabase } from '../services/supabaseClient';
import { authService, SignUpInput } from '../services/authService';

interface AuthRoleContextType {
  currentUser: AppUser | null;
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  selectedRole: StakeholderRole | null;
  loginAsRole: (role: StakeholderRole) => Promise<{ success: boolean; error?: string }>;
  loginWithCredentials: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  registerUser: (input: SignUpInput) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isLoginModalOpen: boolean;
  setLoginModalOpen: (open: boolean) => void;
  isRegisterModalOpen: boolean;
  setRegisterModalOpen: (open: boolean) => void;
  isScannerOpen: boolean;
  setScannerOpen: (open: boolean) => void;
  activeBatchId: string;
  setActiveBatchId: (id: string) => void;
}

const AuthRoleContext = createContext<AuthRoleContextType | undefined>(undefined);

export const AuthRoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    const saved = localStorage.getItem('farmtracer_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setRegisterModalOpen] = useState(false);
  const [isScannerOpen, setScannerOpen] = useState(false);
  const [activeBatchId, setActiveBatchId] = useState('BIS-2026-092');

  const selectedRole = currentUser?.role || null;
  const isAuthenticated = !!currentUser;

  // Initialize and listen to Supabase Auth State
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && mounted) {
          const profile = await authService.fetchProfile(session.user.id);
          if (profile) {
            setCurrentUser(profile);
            localStorage.setItem('farmtracer_user', JSON.stringify(profile));
          }
        }
      } catch (err) {
        console.warn('Initial session check failed:', err);
      } finally {
        if (mounted) setIsLoadingAuth(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const profile = await authService.fetchProfile(session.user.id);
          if (profile) {
            setCurrentUser(profile);
            localStorage.setItem('farmtracer_user', JSON.stringify(profile));
          }
        } else if (event === 'SIGNED_OUT') {
          setCurrentUser(null);
          localStorage.removeItem('farmtracer_user');
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const loginAsRole = async (role: StakeholderRole): Promise<{ success: boolean; error?: string }> => {
    setIsLoadingAuth(true);
    try {
      const { user, error } = await authService.signInWithDemoRole(role);
      if (error || !user) {
        return { success: false, error: error?.message || 'Login failed' };
      }
      setCurrentUser(user);
      localStorage.setItem('farmtracer_user', JSON.stringify(user));
      setLoginModalOpen(false);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const loginWithCredentials = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoadingAuth(true);
    try {
      const { user, error } = await authService.signInWithEmail(email, password);
      if (error || !user) {
        return { success: false, error: error?.message || 'Invalid credentials' };
      }
      setCurrentUser(user);
      localStorage.setItem('farmtracer_user', JSON.stringify(user));
      setLoginModalOpen(false);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const registerUser = async (
    input: SignUpInput
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoadingAuth(true);
    try {
      const { user, error } = await authService.signUp(input);
      if (error || !user) {
        return { success: false, error: error?.message || 'Registration failed' };
      }
      setCurrentUser(user);
      localStorage.setItem('farmtracer_user', JSON.stringify(user));
      setRegisterModalOpen(false);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const logout = async () => {
    setIsLoadingAuth(true);
    try {
      await authService.signOut();
    } finally {
      setCurrentUser(null);
      localStorage.removeItem('farmtracer_user');
      setIsLoadingAuth(false);
    }
  };

  return (
    <AuthRoleContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        isLoadingAuth,
        selectedRole,
        loginAsRole,
        loginWithCredentials,
        registerUser,
        logout,
        isLoginModalOpen,
        setLoginModalOpen,
        isRegisterModalOpen,
        setRegisterModalOpen,
        isScannerOpen,
        setScannerOpen,
        activeBatchId,
        setActiveBatchId,
      }}
    >
      {children}
    </AuthRoleContext.Provider>
  );
};

export const useAuthRole = (): AuthRoleContextType => {
  const context = useContext(AuthRoleContext);
  if (!context) {
    throw new Error('useAuthRole must be used within an AuthRoleProvider');
  }
  return context;
};
