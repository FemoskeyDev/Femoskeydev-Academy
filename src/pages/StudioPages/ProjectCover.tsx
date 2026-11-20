import type { CSSProperties } from 'react'
import type { Project } from '../../data/projects'
import styles from './ProjectCover.module.css'

/** A project's brand cover: its mark centred on the brand colour, with a badge while it is coming soon. */
export function ProjectCover({ project }: { project: Project }) {
  const { cover } = project
  return <span className={styles.cover} style={{ '--cover-bg': cover.background, '--cover-glow': cover.glow ?? 'transparent' } as CSSProperties}>
    <img className={styles[cover.kind]} src={cover.src} alt="" loading="lazy" />
    {!project.to && <span className={styles.badge}>Coming soon</span>}
  </span>
}
