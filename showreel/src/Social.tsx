import { AbsoluteFill, Img, staticFile } from 'remotion'
import { Hero, INK, LIZIWARIDE, MINT, PAYMITA, SAVECIRCLE, font, useFonts } from './Reel'

/** Link-preview images (1200 × 630 once resized), drawn at 1920 × 1008 from the same scenes as the reel. Every one
 *  carries the Femoskeydev wordmark. Rendered as stills with `npm run social`. */
export type SocialVariant = 'studio' | 'paymita' | 'liziwaride' | 'savecircle'

const projects = {
  paymita: { bg: PAYMITA, src: 's/pm-home.jpg', title: 'Pay your bills in seconds.', body: 'Airtime, data, power and TV, all from one wallet.' },
  liziwaride: { bg: LIZIWARIDE, src: 's/lz-home.png', title: 'Ride smarter across Africa.', body: 'Ride hailing, smart buses and scheduled rides in one app.' },
  savecircle: { bg: SAVECIRCLE, src: 's/sc-home-1.jpg', title: 'Save together, grow together.', body: 'Group savings circles for friends, family and colleagues.' },
}

export function Social({ variant }: { variant: SocialVariant }) {
  useFonts()
  if (variant === 'studio') return <AbsoluteFill style={{ background: MINT, alignItems: 'center', justifyContent: 'center', gap: 64, fontFamily: font, color: INK }}>
    <Img src={staticFile('b/logo-white.svg')} style={{ width: 1080, filter: 'brightness(0)', opacity: 0.92 }} />
    <div style={{ fontSize: 58, fontWeight: 500, letterSpacing: -1.5 }}>We build and scale digital products &amp; then some.</div>
  </AbsoluteFill>
  const project = projects[variant]
  return <AbsoluteFill>
    <Hero {...project} />
    <Img src={staticFile('b/logo-white.svg')} style={{ position: 'absolute', left: 200, top: 96, width: 380 }} />
  </AbsoluteFill>
}
