import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AnimatedAcademyLogo } from './AnimatedAcademyLogo'

const backgroundPath = 'M102.677 19H35.3226C26.3226 19 19 26.3226 19 35.3226V119H41.9677L96.5832 119.032L96.6129 119.032H119V35.3226C119 26.2903 111.677 19 102.677 19Z'
const starPath = 'M69.0001 35.9668C69.0001 53.8761 54.7539 68.4644 36.978 69.0152C54.7539 69.566 69.0001 84.1543 69.0001 102.064C69.0001 84.1543 83.2463 69.566 101.022 69.0152C83.2463 68.4644 69.0001 53.8761 69.0001 35.9668Z'

describe('AnimatedAcademyLogo', () => {
  it('embeds the exact supplied paths, with the star in its own animated layer', () => {
    const { container } = render(<><AnimatedAcademyLogo/><AnimatedAcademyLogo/></>)
    const logos = screen.getAllByRole('img', { name: 'Femoskeydev Academy' })
    expect(logos).toHaveLength(2)
    expect(container.querySelectorAll('svg[viewBox="0 0 138 138"]')).toHaveLength(4)
    expect(container.querySelectorAll('mask')).toHaveLength(0)
    expect(logos[0].querySelector(`path[d="${backgroundPath}"]`)).toBeInTheDocument()
    expect(logos[0].querySelector(`path[d="${starPath}"]`)).toBeInTheDocument()
  })
})
