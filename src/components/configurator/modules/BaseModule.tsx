import * as THREE from 'three'
import { CabinetDoor, CabinetDrawer } from '../CabinetDoor'
import type { ModuleConfig } from '@/types/configurator'

const MM_TO_UNITS = 0.001

interface BaseModuleProps {
  config: ModuleConfig
  width: number // mm
  height?: number // mm, default 800
  depth?: number // mm, default 560
}

// Shared cabinet body (carcass without doors)
function CabinetCarcass({ width, height, depth }: { width: number; height: number; depth: number }) {
  const w = width * MM_TO_UNITS
  const h = height * MM_TO_UNITS
  const d = depth * MM_TO_UNITS
  const thickness = 0.018 // 18mm panels

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
      {/* Bottom */}
      <mesh position={[0, thickness/2, 0]}>
        <boxGeometry args={[w - thickness*2, thickness, d - thickness]} />
        <meshStandardMaterial color="#d4d4d4" />
      </mesh>
    </group>
  )
}

// 1. Standard Base - door with shelf
export function StandardBase({ config, width, height = 800, depth = 560 }: BaseModuleProps) {
  const w = width * MM_TO_UNITS
  const h = height * MM_TO_UNITS
  const d = depth * MM_TO_UNITS

  const shelfCount = config.interiorOptions?.shelfCount || 1

  return (
    <group>
      <CabinetCarcass width={width} height={height} depth={depth} />
      <CabinetDoor
        width={w - 0.004}
        height={h - 0.004}
        depth={0.018}
        position={[0, h/2, d/2]}
        hinge="left"
      />
      {/* Interior shelves */}
      {Array.from({ length: shelfCount }).map((_, i) => (
        <mesh key={i} position={[0, h * ((i + 1) / (shelfCount + 1)), 0]}>
          <boxGeometry args={[w - 0.04, 0.018, d - 0.04]} />
          <meshStandardMaterial color="#e5e5e5" />
        </mesh>
      ))}
    </group>
  )
}

// 2. Sink Base - open for plumbing, double doors
export function SinkBase({ config, width, height = 800, depth = 560 }: BaseModuleProps) {
  const w = width * MM_TO_UNITS
  const h = height * MM_TO_UNITS
  const d = depth * MM_TO_UNITS
  const doorWidth = (w - 0.006) / 2

  return (
    <group>
      <CabinetCarcass width={width} height={height} depth={depth} />
      {/* Double doors */}
      <CabinetDoor
        width={doorWidth}
        height={h - 0.004}
        depth={0.018}
        position={[-doorWidth/2 - 0.001, h/2, d/2]}
        hinge="left"
      />
      <CabinetDoor
        width={doorWidth}
        height={h - 0.004}
        depth={0.018}
        position={[doorWidth/2 + 0.001, h/2, d/2]}
        hinge="right"
      />
      {/* No internal shelf - open for plumbing */}
    </group>
  )
}

// 3. Drawer Stack - 3-5 stacked drawers
export function DrawerStack({ config, width, height = 800, depth = 560 }: BaseModuleProps) {
  const drawerCount = config.interiorOptions?.drawerCount || 4
  const w = width * MM_TO_UNITS
  const h = height * MM_TO_UNITS
  const d = depth * MM_TO_UNITS
  const drawerH = h / drawerCount
  const drawerDepth = d * 0.85 // Drawer doesn't go full depth

  return (
    <group>
      <CabinetCarcass width={width} height={height} depth={depth} />
      {Array.from({ length: drawerCount }).map((_, i) => (
        <CabinetDrawer
          key={i}
          width={w - 0.006}
          height={drawerH - 0.006}
          depth={drawerDepth}
          position={[0, drawerH * i + drawerH/2, 0]}
          slideDistance={d * 0.6}
        />
      ))}
    </group>
  )
}

// 4. Pull-out Pantry - tall with internal pull-out shelving
export function PullOutPantry({ config, width, height = 2100, depth = 560 }: BaseModuleProps) {
  const w = width * MM_TO_UNITS
  const h = height * MM_TO_UNITS
  const d = depth * MM_TO_UNITS

  return (
    <group>
      <CabinetCarcass width={width} height={height} depth={depth} />
      {/* Tall door */}
      <CabinetDoor
        width={w - 0.004}
        height={h - 0.004}
        depth={0.018}
        position={[0, h/2, d/2]}
        hinge="left"
      />
      {/* Internal pull-out basket indicators (simplified) */}
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh key={i} position={[0, h * 0.15 + (h * 0.7 * i / 5), 0]}>
          <boxGeometry args={[w - 0.06, 0.01, d - 0.08]} />
          <meshStandardMaterial color="#a3a3a3" wireframe />
        </mesh>
      ))}
    </group>
  )
}

// 5. Corner Base - L-shaped corner unit
export function CornerBase({ config, width, height = 800, depth = 560 }: BaseModuleProps) {
  const w = width * MM_TO_UNITS
  const h = height * MM_TO_UNITS
  const d = depth * MM_TO_UNITS
  const thickness = 0.018

  return (
    <group>
      {/* L-shaped carcass */}
      <mesh position={[-w/4, h/2, -d/4]}>
        <boxGeometry args={[w/2, h, d/2]} />
        <meshStandardMaterial color="#d4d4d4" />
      </mesh>
      <mesh position={[w/4, h/2, d/4]}>
        <boxGeometry args={[w/2, h, d/2]} />
        <meshStandardMaterial color="#d4d4d4" />
      </mesh>
      {/* Angled door for corner access */}
      <CabinetDoor
        width={w * 0.6}
        height={h - 0.004}
        depth={0.018}
        position={[0, h/2, d/2]}
        hinge="left"
      />
    </group>
  )
}

// 6. Appliance Tower - tall cabinet with appliance opening
export function ApplianceTower({ config, width, height = 2100, depth = 560 }: BaseModuleProps) {
  const w = width * MM_TO_UNITS
  const h = height * MM_TO_UNITS
  const d = depth * MM_TO_UNITS
  const applianceH = h * 0.4 // 40% for appliance opening
  const applianceY = h * 0.3 // Position from bottom

  return (
    <group>
      <CabinetCarcass width={width} height={height} depth={depth} />
      {/* Top door (above appliance) */}
      <CabinetDoor
        width={w - 0.004}
        height={h * 0.25}
        depth={0.018}
        position={[0, h * 0.85, d/2]}
        hinge="left"
      />
      {/* Appliance opening - just a dark rectangle */}
      <mesh position={[0, applianceY + applianceH/2, d * 0.4]}>
        <boxGeometry args={[w * 0.85, applianceH, 0.02]} />
        <meshStandardMaterial color="#27272a" />
      </mesh>
      {/* Bottom drawer */}
      <CabinetDrawer
        width={w - 0.006}
        height={h * 0.15}
        depth={d * 0.85}
        position={[0, h * 0.08, 0]}
        slideDistance={d * 0.6}
      />
    </group>
  )
}

// 7. Open Shelving - no doors, just shelves
export function OpenShelving({ config, width, height = 800, depth = 560 }: BaseModuleProps) {
  const shelfCount = config.interiorOptions?.shelfCount || 2
  const w = width * MM_TO_UNITS
  const h = height * MM_TO_UNITS
  const d = depth * MM_TO_UNITS

  return (
    <group>
      <CabinetCarcass width={width} height={height} depth={depth} />
      {/* No doors - just visible shelves */}
      {Array.from({ length: shelfCount }).map((_, i) => (
        <mesh key={i} position={[0, h * ((i + 1) / (shelfCount + 1)), 0]}>
          <boxGeometry args={[w - 0.04, 0.018, d - 0.04]} />
          <meshStandardMaterial color="#e5e5e5" />
        </mesh>
      ))}
    </group>
  )
}
