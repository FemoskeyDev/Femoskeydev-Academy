import { usePageMeta } from '../../hooks/usePageMeta'
import { PageIntroSection } from '../../components/sections/PageIntroSection'
import { ContactOptions } from './sections/ContactOptions'
export function ContactPage() { usePageMeta('Contact','Find out how to enquire about Femoskeydev Academy pathways, mentorship, and community.'); return <><PageIntroSection eyebrow="GET IN TOUCH" title="Let's find a good next step." support="Ask us about learning pathways, mentorship, or the Academy community."/><ContactOptions/></> }
