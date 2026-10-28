import { useCallback, useEffect, useRef, useState, type TransitionEvent } from 'react'
import { siteConfig } from '../../data/siteConfig'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { AnimatedAcademyLogo } from './AnimatedAcademyLogo'
import styles from './AppLoader.module.css'

const MAX_READY_WAIT_MS = 4000
const INTRO_FALLBACK_MS = 2700

function preloadImage(src: string) {
  return new Promise<void>(resolve => {
    const image = new Image()
    const finish = () => resolve()
    image.onload = () => { void image.decode().catch(() => undefined).finally(finish) }
    image.onerror = finish
    image.src = src
  })
}

function waitForAppAssets() {
  const fontReady = document.fonts?.load('500 16px "Tomato Grotesk"').then(() => undefined).catch(() => undefined) ?? Promise.resolve()
  const assetsReady = Promise.all([fontReady, preloadImage(siteConfig.portrait)])
  return new Promise<void>(resolve => {
    const finish = () => { window.clearTimeout(fallback); resolve() }
    const fallback = window.setTimeout(finish, MAX_READY_WAIT_MS)
    void assetsReady.then(finish, finish)
  })
}

export function AppLoader({ onDismiss }: { onDismiss: () => void }) {
  const reducedMotion = useReducedMotion()
  const [introComplete, setIntroComplete] = useState(reducedMotion)
  const [appReady, setAppReady] = useState(false)
  const leaving = appReady && introComplete
  const notified = useRef(false)
  const completeIntro = useCallback(() => setIntroComplete(true), [])
  const dismiss = useCallback(() => {
    if (notified.current) return
    notified.current = true
    document.documentElement.classList.remove('app-starting')
    onDismiss()
  }, [onDismiss])

  useEffect(() => {
    let active = true
    void waitForAppAssets().then(() => { if (active) setAppReady(true) })
    return () => { active = false }
  }, [])

  const handleFadeEnd = (event: TransitionEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget || event.propertyName !== 'opacity' || !leaving) return
    dismiss()
  }

  useEffect(() => {
    if (!leaving) return
    const fallback = window.setTimeout(dismiss, 700)
    return () => window.clearTimeout(fallback)
  }, [dismiss, leaving])

  useEffect(() => {
    if (introComplete) return
    const fallback = window.setTimeout(completeIntro, INTRO_FALLBACK_MS)
    return () => window.clearTimeout(fallback)
  }, [completeIntro, introComplete])

  return (
    <div
      className={`${styles.loader} ${leaving ? styles.leaving : ''}`}
      aria-hidden="true"
      onTransitionEnd={handleFadeEnd}
    >
      <AnimatedAcademyLogo reducedMotion={reducedMotion} onIntroComplete={completeIntro}/>
    </div>
  )
}
