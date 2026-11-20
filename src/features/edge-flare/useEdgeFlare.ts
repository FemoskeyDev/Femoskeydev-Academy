import { useEffect } from 'react'
import { isFlareSupported, startEdgeFlare } from './edgeFlare'

/** Runs the bottom-edge flare for [data-flare] media while the device and motion settings allow it. */
export function useEdgeFlare() {
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const queries = [window.matchMedia('(hover: hover) and (pointer: fine)'), window.matchMedia('(prefers-reduced-motion: reduce)')]
    let stop: (() => void) | undefined
    const sync = () => {
      stop?.()
      stop = isFlareSupported() ? startEdgeFlare() : undefined
    }
    sync()
    queries.forEach(query => query.addEventListener?.('change', sync))
    return () => {
      queries.forEach(query => query.removeEventListener?.('change', sync))
      stop?.()
    }
  }, [])
}
