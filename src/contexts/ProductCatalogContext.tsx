// src/contexts/ProductCatalogContext.tsx
"use client";

import { createContext, useContext, ReactNode } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

// Define proper types for catalog items
interface Material {
  _id: string;
  code: string;
  name: string;
  supplier: string;
  category: string;
  colorFamily: string;
  pricePerUnit: number;
  swatchUrl?: string;
  textureUrl?: string;
  active: boolean;
  sortOrder: number;
}

interface Hardware {
  _id: string;
  code: string;
  name: string;
  supplier: string;
  category: string;
  specs?: Record<string, unknown>;
  pricePerUnit: number;
  priceVariance?: number;
  active: boolean;
  sortOrder: number;
}

interface DoorProfile {
  _id: string;
  code: string;
  name: string;
  description?: string;
  pricePerDoor: number;
  imageUrl?: string;
  active: boolean;
  sortOrder: number;
}

interface Module {
  _id: string;
  code: string;
  name: string;
  productCode: string;
  category: string;
  defaultWidth: number;
  defaultHeight: number;
  defaultDepth: number;
  minWidth?: number;
  maxWidth?: number;
  pricePerUnit: number;
  modelUrl?: string;
  thumbnailUrl?: string;
  active: boolean;
  sortOrder: number;
}

export interface ProductCatalog {
  materials: Material[] | undefined;
  hardware: Hardware[] | undefined;
  doorProfiles: DoorProfile[] | undefined;
  modules: Module[] | undefined;
  isLoading: boolean;
}

const ProductCatalogContext = createContext<ProductCatalog | null>(null);

/**
 * Provider that loads product catalog once at app level
 * Child components use useProductCatalog() hook instead of individual queries
 */
export function ProductCatalogProvider({ children }: { children: ReactNode }) {
  const materials = useQuery(api.products.materials.list) as Material[] | undefined;
  const hardware = useQuery(api.products.hardware.list) as Hardware[] | undefined;
  const doorProfiles = useQuery(api.doorProfiles.list) as DoorProfile[] | undefined;
  const modules = useQuery(api.products.modules.list) as Module[] | undefined;

  const isLoading = !materials || !hardware || !doorProfiles || !modules;

  return (
    <ProductCatalogContext.Provider
      value={{ materials, hardware, doorProfiles, modules, isLoading }}
    >
      {children}
    </ProductCatalogContext.Provider>
  );
}

/**
 * Hook to access cached product catalog
 */
export function useProductCatalog(): ProductCatalog {
  const context = useContext(ProductCatalogContext);
  if (!context) {
    throw new Error("useProductCatalog must be used within ProductCatalogProvider");
  }
  return context;
}

// Re-export types for consumers
export type { Material, Hardware, DoorProfile, Module };
