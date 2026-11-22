import { useEffect, useLayoutEffect, useRef } from 'react'
import { useBlocker, useLocation, useNavigationType } from 'react-router-dom'
import { useReducedMotion } from './useReducedMotion'

type ViewTransitionHandle = {
  finished: Promise<void>
  ready?: Promise<void>
  updateCallbackDone?: Promise<void>
  skipTransition: () => void
}
type TransitionDocument = Document & {
  startViewTransition?: (update: () => Promise<void>) => ViewTransitionHandle
}

/** Snapshot route changes so the new page slides over the departing page. */
export function usePageTransitions() {
  const reduced = useReducedMotion()
  const location = useLocation()
  const navigationType = useNavigationType()
  const transition = useRef<ViewTransitionHandle | null>(null)
  const commit = useRef<(() => void) | null>(null)
  const pending = useRef(false)
  const fallbackAnimation = useRef<Animation | null>(null)
  const blocker = useBlocker(({ currentLocation, nextLocation }) =>
    !reduced && typeof document !== 'undefined' && typeof Element.prototype.animate === 'function' &&
    currentLocation.pathname !== nextLocation.pathname,
  )

  const firstRender = useRef(true)
  useLayoutEffect(() => {
    if (firstRender.current) { firstRender.current = false; return }
    // New pages open at the top. Jump instantly: the page's smooth scrolling would be cut short mid-transition.
    // This runs on every new page, not only animated ones: a slow case-study chunk can outlast the transition
    // (the browser gives up on it), and then the page would otherwise open at the old scroll position.
    if (navigationType !== 'POP' && !location.hash) window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    if (!pending.current) return
    commit.current?.()
    commit.current = null
    document.querySelector<HTMLElement>('#main-content')?.focus({ preventScroll: true })
  }, [location.key, location.hash, navigationType])

  useEffect(() => {
    if (blocker.state !== 'blocked') return
    let cancelled = false
    const transitionDocument = document as TransitionDocument
    transition.current?.skipTransition()
    pending.current = true

    const proceed = () => {
      if (!cancelled) blocker.proceed()
    }

    if (transitionDocument.startViewTransition) {
      try {
        document.documentElement.dataset.pageTransition = 'active'
        const handle = transitionDocument.startViewTransition(() => new Promise<void>(resolve => {
          commit.current = resolve
          proceed()
        }))
        transition.current = handle
        // A skipped or aborted transition rejects all three promises; the navigation itself still completes.
        void handle.ready?.catch(() => undefined)
        void handle.updateCallbackDone?.catch(() => undefined)
        void handle.finished.catch(() => undefined).finally(() => {
          if (transition.current === handle) {
            transition.current = null
            pending.current = false
            delete document.documentElement.dataset.pageTransition
          }
        })
      } catch {
        delete document.documentElement.dataset.pageTransition
        proceed()
        pending.current = false
      }
    } else {
      // Without snapshots, the page content shrinks and slides out, then the new page slides in and grows.
      const main = document.querySelector<HTMLElement>('#main-content')
      if (!main) { proceed(); pending.current = false; return }
      const ease = 'cubic-bezier(.65,0,.35,1)'
      document.documentElement.dataset.pageTransition = 'fallback'
      const exit = main.animate([
        { transform: 'translateX(0) scale(1)', easing: ease },
        { transform: 'translateX(0) scale(.85)', offset: 0.3, easing: ease },
        { transform: 'translateX(-100vw) scale(.85)' },
      ], { duration: 500, fill: 'forwards' })
      fallbackAnimation.current = exit
      const finish = () => {
        pending.current = false
        delete document.documentElement.dataset.pageTransition
      }
      void exit.finished.then(() => {
        if (cancelled) return
        commit.current = () => {
          exit.cancel()
          const entrance = main.animate([
            { transform: 'translateX(100vw) scale(.85)', easing: ease },
            { transform: 'translateX(0) scale(.85)', offset: 0.45 },
            { transform: 'translateX(0) scale(.85)', offset: 0.6, easing: ease },
            { transform: 'translateX(0) scale(1)' },
          ], { duration: 650 })
          fallbackAnimation.current = entrance
          void entrance.finished.catch(() => undefined).finally(finish)
        }
        proceed()
      }).catch(() => { if (!cancelled) { proceed(); finish() } })
    }

    return () => { cancelled = true }
  }, [blocker])

  useEffect(() => {
    if (reduced) {
      transition.current?.skipTransition()
      fallbackAnimation.current?.finish()
    }
  }, [reduced])

  useEffect(() => () => {
    transition.current?.skipTransition()
    fallbackAnimation.current?.cancel()
    commit.current?.()
    commit.current = null
    delete document.documentElement.dataset.pageTransition
  }, [])
}
