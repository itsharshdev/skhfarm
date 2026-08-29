import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { buildPublicTraceUrl } from '../../utils/qrUtils';
import { Download, Copy, Check, ExternalLink, Sparkles, ShieldCheck } from 'lucide-react';
import { FarmTracerLogo } from '../brand/FarmTracerLogo';

export interface QRCodeGeneratorProps {
  batchId: string;
  productName?: string;
  size?: number;
  includeLogo?: boolean;
  showActions?: boolean;
  className?: string;
  onUrlCopied?: () => void;
}

export const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
  batchId,
  productName,
  size = 240,
  includeLogo = true,
  showActions = true,
  className = '',
  onUrlCopied,
}) => {
  const [copied, setCopied] = useState(false);
  const [svgString, setSvgString] = useState<string>('');
  const [dataUrl, setDataUrl] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const publicUrl = buildPublicTraceUrl(batchId);

  useEffect(() => {
    generateQR();
  }, [batchId, size, includeLogo]);

  const generateQR = async () => {
    try {
      // 1. Generate SVG String (Level H error correction + 4 module margin)
      const svg = await QRCode.toString(publicUrl, {
        type: 'svg',
        errorCorrectionLevel: 'H',
        margin: 2,
        color: {
          dark: '#0f172a', // Deep slate matrix modules
          light: '#ffffff', // Crisp white background
        },
        width: size,
      });
      setSvgString(svg);

      // 2. Generate Data URL for direct image rendering
      const url = await QRCode.toDataURL(publicUrl, {
        errorCorrectionLevel: 'H',
        margin: 2,
        width: size * 2, // 2x for Retina sharp rendering
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      });
      setDataUrl(url);

      // 3. Render to Canvas with optional central logo badge
      if (canvasRef.current) {
        await QRCode.toCanvas(canvasRef.current, publicUrl, {
          errorCorrectionLevel: 'H',
          margin: 2,
          width: size * 2,
          color: {
            dark: '#0f172a',
            light: '#ffffff',
          },
        });
      }
    } catch (err) {
      console.error('Failed to generate QR code:', err);
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    if (onUrlCopied) onUrlCopied();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPNG = async () => {
    try {
      // Generate ultra high-res 1024x1024 image for packaging printing
      const highResUrl = await QRCode.toDataURL(publicUrl, {
        errorCorrectionLevel: 'H',
        margin: 3,
        width: 1024,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      });

      const a = document.createElement('a');
      a.href = highResUrl;
      a.download = `FARMTRACER-QR-${batchId.replace(/[^A-Za-z0-9-_]/g, '_')}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      console.error('Download PNG failed', e);
    }
  };

  const handleDownloadSVG = () => {
    if (!svgString) return;
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FARMTRACER-QR-${batchId.replace(/[^A-Za-z0-9-_]/g, '_')}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* QR Code Container */}
      <div className="relative p-3 bg-white rounded-2xl border-2 border-slate-200 shadow-sm flex items-center justify-center group">
        {/* Render Canvas */}
        <canvas
          ref={canvasRef}
          style={{ width: `${size}px`, height: `${size}px` }}
          className="rounded-xl block"
        />

        {/* Central Logo Emblem Badge (Safe with Level 'H' 30% error correction) */}
        {includeLogo && (
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-1.5 bg-white rounded-xl shadow-md border border-slate-200 pointer-events-none flex items-center justify-center"
            style={{ width: `${Math.max(32, size * 0.22)}px`, height: `${Math.max(32, size * 0.22)}px` }}
          >
            <FarmTracerLogo variant="icon-only" size="xs" />
          </div>
        )}
      </div>

      {/* Public URL Display Bar */}
      <div className="mt-3 w-full max-w-sm">
        <div className="px-2.5 py-1.5 bg-slate-100 rounded-xl border border-slate-200/80 flex items-center justify-between text-[11px] font-mono text-slate-600">
          <span className="truncate max-w-[210px] text-slate-800" title={publicUrl}>
            {publicUrl}
          </span>
          <button
            onClick={handleCopyUrl}
            className="shrink-0 p-1 text-slate-500 hover:text-emerald-700 hover:bg-slate-200/60 rounded-md transition-colors flex items-center gap-1 font-sans text-[10px] font-bold"
            title="Copy Public URL"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-600" />
                <span className="text-emerald-700">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      {showActions && (
        <div className="flex flex-wrap items-center justify-center gap-2 mt-3 w-full">
          <button
            onClick={handleDownloadPNG}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-2xs transition-all flex items-center gap-1.5"
            title="Download 1024x1024 High-Resolution PNG for label printing"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PNG</span>
          </button>

          <button
            onClick={handleDownloadSVG}
            className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
            title="Download Scalable Vector Graphic (SVG) for packaging artwork"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Vector SVG</span>
          </button>
        </div>
      )}
    </div>
  );
};
