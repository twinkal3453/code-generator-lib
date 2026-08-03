import { describe, it, expect } from 'vitest';
import { generateQR, generateBarcode } from '../src/index';

describe('Barcode and QR Generator', () => {
  describe('generateQR', () => {
    it('should generate a QR code data URL by default', async () => {
      const result = await generateQR('https://example.com');
      expect(result).toMatch(/^data:image\/svg\+xml;base64,/);
    });

    it('should generate an SVG string when requested', async () => {
      const result = await generateQR('https://example.com', { type: 'svg' });
      expect(result).toContain('<svg');
      expect(result).toContain('</svg>');
    });
  });

  describe('generateBarcode', () => {
    it('should generate a Barcode data URL by default', async () => {
      const result = await generateBarcode('1234567890');
      expect(result).toMatch(/^data:image\/svg\+xml;base64,/);
    });

    it('should generate an SVG string when requested', async () => {
      const result = await generateBarcode('1234567890', { type: 'svg' });
      expect(result).toContain('<svg');
      expect(result).toContain('</svg>');
    });
  });
});
