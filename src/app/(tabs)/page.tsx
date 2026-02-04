"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Camera } from "lucide-react";
import { CameraCapture } from "@/components/camera/CameraCapture";
import { ProcessingScreen } from "@/components/processing/ProcessingScreen";
import { RenderCarousel } from "@/components/renders/RenderCarousel";
import { useProcessPhoto } from "@/lib/hooks/useProcessPhoto";
import type { Render } from "@/types/ai-pipeline";

/**
 * View states for the Home page pipeline flow
 */
type ViewState = "camera" | "processing" | "renders";

export default function HomePage() {
  const [cameraOpen, setCameraOpen] = useState(false);
  const [view, setView] = useState<ViewState>("camera");
  const [capturedImageUrl, setCapturedImageUrl] = useState<string | null>(null);

  // Pipeline orchestration hook
  const pipeline = useProcessPhoto();

  /**
   * Handle "Take Photo" button click
   */
  const handleTakePhoto = () => {
    setCameraOpen(true);
  };

  /**
   * Handle photo accepted from camera
   * Triggers the AI pipeline processing
   */
  const handlePhotoAccepted = (imageUrl: string) => {
    setCapturedImageUrl(imageUrl);
    setCameraOpen(false);
    setView("processing");

    // Start the pipeline
    pipeline.process(imageUrl);
  };

  /**
   * Handle pipeline completion
   * Transition to renders view when processing succeeds
   */
  if (pipeline.isSuccess && view === "processing") {
    setView("renders");
  }

  /**
   * Handle retry after error
   * Re-run the pipeline with the same image
   */
  const handleRetry = () => {
    if (capturedImageUrl) {
      pipeline.reset();
      pipeline.process(capturedImageUrl);
    }
  };

  /**
   * Handle retake photo
   * Go back to camera to capture a new photo
   */
  const handleRetake = () => {
    pipeline.reset();
    setView("camera");
    setCapturedImageUrl(null);
    setCameraOpen(true);
  };

  /**
   * Handle back from renders
   * Return to initial camera view
   */
  const handleBackFromRenders = () => {
    pipeline.reset();
    setView("camera");
    setCapturedImageUrl(null);
  };

  /**
   * Handle customize render selection
   * Stub for Phase 04 integration
   */
  const handleCustomize = (render: Render) => {
    console.log("Customize render selected:", {
      id: render.id,
      styleId: render.styleId,
      styleLabel: render.styleLabel,
    });
    // Phase 04: Navigate to configurator with selected render
  };

  return (
    <>
      {/* Initial camera view - Welcome screen */}
      {view === "camera" && !cameraOpen && (
        <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8 pb-24">
          <div className="flex flex-col items-center gap-6 text-center">
            {/* Large camera icon */}
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900">
              <Camera className="h-12 w-12" />
            </div>

            {/* Welcome message */}
            <div className="flex flex-col gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                Welcome to North South
              </h1>

              <p className="text-lg font-medium text-zinc-700 dark:text-zinc-300">
                AI-powered custom cabinetry for Sydney homes
              </p>

              <p className="max-w-md text-base text-zinc-600 dark:text-zinc-400">
                Take a photo of your space and we&apos;ll create styled design renders in
                seconds. Configure your exact requirements with live pricing.
              </p>
            </div>

            {/* Primary CTA - thumb zone optimized */}
            <button
              onClick={handleTakePhoto}
              className="mt-6 flex h-14 w-full max-w-sm items-center justify-center gap-2 rounded-full bg-zinc-900 px-6 text-lg font-medium text-white transition-colors hover:bg-zinc-800 active:bg-zinc-950 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:active:bg-zinc-300"
            >
              <Camera className="h-5 w-5" />
              Take Photo
            </button>

            {/* Secondary action - opens camera with gallery source */}
            <button
              onClick={handleTakePhoto}
              className="text-sm text-zinc-500 transition-colors hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300"
            >
              Or browse your gallery
            </button>
          </div>
        </div>
      )}

      {/* Camera capture interface */}
      <CameraCapture
        open={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onPhotoAccepted={handlePhotoAccepted}
      />

      {/* Processing screen during AI pipeline */}
      <AnimatePresence>
        {view === "processing" && pipeline.progress && (
          <ProcessingScreen
            progress={pipeline.progress}
            error={pipeline.error || undefined}
            onRetry={handleRetry}
            onRetake={handleRetake}
          />
        )}
      </AnimatePresence>

      {/* Render carousel when pipeline completes */}
      <AnimatePresence>
        {view === "renders" && pipeline.result && (
          <RenderCarousel
            renders={pipeline.result.renders}
            dimensions={pipeline.result.dimensions}
            onBack={handleBackFromRenders}
            onCustomize={handleCustomize}
          />
        )}
      </AnimatePresence>
    </>
  );
}
