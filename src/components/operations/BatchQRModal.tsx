import React, { useState } from 'react';
import { Batch } from '../../types';
import { QrCode, X, Copy, Check, Download, Printer, ExternalLink, ShieldCheck, Sun } from 'lucide-react';

interface BatchQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  batch: Batch;
  onInspectBatch?: (batchId: string) => void;
}

export const BatchQRModal: React.FC<BatchQRModalProps> = ({
  isOpen,
  onClose,
  batch,
  onInspectBatch,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const qrValue = batch.qrCodeString || `FARM-TRACER://BATCH/${batch.batchId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(qrValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  // Generate SVG QR Code representation with high-density matrix styling
  return (
    <div
      id="batch-qr-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn"
    >
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
              <QrCode className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Batch Traceability Label</h3>
              <p className="text-xs text-slate-500 font-mono">{batch.batchId}</p>
            </div>
          </div>
          <button
            id="close-qr-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Card Area */}
        <div className="p-6 space-y-5 overflow-y-auto print:p-0">
          <div className="bg-gradient-to-br from-slate-50 to-emerald-50/40 p-5 rounded-2xl border-2 border-dashed border-emerald-300 text-center space-y-4">
            {/* Super PS Tag */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-700 text-white rounded-full text-[10px] font-extrabold tracking-wide uppercase">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Super-PS Trace QR</span>
            </div>

            {/* QR Code Container */}
            <div className="w-48 h-48 mx-auto bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center relative group">
              {/* Responsive SVG QR code representation */}
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {/* 3 Corner Anchor Boxes */}
                <rect x="5" y="5" width="26" height="26" fill="#0f172a" rx="4" />
                <rect x="9" y="9" width="18" height="18" fill="#ffffff" rx="2" />
                <rect x="13" y="13" width="10" height="10" fill="#047857" rx="1.5" />

                <rect x="69" y="5" width="26" height="26" fill="#0f172a" rx="4" />
                <rect x="73" y="9" width="18" height="18" fill="#ffffff" rx="2" />
                <rect x="77" y="13" width="10" height="10" fill="#047857" rx="1.5" />

                <rect x="5" y="69" width="26" height="26" fill="#0f172a" rx="4" />
                <rect x="9" y="73" width="18" height="18" fill="#ffffff" rx="2" />
                <rect x="13" y="77" width="10" height="10" fill="#047857" rx="1.5" />

                {/* Data Matrix Matrix Dots */}
                <rect x="36" y="8" width="5" height="5" fill="#0f172a" rx="1" />
                <rect x="44" y="8" width="5" height="5" fill="#0f172a" rx="1" />
                <rect x="54" y="8" width="5" height="5" fill="#047857" rx="1" />
                <rect x="40" y="18" width="5" height="5" fill="#0f172a" rx="1" />
                <rect x="50" y="18" width="5" height="5" fill="#0f172a" rx="1" />
                <rect x="58" y="18" width="5" height="5" fill="#047857" rx="1" />

                <rect x="8" y="38" width="5" height="5" fill="#047857" rx="1" />
                <rect x="18" y="38" width="5" height="5" fill="#0f172a" rx="1" />
                <rect x="28" y="38" width="5" height="5" fill="#0f172a" rx="1" />
                <rect x="38" y="38" width="24" height="24" fill="#065f46" rx="3" />
                <rect x="68" y="38" width="5" height="5" fill="#0f172a" rx="1" />
                <rect x="78" y="38" width="5" height="5" fill="#047857" rx="1" />
                <rect x="88" y="38" width="5" height="5" fill="#0f172a" rx="1" />

                <rect x="8" y="48" width="5" height="5" fill="#0f172a" rx="1" />
                <rect x="18" y="48" width="5" height="5" fill="#047857" rx="1" />
                <rect x="68" y="48" width="5" height="5" fill="#0f172a" rx="1" />
                <rect x="80" y="48" width="5" height="5" fill="#0f172a" rx="1" />

                <rect x="8" y="58" width="5" height="5" fill="#047857" rx="1" />
                <rect x="22" y="58" width="5" height="5" fill="#0f172a" rx="1" />
                <rect x="68" y="58" width="5" height="5" fill="#047857" rx="1" />
                <rect x="78" y="58" width="5" height="5" fill="#0f172a" rx="1" />
                <rect x="88" y="58" width="5" height="5" fill="#0f172a" rx="1" />

                <rect x="38" y="68" width="5" height="5" fill="#0f172a" rx="1" />
                <rect x="48" y="68" width="5" height="5" fill="#047857" rx="1" />
                <rect x="58" y="68" width="5" height="5" fill="#0f172a" rx="1" />
                <rect x="70" y="74" width="5" height="5" fill="#0f172a" rx="1" />
                <rect x="80" y="74" width="5" height="5" fill="#047857" rx="1" />
                <rect x="42" y="80" width="5" height="5" fill="#047857" rx="1" />
                <rect x="54" y="80" width="5" height="5" fill="#0f172a" rx="1" />
                <rect x="72" y="84" width="5" height="5" fill="#0f172a" rx="1" />
                <rect x="82" y="84" width="5" height="5" fill="#0f172a" rx="1" />

                {/* Central Sprout Logo in QR center */}
                <circle cx="50" cy="50" r="7" fill="#ffffff" />
                <circle cx="50" cy="50" r="5" fill="#10b981" />
              </svg>
            </div>

            {/* Product Meta */}
            <div>
              <h4 className="font-bold text-slate-900 text-sm leading-snug">{batch.productName}</h4>
              <p className="text-xs text-slate-500 font-mono mt-0.5">{batch.batchId}</p>
              <div className="mt-2 flex items-center justify-center gap-2 text-xs">
                <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                  Score: {batch.scoreBreakdown.totalScore}/100
                </span>
                <span className="text-slate-500">
                  {batch.quantity} {batch.unit}
                </span>
              </div>
            </div>

            {/* Cold Chain Tag */}
            {batch.currentStorage && (
              <div className="text-[11px] text-teal-800 bg-teal-50 border border-teal-200 py-1 px-2.5 rounded-lg inline-flex items-center gap-1">
                <Sun className="w-3.5 h-3.5 text-teal-600" />
                <span>Solar Cold-Chain Monitored · Safe Bounds</span>
              </div>
            )}
          </div>

          {/* Value String & Actions */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="font-mono text-xs text-slate-700 flex-1 truncate">{qrValue}</span>
              <button
                type="button"
                onClick={handleCopy}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print QR Label</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onInspectBatch) {
                    onInspectBatch(batch.batchId);
                    onClose();
                  }
                }}
                className="py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Inspect Public Trace</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
