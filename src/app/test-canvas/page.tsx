/**
 * Test page for Canvas3D verification
 * Phase 04-03: 3D Model & Camera
 *
 * Tests CabinetModel with CameraController
 */

'use client';

import { Canvas3D } from '@/components/configurator/Canvas3D';
import { CabinetModel } from '@/components/configurator/CabinetModel';
import { CameraController } from '@/components/configurator/CameraController';
import { useCabinetStore } from '@/stores/useCabinetStore';

export default function TestCanvasPage() {
  const setDimension = useCabinetStore((state) => state.setDimension);

  return (
    <div className="flex h-screen flex-col gap-4 p-4">
      <h1 className="text-2xl font-bold">3D Cabinet Configurator Test</h1>
      <p className="text-muted-foreground">
        Cabinet model with camera controls. Try rotating, zooming, and panning.
      </p>

      {/* Dimension controls */}
      <div className="flex flex-col gap-2 rounded-lg border p-4">
        <h2 className="font-semibold">Dimensions (mm)</h2>
        <label className="flex items-center gap-2">
          Width:
          <input
            type="range"
            min="1200"
            max="6000"
            step="100"
            defaultValue="2400"
            onChange={(e) => setDimension('width', Number(e.target.value))}
            className="flex-1"
          />
        </label>
        <label className="flex items-center gap-2">
          Height:
          <input
            type="range"
            min="1800"
            max="3500"
            step="100"
            defaultValue="2100"
            onChange={(e) => setDimension('height', Number(e.target.value))}
            className="flex-1"
          />
        </label>
        <label className="flex items-center gap-2">
          Depth:
          <input
            type="range"
            min="300"
            max="900"
            step="50"
            defaultValue="600"
            onChange={(e) => setDimension('depth', Number(e.target.value))}
            className="flex-1"
          />
        </label>
      </div>

      {/* 3D view */}
      <Canvas3D className="h-[60vh] rounded-lg border">
        <CabinetModel />
        <CameraController />
      </Canvas3D>
    </div>
  );
}
