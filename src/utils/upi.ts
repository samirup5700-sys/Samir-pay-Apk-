import QRCode from 'qrcode';

export interface UpiParams {
  pa: string; // Payee VPA / UPI ID
  pn?: string; // Payee Name
  am?: string | number; // Amount
  cu?: string; // Currency (INR)
  tn?: string; // Transaction Note
  mc?: string; // Merchant Code
  tr?: string; // Transaction Reference
}

/**
 * Builds standard NPCI UPI Deep Link URI
 * Example: upi://pay?pa=samir@samirpay&pn=Samir%20Patel&am=500.00&cu=INR&tn=Payment
 */
export function buildUpiUri(params: UpiParams): string {
  const query = new URLSearchParams();
  query.set('pa', params.pa.trim());
  if (params.pn) query.set('pn', params.pn.trim());
  if (params.am && Number(params.am) > 0) {
    query.set('am', Number(params.am).toFixed(2));
  }
  query.set('cu', params.cu || 'INR');
  if (params.tn) query.set('tn', params.tn.trim());
  if (params.mc) query.set('mc', params.mc.trim());
  if (params.tr) query.set('tr', params.tr.trim());

  return `upi://pay?${query.toString()}`;
}

/**
 * Parses a standard UPI URI string or scanned QR payload
 */
export function parseUpiUri(rawUrl: string): UpiParams | null {
  try {
    if (!rawUrl) return null;
    let urlString = rawUrl.trim();

    // Check if it's already a clean UPI URL or raw query
    if (urlString.startsWith('upi://pay?')) {
      urlString = urlString.replace('upi://pay?', 'http://dummy.com/?');
    } else if (urlString.startsWith('upi://pay')) {
      urlString = urlString.replace('upi://pay', 'http://dummy.com/');
    } else if (urlString.includes('@') && !urlString.includes('=')) {
      // Direct raw UPI ID scanned (e.g. "rahul@okhdfcbank")
      return {
        pa: urlString,
        pn: urlString.split('@')[0],
      };
    } else if (!urlString.startsWith('http')) {
      urlString = `http://dummy.com/?${urlString}`;
    }

    const url = new URL(urlString);
    const pa = url.searchParams.get('pa') || url.searchParams.get('PA');
    if (!pa) return null;

    return {
      pa: pa,
      pn: url.searchParams.get('pn') || url.searchParams.get('PN') || undefined,
      am: url.searchParams.get('am') || url.searchParams.get('AM') || undefined,
      cu: url.searchParams.get('cu') || 'INR',
      tn: url.searchParams.get('tn') || url.searchParams.get('TN') || undefined,
      mc: url.searchParams.get('mc') || undefined,
      tr: url.searchParams.get('tr') || undefined,
    };
  } catch (err) {
    console.error('Failed to parse UPI URL:', err);
    return null;
  }
}

/**
 * Generates high-res Data URL QR Code
 */
export async function generateQrDataUrl(text: string, options?: QRCode.QRCodeToDataURLOptions): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      width: 400,
      margin: 2,
      color: {
        dark: '#047857', // Deep emerald green
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'H', // High error correction so logo can be placed in center
      ...options,
    });
  } catch (err) {
    console.error('Failed to generate QR data URL:', err);
    return '';
  }
}

/**
 * Indian Rupee formatter (e.g. ₹37,250.50)
 */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format relative or exact transaction date
 */
export function formatTxDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';

    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return isoString;
  }
}
