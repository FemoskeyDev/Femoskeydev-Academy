import React, { useEffect, useState } from 'react'
import {
  AbsoluteFill, Audio, Img, OffthreadVideo, Easing, Sequence, continueRender, delayRender, interpolate, staticFile,
  useCurrentFrame, useVideoConfig,
} from 'remotion'

export const FPS = 60
const INK = '#151515'
const MINT = '#C8FDCE'
const CANVAS = '#FAFAFA'
const font = 'Tomato Grotesk, Helvetica, Arial, sans-serif'

// Apple-style motion: long, soft ease-outs with no overshoot.
const glide = Easing.bezier(0.16, 1, 0.3, 1)
const settle = Easing.bezier(0.33, 0, 0.15, 1)
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const
const lerp = (f: number, a: number, b: number, from: number, to: number, easing = glide) =>
  interpolate(f, [a, b], [from, to], { ...clamp, easing })

// "Pop Track 03" runs at 108.9 BPM with its first beat at 0.144s; the bass comes in on beat 8.
const BEAT = 0.551
const FIRST_BEAT = 0.144
const at = (beat: number) => (beat === 0 ? 0 : Math.round((FIRST_BEAT + beat * BEAT) * FPS))

/* ---------- building blocks ---------- */

function useFonts() {
  const [handle] = useState(() => delayRender('fonts'))
  useEffect(() => {
    const faces = [['Regular', 400], ['Medium', 500], ['SemiBold', 600]].map(([name, weight]) =>
      new FontFace('Tomato Grotesk', `url(${staticFile(`f/TomatoGrotesk-${name}.otf`)})`, { weight: String(weight) }))
    Promise.all(faces.map(face => face.load().then(loaded => document.fonts.add(loaded)))).then(() => continueRender(handle))
  }, [handle])
}

type Pose = { rx?: number; ry?: number; rz?: number; glare?: number }

/** iPhone 16 Pro in Natural Titanium: 71.5 × 149.6 × 8.25 mm, thin black borders, Dynamic Island, and real
 *  depth (stacked edge layers) so it reads as a solid object when it turns. Screens are 750 × 1624. */
function IPhone({ src, width, rx = 0, ry = 0, rz = 0, glare = 0.5 }: { src: string; width: number } & Pose) {
  const height = width * (149.6 / 71.5)
  const depth = width * (8.25 / 71.5)
  const radius = width * 0.165
  const rim = width * 0.011
  const border = width * 0.018
  const layers = 14
  const titanium = 'linear-gradient(135deg, #e6e3de 0%, #9b9792 22%, #f1efeb 48%, #85817b 74%, #d8d5cf 100%)'
  const button = (side: 'left' | 'right', top: number, length: number) => <div style={{
    position: 'absolute', [side]: -width * 0.009, top: height * top, width: width * 0.012, height: height * length,
    borderRadius: width * 0.01, background: 'linear-gradient(90deg, #77736e, #d9d6d1, #77736e)', transform: `translateZ(${-depth / 2}px)`,
  }} />
  return <div style={{ position: 'relative', width, height, transformStyle: 'preserve-3d', transform: `rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg)` }}>
    {Array.from({ length: layers }, (_, i) => <div key={i} style={{
      position: 'absolute', inset: 0, borderRadius: radius, transform: `translateZ(${-((i + 1) / layers) * depth}px)`,
      background: i === layers - 1 ? '#2b2a28' : `linear-gradient(90deg, #6f6b66, #c9c5bf 30%, #8d8984 60%, #bdb9b3)`,
    }} />)}
    {button('left', 0.155, 0.045)}
    {button('left', 0.235, 0.075)}
    {button('left', 0.325, 0.075)}
    {button('right', 0.27, 0.11)}
    {button('right', 0.6, 0.075)}
    <div style={{ position: 'absolute', inset: 0, borderRadius: radius, background: titanium, padding: rim, boxShadow: 'inset 0 0 1px rgba(0,0,0,.5)' }}>
      <div style={{ width: '100%', height: '100%', borderRadius: radius - rim, background: '#030303', padding: border }}>
        <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: radius - rim - border, overflow: 'hidden', background: '#fff' }}>
          <Img src={staticFile(src)} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
          <div style={{ position: 'absolute', top: width * 0.03, left: '50%', width: width * 0.3, height: width * 0.088, marginLeft: -width * 0.15, borderRadius: 99, background: '#000' }} />
          <div style={{
            position: 'absolute', inset: 0, mixBlendMode: 'screen',
            background: `linear-gradient(115deg, transparent ${glare * 100 - 30}%, rgba(255,255,255,.22) ${glare * 100 - 8}%, rgba(255,255,255,.05) ${glare * 100 + 4}%, transparent ${glare * 100 + 22}%)`,
          }} />
        </div>
      </div>
    </div>
  </div>
}

/** A phone placed on the stage, with a soft contact shadow beneath it. */
function Device({ src, width, x, y, pose, shadow = 0.35 }: { src: string; width: number; x: number; y: number; pose: Pose; shadow?: number }) {
  const height = width * (149.6 / 71.5)
  return <>
    <div style={{
      position: 'absolute', left: x - width * 0.55, top: y + height * 0.47, width: width * 1.1, height: width * 0.22, borderRadius: '50%',
      background: `rgba(0,0,0,${shadow})`, filter: `blur(${width * 0.09}px)`,
    }} />
    <div style={{ position: 'absolute', left: x - width / 2, top: y - height / 2, perspective: width * 7 }}>
      <IPhone src={src} width={width} {...pose} />
    </div>
  </>
}

/** Words that arrive the way Apple sets type: each one fades up out of a blur, a beat apart. */
function Words({ text, start = 0, stagger = 4, style }: { text: string; start?: number; stagger?: number; style?: React.CSSProperties }) {
  const frame = useCurrentFrame()
  return <div style={style}>
    {text.split(' ').map((word, i) => {
      const t = lerp(frame, start + i * stagger, start + i * stagger + 34, 0, 1)
      return <span key={i} style={{ display: 'inline-block', marginRight: '0.24em', opacity: t, filter: `blur(${(1 - t) * 16}px)`, transform: `translateY(${(1 - t) * 0.35}em)` }}>{word}</span>
    })}
  </div>
}

function Headline({ title, body, color = '#fff', start = 6 }: { title: string; body: string; color?: string; start?: number }) {
  return <div style={{ position: 'absolute', left: 200, top: 0, bottom: 0, width: 760, display: 'flex', flexDirection: 'column', justifyContent: 'center', fontFamily: font, color }}>
    <Words text={title} start={start} style={{ fontSize: 108, fontWeight: 500, lineHeight: 1.02, letterSpacing: -3.5 }} />
    <Words text={body} start={start + 22} stagger={2} style={{ fontSize: 34, lineHeight: 1.35, opacity: 0.72, marginTop: 34, maxWidth: 600 }} />
  </div>
}

/** Stock or film footage, trimmed, with a slow push-in. */
function Footage({ src, start = 0, from = 1.02, to = 1.1, origin = 'center' }: { src: string; start?: number; from?: number; to?: number; origin?: string }) {
  const frame = useCurrentFrame()
  const { durationInFrames } = useVideoConfig()
  const scale = interpolate(frame, [0, durationInFrames], [from, to], { ...clamp, easing: settle })
  return <AbsoluteFill style={{ background: INK, overflow: 'hidden' }}>
    <OffthreadVideo src={staticFile(src)} startFrom={Math.round(start * FPS)} muted
      style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${scale})`, transformOrigin: origin }} />
  </AbsoluteFill>
}

/* ---------- scenes ---------- */

/** The wordmark resolving out of a blur over mint. `out` holds it, then lets it go again so the loop closes on blank mint. */
function Logo({ out = false }: { out?: boolean }) {
  const frame = useCurrentFrame()
  const { durationInFrames } = useVideoConfig()
  const enter = lerp(frame, 10, 70, 0, 1)
  const leave = out ? lerp(frame, durationInFrames - 40, durationInFrames - 4, 0, 1, settle) : 0
  const t = enter * (1 - leave)
  const scale = 1.06 - enter * 0.06 + interpolate(frame, [0, durationInFrames], [0, 0.03])
  return <AbsoluteFill style={{ background: MINT, alignItems: 'center', justifyContent: 'center' }}>
    <Img src={staticFile('b/logo-white.svg')} style={{
      width: 900, filter: `brightness(0) blur(${(1 - t) * 24}px)`, opacity: t * 0.92, transform: `scale(${scale})`,
    }} />
  </AbsoluteFill>
}

/** Before the drop: a phone rises out of the dark, turned away, catching light along its edge. */
function Emerge({ src, glow }: { src: string; glow: string }) {
  const frame = useCurrentFrame()
  const { durationInFrames } = useVideoConfig()
  const t = interpolate(frame, [0, durationInFrames], [0, 1], { ...clamp, easing: settle })
  const light = lerp(frame, 0, durationInFrames, 0, 1, Easing.in(Easing.quad))
  return <AbsoluteFill style={{ background: `radial-gradient(60% 70% at 55% 60%, color-mix(in srgb, ${glow} ${Math.round(light * 55)}%, #020308), #020308)`, overflow: 'hidden' }}>
    <div style={{ opacity: lerp(frame, 0, 40, 0, 1) }}>
      <Device src={src} width={430} x={960} y={620 - t * 140} shadow={0.6} pose={{ rx: 22 - t * 12, ry: 48 - t * 26, rz: -10 + t * 6, glare: 0.2 + t * 0.6 }} />
    </div>
  </AbsoluteFill>
}

/** One phone beside a headline, gliding into place. */
function Hero({ bg, src, title, body, tilt = -14 }: { bg: string; src: string; title: string; body: string; tilt?: number }) {
  const frame = useCurrentFrame()
  const { durationInFrames } = useVideoConfig()
  const enter = lerp(frame, 0, 70, 0, 1)
  const drift = interpolate(frame, [0, durationInFrames], [0, 1])
  return <AbsoluteFill style={{ background: bg, overflow: 'hidden' }}>
    <Headline title={title} body={body} />
    <Device src={src} width={420} x={1360} y={560 + (1 - enter) * 260 - drift * 24} shadow={0.3}
      pose={{ rx: 6 + (1 - enter) * 14, ry: tilt + (1 - enter) * -22 + drift * 6, rz: 2 - drift * 2, glare: 0.25 + drift * 0.5 }} />
  </AbsoluteFill>
}

/** Two phones, one behind the other, sliding past each other in parallax. */
function Pair({ bg, front, back }: { bg: string; front: string; back: string }) {
  const frame = useCurrentFrame()
  const { durationInFrames } = useVideoConfig()
  const enter = lerp(frame, 0, 64, 0, 1)
  const drift = interpolate(frame, [0, durationInFrames], [0, 1])
  return <AbsoluteFill style={{ background: bg, overflow: 'hidden' }}>
    <div style={{ filter: 'blur(1.5px)', opacity: 0.95 }}>
      <Device src={back} width={360} x={760 + drift * 50 - (1 - enter) * 120} y={500 + (1 - enter) * 120} shadow={0.18}
        pose={{ rx: 8, ry: 24 - drift * 4, rz: -6, glare: 0.3 + drift * 0.3 }} />
    </div>
    <Device src={front} width={440} x={1150 - drift * 60 + (1 - enter) * 420} y={580} shadow={0.32}
      pose={{ rx: 6, ry: -20 + drift * 6 - (1 - enter) * 25, rz: 4, glare: 0.2 + drift * 0.6 }} />
  </AbsoluteFill>
}

/** Two phones side by side, turning open toward the viewer like a pair of doors. */
function Duo({ bg, left, right }: { bg: string; left: string; right: string }) {
  const frame = useCurrentFrame()
  const { durationInFrames } = useVideoConfig()
  const t = interpolate(frame, [0, durationInFrames], [0, 1], { ...clamp, easing: glide })
  const rise = lerp(frame, 0, 60, 1, 0)
  return <AbsoluteFill style={{ background: bg, overflow: 'hidden' }}>
    <Device src={left} width={400} x={700 + t * 40} y={560 + rise * 200} shadow={0.3} pose={{ rx: 6, ry: 46 - t * 30, rz: 0, glare: 0.2 + t * 0.5 }} />
    <Device src={right} width={400} x={1220 - t * 40} y={560 + rise * 260} shadow={0.3} pose={{ rx: 6, ry: -46 + t * 30, rz: 0, glare: 0.6 - t * 0.3 }} />
  </AbsoluteFill>
}

/** A large phone, tilted back, the camera drifting in over its screen. */
function Macro({ bg, src, title, body }: { bg: string; src: string; title: string; body: string }) {
  const frame = useCurrentFrame()
  const { durationInFrames } = useVideoConfig()
  const t = interpolate(frame, [0, durationInFrames], [0, 1], { ...clamp, easing: settle })
  const enter = lerp(frame, 0, 70, 0, 1)
  return <AbsoluteFill style={{ background: bg, overflow: 'hidden' }}>
    <Device src={src} width={640 + t * 60} x={1420 - t * 40} y={600 + (1 - enter) * 300} shadow={0.22}
      pose={{ rx: 38 - t * 8, ry: -8, rz: -24 + t * 6, glare: 0.2 + t * 0.6 }} />
    <Headline title={title} body={body} />
  </AbsoluteFill>
}

/** The studio's headline on canvas, with "then some." marked in mint as on the site. */
function Statement() {
  const frame = useCurrentFrame()
  const mark = lerp(frame, 60, 96, 0, 100)
  return <AbsoluteFill style={{ background: CANVAS, alignItems: 'center', justifyContent: 'center', fontFamily: font, color: INK, textAlign: 'center' }}>
    <Words text="We build and scale digital" start={4} style={{ fontSize: 122, fontWeight: 500, letterSpacing: -4, lineHeight: 1.08 }} />
    <div style={{ fontSize: 122, fontWeight: 500, letterSpacing: -4, lineHeight: 1.08, display: 'flex', justifyContent: 'center' }}>
      <Words text="products &" start={24} />
      <span style={{ position: 'relative', opacity: lerp(frame, 32, 66, 0, 1), filter: `blur(${lerp(frame, 32, 66, 16, 0)}px)` }}>
        <span style={{ position: 'absolute', inset: '8% -12px 2%', background: MINT, borderRadius: 14, clipPath: `inset(0 ${100 - mark}% 0 0)` }} />
        <span style={{ position: 'relative' }}>then some.</span>
      </span>
    </div>
  </AbsoluteFill>
}

/** A dashboard floating in perspective, drifting slowly across. */
function Dashboard({ src, bg, dir = 1 }: { src: string; bg: string; dir?: 1 | -1 }) {
  const frame = useCurrentFrame()
  const { durationInFrames } = useVideoConfig()
  const t = interpolate(frame, [0, durationInFrames], [0, 1], { ...clamp, easing: settle })
  return <AbsoluteFill style={{ background: bg, perspective: 2200, overflow: 'hidden' }}>
    <div style={{
      position: 'absolute', width: 1440, height: 900, left: '50%', top: '50%', borderRadius: 22, overflow: 'hidden', background: '#fff', boxShadow: '0 60px 140px rgba(30,20,60,.22)',
      transform: `translate(-50%, -50%) translateX(${dir * (140 - t * 200)}px) translateY(${50 - t * 60}px) rotateX(${20 - t * 6}deg) rotateY(${dir * (-16 + t * 6)}deg) scale(${0.98 + t * 0.06})`,
    }}>
      <Img src={staticFile(src)} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
    </div>
  </AbsoluteFill>
}

/* ---------- the edit, on the beat ---------- */

type Shot = { from: number; to: number; node: React.ReactNode; dissolve?: boolean }
const DISSOLVE = 14

const PAYMITA = 'linear-gradient(160deg, #2a5cf0 0%, #1D4ED7 45%, #0d2a8a 100%)'
const LIZIWARIDE = 'linear-gradient(160deg, #7461ec 0%, #5B44D9 45%, #3a27a8 100%)'
const SAVECIRCLE = 'linear-gradient(160deg, #a24cf2 0%, #8F2CEB 45%, #5a12a8 100%)'

const shots: Shot[] = [
  { from: 0, to: 4, node: <Logo /> },
  { from: 4, to: 8, node: <Emerge src="s/pm-home.jpg" glow="#1D4ED7" />, dissolve: true },
  // The drop
  { from: 8, to: 12, node: <Hero bg={PAYMITA} src="s/pm-home.jpg" title="Pay your bills in seconds." body="Airtime, data, power and TV, all from one wallet." /> },
  { from: 12, to: 16, node: <Pair bg={PAYMITA} front="s/pm-card-ready.jpg" back="s/pm-bills.jpg" /> },
  { from: 16, to: 18, node: <Footage src="v/pexels-7326361.mp4" start={6} />, dissolve: true },
  { from: 18, to: 22, node: <Macro bg={LIZIWARIDE} src="s/lz-home.png" title="Ride smarter across Africa." body="Ride hailing, smart buses and scheduled rides in one app." /> },
  { from: 22, to: 26, node: <Duo bg={LIZIWARIDE} left="s/lz-choose-ride.png" right="s/lz-driver-home.png" /> },
  { from: 26, to: 28, node: <Footage src="v/pexels-7884810.mp4" start={3} />, dissolve: true },
  { from: 28, to: 32, node: <Statement />, dissolve: true },
  { from: 32, to: 36, node: <Hero bg={SAVECIRCLE} src="s/sc-home-1.jpg" title="Save together, grow together." body="Group savings circles for friends, family and colleagues." tilt={-16} /> },
  { from: 36, to: 40, node: <Pair bg={SAVECIRCLE} front="s/sc-dash-1.jpg" back="s/sc-money-1.jpg" /> },
  { from: 40, to: 42, node: <Footage src="v/pexels-6612142.mp4" start={1.5} />, dissolve: true },
  { from: 42, to: 44, node: <Footage src="v/pexels-7450036.mp4" start={5} /> },
  { from: 44, to: 46, node: <Dashboard src="s/sc-dashboard.png" bg="#EEEAF7" />, dissolve: true },
  { from: 46, to: 48, node: <Dashboard src="s/lz-dashboard.png" bg="#ECEBF4" dir={-1} /> },
  { from: 48, to: 50, node: <Footage src="v/sc-film.mp4" start={7.6} from={1.02} to={1.12} />, dissolve: true },
  { from: 50, to: 52, node: <Footage src="v/lz-film.mp4" start={1} from={1.9} to={1.7} origin="74% 50%" /> },
  { from: 52, to: 54, node: <Footage src="v/pexels-8496455.mp4" start={2} />, dissolve: true },
  { from: 54, to: 56, node: <Footage src="v/pexels-7230113.mp4" start={4} /> },
  { from: 56, to: 62, node: <Logo out />, dissolve: true },
]

export const REEL_FRAMES = at(62)

/** Fades a shot in over the end of the one before it, out of a slight blur. */
function Dissolve({ children }: { children: React.ReactNode }) {
  const frame = useCurrentFrame()
  const t = lerp(frame, 0, DISSOLVE, 0, 1, settle)
  return <AbsoluteFill style={{ opacity: t, filter: t < 1 ? `blur(${(1 - t) * 12}px)` : undefined }}>{children}</AbsoluteFill>
}

export function Reel() {
  useFonts()
  return <AbsoluteFill style={{ background: INK }}>
    {shots.map(({ from, to, node, dissolve }, i) => {
      const start = at(from) - (dissolve ? DISSOLVE : 0)
      return <Sequence key={i} from={start} durationInFrames={at(to) - start} premountFor={30}>
        {dissolve ? <Dissolve>{node}</Dissolve> : node}
      </Sequence>
    })}
    <Audio src={staticFile('a/pop-track-03.mp3')}
      volume={f => interpolate(f, [0, 6, REEL_FRAMES - 150, REEL_FRAMES - 10], [0, 0.9, 0.9, 0], clamp)} />
  </AbsoluteFill>
}
