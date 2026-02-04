/**
 * PreSubmitOptions component
 * Phase 06-02: Customer-facing submission flow
 *
 * Features:
 * - Site measure toggle (optional)
 * - Installation quote toggle (optional)
 * - Optional notes textarea
 * - NO name/email fields - auto-populated from logged-in account
 */

"use client";

import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export interface SubmissionFormData {
  siteMeasure: boolean;
  installQuote: boolean;
  notes?: string;
}

interface PreSubmitOptionsProps {
  form: UseFormReturn<SubmissionFormData>;
}

export function PreSubmitOptions({ form }: PreSubmitOptionsProps) {
  return (
    <div className="p-4 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900">Additional Options</h2>
        <p className="text-sm text-zinc-500">
          Select any additional services you'd like us to quote.
        </p>
      </div>

      {/* Site Measure Toggle */}
      <FormField
        control={form.control}
        name="siteMeasure"
        render={({ field }) => (
          <FormItem className="flex items-center justify-between p-4 bg-zinc-50 rounded-lg">
            <div className="flex-1 pr-4">
              <FormLabel className="text-base font-medium">
                Professional site measure
              </FormLabel>
              <FormDescription className="mt-1">
                Team will include pricing in your quote
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />

      {/* Installation Quote Toggle */}
      <FormField
        control={form.control}
        name="installQuote"
        render={({ field }) => (
          <FormItem className="flex items-center justify-between p-4 bg-zinc-50 rounded-lg">
            <div className="flex-1 pr-4">
              <FormLabel className="text-base font-medium">
                Installation quote
              </FormLabel>
              <FormDescription className="mt-1">
                Team will include pricing in your quote
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />

      {/* Optional Notes */}
      <FormField
        control={form.control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Anything else we should know?</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                placeholder="Let us know about access issues, timeline requirements, or any special considerations..."
                className="min-h-[100px] resize-none"
              />
            </FormControl>
            <FormDescription>
              Optional - help us prepare the best quote for you
            </FormDescription>
          </FormItem>
        )}
      />
    </div>
  );
}
