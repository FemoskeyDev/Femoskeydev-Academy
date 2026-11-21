import React, { useEffect, useState } from 'react'
import {
  AbsoluteFill, Img, OffthreadVideo, Easing, Series, continueRender, delayRender, interpolate, spring, staticFile,
  useCurrentFrame, useVideoConfig,
} from 'remotion'

const FPS = 30
const INK = '#151515'
const MINT = '#C8FDCE'
const CANVAS = '#FAFAFA'
const BLUE = '#1D4ED7'
const PURPLE_LZ = '#5B44D9'
const PURPLE_SC = '#8F2CEB'
const font = 'Tomato Grotesk, Helvetica, Arial, sans-serif'
const ease = Easing.bezier(0.22, 1, 0.36, 1)

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const
const lerp = (f: number, a: number, b: number, from: number, to: number, easing = ease) =>
  interpolate(f, [a, b], [from, to], { ...clamp, easing })

/* ---------- building blocks ---------- */

function useFonts() {
  const [handle] = useState(() => delayRender('fonts'))
  useEffect(() => {
    const faces = [['Regular', 400], ['Medium', 500], ['SemiBold', 600]].map(([name, weight]) =>
      new FontFace('Tomato Grotesk', `url(${staticFile(`f/TomatoGrotesk-${name}.otf`)})`, { weight: String(weight) }))
    Promise.all(faces.map(face => face.load().then(loaded => document.fonts.add(loaded)))).then(() => continueRender(handle))
  }, [handle])
}

/** A phone frame around a raw 750×1624 screen. */
function Phone({ src, width, style }: { src: string; width: number; style?: React.CSSProperties }) {
  const bezel = width * 0.035
  const radius = width * 0.15
  return <div style={{
    position: 'absolute', width, height: width * 2.165 + bezel * 2, borderRadius: radius, background: '#0c0c0c', padding: bezel,
    boxShadow: `0 ${width * 0.12}px ${width * 0.3}px rgba(0,0,0,.35), inset 0 0 0 ${width * 0.006}px #3a3a3a`, ...style,
  }}>
    <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: radius - bezel, overflow: 'hidden', background: '#fff' }}>
      <Img src={staticFile(src)} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
      <div style={{ position: 'absolute', top: width * 0.028, left: '50%', width: width * 0.3, height: width * 0.085, marginLeft: -width * 0.15, borderRadius: 99, background: '#000' }} />
    </div>
  </div>
}

/** Full-bleed image with a slow push-in (or pull-out). */
function Still({ src, from = 1.12, to = 1, position = 'center', bg = INK }: { src: string; from?: number; to?: number; position?: string; bg?: string }) {
  const frame = useCurrentFrame()
  const { durationInFrames } = useVideoConfig()
  const scale = interpolate(frame, [0, durationInFrames], [from, to], { ...clamp, easing: Easing.out(Easing.quad) })
  return <AbsoluteFill style={{ background: bg, overflow: 'hidden' }}>
    <Img src={staticFile(src)} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: position, transform: `scale(${scale})` }} />
  </AbsoluteFill>
}

/** Stock or film footage, trimmed, with a gentle push-in. */
function Footage({ src, start = 0, from = 1, to = 1.06, rate = 1, position = 'center', origin = 'center' }: { src: string; start?: number; from?: number; to?: number; rate?: number; position?: string; origin?: string }) {
  const frame = useCurrentFrame()
  const { durationInFrames } = useVideoConfig()
  const scale = interpolate(frame, [0, durationInFrames], [from, to], clamp)
  return <AbsoluteFill style={{ background: INK, overflow: 'hidden' }}>
    <OffthreadVideo src={staticFile(src)} startFrom={Math.round(start * FPS)} playbackRate={rate} muted
      style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: position, transform: `scale(${scale})`, transformOrigin: origin }} />
  </AbsoluteFill>
}

/** Project name chip, bottom left, in and out with the shot. */
function Tag({ name, kind, light = true }: { name: string; kind: string; light?: boolean }) {
  const frame = useCurrentFrame()
  const { durationInFrames } = useVideoConfig()
  const opacity = Math.min(lerp(frame, 4, 14, 0, 1), lerp(frame, durationInFrames - 6, durationInFrames, 1, 0))
  const y = lerp(frame, 4, 18, 18, 0)
  const color = light ? '#fff' : INK
  return <div style={{ position: 'absolute', left: 200, bottom: 84, opacity, transform: `translateY(${y}px)`, fontFamily: font, color, display: 'flex', gap: 18, alignItems: 'baseline' }}>
    <span style={{ fontSize: 40, fontWeight: 600, letterSpacing: -0.5 }}>{name}</span>
    <span style={{ fontSize: 26, opacity: 0.7 }}>{kind}</span>
  </div>
}

/* ---------- scenes ---------- */

/** The wordmark drawn on from the left over mint; reused at the end so the loop closes on itself. */
function Logo({ out = false }: { out?: boolean }) {
  const frame = useCurrentFrame()
  const { durationInFrames } = useVideoConfig()
  const reveal = out ? lerp(frame, 6, 30, 0, 100) : lerp(frame, 4, 26, 0, 100)
  const scale = out ? lerp(frame, 0, durationInFrames, 0.94, 1, Easing.out(Easing.quad)) : lerp(frame, 0, durationInFrames, 1, 1.06, Easing.in(Easing.quad))
  const tagline = lerp(frame, out ? 18 : 14, out ? 34 : 30, 0, 1)
  return <AbsoluteFill style={{ background: MINT, alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ transform: `scale(${scale})`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 34 }}>
      <Img src={staticFile('b/logo-white.svg')} style={{ width: 880, filter: 'brightness(0) saturate(100%)', opacity: 0.92, clipPath: `inset(0 ${100 - reveal}% 0 0)` }} />
      <div style={{ fontFamily: font, fontSize: 34, color: INK, opacity: tagline, transform: `translateY(${(1 - tagline) * 14}px)` }}>
        Product design &amp; development studio
      </div>
    </div>
  </AbsoluteFill>
}

/** Three phones rising onto a brand colour, the centre one larger, the group drifting up. */
function PhoneTrio({ bg, screens, name, kind }: { bg: string; screens: [string, string, string]; name: string; kind: string }) {
  const frame = useCurrentFrame()
  const { durationInFrames, fps } = useVideoConfig()
  const drift = interpolate(frame, [0, durationInFrames], [40, -40])
  const rise = (i: number) => spring({ frame: frame - i * 4, fps, config: { damping: 18, stiffness: 90, mass: 0.8 } })
  const layout = [
    { x: 960 - 560, w: 330, r: -8, y: 150 },
    { x: 960, w: 400, r: 0, y: 60 },
    { x: 960 + 560, w: 330, r: 8, y: 150 },
  ]
  return <AbsoluteFill style={{ background: `radial-gradient(120% 90% at 50% 20%, ${bg}, color-mix(in srgb, ${bg} 70%, #000))`, overflow: 'hidden' }}>
    {layout.map((p, i) => {
      const t = rise([1, 0, 2][i])
      return <Phone key={i} src={screens[i]} width={p.w} style={{
        left: p.x - p.w / 2, top: p.y + drift * (i === 1 ? 1 : 1.4),
        transform: `translateY(${(1 - t) * 900}px) rotate(${p.r * t}deg)`,
      }} />
    })}
    <Tag name={name} kind={kind} />
  </AbsoluteFill>
}

/** Phones gliding sideways in a row, like a carousel. */
function PhoneRow({ bg, screens, name, kind, direction = 1 }: { bg: string; screens: string[]; name: string; kind: string; direction?: 1 | -1 }) {
  const frame = useCurrentFrame()
  const { durationInFrames } = useVideoConfig()
  const w = 360
  const gap = 90
  const total = screens.length * (w + gap)
  const shift = interpolate(frame, [0, durationInFrames], [0, -420], { easing: Easing.out(Easing.quad) }) * direction
  const enter = lerp(frame, 0, 16, 1, 0)
  return <AbsoluteFill style={{ background: bg, overflow: 'hidden' }}>
    {screens.map((src, i) => <Phone key={i} src={src} width={w} style={{
      left: 960 - total / 2 + i * (w + gap) + gap / 2 + 210 * direction + shift + enter * 600 * direction,
      top: 540 - (w * 2.165) / 2 + (i % 2 ? 70 : -30),
      transform: `rotate(${i % 2 ? 2 : -2}deg)`,
    }} />)}
    <Tag name={name} kind={kind} />
  </AbsoluteFill>
}

/** Two columns of screens scrolling past each other, one up and one down. */
function PhoneColumns({ bg, left, right, name, kind }: { bg: string; left: string[]; right: string[]; name: string; kind: string }) {
  const frame = useCurrentFrame()
  const { durationInFrames } = useVideoConfig()
  const w = 380
  const step = w * 2.24 + 60
  const travel = interpolate(frame, [0, durationInFrames], [0, step * 0.9], { easing: Easing.inOut(Easing.quad) })
  const column = (srcs: string[], x: number, dir: 1 | -1, offset: number) => srcs.map((src, i) =>
    <Phone key={src + i} src={src} width={w} style={{ left: x, top: offset + i * step + dir * travel - (dir > 0 ? step : 0) }} />)
  return <AbsoluteFill style={{ background: `linear-gradient(160deg, ${bg}, color-mix(in srgb, ${bg} 75%, #000))`, overflow: 'hidden', transform: 'rotate(-6deg) scale(1.12)' }}>
    {column(left, 960 - w - 60, 1, -260)}
    {column(right, 960 + 60, -1, 80)}
    <div style={{ transform: 'rotate(6deg)' }}><Tag name={name} kind={kind} /></div>
  </AbsoluteFill>
}

/** The studio's headline, word by word, with "then some." marked in mint as on the site. */
function TypeCard() {
  const frame = useCurrentFrame()
  const { fps, durationInFrames } = useVideoConfig()
  const lines = [['We', 'build', 'and', 'scale', 'digital'], ['products', '&', 'then some.']]
  let index = 0
  const exit = lerp(frame, durationInFrames - 8, durationInFrames, 0, 1, Easing.in(Easing.cubic))
  return <AbsoluteFill style={{ background: CANVAS, alignItems: 'center', justifyContent: 'center', fontFamily: font, color: INK }}>
    <div style={{ fontSize: 118, fontWeight: 500, lineHeight: 1.08, letterSpacing: -3, textAlign: 'center', transform: `translateY(${-exit * 60}px)`, opacity: 1 - exit }}>
      {lines.map((words, l) => <div key={l} style={{ overflow: 'hidden', paddingBottom: 10 }}>
        {words.map(word => {
          const t = spring({ frame: frame - 3 - index++ * 2.5, fps, config: { damping: 20, stiffness: 120 } })
          const marked = word === 'then some.'
          const mark = marked ? lerp(frame, 30, 44, 0, 100) : 0
          return <span key={word} style={{
            display: 'inline-block', margin: '0 14px', transform: `translateY(${(1 - t) * 130}%)`,
            background: marked ? `linear-gradient(${MINT}, ${MINT}) left / ${mark}% 100% no-repeat` : undefined,
            padding: marked ? '0 14px' : undefined, borderRadius: 12,
          }}>{word}</span>
        })}
      </div>)}
    </div>
  </AbsoluteFill>
}

/** A dashboard tilted in perspective, sweeping across. */
function DashSweep({ src, bg, name, kind, dir = 1 }: { src: string; bg: string; name: string; kind: string; dir?: 1 | -1 }) {
  const frame = useCurrentFrame()
  const { durationInFrames } = useVideoConfig()
  const t = interpolate(frame, [0, durationInFrames], [0, 1], { easing: Easing.out(Easing.quad) })
  return <AbsoluteFill style={{ background: bg, perspective: 1800, overflow: 'hidden' }}>
    <Img src={staticFile(src)} style={{
      position: 'absolute', width: 1900, left: '50%', top: '50%', borderRadius: 22, boxShadow: '0 60px 140px rgba(0,0,0,.28)',
      transform: `translate(-50%, -50%) translateX(${dir * (240 - t * 380)}px) translateY(${60 - t * 90}px) rotateX(24deg) rotateY(${dir * -18}deg) rotateZ(${dir * 6}deg) scale(${1.05 + t * 0.12})`,
    }} />
    <Tag name={name} kind={kind} light={false} />
  </AbsoluteFill>
}

/** A brand mark on its colour, settling from slightly large. */
function BrandTile({ src, bg, width }: { src: string; bg: string; width: number }) {
  const frame = useCurrentFrame()
  const { durationInFrames } = useVideoConfig()
  const scale = interpolate(frame, [0, durationInFrames], [1.16, 1.02], { ...clamp, easing: Easing.out(Easing.quad) })
  return <AbsoluteFill style={{ background: bg, alignItems: 'center', justifyContent: 'center' }}>
    <Img src={staticFile(src)} style={{ width, transform: `scale(${scale})` }} />
  </AbsoluteFill>
}

/** Quick brand-tile cuts, each scaling down into place. */
function Flash({ src }: { src: string }) {
  return <Still src={src} from={1.18} to={1.04} />
}

/* ---------- the edit ---------- */

const shots: [number, React.ReactNode][] = [
  [42, <Logo />],
  // Paymita
  [44, <PhoneTrio bg={BLUE} screens={['s/pm-onb-1.jpg', 's/pm-home.jpg', 's/pm-bills.jpg']} name="Paymita" kind="Payments app" />],
  [40, <Footage src="v/pm-walk.mp4" start={11.4} from={1.1} to={1.02} />],
  [22, <Flash src="b/pm-logo.webp" />],
  // People
  [30, <Footage src="v/pexels-7326361.mp4" start={6} />],
  // Liziwaride
  [34, <Still src="b/lz-hero.webp" from={1.15} to={1.0} />],
  [44, <PhoneRow bg={PURPLE_LZ} screens={['s/lz-onboarding-1.png', 's/lz-home.png', 's/lz-choose-ride.png', 's/lz-driver-home.png']} name="Liziwaride" kind="Ride hailing" />],
  [22, <BrandTile src="b/lz-logo.svg" bg={PURPLE_LZ} width={1000} />],
  [30, <Footage src="v/pexels-7884810.mp4" start={3} />],
  // Type
  [58, <TypeCard />],
  // SaveCircle
  [9, <Flash src="s/sc-lg-band-green.jpg" />],
  [9, <Flash src="s/sc-lg-half-dark.jpg" />],
  [12, <Flash src="b/sc-logo.webp" />],
  [30, <Still src="s/sc-feature.jpg" from={1.2} to={1.02} bg="#fff" />],
  [50, <PhoneColumns bg={PURPLE_SC} left={['s/sc-home-1.jpg', 's/sc-dash-1.jpg', 's/sc-money-1.jpg']} right={['s/sc-onb-1.jpg', 's/sc-circle-home.jpg', 's/sc-home-1.jpg']} name="SaveCircle" kind="Group savings" />],
  [27, <Footage src="v/pexels-6612142.mp4" start={1.5} />],
  [30, <Footage src="v/pexels-7450036.mp4" start={5} />],
  // Dashboards
  [32, <DashSweep src="s/sc-dashboard.png" bg="#EDE9F7" name="SaveCircle" kind="Admin" />],
  [32, <DashSweep src="s/lz-dashboard.png" bg="#ECEAF5" name="Liziwaride" kind="Operations" dir={-1} />],
  [36, <Footage src="v/sc-film.mp4" start={7.6} from={1.02} to={1.1} />],
  [34, <Footage src="v/lz-film.mp4" start={1} from={1.9} to={1.65} origin="74% 50%" />],
  [30, <Footage src="v/pexels-8496455.mp4" start={2} />],
  [27, <Footage src="v/pexels-7230113.mp4" start={4} />],
  [48, <Logo out />],
]

export const REEL_FRAMES = shots.reduce((sum, [frames]) => sum + frames, 0)

export function Reel() {
  useFonts()
  return <AbsoluteFill style={{ background: INK }}>
    <Series>
      {shots.map(([frames, node], i) => <Series.Sequence key={i} durationInFrames={frames}>{node}</Series.Sequence>)}
    </Series>
  </AbsoluteFill>
}
