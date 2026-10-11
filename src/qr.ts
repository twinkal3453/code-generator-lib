// @ts-nocheck
import { qrcodegen } from './qrcodegen';
import { isValidColor, toBase64 } from './utils';

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

  if (typeof text !== 'string' || text.length === 0) {
    throw new Error('Input text must be a non-empty string');
  }
  if (text.length > 2000) {
    throw new Error('Input text is too long (maximum 2000 characters)');
  }
  if (typeof width !== 'number' || !Number.isFinite(width) || width < 10 || width > 10000) {
    throw new Error('Width must be a valid number between 10 and 10000');
  }
  if (typeof margin !== 'number' || !Number.isFinite(margin) || margin < 0 || margin > 1000) {
    throw new Error('Margin must be a valid number between 0 and 1000');
  }
  if (type !== 'svg' && type !== 'dataUrl') {
    throw new Error('Invalid output type: must be "svg" or "dataUrl"');
  }
  if (errorCorrectionLevel && !['L', 'M', 'Q', 'H'].includes(errorCorrectionLevel)) {
    throw new Error('Invalid errorCorrectionLevel: must be "L", "M", "Q", or "H"');
  }

  const darkColor = (color && color.dark != null) ? color.dark : '#000000';
  const lightColor = (color && color.light != null) ? color.light : '#ffffff';

  if (!isValidColor(darkColor)) {
    throw new Error(`Invalid dark color: "${darkColor}" is not a valid CSS color`);
  }
  if (!isValidColor(lightColor)) {
    throw new Error(`Invalid light color: "${lightColor}" is not a valid CSS color`);
  }

  let ecl = qrcodegen.QrCode.Ecc.MEDIUM;
  if (errorCorrectionLevel === 'L') ecl = qrcodegen.QrCode.Ecc.LOW;
  if (errorCorrectionLevel === 'Q') ecl = qrcodegen.QrCode.Ecc.QUARTILE;
  if (errorCorrectionLevel === 'H') ecl = qrcodegen.QrCode.Ecc.HIGH;

  const qr = qrcodegen.QrCode.encodeText(text, ecl);
  
  const size = qr.size;
  const safeMargin = Math.floor(margin);
  const viewBox = size + safeMargin * 2;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${width}" viewBox="0 0 ${viewBox} ${viewBox}">`;
  svg += `<rect width="100%" height="100%" fill="${lightColor}" />`;
  
  let pathData = "";
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (qr.getModule(x, y)) {
        pathData += `M${x + safeMargin},${y + safeMargin} h1 v1 h-1 z `;
      }
    }
  }
  
  svg += `<path d="${pathData}" fill="${darkColor}" />`;
  svg += `</svg>`;

  if (type === 'svg') {
    return svg;
  } else {
    return `data:image/svg+xml;base64,${toBase64(svg)}`;
  }
}

