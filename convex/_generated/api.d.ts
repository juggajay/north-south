/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as designs from "../designs.js";
import type * as users from "../users.js";
import type * as submissions from "../submissions.js";
import type * as seed from "../seed.js";
import type * as products_materials from "../products/materials.js";
import type * as products_hardware from "../products/hardware.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  designs: typeof designs;
  users: typeof users;
  submissions: typeof submissions;
  seed: typeof seed;
  "products/materials": typeof products_materials;
  "products/hardware": typeof products_hardware;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
