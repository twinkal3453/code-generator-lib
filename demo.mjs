import { generateQR, generateBarcode } from './dist/index.mjs';
import fs from 'fs';

async function runDemo() {
  console.log('Generating QR Code SVG...');
  const qrSvg = await generateQR('Aamdani aathanni kharcha rupiya', { type: 'svg' });
  fs.writeFileSync('qr-demo.svg', qrSvg);
  console.log('Saved to qr-demo.svg');

  console.log('Generating Barcode SVG...');
  const barcodeSvg = await generateBarcode('1234567890', { format: 'code128', type: 'svg' });
  fs.writeFileSync('barcode-demo.svg', barcodeSvg);
  console.log('Saved to barcode-demo.svg');

  // Embedded sample logo keeps the SVG preview self-contained.
  const logoSrc = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAbElEQVR4nO3PwQmAMBQEUW1EW9EO7FQ7sBYr0dyEgCQwCCF/5rDnt+O07PfQcAJpAmkCaQJpcYDXuaV9m9cjLU8gTSBNIK0fYA6g1R4Q+FU8YKn8QC2glECaQJpAWhzgXwmkCaQJpAmkNQ98AGNgjgl76KUwAAAAAElFTkSuQmCC';
  const styles = ['classic', 'rounded', 'gradient', 'logo', 'minimal'];
  let gallery = '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="290" viewBox="0 0 1200 290"><rect width="100%" height="100%" fill="#f1f5f9" />';
  for (const [index, style] of styles.entries()) {
    const svg = await generateQR('https://example.com', {
      type: 'svg', style, width: 200, logo: { src: logoSrc }
    });
    gallery += `<g transform="translate(${20 + index * 236},20)"><rect width="216" height="250" rx="12" fill="white" /><g transform="translate(8,8)">${svg}</g><text x="108" y="232" text-anchor="middle" font-family="sans-serif" font-size="16" fill="#1e293b">${style[0].toUpperCase() + style.slice(1)} QR</text></g>`;
  }
  fs.writeFileSync('qr-styles-demo.svg', gallery + '</svg>');
  console.log('Saved all five styles to qr-styles-demo.svg');
}

runDemo().catch(console.error);
