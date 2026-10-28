import { faqs } from '../../data/faqs'
import { Accordion } from '../ui/Accordion'
import { SectionHeading } from '../ui/SectionHeading'
export function FAQSection() { return <section className="faq section-pad"><div className="faq-head"><SectionHeading eyebrow="GOOD QUESTIONS" title="Curious about what comes next?" support="A few helpful starting points."/></div><Accordion items={faqs}/></section> }
