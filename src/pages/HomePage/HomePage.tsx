import { usePageMeta } from '../../hooks/usePageMeta'
import { FinalCTASection } from '../../components/sections/FinalCTASection'
import { CommunitySection } from './sections/CommunitySection'
import { FounderSection } from './sections/FounderSection'
import { HeroSection } from './sections/HeroSection'
import { HomeFAQSection } from './sections/HomeFAQSection'
import { ManifestoSection } from './sections/ManifestoSection'
import { LearningExperienceSection } from './sections/LearningExperienceSection'
import { LearningPathsPreviewSection } from './sections/LearningPathsPreviewSection'
import { MentorshipPreviewSection } from './sections/MentorshipPreviewSection'
import styles from './HomePage.module.css'

export function HomePage() {
  usePageMeta('The Pathway to Becoming an Awesome Creative')
  return <div className={styles.home}><HeroSection/><ManifestoSection/><LearningPathsPreviewSection/><LearningExperienceSection/><MentorshipPreviewSection/><CommunitySection/><FounderSection/><HomeFAQSection/><FinalCTASection title="Your next creative chapter starts here." support="Explore a pathway, ask about mentorship, or connect with a community of creatives who are building their skills."/></div>
}
