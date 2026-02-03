"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { CaptureButton } from "./CaptureButton";
import { GuidanceOverlay } from "./GuidanceOverlay";
import { PhotoPreview } from "./PhotoPreview";
import { capturePhoto, selectFromGallery, checkCameraPermission } from "@/lib/camera";

interface CameraCaptureProps {
  open: boolean;
  onClose: () => void;
  onPhotoAccepted: (imageUrl: string) => void;
}

type CameraState = "camera" | "preview" | "permission-denied";

/**
 * Full camera capture interface with guidance, quality validation, and gallery selection.
 * Primary entry point for photographing cabinet spaces.
 */
export function CameraCapture({
  open,
  onClose,
  onPhotoAccepted,
}: CameraCaptureProps) {
  const [state, setState] = useState<CameraState>("camera");
  const [capturedImageUrl, setCapturedImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCapture = async () => {
    try {
      setError(null);

      // Check permission first
      const hasPermission = await checkCameraPermission();
      if (!hasPermission) {
        setState("permission-denied");
        return;
      }

      // Capture photo
      const imageUrl = await capturePhoto();
      setCapturedImageUrl(imageUrl);
      setState("preview");
    } catch (err) {
      console.error("Capture error:", err);
      setError("Failed to capture photo. Please try again.");
    }
  };

  const handleGallerySelect = async () => {
    try {
      setError(null);
      const imageUrl = await selectFromGallery();
      setCapturedImageUrl(imageUrl);
      setState("preview");
    } catch (err) {
      console.error("Gallery error:", err);
      setError("Failed to select photo. Please try again.");
    }
  };

  const handleUsePhoto = () => {
    if (capturedImageUrl) {
      onPhotoAccepted(capturedImageUrl);
      setState("camera");
      setCapturedImageUrl(null);
    }
  };

  const handleRetake = () => {
    setState("camera");
    setCapturedImageUrl(null);
    setError(null);
  };

  const handleClose = () => {
    setState("camera");
    setCapturedImageUrl(null);
    setError(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50"
        >
          {state === "camera" && (
            <div className="relative h-full w-full bg-zinc-950">
              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute left-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-all active:scale-95"
              >
                <X className="h-6 w-6" />
              </button>

              {/* Guidance overlay */}
              <GuidanceOverlay onGalleryClick={handleGallerySelect} />

              {/* Capture button */}
              <div className="absolute bottom-8 left-0 right-0 flex justify-center">
                <CaptureButton onCapture={handleCapture} />
              </div>

              {/* Error message */}
              {error && (
                <div className="absolute bottom-32 left-4 right-4 rounded-lg bg-red-500/90 px-4 py-3 text-center text-sm font-medium text-white">
                  {error}
                </div>
              )}
            </div>
          )}

          {state === "preview" && capturedImageUrl && (
            <PhotoPreview
              imageUrl={capturedImageUrl}
              onUsePhoto={handleUsePhoto}
              onRetake={handleRetake}
            />
          )}

          {state === "permission-denied" && (
            <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-zinc-950 p-6">
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20">
                  <X className="h-8 w-8 text-red-400" />
                </div>
                <h2 className="text-xl font-semibold text-white">
                  Camera Access Denied
                </h2>
                <p className="max-w-sm text-sm text-zinc-400">
                  Please enable camera permissions in your device settings to
                  take photos.
                </p>
              </div>
              <button
                onClick={handleClose}
                className="mt-4 rounded-full bg-white px-6 py-3 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-200"
              >
                Close
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
