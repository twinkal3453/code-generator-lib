declare var Buffer: any;

const SAFE_NAMED_COLORS = new Set([
  'aliceblue', 'antiquewhite', 'aqua', 'aquamarine', 'azure', 'beige', 'bisque',
  'black', 'blanchedalmond', 'blue', 'blueviolet', 'brown', 'burlywood', 'cadetblue',
  'chartreuse', 'chocolate', 'coral', 'cornflowerblue', 'cornsilk', 'crimson', 'cyan',
  'darkblue', 'darkcyan', 'darkgoldenrod', 'darkgray', 'darkgreen', 'darkgrey',
  'darkkhaki', 'darkmagenta', 'darkolivegreen', 'darkorange', 'darkorchid', 'darkred',
  'darksalmon', 'darkseagreen', 'darkslateblue', 'darkslategray', 'darkslategrey',
  'darkturquoise', 'darkviolet', 'deeppink', 'deepskyblue', 'dimgray', 'dimgrey',
  'dodgerblue', 'firebrick', 'floralwhite', 'forestgreen', 'fuchsia', 'gainsboro',
  'ghostwhite', 'gold', 'goldenrod', 'gray', 'green', 'greenyellow', 'grey',
  'honeydew', 'hotpink', 'indianred', 'indigo', 'ivory', 'khaki', 'lavender',
  'lavenderblush', 'lawngreen', 'lemonchiffon', 'lightblue', 'lightcoral', 'lightcyan',
  'lightgoldenrodyellow', 'lightgray', 'lightgreen', 'lightgrey', 'lightpink',
  'lightsalmon', 'lightseagreen', 'lightskyblue', 'lightslategray', 'lightslategrey',
  'lightsteelblue', 'lightyellow', 'lime', 'limegreen', 'linen', 'magenta', 'maroon',
  'mediumaquamarine', 'mediumblue', 'mediumorchid', 'mediumpurple', 'mediumseagreen',
  'mediumslateblue', 'mediumspringgreen', 'mediumturquoise', 'mediumvioletred',
  'midnightblue', 'mintcream', 'mistyrose', 'moccasin', 'navajowhite', 'navy',
  'oldlace', 'olive', 'olivedrab', 'orange', 'orangered', 'orchid', 'palegoldenrod',
  'palegreen', 'paleturquoise', 'palevioletred', 'papayawhip', 'peachpuff', 'peru',
  'pink', 'plum', 'powderblue', 'purple', 'rebeccapurple', 'red', 'rosybrown',
  'royalblue', 'saddlebrown', 'salmon', 'sandybrown', 'seagreen', 'seashell',
  'sienna', 'silver', 'skyblue', 'slateblue', 'slategray', 'slategrey', 'snow',
  'springgreen', 'steelblue', 'tan', 'teal', 'thistle', 'tomato', 'turquoise',
  'violet', 'wheat', 'white', 'whitesmoke', 'yellow', 'yellowgreen',
  'transparent', 'currentcolor'
]);

const HEX_COLOR_REGEX = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
const RGB_COLOR_REGEX = /^rgba?\(\s*[\d.]+%?\s*,\s*[\d.]+%?\s*,\s*[\d.]+%?(?:\s*[,/]\s*[\d.]+%?)?\s*\)$/i;
const HSL_COLOR_REGEX = /^hsla?\(\s*[\d.]+(?:deg|rad|turn)?\s*,\s*[\d.]+%?\s*,\s*[\d.]+%?(?:\s*[,/]\s*[\d.]+%?)?\s*\)$/i;

/**
 * Validates whether a color string is safe and valid CSS color syntax.
 * Strictly prevents XML/SVG attribute breakout, XSS vectors, and SSRF via url().
 */
export function isValidColor(val: unknown): boolean {
  if (typeof val !== 'string') return false;
  const trimmed = val.trim().toLowerCase();
  if (!trimmed || trimmed.length > 60) return false;
  // Disallow any injection attempts
  if (/[<>"'&;\\`]|url\s*\(|javascript:|expression|data:/i.test(trimmed)) {
    return false;
  }
  if (HEX_COLOR_REGEX.test(trimmed)) return true;
  if (RGB_COLOR_REGEX.test(trimmed)) return true;
  if (HSL_COLOR_REGEX.test(trimmed)) return true;
  return SAFE_NAMED_COLORS.has(trimmed);
}

/**
 * Escapes XML/SVG special characters to prevent attribute and tag injection.
 */
export function escapeXml(unsafe: string): string {
  if (typeof unsafe !== 'string') return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Converts a string to base64 encoding safely across all runtimes
 * (Node.js, modern browsers, Deno, Bun, Cloudflare Workers, edge).
 * Does not rely on deprecated APIs like unescape().
 */
export function toBase64(str: string): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(str, 'utf-8').toString('base64');
  }
  if (typeof btoa === 'function') {
    const bytes = new TextEncoder().encode(str);
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
  // Pure JavaScript RFC 4648 Base64 fallback
  const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const bytes = new TextEncoder().encode(str);
  let result = '';
  let i = 0;
  for (; i + 2 < bytes.length; i += 3) {
    result += CHARS[bytes[i] >> 2];
    result += CHARS[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
    result += CHARS[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)];
    result += CHARS[bytes[i + 2] & 63];
  }
  if (i < bytes.length) {
    result += CHARS[bytes[i] >> 2];
    if (i + 1 === bytes.length) {
      result += CHARS[(bytes[i] & 3) << 4];
      result += '==';
    } else {
      result += CHARS[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
      result += CHARS[(bytes[i + 1] & 15) << 2];
      result += '=';
    }
  }
  return result;
}
