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
  Sliders,
  CheckCircle2,
  Lock,
  ArrowRight,
  Info,
} from 'lucide-react';

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
    subtitle: 'Monitor solar power, temperature bounds (SKH029/SKH030) & intake',
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
    subtitle: 'Transform raw commodities into intermediate & final branded goods',
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
  {
    role: 'CUSTOM',
    title: 'Custom Supply Chain',
    subtitle: 'Configurable multi-tier supply chain workflow & custom roles',
    icon: Sliders,
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-50 border-indigo-200 hover:border-indigo-500',
    badge: 'Custom Schema',
  },
];

export const StakeholderLoginModal: React.FC = () => {
  const { isLoginModalOpen, setLoginModalOpen, loginAsRole, setRegisterModalOpen } = useAuthRole();
  const [selectedRole, setSelectedRole] = useState<StakeholderRole>('FARMER');

  if (!isLoginModalOpen) return null;

  const handleRoleSelect = (role: StakeholderRole) => {
    setSelectedRole(role);
  };

  const handleConfirmLogin = () => {
    loginAsRole(selectedRole);
  };

  return (
    <div
      id="stakeholder-login-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fadeIn"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-900 text-white">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Stakeholder Demo Login</h3>
              <p className="text-xs text-slate-500">Select a supply-chain participant profile to simulate</p>
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

        {/* Notice */}
        <div className="px-6 py-2.5 bg-emerald-50/80 border-b border-emerald-100 text-xs text-emerald-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Frontend Prototype Mode:</strong> 1-Click login without credentials. Supabase Auth will be integrated in future phases.
            </span>
          </div>
        </div>

        {/* Roles Grid */}
        <div className="p-6 overflow-y-auto space-y-3">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Choose Stakeholder Persona:
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {ROLES.map((r) => {
              const Icon = r.icon;
              const isSelected = selectedRole === r.role;
              return (
                <button
                  key={r.role}
                  id={`role-login-card-${r.role.toLowerCase()}`}
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

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            Need a new account?{' '}
            <button
              onClick={() => {
                setLoginModalOpen(false);
                setRegisterModalOpen(true);
              }}
              className="text-emerald-700 hover:text-emerald-800 font-bold underline"
            >
              Register Organization
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              id="cancel-login-btn"
              onClick={() => setLoginModalOpen(false)}
              className="flex-1 sm:flex-initial px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs md:text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              id="confirm-role-login-btn"
              onClick={handleConfirmLogin}
              className="flex-1 sm:flex-initial px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs md:text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
            >
              <span>Login as {selectedRole}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
