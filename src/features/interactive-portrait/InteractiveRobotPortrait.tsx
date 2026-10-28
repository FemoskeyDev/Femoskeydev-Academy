import { Component, Suspense, lazy, useCallback, useEffect, useRef, useState, type CSSProperties, type ErrorInfo, type KeyboardEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'
import { siteConfig } from '../../data/siteConfig'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { resolvePortraitMode, shaderPoint, type PortraitController, type PortraitMode } from './portraitUtils'
import { portraitConfig } from './portraitConfig'
import { WireframeTreatment } from './WireframeTreatment'
import styles from './InteractiveRobotPortrait.module.css'

const LazyPortraitScene = lazy(() => import('./PortraitScene').then(module => ({ default: module.PortraitScene })))

class PortraitErrorBoundary extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Portrait renderer failed; keeping the image based interaction available.', error, info)
    this.props.onError()
  }
  render() { return this.state.failed ? null : this.props.children }
}

const createController = (): PortraitController => ({
  mode: 'idle', pointer: { x: 0.5, y: 0.5 }, inside: false, reduced: false,
  dynamic: false, rippleEnergy: 0, trail: new Float32Array(portraitConfig.trailLength * 3), trailIndex: 0,
})

function addTrailPoint(controller: PortraitController, x: number, y: number, strength: number) {
  const offset = controller.trailIndex * 3
  controller.trail[offset] = x
  controller.trail[offset + 1] = y
  controller.trail[offset + 2] = strength
  controller.trailIndex = (controller.trailIndex + 1) % portraitConfig.trailLength
}

const cssPercent = (fraction: number) => `${Number((fraction * 100).toFixed(3))}%`

export function InteractiveRobotPortrait({ showCybernetic = true, className = '' }: { showCybernetic?: boolean; className?: string }) {
  const reducedMotion = useReducedMotion()
  const surfaceRef = useRef<HTMLDivElement>(null)
  const interaction = useRef<PortraitController>(createController())
  const [mode, setMode] = useState<PortraitMode>('idle')
  const [webglError, setWebglError] = useState(false)
  const handleWebGLError = useCallback(() => setWebglError(true), [])

  useEffect(() => {
    const controller = interaction.current
    controller.reduced = reducedMotion
    if (reducedMotion) {
      controller.rippleEnergy = 0
      controller.trail.fill(0)
    }
    controller.invalidate?.()
  }, [reducedMotion])

  const syncMode = useCallback(() => {
    const controller = interaction.current
    const next = resolvePortraitMode(controller)
    if (next !== controller.mode) {
      controller.mode = next
      setMode(next)
    }
    controller.invalidate?.()
  }, [])

  const updatePointer = useCallback((event: Pick<ReactPointerEvent<HTMLDivElement>, 'clientX' | 'clientY' | 'pointerType'>) => {
    const surface = surfaceRef.current
    if (!surface) return
    const rect = surface.getBoundingClientRect()
    const point = shaderPoint(event.clientX, event.clientY, rect)
    const controller = interaction.current
    const dx = (point.x - controller.pointer.x) * rect.width / Math.max(rect.height, 1)
    const dy = point.y - controller.pointer.y
    const movement = Math.hypot(dx, dy)
    controller.pointer.x = point.x
    controller.pointer.y = point.y
    controller.dynamic = event.pointerType !== 'touch' && !controller.reduced
    if (controller.dynamic && movement > 0.0015) {
      controller.rippleEnergy = Math.min(1, controller.rippleEnergy + Math.min(0.48, 0.18 + movement * 5.5))
      addTrailPoint(controller, point.x, point.y, Math.min(1, 0.35 + movement * 5))
    } else if (!controller.dynamic) {
      controller.rippleEnergy = 0
      controller.trail.fill(0)
    }
    surface.style.setProperty('--pointer-x', cssPercent(point.x))
    surface.style.setProperty('--pointer-y', cssPercent(1 - point.y))
    interaction.current.invalidate?.()
  }, [])

  const handlePointerEnter = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    interaction.current.inside = true
    updatePointer(event)
    syncMode()
  }, [syncMode, updatePointer])

  const handlePointerMove = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    interaction.current.inside = true
    updatePointer(event)
    syncMode()
  }, [syncMode, updatePointer])

  const handlePointerLeave = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'touch') return
    interaction.current.inside = false
    syncMode()
  }, [syncMode])

  const handlePointerDown = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'touch' && event.pointerType !== 'pen') return
    interaction.current.inside = true
    updatePointer(event)
    syncMode()
  }, [syncMode, updatePointer])

  const handlePointerEnd = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'touch' && event.pointerType !== 'pen') return
    interaction.current.inside = false
    syncMode()
  }, [syncMode])

  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
    const controller = interaction.current
    const nudges: Record<string, [number, number]> = {
      ArrowLeft: [-0.025, 0], ArrowRight: [0.025, 0], ArrowUp: [0, 0.025], ArrowDown: [0, -0.025],
    }
    const nudge = nudges[event.key]
    if (nudge) {
      event.preventDefault()
      controller.pointer.x = Math.max(0, Math.min(1, controller.pointer.x + nudge[0]))
      controller.pointer.y = Math.max(0, Math.min(1, controller.pointer.y + nudge[1]))
      controller.inside = true
      controller.dynamic = !controller.reduced
      if (controller.dynamic) {
        controller.rippleEnergy = Math.min(1, controller.rippleEnergy + 0.3)
        addTrailPoint(controller, controller.pointer.x, controller.pointer.y, 0.65)
      }
      syncMode()
      const surface = surfaceRef.current
      surface?.style.setProperty('--pointer-x', cssPercent(controller.pointer.x))
      surface?.style.setProperty('--pointer-y', cssPercent(1 - controller.pointer.y))
    }
  }, [syncMode])

  const stateClass = mode === 'cursor-reveal' ? styles.cursorReveal : ''
  const style = { '--pointer-x': '50%', '--pointer-y': '50%' } as CSSProperties

  return <div
    ref={surfaceRef}
    className={`${styles.surface} ${className} ${stateClass}${webglError ? ` ${styles.fallback}` : ''}`}
    style={style}
    role="group"
    aria-label={showCybernetic ? 'Interactive founder portrait. Move or drag across the portrait to reveal the cybernetic image. Use the arrow keys to reposition the reveal.' : 'Interactive founder portrait with pointer-reactive image distortion. Move the pointer or use the arrow keys to explore.'}
    data-cybernetic={showCybernetic}
    tabIndex={0}
    onPointerEnter={handlePointerEnter}
    onPointerMove={handlePointerMove}
    onPointerLeave={handlePointerLeave}
    onPointerDown={handlePointerDown}
    onPointerUp={handlePointerEnd}
    onPointerCancel={handlePointerEnd}
    onKeyDown={handleKeyDown}
  >
    <img className={styles.human} src={siteConfig.portrait} alt="Femoskeydev, founder of the Academy" draggable={false}/>
    {webglError && showCybernetic && <img className={styles.cyberneticFallback} src={siteConfig.cyberneticPortrait} alt="" aria-hidden="true" draggable={false}/>}
    {webglError && <span className={styles.fallbackGlow} aria-hidden="true"/>}
    {!webglError && <PortraitErrorBoundary onError={handleWebGLError}><Suspense fallback={null}><LazyPortraitScene interaction={interaction} onUnavailable={handleWebGLError} showCybernetic={showCybernetic}/></Suspense></PortraitErrorBoundary>}
    {showCybernetic && <WireframeTreatment/>}
  </div>
}
