export interface BarcodeOptions {
    /** The barcode format (currently only supports 'code128') */
    format?: 'code128';
    /** Output type: 'svg' returns an SVG string, 'dataUrl' returns a base64 encoded data URL */
    type?: 'svg' | 'dataUrl';
    /** Barcode height in pixels */
    height?: number;
    /** Barcode width scaling factor */
    scale?: number;
}
/**
 * Generates a Barcode from the given text without external dependencies.
 * @param text The string to encode (ASCII 32-127).
 * @param options Options for formatting the Barcode.
 * @returns A promise that resolves to an SVG string or Data URL.
 */
export declare function generateBarcode(text: string, options?: BarcodeOptions): Promise<string>;
