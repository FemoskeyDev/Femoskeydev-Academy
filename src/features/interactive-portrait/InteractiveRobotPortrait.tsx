import { Component, Suspense, lazy, useCallback, useEffect, useRef, useState, type CSSProperties, type ErrorInfo, type KeyboardEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'
import { siteConfig } from '../../data/siteConfig'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { resolvePortraitMode, shaderPoint, type PortraitController, type PortraitMode } from './portraitUtils'
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
})

const cssPercent = (fraction: number) => `${Number((fraction * 100).toFixed(3))}%`

export function InteractiveRobotPortrait() {
  const reducedMotion = useReducedMotion()
  const surfaceRef = useRef<HTMLDivElement>(null)
  const interaction = useRef<PortraitController>(createController())
  const [mode, setMode] = useState<PortraitMode>('idle')
  const [webglError, setWebglError] = useState(false)
  const handleWebGLError = useCallback(() => setWebglError(true), [])

  useEffect(() => {
    interaction.current.reduced = reducedMotion
    interaction.current.invalidate?.()
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

  const updatePointer = useCallback((event: Pick<ReactPointerEvent<HTMLDivElement>, 'clientX' | 'clientY'>) => {
    const surface = surfaceRef.current
    if (!surface) return
    const rect = surface.getBoundingClientRect()
    const point = shaderPoint(event.clientX, event.clientY, rect)
    interaction.current.pointer.x = point.x
    interaction.current.pointer.y = point.y
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
    interaction.current.pointer.x = 0.5
    interaction.current.pointer.y = 0.5
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
    className={`${styles.surface} ${stateClass}${webglError ? ` ${styles.fallback}` : ''}`}
    style={style}
    role="group"
    aria-label="Interactive founder portrait. Move or drag across the portrait to reveal the cybernetic image. Use the arrow keys to reposition the reveal."
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
    {webglError && <img className={styles.cyberneticFallback} src={siteConfig.cyberneticPortrait} alt="" aria-hidden="true" draggable={false}/>}
    {!webglError && <PortraitErrorBoundary onError={handleWebGLError}><Suspense fallback={null}><LazyPortraitScene interaction={interaction} onUnavailable={handleWebGLError}/></Suspense></PortraitErrorBoundary>}
    <WireframeTreatment/>
  </div>
}
