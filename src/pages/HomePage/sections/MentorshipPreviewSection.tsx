import { Link } from 'react-router-dom'
import { programmes } from '../../../data/programmes'
import { ProgrammeCard } from '../../../features/mentorship/ProgrammeCard'
import { Button } from '../../../components/ui/Button'
export function MentorshipPreviewSection() { return <section className="programmes section-pad" id="programmes"><div className="programmes-intro"><div className="eyebrow">WAYS TO LEARN</div><h2>Choose the kind of<br/><em>support you need.</em></h2><p>Learning can take different shapes. Explore mentorship, practical challenges, workshops, and project-based learning.</p><Button to="/mentorship">Explore Mentorship</Button></div><div className="programme-list">{programmes.map((programme,index)=><ProgrammeCard key={programme.name} programme={programme} index={index}/>)}<div className="programme-note">Programme formats and availability may change. <Link to="/mentorship">Ask about current options.</Link></div></div></section> }
