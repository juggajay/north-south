/**
 * Capacitor Camera Wrapper
 *
 * Provides high-level functions for camera capture and gallery selection
 * with optimal settings for cabinet space photography.
 */

import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";

/**
 * Capture a photo using the device camera
 * @returns Web path to captured image
 */
export async function capturePhoto(): Promise<string> {
  const image = await Camera.getPhoto({
    quality: 90,
    allowEditing: false,
    resultType: CameraResultType.Uri,
    source: CameraSource.Camera,
    correctOrientation: true,
    width: 2048,
    height: 2048,
  });
  return image.webPath!;
}

/**
 * Select a photo from device gallery
 * @returns Web path to selected image
 */
export async function selectFromGallery(): Promise<string> {
  const image = await Camera.getPhoto({
    quality: 90,
    allowEditing: false,
    resultType: CameraResultType.Uri,
    source: CameraSource.Photos,
    correctOrientation: true,
  });
  return image.webPath!;
}

/**
 * Check and request camera permission if needed
 * @returns True if permission granted
 */
export async function checkCameraPermission(): Promise<boolean> {
  const status = await Camera.checkPermissions();
  if (status.camera === "granted") return true;
  const request = await Camera.requestPermissions();
  return request.camera === "granted";
}
