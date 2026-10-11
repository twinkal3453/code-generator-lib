/**
 * Validates whether a color string is safe and valid CSS color syntax.
 * Strictly prevents XML/SVG attribute breakout, XSS vectors, and SSRF via url().
 */
export declare function isValidColor(val: unknown): boolean;
/**
 * Escapes XML/SVG special characters to prevent attribute and tag injection.
 */
export declare function escapeXml(unsafe: string): string;
/**
 * Converts a string to base64 encoding safely across all runtimes
 * (Node.js, modern browsers, Deno, Bun, Cloudflare Workers, edge).
 * Does not rely on deprecated APIs like unescape().
 */
export declare function toBase64(str: string): string;
