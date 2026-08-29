import React, { useState } from 'react';
import { useAuthRole } from '../../context/AuthRoleContext';
import { StakeholderRole } from '../../types';
import { X, Building2, User, Mail, MapPin, CheckCircle2, ShieldCheck } from 'lucide-react';

export const RegisterModal: React.FC = () => {
  const { isRegisterModalOpen, setRegisterModalOpen, loginAsRole, setLoginModalOpen } = useAuthRole();
  const [role, setRole] = useState<StakeholderRole>('FARMER');
  const [orgName, setOrgName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isRegisterModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      loginAsRole(role);
      setSubmitted(false);
      setRegisterModalOpen(false);
    }, 1000);
  };

  return (
    <div
      id="stakeholder-register-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fadeIn"
    >
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-600 text-white">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Register Stakeholder Organization</h3>
              <p className="text-xs text-slate-500">Join the Farm Tracer Food Traceability Network</p>
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
              <option value="CUSTOM">Custom Supply Chain</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Organization / Farm Collective Name
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                id="register-org-input"
                type="text"
                required
                placeholder="e.g. Sahyadri Organic Farmer Producer Co."
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Contact Person
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  id="register-contact-input"
                  type="text"
                  required
                  placeholder="Full Name"
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
                  placeholder="contact@org.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Operating Location / District
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                id="register-location-input"
                type="text"
                required
                placeholder="e.g. Ahmednagar District, Maharashtra"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              All registered stakeholders undergo decentralized peer verification and camera-evidence authentication on every batch handoff.
            </span>
          </div>

          {submitted && (
            <div className="p-3 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Demo organization profile created! Logging you into the portal...</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setRegisterModalOpen(false);
                setLoginModalOpen(true);
              }}
              className="text-xs text-slate-600 hover:text-slate-900 font-semibold"
            >
              Existing user? Sign In
            </button>
            <button
              id="submit-register-btn"
              type="submit"
              disabled={submitted}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs md:text-sm font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              <span>Complete Demo Registration</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
