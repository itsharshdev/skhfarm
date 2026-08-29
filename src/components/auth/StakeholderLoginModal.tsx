import React, { useState } from 'react';
import { useAuthRole } from '../../context/AuthRoleContext';
import { StakeholderRole } from '../../types';
import { authService } from '../../services/authService';
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
  Eye,
  EyeOff,
  HelpCircle,
  Info,
} from 'lucide-react';
import { FarmTracerLogo } from '../brand/FarmTracerLogo';

interface RoleOption {
  role: StakeholderRole;
  title: string;
  email: string;
  purpose: string;
  primaryTasks: string[];
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  badge: string;
}

const ROLES: RoleOption[] = [
  {
    role: 'FARMER',
    title: 'Farmer / FPO Origin',
    email: 'farmer@farmtracer.demo',
    purpose: 'Register farm harvest batches, record geo-origin & field quality proofs.',
    primaryTasks: ['Log harvest lots', 'Attach photo evidence', 'Transfer to collection center'],
    icon: Tractor,
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50 border-emerald-200 hover:border-emerald-500',
    badge: 'Origin Producer',
  },
  {
    role: 'MANDI',
    title: 'Mandi / APMC Hub',
    email: 'mandi@farmtracer.demo',
    purpose: 'Weighbridge intake, grade verification & initial storage allocation.',
    primaryTasks: ['Calibrate weighbridge', 'Submit quality rating', 'Route to solar storage'],
    icon: Store,
    color: 'text-amber-700',
    bgColor: 'bg-amber-50 border-amber-200 hover:border-amber-500',
    badge: 'APMC Hub',
  },
  {
    role: 'WAREHOUSE',
    title: 'Solar Smart Storage / Cold Vault',
    email: 'warehouse@farmtracer.demo',
    purpose: 'Monitor solar power, temperature bounds & cold storage intake.',
    primaryTasks: ['Monitor SKH030 solar vault', 'Log micro-climate temp/RH', 'Dispatch cold lots'],
    icon: Warehouse,
    color: 'text-teal-700',
    bgColor: 'bg-teal-50 border-teal-200 hover:border-teal-500',
    badge: 'Cold-Chain Vault',
  },
  {
    role: 'PROCESSOR',
    title: 'Processor / Mill / Factory',
    email: 'processor@farmtracer.demo',
    purpose: 'Transform raw commodities into intermediate & final packaged goods.',
    primaryTasks: ['Multi-parent batching', 'Milling transformations', 'Produce retail lots'],
    icon: Factory,
    color: 'text-purple-700',
    bgColor: 'bg-purple-50 border-purple-200 hover:border-purple-500',
    badge: 'Transformation',
  },
  {
    role: 'TRANSPORTER',
    title: 'Logistics / Transporter',
    email: 'transporter@farmtracer.demo',
    purpose: 'Reefer transit, route checkpoints & handoff delivery confirmations.',
    primaryTasks: ['Track reefer vehicles', 'Record GPS checkpoints', 'Confirm retail deliveries'],
    icon: Truck,
    color: 'text-blue-700',
    bgColor: 'bg-blue-50 border-blue-200 hover:border-blue-500',
    badge: 'Transit Carrier',
  },
  {
    role: 'RETAILER',
    title: 'Retailer / Storefront',
    email: 'retailer@farmtracer.demo',
    purpose: 'Receive shelf inventory, verify QR tags & handle consumer reviews.',
    primaryTasks: ['Scan inbound inventory', 'Display QR shelf tags', 'Monitor product shelf-life'],
    icon: ShoppingBag,
    color: 'text-orange-700',
    bgColor: 'bg-orange-50 border-orange-200 hover:border-orange-500',
    badge: 'Retail Point',
  },
  {
    role: 'AUTHORITY',
    title: 'Food Safety Regulator / Inspector',
    email: 'authority@farmtracer.demo',
    purpose: 'Audit 100-pt scores, trace lineages, inspect alerts & compliance.',
    primaryTasks: ['Audit compliance & certificates', 'Enforce batch recalls', 'Inspect risk alerts'],
    icon: ShieldAlert,
    color: 'text-rose-700',
    bgColor: 'bg-rose-50 border-rose-200 hover:border-rose-500',
    badge: 'Audit & Safety',
  },
  {
    role: 'ADMIN',
    title: 'Platform Administrator',
    email: 'admin@farmtracer.demo',
    purpose: 'Configure supply chains, organizations, users & platform parameters.',
    primaryTasks: ['Manage organizations', 'Simulate harvest events', 'Reset test datasets'],
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

  const [authMode, setAuthMode] = useState<'demo' | 'credentials' | 'recovery'>('demo');
  const [selectedRole, setSelectedRole] = useState<StakeholderRole>('FARMER');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoverySuccess, setRecoverySuccess] = useState(false);
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
      setErrorMessage('Please enter both work email and password.');
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

  const handlePasswordRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryEmail) {
      setErrorMessage('Please enter your account email address.');
      return;
    }
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await authService.resetPassword(recoveryEmail);
      if (res.error) {
        setErrorMessage(res.error.message);
      } else {
        setRecoverySuccess(true);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to send password reset email.');
    } finally {
      setLoading(false);
    }
  };

  const currentRoleObj = ROLES.find((r) => r.role === selectedRole) || ROLES[0];

  return (
    <div
      id="stakeholder-login-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="stakeholder-login-modal-title"
    >
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/90">
          <div className="flex items-center gap-3">
            <FarmTracerLogo variant="icon-only" size="sm" />
            <div>
              <h3 id="stakeholder-login-modal-title" className="font-bold text-slate-900 text-lg font-['Space_Grotesk',sans-serif]">
                Stakeholder Access Portal
              </h3>
              <p className="text-xs text-slate-500">
                Supply Chain Authentication & Dashboard Access
              </p>
            </div>
          </div>
          <button
            id="close-login-modal-btn"
            onClick={() => setLoginModalOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            title="Close Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-3 pb-1 border-b border-slate-100 flex gap-4 bg-white">
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
            <Sparkles className="w-4 h-4" />
            <span>1-Click Seeded Stakeholder Login</span>
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
            <KeyRound className="w-4 h-4" />
            <span>Email & Password</span>
          </button>

          {authMode === 'recovery' && (
            <button
              type="button"
              className="pb-2.5 text-xs font-bold border-b-2 border-emerald-600 text-emerald-700 flex items-center gap-1.5"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Password Recovery</span>
            </button>
          )}
        </div>

        {/* Notice / Error Banner */}
        {errorMessage ? (
          <div className="px-6 py-2.5 bg-rose-50 border-b border-rose-200 text-xs text-rose-800 flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        ) : (
          <div className="px-6 py-2 bg-emerald-50/70 border-b border-emerald-100 text-xs text-emerald-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Live Supabase Auth:</strong> Realtime JWT session security & RBAC.
              </span>
            </div>
            <span className="text-[11px] text-emerald-700 font-mono hidden sm:inline">
              Port 3000 Verified
            </span>
          </div>
        )}

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 max-h-[calc(92vh-180px)]">
          {/* ========================================================================= */}
          {/* 1. DEMO ROLE FAST LOGIN MODE */}
          {/* ========================================================================= */}
          {authMode === 'demo' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Select Your Supply Chain Role
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  1-Click access to live seeded personas representing each stage of the post-harvest supply chain.
                </p>
              </div>

              {/* 8-Role Grid Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {ROLES.map((r) => {
                  const Icon = r.icon;
                  const isSelected = selectedRole === r.role;
                  return (
                    <div
                      key={r.role}
                      id={`demo-role-select-${r.role.toLowerCase()}`}
                      onClick={() => handleRoleSelect(r.role)}
                      className={`cursor-pointer p-4 rounded-2xl border transition-all flex flex-col justify-between select-none ${
                        isSelected
                          ? `${r.bgColor} ring-2 ring-emerald-500 shadow-md`
                          : 'bg-slate-50/70 border-slate-200/80 hover:bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`p-2 rounded-xl border ${r.color} bg-white shadow-2xs`}>
                          <Icon className="w-4 h-4" />
                        </span>
                        <span className="text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-slate-200/70 text-slate-600 font-mono">
                          {r.role}
                        </span>
                      </div>

                      <div>
                        <h5 className="font-bold text-xs text-slate-900 line-clamp-1">{r.title}</h5>
                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-snug">
                          {r.purpose}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected Role In-Depth Card */}
              <div className="p-4 bg-slate-900 rounded-2xl text-white space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                      Selected Demo Persona
                    </span>
                    <h4 className="font-bold text-sm text-white">
                      {currentRoleObj.title} ({currentRoleObj.email})
                    </h4>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-xs border border-emerald-500/30">
                    Seeded & Verified Profile
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-300">
                  {currentRoleObj.primaryTasks.map((task, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                      <span className="truncate">{task}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Password preset to verified demo sandbox credentials.
                  </span>
                  <button
                    id="submit-demo-login-btn"
                    type="button"
                    disabled={loading}
                    onClick={handleDemoLogin}
                    className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md flex items-center gap-2 active:scale-95 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Signing In...</span>
                      </>
                    ) : (
                      <>
                        <span>Launch {currentRoleObj.title.split('/')[0]} Dashboard</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 2. EMAIL & PASSWORD LOGIN MODE */}
          {/* ========================================================================= */}
          {authMode === 'credentials' && (
            <form onSubmit={handleCredentialLogin} className="space-y-4 max-w-md mx-auto py-2 animate-fadeIn">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Work Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    id="login-email-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. operator@mahaagro.in"
                    className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700">Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('recovery');
                      setRecoveryEmail(email);
                      setErrorMessage(null);
                    }}
                    className="text-[11px] text-emerald-700 hover:text-emerald-800 font-bold"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    id="login-password-input"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 absolute right-2.5 top-2"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                id="submit-cred-login-btn"
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 mt-2 active:scale-95 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Stakeholder Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ========================================================================= */}
          {/* 3. PASSWORD RECOVERY MODE */}
          {/* ========================================================================= */}
          {authMode === 'recovery' && (
            <div className="max-w-md mx-auto py-2 space-y-4 animate-fadeIn">
              {recoverySuccess ? (
                <div className="p-6 text-center space-y-3 bg-emerald-50 rounded-2xl border border-emerald-200">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h4 className="font-bold text-sm text-emerald-950">Password Reset Link Dispatched</h4>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    If an account exists for <strong>{recoveryEmail}</strong>, an authenticated password reset link has been dispatched to your inbox.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('credentials');
                      setRecoverySuccess(false);
                    }}
                    className="px-4 py-2 bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-2xs hover:bg-emerald-800"
                  >
                    Return to Sign In
                  </button>
                </div>
              ) : (
                <form onSubmit={handlePasswordRecovery} className="space-y-4">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Reset Account Password</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Enter the email associated with your stakeholder organization.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Account Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        id="recovery-email-input"
                        type="email"
                        value={recoveryEmail}
                        onChange={(e) => setRecoveryEmail(e.target.value)}
                        placeholder="operator@mahaagro.in"
                        className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setAuthMode('credentials')}
                      className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Send Reset Link'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Navigation */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Need to register a new organization or facility?
          </span>
          <button
            id="switch-to-register-btn"
            type="button"
            onClick={() => {
              setLoginModalOpen(false);
              setRegisterModalOpen(true);
            }}
            className="text-emerald-700 font-bold hover:text-emerald-800 underline"
          >
            Create Stakeholder Account →
          </button>
        </div>
      </div>
    </div>
  );
};
