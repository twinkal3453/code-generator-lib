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
export declare function generateBarcode(text: string, options?: BarcodeOptions): Promise<string>;
