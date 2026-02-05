"use client";

import { useState, useEffect } from "react";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { validateImageQuality } from "@/lib/image-quality";
import { Button } from "@/components/ui/button";

interface PhotoPreviewProps {
  imageUrl: string;
  onUsePhoto: () => void;
  onRetake: () => void;
}

/**
 * Photo preview with automatic quality validation.
 * Enforces strict rejection for blurry or poorly lit images.
 */
export function PhotoPreview({
  imageUrl,
  onUsePhoto,
  onRetake,
}: PhotoPreviewProps) {
  const [validating, setValidating] = useState(true);
  const [valid, setValid] = useState(false);
  const [issues, setIssues] = useState<string[]>([]);

  useEffect(() => {
    const validate = async () => {
      setValidating(true);
      try {
        const result = await validateImageQuality(imageUrl);
        setValid(result.valid);
        setIssues(result.issues);
      } catch (error) {
        console.error("Validation error:", error);
        setValid(false);
        setIssues(["Failed to validate image. Please try again."]);
      } finally {
        setValidating(false);
      }
    };

    validate();
  }, [imageUrl]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      {/* Image preview */}
      <div className="relative flex-1">
        <img
          src={imageUrl}
          alt="Captured photo"
          className="h-full w-full object-contain"
        />
      </div>

      {/* Validation status and actions */}
      <div className="flex flex-col gap-4 bg-zinc-900 p-6 pb-safe" style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom, 2rem))' }}>
        {validating ? (
          <div className="flex items-center gap-3 text-white">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-base font-medium">Checking quality...</span>
          </div>
        ) : valid ? (
          <>
            {/* Valid photo */}
            <div className="flex items-center gap-3 text-emerald-400">
              <CheckCircle className="h-6 w-6" />
              <span className="text-base font-medium">Photo looks great!</span>
            </div>

            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={onRetake}
                className="flex-1 text-white hover:bg-zinc-800"
              >
                Retake
              </Button>
              <Button
                variant="primary"
                onClick={onUsePhoto}
                className="flex-1"
              >
                Use Photo
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* Invalid photo - strict rejection */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 text-red-400">
                <AlertCircle className="h-6 w-6 flex-shrink-0" />
                <span className="text-base font-medium">
                  Photo quality issues detected
                </span>
              </div>

              {/* List all issues */}
              <ul className="ml-9 flex flex-col gap-2">
                {issues.map((issue, index) => (
                  <li key={index} className="text-sm text-zinc-300">
                    {issue}
                  </li>
                ))}
              </ul>
            </div>

            {/* Only retake option - no way to proceed with bad photo */}
            <Button
              variant="primary"
              onClick={onRetake}
              className="w-full"
            >
              Retake
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
