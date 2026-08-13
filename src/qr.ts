// @ts-nocheck
declare var Buffer: any;
import { qrcodegen } from './qrcodegen';

export interface QROptions {
  /** Output type: 'svg' returns an SVG string, 'dataUrl' returns a base64 png data URL */
  type?: 'svg' | 'dataUrl';
  /** Width/Height in pixels */
  width?: number;
  /** Margin around the QR code */
  margin?: number;
  /** Error correction level */
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  /** Colors */
  color?: {
    dark?: string;
    light?: string;
  };
}

/**
 * Escapes special characters for HTML/SVG to prevent XSS.
 */
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Generates a QR Code from the given text without external dependencies.
 * @param text The text or URL to encode.
 * @param options Options for formatting the QR Code.
 * @returns A promise that resolves to an SVG string or Data URL.
 */
export async function generateQR(text: string, options: QROptions = {}): Promise<string> {
  const { 
    type = 'dataUrl', 
    width = 200, 
    margin = 4, 
    errorCorrectionLevel = 'M', 
    color = { dark: '#000000', light: '#ffffff' } 
  } = options || {};

  if (!text || typeof text !== 'string') {
    throw new Error('Input text must be a valid string');
  }
  if (text.length > 2000) {
    throw new Error('Input text is too long (maximum 2000 characters)');
  }
  if (typeof width !== 'number' || width < 10 || width > 10000) {
    throw new Error('Width must be a number between 10 and 10000');
  }
  if (typeof margin !== 'number' || margin < 0 || margin > 1000) {
    throw new Error('Margin must be a number between 0 and 1000');
  }

  let ecl = qrcodegen.QrCode.Ecc.MEDIUM;
  if (errorCorrectionLevel === 'L') ecl = qrcodegen.QrCode.Ecc.LOW;
  if (errorCorrectionLevel === 'Q') ecl = qrcodegen.QrCode.Ecc.QUARTILE;
  if (errorCorrectionLevel === 'H') ecl = qrcodegen.QrCode.Ecc.HIGH;

  const qr = qrcodegen.QrCode.encodeText(text, ecl);
  
  const size = qr.size;
  const viewBox = size + margin * 2;
  const scale = width / viewBox;

  const safeLightColor = escapeHtml((color && color.light) || '#ffffff');
  const safeDarkColor = escapeHtml((color && color.dark) || '#000000');

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${width}" viewBox="0 0 ${viewBox} ${viewBox}">`;
  svg += `<rect width="100%" height="100%" fill="${safeLightColor}" />`;
  
  let pathData = "";
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (qr.getModule(x, y)) {
        pathData += `M${x + margin},${y + margin} h1 v1 h-1 z `;
      }
    }
  }
  
  svg += `<path d="${pathData}" fill="${safeDarkColor}" />`;
  svg += `</svg>`;

  if (type === 'svg') {
    return svg;
  } else {
    // Generate dataUrl
    const base64Svg = typeof Buffer !== 'undefined' 
        ? Buffer.from(svg).toString('base64') 
        : btoa(unescape(encodeURIComponent(svg)));
    return `data:image/svg+xml;base64,${base64Svg}`;
  }
}
