declare var Buffer: any;

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

// Code 128 Pattern Table (binary representations)
const BARS = [
  "11011001100", "11001101100", "11001100110", "10010011000", "10010001100",
  "10001001100", "10011001000", "10011000100", "10001100100", "11001001000",
  "11001000100", "11000100100", "10110011100", "10011011100", "10011001110",
  "10111001100", "10011101100", "10011100110", "11001110010", "11001011100",
  "11001001110", "11011100100", "11001110100", "11101101110", "11101001100",
  "11100101100", "11100100110", "11101100100", "11100110100", "11100110010",
  "11011011000", "11011000110", "11000110110", "10100011000", "10001011000",
  "10001000110", "10110001000", "10001101000", "10001100010", "11010001000",
  "11000101000", "11000100010", "10110111000", "10110001110", "10001101110",
  "10111011000", "10111000110", "10001110110", "11101110110", "11010001110",
  "11000101110", "11011101000", "11011100010", "11011101110", "11101011000",
  "11101000110", "11100010110", "11101101000", "11101100010", "11100011010",
  "11101111010", "11001000010", "11110001010", "10100110000", "10100001100",
  "10010110000", "10010000110", "10000101100", "10000100110", "10110010000",
  "10110000100", "10011010000", "10011000010", "10000110100", "10000110010",
  "11000010010", "11001010000", "11110111010", "11000010100", "10001111010",
  "10100111100", "10010111100", "10010011110", "10111100100", "10011110100",
  "10011110010", "11110100100", "11110010100", "11110010010", "11011011110",
  "11011110110", "11110110110", "10101111000", "10100011110", "10001011110",
  "10111101000", "10111100010", "11110101000", "11110100010", "10111011110",
  "10111101110", "11101011110", "11110101110", "11010000100", "11010010000",
  "11010011100", "1100011101011"
];

const START_B = 104;
const STOP = 106;

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
 * Generates a Barcode from the given text without external dependencies.
 * @param text The string to encode (ASCII 32-127).
 * @param options Options for formatting the Barcode.
 * @returns A promise that resolves to an SVG string or Data URL.
 */
export async function generateBarcode(text: string, options: BarcodeOptions = {}): Promise<string> {
  const {
    type = 'dataUrl',
    height = 50,
    scale = 2
  } = options || {};

  if (!text || typeof text !== 'string') {
    throw new Error('Input text must be a valid string');
  }
  if (text.length > 1000) {
    throw new Error('Input text is too long (maximum 1000 characters)');
  }
  if (typeof height !== 'number' || height < 1 || height > 10000) {
    throw new Error('Height must be a number between 1 and 10000');
  }
  if (typeof scale !== 'number' || scale < 1 || scale > 100) {
    throw new Error('Scale must be a number between 1 and 100');
  }

  const values: number[] = [];

  // 1. Start Code B
  values.push(START_B);
  let checksum = START_B;

  // 2. Data Characters
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    if (charCode < 32 || charCode > 127) {
      throw new Error(`Invalid character for Code 128 Set B: ${text[i]}`);
    }
    const value = charCode - 32;
    values.push(value);
    checksum += value * (i + 1);
  }

  // 3. Checksum Character
  const checksumValue = checksum % 103;
  values.push(checksumValue);

  // 4. Stop Character
  values.push(STOP);

  // Build binary string
  let binaryString = "";
  for (const val of values) {
    binaryString += BARS[val];
  }

  // Generate SVG
  const width = binaryString.length * scale;
  const padding = scale * 10;
  const textHeight = padding * 1.5; // Space for text and gap
  const fullWidth = width + padding * 2;
  const fullHeight = height + padding * 2 + textHeight;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${fullWidth}" height="${fullHeight}">`;
  svg += `<rect width="100%" height="100%" fill="#ffffff" />`;

  for (let i = 0; i < binaryString.length; i++) {
    if (binaryString[i] === '1') {
      const x = padding + (i * scale);
      svg += `<rect x="${x}" y="${padding}" width="${scale}" height="${height}" fill="#000000" />`;
    }
  }

  // Optional: Add human readable text below barcode
  const textY = padding + height + padding * 1.2;
  const safeText = escapeHtml(text);
  svg += `<text x="${fullWidth / 2}" y="${textY}" font-family="monospace" font-size="${padding}" text-anchor="middle" fill="#000000">${safeText}</text>`;

  svg += `</svg>`;

  if (type === 'svg') {
    return svg;
  } else {
    const base64Svg = typeof Buffer !== 'undefined'
      ? Buffer.from(svg).toString('base64')
      : btoa(unescape(encodeURIComponent(svg)));
    return `data:image/svg+xml;base64,${base64Svg}`;
  }
}
