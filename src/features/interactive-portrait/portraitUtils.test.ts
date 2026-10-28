import { describe, expect, it } from 'vitest'
import { localPoint, resolvePortraitMode, shaderPoint, type PortraitController } from './portraitUtils'
describe('localPoint', () => {
  it('converts viewport coordinates to clamped container coordinates', () => {
    const rect = { left: 30, top: 50, width: 200, height: 120 } as DOMRect
    expect(localPoint(80, 90, rect)).toEqual({ x: 50, y: 40 })
    expect(localPoint(500, 0, rect)).toEqual({ x: 200, y: 0 })
  })

  it('converts pointer positions to bottom-origin shader UVs', () => {
    const rect = { left: 20, top: 30, width: 200, height: 100 } as DOMRect
    expect(shaderPoint(70, 55, rect)).toEqual({ x: 0.25, y: 0.75 })
    expect(shaderPoint(500, 0, rect)).toEqual({ x: 1, y: 1 })
  })

  it('resolves the interaction mode from idle and cursor reveal', () => {
    const state: PortraitController = { mode: 'idle', pointer: { x: 0.5, y: 0.5 }, inside: false, reduced: false }
    expect(resolvePortraitMode(state)).toBe('idle')
    state.inside = true
    expect(resolvePortraitMode(state)).toBe('cursor-reveal')
    state.inside = false
    expect(resolvePortraitMode(state)).toBe('idle')
  })
})
