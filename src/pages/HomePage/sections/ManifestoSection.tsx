import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from '../../../hooks/useReducedMotion'
import styles from './ManifestoSection.module.css'

gsap.registerPlugin(ScrollTrigger)

const fullCopy = 'Creativity isn’t just a talent. It’s a skill you build, a craft you practise, and a future you create.'

function characters(text: string, prefix: string) {
  return Array.from(text, (character, index) => <span key={`${prefix}-${index}`} data-manifesto-char>{character}</span>)
}

export function ManifestoSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    const section = sectionRef.current
    const heading = headingRef.current
    if (!section || !heading || reducedMotion) return

    let cancelled = false
    let context: gsap.Context | undefined
    let resizeObserver: ResizeObserver | undefined

    void Promise.resolve(document.fonts?.ready).catch(() => undefined).then(() => {
      if (cancelled) return
      const chars = gsap.utils.toArray<HTMLElement>('[data-manifesto-char]', heading)
      if (!chars.length) return

      try {
        const colors = chars.map(char => getComputedStyle(char).color)
        const muted = getComputedStyle(document.documentElement).getPropertyValue('--color-muted').trim() || '#777'
        context = gsap.context(() => {
          gsap.set(chars, { color: muted })
          const screens = window.matchMedia('(max-width: 600px)').matches ? 1.35 : 1.8
          const reveal = gsap.timeline({
            scrollTrigger: {
              trigger: section,
              start: 'top top',
              end: () => `+=${Math.round(window.innerHeight * screens)}`,
              pin: section,
              pinSpacing: true,
              anticipatePin: 1,
              scrub: true,
              invalidateOnRefresh: true,
            },
          })
          reveal.to(chars, {
            color: index => colors[index],
            duration: 0.024,
            stagger: { each: 0.01, from: 0 },
            ease: 'none',
          })
        }, section)
        if ('ResizeObserver' in window) {
          resizeObserver = new ResizeObserver(() => ScrollTrigger.refresh())
          resizeObserver.observe(heading)
        }
        ScrollTrigger.refresh()
      } catch {
        context?.revert()
        context = undefined
        chars.forEach(char => char.style.removeProperty('color'))
      }
    })

    return () => {
      cancelled = true
      resizeObserver?.disconnect()
      context?.revert()
    }
  }, [reducedMotion])

  return (
    <section className={styles.section} id="academy-manifesto" ref={sectionRef} aria-labelledby="academy-manifesto-title">
      <h2
        className={styles.statement}
        id="academy-manifesto-title"
        ref={headingRef}
        aria-label={fullCopy}
      >
        <span className={styles.visualCopy} aria-hidden="true">
          {characters('Creativity', 'opening')}
          <svg className={styles.inlineMark} viewBox="0 0 101 102" fill="none" aria-hidden="true">
            <path d="M84.1774 0.5H16.8226C7.82258 0.5 0.5 7.82258 0.5 16.8226V100.5H23.4677C36.7581 100.5 47.5323 89.7258 47.5323 76.4355C47.5323 71.2419 45.9194 66.0484 42.5323 62.1129C36.4677 55.0161 27.4677 50.5323 17.4355 50.5323C35.6935 50.5323 50.5 35.7258 50.5 17.4677C50.5 35.7258 65.3065 50.5323 83.5645 50.5323C73.3065 50.5323 64.1774 55.2097 58.1129 62.5645C55.0161 66.3064 53.4677 71.0484 53.4677 75.8871C53.4677 89.5 64.5 100.532 78.1129 100.532H100.5V16.8226C100.5 7.79032 93.1774 0.5 84.1774 0.5Z" stroke="#b6ff39" />
            <path d="M50.5001 17.4678C50.5001 35.3771 36.2539 49.9654 18.478 50.5162C36.2539 51.0669 50.5001 65.6552 50.5001 83.5645C50.5001 65.6552 64.7463 51.0669 82.5222 50.5162C64.7463 49.9654 50.5001 35.3771 50.5001 17.4678Z" fill="#b6ff39" />
          </svg>
          {characters(' isn’t just a ', 'opening-after-mark')}
          <em className={styles.accent}>{characters('talent.', 'accent')}</em>
          {characters(' It’s a skill you build, a craft you practise, and a future you create.', 'closing')}
        </span>
      </h2>
    </section>
  )
}
