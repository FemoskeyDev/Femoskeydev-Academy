import type { CSSProperties } from 'react'

/** Any shape in the inflated style of the 3D Femoskeydev mark: stacked layers give it depth, and SVG lighting on the
 *  face's own alpha rounds every edge like a balloon. A piece is drawn on a 32-unit grid, filled or as a round stroke,
 *  and pieces can sit at different heights (an icon raised off its tile). */

export type Tone = 'green' | 'blue' | 'peach' | 'lilac' | 'white' | 'ink' | 'yellow'
const tones: Record<Tone, { stops: [string, string, string]; side: string; spec?: number }> = {
  green: { stops: ['#F2FFF4', '#A6F5B6', '#47C97A'], side: '#3DB06B' },
  blue: { stops: ['#F5F7FF', '#B9C9FF', '#5B7BF0'], side: '#4A68D8' },
  peach: { stops: ['#FFF6EF', '#FFC7A5', '#F08A55'], side: '#D9733F' },
  lilac: { stops: ['#FCFAFF', '#DACDF6', '#9B80E0'], side: '#8669CF' },
  white: { stops: ['#FFFFFF', '#F2F5F3', '#C6D1CA'], side: '#AAB6AE' },
  ink: { stops: ['#3A3A3A', '#1A1A1A', '#040404'], side: '#000000', spec: 0.5 },
  yellow: { stops: ['#FFFDF2', '#FFEC94', '#F2C64A'], side: '#D6A92E' },
}

export type Piece = { d: string; tone: Tone; stroke?: number; evenOdd?: boolean; lift?: number }

function Shape({ piece, fill }: { piece: Piece; fill: string }) {
  return piece.stroke
    ? <path d={piece.d} fill="none" stroke={fill} strokeWidth={piece.stroke} strokeLinecap="round" strokeLinejoin="round" />
    : <path d={piece.d} fill={fill} fillRule={piece.evenOdd ? 'evenodd' : 'nonzero'} stroke={fill} strokeWidth={0.6} strokeLinejoin="round" />
}

export function Inflated({ id, pieces, size, rotateX = 10, rotateY = -18, shadow = true, style }: { id: string; pieces: Piece[]; size: number; rotateX?: number; rotateY?: number; shadow?: boolean; style?: CSSProperties }) {
  const depth = Math.max(3, Math.round(size / 55))
  return <div style={{ position: 'relative', width: size, height: size, perspective: size * 4, ...style }}>
    {shadow && <div style={{ position: 'absolute', left: size * 0.14, right: size * 0.06, top: size * 1.0, height: size * 0.11, borderRadius: '50%', background: 'rgba(20,40,30,.26)', filter: `blur(${size * 0.04}px)` }} />}
    <div style={{ position: 'absolute', inset: 0, transformStyle: 'preserve-3d', transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)` }}>
      {pieces.map((piece, p) => {
        const tone = tones[piece.tone]
        const lift = (piece.lift ?? 0) * (size / 32)
        const key = `${id}-${p}`
        return <div key={key} style={{ position: 'absolute', inset: 0, transformStyle: 'preserve-3d', transform: `translateZ(${lift}px)` }}>
          {Array.from({ length: depth }, (_, i) => <svg key={i} viewBox="0 0 32 32" style={{ position: 'absolute', inset: 0, width: size, height: size, overflow: 'visible', transform: `translateZ(${-(i + 1) * (size / 320)}px)` }}>
            <g style={{ filter: `brightness(${1 - (i / depth) * 0.3})` }}><Shape piece={piece} fill={tone.side} /></g>
          </svg>)}
          <svg viewBox="0 0 320 320" style={{ position: 'absolute', inset: 0, width: size, height: size, overflow: 'visible' }}>
            <defs>
              <linearGradient id={`${key}-face`} x1="0.1" y1="0" x2="0.85" y2="1">
                <stop offset="0" stopColor={tone.stops[0]} /><stop offset={tone.spec ? 0.2 : 0.45} stopColor={tone.stops[1]} /><stop offset="1" stopColor={tone.stops[2]} />
              </linearGradient>
              <filter id={`${key}-light`} x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur in="SourceAlpha" stdDeviation={piece.stroke ? 12 : 21} result="bump" />
                <feSpecularLighting in="bump" surfaceScale={16} specularConstant={tone.spec ?? 1.4} specularExponent={tone.spec ? 26 : 12} lightingColor="#ffffff" result="spec">
                  <fePointLight x={-120} y={-220} z={260} />
                </feSpecularLighting>
                <feGaussianBlur in="spec" stdDeviation="1.6" result="specSoft" />
                <feComposite in="specSoft" in2="SourceAlpha" operator="in" result="shine" />
                <feDiffuseLighting in="bump" surfaceScale={16} diffuseConstant={1.05} lightingColor="#ffffff" result="shade">
                  <feDistantLight azimuth={225} elevation={52} />
                </feDiffuseLighting>
                <feGaussianBlur in="shade" stdDeviation="1.6" result="shadeSoft" />
                <feComposite in="SourceGraphic" in2="shadeSoft" operator="arithmetic" k1={1} result="lit" />
                <feComposite in="lit" in2="SourceAlpha" operator="in" result="litIn" />
                <feComposite in="shine" in2="litIn" operator="arithmetic" k2={1} k3={1} />
              </filter>
            </defs>
            {/* The filter sits outside the scale, so the lighting is worked out on the 320-unit face like the mark's. */}
            <g filter={`url(#${key}-light)`}><g transform="scale(10)"><Shape piece={piece} fill={`url(#${key}-face)`} /></g></g>
          </svg>
        </div>
      })}
    </div>
  </div>
}

// ——— The Academy set ———

const TILE = 'M6.5 0.5H25.5A6 6 0 0 1 31.5 6.5V25.5A6 6 0 0 1 25.5 31.5H6.5A6 6 0 0 1 0.5 25.5V6.5A6 6 0 0 1 6.5 0.5Z'
const ASTERISK = 'M16 7V25M7 16H25M9.6 9.6L22.4 22.4M22.4 9.6L9.6 22.4'
const SPARKLE = 'M16 1.5C16 10 9.5 16 1.5 16C9.5 16 16 22 16 30.5C16 22 22.5 16 30.5 16C22.5 16 16 10 16 1.5Z'
const MARK = 'M26.7767 0H5.22325C2.34326 0 0 2.34322 0 5.2232V31.9999H7.3497C11.6026 31.9999 15.0503 28.5521 15.0503 24.2993C15.0503 22.6373 14.5342 20.9754 13.4503 19.716C11.5097 17.4451 8.62969 16.0103 5.41938 16.0103C11.2619 16.0103 16 11.2722 16 5.42966C16 11.2722 20.738 16.0103 26.5806 16.0103C23.298 16.0103 20.3767 17.507 18.4361 19.8606C17.4451 21.058 16.9497 22.5754 16.9497 24.1238C16.9497 28.4799 20.48 32.0102 24.8361 32.0102H31.9999V5.2232C31.9999 2.33289 29.6567 0 26.7767 0Z'

export const academyArt = {
  'academy-icon': [{ d: TILE, tone: 'green' }, { d: ASTERISK, tone: 'white', stroke: 4.2, lift: 2.2 }],
  'femoskeydev-mark': [{ d: MARK, tone: 'green' }],
  interfaces: [{ d: 'M16 3.5A12.5 12.5 0 1 1 15.99 3.5M16 10A6 6 0 1 1 15.99 10', tone: 'blue', stroke: 4.4 }, { d: 'M16 13.2A2.8 2.8 0 1 1 15.99 13.2Z', tone: 'blue' }],
  pixels: [{ d: ASTERISK.replace(/7V25/, '4V28').replace('M7 16H25', 'M4 16H28').replace('M9.6 9.6L22.4 22.4', 'M7.5 7.5L24.5 24.5').replace('M22.4 9.6L9.6 22.4', 'M24.5 7.5L7.5 24.5'), tone: 'green', stroke: 5.2 }],
  codes: [{ d: 'M10.5 8.5L3.5 16L10.5 23.5M21.5 8.5L28.5 16L21.5 23.5M18.6 5.5L13.4 26.5', tone: 'peach', stroke: 4.4 }],
  'no-code': [{ d: 'M7 25L24.5 7.5M10.5 7H25V21.5', tone: 'lilac', stroke: 5 }],
  cursor: [{ d: 'M7 3.5L7 26.5L13.2 20.6L17.6 29.4L22 27.3L17.6 18.6L26 18.6Z', tone: 'ink' }],
  mentorship: [{ d: 'M6.5 5H25.5A4.5 4.5 0 0 1 30 9.5V19.5A4.5 4.5 0 0 1 25.5 24H15.5L8.5 29.5V24H6.5A4.5 4.5 0 0 1 2 19.5V9.5A4.5 4.5 0 0 1 6.5 5Z', tone: 'yellow' }, { d: 'M10 14.5H10.1M16 14.5H16.1M22 14.5H22.1', tone: 'ink', stroke: 3.4, lift: 1.4 }],
  cap: [{ d: 'M16 5L31 12L16 19L1 12Z', tone: 'ink' }, { d: 'M7.5 15.5V22C7.5 25.5 24.5 25.5 24.5 22V15.5L16 19.5Z', tone: 'ink' }, { d: 'M27 12.6V21', tone: 'yellow', stroke: 1.8, lift: 0.6 }],
  sparkle: [{ d: SPARKLE, tone: 'green' }],
} satisfies Record<string, Piece[]>
export type AcademyArt = keyof typeof academyArt
