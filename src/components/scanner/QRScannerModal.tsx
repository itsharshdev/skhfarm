import React from 'react';
import { useAuthRole } from '../../context/AuthRoleContext';
import { QRCodeScanner } from '../qr/QRCodeScanner';
import { FarmTracerLogo } from '../brand/FarmTracerLogo';
import { X, QrCode, ShieldCheck } from 'lucide-react';
import { QrParseResult } from '../../utils/qrUtils';

interface QRScannerModalProps {
  onScanComplete?: (batchId: string) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({ onScanComplete }) => {
  const { isScannerOpen, setScannerOpen, setActiveBatchId } = useAuthRole();

  if (!isScannerOpen) return null;

  const handleScanSuccess = (batchId: string, result?: QrParseResult) => {
    setActiveBatchId(batchId);
    if (onScanComplete) {
      onScanComplete(batchId);
    }
    setScannerOpen(false);
  };

  return (
    <div
      id="qr-scanner-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="qr-scanner-modal-title"
    >
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/90">
          <div className="flex items-center gap-3">
            <FarmTracerLogo variant="icon-only" size="sm" />
            <div>
              <h3 id="qr-scanner-modal-title" className="font-bold text-slate-900 text-base font-['Space_Grotesk',sans-serif]">
                Scan FarmTracer QR Code
              </h3>
              <p className="text-xs text-slate-500">
                Universal Live Camera, Image Upload, or Batch ID
              </p>
            </div>
          </div>
          <button
            id="close-scanner-btn"
            onClick={() => setScannerOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            title="Close Scanner"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dedicated Universal Scanner */}
        <div className="overflow-y-auto max-h-[calc(92vh-80px)]">
          <QRCodeScanner
            onScanSuccess={handleScanSuccess}
            onClose={() => setScannerOpen(false)}
          />
        </div>
      </div>
    </div>
  );
};
