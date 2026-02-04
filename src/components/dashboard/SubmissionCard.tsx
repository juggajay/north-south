"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./StatusBadge";
import { SubmissionDetail } from "./SubmissionDetail";
import { toast } from "sonner";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { Id } from "../../../convex/_generated/dataModel";

interface SubmissionCardProps {
  submission: {
    _id: Id<"submissions">;
    name: string;
    email: string;
    siteMeasure: boolean;
    installQuote: boolean;
    notes?: string;
    internalNotes?: string;
    status: string;
    createdAt: number;
    design?: {
      config: any;
      productType: string;
    } | null;
  };
}

type SubmissionStatus = "pending" | "in_review" | "quoted" | "ordered" | "rejected";

export function SubmissionCard({ submission }: SubmissionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const updateStatus = useMutation(api.submissions.updateStatus);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusUpdate = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      await updateStatus({ id: submission._id, status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  // Format date as relative time
  const formatRelativeTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) {
      return minutes <= 1 ? "Just now" : `${minutes} minutes ago`;
    } else if (hours < 24) {
      return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
    } else if (days < 7) {
      return days === 1 ? "1 day ago" : `${days} days ago`;
    } else {
      return new Date(timestamp).toLocaleDateString("en-AU", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }
  };

  // Determine available status transitions based on current status
  const getStatusActions = (currentStatus: string) => {
    const status = currentStatus as SubmissionStatus;
    switch (status) {
      case "pending":
        return [
          { label: "Mark as In Review", status: "in_review", variant: "outline" as const },
          { label: "Reject", status: "rejected", variant: "destructive" as const },
        ];
      case "in_review":
        return [
          { label: "Mark as Quoted", status: "quoted", variant: "primary" as const },
          { label: "Back to New", status: "pending", variant: "outline" as const },
          { label: "Reject", status: "rejected", variant: "destructive" as const },
        ];
      case "quoted":
        return [
          { label: "Mark as Ordered", status: "ordered", variant: "primary" as const },
          { label: "Back to In Review", status: "in_review", variant: "outline" as const },
        ];
      case "ordered":
        return [];
      case "rejected":
        return [
          { label: "Reopen", status: "pending", variant: "outline" as const },
        ];
      default:
        return [];
    }
  };

  const statusActions = getStatusActions(submission.status);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base">{submission.name}</CardTitle>
            <CardDescription className="mt-1">{submission.email}</CardDescription>
            <div className="mt-2 flex items-center gap-3 text-sm text-zinc-500">
              <span>{formatRelativeTime(submission.createdAt)}</span>
              {submission.siteMeasure && (
                <span className="inline-flex items-center gap-1 text-xs bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                  Site Measure
                </span>
              )}
              {submission.installQuote && (
                <span className="inline-flex items-center gap-1 text-xs bg-purple-50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full">
                  Install Quote
                </span>
              )}
            </div>
          </div>
          <StatusBadge status={submission.status as SubmissionStatus} />
        </div>
      </CardHeader>

      {!isExpanded && submission.design && (
        <CardContent>
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            {submission.design.config?.dimensions && (
              <span>
                {submission.design.config.dimensions.width}mm × {submission.design.config.dimensions.height}mm × {submission.design.config.dimensions.depth}mm
              </span>
            )}
            {submission.design.config?.slots && (
              <span className="ml-2">
                • {Object.values(submission.design.config.slots).filter((slot: any) => slot.module).length} modules
              </span>
            )}
          </div>
        </CardContent>
      )}

      <CardFooter className="flex-col gap-3 items-stretch">
        {/* Status Action Buttons */}
        {statusActions.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {statusActions.map((action) => (
              <Button
                key={action.status}
                size="sm"
                variant={action.variant}
                onClick={() => handleStatusUpdate(action.status)}
                disabled={isUpdating}
                loading={isUpdating}
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}

        {/* Expand/Collapse Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full justify-center"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="mr-2" />
              Hide Details
            </>
          ) : (
            <>
              <ChevronDown className="mr-2" />
              View Full Details
            </>
          )}
        </Button>
      </CardFooter>

      {/* Expanded Detail View */}
      {isExpanded && <SubmissionDetail submission={submission} />}
    </Card>
  );
}
