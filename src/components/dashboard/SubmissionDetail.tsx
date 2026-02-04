"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { Id } from "../../../convex/_generated/dataModel";

interface SubmissionDetailProps {
  submission: {
    _id: Id<"submissions">;
    notes?: string;
    design?: {
      config: {
        dimensions: { width: number; height: number; depth: number };
        slots: Record<string, any>;
        finishes: { material: string; hardware: string; doorProfile: string };
      };
      productType: string;
    } | null;
    internalNotes?: string;
  };
}

export function SubmissionDetail({ submission }: SubmissionDetailProps) {
  const [internalNotes, setInternalNotes] = useState(submission.internalNotes || "");
  const [isEditing, setIsEditing] = useState(false);
  const updateNotes = useMutation(api.submissions.updateInternalNotes);

  const handleSaveNotes = async () => {
    try {
      await updateNotes({ id: submission._id, internalNotes });
      toast.success("Notes saved");
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to save notes");
    }
  };

  const config = submission.design?.config;
  if (!config) {
    return (
      <div className="p-4 text-center text-zinc-500">
        No configuration data available
      </div>
    );
  }

  // Count modules
  const slots = config.slots || {};
  const moduleCount = Object.values(slots).filter((slot: any) => slot.module).length;

  return (
    <div className="space-y-6 p-4 border-t border-zinc-200 dark:border-zinc-800">
      {/* Dimensions Section */}
      <div>
        <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-50 mb-2">
          Dimensions
        </h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-zinc-500">Width:</span>
            <span className="ml-2 font-medium">{config.dimensions.width}mm</span>
          </div>
          <div>
            <span className="text-zinc-500">Height:</span>
            <span className="ml-2 font-medium">{config.dimensions.height}mm</span>
          </div>
          <div>
            <span className="text-zinc-500">Depth:</span>
            <span className="ml-2 font-medium">{config.dimensions.depth}mm</span>
          </div>
        </div>
      </div>

      {/* Modules Section */}
      <div>
        <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-50 mb-2">
          Modules ({moduleCount})
        </h3>
        <div className="space-y-2">
          {Object.entries(slots).map(([slotId, slot]: [string, any]) => {
            if (!slot.module) return null;
            return (
              <div key={slotId} className="text-sm flex items-start gap-2">
                <span className="text-zinc-500 min-w-[60px]">Slot {slotId}:</span>
                <div className="flex-1">
                  <div className="font-medium">{slot.module.type}</div>
                  {slot.module.config && (
                    <div className="text-xs text-zinc-500 mt-1">
                      {slot.module.config.shelves && (
                        <span>Shelves: {slot.module.config.shelves} </span>
                      )}
                      {slot.module.config.drawers && (
                        <span>Drawers: {slot.module.config.drawers} </span>
                      )}
                      {slot.module.config.baskets && (
                        <span>Baskets: {slot.module.config.baskets} </span>
                      )}
                      {slot.module.config.dividers && <span>Dividers </span>}
                      {slot.module.config.ledStrip && <span>LED Strip </span>}
                      {slot.module.config.pullOutBin && <span>Pull-out Bin </span>}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {moduleCount === 0 && (
            <p className="text-sm text-zinc-500">No modules configured</p>
          )}
        </div>
      </div>

      {/* Finishes Section */}
      <div>
        <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-50 mb-2">
          Finishes
        </h3>
        <div className="space-y-1 text-sm">
          <div>
            <span className="text-zinc-500">Material:</span>
            <span className="ml-2 font-medium">{config.finishes.material || "Not selected"}</span>
          </div>
          <div>
            <span className="text-zinc-500">Hardware:</span>
            <span className="ml-2 font-medium">{config.finishes.hardware || "Not selected"}</span>
          </div>
          <div>
            <span className="text-zinc-500">Door Profile:</span>
            <span className="ml-2 font-medium">{config.finishes.doorProfile || "Not selected"}</span>
          </div>
        </div>
      </div>

      {/* Customer Notes Section */}
      {submission.notes && (
        <div>
          <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-50 mb-2">
            Customer Notes
          </h3>
          <p className="text-sm text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800 p-3 rounded-md">
            {submission.notes}
          </p>
        </div>
      )}

      {/* Internal Notes Section */}
      <div>
        <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-50 mb-2">
          Internal Notes
        </h3>
        {isEditing ? (
          <div className="space-y-2">
            <Textarea
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              placeholder="Add internal notes visible only to the team..."
              className="min-h-24"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSaveNotes}>
                Save Notes
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setInternalNotes(submission.internalNotes || "");
                  setIsEditing(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div>
            {internalNotes ? (
              <p className="text-sm text-zinc-700 dark:text-zinc-300 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 p-3 rounded-md">
                {internalNotes}
              </p>
            ) : (
              <p className="text-sm text-zinc-500">No internal notes yet</p>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsEditing(true)}
              className="mt-2"
            >
              {internalNotes ? "Edit Notes" : "Add Notes"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
