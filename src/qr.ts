import QRCode from 'qrcode';

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
 * Generates a QR Code from the given text.
 * @param text The text or URL to encode.
 * @param options Options for formatting the QR Code.
 * @returns A promise that resolves to an SVG string or Data URL.
 */
export async function generateQR(text: string, options: QROptions = {}): Promise<string> {
  const { type = 'dataUrl', width = 200, margin = 4, errorCorrectionLevel = 'M', color } = options;

  const qrOptions: QRCode.QRCodeToDataURLOptions | QRCode.QRCodeToStringOptions = {
    width,
    margin,
    errorCorrectionLevel,
    color,
  };

  if (type === 'svg') {
    // qrcode.toString with { type: 'svg' } returns an SVG string
    return QRCode.toString(text, { ...(qrOptions as QRCode.QRCodeToStringOptions), type: 'svg' });
  } else {
    // qrcode.toDataURL returns a base64 encoded PNG data URI
    return QRCode.toDataURL(text, qrOptions as QRCode.QRCodeToDataURLOptions);
  }
}
