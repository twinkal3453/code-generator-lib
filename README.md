# code-generator-library

[![npm version](https://img.shields.io/npm/v/code-generator-library.svg)](https://www.npmjs.com/package/code-generator-library)
[![license](https://img.shields.io/npm/l/code-generator-library.svg)](https://github.com/twinkal3453/code-generator-lib/blob/main/LICENSE)
[![zero dependencies](https://img.shields.io/badge/dependencies-0-brightgreen.svg)](https://www.npmjs.com/package/code-generator-library)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.npmjs.com/package/code-generator-library)

> **Ultra-fast, 100% Zero-Dependency QR Code & Code 128 Barcode Generator for JavaScript & TypeScript.**  
> Effortlessly generate high-resolution QR codes and barcodes as **SVG strings** or **Base64 Data URIs** in both **Node.js** and **Browser** environments out of the box.

---

## ⚡ Features

- 🚀 **100% Zero Dependencies**: Lightweight, secure, and blazingly fast. No heavy native canvas or native binary dependencies.
- 📦 **Universal / Cross-Platform**: Runs seamlessly in **Node.js**, **Browsers**, **React**, **Next.js**, **Vue**, **Angular**, **Svelte**, and **React Native**.
- 🔲 **QR Code Generator**: Creates customizable QR codes with custom error correction levels (`L`, `M`, `Q`, `H`), colors, sizes, and margins.
- 📊 **Code 128 Barcode Generator**: Generates crisp, standard Code 128 (Set B) barcodes for inventory, logistics, labels, and products.
- 🎨 **Multiple Output Formats**: Output directly as **Base64 SVG Data URIs** (perfect for `<img src="...">`) or raw **SVG strings**.
- 📘 **First-Class TypeScript Support**: Full type definitions built right into the package.

---

## 📥 Installation

Install via npm, yarn, or pnpm:

```bash
# npm
npm install code-generator-library

# yarn
yarn add code-generator-library

# pnpm
pnpm add code-generator-library
```

---

## 🚀 Quick Start & Usage

Supports both **ES Modules (`import`)** and **CommonJS (`require`)**.

### 1. Generating QR Codes (`generateQR`)

Generate QR Code Data URIs for instant rendering in `<img>` tags or get pure SVG markup:

```typescript
import { generateQR } from 'code-generator-library';

async function generateQRCodeExample() {
  // Option A: Generate as Base64 SVG Data URI (Default)
  const qrDataUri = await generateQR('https://github.com/twinkal3453/code-generator-lib');
  // Result: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0..."

  // Option B: Generate as a raw SVG string with custom colors & margin
  const qrSvg = await generateQR('https://example.com', {
    type: 'svg',
    width: 250,
    margin: 2,
    errorCorrectionLevel: 'H',
    color: {
      dark: '#1e293b',  // QR Modules color
      light: '#ffffff'  // Background color
    }
  });
}
```

#### Render in React / Next.js:
```tsx
import React, { useEffect, useState } from 'react';
import { generateQR } from 'code-generator-library';

export function QRCodeComponent({ url }: { url: string }) {
  const [src, setSrc] = useState('');

  useEffect(() => {
    generateQR(url).then(setSrc);
  }, [url]);

  return <img src={src} alt="Generated QR Code" />;
}
```

---

### 2. Generating Barcodes (`generateBarcode`)

Generate Code 128 Barcodes instantly:

```typescript
import { generateBarcode } from 'code-generator-library';

async function generateBarcodeExample() {
  // Option A: Generate Code 128 Barcode as Base64 Data URI
  const barcodeDataUri = await generateBarcode('PACKAGE-98765');
  // Result: "data:image/svg+xml;base64,PHN2ZyB4..."

  // Option B: Generate Code 128 Barcode as raw SVG string
  const barcodeSvg = await generateBarcode('1234567890', {
    type: 'svg',
    height: 70,
    scale: 3
  });
}
```

#### Render in Express / Node.js Server:
```javascript
const express = require('express');
const { generateBarcode, generateQR } = require('code-generator-library');

const app = express();

app.get('/api/barcode', async (req, res) => {
  const text = req.query.text || '123456789';
  const svg = await generateBarcode(text, { type: 'svg' });
  res.setHeader('Content-Type', 'image/svg+xml');
  res.send(svg);
});
```

---

## 📖 API Reference

### `generateQR(text, options?)`

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `text` | `string` | **Required** | Text, URL, or data payload to encode into the QR code. |
| `options.type` | `'dataUrl' \| 'svg'` | `'dataUrl'` | `'dataUrl'` returns Base64 Data URI, `'svg'` returns raw SVG string. |
| `options.width` | `number` | `200` | Width and height dimension in pixels. |
| `options.margin` | `number` | `4` | Quiet zone margin blocks around the QR code. |
| `options.errorCorrectionLevel` | `'L' \| 'M' \| 'Q' \| 'H'` | `'M'` | Error correction recovery level (`L` ~7%, `M` ~15%, `Q` ~25%, `H` ~30%). |
| `options.color.dark` | `string` | `'#000000'` | Hex/RGB color string for the dark blocks. |
| `options.color.light` | `string` | `'#ffffff'` | Hex/RGB color string for the background. |

### `generateBarcode(text, options?)`

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `text` | `string` | **Required** | ASCII text string (Code 128 Set B format) to encode. |
| `options.type` | `'dataUrl' \| 'svg'` | `'dataUrl'` | `'dataUrl'` returns Base64 Data URI, `'svg'` returns raw SVG string. |
| `options.height` | `number` | `50` | Height of barcode bars in pixels. |
| `options.scale` | `number` | `2` | Barcode width scale multiplier. |

---

## 🌐 Compatibility & Keywords

- **Frameworks**: React, Next.js, Vue, Nuxt, Angular, Svelte, Express, Fastify, NestJS, Vite, Webpack.
- **Environments**: Node.js, Deno, Bun, Cloudflare Workers, Vercel Edge Functions, Browser JS.
- **Search Keywords**: qr code generator, barcode generator, code 128 barcode, svg qr code, base64 qr code, javascript qr code library, typescript barcode library, zero dependency qr code, zero dependency barcode generator.

---

## 📄 License

[ISC](https://github.com/twinkal3453/code-generator-lib/blob/main/LICENSE) © [Twinkal K Raj](https://github.com/twinkal3453)
