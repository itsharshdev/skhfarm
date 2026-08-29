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
} from 'lucide-react';

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
      setErrorMessage('Please fill in all required fields.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
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
        location,
        language: 'en',
      });

      if (!res.success) {
        setErrorMessage(res.error || 'Failed to register account.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="stakeholder-register-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fadeIn"
    >
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <FarmTracerLogo variant="icon-only" size="sm" />
            <div>
              <h3 className="font-bold text-slate-900 text-lg font-['Space_Grotesk',sans-serif]">Register Stakeholder</h3>
              <p className="text-xs text-slate-500">Live Supabase Registration & Profile Association</p>
            </div>
          </div>
          <button
            id="close-register-modal-btn"
            onClick={() => setRegisterModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error / Notice banner */}
        {errorMessage && (
          <div className="px-6 py-2.5 bg-rose-50 border-b border-rose-200 text-xs text-rose-800 flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Supply Chain Role
            </label>
            <select
              id="register-role-select"
              value={role}
              onChange={(e) => setRole(e.target.value as StakeholderRole)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            >
              <option value="FARMER">Farmer / FPO Origin</option>
              <option value="MANDI">Mandi / Collection Hub</option>
              <option value="WAREHOUSE">Solar Smart Storage / Cold Vault</option>
              <option value="TRANSPORTER">Logistics / Transporter</option>
              <option value="PROCESSOR">Processor / Mill / Factory</option>
              <option value="RETAILER">Retailer / Superstore</option>
              <option value="AUTHORITY">Food Safety Regulator</option>
              <option value="ADMIN">Platform Admin</option>
            </select>
          </div>

          {/* Organization Association */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Organization / Facility
              </label>
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setOrgMode('existing')}
                  className={`font-semibold ${
                    orgMode === 'existing' ? 'text-emerald-700 underline' : 'text-slate-500'
                  }`}
                >
                  Join Existing
                </button>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={() => setOrgMode('new')}
                  className={`font-semibold ${
                    orgMode === 'new' ? 'text-emerald-700 underline' : 'text-slate-500'
                  }`}
                >
                  Create New
                </button>
              </div>
            </div>

            {orgMode === 'existing' ? (
              <select
                id="register-org-select"
                value={selectedOrgId}
                onChange={(e) => setSelectedOrgId(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              >
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name} ({org.type} - {org.city || 'MH'})
                  </option>
                ))}
              </select>
            ) : (
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  id="register-org-input"
                  type="text"
                  required
                  placeholder="e.g. Sahyadri Organic Farmer Producer Co."
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  id="register-contact-input"
                  type="text"
                  required
                  placeholder="Ramesh Patil"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  id="register-email-input"
                  type="email"
                  required
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  id="register-password-input"
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Operating Location
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  id="register-location-input"
                  type="text"
                  placeholder="Kopargaon, Maharashtra"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              Real registration writes to Supabase Auth & public profiles, enforcing secure role-based Row Level Security.
            </span>
          </div>

          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setRegisterModalOpen(false);
                setLoginModalOpen(true);
              }}
              className="text-xs text-slate-600 hover:text-slate-900 font-semibold"
            >
              Existing account? Sign In
            </button>
            <button
              id="submit-register-btn"
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs md:text-sm font-bold transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Registering...</span>
                </>
              ) : (
                <span>Complete Registration</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
