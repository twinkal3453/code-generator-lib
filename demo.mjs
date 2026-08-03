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
}

runDemo().catch(console.error);
