"use client";

import { Badge } from "@/components/ui/badge";

type SubmissionStatus = "pending" | "in_review" | "quoted" | "ordered" | "rejected";

interface StatusBadgeProps {
  status: SubmissionStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = {
    pending: { label: "New", variant: "default" as const, className: undefined as string | undefined },
    in_review: { label: "In Review", variant: "secondary" as const, className: undefined as string | undefined },
    quoted: { label: "Quoted", variant: "outline" as const, className: "text-green-600 border-green-600" },
    ordered: { label: "Ordered", variant: "secondary" as const, className: undefined as string | undefined },
    rejected: { label: "Rejected", variant: "destructive" as const, className: undefined as string | undefined },
  };

  const { label, variant, className } = config[status] || config.pending;

  return <Badge variant={variant} className={className}>{label}</Badge>;
}
