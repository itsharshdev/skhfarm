import React, { useState, useRef, useEffect } from 'react';
import { useAuthRole } from '../../context/AuthRoleContext';
import { X, Camera, QrCode, Keyboard, Sparkles, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { ALL_DEMO_BATCHES } from '../../data/mockData';

interface QRScannerModalProps {
  onScanComplete?: (batchId: string) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({ onScanComplete }) => {
  const { isScannerOpen, setScannerOpen, setActiveBatchId } = useAuthRole();
  const [manualCode, setManualCode] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isSimulatingScan, setIsSimulatingScan] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isScannerOpen) {
      startCamera();
    } else {
      stopCamera();
      setCameraError(null);
      setIsSimulatingScan(false);
    }
    return () => {
      stopCamera();
    };
  }, [isScannerOpen]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setCameraActive(true);
      } else {
        setCameraError('Camera capture API is not supported in this browser window. Please use manual code entry.');
      }
    } catch (err: any) {
      console.warn('Camera access message:', err.message);
      setCameraError('Camera access denied or unavailable in container preview. Please use manual code entry below or click a demo sample batch.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const handleSelectBatch = (batchId: string) => {
    setIsSimulatingScan(true);
    setTimeout(() => {
      setActiveBatchId(batchId);
      if (onScanComplete) {
        onScanComplete(batchId);
      }
      setIsSimulatingScan(false);
      setScannerOpen(false);
    }, 600);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      handleSelectBatch(manualCode.trim());
    }
  };

  if (!isScannerOpen) return null;

  return (
    <div
      id="qr-scanner-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fadeIn"
    >
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Scan Product QR / Barcode</h3>
              <p className="text-xs text-slate-500">Live Device Camera Capture or Code Entry</p>
            </div>
          </div>
          <button
            id="close-scanner-btn"
            onClick={() => setScannerOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Camera Viewfinder Area */}
          <div className="relative w-full h-56 md:h-64 bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center border border-slate-800">
            {cameraActive ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center px-4">
                <Camera className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-400">
                  {cameraError || 'Initializing camera stream...'}
                </p>
                {cameraError && (
                  <button
                    onClick={startCamera}
                    className="mt-2.5 inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-medium underline"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Retry Camera Access
                  </button>
                )}
              </div>
            )}

            {/* Viewfinder Target Frame Overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-40 h-40 border-2 border-emerald-400/80 rounded-2xl relative">
                <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-emerald-400" />
                <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-emerald-400" />
                <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-emerald-400" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-emerald-400" />
                
                {/* Laser animation bar */}
                <div className="w-full h-0.5 bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse my-auto" />
              </div>
            </div>

            {isSimulatingScan && (
              <div className="absolute inset-0 bg-emerald-950/80 backdrop-blur-xs flex flex-col items-center justify-center text-emerald-300">
                <Check className="w-10 h-10 mb-2 animate-bounce" />
                <span className="font-bold text-sm">QR Code Decoded Successfully!</span>
                <span className="text-xs text-emerald-400/80">Loading trace lineage...</span>
              </div>
            )}
          </div>

          {/* Quick Demo Batch Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Instant Demo Batches (Click to Scan)
              </span>
              <span className="text-[11px] text-slate-400">1-click test</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.values(ALL_DEMO_BATCHES).map((batch) => (
                <button
                  key={batch.batchId}
                  id={`demo-scan-btn-${batch.batchId}`}
                  onClick={() => handleSelectBatch(batch.batchId)}
                  className="text-left p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all flex flex-col justify-between group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-100/70 px-1.5 py-0.5 rounded">
                      {batch.batchId}
                    </span>
                    <span className="text-[11px] font-bold text-slate-700">
                      {batch.scoreBreakdown.totalScore}/100
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-slate-800 mt-1 line-clamp-1 group-hover:text-emerald-900">
                    {batch.productName}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5 truncate">
                    {batch.origin}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Manual Code Fallback Input */}
          <form onSubmit={handleManualSubmit} className="pt-2 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
              <Keyboard className="w-3.5 h-3.5 text-slate-500" />
              Enter Code Manually
            </label>
            <div className="flex gap-2">
              <input
                id="manual-batch-input"
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="e.g. BIS-2026-092 or WHT-MH-2026-001"
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
              <button
                id="submit-manual-code-btn"
                type="submit"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs md:text-sm font-semibold transition-colors shrink-0"
              >
                Trace
              </button>
            </div>
          </form>
        </div>

        {/* Footer info */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>Camera proof operates on device camera only. Generic phone file uploads are disabled.</span>
        </div>
      </div>
    </div>
  );
};
