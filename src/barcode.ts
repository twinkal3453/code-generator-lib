import bwipjs from 'bwip-js';

export interface BarcodeOptions {
  /** The barcode format (e.g., 'code128', 'ean13', 'qrcode', etc.) */
  format?: string;
  /** Output type: 'svg' returns an SVG string, 'dataUrl' returns a base64 or encoded data URL */
  type?: 'svg' | 'dataUrl';
  /** Include human readable text */
  includetext?: boolean;
  /** Text alignment */
  textxalign?: 'center' | 'left' | 'right' | 'justify';
  /** Barcode height (in mm for some formats, or relative) */
  height?: number;
  /** Scaling factor */
  scale?: number;
  /** Background color (Hex like 'FFFFFF') */
  backgroundcolor?: string;
  /** Foreground color (Hex like '000000') */
  barcolor?: string;
}

/**
 * Generates a Barcode from the given text.
 * @param text The string to encode.
 * @param options Options for formatting the Barcode.
 * @returns A promise that resolves to an SVG string or Data URL.
 */
export async function generateBarcode(text: string, options: BarcodeOptions = {}): Promise<string> {
  const {
    format = 'code128',
    type = 'dataUrl',
    includetext = true,
    textxalign = 'center',
    height = 10,
    scale = 3,
    ...rest
  } = options;

  const bwipOptions = {
    bcid: format,
    text,
    includetext,
    textxalign,
    height,
    scale,
    ...rest
  };

  try {
    const svgString = bwipjs.toSVG(bwipOptions);

    if (type === 'svg') {
      return svgString;
    } else {
      // Encode SVG to Data URI for universal browser/node compatibility
      const base64Svg = typeof Buffer !== 'undefined' 
          ? Buffer.from(svgString).toString('base64') 
          : btoa(unescape(encodeURIComponent(svgString)));
      return `data:image/svg+xml;base64,${base64Svg}`;
    }
  } catch (err) {
    throw new Error(`Failed to generate barcode: ${err instanceof Error ? err.message : err}`);
  }
}
