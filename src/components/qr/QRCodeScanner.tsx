import React, { useState, useRef, useEffect, useCallback } from 'react';
import jsQR from 'jsqr';
import { parseBatchIdFromQr, QrParseResult } from '../../utils/qrUtils';
import {
  Camera,
  CameraOff,
  SwitchCamera,
  Zap,
  ZapOff,
  Upload,
  Keyboard,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RefreshCw,
  X,
  FileImage,
} from 'lucide-react';
import { ALL_DEMO_BATCHES } from '../../data/mockData';

export interface QRCodeScannerProps {
  onScanSuccess: (batchId: string, result?: QrParseResult) => void;
  onScanError?: (errorMessage: string) => void;
  onClose?: () => void;
  className?: string;
}

export const QRCodeScanner: React.FC<QRCodeScannerProps> = ({
  onScanSuccess,
  onScanError,
  onClose,
  className = '',
}) => {
  const [mode, setMode] = useState<'camera' | 'upload' | 'manual'>('camera');
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [torchOn, setTorchOn] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scanFeedback, setScanFeedback] = useState<{ status: 'idle' | 'detected' | 'error'; message?: string }>({
    status: 'idle',
  });
  const [manualCode, setManualCode] = useState('');
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const hasScannedRef = useRef<boolean>(false);

  // Trigger camera startup when mode is 'camera'
  useEffect(() => {
    if (mode === 'camera') {
      hasScannedRef.current = false;
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [mode, facingMode]);

  const startCamera = async () => {
    stopCamera();
    setCameraError(null);
    setScanFeedback({ status: 'idle' });

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera streaming API is not supported in this browser. Please use manual entry or file upload.');
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      // Check for torch/flashlight capability
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        const capabilities = (videoTrack.getCapabilities && (videoTrack.getCapabilities() as any)) || {};
        setHasTorch(Boolean(capabilities.torch));
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true'); // Required for iOS Safari
        await videoRef.current.play();
        setCameraActive(true);
        // Start continuous decoding loop
        startDecodingLoop();
      }
    } catch (err: any) {
      console.warn('Camera stream error:', err);
      let msg = 'Camera access was denied or is unavailable.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = 'Camera permission was denied. Please allow camera permissions in your browser settings.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        msg = 'No camera device found on this system.';
      }
      setCameraError(msg);
      setCameraActive(false);
      if (onScanError) onScanError(msg);
    }
  };

  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setTorchOn(false);
  };

  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (track && hasTorch) {
      try {
        const newTorch = !torchOn;
        await (track as any).applyConstraints({
          advanced: [{ torch: newTorch }],
        });
        setTorchOn(newTorch);
      } catch (e) {
        console.warn('Torch toggle failed', e);
      }
    }
  };

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Continuous frame analysis with jsQR
  const startDecodingLoop = () => {
    const scanFrame = () => {
      if (hasScannedRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video && video.readyState === video.HAVE_ENOUGH_DATA && canvas) {
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          });

          if (code && code.data) {
            handleDecodedContent(code.data);
            return;
          }
        }
      }

      animationFrameRef.current = requestAnimationFrame(scanFrame);
    };

    animationFrameRef.current = requestAnimationFrame(scanFrame);
  };

  const handleDecodedContent = (rawText: string) => {
    const parsed = parseBatchIdFromQr(rawText);

    if (parsed.valid && parsed.batchId) {
      hasScannedRef.current = true;
      // Trigger haptic vibration if supported
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([40, 30, 40]);
      }

      setScanFeedback({
        status: 'detected',
        message: `Batch Verified: ${parsed.batchId}`,
      });

      setTimeout(() => {
        stopCamera();
        onScanSuccess(parsed.batchId!, parsed);
      }, 500);
    } else {
      setScanFeedback({
        status: 'error',
        message: parsed.error || 'Unrecognized QR code. Please scan a FarmTracer QR tag.',
      });
      // Clear error after 2 seconds to allow retrying
      setTimeout(() => {
        setScanFeedback({ status: 'idle' });
      }, 2500);
    }
  };

  // Handle uploaded image scanning
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingFile(true);
    setScanFeedback({ status: 'idle' });

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);

          setIsProcessingFile(false);
          if (code && code.data) {
            handleDecodedContent(code.data);
          } else {
            setScanFeedback({
              status: 'error',
              message: 'No QR code could be detected in this image. Please try a clearer image.',
            });
          }
        } else {
          setIsProcessingFile(false);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      handleDecodedContent(manualCode.trim());
    }
  };

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Mode Selection Tabs */}
      <div className="flex items-center border-b border-slate-200 bg-slate-50 px-4 pt-2 gap-2 text-xs font-semibold">
        <button
          onClick={() => setMode('camera')}
          className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
            mode === 'camera'
              ? 'border-emerald-600 text-emerald-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>Live Camera</span>
        </button>

        <button
          onClick={() => setMode('upload')}
          className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
            mode === 'upload'
              ? 'border-emerald-600 text-emerald-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>Upload QR Image</span>
        </button>

        <button
          onClick={() => setMode('manual')}
          className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
            mode === 'manual'
              ? 'border-emerald-600 text-emerald-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Keyboard className="w-4 h-4" />
          <span>Manual Code</span>
        </button>
      </div>

      {/* Main Viewport Content */}
      <div className="p-5">
        {/* 1. Camera Mode */}
        {mode === 'camera' && (
          <div className="space-y-4">
            <div className="relative aspect-square max-w-[340px] mx-auto rounded-3xl overflow-hidden bg-slate-950 shadow-inner flex items-center justify-center">
              {/* Video Stream Element */}
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                muted
                playsInline
              />

              {/* Offscreen Canvas for Frame Capture */}
              <canvas ref={canvasRef} className="hidden" />

              {/* Viewfinder Target Reticle Overlay */}
              {cameraActive && (
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-8">
                  <div className="relative w-56 h-56 border-2 border-emerald-400/80 rounded-2xl">
                    {/* 4 Corner Accents */}
                    <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
                    <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
                    <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />

                    {/* Animated Scanning Laser */}
                    <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_8px_#34d399] animate-bounce-subtle mt-10" />
                  </div>

                  <p className="text-[11px] text-white/80 font-medium bg-slate-950/70 px-3 py-1 rounded-full mt-4 backdrop-blur-xs">
                    Align FarmTracer QR inside frame
                  </p>
                </div>
              )}

              {/* Camera Error / Fallback Card */}
              {cameraError && (
                <div className="absolute inset-0 p-6 bg-slate-900/95 text-white flex flex-col items-center justify-center text-center space-y-3">
                  <CameraOff className="w-10 h-10 text-rose-400" />
                  <p className="text-xs text-rose-200 leading-relaxed max-w-xs">{cameraError}</p>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={startCamera}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Retry</span>
                    </button>
                    <button
                      onClick={() => setMode('manual')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition-colors"
                    >
                      Enter Code
                    </button>
                  </div>
                </div>
              )}

              {/* Scan Detection Flash Banner */}
              {scanFeedback.status === 'detected' && (
                <div className="absolute inset-0 bg-emerald-600/90 flex flex-col items-center justify-center text-white p-4 animate-fadeIn">
                  <CheckCircle2 className="w-12 h-12 text-white animate-bounce" />
                  <p className="font-bold text-sm mt-2">{scanFeedback.message}</p>
                  <p className="text-xs text-emerald-100">Opening traceability ledger...</p>
                </div>
              )}
            </div>

            {/* Camera Floating Toolbar Controls */}
            {cameraActive && (
              <div className="flex items-center justify-center gap-3">
                {hasTorch && (
                  <button
                    onClick={toggleTorch}
                    className={`p-2.5 rounded-full border transition-all ${
                      torchOn
                        ? 'bg-amber-400 border-amber-500 text-slate-950 shadow-md'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                    title="Toggle Flashlight"
                  >
                    {torchOn ? <Zap className="w-4 h-4" /> : <ZapOff className="w-4 h-4" />}
                  </button>
                )}

                <button
                  onClick={toggleFacingMode}
                  className="p-2.5 rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-all shadow-2xs"
                  title="Switch Camera (Front/Rear)"
                >
                  <SwitchCamera className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* 2. File Upload Mode */}
        {mode === 'upload' && (
          <div className="space-y-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-3xl p-8 text-center cursor-pointer bg-slate-50/50 hover:bg-emerald-50/30 transition-all space-y-3"
            >
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto shadow-2xs">
                <FileImage className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Select or drop a QR code image</p>
                <p className="text-xs text-slate-500 mt-1">Supports PNG, JPG, WEBP, SVG screenshots or labels</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold shadow-2xs"
              >
                {isProcessingFile ? 'Scanning Image...' : 'Browse Image File'}
              </button>
            </div>
          </div>
        )}

        {/* 3. Manual Entry Mode */}
        {mode === 'manual' && (
          <form onSubmit={handleManualSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Batch Identifier or Trace URL
              </label>
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="e.g. BIS-2026-092 or https://.../#trace/BIS-2026-092"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:border-emerald-500 rounded-xl text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={!manualCode.trim()}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
            >
              Verify & Trace Batch
            </button>
          </form>
        )}

        {/* Scan Error Banner */}
        {scanFeedback.status === 'error' && (
          <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{scanFeedback.message}</span>
          </div>
        )}

        {/* Featured Sample Batches for Fast Demo / Testing */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            <span>Quick Demo Sample Batches</span>
          </p>
          <div className="grid grid-cols-2 gap-2">
            {Object.values(ALL_DEMO_BATCHES).slice(0, 4).map((b) => (
              <button
                key={b.batchId}
                onClick={() => handleDecodedContent(b.batchId)}
                className="p-2 rounded-xl bg-slate-50 hover:bg-emerald-50/80 border border-slate-200 hover:border-emerald-300 text-left transition-all group"
              >
                <span className="text-[10px] font-mono font-bold text-emerald-800 block truncate">
                  {b.batchId}
                </span>
                <span className="text-[11px] font-medium text-slate-700 truncate block">
                  {b.productName}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
