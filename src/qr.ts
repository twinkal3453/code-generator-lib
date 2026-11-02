import { qrcodegen } from './qrcodegen';
import { escapeXml, isValidColor, toBase64 } from './utils';

export type QRStyle = 'classic' | 'rounded' | 'gradient' | 'logo' | 'minimal';

export interface QRGradientOptions {
  /** First gradient color. Defaults to '#4338ca'. */
  start?: string;
  /** Last gradient color. Defaults to '#0f766e'. */
  end?: string;
  /** Direction in degrees: 0 is left to right, 90 is top to bottom. */
  angle?: number;
}

export interface QRLogoOptions {
  /** HTTPS image URL or base64 PNG/JPEG/WebP data URL. Embedded data is recommended. */
  src: string;
  /** Image width as a fraction of the QR grid, from 0.1 to 0.2. Defaults to 0.18. */
  size?: number;
  /** Background padding in modules, from 0 to 1. Defaults to 0.5. */
  padding?: number;
}

export interface QROptions {
  /** Output type: raw SVG or a base64 SVG data URL. */
  type?: 'svg' | 'dataUrl';
  /** Visual style. Defaults to 'classic'. */
  style?: QRStyle;
  /** Gradient settings, used by the 'gradient' style. */
  gradient?: QRGradientOptions;
  /** Center image, required by the 'logo' style. */
  logo?: QRLogoOptions;
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
    style = 'classic',
    gradient,
    logo,
    width = 200, 
    margin = 4, 
    errorCorrectionLevel = style === 'logo' ? 'H' : 'M',
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
  if (!['classic', 'rounded', 'gradient', 'logo', 'minimal'].includes(style)) {
    throw new Error('Invalid QR style: must be "classic", "rounded", "gradient", "logo", or "minimal"');
  }
  if (!['L', 'M', 'Q', 'H'].includes(errorCorrectionLevel)) {
    throw new Error('Invalid errorCorrectionLevel: must be "L", "M", "Q", or "H"');
  }
  if (style === 'logo' && errorCorrectionLevel !== 'H') {
    throw new Error('Logo QR codes require errorCorrectionLevel "H"');
  }

  const darkColor = (color && color.dark != null) ? color.dark : '#000000';
  const lightColor = (color && color.light != null) ? color.light : '#ffffff';

  if (!isValidColor(darkColor)) {
    throw new Error(`Invalid dark color: "${darkColor}" is not a valid CSS color`);
  }
  if (!isValidColor(lightColor)) {
    throw new Error(`Invalid light color: "${lightColor}" is not a valid CSS color`);
  }

  const gradientStart = gradient?.start ?? '#4338ca';
  const gradientEnd = gradient?.end ?? '#0f766e';
  const gradientAngle = gradient?.angle ?? 45;
  if (style === 'gradient') {
    if (!isValidColor(gradientStart) || !isValidColor(gradientEnd)) {
      throw new Error('Invalid gradient color: start and end must be valid CSS colors');
    }
    if (typeof gradientAngle !== 'number' || !Number.isFinite(gradientAngle) || gradientAngle < 0 || gradientAngle > 360) {
      throw new Error('Gradient angle must be a valid number between 0 and 360');
    }
  }

  const logoSize = logo?.size ?? 0.18;
  const logoPadding = logo?.padding ?? 0.5;
  if (style === 'logo') {
    if (!logo || !isValidLogoSource(logo.src)) {
      throw new Error('Logo src must be an HTTPS image URL or a base64 PNG, JPEG, or WebP data URL');
    }
    if (typeof logoSize !== 'number' || !Number.isFinite(logoSize) || logoSize < 0.1 || logoSize > 0.2) {
      throw new Error('Logo size must be a valid number between 0.1 and 0.2');
    }
    if (typeof logoPadding !== 'number' || !Number.isFinite(logoPadding) || logoPadding < 0 || logoPadding > 1) {
      throw new Error('Logo padding must be a valid number between 0 and 1');
    }
  }

  let ecl = qrcodegen.QrCode.Ecc.MEDIUM;
  if (errorCorrectionLevel === 'L') ecl = qrcodegen.QrCode.Ecc.LOW;
  if (errorCorrectionLevel === 'Q') ecl = qrcodegen.QrCode.Ecc.QUARTILE;
  if (errorCorrectionLevel === 'H') ecl = qrcodegen.QrCode.Ecc.HIGH;

  const qr = qrcodegen.QrCode.encodeText(text, ecl);
  
  const size = qr.size;
  const safeMargin = Math.floor(margin);
  const viewBox = size + safeMargin * 2;
  // Distinct configurations need distinct IDs when multiple SVGs are inlined together.
  let gradientHash = 2166136261;
  for (const char of JSON.stringify([gradientStart, gradientEnd, gradientAngle, size, safeMargin])) {
    gradientHash = Math.imul(gradientHash ^ char.charCodeAt(0), 16777619);
  }
  const gradientId = `qr-gradient-${(gradientHash >>> 0).toString(16)}`;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${width}" viewBox="0 0 ${viewBox} ${viewBox}">`;
  svg += `<rect width="100%" height="100%" fill="${lightColor}" />`;
  if (style === 'gradient') {
    const radians = gradientAngle * Math.PI / 180;
    const dx = Math.cos(radians) / 2;
    const dy = Math.sin(radians) / 2;
    // Coordinates explicitly cover the grid so the quiet zone does not affect the gradient.
    svg += `<defs><linearGradient id="${gradientId}" gradientUnits="userSpaceOnUse" x1="${safeMargin + size * (0.5 - dx)}" y1="${safeMargin + size * (0.5 - dy)}" x2="${safeMargin + size * (0.5 + dx)}" y2="${safeMargin + size * (0.5 + dy)}"><stop offset="0%" stop-color="${gradientStart}" /><stop offset="100%" stop-color="${gradientEnd}" /></linearGradient></defs>`;
  }
  
  let pathData = "";
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (qr.getModule(x, y)) {
        const px = x + safeMargin;
        const py = y + safeMargin;
        // Preserve finder, timing, alignment, format, and version modules.
        const functionModule = qr.isFunctionModule(x, y);
        if (style === 'rounded' && !functionModule) {
          pathData += `M${px + 0.22},${py} h0.56 q0.22,0 0.22,0.22 v0.56 q0,0.22 -0.22,0.22 h-0.56 q-0.22,0 -0.22,-0.22 v-0.56 q0,-0.22 0.22,-0.22 z `;
        } else if (style === 'minimal' && !functionModule) {
          pathData += `M${px + 0.5},${py + 0.05} a0.45,0.45 0 1,0 0,0.9 a0.45,0.45 0 1,0 0,-0.9 z `;
        } else {
          pathData += `M${px},${py} h1 v1 h-1 z `;
        }
      }
    }
  }
  
  svg += `<path d="${pathData}" fill="${style === 'gradient' ? `url(#${gradientId})` : darkColor}" />`;
  if (style === 'logo' && logo) {
    const imageSize = size * logoSize;
    const position = safeMargin + (size - imageSize) / 2;
    svg += `<rect x="${position - logoPadding}" y="${position - logoPadding}" width="${imageSize + logoPadding * 2}" height="${imageSize + logoPadding * 2}" rx="0.5" fill="${lightColor}" />`;
    svg += `<image href="${escapeXml(logo.src)}" x="${position}" y="${position}" width="${imageSize}" height="${imageSize}" preserveAspectRatio="xMidYMid meet" />`;
  }
  svg += `</svg>`;

  if (type === 'svg') {
    return svg;
  } else {
    return `data:image/svg+xml;base64,${toBase64(svg)}`;
  }
}

function isValidLogoSource(src: unknown): src is string {
  if (typeof src !== 'string' || src.length > 2_000_000) return false;
  if (/^data:image\/(?:png|jpeg|webp);base64,(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(src)) {
    return src.indexOf(',') < src.length - 1;
  }
  if (!src.startsWith('https://') || /[\s<>"'\\]/.test(src)) return false;
  try {
    const url = new URL(src);
    return url.protocol === 'https:' && !!url.hostname && !url.username && !url.password;
  } catch {
    return false;
  }
}

