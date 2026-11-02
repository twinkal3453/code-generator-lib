import { describe, expect, it } from 'vitest';
import { Resvg } from '@resvg/resvg-js';
import jsQR from 'jsqr';
import { generateQR, type QROptions, type QRStyle } from '../src/index';

// An opaque PNG makes decoding exercise the area actually covered by a logo.
const logoPng = new Resvg('<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="#1e40af" /><path d="M10 20h20M20 10v20" stroke="white" stroke-width="4" /></svg>').render().asPng();
const logoSrc = `data:image/png;base64,${logoPng.toString('base64')}`;
const styles: QRStyle[] = ['classic', 'rounded', 'gradient', 'logo', 'minimal'];

function decode(svg: string) {
  const image = new Resvg(svg).render();
  return jsQR(new Uint8ClampedArray(image.pixels), image.width, image.height)?.data;
}

describe('QR styles', () => {
  it('keeps classic as the default', async () => {
    expect(await generateQR('Hello')).toBe(await generateQR('Hello', { style: 'classic' }));
  });

  for (const style of styles) {
    for (const text of ['HELLO', 'https://example.com/products/123?source=qr', 'Hello 世界 🌍', 'Long payload '.repeat(25)]) {
      // Dense grids need more pixels per module, including in the classic renderer.
      for (const width of text.length > 100 ? [600] : [200, 600]) {
        it(`decodes ${style} with ${text.length} input characters at ${width}px`, async () => {
          const svg = await generateQR(text, { style, type: 'svg', width, logo: { src: logoSrc } });
          expect(decode(svg)).toBe(text);
        });
      }
    }

    it(`returns matching SVG and data URL output for ${style}`, async () => {
      const options: QROptions = { style, logo: { src: logoSrc } };
      const svg = await generateQR('Hello', { ...options, type: 'svg' });
      const url = await generateQR('Hello', options);
      expect(url).toBe(`data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`);
    });
  }

  it('supports custom gradient colors and directions without changing the modules', async () => {
    const classic = await generateQR('Hello', { type: 'svg' });
    const gradient = await generateQR('Hello', { type: 'svg', style: 'gradient', gradient: { start: '#112244', end: '#441122', angle: 90 } });
    expect(gradient.match(/<path d="([^"]+)"/)?.[1]).toBe(classic.match(/<path d="([^"]+)"/)?.[1]);
    expect(gradient).toContain('stop-color="#112244"');
    expect(gradient).toContain('stop-color="#441122"');
    const other = await generateQR('Hello', { type: 'svg', style: 'gradient' });
    expect(gradient.match(/linearGradient id="([^"]+)"/)?.[1]).not.toBe(other.match(/linearGradient id="([^"]+)"/)?.[1]);
    expect(decode(gradient)).toBe('Hello');
  });

  it('escapes logo URL attributes and centers the image', async () => {
    const svg = await generateQR('Hello', { style: 'logo', type: 'svg', logo: { src: 'https://example.com/logo.png?a=1&b=2' } });
    expect(svg).toContain('href="https://example.com/logo.png?a=1&amp;b=2"');
    expect(svg).toContain('preserveAspectRatio="xMidYMid meet"');
    expect(svg.match(/<image /g)).toHaveLength(1);
  });

  it('decodes a logo at maximum size and padding', async () => {
    const svg = await generateQR('https://example.com', { type: 'svg', style: 'logo', width: 600, logo: { src: logoSrc, size: 0.2, padding: 1 } });
    expect(decode(svg)).toBe('https://example.com');
  });

  it('embeds a visible logo in the rendered output', async () => {
    const svg = await generateQR('Hello', { type: 'svg', style: 'logo', width: 600, logo: { src: logoSrc } });
    const { pixels } = new Resvg(svg).render();
    let bluePixels = 0;
    for (let i = 0; i < pixels.length; i += 4) {
      if (pixels[i] === 30 && pixels[i + 1] === 64 && pixels[i + 2] === 175) bluePixels++;
    }
    expect(bluePixels).toBeGreaterThan(100);
  });

  it.each([
    { style: 'unknown' },
    { style: 'gradient', gradient: { start: '"><script>alert(1)</script>' } },
    { style: 'gradient', gradient: { end: 'url(https://example.com)' } },
    { style: 'gradient', gradient: { angle: NaN } },
    { style: 'gradient', gradient: { angle: Infinity } },
    { style: 'gradient', gradient: { angle: -1 } },
    { style: 'gradient', gradient: { angle: 361 } },
    { style: 'logo' },
    { style: 'logo', logo: { src: 'javascript:alert(1)' } },
    { style: 'logo', logo: { src: 'data:image/svg+xml;base64,PHN2Zz4=' } },
    { style: 'logo', logo: { src: 'https://example.com/" onload="alert(1)' } },
    { style: 'logo', logo: { src: 'file:///logo.png' } },
    { style: 'logo', logo: { src: 'data:image/png;base64,' } },
    { style: 'logo', logo: { src: logoSrc, size: 0.5 } },
    { style: 'logo', logo: { src: logoSrc, size: NaN } },
    { style: 'logo', logo: { src: logoSrc, padding: -1 } },
    { style: 'logo', logo: { src: logoSrc, padding: Infinity } },
    { style: 'logo', logo: { src: logoSrc }, errorCorrectionLevel: 'L' },
  ])('rejects invalid style options: %j', async (options) => {
    await expect(generateQR('Hello', options as QROptions)).rejects.toThrow();
  });
});
