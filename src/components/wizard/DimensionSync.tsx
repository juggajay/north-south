import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { useCabinetStore } from '@/stores/useCabinetStore'

/**
 * DimensionSync - Must be rendered INSIDE Canvas context
 *
 * Subscribes to dimension changes in useCabinetStore and invalidates
 * the Three.js renderer to trigger re-render. This keeps useThree()
 * properly within Canvas context while allowing dimension controls
 * outside Canvas to trigger updates.
 */
export function DimensionSync() {
  const { invalidate } = useThree()
  const prevDimensionsRef = useRef(useCabinetStore.getState().config.dimensions)

  useEffect(() => {
    // Subscribe to store changes
    const unsubscribe = useCabinetStore.subscribe((state) => {
      const newDimensions = state.config.dimensions
      const prev = prevDimensionsRef.current

      // Check if dimensions actually changed
      if (
        newDimensions.width !== prev.width ||
        newDimensions.height !== prev.height ||
        newDimensions.depth !== prev.depth
      ) {
        prevDimensionsRef.current = newDimensions
        invalidate() // Trigger 3D re-render
      }
    })

    return () => unsubscribe()
  }, [invalidate])

  // This component renders nothing - it's just for the subscription
  return null
}
