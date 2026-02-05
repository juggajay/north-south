"use client";

import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Camera, Loader2, Check, X } from "lucide-react";
import { logger } from "@/lib/logger";

const MILESTONES = [
  { value: "production", label: "Production" },
  { value: "qc", label: "Quality Control" },
  { value: "packaging", label: "Packaging" },
  { value: "delivery", label: "Delivery" },
] as const;

interface PhotoUploaderProps {
  orderId: Id<"orders">;
}

export function PhotoUploader({ orderId }: PhotoUploaderProps) {
  const [selectedMilestone, setSelectedMilestone] = useState<string>("production");
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateUploadUrl = useMutation(api.productionPhotos.generateUploadUrl);
  const uploadPhoto = useMutation(api.productionPhotos.upload);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be under 10MB");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      toast.error("Please select a file first");
      return;
    }

    setUploading(true);
    try {
      // 1. Get upload URL from Convex
      const uploadUrl = await generateUploadUrl();

      // 2. Upload file to Convex storage
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!result.ok) {
        throw new Error("Upload failed");
      }

      const { storageId } = await result.json();

      // 3. Save photo record with milestone
      await uploadPhoto({
        orderId,
        storageId,
        milestone: selectedMilestone,
        caption: `${selectedMilestone} photo - ${new Date().toLocaleDateString()}`,
      });

      toast.success("Photo uploaded successfully");

      // Reset form
      setPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      logger.error("Photo upload failed", error instanceof Error ? error : undefined, {
        orderId: orderId.toString(),
        milestone: selectedMilestone,
      });
      toast.error("Failed to upload photo");
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      {/* Milestone selector */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Photo Milestone
        </label>
        <div className="flex flex-wrap gap-2">
          {MILESTONES.map((milestone) => (
            <button
              key={milestone.value}
              type="button"
              onClick={() => setSelectedMilestone(milestone.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedMilestone === milestone.value
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
              }`}
            >
              {milestone.label}
            </button>
          ))}
        </div>
      </div>

      {/* File input */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          id="photo-upload"
        />
        <label
          htmlFor="photo-upload"
          className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-zinc-300 dark:border-zinc-600 rounded-lg cursor-pointer hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors"
        >
          <Camera className="h-5 w-5 text-zinc-400" />
          <span className="text-sm text-zinc-600 dark:text-zinc-400">
            Click to select photo
          </span>
        </label>
      </div>

      {/* Preview */}
      {preview && (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="w-full max-h-48 object-cover rounded-lg"
          />
          <button
            onClick={handleCancel}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Upload button */}
      {preview && (
        <Button
          onClick={handleUpload}
          disabled={uploading}
          className="w-full"
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Check className="h-4 w-4 mr-2" />
              Upload Photo
            </>
          )}
        </Button>
      )}
    </div>
  );
}
