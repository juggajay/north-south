/**
 * MaterialPreview component and hook
 * Phase 04-07: Finish Selection & Review
 *
 * Features:
 * - Shared material instances (per RESEARCH.md best practices)
 * - Real-time 3D updates when material selection changes
 * - Color mapping for Polytec materials
 * - Scene traversal to apply materials to cabinet meshes
 */

'use client';

import { useMemo, useEffect, useState } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { useCabinetStore } from '@/stores/useCabinetStore';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';

// ============================================================================
// COLOR MAPPING
// ============================================================================

/**
 * Color mapping for Polytec material codes (fallback if no texture)
 * Based on actual Polytec color specifications
 */
const MATERIAL_COLORS: Record<string, string> = {
  'POL-NOWM': '#c4a77d', // Natural Oak Woodmatt
  'POL-RIWM': '#e8dcc8', // Riverine Woodmatt
  'POL-BWWM': '#f5e6d3', // Baltic Wood Woodmatt
  'POL-MWS': '#f5f5f5',  // Milano White Satin
  'POL-SBS': '#1a1a1a',  // Shark Black Satin
  'POL-CRWM': '#4a4a3a', // Char Oak Woodmatt
  'POL-AWS': '#d4d4d4',  // Antarctic White Satin
  // Default fallback
  'default': '#d4d4d4',
};

// ============================================================================
// MATERIAL PREVIEW HOOK
// ============================================================================

/**
 * Hook to create shared material instances and track current finishes
 *
 * Returns material instances for different cabinet parts and current selections.
 * Materials are memoized and only recreate when finish selection changes.
 */
export function useMaterialPreview() {
  const finishes = useCabinetStore((state) => state.config.finishes);
  const { invalidate } = useThree();

  // Fetch material details from Convex
  const materialData = useQuery(
    api.products.materials.getByCode,
    finishes.material ? { code: finishes.material } : 'skip'
  );

  // Create shared material instance (memoized per material selection)
  const cabinetMaterial = useMemo(() => {
    const color = finishes.material
      ? MATERIAL_COLORS[finishes.material] || MATERIAL_COLORS['default']
      : MATERIAL_COLORS['default'];

    // Material properties for cabinet panels
    const material = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.6,
      metalness: 0.1,
      // Future: Load texture if available
      // map: materialData?.textureUrl ? textureLoader.load(materialData.textureUrl) : undefined
    });

    return material;
  }, [finishes.material]);

  // Door material (same as cabinet for now, could differentiate later)
  const doorMaterial = useMemo(() => {
    return cabinetMaterial.clone();
  }, [cabinetMaterial]);

  // Invalidate canvas when material changes to trigger re-render
  useEffect(() => {
    invalidate();
  }, [finishes.material, finishes.hardware, finishes.doorProfile, invalidate]);

  return {
    cabinetMaterial,
    doorMaterial,
    currentMaterial: finishes.material,
    currentHardware: finishes.hardware,
    currentProfile: finishes.doorProfile,
    materialData,
  };
}

// ============================================================================
// MATERIAL APPLICATOR COMPONENT
// ============================================================================

/**
 * Component to apply materials to all cabinet meshes in the scene
 * OPTIMIZED: Caches mesh references with invalidation on scene change
 *
 * This traverses the scene and updates materials on any mesh marked as
 * part of the cabinet (via name or userData).
 *
 * Usage: Place inside Canvas, after all 3D components
 * ```tsx
 * <Canvas>
 *   <CabinetModel />
 *   <MaterialApplicator />
 * </Canvas>
 * ```
 */
export function MaterialApplicator() {
  const { cabinetMaterial, doorMaterial } = useMaterialPreview();
  const { scene, invalidate } = useThree();

  // Track scene children count for cache invalidation
  const [sceneVersion, setSceneVersion] = useState(0);

  // Update version when scene children change
  useEffect(() => {
    const checkScene = () => {
      setSceneVersion((v) => v + 1);
    };

    // Listen for scene changes
    scene.addEventListener('childadded', checkScene);
    scene.addEventListener('childremoved', checkScene);

    return () => {
      scene.removeEventListener('childadded', checkScene);
      scene.removeEventListener('childremoved', checkScene);
    };
  }, [scene]);

  // Cache mesh references, invalidate when scene changes
  const meshRefs = useMemo(() => {
    const cabinetMeshes: THREE.Mesh[] = [];
    const doorMeshes: THREE.Mesh[] = [];

    scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        if (object.name.includes('cabinet') || object.userData.isCabinet) {
          cabinetMeshes.push(object);
        }
        if (object.name.includes('door') || object.userData.isDoor) {
          doorMeshes.push(object);
        }
      }
    });

    return { cabinetMeshes, doorMeshes };
  }, [scene, sceneVersion]);

  // Apply materials only to cached meshes
  useEffect(() => {
    meshRefs.cabinetMeshes.forEach((mesh) => {
      if (mesh.material !== cabinetMaterial) {
        mesh.material = cabinetMaterial;
      }
    });
    meshRefs.doorMeshes.forEach((mesh) => {
      if (mesh.material !== doorMaterial) {
        mesh.material = doorMaterial;
      }
    });
    invalidate();
  }, [cabinetMaterial, doorMaterial, meshRefs, invalidate]);

  return null;
}
