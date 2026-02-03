#!/usr/bin/env node

/**
 * Generate minimal favicon.ico
 * ICO format is more complex than PNG, but we can create a minimal 16x16 version
 */

const fs = require('fs');
const path = require('path');

function generateMinimalICO() {
  // ICO format structure:
  // Header (6 bytes) + Directory Entry (16 bytes) + PNG data

  // For simplicity, we'll embed a 16x16 PNG inside the ICO wrapper
  const width = 16;
  const height = 16;

  // Create minimal 16x16 PNG
  const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // RGB for #18181b (zinc-900)
  const r = 0x18;
  const g = 0x18;
  const b = 0x1b;

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8);  // Bit depth
  ihdr.writeUInt8(2, 9);  // Color type (RGB)
  ihdr.writeUInt8(0, 10); // Compression
  ihdr.writeUInt8(0, 11); // Filter
  ihdr.writeUInt8(0, 12); // Interlace

  const bytesPerPixel = 3;
  const rowBytes = width * bytesPerPixel + 1;
  const imageData = Buffer.alloc(height * rowBytes);

  for (let y = 0; y < height; y++) {
    imageData[y * rowBytes] = 0; // Filter type
    for (let x = 0; x < width; x++) {
      const idx = y * rowBytes + 1 + x * bytesPerPixel;
      imageData[idx] = r;
      imageData[idx + 1] = g;
      imageData[idx + 2] = b;
    }
  }

  const zlib = require('zlib');
  const compressed = zlib.deflateSync(imageData);

  function makeChunk(type, data) {
    const length = Buffer.alloc(4);
    length.writeUInt32BE(data.length, 0);
    const typeBuffer = Buffer.from(type, 'ascii');
    const crcData = Buffer.concat([typeBuffer, data]);
    const crc32 = zlib.crc32(crcData);
    const crcBuffer = Buffer.alloc(4);
    crcBuffer.writeUInt32BE(crc32, 0);
    return Buffer.concat([length, typeBuffer, data, crcBuffer]);
  }

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));
  const pngData = Buffer.concat([PNG_SIGNATURE, ihdrChunk, idatChunk, iendChunk]);

  // ICO Header (6 bytes)
  const icoHeader = Buffer.alloc(6);
  icoHeader.writeUInt16LE(0, 0);    // Reserved (must be 0)
  icoHeader.writeUInt16LE(1, 2);    // Image type (1 = ICO)
  icoHeader.writeUInt16LE(1, 4);    // Number of images

  // ICO Directory Entry (16 bytes)
  const dirEntry = Buffer.alloc(16);
  dirEntry.writeUInt8(width, 0);     // Width
  dirEntry.writeUInt8(height, 1);    // Height
  dirEntry.writeUInt8(0, 2);         // Color palette
  dirEntry.writeUInt8(0, 3);         // Reserved
  dirEntry.writeUInt16LE(1, 4);      // Color planes
  dirEntry.writeUInt16LE(24, 6);     // Bits per pixel
  dirEntry.writeUInt32LE(pngData.length, 8);  // Image size
  dirEntry.writeUInt32LE(22, 12);    // Offset (6 + 16 = 22)

  return Buffer.concat([icoHeader, dirEntry, pngData]);
}

const publicDir = path.join(__dirname, '..', 'public');
const faviconPath = path.join(publicDir, 'favicon.ico');

console.log('Generating favicon.ico...');

try {
  const icoData = generateMinimalICO();
  fs.writeFileSync(faviconPath, icoData);
  console.log('✓ Created favicon.ico');
} catch (error) {
  console.error('Error generating favicon:', error.message);
  process.exit(1);
}
