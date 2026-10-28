import { useId } from 'react'
import styles from './CreativeScanner.module.css'

const spokes = Array.from({ length: 24 }, (_, index) => {
  const angle = index * Math.PI / 12
  const x1 = (Math.cos(angle) * 42).toFixed(2)
  const y1 = (Math.sin(angle) * 42).toFixed(2)
  const x2 = (Math.cos(angle) * 116).toFixed(2)
  const y2 = (Math.sin(angle) * 116).toFixed(2)
  return { x1, y1, x2, y2, key: index }
})

export function CreativeScanner() {
  const clipId = `academy-scan-clip-${useId().replace(/:/g, '')}`
  return (
    <div className={styles.scannerWrap} data-scene="hud-wrap" aria-hidden="true">
      <svg className={styles.scanner} data-scene="hud" viewBox="-150 -150 300 300" fill="none">
        <defs><clipPath id={clipId}><circle r="112"/></clipPath></defs>
        <g className={styles.scanLines} data-scene="scan-lines" clipPath={`url(#${clipId})`}>
          {Array.from({ length: 25 }, (_, i) => <path key={i} d={`M-118 ${i * 9 - 108}H118`}/>) }
        </g>
        <g className={styles.scanMesh} data-scene="scan-mesh">
          <circle data-draw r="74" pathLength="1"/>
          <circle data-draw r="112" pathLength="1"/>
          {spokes.map(({ x1, y1, x2, y2, key }) => <path key={key} data-draw pathLength="1" d={`M${x1} ${y1}L${x2} ${y2}`}/>) }
        </g>
        <g className={styles.scanArcs} data-scene="scan-arcs">
          <path data-draw pathLength="1" d="M-128 20 A130 130 0 0 1 -52 -119"/>
          <path data-draw pathLength="1" d="M62 -114 A130 130 0 0 1 128 -24"/>
          <path data-draw pathLength="1" d="M104 79 A130 130 0 0 1 5 130"/>
          <path data-draw pathLength="1" d="M0 0H-145M0 0H145"/>
          <path data-draw pathLength="1" d="M0 -80 A80 80 0 1 1 -.01 -80M0 106 A106 106 0 1 0 .01 106"/>
        </g>
        <g className={styles.scanNodes}>
          {spokes.filter((_, index) => index % 3 === 0).map(({ x2, y2, key }) => <circle key={key} cx={x2} cy={y2} r="2"/>) }
          <path d="M-8 0H8M0-8V8"/>
        </g>
      </svg>
    </div>
  )
}
