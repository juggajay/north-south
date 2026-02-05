"use client";

import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { CaptureButton } from "./CaptureButton";
import { GuidanceOverlay } from "./GuidanceOverlay";
import { PhotoPreview } from "./PhotoPreview";
import { CameraPreview, captureFrame } from "./CameraPreview";
import { selectFromGallery } from "@/lib/camera";
import { useFullscreen } from "@/contexts/FullscreenContext";

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
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const { enterFullscreen, exitFullscreen } = useFullscreen();

  // Enter fullscreen when camera opens, exit when it closes
  useEffect(() => {
    if (open) {
      enterFullscreen();
    } else {
      exitFullscreen();
    }
  }, [open, enterFullscreen, exitFullscreen]);

  const handleStreamReady = (stream: MediaStream) => {
    // Get video element from stream for capture
    const videoTrack = stream.getVideoTracks()[0];
    if (videoTrack) {
      const video = document.querySelector('video');
      if (video) {
        videoRef.current = video;
      }
    }
  };

  const handleCameraError = (errorMsg: string) => {
    if (errorMsg.includes("permission") || errorMsg.includes("denied")) {
      setState("permission-denied");
    } else {
      setError(errorMsg);
    }
  };

  const handleCapture = async () => {
    try {
      setError(null);

      // Get the video element
      const video = document.querySelector('video') as HTMLVideoElement;
      if (!video || !video.srcObject) {
        setError("Camera not ready. Please try again.");
        return;
      }

      // Capture frame from live preview
      const imageUrl = captureFrame(video);
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
              {/* Live camera preview */}
              <CameraPreview
                onStreamReady={handleStreamReady}
                onError={handleCameraError}
              />

              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute left-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-all active:scale-95"
              >
                <X className="h-6 w-6" />
              </button>

              {/* Guidance overlay */}
              <GuidanceOverlay onGalleryClick={handleGallerySelect} />

              {/* Capture button - positioned high to clear browser bottom bar */}
              <div
                className="absolute left-0 right-0 flex justify-center"
                style={{ bottom: 'calc(100px + env(safe-area-inset-bottom, 0px))' }}
              >
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
