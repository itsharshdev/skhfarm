import React, { useState } from 'react';
import { useAuthRole } from '../../context/AuthRoleContext';
import { StakeholderRole } from '../../types';
import {
  X,
  Tractor,
  Store,
  Truck,
  Warehouse,
  Factory,
  ShoppingBag,
  ShieldAlert,
  UserCog,
  CheckCircle2,
  Lock,
  ArrowRight,
  Mail,
  KeyRound,
  AlertCircle,
  Sparkles,
  Loader2,
} from 'lucide-react';

import { FarmTracerLogo } from '../brand/FarmTracerLogo';

interface RoleOption {
  role: StakeholderRole;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  badge: string;
}

const ROLES: RoleOption[] = [
  {
    role: 'FARMER',
    title: 'Farmer / FPO Origin',
    subtitle: 'Create harvest batches, log initial origin & capture camera proof',
    icon: Tractor,
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50 border-emerald-200 hover:border-emerald-500',
    badge: 'Origin Stakeholder',
  },
  {
    role: 'MANDI',
    title: 'Mandi / Collection Hub',
    subtitle: 'Receive, weigh, verify grade & assign storage handoffs',
    icon: Store,
    color: 'text-amber-700',
    bgColor: 'bg-amber-50 border-amber-200 hover:border-amber-500',
    badge: 'APMC Hub',
  },
  {
    role: 'WAREHOUSE',
    title: 'Solar Smart Storage / Cold Vault',
    subtitle: 'Monitor solar power, temperature bounds & cold storage intake',
    icon: Warehouse,
    color: 'text-teal-700',
    bgColor: 'bg-teal-50 border-teal-200 hover:border-teal-500',
    badge: 'Cold-Chain Operator',
  },
  {
    role: 'TRANSPORTER',
    title: 'Logistics / Transporter',
    subtitle: 'Reefer transit, route checkpoints & handoff delivery confirmations',
    icon: Truck,
    color: 'text-blue-700',
    bgColor: 'bg-blue-50 border-blue-200 hover:border-blue-500',
    badge: 'Transit Carrier',
  },
  {
    role: 'PROCESSOR',
    title: 'Processor / Mill / Factory',
    subtitle: 'Transform raw commodities into intermediate & final goods',
    icon: Factory,
    color: 'text-purple-700',
    bgColor: 'bg-purple-50 border-purple-200 hover:border-purple-500',
    badge: 'Transformation',
  },
  {
    role: 'RETAILER',
    title: 'Retailer / Storefront',
    subtitle: 'Receive shelf inventory, verify QR tags & handle consumer queries',
    icon: ShoppingBag,
    color: 'text-orange-700',
    bgColor: 'bg-orange-50 border-orange-200 hover:border-orange-500',
    badge: 'Retail Point',
  },
  {
    role: 'AUTHORITY',
    title: 'Food Safety Regulator / Inspector',
    subtitle: 'Audit 100-pt scores, trace lineages, inspect alerts & compliance',
    icon: ShieldAlert,
    color: 'text-rose-700',
    bgColor: 'bg-rose-50 border-rose-200 hover:border-rose-500',
    badge: 'Audit & Safety',
  },
  {
    role: 'ADMIN',
    title: 'Platform Administrator',
    subtitle: 'Configure supply chains, organizations, users & platform parameters',
    icon: UserCog,
    color: 'text-slate-700',
    bgColor: 'bg-slate-50 border-slate-200 hover:border-slate-500',
    badge: 'System Admin',
  },
];

export const StakeholderLoginModal: React.FC = () => {
  const {
    isLoginModalOpen,
    setLoginModalOpen,
    loginAsRole,
    loginWithCredentials,
    setRegisterModalOpen,
  } = useAuthRole();

  const [authMode, setAuthMode] = useState<'demo' | 'credentials'>('demo');
  const [selectedRole, setSelectedRole] = useState<StakeholderRole>('FARMER');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isLoginModalOpen) return null;

  const handleRoleSelect = (role: StakeholderRole) => {
    setSelectedRole(role);
    setErrorMessage(null);
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await loginAsRole(selectedRole);
      if (!res.success) {
        setErrorMessage(res.error || 'Failed to authenticate demo account.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  const handleCredentialLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await loginWithCredentials(email, password);
      if (!res.success) {
        setErrorMessage(res.error || 'Invalid email or password.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="stakeholder-login-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fadeIn"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <FarmTracerLogo variant="icon-only" size="sm" />
            <div>
              <h3 className="font-bold text-slate-900 text-lg font-['Space_Grotesk',sans-serif]">Stakeholder Authentication</h3>
              <p className="text-xs text-slate-500">Live Supabase Authentication & Role Access</p>
            </div>
          </div>
          <button
            id="close-login-modal-btn"
            onClick={() => setLoginModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auth Mode Switcher */}
        <div className="px-6 pt-3 pb-1 border-b border-slate-100 flex gap-4">
          <button
            id="tab-demo-login"
            type="button"
            onClick={() => {
              setAuthMode('demo');
              setErrorMessage(null);
            }}
            className={`pb-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              authMode === 'demo'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>1-Click Stakeholder Quick Login</span>
          </button>
          <button
            id="tab-cred-login"
            type="button"
            onClick={() => {
              setAuthMode('credentials');
              setErrorMessage(null);
            }}
            className={`pb-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              authMode === 'credentials'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Email & Password Login</span>
          </button>
        </div>

        {/* Notice / Error banner */}
        {errorMessage ? (
          <div className="px-6 py-2.5 bg-rose-50 border-b border-rose-200 text-xs text-rose-800 flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        ) : (
          <div className="px-6 py-2 bg-emerald-50/70 border-b border-emerald-100 text-xs text-emerald-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Supabase Connected:</strong> JWT authenticated sessions with row-level security.
            </span>
          </div>
        )}

        {/* Content Body */}
        {authMode === 'demo' ? (
          <div className="p-6 overflow-y-auto space-y-3">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Select Stakeholder Role:
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {ROLES.map((r) => {
                const Icon = r.icon;
                const isSelected = selectedRole === r.role;
                return (
                  <button
                    key={r.role}
                    id={`role-login-card-${r.role.toLowerCase()}`}
                    type="button"
                    onClick={() => handleRoleSelect(r.role)}
                    className={`text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 relative ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/20 shadow-xs'
                        : `${r.bgColor}`
                    }`}
                  >
                    <div className={`p-2 rounded-lg bg-white shadow-2xs ${r.color} shrink-0`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-slate-900 truncate">{r.title}</h4>
                      </div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                        {r.badge}
                      </span>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                        {r.subtitle}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="absolute top-3 right-3 text-emerald-600">
                        <CheckCircle2 className="w-5 h-5 fill-emerald-100" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <form onSubmit={handleCredentialLogin} className="p-6 overflow-y-auto space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  id="login-email-input"
                  type="email"
                  required
                  placeholder="operator@farmtracer.demo"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  id="login-password-input"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>
            </div>

            <div className="text-xs text-slate-500 pt-2">
              <span className="font-semibold text-slate-700">Demo Accounts Available:</span> All roles configured with password <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-emerald-700">password123</code>.
            </div>
          </form>
        )}

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            Need a new organization?{' '}
            <button
              onClick={() => {
                setLoginModalOpen(false);
                setRegisterModalOpen(true);
              }}
              className="text-emerald-700 hover:text-emerald-800 font-bold underline"
            >
              Register Stakeholder
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              id="cancel-login-btn"
              type="button"
              onClick={() => setLoginModalOpen(false)}
              className="flex-1 sm:flex-initial px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs md:text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              id="confirm-role-login-btn"
              type="button"
              disabled={loading}
              onClick={authMode === 'demo' ? handleDemoLogin : (e) => handleCredentialLogin(e as any)}
              className="flex-1 sm:flex-initial px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs md:text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>{authMode === 'demo' ? `Login as ${selectedRole}` : 'Sign In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
