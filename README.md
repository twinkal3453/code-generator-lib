# code-generator-lib

A universal, easy-to-use npm library for generating QR Codes and Barcodes. Works in both Node.js and the Browser, exporting pure SVG strings or Base64 Data URIs out of the box!

## Installation

```bash
npm install code-generator-lib
```

## Usage

You can use the library using ES Modules (`import`) or CommonJS (`require`). 

### Generating QR Codes

Generate QR codes easily and get the output as a Base64 PNG Data URI (perfect for `<img>` tags) or a pure SVG string.

```typescript
import { generateQR } from 'code-generator-lib';

async function main() {
  // 1. Generate as a Data URI (Base64 PNG - Default)
  const qrDataUri = await generateQR('https://example.com');
  // Result: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...

  // 2. Generate as a pure SVG string
  const qrSvg = await generateQR('https://example.com', { type: 'svg' });
  // Result: <svg xmlns="http://www.w3.org/2000/svg" ...></svg>
}
```

### Generating Barcodes

Generate multiple formats of barcodes (defaults to `code128`). 

```typescript
import { generateBarcode } from 'code-generator-lib';

async function main() {
  // 1. Generate as a Data URI (Base64 SVG)
  const barcodeDataUri = await generateBarcode('1234567890', { format: 'code128' });
  // Result: data:image/svg+xml;base64,PHN2ZyB4bWxucz0...

  // 2. Generate as a pure SVG string
  const barcodeSvg = await generateBarcode('1234567890', { 
    format: 'ean13', 
    type: 'svg',
    includetext: true 
  });
}
```

## API Options

### `generateQR(text, options)`
- `text` (string): The string/URL to encode.
- `options` (object):
  - `type` (`'dataUrl'` | `'svg'`): Output format. (Default: `'dataUrl'`)
  - `width` (number): Pixel width/height of the QR code. (Default: `200`)
  - `margin` (number): Margin around the code. (Default: `4`)
  - `errorCorrectionLevel` (`'L'` | `'M'` | `'Q'` | `'H'`): EC Level. (Default: `'M'`)
  - `color`: Object defining `dark` and `light` hex colors (e.g. `{ dark: '#000000', light: '#ffffff' }`).

### `generateBarcode(text, options)`
- `text` (string): The string to encode.
- `options` (object):
  - `format` (string): The barcode format. Supports `code128`, `ean13`, `upca`, and many more (powered by bwip-js). (Default: `'code128'`)
  - `type` (`'dataUrl'` | `'svg'`): Output format. (Default: `'dataUrl'`)
  - `includetext` (boolean): Show human-readable text below the barcode. (Default: `true`)
  - `height` (number): Barcode height. (Default: `10`)
  - `scale` (number): Barcode scaling factor. (Default: `3`)
  - `textxalign` (`'center'` | `'left'` | `'right'` | `'justify'`): Text alignment. (Default: `'center'`)
