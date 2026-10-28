import { SectionHeading } from '../ui/SectionHeading'
import { Container } from '../layout/Container'
import { Section } from '../layout/Section'
export function PageIntroSection({ eyebrow, title, support }: { eyebrow: string; title: string; support: string }) { return <Section className="page-intro section-pad"><Container className="page-content"><SectionHeading eyebrow={eyebrow} title={title} support={support} level={1}/></Container></Section> }
