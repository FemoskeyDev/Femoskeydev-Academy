import type { CSSProperties } from 'react'
import { RevealOnScroll } from '../../components/ui/RevealOnScroll'
import styles from './CaseStudy.module.css'

export function Heading({ title, subtitle, id }: { title: string; subtitle: string; id: string }) {
  return <h2 id={id} className={styles.heading}>{title} <span>{subtitle}</span></h2>
}

/** A tile exported from Figma; `w` is its width in the 1248px layout (rows are 510px tall unless `h` says otherwise). */
export type BentoTile = { src: string; alt: string; w: number; h?: number }

/** Rows keep the tile widths from Figma; on phones they fall back to two columns, with wide tiles spanning both. */
export function MediaBento({ rows }: { rows: BentoTile[][] }) {
  return <RevealOnScroll className={styles.bentoRows}>
    {rows.map((row, i) => <div key={i} className={styles.bentoRow} style={{ '--cols': row.map(t => `${t.w}fr`).join(' ') } as CSSProperties}>
      {row.map(tile => <figure key={tile.src} className={`${styles.cell} ${tile.w > 600 ? styles.cellWide : ''}`} style={{ aspectRatio: `${tile.w} / ${tile.h ?? 510}` }}>
        <img data-flare src={tile.src} alt={tile.alt} loading="lazy" />
      </figure>)}
    </div>)}
  </RevealOnScroll>
}
