import type { Project } from '../../data/projects'
import styles from './CardMeta.module.css'

/** The white label under a project cover (Figma: Card_Meta): the studio mark and the project name on the left,
 *  the year it began on the right, or "Coming soon" while there is no case study. */
export function CardMeta({ project, heading: Heading = 'span' }: { project: Project; heading?: 'h2' | 'h3' | 'span' }) {
  return <span className={styles.meta}>
    <img className={styles.mark} src="/images/portfolio/0c7e0.svg" alt="" width="20" height="20" />
    <Heading className={styles.name}>{project.name}</Heading>
    <span className={styles.year}>{project.year ?? 'Coming soon'}</span>
  </span>
}
