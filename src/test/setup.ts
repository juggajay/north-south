import "@testing-library/dom";
import { expect, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia for components that use it
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// Add Canvas API support for image quality tests
// jsdom doesn't fully support canvas, so we polyfill necessary methods
if (typeof HTMLCanvasElement !== "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (HTMLCanvasElement.prototype.getContext as any) = function (this: any, contextId: string) {
    if (contextId === "2d") {
      return {
        canvas: this,
        fillStyle: "",
        strokeStyle: "",
        lineWidth: 1,
        fillRect: () => {},
        clearRect: () => {},
        strokeRect: () => {},
        beginPath: () => {},
        closePath: () => {},
        moveTo: () => {},
        lineTo: () => {},
        stroke: () => {},
        fill: () => {},
        arc: () => {},
        drawImage: () => {},
        getImageData: (x: number, y: number, width: number, height: number) => {
          // Return ImageData with transparent pixels
          const data = new Uint8ClampedArray(width * height * 4);
          return new ImageData(data, width, height);
        },
        putImageData: () => {},
        createImageData: (width: number, height: number) => {
          const data = new Uint8ClampedArray(width * height * 4);
          return new ImageData(data, width, height);
        },
        save: () => {},
        restore: () => {},
        scale: () => {},
        rotate: () => {},
        translate: () => {},
        transform: () => {},
        setTransform: () => {},
      } as unknown as CanvasRenderingContext2D;
    }
    return null;
  };

  HTMLCanvasElement.prototype.toDataURL = function () {
    return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
  };
}

// Ensure ImageData is available globally
if (typeof ImageData === "undefined") {
  (global as any).ImageData = class ImageData {
    data: Uint8ClampedArray;
    width: number;
    height: number;

    constructor(
      dataOrWidth: Uint8ClampedArray | number,
      widthOrHeight: number,
      height?: number
    ) {
      if (dataOrWidth instanceof Uint8ClampedArray) {
        this.data = dataOrWidth;
        this.width = widthOrHeight;
        this.height = height!;
      } else {
        this.width = dataOrWidth;
        this.height = widthOrHeight;
        this.data = new Uint8ClampedArray(this.width * this.height * 4);
      }
    }
  };
}

// Mock Image constructor to support async loading in tests
if (typeof Image !== "undefined") {
  const OriginalImage = Image;
  (global as any).Image = class extends OriginalImage {
    constructor() {
      super();
      // Defer onload to next tick to simulate async behavior
      setTimeout(() => {
        if (this.onload) {
          this.onload(new Event("load"));
        }
      }, 0);
    }
  };
}
