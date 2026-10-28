import { useCallback, useEffect, useRef } from 'react'
import { siteConfig } from '../../data/siteConfig'
import styles from './PortraitCanvas.module.css'

export type PortraitProgress = { zoom: number; extra: number; invalidate?: () => void }

const FOCAL = { x: 1024, y: 735, radius: 38 }

export function PortraitCanvas({ getProgress, onReady, onInvalidate }: { getProgress: () => PortraitProgress; onReady: () => void; onInvalidate: (invalidate?: () => void) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)
  const frameRef = useRef<number | null>(null)
  const draw = useCallback(() => {
    if (frameRef.current !== null) return
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null
      const canvas = canvasRef.current
      const image = imageRef.current
      const progress = getProgress()
      const context = canvas?.getContext('2d', { alpha: true })
      if (!canvas || !image) return
      if (!context) {
        canvas.dataset.failed = 'true'
        return
      }
      const bounds = canvas.getBoundingClientRect()
      if (!bounds.width || !bounds.height) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const width = bounds.width
      const height = bounds.height
      const targetWidth = Math.round(width * dpr)
      const targetHeight = Math.round(height * dpr)
      if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
        canvas.width = targetWidth
        canvas.height = targetHeight
      }
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      context.clearRect(0, 0, width, height)

      const initialScale = Math.max(width / image.naturalWidth, height / image.naturalHeight)
      const initialLeft = (width - image.naturalWidth * initialScale) / 2
      const initialTop = (height - image.naturalHeight * initialScale) * 0.25
      const focusAtStart = { x: initialLeft + FOCAL.x * initialScale, y: initialTop + FOCAL.y * initialScale }
      const mobile = window.matchMedia('(max-width: 1023px)').matches
      const irisOnScreen = mobile ? 72 : 92
      const zoomScale = irisOnScreen / FOCAL.radius
      const scaleAtZoom = initialScale * Math.pow(zoomScale / initialScale, Math.max(0, Math.min(1, progress.zoom)))
      const zoomAmount = (scaleAtZoom - initialScale) / Math.max(0.0001, zoomScale - initialScale)
      const focalX = focusAtStart.x + (width / 2 - focusAtStart.x) * zoomAmount
      const focalY = focusAtStart.y + (height / 2 - focusAtStart.y) * zoomAmount
      const scale = scaleAtZoom * (1 + Math.max(0, Math.min(1, progress.extra)) * 0.18)
      const sourceWidth = width / scale
      const sourceHeight = height / scale
      context.imageSmoothingEnabled = true
      context.imageSmoothingQuality = 'high'
      context.drawImage(image, FOCAL.x - focalX / scale, FOCAL.y - focalY / scale, sourceWidth, sourceHeight, 0, 0, width, height)
      canvas.dataset.failed = 'false'
      canvas.dataset.ready = 'true'
    })
  }, [getProgress])

  useEffect(() => {
    const image = new Image()
    let disposed = false
    image.decoding = 'async'
    image.onload = () => {
      void image.decode().catch(() => undefined).finally(() => {
        if (disposed) return
        imageRef.current = image
        draw()
        onReady()
      })
    }
    image.onerror = () => {
      const canvas = canvasRef.current
      if (canvas) { canvas.dataset.failed = 'true'; canvas.dataset.ready = 'false' }
      onReady()
    }
    onInvalidate(draw)
    image.src = siteConfig.portrait
    const canvas = canvasRef.current
    const observer = canvas && 'ResizeObserver' in window ? new ResizeObserver(draw) : null
    if (canvas && observer) observer.observe(canvas)
    else window.addEventListener('resize', draw)
    return () => {
      disposed = true
      image.onload = null
      image.onerror = null
      observer?.disconnect()
      window.removeEventListener('resize', draw)
      onInvalidate(undefined)
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
      frameRef.current = null
    }
  }, [draw, onInvalidate, onReady])

  return <div className={styles.surface}><img className={styles.portraitFallback} src={siteConfig.portrait} alt="" aria-hidden="true"/><canvas className={styles.canvas} ref={canvasRef} data-scene="portrait" data-reveal="portrait" data-failed="false" aria-hidden="true"/></div>
}
