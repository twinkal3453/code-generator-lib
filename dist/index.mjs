// src/qr.ts
import QRCode from "qrcode";
async function generateQR(text, options = {}) {
  const { type = "dataUrl", width = 200, margin = 4, errorCorrectionLevel = "M", color } = options;
  const qrOptions = {
    width,
    margin,
    errorCorrectionLevel,
    color
  };
  if (type === "svg") {
    return QRCode.toString(text, { ...qrOptions, type: "svg" });
  } else {
    return QRCode.toDataURL(text, qrOptions);
  }
}

// src/barcode.ts
import bwipjs from "bwip-js";
async function generateBarcode(text, options = {}) {
  const {
    format = "code128",
    type = "dataUrl",
    includetext = true,
    textxalign = "center",
    height = 10,
    scale = 3,
    ...rest
  } = options;
  const bwipOptions = {
    bcid: format,
    text,
    includetext,
    textxalign,
    height,
    scale,
    ...rest
  };
  try {
    const svgString = bwipjs.toSVG(bwipOptions);
    if (type === "svg") {
      return svgString;
    } else {
      const base64Svg = typeof Buffer !== "undefined" ? Buffer.from(svgString).toString("base64") : btoa(unescape(encodeURIComponent(svgString)));
      return `data:image/svg+xml;base64,${base64Svg}`;
    }
  } catch (err) {
    throw new Error(`Failed to generate barcode: ${err instanceof Error ? err.message : err}`);
  }
}
export {
  generateBarcode,
  generateQR
};
//# sourceMappingURL=index.mjs.map