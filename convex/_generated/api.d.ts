/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as ai from "../ai.js";
import type * as auth from "../auth.js";
import type * as chat from "../chat.js";
import type * as designVersions from "../designVersions.js";
import type * as designs from "../designs.js";
import type * as documents from "../documents.js";
import type * as doorProfiles from "../doorProfiles.js";
import type * as http from "../http.js";
import type * as notifications from "../notifications.js";
import type * as notifications_logNotification from "../notifications/logNotification.js";
import type * as notifications_sendEmail from "../notifications/sendEmail.js";
import type * as notifications_templates_Delivered from "../notifications/templates/Delivered.js";
import type * as notifications_templates_OrderConfirmed from "../notifications/templates/OrderConfirmed.js";
import type * as notifications_templates_PostInstall from "../notifications/templates/PostInstall.js";
import type * as notifications_templates_ProductionStarted from "../notifications/templates/ProductionStarted.js";
import type * as notifications_templates_QCComplete from "../notifications/templates/QCComplete.js";
import type * as notifications_templates_ReadyToShip from "../notifications/templates/ReadyToShip.js";
import type * as orders from "../orders.js";
import type * as panels from "../panels.js";
import type * as productionPhotos from "../productionPhotos.js";
import type * as products_hardware from "../products/hardware.js";
import type * as products_materials from "../products/materials.js";
import type * as products_modules from "../products/modules.js";
import type * as referrals from "../referrals.js";
import type * as resend from "../resend.js";
import type * as seed from "../seed.js";
import type * as submissions from "../submissions.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  ai: typeof ai;
  auth: typeof auth;
  chat: typeof chat;
  designVersions: typeof designVersions;
  designs: typeof designs;
  documents: typeof documents;
  doorProfiles: typeof doorProfiles;
  http: typeof http;
  notifications: typeof notifications;
  "notifications/logNotification": typeof notifications_logNotification;
  "notifications/sendEmail": typeof notifications_sendEmail;
  "notifications/templates/Delivered": typeof notifications_templates_Delivered;
  "notifications/templates/OrderConfirmed": typeof notifications_templates_OrderConfirmed;
  "notifications/templates/PostInstall": typeof notifications_templates_PostInstall;
  "notifications/templates/ProductionStarted": typeof notifications_templates_ProductionStarted;
  "notifications/templates/QCComplete": typeof notifications_templates_QCComplete;
  "notifications/templates/ReadyToShip": typeof notifications_templates_ReadyToShip;
  orders: typeof orders;
  panels: typeof panels;
  productionPhotos: typeof productionPhotos;
  "products/hardware": typeof products_hardware;
  "products/materials": typeof products_materials;
  "products/modules": typeof products_modules;
  referrals: typeof referrals;
  resend: typeof resend;
  seed: typeof seed;
  submissions: typeof submissions;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  resend: {
    lib: {
      cancelEmail: FunctionReference<
        "mutation",
        "internal",
        { emailId: string },
        null
      >;
      cleanupAbandonedEmails: FunctionReference<
        "mutation",
        "internal",
        { olderThan?: number },
        null
      >;
      cleanupOldEmails: FunctionReference<
        "mutation",
        "internal",
        { olderThan?: number },
        null
      >;
      createManualEmail: FunctionReference<
        "mutation",
        "internal",
        {
          from: string;
          headers?: Array<{ name: string; value: string }>;
          replyTo?: Array<string>;
          subject: string;
          to: Array<string> | string;
        },
        string
      >;
      get: FunctionReference<
        "query",
        "internal",
        { emailId: string },
        {
          bcc?: Array<string>;
          bounced?: boolean;
          cc?: Array<string>;
          clicked?: boolean;
          complained: boolean;
          createdAt: number;
          deliveryDelayed?: boolean;
          errorMessage?: string;
          failed?: boolean;
          finalizedAt: number;
          from: string;
          headers?: Array<{ name: string; value: string }>;
          html?: string;
          opened: boolean;
          replyTo: Array<string>;
          resendId?: string;
          segment: number;
          status:
            | "waiting"
            | "queued"
            | "cancelled"
            | "sent"
            | "delivered"
            | "delivery_delayed"
            | "bounced"
            | "failed";
          subject?: string;
          template?: {
            id: string;
            variables?: Record<string, string | number>;
          };
          text?: string;
          to: Array<string>;
        } | null
      >;
      getStatus: FunctionReference<
        "query",
        "internal",
        { emailId: string },
        {
          bounced: boolean;
          clicked: boolean;
          complained: boolean;
          deliveryDelayed: boolean;
          errorMessage: string | null;
          failed: boolean;
          opened: boolean;
          status:
            | "waiting"
            | "queued"
            | "cancelled"
            | "sent"
            | "delivered"
            | "delivery_delayed"
            | "bounced"
            | "failed";
        } | null
      >;
      handleEmailEvent: FunctionReference<
        "mutation",
        "internal",
        { event: any },
        null
      >;
      sendEmail: FunctionReference<
        "mutation",
        "internal",
        {
          bcc?: Array<string>;
          cc?: Array<string>;
          from: string;
          headers?: Array<{ name: string; value: string }>;
          html?: string;
          options: {
            apiKey: string;
            initialBackoffMs: number;
            onEmailEvent?: { fnHandle: string };
            retryAttempts: number;
            testMode: boolean;
          };
          replyTo?: Array<string>;
          subject?: string;
          template?: {
            id: string;
            variables?: Record<string, string | number>;
          };
          text?: string;
          to: Array<string>;
        },
        string
      >;
      updateManualEmail: FunctionReference<
        "mutation",
        "internal",
        {
          emailId: string;
          errorMessage?: string;
          resendId?: string;
          status:
            | "waiting"
            | "queued"
            | "cancelled"
            | "sent"
            | "delivered"
            | "delivery_delayed"
            | "bounced"
            | "failed";
        },
        null
      >;
    };
  };
};
