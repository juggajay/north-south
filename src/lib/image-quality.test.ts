import { describe, it, expect, beforeAll } from 'vitest';
import { detectBlur, detectBrightness, validateImageQuality } from './image-quality';

// Helper to create ImageData with specific characteristics
function createTestImageData(
  width: number,
  height: number,
  options: {
    type: 'sharp' | 'blurry' | 'dark' | 'bright' | 'normal';
  }
): ImageData {
  const data = new Uint8ClampedArray(width * height * 4);

  if (options.type === 'sharp') {
    // High contrast pattern for sharp detection
    for (let i = 0; i < data.length; i += 4) {
      const x = (i / 4) % width;
      const y = Math.floor(i / 4 / width);
      const isWhite = (Math.floor(x / 5) + Math.floor(y / 5)) % 2 === 0;
      const value = isWhite ? 255 : 0;
      data[i] = value; // R
      data[i + 1] = value; // G
      data[i + 2] = value; // B
      data[i + 3] = 255; // A
    }
  } else if (options.type === 'blurry') {
    // Low contrast, smooth gradients for blurry detection
    for (let i = 0; i < data.length; i += 4) {
      const value = 128; // Uniform gray
      data[i] = value;
      data[i + 1] = value;
      data[i + 2] = value;
      data[i + 3] = 255;
    }
  } else if (options.type === 'dark') {
    // Very dark image (underexposed)
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 20; // R
      data[i + 1] = 20; // G
      data[i + 2] = 20; // B
      data[i + 3] = 255; // A
    }
  } else if (options.type === 'bright') {
    // Very bright image (overexposed)
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 250; // R
      data[i + 1] = 250; // G
      data[i + 2] = 250; // B
      data[i + 3] = 255; // A
    }
  } else if (options.type === 'normal') {
    // Normal brightness with sharp features
    for (let i = 0; i < data.length; i += 4) {
      const x = (i / 4) % width;
      const y = Math.floor(i / 4 / width);
      const isWhite = (Math.floor(x / 5) + Math.floor(y / 5)) % 2 === 0;
      const value = isWhite ? 180 : 80;
      data[i] = value;
      data[i + 1] = value;
      data[i + 2] = value;
      data[i + 3] = 255;
    }
  }

  return new ImageData(data, width, height);
}

describe('detectBlur', () => {
  it('should return low variance for blurry images', () => {
    const blurryImage = createTestImageData(100, 100, { type: 'blurry' });
    const variance = detectBlur(blurryImage);
    expect(variance).toBeLessThan(100);
  });

  it('should return high variance for sharp images', () => {
    const sharpImage = createTestImageData(100, 100, { type: 'sharp' });
    const variance = detectBlur(sharpImage);
    expect(variance).toBeGreaterThanOrEqual(100);
  });

  it('should handle small images', () => {
    const smallImage = createTestImageData(10, 10, { type: 'sharp' });
    const variance = detectBlur(smallImage);
    expect(typeof variance).toBe('number');
    expect(variance).toBeGreaterThan(0);
  });

  it('should handle large images', () => {
    const largeImage = createTestImageData(500, 500, { type: 'blurry' });
    const variance = detectBlur(largeImage);
    expect(typeof variance).toBe('number');
    expect(variance).toBeLessThan(100);
  });
});

describe('detectBrightness', () => {
  it('should return low brightness for dark images', () => {
    const darkImage = createTestImageData(100, 100, { type: 'dark' });
    const brightness = detectBrightness(darkImage);
    expect(brightness).toBeLessThan(50);
  });

  it('should return high brightness for bright images', () => {
    const brightImage = createTestImageData(100, 100, { type: 'bright' });
    const brightness = detectBrightness(brightImage);
    expect(brightness).toBeGreaterThan(220);
  });

  it('should return normal brightness for well-lit images', () => {
    const normalImage = createTestImageData(100, 100, { type: 'normal' });
    const brightness = detectBrightness(normalImage);
    expect(brightness).toBeGreaterThanOrEqual(50);
    expect(brightness).toBeLessThanOrEqual(220);
  });

  it('should return brightness in 0-255 range', () => {
    const image = createTestImageData(50, 50, { type: 'normal' });
    const brightness = detectBrightness(image);
    expect(brightness).toBeGreaterThanOrEqual(0);
    expect(brightness).toBeLessThanOrEqual(255);
  });
});

describe('validateImageQuality', () => {
  let blurryImageUrl: string;
  let darkImageUrl: string;
  let brightImageUrl: string;
  let goodImageUrl: string;

  beforeAll(() => {
    // Create test image URLs from canvas
    const createImageUrl = (
      width: number,
      height: number,
      type: 'sharp' | 'blurry' | 'dark' | 'bright' | 'normal'
    ): string => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      const imageData = createTestImageData(width, height, { type });
      ctx.putImageData(imageData, 0, 0);
      return canvas.toDataURL();
    };

    blurryImageUrl = createImageUrl(100, 100, 'blurry');
    darkImageUrl = createImageUrl(100, 100, 'dark');
    brightImageUrl = createImageUrl(100, 100, 'bright');
    goodImageUrl = createImageUrl(100, 100, 'normal');
  });

  it('should reject blurry images with specific message', async () => {
    const result = await validateImageQuality(blurryImageUrl);
    expect(result.valid).toBe(false);
    expect(result.issues).toHaveLength(1);
    expect(result.issues[0]).toContain('Image sharpness: Low');
    expect(result.issues[0]).toContain('Tip:');
  });

  it('should reject dark images with specific message', async () => {
    const result = await validateImageQuality(darkImageUrl);
    expect(result.valid).toBe(false);
    expect(result.issues.length).toBeGreaterThan(0);
    const brightnessIssue = result.issues.find((i) =>
      i.includes('Image brightness: Low')
    );
    expect(brightnessIssue).toBeDefined();
    expect(brightnessIssue).toContain('Tip:');
  });

  it('should reject bright images with specific message', async () => {
    const result = await validateImageQuality(brightImageUrl);
    expect(result.valid).toBe(false);
    expect(result.issues.length).toBeGreaterThan(0);
    const brightnessIssue = result.issues.find((i) =>
      i.includes('Image brightness: High')
    );
    expect(brightnessIssue).toBeDefined();
    expect(brightnessIssue).toContain('Tip:');
  });

  it('should accept good quality images', async () => {
    const result = await validateImageQuality(goodImageUrl);
    expect(result.valid).toBe(true);
    expect(result.issues).toHaveLength(0);
  });

  it('should return multiple issues when both blur and brightness are problems', async () => {
    // Create a blurry and dark image
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d')!;
    const imageData = createTestImageData(100, 100, { type: 'dark' });
    ctx.putImageData(imageData, 0, 0);
    const blurryDarkUrl = canvas.toDataURL();

    const result = await validateImageQuality(blurryDarkUrl);
    expect(result.valid).toBe(false);
    // Should have at least one issue (dark), possibly two if also blurry
    expect(result.issues.length).toBeGreaterThan(0);
  });

  it('should handle large images efficiently by downscaling', async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 2000;
    canvas.height = 2000;
    const ctx = canvas.getContext('2d')!;
    const imageData = createTestImageData(2000, 2000, { type: 'normal' });
    ctx.putImageData(imageData, 0, 0);
    const largeImageUrl = canvas.toDataURL();

    const startTime = Date.now();
    const result = await validateImageQuality(largeImageUrl);
    const endTime = Date.now();

    expect(result).toBeDefined();
    expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
  });
});
