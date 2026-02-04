import type { ModuleConfig, ModuleType } from '@/types/configurator'
import {
  StandardBase, SinkBase, DrawerStack, PullOutPantry,
  CornerBase, ApplianceTower, OpenShelving
} from './BaseModule'
import {
  StandardOverhead, GlassDoor, OpenShelf,
  RangehoodSpace, LiftUpDoor
} from './OverheadModule'

interface ModuleFactoryProps {
  config: ModuleConfig
  width: number
  slotType: 'base' | 'overhead'
}

export function renderModule({ config, width, slotType }: ModuleFactoryProps) {
  const baseHeight = 800
  const overheadHeight = 600
  const height = slotType === 'base' ? baseHeight : overheadHeight
  const depth = slotType === 'base' ? 560 : 350

  switch (config.type) {
    // Base modules (7)
    case 'standard':
      return <StandardBase config={config} width={width} height={height} depth={depth} />
    case 'sink-base':
      return <SinkBase config={config} width={width} height={height} depth={depth} />
    case 'drawer-stack':
      return <DrawerStack config={config} width={width} height={height} depth={depth} />
    case 'pull-out-pantry':
      return <PullOutPantry config={config} width={width} height={2100} depth={depth} />
    case 'corner-base':
      return <CornerBase config={config} width={width} height={height} depth={depth} />
    case 'appliance-tower':
      return <ApplianceTower config={config} width={width} height={2100} depth={depth} />
    case 'open-shelving':
      return <OpenShelving config={config} width={width} height={height} depth={depth} />

    // Overhead modules (5)
    case 'standard-overhead':
      return <StandardOverhead config={config} width={width} height={height} depth={depth} />
    case 'glass-door':
      return <GlassDoor config={config} width={width} height={height} depth={depth} />
    case 'open-shelf':
      return <OpenShelf config={config} width={width} height={height} depth={depth} />
    case 'rangehood-space':
      return <RangehoodSpace config={config} width={width} height={height} depth={depth} />
    case 'lift-up-door':
      return <LiftUpDoor config={config} width={width} height={height} depth={depth} />

    default:
      console.warn(`Unknown module type: ${config.type}`)
      return null
  }
}
