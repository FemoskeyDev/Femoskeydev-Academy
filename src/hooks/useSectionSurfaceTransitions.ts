import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from './useReducedMotion'

gsap.registerPlugin(ScrollTrigger)

function opaqueBackground(element: HTMLElement) {
  let current: HTMLElement | null = element
  while (current) {
    const color = getComputedStyle(current).backgroundColor
    if (color !== 'transparent' && color !== 'rgba(0, 0, 0, 0)') return color
    current = current.parentElement
  }
  return 'rgb(250, 250, 250)'
}

function isDark(color: string) {
  const channels = color.match(/[\d.]+/g)?.map(Number) ?? [250, 250, 250]
  return channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722 < 100
}

/** One reversible surface transition at each full-width light/dark boundary. */
export function useSectionSurfaceTransitions() {
  const ref = useRef<HTMLDivElement>(null)
  const { pathname } = useLocation()
  const reduced = useReducedMotion()

  useEffect(() => {
    const root = ref.current
    if (!root || reduced) return
    let cancelled = false
    let context: gsap.Context | undefined
    const paintedSections = new Set<HTMLElement>()

    void Promise.resolve(document.fonts?.ready).catch(() => undefined).then(() => {
      if (cancelled) return
      const candidates = Array.from(root.querySelectorAll<HTMLElement>('main section, footer'))
      // Nested feature sections and coloured cards have their own visual treatment.
      const sections = candidates.filter(section => !section.parentElement?.closest('section'))
      const surfaces = sections.map(section => ({
        section,
        background: opaqueBackground(section),
        color: getComputedStyle(section).color,
      }))

      context = gsap.context(() => {
        surfaces.forEach((surface, index) => {
          const previous = surfaces[index - 1]
          if (!previous || isDark(previous.background) === isDark(surface.background)) return
          // The closing CTA keeps its own dark surface all the way into the footer.
          if (previous.section.hasAttribute('data-surface-fixed') || surface.section.hasAttribute('data-surface-fixed')) return
          for (const section of [previous.section, surface.section]) {
            section.setAttribute('data-surface-transition', '')
            paintedSections.add(section)
          }

          const timeline = gsap.timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
              trigger: surface.section,
              start: 'top 28%',
              end: 'top top',
              scrub: .7,
              invalidateOnRefresh: true,
            },
          })
          timeline.fromTo(surface.section,
            { backgroundColor: previous.background },
            { backgroundColor: surface.background, immediateRender: false }, 0)
          timeline.fromTo(previous.section,
            { backgroundColor: previous.background },
            { backgroundColor: surface.background, immediateRender: false }, 0)
          // Inherited text fades with the surface, so it never sits white-on-white or black-on-black mid-scroll.
          timeline.fromTo(surface.section,
            { color: previous.color },
            { color: surface.color, immediateRender: false }, 0)
          timeline.fromTo(previous.section,
            { color: previous.color },
            { color: surface.color, immediateRender: false }, 0)
        })
      }, root)
      ScrollTrigger.refresh()
    })

    return () => {
      cancelled = true
      context?.revert()
      paintedSections.forEach(section => section.removeAttribute('data-surface-transition'))
    }
  }, [pathname, reduced])

  return ref
}
