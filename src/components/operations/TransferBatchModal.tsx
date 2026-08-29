import React, { useState } from 'react';
import { Batch, StakeholderRole } from '../../types';
import { traceService } from '../../services/traceService';
import { CameraEvidenceCaptureModal } from './CameraEvidenceCaptureModal';
import { ArrowRight, Truck, Warehouse, Factory, Store, Shield, X, Check, Camera, MapPin } from 'lucide-react';

interface TransferBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  batch: Batch;
  currentRole: StakeholderRole;
  currentUserName: string;
  onTransferComplete?: () => void;
}

export const TransferBatchModal: React.FC<TransferBatchModalProps> = ({
  isOpen,
  onClose,
  batch,
  currentRole,
  currentUserName,
  onTransferComplete,
}) => {
  const [toRole, setToRole] = useState<StakeholderRole>(() => {
    if (currentRole === 'FARMER') return 'MANDI';
    if (currentRole === 'MANDI') return 'WAREHOUSE';
    if (currentRole === 'WAREHOUSE') return 'PROCESSOR';
    if (currentRole === 'PROCESSOR') return 'RETAILER';
    if (currentRole === 'TRANSPORTER') return 'PROCESSOR';
    return 'RETAILER';
  });

  const [toOrgName, setToOrgName] = useState(() => {
    if (currentRole === 'FARMER') return 'Kopargaon APMC Grain Collection Hub';
    if (currentRole === 'MANDI') return 'MahaAgro Solar Cold Storage Unit #04';
    if (currentRole === 'WAREHOUSE') return 'Maharashtra Grain Mills Pvt Ltd';
    if (currentRole === 'PROCESSOR') return 'FreshMart Superstore Kopargaon';
    return 'Western Regional Distribution Center';
  });

  const [destinationLocation, setDestinationLocation] = useState('Kopargaon APMC Yard Gate 2');
  const [transitNotes, setTransitNotes] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);
  const [evidence, setEvidence] = useState<{ previewUrl: string; captureType: 'PHOTO' | 'VIDEO' } | null>(null);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);

  if (!isOpen) return null;

  const handleRoleChange = (role: StakeholderRole) => {
    setToRole(role);
    if (role === 'MANDI') {
      setToOrgName('Kopargaon APMC Grain Collection Hub');
      setDestinationLocation('APMC Market Yard, Kopargaon');
    } else if (role === 'WAREHOUSE') {
      setToOrgName('MahaAgro Solar Cold Storage Unit #04');
      setDestinationLocation('Shirdi-Kopargaon Link Highway Hub');
    } else if (role === 'TRANSPORTER') {
      setToOrgName('Kisan Express Agri-Transit Logistics');
      setDestinationLocation('Nashik-Pune Transit Corridor');
    } else if (role === 'PROCESSOR') {
      setToOrgName('Maharashtra Grain Mills Pvt Ltd');
      setDestinationLocation('Ambad MIDC, Nashik');
    } else if (role === 'RETAILER') {
      setToOrgName('FreshMart Superstore Kopargaon');
      setDestinationLocation('Station Road, Kopargaon');
    }
  };

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTransferring(true);
    try {
      await traceService.transferBatch(
        batch.batchId,
        currentUserName,
        currentRole,
        toRole,
        toOrgName,
        destinationLocation,
        transitNotes || 'Custody transfer initiated with verified handoff protocols.',
        evidence || undefined
      );
      if (onTransferComplete) onTransferComplete();
      onClose();
    } catch (err) {
      console.error('Transfer error:', err);
    } finally {
      setIsTransferring(false);
    }
  };

  const possibleRoles: { role: StakeholderRole; label: string; icon: React.ReactNode }[] = [
    { role: 'MANDI', label: 'Mandi Hub', icon: <Warehouse className="w-4 h-4" /> },
    { role: 'WAREHOUSE', label: 'Cold Storage Vault', icon: <Warehouse className="w-4 h-4" /> },
    { role: 'TRANSPORTER', label: 'Transit Logistics', icon: <Truck className="w-4 h-4" /> },
    { role: 'PROCESSOR', label: 'Mill / Processor', icon: <Factory className="w-4 h-4" /> },
    { role: 'RETAILER', label: 'Retail Store', icon: <Store className="w-4 h-4" /> },
  ];

  return (
    <div
      id="transfer-batch-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-fadeIn"
    >
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-emerald-100 text-emerald-800">
              <Truck className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Transfer Batch Custody</h3>
              <p className="text-xs text-slate-500 font-mono">
                {batch.batchId} · {batch.productName}
              </p>
            </div>
          </div>
          <button
            id="close-transfer-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleTransferSubmit} className="p-6 space-y-4 overflow-y-auto">
          {/* Current Custodian -> Target Custodian Indicator */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase">From (Current)</span>
              <span className="text-xs font-bold text-slate-900 block truncate max-w-[130px]">{batch.currentOwner}</span>
              <span className="text-[10px] text-emerald-700 font-semibold">{currentRole}</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 mx-2" />
            <div className="space-y-0.5 text-right">
              <span className="text-[10px] text-slate-400 font-bold uppercase">To (Recipient)</span>
              <span className="text-xs font-bold text-slate-900 block truncate max-w-[130px]">{toOrgName}</span>
              <span className="text-[10px] text-emerald-700 font-semibold">{toRole}</span>
            </div>
          </div>

          {/* Select Target Stakeholder Role */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">Transfer To Stakeholder Role</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {possibleRoles.map((r) => (
                <button
                  key={r.role}
                  type="button"
                  onClick={() => handleRoleChange(r.role)}
                  className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                    toRole === r.role
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-500/30'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {r.icon}
                  <span>{r.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Recipient Organization */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">Recipient Facility / Organization Name</label>
            <input
              type="text"
              required
              value={toOrgName}
              onChange={(e) => setToOrgName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>

          {/* Destination Location */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>Destination Receiving Bay / Address</span>
            </label>
            <input
              type="text"
              required
              value={destinationLocation}
              onChange={(e) => setDestinationLocation(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>

          {/* Transit & Handover Notes */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">Dispatch / Transit Instructions</label>
            <textarea
              rows={2}
              value={transitNotes}
              onChange={(e) => setTransitNotes(e.target.value)}
              placeholder="e.g. Dispatched via temperature-monitored reefer van #MH-17-EQ-8821. Seals verified."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white resize-none"
            />
          </div>

          {/* Camera Evidence Capture for Handover */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-emerald-700" />
                <span>Handover Camera Proof (Optional)</span>
              </span>
              <button
                type="button"
                onClick={() => setIsCameraModalOpen(true)}
                className="px-2.5 py-1 bg-white border border-slate-200 hover:border-emerald-500 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1"
              >
                <Camera className="w-3 h-3" />
                <span>{evidence ? 'Change Proof' : 'Capture Proof'}</span>
              </button>
            </div>
            {evidence ? (
              <div className="flex items-center gap-2 bg-emerald-100/60 p-2 rounded-xl text-xs text-emerald-900 font-medium">
                <img src={evidence.previewUrl} alt="Handover Proof" className="w-10 h-10 rounded-lg object-cover" />
                <div>
                  <span className="font-bold block">Live Evidence Attached</span>
                  <span className="text-[10px] text-emerald-700">Camera-only verified snapshot</span>
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-slate-500">
                Snap a live photo of loading, seals, or reefer thermostat to elevate handoff integrity score.
              </p>
            )}
          </div>

          {/* Submit Action */}
          <button
            id="confirm-batch-transfer-btn"
            type="submit"
            disabled={isTransferring}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>{isTransferring ? 'Dispatching...' : 'Confirm Handover & Dispatch'}</span>
          </button>
        </form>
      </div>

      {/* Camera Capture Sub-modal */}
      <CameraEvidenceCaptureModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onCaptureComplete={(ev) => setEvidence(ev)}
        batchContextTitle={batch.batchId}
        stageName="Custody Handover"
      />
    </div>
  );
};
