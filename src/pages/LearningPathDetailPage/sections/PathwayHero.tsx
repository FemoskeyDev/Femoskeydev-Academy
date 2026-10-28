import type { LearningPath } from '../../../data/learningPaths'
import { Button } from '../../../components/ui/Button'
import { Breadcrumbs } from '../../../components/layout/Breadcrumbs'
export function PathwayHero({ path }: { path: LearningPath }) { return <section className="pathway-hero section-pad"><Breadcrumbs current={path.name}/><div className="eyebrow">LEARNING PATH {path.number}</div><div className={`detail-mark path-${path.tone}`}>{path.mark}</div><h1>{path.name}</h1><p className="path-focus">{path.focus}</p><p>{path.description}</p><Button to="/contact">Ask about this pathway</Button></section> }
