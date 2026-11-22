import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Cross2Icon, EnterFullScreenIcon, PauseIcon, PlayIcon, SpeakerLoudIcon, SpeakerOffIcon } from '@radix-ui/react-icons'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import styles from './HowWeWorkFloat.module.css'

const films = {
  wide: { src: '/images/portfolio/how-we-work.mp4', poster: '/images/portfolio/how-we-work-poster.webp' },
  tall: { src: '/images/portfolio/how-we-work-vertical.mp4', poster: '/images/portfolio/how-we-work-vertical-poster.webp' },
}
const PHONE = '(max-width: 640px)'
const DISMISSED = 'how-we-work-dismissed'
const ARRIVE_AFTER_MS = 2500
// Apple's sheet curve: quick to leave, long gentle settle.
const EASE = 'cubic-bezier(.32,.72,0,1)'

function usePhone() {
  const [phone, setPhone] = useState(() => typeof window !== 'undefined' && window.matchMedia?.(PHONE).matches)
  useEffect(() => {
    const query = window.matchMedia?.(PHONE)
    if (!query) return
    const update = () => setPhone(query.matches)
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])
  return phone
}

/** The "How we work" film as a small floating card, bottom right: 16:9 on desktop, 9:16 on phones. It arrives a little
 *  after the page has loaded, plays muted, and opens into a modal with sound, growing out of the card. Closing the card
 *  removes it for the rest of the visit. */
export function HowWeWorkFloat() {
  const reduced = useReducedMotion()
  const phone = usePhone()
  const film = phone ? films.tall : films.wide
  const [visible, setVisible] = useState(false)
  const [gone, setGone] = useState(() => { try { return sessionStorage.getItem(DISMISSED) === '1' } catch { return false } })
  // Where the card was when it opened: the modal grows out of it, and shrinks back into it.
  const [from, setFrom] = useState<DOMRect | null>(null)
  const open = from !== null
  const cardRef = useRef<HTMLDivElement>(null)
  const cardVideo = useRef<HTMLVideoElement>(null)

  // Wait for the preloader to clear (it removes `app-starting` from <html>), then a beat more.
  useEffect(() => {
    if (gone) return
    let timer = 0
    const start = () => { timer = window.setTimeout(() => setVisible(true), ARRIVE_AFTER_MS) }
    const root = document.documentElement
    if (!root.classList.contains('app-starting')) { start(); return () => window.clearTimeout(timer) }
    const observer = new MutationObserver(() => {
      if (root.classList.contains('app-starting')) return
      observer.disconnect()
      start()
    })
    observer.observe(root, { attributes: true, attributeFilter: ['class'] })
    return () => { observer.disconnect(); window.clearTimeout(timer) }
  }, [gone])

  // The card plays muted while it is showing and the modal is closed; reduced motion keeps it on its poster.
  useEffect(() => {
    const video = cardVideo.current
    if (!video || !visible) return
    if (open || reduced) video.pause()
    else void video.play().catch(() => undefined)
  }, [visible, open, reduced, film.src])

  if (gone) return null

  const expand = () => setFrom(cardRef.current?.getBoundingClientRect() ?? new DOMRect(window.innerWidth - 40, window.innerHeight - 40, 16, 9))

  const dismiss = () => {
    setVisible(false)
    try { sessionStorage.setItem(DISMISSED, '1') } catch { /* the card still goes for this page view */ }
    window.setTimeout(() => setGone(true), 400)
  }

  return <>
    <div ref={cardRef} className={`${styles.card} ${phone ? styles.tall : ''}`} data-visible={visible || undefined} aria-hidden={!visible || open}>
      <video ref={cardVideo} key={film.src} src={film.src} poster={film.poster} muted loop playsInline preload="metadata" aria-hidden="true" tabIndex={-1} />
      <button type="button" className={styles.open} onClick={expand} tabIndex={visible ? undefined : -1} aria-label="Watch how we work, with sound" />
      <button type="button" className={`${styles.control} ${styles.expand}`} onClick={expand} tabIndex={visible ? undefined : -1} aria-label="Expand the How we work video"><EnterFullScreenIcon aria-hidden="true" /></button>
      <button type="button" className={`${styles.control} ${styles.close}`} onClick={dismiss} tabIndex={visible ? undefined : -1} aria-label="Close the How we work video"><Cross2Icon aria-hidden="true" /></button>
    </div>
    {from && createPortal(<FilmModal film={film} phone={phone} reduced={reduced} from={from} onClosed={() => setFrom(null)} />, document.body)}
  </>
}

function FilmModal({ film, phone, reduced, from, onClosed }: { film: (typeof films)['wide']; phone: boolean; reduced: boolean; from: DOMRect; onClosed: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)
  const scrimRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const closing = useRef(false)
  const [playing, setPlaying] = useState(true)
  const [muted, setMuted] = useState(false)

  // From the card's place and size to the middle of the screen (and back on close).
  const travel = () => {
    const frame = frameRef.current
    if (!frame) return null
    const to = frame.getBoundingClientRect()
    const scale = from.width / to.width
    return `translate(${from.left + from.width / 2 - (to.left + to.width / 2)}px, ${from.top + from.height / 2 - (to.top + to.height / 2)}px) scale(${scale})`
  }

  useLayoutEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    dialog.showModal()
    const root = document.documentElement
    const overflow = root.style.overflow
    root.style.overflow = 'hidden'
    const video = videoRef.current
    if (video) {
      video.currentTime = 0
      // Browsers can refuse sound without a gesture; fall back to muted rather than not playing.
      void video.play().catch(() => { video.muted = true; setMuted(true); void video.play().catch(() => setPlaying(false)) })
    }
    if (!reduced) {
      const start = travel()
      if (start) frameRef.current?.animate([{ transform: start, borderRadius: '18px' }, { transform: 'none' }], { duration: 560, easing: EASE })
      scrimRef.current?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 400, easing: 'ease' })
    }
    return () => { root.style.overflow = overflow }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs once, when the modal opens
  }, [])

  const close = () => {
    if (closing.current) return
    closing.current = true
    videoRef.current?.pause()
    const end = travel()
    if (reduced || !end || !frameRef.current?.animate) { dialogRef.current?.close(); onClosed(); return }
    scrimRef.current?.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 360, easing: 'ease', fill: 'forwards' })
    const shrink = frameRef.current.animate([{ transform: 'none' }, { transform: end, borderRadius: '18px', opacity: 0.6 }], { duration: 440, easing: EASE, fill: 'forwards' })
    void shrink.finished.catch(() => undefined).finally(() => { dialogRef.current?.close(); onClosed() })
  }

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) void video.play().then(() => setPlaying(true)).catch(() => undefined)
    else { video.pause(); setPlaying(false) }
  }
  const toggleSound = () => {
    const video = videoRef.current
    if (!video) return
    video.muted = !video.muted
    setMuted(video.muted)
  }

  return <dialog ref={dialogRef} className={styles.dialog} aria-label="How we work" onCancel={(event) => { event.preventDefault(); close() }}>
    <div ref={scrimRef} className={styles.scrim} onClick={close} />
    {/* First in order, so the dialog opens with focus on it */}
    <button type="button" className={`${styles.control} ${styles.dismiss}`} onClick={close} aria-label="Close video"><Cross2Icon aria-hidden="true" /></button>
    <div ref={frameRef} className={`${styles.frame} ${phone ? styles.tallFrame : ''}`}>
      <video ref={videoRef} src={film.src} poster={film.poster} playsInline muted={muted} onEnded={() => setPlaying(false)} onClick={togglePlay} />
      <div className={styles.bar}>
        <button type="button" className={styles.control} onClick={togglePlay} aria-label={playing ? 'Pause' : 'Play'}>{playing ? <PauseIcon aria-hidden="true" /> : <PlayIcon aria-hidden="true" />}</button>
        <button type="button" className={styles.control} onClick={toggleSound} aria-pressed={!muted} aria-label={muted ? 'Turn sound on' : 'Turn sound off'}>{muted ? <SpeakerOffIcon aria-hidden="true" /> : <SpeakerLoudIcon aria-hidden="true" />}</button>
      </div>
    </div>
  </dialog>
}
