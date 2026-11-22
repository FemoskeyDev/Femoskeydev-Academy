import { useLayoutEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import { AbsoluteFill, Audio, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion'
import { FPS, INK, font, useFonts } from './Reel'
import { MARK, Mark3D } from './Mark3D'

/** "How we work": a 20-second film. A messy-handoffs cold open burns away into a soft gradient over a
 *  character grid, then five steps (discover, design, prototype, collaborate, ship) on one glossy object,
 *  a summary and the end card. Scene changes sit on the beat of the reel's music track. It lays itself out
 *  for 16:9 (1920 × 1080) or, when the composition is taller than wide, 9:16 (1080 × 1920). */

const at = (seconds: number) => Math.round(seconds * FPS)
// Pop Track 03: a beat every 0.551 s from 0.144 s; the bass enters on beat 8.
const beat = (n: number) => 0.144 + 0.551 * n
export const HOW_FRAMES = at(20)

const CORAL = '#FF5A36'
const GREEN = '#2BB673'
const smooth = Easing.bezier(0.22, 1, 0.36, 1)
const inOut = Easing.bezier(0.65, 0, 0.35, 1)
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const
const ramp = (frame: number, from: number, to: number, easing = smooth) => interpolate(frame, [at(from), at(to)], [0, 1], { ...clamp, easing })

/** Blur in from soft and slightly low, Apple keynote style; `out` blurs it away again. */
function focus(frame: number, start: number, out?: number, duration = 0.55): CSSProperties {
  const enter = ramp(frame, start, start + duration)
  const leave = out === undefined ? 0 : ramp(frame, out, out + 0.35, inOut)
  const p = enter * (1 - leave)
  return { opacity: p, filter: `blur(${(1 - enter) * 16 + leave * 14}px)`, transform: `translateY(${(1 - enter) * 18 - leave * 10}px)` }
}

// ——— Layout: positions for each frame shape ———

const wide = {
  W: 1920, H: 1080,
  sphere: { x: 1320, y: 520, r: 165 }, flyFrom: { dx: -420, dy: 360 },
  step: { left: 150, top: 470, size: 124 },
  chips: [[300, 250, -6], [1330, 220, 5], [250, 700, 4], [800, 830, -3], [1390, 720, -5]],
  headline: { top: 440, second: 480, size: 92, max: 1100 },
  ship: { left: 1010, top: 250 },
  comment: (x: number, y: number, half: number) => ({ left: x + half + 40, top: y - half - 10 }),
  summary: { pills: 300, pill: 30, first: 420, second: 528, size: 96 },
  pledge: { mark: 350, r: 72, line: 480, size: 104, pill: 640 },
  end: { logo: 990, top: 400, tag: 500, cta: 600, pill: 730 },
}
const tall: typeof wide = {
  W: 1080, H: 1920,
  sphere: { x: 540, y: 1130, r: 170 }, flyFrom: { dx: -330, dy: 520 },
  step: { left: 0, top: 640, size: 120 },
  chips: [[70, 400, -6], [470, 560, 5], [60, 1250, 4], [430, 1410, -3], [250, 1580, -5]],
  headline: { top: 820, second: 860, size: 96, max: 900 },
  ship: { left: 161, top: 830 },
  comment: (x: number, y: number, half: number) => ({ left: x - 40, top: y - half - 100 }),
  summary: { pills: 660, pill: 26, first: 790, second: 890, size: 80 },
  pledge: { mark: 700, r: 80, line: 830, size: 104, pill: 1110 },
  end: { logo: 820, top: 800, tag: 880, cta: 990, pill: 1110 },
}
function useLayout() {
  const { width, height } = useVideoConfig()
  return height > width ? tall : wide
}

// ——— Background: drifting colour blobs under a grid of characters whose density follows them ———

const blobs = [
  { color: '#FFC9A8', x: 0.16, y: 0.42, r: 0.34, dx: 0.03, dy: 0.05, speed: 0.21 },
  { color: '#9EF2B0', x: 0.52, y: 0.05, r: 0.3, dx: 0.06, dy: 0.03, speed: 0.17 },
  { color: '#FFB8EC', x: 0.74, y: 0.58, r: 0.3, dx: 0.04, dy: 0.06, speed: 0.23 },
  { color: '#FFF3A6', x: 0.9, y: 0.12, r: 0.22, dx: 0.03, dy: 0.04, speed: 0.19 },
]
const blobAt = (blob: (typeof blobs)[number], frame: number) => {
  const t = frame / FPS
  return { x: blob.x + Math.sin(t * blob.speed * 2 + blob.x * 9) * blob.dx, y: blob.y + Math.cos(t * blob.speed * 2 + blob.y * 7) * blob.dy }
}

const RAMP = ' .:-=+*#%@'
function CharacterGrid({ opacity }: { opacity: number }) {
  const frame = useCurrentFrame()
  const { W, H } = useLayout()
  const ref = useRef<HTMLCanvasElement>(null)
  useLayoutEffect(() => {
    const canvas = ref.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return
    context.clearRect(0, 0, W, H)
    if (opacity <= 0) return
    context.font = '500 13px Menlo, monospace'
    context.textBaseline = 'top'
    context.fillStyle = 'rgba(58, 92, 74, 0.34)'
    const places = blobs.map((blob) => ({ ...blobAt(blob, frame), r: blob.r }))
    const rows = Math.ceil(H / 21.6), columns = Math.ceil(W / 16)
    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < columns; column++) {
        const u = column / columns, v = row / rows
        let field = 0
        for (const p of places) field += Math.exp(-((u - p.x) ** 2 + ((v - p.y) * (H / W)) ** 2) / (2 * (p.r * 0.5) ** 2))
        const edge = Math.max(0, 1 - Math.min(v, 1 - v) * 4.5) * 0.55
        const shimmer = Math.sin(column * 0.9 + row * 1.7 + frame * 0.05) * 0.06
        const value = Math.min(0.999, Math.max(0, field * 0.55 + edge + shimmer - 0.08))
        const glyph = RAMP[Math.floor(value * RAMP.length)]
        if (glyph !== ' ') context.fillText(glyph, column * 16 + 4, row * 21.6 + 3)
      }
    }
  }, [frame, opacity, W, H])
  return <canvas ref={ref} width={W} height={H} style={{ position: 'absolute', inset: 0, opacity }} />
}

export function Background({ always = false }: { always?: boolean }) {
  const frame = useCurrentFrame()
  const { W, H } = useLayout()
  const show = always ? 1 : ramp(frame, beat(7.6), beat(9.4), inOut)
  return <AbsoluteFill style={{ background: '#F7F7F5' }}>
    <AbsoluteFill style={{ opacity: show }}>
      {blobs.map((blob) => {
        const p = blobAt(blob, frame)
        const size = blob.r * Math.max(W, H)
        return <div key={blob.color} style={{ position: 'absolute', left: p.x * W - size / 2, top: p.y * H - size / 2, width: size, height: size, borderRadius: '50%', background: blob.color, filter: 'blur(110px)', opacity: 0.85 }} />
      })}
    </AbsoluteFill>
    <CharacterGrid opacity={show * 0.75} />
  </AbsoluteFill>
}

// ——— Burn: a noise threshold eats the element, with a glowing ember edge ———

function BurnFilter({ id, progress, seed }: { id: string; progress: number; seed: number }) {
  // fractalNoise sits roughly in 0.25–0.75; sweep the threshold across it.
  const p = 0.22 + progress * 0.62
  const keep = `0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  60 0 0 0 ${-60 * p}`
  const edge = `0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  60 0 0 0 ${-60 * (p - 0.05)}`
  return <filter id={id} x="-10%" y="-30%" width="120%" height="160%">
    <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="3" seed={seed} result="noise" />
    <feColorMatrix in="noise" type="matrix" values={keep} result="keep" />
    <feColorMatrix in="noise" type="matrix" values={edge} result="wide" />
    <feComposite in="SourceGraphic" in2="keep" operator="in" result="kept" />
    <feComposite in="wide" in2="keep" operator="out" result="band" />
    <feComposite in="band" in2="SourceAlpha" operator="in" result="rim" />
    <feFlood floodColor="#FF8A3D" result="fire" />
    <feComposite in="fire" in2="rim" operator="in" result="ember" />
    <feGaussianBlur in="ember" stdDeviation="2.5" result="glow" />
    <feMerge><feMergeNode in="glow" /><feMergeNode in="ember" /><feMergeNode in="kept" /></feMerge>
  </filter>
}

function Burning({ id, start, seed, children, style }: { id: string; start: number; seed: number; children: ReactNode; style?: CSSProperties }) {
  const frame = useCurrentFrame()
  const progress = ramp(frame, start, start + 0.75, Easing.in(Easing.quad))
  if (progress >= 1) return null
  return <div style={style}>
    {progress > 0 && <svg width="0" height="0" style={{ position: 'absolute' }}><BurnFilter id={id} progress={progress} seed={seed} /></svg>}
    <div style={{ filter: progress > 0 ? `url(#${id})` : undefined }}>{children}</div>
  </div>
}

// ——— Words ———

type Word = { text: string; at: number; color?: string; highlight?: boolean }
function Line({ words, size, out, style }: { words: Word[]; size: number; out?: number; style?: CSSProperties }) {
  const frame = useCurrentFrame()
  // Consecutive highlighted words share one highlighter stroke, swiped in behind them.
  const groups: Word[][] = []
  for (const word of words) {
    const last = groups[groups.length - 1]
    if (last && word.highlight && last[0].highlight) last.push(word)
    else groups.push([word])
  }
  const gap = size * 0.24
  return <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: `0 ${gap}px`, fontFamily: font, fontWeight: 600, fontSize: size, lineHeight: 1.08, letterSpacing: '-0.035em', color: INK, ...style }}>
    {groups.map((group, g) => {
      const swipe = ramp(frame, group[0].at + 0.2, group[group.length - 1].at + 0.75, inOut)
      return <span key={g} style={{ position: 'relative', display: 'inline-flex', gap }}>
        {group[0].highlight && <span style={{ position: 'absolute', left: -size * 0.08, right: -size * 0.14, top: '20%', bottom: '2%', background: '#B8F7C4', borderRadius: size * 0.12, transformOrigin: 'left center', transform: `scaleX(${swipe})`, opacity: ramp(frame, group[0].at, group[0].at + 0.3) * (out === undefined ? 1 : 1 - ramp(frame, out, out + 0.35)) }} />}
        {group.map((word, i) => <span key={i} style={{ position: 'relative', display: 'inline-block', color: word.color ?? INK, ...focus(frame, word.at, out) }}>{word.text}</span>)}
      </span>
    })}
  </div>
}
const words = (text: string, start: number, step: number, extra: Partial<Word> = {}) =>
  text.split(' ').map((w, i) => ({ text: w, at: start + i * step, ...extra }))

// ——— Act one: the mess ———

const chips = [
  { tag: 'Freelancer', text: 'Gone quiet mid-project', bg: '#14136B', fg: '#A9A6FF', tagBg: 'rgba(255,255,255,.12)', square: '#6B66F5', at: beat(1.8) },
  { tag: 'Design agency', text: 'Designs only, no code', bg: '#21D3A2', fg: '#0B3D2E', tagBg: 'rgba(255,255,255,.35)', square: '#0E8C69', at: beat(2.8) },
  { tag: 'Dev shop', text: "Build doesn't match", bg: '#0F0F10', fg: '#E7FF5C', tagBg: 'rgba(255,255,255,.12)', square: '#C9E33C', at: beat(3.6) },
  { tag: 'Handoff', text: 'final_v12_REAL.fig', bg: '#2A2A2E', fg: '#B5A8FF', tagBg: 'rgba(255,255,255,.12)', square: '#7C6BF0', at: beat(4.4) },
  { tag: 'Timeline', text: '+6 weeks, again', bg: CORAL, fg: '#FFFFFF', tagBg: 'rgba(255,255,255,.25)', square: '#FFB199', at: beat(5.1) },
]

function Chip({ chip, index }: { chip: (typeof chips)[number]; index: number }) {
  const frame = useCurrentFrame()
  const [x, y, tilt] = useLayout().chips[index]
  const pop = ramp(frame, chip.at, chip.at + 0.5)
  const drift = (frame - at(chip.at)) * 0.05
  return <Burning id={`burn-chip-${index}`} start={beat(6.2) + index * 0.06} seed={index * 7 + 3} style={{ position: 'absolute', left: x, top: y - drift }}>
    <div style={{
      display: 'flex', alignItems: 'center', gap: 22, padding: '20px 34px 20px 22px', borderRadius: 18, background: chip.bg,
      boxShadow: '0 18px 40px rgba(0,0,0,.12)', fontFamily: font,
      opacity: pop, filter: `blur(${(1 - pop) * 14}px)`, transform: `rotate(${tilt}deg) scale(${0.82 + pop * 0.18}) translateY(${(1 - pop) * 30}px)`,
    }}>
      <div style={{ width: 62, height: 62, borderRadius: 14, background: chip.square, filter: 'blur(5px)' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <span style={{ alignSelf: 'flex-start', padding: '3px 12px', borderRadius: 99, background: chip.tagBg, color: chip.fg, fontSize: 19, fontWeight: 500, opacity: 0.85 }}>{chip.tag}</span>
        <span style={{ color: chip.fg, fontSize: 34, fontWeight: 600, letterSpacing: '-0.02em' }}>{chip.text}</span>
      </div>
    </div>
  </Burning>
}

function ActOne() {
  const frame = useCurrentFrame()
  const { headline } = useLayout()
  if (frame > at(beat(10))) return null
  return <AbsoluteFill>
    {chips.map((chip, index) => <Chip key={chip.tag} chip={chip} index={index} />)}
    <Burning id="burn-headline" start={beat(6.4)} seed={11} style={{ position: 'absolute', left: 0, right: 0, top: headline.top }}>
      <Line size={headline.size} words={[...words('Building a product is', beat(0.6), 0.16), { text: 'getting', at: beat(2.6) }, { text: 'messy', at: beat(3.6), color: CORAL }]} style={{ maxWidth: headline.max, margin: '0 auto' }} />
    </Burning>
    <Burning id="burn-second" start={beat(8.6)} seed={5} style={{ position: 'absolute', left: 0, right: 0, top: headline.second }}>
      <Line size={headline.size} words={[...words("Great products shouldn't be", beat(7.2), 0.1), { text: 'this', at: beat(7.9), color: CORAL }, { text: 'hard', at: beat(8.05), color: CORAL }]} style={{ maxWidth: headline.max, margin: '0 auto' }} />
    </Burning>
  </AbsoluteFill>
}

// ——— Act two: the steps, all on one glossy sphere ———

/** The inflated 3D Femoskeydev mark, centred on (x, y) and 2r wide; `ghost` is a flat trail copy. */
function Sphere({ x, y, r, opacity = 1, scale = 1, ghost = false, turn = 0 }: { x: number; y: number; r: number; opacity?: number; scale?: number; ghost?: boolean; turn?: number }) {
  const frame = useCurrentFrame()
  if (ghost) return <svg viewBox="0 0 32 32" style={{ position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, opacity }}><path d={MARK} fill="rgba(80,200,120,.35)" /></svg>
  // A slow idle sway keeps the mark alive between moves.
  const sway = Math.sin(frame / FPS * 1.4) * 6
  return <Mark3D variant="inflated" size={r * 2} rotateY={-18 + sway + turn} rotateX={10} style={{ position: 'absolute', left: x - r, top: y - r, opacity, transform: `scale(${scale})` }} />
}

function Cursor({ x, y, color, label, opacity }: { x: number; y: number; color: string; label?: string; opacity: number }) {
  return <div style={{ position: 'absolute', left: x, top: y, opacity }}>
    <svg width="30" height="34" viewBox="0 0 30 34"><path d="M2 2 L2 28 L9 21 L14 32 L19 30 L14 19 L24 19 Z" fill={label ? color : INK} stroke="#fff" strokeWidth="2.4" strokeLinejoin="round" /></svg>
    {label && <span style={{ position: 'absolute', left: 22, top: 30, padding: '4px 12px', borderRadius: 8, background: color, color: '#fff', fontFamily: font, fontSize: 20, fontWeight: 600 }}>{label}</span>}
  </div>
}

const steps = [
  { word: 'Discover', start: beat(10) },
  { word: 'Design', start: beat(12) },
  { word: 'Prototype', start: beat(14) },
  { word: 'Collaborate', start: beat(16) },
  { word: 'Ship', start: beat(18) },
]
const STEPS_END = beat(22)

function StepWord() {
  const frame = useCurrentFrame()
  const { step: place } = useLayout()
  return <>{steps.map((step, i) => {
    const end = steps[i + 1]?.start ?? STEPS_END
    if (frame < at(step.start) - 2 || frame > at(end) + 30) return null
    return <div key={step.word} style={{ position: 'absolute', left: place.left, right: place.left ? undefined : 0, textAlign: place.left ? 'left' : 'center', top: place.top, fontFamily: font, fontWeight: 600, fontSize: place.size, letterSpacing: '-0.04em', color: INK, ...focus(frame, step.start, end - 0.18) }}>{step.word}</div>
  })}</>
}

/** A point along the mark's outline, measured with a real SVG path (the render runs in Chrome). */
const outline = typeof document === 'undefined' ? null : (() => {
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  path.setAttribute('d', MARK)
  return { path, length: path.getTotalLength() }
})()

function Discover() {
  const frame = useCurrentFrame()
  const { sphere: SPHERE, W, H } = useLayout()
  const start = beat(10), end = beat(12)
  if (frame < at(start) || frame > at(end) + 20) return null
  const draw = ramp(frame, start + 0.1, start + 1.05, inOut)
  const fill = ramp(frame, start + 0.95, start + 1.3, inOut)
  const fade = ramp(frame, end - 0.05, end + 0.25)
  const k = (SPHERE.r * 2) / 32
  const left = SPHERE.x - SPHERE.r, top = SPHERE.y - SPHERE.r
  const point = (t: number) => {
    if (!outline) return { x: 0, y: 0 }
    const p = outline.path.getPointAtLength(Math.min(outline.length, Math.max(0, t)) * 1)
    return { x: left + p.x * k, y: top + p.y * k }
  }
  const length = outline?.length ?? 1
  const head = point(draw * length)
  const ahead = point(draw * length + 0.6), behind = point(draw * length - 0.6)
  const dx = ahead.x - behind.x, dy = ahead.y - behind.y, d = Math.hypot(dx, dy) || 1
  const tangent = { x: dx / d, y: dy / d }
  return <div style={{ position: 'absolute', inset: 0, opacity: (1 - fade) * ramp(frame, start, start + 0.2) }}>
    <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
      <defs><linearGradient id="ring" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#2BB673" /><stop offset="1" stopColor="#FF6FD8" /></linearGradient></defs>
      <path d={MARK} transform={`translate(${left} ${top}) scale(${k})`} fill="#B8F7C4" fillOpacity={fill * 0.55} stroke="url(#ring)" strokeWidth={6 / k} strokeLinejoin="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - draw} />
      {draw < 1 && <g opacity={1 - ramp(frame, start + 0.95, start + 1.1)}>
        <line x1={head.x - tangent.x * 70} y1={head.y - tangent.y * 70} x2={head.x + tangent.x * 70} y2={head.y + tangent.y * 70} stroke="#9AA39D" strokeWidth="2" />
        {[-70, 0, 70].map((o) => <rect key={o} x={head.x + tangent.x * o - 7} y={head.y + tangent.y * o - 7} width="14" height="14" rx="3" fill="#fff" stroke="#7B857E" strokeWidth="2" />)}
      </g>}
    </svg>
    {draw < 1 && <Cursor x={head.x + 6} y={head.y + 4} color={INK} opacity={1} />}
  </div>
}

/** Where the sphere is: it flies in along an arc for Design, rises for Prototype, and leaves before Ship. */
function spherePlace(frame: number, SPHERE: typeof wide.sphere, flyFrom: typeof wide.flyFrom) {
  const fly = ramp(frame, beat(12) + 0.05, beat(12) + 0.75, Easing.bezier(0.3, 0.7, 0.2, 1))
  const lift = ramp(frame, beat(14), beat(14) + 0.5)
  const sink = ramp(frame, beat(16), beat(16) + 0.5)
  const from = { x: SPHERE.x + flyFrom.dx, y: SPHERE.y + flyFrom.dy }
  const x = from.x + (SPHERE.x - from.x) * fly
  const y = from.y + (SPHERE.y - from.y) * fly - Math.sin(fly * Math.PI) * 120 - lift * 90 + sink * 90
  return { x, y, fly }
}

function DesignSphere() {
  const frame = useCurrentFrame()
  const { sphere: SPHERE, flyFrom, W, H } = useLayout()
  if (frame < at(beat(12)) || frame > at(beat(18)) + 30) return null
  const { x, y, fly } = spherePlace(frame, SPHERE, flyFrom)
  const exit = ramp(frame, beat(18) - 0.1, beat(18) + 0.3, inOut)
  const pop = fly < 1 ? 1 : 1 + Math.sin(ramp(frame, beat(12) + 0.75, beat(12) + 1.1) * Math.PI) * 0.05
  const ghosts = [0.12, 0.24, 0.36, 0.5].map((lag) => spherePlace(Math.max(at(beat(12)), frame - at(lag) * fly), SPHERE, flyFrom))
  const trail = ramp(frame, beat(12) + 0.6, beat(13) + 0.4)
  return <div style={{ position: 'absolute', inset: 0, opacity: 1 - exit, filter: `blur(${exit * 14}px)` }}>
    <svg width={W} height={H} style={{ position: 'absolute', inset: 0, opacity: (1 - trail) * 0.8 }}>
      <path d={`M${SPHERE.x + flyFrom.dx} ${SPHERE.y + flyFrom.dy} Q ${SPHERE.x + flyFrom.dx * 0.62} ${SPHERE.y - 40} ${SPHERE.x} ${SPHERE.y}`} fill="none" stroke="#6E8F7A" strokeWidth="3" strokeDasharray="2 12" strokeLinecap="round" />
    </svg>
    {fly > 0.05 && ghosts.map((g, i) => <Sphere key={i} x={g.x} y={g.y} r={SPHERE.r * (0.92 - i * 0.05)} ghost opacity={(1 - trail) * (0.32 - i * 0.06)} />)}
    <Sphere x={x} y={y} r={SPHERE.r} scale={pop} turn={(1 - fly) * -50} opacity={ramp(frame, beat(12), beat(12) + 0.2)} />
  </div>
}

function Prototype() {
  const frame = useCurrentFrame()
  const { sphere: SPHERE } = useLayout()
  const start = beat(14), end = beat(16)
  if (frame < at(start) || frame > at(end) + 30) return null
  const progress = ramp(frame, start + 0.4, end, Easing.linear)
  const bars = 34
  return <div style={{ position: 'absolute', left: SPHERE.x - 230, top: SPHERE.y + 140, width: 460, height: 76, borderRadius: 22, background: 'rgba(255,255,255,.9)', boxShadow: '0 18px 40px rgba(20,60,40,.12)', display: 'flex', alignItems: 'center', gap: 18, padding: '0 26px', ...focus(frame, start + 0.15, end - 0.15) }}>
    <div style={{ width: 40, height: 40, borderRadius: '50%', background: INK, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
      <svg width="16" height="16" viewBox="0 0 16 16"><path d="M4 2 L14 8 L4 14 Z" fill="#B8F7C4" /></svg>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, flex: 1, height: 44 }}>
      {Array.from({ length: bars }, (_, i) => {
        const h = 8 + Math.abs(Math.sin(i * 1.7) * 22 + Math.sin(i * 0.6 + frame * 0.18) * 10)
        const played = i / bars < progress
        return <span key={i} style={{ width: 5, height: h, borderRadius: 3, background: played ? CORAL : '#D9D9D9' }} />
      })}
    </div>
  </div>
}

function Collaborate() {
  const frame = useCurrentFrame()
  const { sphere: SPHERE, comment, W, H } = useLayout()
  const start = beat(16), end = beat(18)
  if (frame < at(start) || frame > at(end) + 30) return null
  const box = ramp(frame, start + 0.3, start + 0.7, inOut)
  const leave = ramp(frame, end - 0.15, end + 0.25, inOut)
  const femi = ramp(frame, start + 0.05, start + 0.55)
  const you = ramp(frame, start + 0.2, start + 0.75)
  const y = SPHERE.y
  const half = SPHERE.r + 26
  return <div style={{ position: 'absolute', inset: 0, opacity: 1 - leave, filter: `blur(${leave * 12}px)` }}>
    <svg width={W} height={H} style={{ position: 'absolute', inset: 0, opacity: box }}>
      <rect x={SPHERE.x - half} y={y - half} width={half * 2} height={half * 2} fill="none" stroke="#2BB673" strokeWidth="3" />
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sy]) => <rect key={`${sx}${sy}`} x={SPHERE.x + sx * half - 8} y={y + sy * half - 8} width="16" height="16" fill="#fff" stroke="#2BB673" strokeWidth="3" />)}
    </svg>
    <Cursor x={SPHERE.x - half - 80 + femi * 80} y={y - half - 60 + femi * 50} color={CORAL} label="Femi" opacity={femi} />
    <Cursor x={SPHERE.x + half + 60 - you * 60} y={y + half + 30 - you * 40} color="#1A9E8F" label="You" opacity={you} />
    <div style={{ position: 'absolute', ...comment(SPHERE.x, y, half), padding: '14px 22px', borderRadius: 18, background: '#fff', boxShadow: '0 16px 36px rgba(20,60,40,.14)', fontFamily: font, fontSize: 26, fontWeight: 500, color: INK, ...focus(frame, start + 0.7, undefined, 0.45) }}>
      love this flow ✦
    </div>
  </div>
}

const deliverables = [
  { name: 'iOS app', note: 'APP STORE', tint: '#EAF0FF', ink: '#3B5BDB', icon: 'M8 3h8a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm3 15h2' },
  { name: 'Android app', note: 'PLAY STORE', tint: '#E8FBEF', ink: '#1E9E58', icon: 'M8 3h8a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm1 15h6' },
  { name: 'Website', note: 'LIVE ON THE WEB', tint: '#FFF1E8', ink: '#E8590C', icon: 'M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18Zm-9 9h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18' },
  { name: 'Dashboard', note: 'ADMIN · OPS', tint: '#F3EDFF', ink: '#7048E8', icon: 'M4 4h7v7H4zM13 4h7v4h-7zM13 10h7v10h-7zM4 13h7v7H4z' },
  { name: 'Brand kit', note: 'LOGO · TYPE · COLOUR', tint: '#FFF9DB', ink: '#C99A06', icon: 'M12 3l2.6 5.6L20 9.3l-4 4 1 5.7-5-2.8-5 2.8 1-5.7-4-4 5.4-.7Z' },
  { name: 'Design system', note: 'FIGMA + CODE', tint: '#FFEDF8', ink: '#D6336C', icon: 'M5 5h6v6H5zM13 5h6v6h-6zM5 13h6v6H5zM16 13a3 3 0 1 1 0 6a3 3 0 0 1 0-6Z' },
  { name: 'Launch film', note: 'MOTION · SOUND', tint: '#E6FCF5', ink: '#0CA678', icon: 'M4 6h16v12H4zM10 9l5 3-5 3Z' },
  { name: 'Handover', note: 'DOCS · TRAINING', tint: '#F1F3F5', ink: '#495057', icon: 'M6 3h9l3 3v15H6zM9 10h6M9 14h6M9 18h4' },
]

function Ship() {
  const frame = useCurrentFrame()
  const { ship } = useLayout()
  const start = beat(18), end = STEPS_END
  if (frame < at(start) || frame > at(end) + 30) return null
  return <div style={{ position: 'absolute', left: ship.left, top: ship.top, display: 'grid', gridTemplateColumns: 'repeat(2, 370px)', gap: 18 }}>
    {deliverables.map((d, i) => <div key={d.name} style={{
      display: 'flex', alignItems: 'center', gap: 18, height: 112, padding: '0 22px', borderRadius: 20,
      background: `linear-gradient(120deg, #ffffff 0%, ${d.tint} 100%)`, boxShadow: '0 12px 30px rgba(20,60,40,.10), inset 0 0 0 1px rgba(255,255,255,.8)', fontFamily: font,
      ...focus(frame, start + 0.15 + i * 0.07, end - 0.2 + (i % 2) * 0.04),
    }}>
      <div style={{ width: 56, height: 56, borderRadius: 14, background: d.tint, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={d.ink} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round"><path d={d.icon} /></svg>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={{ fontSize: 32, fontWeight: 600, letterSpacing: '-0.02em', color: INK }}>{d.name}</span>
        <span style={{ fontFamily: 'Menlo, monospace', fontSize: 14, letterSpacing: '0.08em', color: d.ink }}>{d.note}</span>
      </div>
    </div>)}
  </div>
}

// ——— Act three: summary, promise, end card ———

const pills = [
  { text: 'discover', colors: [['#151515', '#fff'], ['#FF5A36', '#fff']] },
  { text: 'design', colors: [['#B8F7C4', INK], ['#151515', '#fff']] },
  { text: 'prototype', colors: [['#FFE066', INK], ['#B8F7C4', INK]] },
  { text: 'collaborate', colors: [['#FFD5BF', INK], ['#7048E8', '#fff']] },
  { text: 'ship', colors: [['#FFB8EC', INK], ['#FFE066', INK]] },
]

function Summary() {
  const frame = useCurrentFrame()
  const { summary } = useLayout()
  const start = beat(22), end = beat(26)
  if (frame < at(start) || frame > at(end) + 30) return null
  const leave = ramp(frame, end - 0.2, end + 0.2, inOut)
  const swap = frame > at(beat(24.5))
  return <div style={{ position: 'absolute', inset: 0, opacity: 1 - leave, filter: `blur(${leave * 14}px)` }}>
    <div style={{ position: 'absolute', top: summary.pills, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 12, fontFamily: font }}>
      {pills.map((pill, i) => {
        const open = ramp(frame, start + i * 0.12, start + i * 0.12 + 0.3, inOut)
        const [bg, fg] = pill.colors[swap ? 1 : 0]
        return <span key={pill.text} style={{ padding: '8px 18px', borderRadius: 10, background: bg, color: fg, fontSize: summary.pill, fontWeight: 600, clipPath: `inset(0 ${(1 - open) * 100}% 0 0)` }}>{pill.text}</span>
      })}
    </div>
    <Line size={summary.size} words={words('From first idea to launch,', start + 0.35, 0.09)} style={{ position: 'absolute', top: summary.first, left: 40, right: 40 }} />
    <Line size={summary.size} words={words('under one roof', start + 0.85, 0.1, { highlight: true })} style={{ position: 'absolute', top: summary.second, left: 40, right: 40 }} />
  </div>
}

function Pledge() {
  const frame = useCurrentFrame()
  const { pledge, W } = useLayout()
  const start = beat(26), end = beat(30)
  if (frame < at(start) || frame > at(end) + 30) return null
  const leave = ramp(frame, end - 0.15, end + 0.25, inOut)
  const pop = ramp(frame, start, start + 0.5, Easing.bezier(0.34, 1.56, 0.64, 1))
  return <div style={{ position: 'absolute', inset: 0, opacity: 1 - leave, filter: `blur(${leave * 14}px)` }}>
    <Sphere x={W / 2} y={pledge.mark} r={pledge.r} scale={pop} opacity={Math.min(1, pop * 2)} />
    <Line size={pledge.size} words={[...words('Your idea, made', start + 0.25, 0.1), { text: 'awesome', at: start + 0.6, highlight: true }]} style={{ position: 'absolute', top: pledge.line, left: 40, right: 40 }} />
    <div style={{ position: 'absolute', top: pledge.pill, left: 0, right: 0, display: 'flex', justifyContent: 'center', ...focus(frame, start + 1.0) }}>
      <IntroPill />
    </div>
  </div>
}

function IntroPill() {
  return <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '8px 8px 8px 22px', borderRadius: 99, background: '#fff', boxShadow: '0 12px 30px rgba(20,60,40,.12)', fontFamily: font, fontSize: 24, fontWeight: 500, color: INK }}>
    <span><span style={{ color: GREEN }}>✦</span> Free 30-minute intro call</span>
    <span style={{ padding: '10px 20px', borderRadius: 99, background: INK, color: '#fff', fontWeight: 600 }}>Book a call →</span>
  </div>
}

function EndCard() {
  const frame = useCurrentFrame()
  const { end, W } = useLayout()
  const start = beat(30)
  if (frame < at(start)) return null
  const pop = ramp(frame, start, start + 0.55, Easing.bezier(0.34, 1.56, 0.64, 1))
  const open = ramp(frame, start + 0.6, start + 1.3, inOut)
  const rise = ramp(frame, start + 1.25, start + 1.85, inOut)
  // The full logo is 220 × 32 units; the icon is the first 32.
  const width = end.logo, height = Math.round(end.logo * 32 / 220), icon = height
  const shown = icon + (width - icon) * open
  return <div style={{ position: 'absolute', inset: 0 }}>
    <div style={{ position: 'absolute', left: (W - shown) / 2, top: end.top - rise * 110, width: shown, height, overflow: 'hidden', transform: `scale(${0.6 + pop * 0.4})`, opacity: Math.min(1, pop * 2), filter: `blur(${(1 - pop) * 12}px)` }}>
      <Img src={staticFile('b/logo-white.svg')} style={{ width, height, filter: 'brightness(0)', display: 'block' }} />
    </div>
    <Line size={56} words={words("Let's build something awesome", start + 1.5, 0.07)} style={{ position: 'absolute', top: end.tag, left: 0, right: 0, fontWeight: 500 }} />
    <div style={{ position: 'absolute', top: end.cta, left: 0, right: 0, display: 'flex', justifyContent: 'center', ...focus(frame, start + 1.9) }}>
      <span style={{ padding: '22px 40px', borderRadius: 99, background: '#B8F7C4', color: INK, fontFamily: font, fontSize: 32, fontWeight: 600 }}>Book a call at cal.com/femoskeydev →</span>
    </div>
    <div style={{ position: 'absolute', top: end.pill, left: 0, right: 0, display: 'flex', justifyContent: 'center', transform: 'scale(.8)', ...focus(frame, start + 2.3) }}>
      <IntroPill />
    </div>
  </div>
}

export function HowWeWork() {
  useFonts()
  return <AbsoluteFill style={{ fontFamily: font, overflow: 'hidden' }}>
    <Background />
    <ActOne />
    <StepWord />
    <Discover />
    <DesignSphere />
    <Prototype />
    <Collaborate />
    <Ship />
    <Summary />
    <Pledge />
    <EndCard />
    <Audio src={staticFile('a/pop-track-03.mp3')} volume={(f) => interpolate(f, [0, 6, HOW_FRAMES - 90, HOW_FRAMES], [0, 1, 1, 0], clamp)} />
  </AbsoluteFill>
}
