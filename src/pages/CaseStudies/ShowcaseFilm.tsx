import { useEffect, useRef, useState } from 'react'
import { SpeakerLoudIcon, SpeakerOffIcon } from '@radix-ui/react-icons'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import styles from './CaseStudy.module.css'

/** A full-width film that plays muted while on screen, with a toggle for its sound when it has one.
 *  Reduced motion keeps it paused on its poster with native controls. */
export function ShowcaseFilm({ src, poster, label, sound = true, background }: { src: string; poster: string; label: string; sound?: boolean; background?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [muted, setMuted] = useState(true)
  const reduced = useReducedMotion()

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

  return <div className={styles.showcaseFilm} style={background ? { background } : undefined}>
    <video data-flare ref={videoRef} src={src} poster={poster} width="1920" height="1080" muted={muted} loop playsInline preload="metadata" controls={reduced} aria-label={label} />
    {sound && !reduced && <button type="button" className={styles.soundToggle} onClick={toggleSound} aria-pressed={!muted} aria-label={muted ? 'Turn sound on' : 'Turn sound off'}>
      {muted ? <SpeakerOffIcon width={18} height={18} aria-hidden="true" /> : <SpeakerLoudIcon width={18} height={18} aria-hidden="true" />}
      <span>{muted ? 'Sound off' : 'Sound on'}</span>
    </button>}
  </div>
}
