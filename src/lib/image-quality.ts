/**
 * Image Quality Detection Utilities
 *
 * Client-side validation for camera capture quality using Canvas API.
 * Detects blur via Laplacian variance and brightness issues via pixel averaging.
 */

/**
 * Detect image blur using Laplacian variance
 * @param imageData - Canvas ImageData to analyze
 * @returns Variance value (higher = sharper)
 */
export function detectBlur(imageData: ImageData): number {
  const { width, height, data } = imageData;

  // Convert RGBA to grayscale using luminosity formula
  const grayscale: number[] = [];
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
    grayscale.push(gray);
  }

  // Apply 3x3 Laplacian kernel: [0,1,0], [1,-4,1], [0,1,0]
  const laplacian: number[] = [];
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      const top = grayscale[idx - width];
      const left = grayscale[idx - 1];
      const center = grayscale[idx];
      const right = grayscale[idx + 1];
      const bottom = grayscale[idx + width];

      const lap = top + left - 4 * center + right + bottom;
      laplacian.push(lap);
    }
  }

  // Calculate variance of Laplacian values
  if (laplacian.length === 0) return 0;

  const mean = laplacian.reduce((sum, val) => sum + val, 0) / laplacian.length;
  const variance =
    laplacian.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
    laplacian.length;

  return variance;
}

/**
 * Detect image brightness using pixel averaging
 * @param imageData - Canvas ImageData to analyze
 * @returns Average brightness (0-255)
 */
export function detectBrightness(imageData: ImageData): number {
  const { data } = imageData;
  let sum = 0;
  let count = 0;

  // Average RGB values across all pixels
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    sum += (r + g + b) / 3;
    count++;
  }

  return count > 0 ? sum / count : 0;
}

/**
 * Get brightness issue message if any
 * @param brightness - Brightness value (0-255)
 * @returns Issue message or null
 */
function getBrightnessIssue(brightness: number): string | null {
  if (brightness < 50) {
    return "Image brightness: Low. Tip: Move to a well-lit area or turn on lights.";
  }
  if (brightness > 220) {
    return "Image brightness: High. Tip: Avoid direct sunlight or bright lights in frame.";
  }
  return null;
}

/**
 * Check if image is blurry
 * @param variance - Laplacian variance value
 * @param threshold - Blur threshold (default: 100)
 * @returns True if blurry
 */
function isBlurry(variance: number, threshold = 100): boolean {
  return variance < threshold;
}

/**
 * Validate overall image quality
 * @param imageUrl - Image URL to validate
 * @returns Validation result with specific issues
 */
export async function validateImageQuality(
  imageUrl: string
): Promise<{ valid: boolean; issues: string[] }> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      try {
        // Create canvas and downscale to 1024px max dimension for performance
        const canvas = document.createElement("canvas");
        const maxDimension = 1024;
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = (height / width) * maxDimension;
            width = maxDimension;
          } else {
            width = (width / height) * maxDimension;
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const imageData = ctx.getImageData(0, 0, width, height);

        // Run both detections
        const variance = detectBlur(imageData);
        const brightness = detectBrightness(imageData);

        // Compile issues array
        const issues: string[] = [];

        if (isBlurry(variance)) {
          issues.push(
            "Image sharpness: Low. Tip: Ensure good lighting and hold phone steady."
          );
        }

        const brightnessIssue = getBrightnessIssue(brightness);
        if (brightnessIssue) {
          issues.push(brightnessIssue);
        }

        resolve({
          valid: issues.length === 0,
          issues,
        });
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error("Failed to load image"));
    };

    img.src = imageUrl;
  });
}
