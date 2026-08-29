/**
 * QR Code Utilities for FarmTracer
 * Ensures universal standard HTTPS URLs and robust batch code decoding.
 */

/**
 * Builds the canonical public trace URL for any given batch identifier.
 * Example: https://farmtracer.demo/#trace/BIS-2026-092
 */
export function buildPublicTraceUrl(batchId: string): string {
  const cleanId = (batchId || '').trim();
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    const origin = window.location.origin;
    const pathname = window.location.pathname.endsWith('/')
      ? window.location.pathname
      : `${window.location.pathname}/`;
    return `${origin}${pathname}#trace/${encodeURIComponent(cleanId)}`;
  }
  return `https://farmtracer.app/#trace/${encodeURIComponent(cleanId)}`;
}

export interface QrParseResult {
  valid: boolean;
  batchId?: string;
  sourceType?: 'full_url' | 'path_url' | 'legacy_scheme' | 'direct_code';
  rawText: string;
  error?: string;
}

/**
 * Parses and normalizes any scanned QR content or text input into a clean FarmTracer batch ID.
 * Works seamlessly with:
 * 1. Full HTTPS URLs: https://domain.com/#trace/BIS-2026-092 or https://domain.com/trace/BIS-2026-092
 * 2. Query Parameter URLs: https://domain.com/?batch=BIS-2026-092
 * 3. Legacy Custom Scheme: FARM-TRACER://BATCH/BIS-2026-092
 * 4. Direct Batch Identifier: BIS-2026-092, WHT-MH-2026-001, etc.
 */
export function parseBatchIdFromQr(rawText: string): QrParseResult {
  if (!rawText || typeof rawText !== 'string') {
    return {
      valid: false,
      rawText: '',
      error: 'Empty or invalid QR code data.',
    };
  }

  const trimmed = rawText.trim();

  // 1. Check for Hash-based trace URL (#trace/BATCH_ID)
  const hashMatch = trimmed.match(/#\/?trace\/([A-Za-z0-9_\-\.]+)/i);
  if (hashMatch && hashMatch[1]) {
    return {
      valid: true,
      batchId: decodeURIComponent(hashMatch[1]),
      sourceType: 'full_url',
      rawText: trimmed,
    };
  }

  // 2. Check for Path-based trace URL (/trace/BATCH_ID)
  const pathMatch = trimmed.match(/\/trace\/([A-Za-z0-9_\-\.]+)/i);
  if (pathMatch && pathMatch[1]) {
    return {
      valid: true,
      batchId: decodeURIComponent(pathMatch[1]),
      sourceType: 'path_url',
      rawText: trimmed,
    };
  }

  // 3. Check for Query Parameter URL (?batch=BATCH_ID or &batch=BATCH_ID)
  const queryMatch = trimmed.match(/[?&]batch=([A-Za-z0-9_\-\.]+)/i);
  if (queryMatch && queryMatch[1]) {
    return {
      valid: true,
      batchId: decodeURIComponent(queryMatch[1]),
      sourceType: 'full_url',
      rawText: trimmed,
    };
  }

  // 4. Check for Legacy Scheme (FARM-TRACER://BATCH/BATCH_ID)
  const legacyMatch = trimmed.match(/^FARM-TRACER:\/\/BATCH\/([A-Za-z0-9_\-\.]+)$/i);
  if (legacyMatch && legacyMatch[1]) {
    return {
      valid: true,
      batchId: decodeURIComponent(legacyMatch[1]),
      sourceType: 'legacy_scheme',
      rawText: trimmed,
    };
  }

  // 5. Check if it is a direct batch ID or alphanumeric code (e.g. BIS-2026-092, WHT-001)
  // Standard format: 2-32 characters of uppercase/lowercase letters, digits, dashes, underscores
  const isDirectCode = /^[A-Za-z0-9\-_]{3,40}$/.test(trimmed);
  if (isDirectCode) {
    return {
      valid: true,
      batchId: trimmed,
      sourceType: 'direct_code',
      rawText: trimmed,
    };
  }

  // Fallback: If it's a URL that doesn't match our patterns, return helpful error
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return {
      valid: false,
      rawText: trimmed,
      error: 'Scanned URL is not a recognized FarmTracer traceability link.',
    };
  }

  return {
    valid: false,
    rawText: trimmed,
    error: 'Unrecognized QR code format. Please scan a valid FarmTracer QR tag.',
  };
}
