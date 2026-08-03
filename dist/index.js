"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  generateBarcode: () => generateBarcode,
  generateQR: () => generateQR
});
module.exports = __toCommonJS(index_exports);

// src/qr.ts
var import_qrcode = __toESM(require("qrcode"));
async function generateQR(text, options = {}) {
  const { type = "dataUrl", width = 200, margin = 4, errorCorrectionLevel = "M", color } = options;
  const qrOptions = {
    width,
    margin,
    errorCorrectionLevel,
    color
  };
  if (type === "svg") {
    return import_qrcode.default.toString(text, { ...qrOptions, type: "svg" });
  } else {
    return import_qrcode.default.toDataURL(text, qrOptions);
  }
}

// src/barcode.ts
var import_bwip_js = __toESM(require("bwip-js"));
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
    const svgString = import_bwip_js.default.toSVG(bwipOptions);
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  generateBarcode,
  generateQR
});
//# sourceMappingURL=index.js.map