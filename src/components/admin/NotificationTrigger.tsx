"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Mail, Loader2 } from "lucide-react";

const NOTIFICATION_TYPES = [
  { value: "order_confirmed", label: "Order Confirmed" },
  { value: "production_started", label: "Production Started" },
  { value: "qc_complete", label: "QC Complete" },
  { value: "ready_to_ship", label: "Ready to Ship" },
  { value: "delivered", label: "Delivered" },
  { value: "post_install", label: "Post-Install Follow-up" },
] as const;

interface NotificationTriggerProps {
  orderId: Id<"orders">;
  customerEmail?: string;
}

export function NotificationTrigger({ orderId, customerEmail }: NotificationTriggerProps) {
  const [selectedType, setSelectedType] = useState<string>("");
  const [sending, setSending] = useState(false);

  const triggerNotification = useMutation(api.notifications.adminTriggerNotification);

  const handleSend = async () => {
    if (!selectedType) {
      toast.error("Please select a notification type");
      return;
    }

    setSending(true);
    try {
      const result = await triggerNotification({
        orderId,
        type: selectedType,
      });

      toast.success(`Email sent to ${result.sentTo}`);
      setSelectedType("");
    } catch (error) {
      console.error("Send error:", error);
      toast.error("Failed to send notification");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Send Notification Email
        </label>
        {customerEmail && (
          <p className="text-sm text-zinc-500 mb-2">
            Will send to: {customerEmail}
          </p>
        )}
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select notification type...</option>
          {NOTIFICATION_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      <Button
        onClick={handleSend}
        disabled={!selectedType || sending}
        variant="outline"
        className="w-full"
      >
        {sending ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Mail className="h-4 w-4 mr-2" />
            Send Email
          </>
        )}
      </Button>

      <p className="text-xs text-zinc-500">
        Note: Emails are sent via Resend. Make sure RESEND_API_KEY is configured.
      </p>
    </div>
  );
}
