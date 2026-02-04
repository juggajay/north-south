import { useRef, useState, useCallback } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { damp } from 'three/src/math/MathUtils'
import * as THREE from 'three'

// ============================================
// 1. CABINET DOOR - Standard hinged door
// ============================================
interface CabinetDoorProps {
  width: number // in scene units
  height: number
  depth?: number // door thickness
  position: [number, number, number]
  hinge: 'left' | 'right'
  material?: THREE.Material
  openAngle?: number // radians, default Math.PI * 0.6
}

export function CabinetDoor({
  width,
  height,
  depth = 0.018,
  position,
  hinge,
  material,
  openAngle = Math.PI * 0.6,
}: CabinetDoorProps) {
  const pivotRef = useRef<THREE.Group>(null)
  const [isOpen, setIsOpen] = useState(false)
  const { invalidate } = useThree()

  // Calculate pivot offset based on hinge side
  const pivotOffset = hinge === 'left' ? -width / 2 : width / 2

  useFrame((state, delta) => {
    if (!pivotRef.current) return

    const targetRotation = isOpen
      ? (hinge === 'left' ? -openAngle : openAngle)
      : 0

    // Smooth interpolation
    pivotRef.current.rotation.y = damp(
      pivotRef.current.rotation.y,
      targetRotation,
      4, // damping factor
      delta
    )

    // Keep invalidating while animating
    if (Math.abs(pivotRef.current.rotation.y - targetRotation) > 0.01) {
      invalidate()
    }
  })

  const handleClick = useCallback((event: THREE.Event) => {
    event.stopPropagation()
    setIsOpen((prev) => !prev)
    invalidate()
  }, [invalidate])

  const handlePointerOver = useCallback(() => {
    document.body.style.cursor = 'pointer'
  }, [])

  const handlePointerOut = useCallback(() => {
    document.body.style.cursor = 'default'
  }, [])

  // Default material if none provided
  const doorMaterial = material || new THREE.MeshStandardMaterial({
    color: '#d4d4d4',
    roughness: 0.4,
    metalness: 0.1,
  })

  return (
    <group position={position}>
      {/* Pivot point at hinge */}
      <group ref={pivotRef} position={[pivotOffset, 0, 0]}>
        <mesh
          position={[-pivotOffset, 0, depth / 2]}
          onClick={handleClick}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        >
          <boxGeometry args={[width, height, depth]} />
          <primitive object={doorMaterial} attach="material" />
        </mesh>

        {/* Door handle */}
        <mesh
          position={[
            hinge === 'left' ? width * 0.35 : -width * 0.35,
            0,
            depth + 0.01
          ]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <cylinderGeometry args={[0.008, 0.008, 0.06, 8]} />
          <meshStandardMaterial color="#737373" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>
    </group>
  )
}

// ============================================
// 2. CABINET DRAWER - Slides out on Z-axis
// ============================================
interface CabinetDrawerProps {
  width: number // scene units
  height: number
  depth?: number // how deep the drawer is
  position: [number, number, number]
  slideDistance?: number // how far it slides out
  material?: THREE.Material
}

export function CabinetDrawer({
  width,
  height,
  depth = 0.4,
  position,
  slideDistance = 0.35,
  material,
}: CabinetDrawerProps) {
  const groupRef = useRef<THREE.Group>(null)
  const [isOpen, setIsOpen] = useState(false)
  const { invalidate } = useThree()

  useFrame((state, delta) => {
    if (!groupRef.current) return

    const targetZ = isOpen ? slideDistance : 0

    // Smooth slide animation on Z axis
    groupRef.current.position.z = damp(
      groupRef.current.position.z,
      targetZ,
      4,
      delta
    )

    // Keep invalidating while animating
    if (Math.abs(groupRef.current.position.z - targetZ) > 0.01) {
      invalidate()
    }
  })

  const handleClick = useCallback((event: THREE.Event) => {
    event.stopPropagation()
    setIsOpen((prev) => !prev)
    invalidate()
  }, [invalidate])

  const handlePointerOver = useCallback(() => {
    document.body.style.cursor = 'pointer'
  }, [])

  const handlePointerOut = useCallback(() => {
    document.body.style.cursor = 'default'
  }, [])

  const drawerMaterial = material || new THREE.MeshStandardMaterial({
    color: '#d4d4d4',
    roughness: 0.4,
    metalness: 0.1,
  })

  const frontThickness = 0.018

  return (
    <group position={position}>
      <group ref={groupRef}>
        {/* Drawer front panel (the visible face) */}
        <mesh
          position={[0, 0, depth / 2 + frontThickness / 2]}
          onClick={handleClick}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        >
          <boxGeometry args={[width, height, frontThickness]} />
          <primitive object={drawerMaterial} attach="material" />
        </mesh>

        {/* Drawer box (the container) */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[width - 0.01, height - 0.02, depth]} />
          <meshStandardMaterial color="#e5e5e5" />
        </mesh>

        {/* Handle */}
        <mesh
          position={[0, 0, depth / 2 + frontThickness + 0.01]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <cylinderGeometry args={[0.008, 0.008, width * 0.3, 8]} />
          <meshStandardMaterial color="#737373" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>
    </group>
  )
}

// ============================================
// 3. LIFT-UP DOOR PANEL - Rotates up on X-axis
// ============================================
interface LiftUpDoorPanelProps {
  width: number
  height: number
  depth?: number
  position: [number, number, number]
  material?: THREE.Material
  openAngle?: number // radians, default -Math.PI * 0.4 (lifts up)
}

export function LiftUpDoorPanel({
  width,
  height,
  depth = 0.018,
  position,
  material,
  openAngle = -Math.PI * 0.4, // Negative to rotate upward
}: LiftUpDoorPanelProps) {
  const pivotRef = useRef<THREE.Group>(null)
  const [isOpen, setIsOpen] = useState(false)
  const { invalidate } = useThree()

  // Pivot is at the TOP of the door
  const pivotOffsetY = height / 2

  useFrame((state, delta) => {
    if (!pivotRef.current) return

    const targetRotation = isOpen ? openAngle : 0

    // Smooth rotation on X axis (lifts up)
    pivotRef.current.rotation.x = damp(
      pivotRef.current.rotation.x,
      targetRotation,
      4,
      delta
    )

    // Keep invalidating while animating
    if (Math.abs(pivotRef.current.rotation.x - targetRotation) > 0.01) {
      invalidate()
    }
  })

  const handleClick = useCallback((event: THREE.Event) => {
    event.stopPropagation()
    setIsOpen((prev) => !prev)
    invalidate()
  }, [invalidate])

  const handlePointerOver = useCallback(() => {
    document.body.style.cursor = 'pointer'
  }, [])

  const handlePointerOut = useCallback(() => {
    document.body.style.cursor = 'default'
  }, [])

  const doorMaterial = material || new THREE.MeshStandardMaterial({
    color: '#d4d4d4',
    roughness: 0.4,
    metalness: 0.1,
  })

  return (
    <group position={position}>
      {/* Pivot point at top of door */}
      <group ref={pivotRef} position={[0, pivotOffsetY, 0]}>
        <mesh
          position={[0, -pivotOffsetY, depth / 2]}
          onClick={handleClick}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        >
          <boxGeometry args={[width, height, depth]} />
          <primitive object={doorMaterial} attach="material" />
        </mesh>

        {/* Handle at bottom of door */}
        <mesh
          position={[0, -height + 0.03, depth + 0.01]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <cylinderGeometry args={[0.008, 0.008, width * 0.3, 8]} />
          <meshStandardMaterial color="#737373" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>
    </group>
  )
}
