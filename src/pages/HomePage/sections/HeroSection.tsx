import { Link } from 'react-router-dom'
import { InteractiveRobotPortrait } from '../../../features/interactive-portrait/InteractiveRobotPortrait'
import { Button } from '../../../components/ui/Button'
import { siteConfig } from '../../../data/siteConfig'
export function HeroSection() {
  const hero = siteConfig.home

  return (
    <section className="hero">
      <div className="hero-copy">
        <div className="eyebrow">
          <span className="eyebrow-dot" />
          {hero.eyebrow}
        </div>
        <h1>
          {hero.headline.before} <em>{hero.headline.emphasis}</em>
        </h1>
        <p>{hero.support}</p>
        <div className="hero-actions">
          <Button to="/learning-paths">{hero.primaryAction}</Button>
          <Link className="text-link" to="/community">
            {hero.secondaryAction} <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
      <div className="hero-visual">
        <InteractiveRobotPortrait />
      </div>
    </section>
  )
}
