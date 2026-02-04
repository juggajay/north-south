import * as THREE from 'three'
import { CabinetDoor, LiftUpDoorPanel } from '../CabinetDoor'
import type { ModuleConfig } from '@/types/configurator'

const MM_TO_UNITS = 0.001

interface OverheadModuleProps {
  config: ModuleConfig
  width: number // mm
  height?: number // mm, default 600 for overheads
  depth?: number // mm, default 350 for overheads
}

// Shared overhead cabinet carcass
function OverheadCarcass({ width, height, depth }: { width: number; height: number; depth: number }) {
  const w = width * MM_TO_UNITS
  const h = height * MM_TO_UNITS
  const d = depth * MM_TO_UNITS
  const thickness = 0.018

  return (
    <group>
      {/* Back panel */}
      <mesh position={[0, h/2, -d/2 + thickness/2]}>
        <boxGeometry args={[w - thickness*2, h, thickness]} />
        <meshStandardMaterial color="#e5e5e5" />
      </mesh>
      {/* Left side */}
      <mesh position={[-w/2 + thickness/2, h/2, 0]}>
        <boxGeometry args={[thickness, h, d]} />
        <meshStandardMaterial color="#d4d4d4" />
      </mesh>
      {/* Right side */}
      <mesh position={[w/2 - thickness/2, h/2, 0]}>
        <boxGeometry args={[thickness, h, d]} />
        <meshStandardMaterial color="#d4d4d4" />
      </mesh>
      {/* Top */}
      <mesh position={[0, h - thickness/2, 0]}>
        <boxGeometry args={[w - thickness*2, thickness, d - thickness]} />
        <meshStandardMaterial color="#d4d4d4" />
      </mesh>
      {/* Bottom */}
      <mesh position={[0, thickness/2, 0]}>
        <boxGeometry args={[w - thickness*2, thickness, d - thickness]} />
        <meshStandardMaterial color="#d4d4d4" />
      </mesh>
    </group>
  )
}

// 1. Standard Overhead - single door with shelf
export function StandardOverhead({ config, width, height = 600, depth = 350 }: OverheadModuleProps) {
  const w = width * MM_TO_UNITS
  const h = height * MM_TO_UNITS
  const d = depth * MM_TO_UNITS
  const shelfCount = config.interiorOptions?.shelfCount || 1

  return (
    <group>
      <OverheadCarcass width={width} height={height} depth={depth} />
      <CabinetDoor
        width={w - 0.004}
        height={h - 0.004}
        depth={0.018}
        position={[0, h/2, d/2]}
        hinge="left"
      />
      {/* Interior shelf */}
      {Array.from({ length: shelfCount }).map((_, i) => (
        <mesh key={i} position={[0, h * ((i + 1) / (shelfCount + 1)), 0]}>
          <boxGeometry args={[w - 0.04, 0.018, d - 0.04]} />
          <meshStandardMaterial color="#e5e5e5" />
        </mesh>
      ))}
    </group>
  )
}

// 2. Glass Door - transparent/frosted glass door
export function GlassDoor({ config, width, height = 600, depth = 350 }: OverheadModuleProps) {
  const w = width * MM_TO_UNITS
  const h = height * MM_TO_UNITS
  const d = depth * MM_TO_UNITS
  const shelfCount = config.interiorOptions?.shelfCount || 1

  // Glass material with transparency
  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: '#f5f5f5',
    transparent: true,
    opacity: 0.3,
    roughness: 0.1,
    transmission: 0.9,
    thickness: 0.5,
  })

  return (
    <group>
      <OverheadCarcass width={width} height={height} depth={depth} />
      {/* Glass door */}
      <CabinetDoor
        width={w - 0.004}
        height={h - 0.004}
        depth={0.008} // Thinner glass
        position={[0, h/2, d/2]}
        hinge="left"
        material={glassMaterial}
      />
      {/* Interior shelf - visible through glass */}
      {Array.from({ length: shelfCount }).map((_, i) => (
        <mesh key={i} position={[0, h * ((i + 1) / (shelfCount + 1)), 0]}>
          <boxGeometry args={[w - 0.04, 0.018, d - 0.04]} />
          <meshStandardMaterial color="#e5e5e5" />
        </mesh>
      ))}
    </group>
  )
}

// 3. Open Shelf - no doors, exposed shelving
export function OpenShelf({ config, width, height = 600, depth = 350 }: OverheadModuleProps) {
  const shelfCount = config.interiorOptions?.shelfCount || 2
  const w = width * MM_TO_UNITS
  const h = height * MM_TO_UNITS
  const d = depth * MM_TO_UNITS

  return (
    <group>
      <OverheadCarcass width={width} height={height} depth={depth} />
      {/* Visible shelves - no door */}
      {Array.from({ length: shelfCount }).map((_, i) => (
        <mesh key={i} position={[0, h * ((i + 1) / (shelfCount + 1)), 0]}>
          <boxGeometry args={[w - 0.04, 0.018, d - 0.04]} />
          <meshStandardMaterial color="#e5e5e5" />
        </mesh>
      ))}
    </group>
  )
}

// 4. Rangehood Space - open area for rangehood/exhaust
export function RangehoodSpace({ config, width, height = 600, depth = 350 }: OverheadModuleProps) {
  const w = width * MM_TO_UNITS
  const h = height * MM_TO_UNITS
  const d = depth * MM_TO_UNITS

  return (
    <group>
      {/* Just the sides, no front/back - open space */}
      {/* Left side */}
      <mesh position={[-w/2 + 0.009, h/2, 0]}>
        <boxGeometry args={[0.018, h, d]} />
        <meshStandardMaterial color="#d4d4d4" />
      </mesh>
      {/* Right side */}
      <mesh position={[w/2 - 0.009, h/2, 0]}>
        <boxGeometry args={[0.018, h, d]} />
        <meshStandardMaterial color="#d4d4d4" />
      </mesh>
      {/* Top panel */}
      <mesh position={[0, h - 0.009, 0]}>
        <boxGeometry args={[w, 0.018, d]} />
        <meshStandardMaterial color="#d4d4d4" />
      </mesh>
      {/* Placeholder for rangehood */}
      <mesh position={[0, h * 0.3, d * 0.3]}>
        <boxGeometry args={[w * 0.7, h * 0.4, d * 0.4]} />
        <meshStandardMaterial color="#52525b" metalness={0.5} roughness={0.3} />
      </mesh>
    </group>
  )
}

// 5. Lift-Up Door - door that opens upward
export function LiftUpDoor({ config, width, height = 600, depth = 350 }: OverheadModuleProps) {
  const w = width * MM_TO_UNITS
  const h = height * MM_TO_UNITS
  const d = depth * MM_TO_UNITS
  const shelfCount = config.interiorOptions?.shelfCount || 1

  return (
    <group>
      <OverheadCarcass width={width} height={height} depth={depth} />
      {/* Lift-up door panel */}
      <LiftUpDoorPanel
        width={w - 0.004}
        height={h - 0.004}
        depth={0.018}
        position={[0, h/2, d/2]}
      />
      {/* Interior shelf */}
      {Array.from({ length: shelfCount }).map((_, i) => (
        <mesh key={i} position={[0, h * ((i + 1) / (shelfCount + 1)), 0]}>
          <boxGeometry args={[w - 0.04, 0.018, d - 0.04]} />
          <meshStandardMaterial color="#e5e5e5" />
        </mesh>
      ))}
    </group>
  )
}
