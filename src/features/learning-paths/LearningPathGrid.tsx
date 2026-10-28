import { learningPaths } from '../../data/learningPaths'
import { LearningPathCard } from './LearningPathCard'
export function LearningPathGrid() { return <div className="path-grid">{learningPaths.map(path => <LearningPathCard key={path.slug} path={path}/>)}</div> }
