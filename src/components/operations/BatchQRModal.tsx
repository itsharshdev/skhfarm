import React, { useState } from 'react';
import { Batch } from '../../types';
import { FarmTracerLogo } from '../brand/FarmTracerLogo';
import { QRCodeGenerator } from '../qr/QRCodeGenerator';
import { buildPublicTraceUrl } from '../../utils/qrUtils';
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

  const publicUrl = buildPublicTraceUrl(batch.batchId);

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      id="batch-qr-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="batch-qr-modal-title"
    >
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <FarmTracerLogo variant="icon-only" size="xs" />
            <div>
              <h3 id="batch-qr-modal-title" className="font-bold text-slate-900 text-base font-['Space_Grotesk',sans-serif]">
                Batch Traceability Label
              </h3>
              <p className="text-xs text-slate-500 font-mono">{batch.batchId}</p>
            </div>
          </div>
          <button
            id="close-qr-modal-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Card Area */}
        <div className="p-6 space-y-5 overflow-y-auto print:p-0">
          <div className="bg-gradient-to-br from-slate-50 to-emerald-50/40 p-5 rounded-2xl border-2 border-dashed border-emerald-300 text-center space-y-4">
            {/* Top Brand & Super PS Tag */}
            <div className="flex items-center justify-between px-1">
              <FarmTracerLogo variant="compact" size="xs" />
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-700 text-white rounded-full text-[9px] font-extrabold tracking-wide uppercase">
                <ShieldCheck className="w-3 h-3" />
                <span>Verified Super-PS Trace QR</span>
              </div>
            </div>

            {/* Authentic ISO QR Code Generator */}
            <QRCodeGenerator
              batchId={batch.batchId}
              productName={batch.productName}
              size={180}
              includeLogo={true}
              showActions={false}
            />

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

          {/* Action Buttons for Stakeholders */}
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
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
                  } else {
                    window.location.hash = `#trace/${batch.batchId}`;
                    onClose();
                  }
                }}
                className="py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Public Trace</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
