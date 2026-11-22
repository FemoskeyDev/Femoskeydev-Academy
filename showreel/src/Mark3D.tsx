import type { CSSProperties } from 'react'

/** The Femoskeydev mark as a 3D object, built from stacked layers (the depth) under a lit front face.
 *  The front face is shaded with SVG lighting on its own alpha, so edges round off like a real bevel,
 *  and the stack shows the inside walls of the sparkle and the gap between the legs. */

export const MARK =
  'M26.7767 0H5.22325C2.34326 0 0 2.34322 0 5.2232V31.9999H7.3497C11.6026 31.9999 15.0503 28.5521 15.0503 24.2993C15.0503 22.6373 14.5342 20.9754 13.4503 19.716C11.5097 17.4451 8.62969 16.0103 5.41938 16.0103C11.2619 16.0103 16 11.2722 16 5.42966C16 11.2722 20.738 16.0103 26.5806 16.0103C23.298 16.0103 20.3767 17.507 18.4361 19.8606C17.4451 21.058 16.9497 22.5754 16.9497 24.1238C16.9497 28.4799 20.48 32.0102 24.8361 32.0102H31.9999V5.2232C31.9999 2.33289 29.6567 0 26.7767 0Z'

const markMask = `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><path d='${MARK}'/></svg>`)}")`

export type MarkVariant = 'glossy' | 'inflated' | 'glass' | 'ink'

type Look = {
  stops: [string, string, string] // front face gradient, light to dark
  side: string // colour of the depth layers
  depth: number // depth in px at size 1
  blur: number // how round the bevel is
  surface: number // how tall the bevel reads
  spec: number // specular strength
  shine: number // specular exponent: higher is tighter
  faceOpacity?: number
  glow?: string // a glow behind the mark
}

const looks: Record<MarkVariant, Look> = {
  glossy: { stops: ['#E9FFEE', '#7EEB9B', '#22A860'], side: '#178049', depth: 26, blur: 3, surface: 5, spec: 1.3, shine: 28 },
  inflated: { stops: ['#F2FFF4', '#A6F5B6', '#47C97A'], side: '#3DB06B', depth: 6, blur: 7, surface: 16, spec: 1.4, shine: 12 },
  glass: { stops: ['#FFFFFF', '#E6FCEB', '#9FE8B8'], side: '#BFF0D0', depth: 16, blur: 3, surface: 6, spec: 2.2, shine: 40, faceOpacity: 0.3 },
  ink: { stops: ['#4A4A4A', '#1A1A1A', '#050505'], side: '#000000', depth: 26, blur: 3, surface: 5, spec: 1.1, shine: 30, glow: '#9EF2B0' },
}

export function Mark3D({ variant, size, rotateX = 14, rotateY = -22, style }: { variant: MarkVariant; size: number; rotateX?: number; rotateY?: number; style?: CSSProperties }) {
  const look = looks[variant]
  const id = `mark-${variant}`
  const layers = Math.round(look.depth * (size / 320))
  const glass = variant === 'glass'
  return <div style={{ position: 'relative', width: size, height: size, perspective: size * 4, ...style }}>
    {/* Contact shadow on the floor */}
    <div style={{ position: 'absolute', left: size * 0.12, right: size * 0.02, top: size * 1.02, height: size * 0.12, borderRadius: '50%', background: variant === 'ink' ? 'rgba(0,0,0,.35)' : 'rgba(20,90,50,.3)', filter: `blur(${size * 0.04}px)` }} />
    {look.glow && <div style={{ position: 'absolute', inset: size * 0.2, borderRadius: '50%', background: look.glow, filter: `blur(${size * 0.16}px)`, opacity: 0.55 }} />}
    <div style={{ position: 'absolute', inset: 0, transformStyle: 'preserve-3d', transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)` }}>
      {/* Depth: copies of the silhouette stepping back, darkening towards the back */}
      {Array.from({ length: layers }, (_, i) => {
        const t = i / Math.max(1, layers - 1)
        return <svg key={i} viewBox="0 0 32 32" style={{ position: 'absolute', inset: 0, width: size, height: size, transform: `translateZ(${-(i + 1)}px)`, opacity: glass ? 0.22 : 1 }}>
          <path d={MARK} fill={look.side} style={{ filter: `brightness(${1 - t * 0.35})` }} />
        </svg>
      })}
      {/* Glass: the background seen through the face, frosted */}
      {glass && <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(255,255,255,.55), rgba(200,253,206,.25) 50%, rgba(80,200,130,.35))', WebkitMaskImage: markMask, maskImage: markMask, maskSize: '100% 100%', WebkitMaskSize: '100% 100%' }} />}
      {/* Front face, lit */}
      <svg viewBox="0 0 320 320" style={{ position: 'absolute', inset: 0, width: size, height: size, overflow: 'visible' }}>
        <defs>
          <linearGradient id={`${id}-face`} x1="0.1" y1="0" x2="0.85" y2="1">
            <stop offset="0" stopColor={look.stops[0]} />
            <stop offset="0.45" stopColor={look.stops[1]} />
            <stop offset="1" stopColor={look.stops[2]} />
          </linearGradient>
          <filter id={id} x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur in="SourceAlpha" stdDeviation={look.blur * 3} result="bump" />
            <feSpecularLighting in="bump" surfaceScale={look.surface} specularConstant={look.spec} specularExponent={look.shine} lightingColor="#ffffff" result="spec">
              <fePointLight x={-120} y={-220} z={260} />
            </feSpecularLighting>
            {/* Soften the lighting a touch: an 8-bit bump map otherwise shows contour lines */}
            <feGaussianBlur in="spec" stdDeviation="1.6" result="specSoft" />
            <feComposite in="specSoft" in2="SourceAlpha" operator="in" result="shine" />
            <feDiffuseLighting in="bump" surfaceScale={look.surface} diffuseConstant={1.05} lightingColor="#ffffff" result="shade">
              <feDistantLight azimuth={225} elevation={52} />
            </feDiffuseLighting>
            <feGaussianBlur in="shade" stdDeviation="1.6" result="shadeSoft" />
            <feComposite in="SourceGraphic" in2="shadeSoft" operator="arithmetic" k1={glass ? 0.55 : 1} k2={glass ? 0.45 : 0} k3={0} k4={0} result="lit" />
            <feComposite in="lit" in2="SourceAlpha" operator="in" result="litIn" />
            <feComposite in="shine" in2="litIn" operator="arithmetic" k2={1} k3={1} />
          </filter>
        </defs>
        <g filter={`url(#${id})`}>
          <path d={MARK} transform="scale(10)" fill={`url(#${id}-face)`} opacity={look.faceOpacity ?? 1} />
        </g>
        {glass && <>
          <linearGradient id={`${id}-rim`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffffff" /><stop offset="0.5" stopColor="#ffffff" stopOpacity="0.2" /><stop offset="1" stopColor="#5FD08F" /></linearGradient>
          <path d={MARK} transform="scale(10)" fill="none" stroke={`url(#${id}-rim)`} strokeWidth="0.35" />
        </>}
      </svg>
    </div>
  </div>
}
