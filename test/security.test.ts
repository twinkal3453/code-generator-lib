import { describe, it, expect } from 'vitest';
import { generateQR, generateBarcode, isValidColor, toBase64 } from '../src/index';

describe('Security & Input Validation Tests', () => {
  describe('isValidColor', () => {
    it('accepts safe hex colors', () => {
      expect(isValidColor('#fff')).toBe(true);
      expect(isValidColor('#000000')).toBe(true);
      expect(isValidColor('#A1B2C3')).toBe(true);
      expect(isValidColor('#12345678')).toBe(true);
    });

    it('accepts safe rgb and rgba colors', () => {
      expect(isValidColor('rgb(255, 0, 0)')).toBe(true);
      expect(isValidColor('rgba(0, 0, 0, 0.5)')).toBe(true);
      expect(isValidColor('rgba(100%, 0%, 50%, 1)')).toBe(true);
    });

    it('accepts safe hsl and hsla colors', () => {
      expect(isValidColor('hsl(200, 50%, 50%)')).toBe(true);
      expect(isValidColor('hsla(180, 100%, 50%, 0.3)')).toBe(true);
    });

    it('accepts safe named CSS colors', () => {
      expect(isValidColor('black')).toBe(true);
      expect(isValidColor('white')).toBe(true);
      expect(isValidColor('crimson')).toBe(true);
      expect(isValidColor('transparent')).toBe(true);
      expect(isValidColor('currentColor')).toBe(true);
    });

    it('rejects SSRF / external URL vectors in colors', () => {
      expect(isValidColor('url(https://attacker.com/leak)')).toBe(false);
      expect(isValidColor('url("http://localhost:8080")')).toBe(false);
      expect(isValidColor('url(\'//evil.com\')')).toBe(false);
    });

    it('rejects XSS and XML breakout injection in colors', () => {
      expect(isValidColor('"><script>alert(1)</script>')).toBe(false);
      expect(isValidColor('red" onload="alert(1)')) .toBe(false);
      expect(isValidColor('javascript:alert(1)')).toBe(false);
      expect(isValidColor('expression(alert(1))')).toBe(false);
      expect(isValidColor('red; -webkit-filter: ...')).toBe(false);
      expect(isValidColor('<style>body{display:none}</style>')).toBe(false);
    });

    it('rejects invalid types and oversized color strings', () => {
      expect(isValidColor(null)).toBe(false);
      expect(isValidColor(undefined)).toBe(false);
      expect(isValidColor(12345)).toBe(false);
      expect(isValidColor({})).toBe(false);
      expect(isValidColor('a'.repeat(100))).toBe(false);
    });
  });

  describe('generateQR Security & Robustness', () => {
    it('rejects empty and non-string text', async () => {
      await expect(generateQR('')).rejects.toThrow('Input text must be a non-empty string');
      await expect(generateQR(null as any)).rejects.toThrow('Input text must be a non-empty string');
      await expect(generateQR(12345 as any)).rejects.toThrow('Input text must be a non-empty string');
    });

    it('rejects oversized text payload to prevent DoS', async () => {
      const hugeText = 'A'.repeat(2001);
      await expect(generateQR(hugeText)).rejects.toThrow('Input text is too long');
    });

    it('rejects NaN and non-finite dimensions', async () => {
      await expect(generateQR('test', { width: NaN })).rejects.toThrow('Width must be a valid number');
      await expect(generateQR('test', { width: Infinity })).rejects.toThrow('Width must be a valid number');
      await expect(generateQR('test', { width: -100 })).rejects.toThrow('Width must be a valid number');
      await expect(generateQR('test', { width: 5 })).rejects.toThrow('Width must be a valid number');
      await expect(generateQR('test', { width: 20000 })).rejects.toThrow('Width must be a valid number');
    });

    it('rejects NaN and negative margins', async () => {
      await expect(generateQR('test', { margin: NaN })).rejects.toThrow('Margin must be a valid number');
      await expect(generateQR('test', { margin: -1 })).rejects.toThrow('Margin must be a valid number');
      await expect(generateQR('test', { margin: Infinity })).rejects.toThrow('Margin must be a valid number');
    });

    it('rejects malicious color injection', async () => {
      await expect(generateQR('test', { color: { dark: '"><script>alert(1)</script>' } })).rejects.toThrow('Invalid dark color');
      await expect(generateQR('test', { color: { light: 'url(https://attacker.com/leak)' } })).rejects.toThrow('Invalid light color');
      await expect(generateQR('test', { color: { dark: 1234 as any } })).rejects.toThrow('Invalid dark color');
    });

    it('rejects invalid output types and errorCorrectionLevel', async () => {
      await expect(generateQR('test', { type: 'invalid' as any })).rejects.toThrow('Invalid output type');
      await expect(generateQR('test', { errorCorrectionLevel: 'Z' as any })).rejects.toThrow('Invalid errorCorrectionLevel');
    });
  });

  describe('generateBarcode Security & Robustness', () => {
    it('rejects empty and non-string text', async () => {
      await expect(generateBarcode('')).rejects.toThrow('Input text must be a non-empty string');
      await expect(generateBarcode(null as any)).rejects.toThrow('Input text must be a non-empty string');
      await expect(generateBarcode(12345 as any)).rejects.toThrow('Input text must be a non-empty string');
    });

    it('rejects oversized text payload to prevent DoS', async () => {
      const hugeText = '1'.repeat(1001);
      await expect(generateBarcode(hugeText)).rejects.toThrow('Input text is too long');
    });

    it('rejects non-ASCII and characters outside Code 128 Set B', async () => {
      await expect(generateBarcode('Hello 🌍')).rejects.toThrow('Invalid character for Code 128 Set B');
      await expect(generateBarcode('Tab\tChar')).rejects.toThrow('Invalid character for Code 128 Set B');
      await expect(generateBarcode('Newline\nChar')).rejects.toThrow('Invalid character for Code 128 Set B');
    });

    it('escapes XML special characters in barcode label', async () => {
      const svg = await generateBarcode('A<B>C&D"E\'F', { type: 'svg' });
      expect(svg).not.toContain('<B>');
      expect(svg).toContain('&lt;B&gt;C&amp;D&quot;E&#039;F');
    });

    it('rejects NaN, Infinity and out-of-range height/scale', async () => {
      await expect(generateBarcode('1234', { height: NaN })).rejects.toThrow('Height must be a valid number');
      await expect(generateBarcode('1234', { height: Infinity })).rejects.toThrow('Height must be a valid number');
      await expect(generateBarcode('1234', { height: 0 })).rejects.toThrow('Height must be a valid number');
      await expect(generateBarcode('1234', { scale: NaN })).rejects.toThrow('Scale must be a valid number');
      await expect(generateBarcode('1234', { scale: 0 })).rejects.toThrow('Scale must be a valid number');
      await expect(generateBarcode('1234', { scale: 200 })).rejects.toThrow('Scale must be a valid number');
    });

    it('rejects invalid output type and unsupported format', async () => {
      await expect(generateBarcode('1234', { type: 'html' as any })).rejects.toThrow('Invalid output type');
      await expect(generateBarcode('1234', { format: 'ean13' as any })).rejects.toThrow('Unsupported barcode format');
    });
  });

  describe('toBase64', () => {
    it('correctly encodes ASCII and Unicode strings', () => {
      const sample = '<svg><text>Hello World! 123</text></svg>';
      const b64 = toBase64(sample);
      expect(b64).toBe(Buffer.from(sample, 'utf-8').toString('base64'));
    });
  });
});
