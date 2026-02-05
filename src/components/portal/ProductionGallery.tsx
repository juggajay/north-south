"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Camera, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface ProductionGalleryProps {
  orderId: Id<"orders">;
}

const MILESTONE_LABELS: Record<string, string> = {
  production: "Production",
  qc: "Quality Check",
  packaging: "Packaging",
  delivery: "Delivery",
};

export function ProductionGallery({ orderId }: ProductionGalleryProps) {
  const photos = useQuery(api.productionPhotos.listByOrder, { orderId });
  const [lightboxPhoto, setLightboxPhoto] = useState<{
    storageId: string;
    caption?: string;
    milestone: string;
  } | null>(null);

  // Get photo URL
  const photoUrl = useQuery(
    api.productionPhotos.getPhotoUrl,
    lightboxPhoto ? { storageId: lightboxPhoto.storageId } : "skip"
  );

  if (!photos) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-zinc-900"></div>
      </div>
    );
  }

  // Count total photos
  const totalPhotos = Object.values(photos).reduce(
    (sum, group) => sum + group.length,
    0
  );

  if (totalPhotos === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 mb-4">
          <Camera className="h-6 w-6 text-zinc-400" />
        </div>
        <p className="text-sm text-zinc-500">
          Production photos will appear as your panels are made
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {Object.entries(photos).map(([milestone, group]) => {
          if (group.length === 0) return null;

          return (
            <div key={milestone}>
              <h3 className="text-sm font-medium text-zinc-900 mb-3">
                {MILESTONE_LABELS[milestone] || milestone}
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {group.map((photo) => (
                  <PhotoThumbnail
                    key={photo._id}
                    photo={photo}
                    onClick={() =>
                      setLightboxPhoto({
                        storageId: photo.storageId,
                        caption: photo.caption,
                        milestone: photo.milestone,
                      })
                    }
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxPhoto && photoUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            onClick={() => setLightboxPhoto(null)}
          >
            <button
              onClick={() => setLightboxPhoto(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
            >
              <X className="h-6 w-6" />
            </button>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-4xl max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative w-full h-full">
                <Image
                  src={photoUrl}
                  alt={lightboxPhoto.caption || "Production photo"}
                  width={1200}
                  height={900}
                  className="object-contain max-h-[80vh] rounded-lg"
                />
              </div>

              {lightboxPhoto.caption && (
                <div className="mt-4 text-center">
                  <p className="text-white text-sm">{lightboxPhoto.caption}</p>
                  <p className="text-zinc-400 text-xs mt-1">
                    {MILESTONE_LABELS[lightboxPhoto.milestone]}
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function PhotoThumbnail({
  photo,
  onClick,
}: {
  photo: { _id: string; storageId: string; caption?: string };
  onClick: () => void;
}) {
  const url = useQuery(api.productionPhotos.getPhotoUrl, {
    storageId: photo.storageId,
  });

  if (!url) {
    return (
      <div className="aspect-square bg-zinc-100 rounded-lg animate-pulse" />
    );
  }

  return (
    <button
      onClick={onClick}
      className="aspect-square relative overflow-hidden rounded-lg bg-zinc-100 hover:opacity-90 transition-opacity"
    >
      <Image
        src={url}
        alt={photo.caption || "Production photo"}
        fill
        className="object-cover"
      />
      {photo.caption && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
          <p className="text-white text-xs line-clamp-2">{photo.caption}</p>
        </div>
      )}
    </button>
  );
}
