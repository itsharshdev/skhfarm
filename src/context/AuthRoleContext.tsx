import React, { createContext, useContext, useState, useEffect } from 'react';
import { StakeholderRole, AppUser } from '../types';
import { DEMO_USERS } from '../data/mockData';

interface AuthRoleContextType {
  currentUser: AppUser | null;
  isAuthenticated: boolean;
  selectedRole: StakeholderRole | null;
  loginAsRole: (role: StakeholderRole) => void;
  logout: () => void;
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

  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setRegisterModalOpen] = useState(false);
  const [isScannerOpen, setScannerOpen] = useState(false);
  const [activeBatchId, setActiveBatchId] = useState('BIS-2026-092');

  const selectedRole = currentUser?.role || null;
  const isAuthenticated = !!currentUser;

  const loginAsRole = (role: StakeholderRole) => {
    const user = DEMO_USERS[role] || {
      userId: `usr_${role.toLowerCase()}_01`,
      name: `${role} Operator`,
      role,
      organizationName: `${role} Partner Org`,
      organizationId: `org_${role.toLowerCase()}`,
      location: 'Maharashtra Region',
      verified: true,
      avatarInitials: role.slice(0, 2),
    };
    setCurrentUser(user);
    localStorage.setItem('farmtracer_user', JSON.stringify(user));
    setLoginModalOpen(false);
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('farmtracer_user');
  };

  return (
    <AuthRoleContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        selectedRole,
        loginAsRole,
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
