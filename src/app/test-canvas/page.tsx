/**
 * Test page for Canvas3D verification
 * Phase 04-01: R3F Foundation
 */

'use client';

import { Canvas3D } from '@/components/configurator/Canvas3D';

export default function TestCanvasPage() {
  return (
    <div className="flex h-screen flex-col gap-4 p-4">
      <h1 className="text-2xl font-bold">Canvas3D Test</h1>
      <p className="text-muted-foreground">
        Should render an orange box without errors. Check console for warnings.
      </p>
      <Canvas3D className="h-[400px] rounded-lg border">
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="orange" />
        </mesh>
      </Canvas3D>
    </div>
  );
}
