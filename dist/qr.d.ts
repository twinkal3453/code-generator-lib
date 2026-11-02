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
export declare function generateQR(text: string, options?: QROptions): Promise<string>;
