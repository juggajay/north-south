"use client";

import { useEffect, useRef, useState } from "react";

interface CameraPreviewProps {
  onStreamReady?: (stream: MediaStream) => void;
  onError?: (error: string) => void;
}

/**
 * Live camera preview using MediaStream API.
 * Displays the rear camera feed in fullscreen.
 */
export function CameraPreview({ onStreamReady, onError }: CameraPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let mounted = true;

    async function startCamera() {
      try {
        // Request rear camera (environment facing)
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });

        if (!mounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setIsLoading(false);
          onStreamReady?.(stream);
        }
      } catch (err) {
        console.error("Camera error:", err);
        if (mounted) {
          setIsLoading(false);
          if (err instanceof Error) {
            if (err.name === "NotAllowedError") {
              onError?.("Camera permission denied");
            } else if (err.name === "NotFoundError") {
              onError?.("No camera found");
            } else {
              onError?.(err.message);
            }
          } else {
            onError?.("Failed to access camera");
          }
        }
      }
    }

    startCamera();

    return () => {
      mounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [onStreamReady, onError]);

  return (
    <>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-950">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
            <span className="text-sm text-zinc-400">Starting camera...</span>
          </div>
        </div>
      )}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="h-full w-full object-cover"
      />
    </>
  );
}

/**
 * Capture a frame from the video stream as a data URL
 */
export function captureFrame(video: HTMLVideoElement): string {
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.drawImage(video, 0, 0);
  }
  return canvas.toDataURL("image/jpeg", 0.9);
}
