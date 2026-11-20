import { HeroSection } from './HeroSection'
import { ManifestoSection } from './ManifestoSection'
import styles from './AcademyIntro.module.css'

export function AcademyIntro() {
  return <div className={styles.stage}><HeroSection /><ManifestoSection /></div>
}
