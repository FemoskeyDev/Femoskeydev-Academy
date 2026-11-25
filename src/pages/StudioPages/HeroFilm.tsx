import { useEffect, useRef, useState } from 'react'
import { SpeakerLoudIcon, SpeakerOffIcon } from '@radix-ui/react-icons'
import { siteConfig } from '../../data/siteConfig'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { CursorCard } from './CursorCard'
import styles from './PortfolioLanding.module.css'

const film = '/images/portfolio/hero-ninelines.mp4'
const poster = '/images/portfolio/hero-ninelines-poster.webp'

/** The Nine Lines brand identity film (how the mark was made, then the identity in use), linking to our Cal.com booking page with the "Contact us"
 *  cursor. It settles in on load, then plays muted only while it is on screen; the sound toggle sits beside the link,
 *  not inside it. */
export function HeroFilm() {
  const frameRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(true)
  const reduced = useReducedMotion()

  useEffect(() => {
    const frame = frameRef.current
    if (reduced || !frame?.animate) return
    // Same settle as the studio tiles: scaled down, slightly tilted and lowered, then into place.
    const animation = frame.animate([
      { opacity: 0, transform: 'translate3d(7px, 36px, 0) rotate(3.5deg) scale(.86)' },
      { opacity: 1, transform: 'none' },
    ], { duration: 1100, delay: 150, easing: 'cubic-bezier(.22, 1, .36, 1)', fill: 'backwards' })
    // Hold the start pose until the intro loader has left, so the settle is actually seen.
    const root = document.documentElement
    const loaderGone = () => !root.classList.contains('app-starting')
    let watcher: MutationObserver | undefined
    if (loaderGone()) animation.play()
    else {
      animation.pause()
      watcher = new MutationObserver(() => {
        if (!loaderGone()) return
        watcher?.disconnect()
        animation.play()
      })
      watcher.observe(root, { attributes: true, attributeFilter: ['class'] })
    }
    return () => { watcher?.disconnect(); animation.cancel() }
  }, [reduced])

  useEffect(() => {
    const video = videoRef.current
    if (reduced || !video || !('IntersectionObserver' in window)) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) void video.play().catch(() => undefined)
      else video.pause()
    }, { threshold: 0.25 })
    observer.observe(video)
    return () => { observer.disconnect(); video.pause() }
  }, [reduced])

  const toggleSound = () => {
    const video = videoRef.current
    if (!video) return
    video.muted = !muted
    setMuted(!muted)
    if (video.paused) void video.play().catch(() => undefined)
  }

  return <div ref={frameRef} className={styles.heroImage}>
    <CursorCard to={siteConfig.bookingUrl} label="Contact us: book a call on Cal.com (opens in a new tab)" tooltip="Contact us" className={styles.heroLink}>
      <span className={styles.heroFilm}>
        <img data-flare src={poster} alt="" fetchPriority="high" />
        {!reduced && <video data-flare ref={videoRef} src={film} muted={muted} loop playsInline preload="none" aria-hidden="true" tabIndex={-1}
          data-playing={playing || undefined} onPlaying={() => setPlaying(true)} />}
      </span>
    </CursorCard>
    {!reduced && <button type="button" className={styles.heroSound} onClick={toggleSound} aria-pressed={!muted} aria-label={muted ? 'Turn film sound on' : 'Turn film sound off'}>
      {muted ? <SpeakerOffIcon width={18} height={18} aria-hidden="true" /> : <SpeakerLoudIcon width={18} height={18} aria-hidden="true" />}
    </button>}
  </div>
}
