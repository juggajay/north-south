"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuth } from "@/hooks/useAuth";
import { Copy, Check, Gift, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  signed_up: {
    label: "Signed Up",
    color: "bg-blue-100 text-blue-800 border-blue-200",
  },
  ordered: {
    label: "Ordered",
    color: "bg-purple-100 text-purple-800 border-purple-200",
  },
  rewarded: {
    label: "Rewarded",
    color: "bg-green-100 text-green-800 border-green-200",
  },
};

export function ReferralTracker() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  // Get referral link and list
  const referralLink = useQuery(
    api.referrals.getReferralLink,
    user?._id ? { userId: user._id } : "skip"
  );
  const referrals = useQuery(
    api.referrals.getMyReferrals,
    user?._id ? { userId: user._id } : "skip"
  );

  const handleCopy = async () => {
    if (!referralLink) return;

    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast.success("Referral link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
      toast.error("Failed to copy link");
    }
  };

  if (!user) {
    return null;
  }

  const hasReferrals = referrals && referrals.length > 0;

  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900">
          <Gift className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-zinc-900">
            Refer & Earn Rewards
          </h2>
          <p className="text-sm text-zinc-500">
            Share your link to earn when friends order
          </p>
        </div>
      </div>

      {/* Referral link */}
      {referralLink && (
        <div className="mb-6">
          <label className="text-xs font-medium text-zinc-700 mb-2 block">
            Your Referral Link
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={referralLink}
              readOnly
              className="flex-1 px-3 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-600"
            />
            <button
              onClick={handleCopy}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors",
                copied
                  ? "bg-green-100 text-green-700"
                  : "bg-zinc-900 text-white hover:bg-zinc-800"
              )}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Referrals list */}
      {hasReferrals ? (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-4 w-4 text-zinc-500" />
            <h3 className="text-sm font-medium text-zinc-900">
              Your Referrals ({referrals.length})
            </h3>
          </div>
          <div className="space-y-2">
            {referrals.map((referral) => {
              const status =
                STATUS_CONFIG[referral.status as keyof typeof STATUS_CONFIG] ||
                STATUS_CONFIG.pending;

              return (
                <div
                  key={referral._id}
                  className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-mono text-zinc-600">
                      {referral.referredEmail}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {referral.rewardAmount && (
                      <span className="text-sm font-medium text-green-600">
                        ${referral.rewardAmount.toFixed(0)}
                      </span>
                    )}
                    <span
                      className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium border",
                        status.color
                      )}
                    >
                      {status.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-6 bg-zinc-50 rounded-lg">
          <Users className="h-8 w-8 text-zinc-400 mx-auto mb-2" />
          <p className="text-sm text-zinc-500">
            Share your link to earn rewards when friends order
          </p>
        </div>
      )}
    </div>
  );
}
