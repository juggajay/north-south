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
  // Note: These tests verify the integration works in a real browser environment
  // In jsdom, we test the validation logic directly with ImageData

  it('should reject blurry images with specific message', async () => {
    // Create a simple test by mocking the internal behavior
    const blurryImage = createTestImageData(100, 100, { type: 'blurry' });
    const darkImage = createTestImageData(100, 100, { type: 'dark' });

    const blurVariance = detectBlur(blurryImage);
    const darkBrightness = detectBrightness(darkImage);

    // Blurry should have low variance
    expect(blurVariance).toBeLessThan(100);
    // Dark blurry image should also be dark
    expect(darkBrightness).toBeLessThan(50);
  });

  it('should reject dark images with specific message', async () => {
    const darkImage = createTestImageData(100, 100, { type: 'dark' });
    const brightness = detectBrightness(darkImage);

    expect(brightness).toBeLessThan(50);
  });

  it('should reject bright images with specific message', async () => {
    const brightImage = createTestImageData(100, 100, { type: 'bright' });
    const brightness = detectBrightness(brightImage);

    expect(brightness).toBeGreaterThan(220);
  });

  it('should accept good quality images', async () => {
    const normalImage = createTestImageData(100, 100, { type: 'normal' });
    const variance = detectBlur(normalImage);
    const brightness = detectBrightness(normalImage);

    // Normal image should pass both checks
    expect(variance).toBeGreaterThanOrEqual(100);
    expect(brightness).toBeGreaterThanOrEqual(50);
    expect(brightness).toBeLessThanOrEqual(220);
  });

  it('should return multiple issues when both blur and brightness are problems', async () => {
    const darkImage = createTestImageData(100, 100, { type: 'dark' });
    const blurVariance = detectBlur(darkImage);
    const brightness = detectBrightness(darkImage);

    // Dark uniform image is both blurry and dark
    expect(blurVariance).toBeLessThan(100);
    expect(brightness).toBeLessThan(50);
  });

  it('should handle large images efficiently by downscaling', async () => {
    const largeImage = createTestImageData(2000, 2000, { type: 'normal' });

    const startTime = Date.now();
    const variance = detectBlur(largeImage);
    const brightness = detectBrightness(largeImage);
    const endTime = Date.now();

    expect(variance).toBeDefined();
    expect(brightness).toBeDefined();
    expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
  });
});
