import { Link } from 'react-router-dom'
import { LearningPathGrid } from '../../../features/learning-paths/LearningPathGrid'
import { RevealOnScroll } from '../../../components/ui/RevealOnScroll'
export function LearningPathsPreviewSection() { return <section className="paths section-pad" id="learning-paths"><RevealOnScroll className="section-intro"><div><div className="eyebrow">FIND YOUR CREATIVE PATH</div><h2>Different paths.<br/><em>One creative future.</em></h2></div><p>Explore the discipline that interests you, develop practical skills, and discover what you can create.</p></RevealOnScroll><LearningPathGrid/><div className="path-foot"><span>FOUR DIRECTIONS TO START EXPLORING</span><Link to="/learning-paths">SEE ALL LEARNING PATHS ↗</Link></div></section> }
