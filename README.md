# code-generator-library

A zero-dependency, incredibly lightweight npm library for generating QR Codes and Code 128 Barcodes. 

Because this library is 100% dependency-free, it is exceptionally fast, small, and works universally in both Node.js and the Browser out of the box! It generates pure SVG strings or Base64 Data URIs.

## Installation

```bash
npm install code-generator-library
```

## Usage

You can import the library using ES Modules (`import`) or CommonJS (`require`). 

### Generating QR Codes

Generate QR codes easily and get the output as a Base64 SVG Data URI (perfect for `<img>` tags) or a pure SVG string.

```typescript
import { generateQR } from 'code-generator-library';

async function main() {
  // 1. Generate as a Data URI (Base64 SVG - Default)
  const qrDataUri = await generateQR('https://example.com');
  // Result: data:image/svg+xml;base64,PHN2ZyB4bWxucz0...

  // 2. Generate as a pure SVG string
  const qrSvg = await generateQR('https://example.com', { type: 'svg', margin: 2 });
  // Result: <svg xmlns="http://www.w3.org/2000/svg" ...></svg>
}
```

### Generating Barcodes

Generate Code 128 (Set B) barcodes. 

```typescript
import { generateBarcode } from 'code-generator-library';

async function main() {
  // 1. Generate as a Data URI (Base64 SVG)
  const barcodeDataUri = await generateBarcode('HELLO WORLD');
  // Result: data:image/svg+xml;base64,PHN2ZyB4bWxucz0...

  // 2. Generate as a pure SVG string
  const barcodeSvg = await generateBarcode('1234567890', { 
    type: 'svg',
    height: 60,
    scale: 3
  });
}
```

## API Options

### `generateQR(text, options)`
- `text` (string): The string/URL to encode.
- `options` (object):
  - `type` (`'dataUrl'` | `'svg'`): Output format. (Default: `'dataUrl'`)
  - `width` (number): Pixel width/height of the QR code. (Default: `200`)
  - `margin` (number): Margin blocks around the code. (Default: `4`)
  - `errorCorrectionLevel` (`'L'` | `'M'` | `'Q'` | `'H'`): EC Level. (Default: `'M'`)
  - `color`: Object defining `dark` and `light` hex colors (Default: `{ dark: '#000000', light: '#ffffff' }`).

### `generateBarcode(text, options)`
- `text` (string): The string to encode (ASCII 32-127).
- `options` (object):
  - `type` (`'dataUrl'` | `'svg'`): Output format. (Default: `'dataUrl'`)
  - `height` (number): Bar height in pixels. (Default: `50`)
  - `scale` (number): Barcode width scaling factor. (Default: `2`)
