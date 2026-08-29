import React, { useState, useEffect } from 'react';
import { useAuthRole } from '../../context/AuthRoleContext';
import { StakeholderRole } from '../../types';
import { authService, OrganizationOption } from '../../services/authService';
import { FarmTracerLogo } from '../brand/FarmTracerLogo';
import {
  X,
  Building2,
  User,
  Mail,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  KeyRound,
  AlertCircle,
  Loader2,
  Tractor,
  Store,
  Warehouse,
  Factory,
  Truck,
  ShoppingBag,
  ShieldAlert,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

const REGISTRATION_ROLES: { role: StakeholderRole; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { role: 'FARMER', label: 'Farmer / FPO Origin', icon: Tractor },
  { role: 'MANDI', label: 'Mandi / APMC Collection Hub', icon: Store },
  { role: 'WAREHOUSE', label: 'Solar Cold Storage Vault', icon: Warehouse },
  { role: 'PROCESSOR', label: 'Processor / Flour Mill', icon: Factory },
  { role: 'TRANSPORTER', label: 'Reefer Logistics Carrier', icon: Truck },
  { role: 'RETAILER', label: 'Retailer / Superstore', icon: ShoppingBag },
  { role: 'AUTHORITY', label: 'Food Safety Inspector', icon: ShieldAlert },
];

export const RegisterModal: React.FC = () => {
  const { isRegisterModalOpen, setRegisterModalOpen, registerUser, setLoginModalOpen } = useAuthRole();
  const [role, setRole] = useState<StakeholderRole>('FARMER');
  const [orgMode, setOrgMode] = useState<'existing' | 'new'>('existing');
  const [selectedOrgId, setSelectedOrgId] = useState('');
  const [newOrgName, setNewOrgName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [location, setLocation] = useState('');
  const [complianceConsent, setComplianceConsent] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [organizations, setOrganizations] = useState<OrganizationOption[]>([]);

  useEffect(() => {
    if (isRegisterModalOpen) {
      authService.fetchOrganizations().then((orgs) => {
        setOrganizations(orgs);
        if (orgs.length > 0 && !selectedOrgId) {
          setSelectedOrgId(orgs[0].id);
        }
      });
    }
  }, [isRegisterModalOpen]);

  if (!isRegisterModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !contactName) {
      setErrorMessage('Please fill in your full name, work email, and password.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (orgMode === 'new' && !newOrgName.trim()) {
      setErrorMessage('Please provide your organization or facility name.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await registerUser({
        email,
        password,
        fullName: contactName,
        role,
        organizationId: orgMode === 'existing' ? selectedOrgId : undefined,
        newOrganizationName: orgMode === 'new' ? newOrgName : undefined,
        location: location || 'Maharashtra, India',
        language: 'en',
      });

      if (!res.success) {
        setErrorMessage(res.error || 'Failed to register account.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="register-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="register-modal-title"
    >
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/90">
          <div className="flex items-center gap-3">
            <FarmTracerLogo variant="icon-only" size="sm" />
            <div>
              <h3 id="register-modal-title" className="font-bold text-slate-900 text-lg font-['Space_Grotesk',sans-serif]">
                Register Supply Chain Entity
              </h3>
              <p className="text-xs text-slate-500">
                Join the FarmTracer Verified Traceability Network
              </p>
            </div>
          </div>
          <button
            id="close-register-modal-btn"
            onClick={() => setRegisterModalOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            title="Close Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice / Error Banner */}
        {errorMessage ? (
          <div className="px-6 py-2.5 bg-rose-50 border-b border-rose-200 text-xs text-rose-800 flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        ) : (
          <div className="px-6 py-2 bg-emerald-50/70 border-b border-emerald-100 text-xs text-emerald-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Enterprise Onboarding:</strong> Creates verified profile tied to certified supply chain node.
            </span>
          </div>
        )}

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 max-h-[calc(92vh-160px)]">
          {/* Section 1: Role Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              1. Select Supply Chain Operational Role
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {REGISTRATION_ROLES.map((r) => {
                const Icon = r.icon;
                const isSelected = role === r.role;
                return (
                  <button
                    key={r.role}
                    type="button"
                    onClick={() => setRole(r.role)}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/30 text-emerald-900 shadow-2xs font-bold'
                        : 'bg-slate-50/60 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className={`p-2 rounded-xl border ${isSelected ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-500 border-slate-200'}`}>
                      <Icon className="w-4 h-4" />
                    </span>
                    <span className="text-xs">{r.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Organization Association */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                2. Organization / Facility Details
              </label>
              <div className="flex bg-slate-100 p-0.5 rounded-lg text-[11px]">
                <button
                  type="button"
                  onClick={() => setOrgMode('existing')}
                  className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                    orgMode === 'existing' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-500'
                  }`}
                >
                  Join Existing
                </button>
                <button
                  type="button"
                  onClick={() => setOrgMode('new')}
                  className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                    orgMode === 'new' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-500'
                  }`}
                >
                  Register New
                </button>
              </div>
            </div>

            {orgMode === 'existing' ? (
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <select
                  value={selectedOrgId}
                  onChange={(e) => setSelectedOrgId(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-xs font-medium bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name} ({org.city ? `${org.city}, ${org.state}` : org.type})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  placeholder="e.g. Sahyadri Agro Farmers Co-op"
                  className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Section 3: Contact & Account Credentials */}
          <div className="space-y-3 pt-1">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              3. Custodian & Account Credentials
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Full Name / Authorized Signatory
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="e.g. Anand Deshmukh"
                    className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Operating Location (City, State)
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Nashik, Maharashtra"
                    className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Work Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="anand@sahyadriagro.in"
                    className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Create Password (Min 6 chars)
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Compliance & Consent Declaration */}
          <div className="pt-2">
            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600">
              <input
                type="checkbox"
                checked={complianceConsent}
                onChange={(e) => setComplianceConsent(e.target.checked)}
                className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>
                I agree to submit verifiable farm/facility telemetry, temperature logs, and photographic evidence for custody transfers under the FarmTracer 100-pt Integrity model.
              </span>
            </label>
          </div>

          {/* Submit Registration Button */}
          <button
            id="submit-register-btn"
            type="submit"
            disabled={loading || !complianceConsent}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 mt-4 active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Registering Stakeholder Account...</span>
              </>
            ) : (
              <>
                <span>Complete Registration & Open Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Modal Footer Navigation */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Already have a registered account or want to use a demo persona?
          </span>
          <button
            id="switch-to-login-btn"
            type="button"
            onClick={() => {
              setRegisterModalOpen(false);
              setLoginModalOpen(true);
            }}
            className="text-emerald-700 font-bold hover:text-emerald-800 underline"
          >
            Sign In to Existing Account →
          </button>
        </div>
      </div>
    </div>
  );
};
