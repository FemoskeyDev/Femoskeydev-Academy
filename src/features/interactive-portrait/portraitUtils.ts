export type PortraitMode = 'idle' | 'cursor-reveal'
export type PortraitController = {
  mode: PortraitMode
  pointer: { x: number; y: number }
  inside: boolean
  reduced: boolean
  dynamic: boolean
  rippleEnergy: number
  trail: Float32Array
  trailIndex: number
  invalidate?: () => void
}

export function localPoint(clientX: number, clientY: number, rect: DOMRect) {
  return { x: Math.max(0, Math.min(rect.width, clientX - rect.left)), y: Math.max(0, Math.min(rect.height, clientY - rect.top)) }
}

export function shaderPoint(clientX: number, clientY: number, rect: DOMRect) {
  if (!rect.width || !rect.height) return { x: 0.5, y: 0.5 }
  const local = localPoint(clientX, clientY, rect)
  return { x: local.x / rect.width, y: 1 - local.y / rect.height }
}

export function resolvePortraitMode(state: PortraitController): PortraitMode {
  return state.inside ? 'cursor-reveal' : 'idle'
}
