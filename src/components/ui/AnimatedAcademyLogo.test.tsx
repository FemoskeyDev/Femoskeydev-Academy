import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AnimatedAcademyLogo } from './AnimatedAcademyLogo'

const backgroundPath = 'M102.677 19H35.3226C26.3226 19 19 26.3226 19 35.3226V119H41.9677L96.5832 119.032L96.6129 119.032H119V35.3226C119 26.2903 111.677 19 102.677 19Z'
const starPath = 'M69.0001 35.9668C69.0001 53.8761 54.7539 68.4644 36.978 69.0152C54.7539 69.566 69.0001 84.1543 69.0001 102.064C69.0001 84.1543 83.2463 69.566 101.022 69.0152C83.2463 68.4644 69.0001 53.8761 69.0001 35.9668Z'
const joiningPath = 'M100.783 69.0039C101.208 69.0201 101.635 69.0312 102.064 69.0312C91.8065 69.0313 82.6778 73.7088 76.6133 81.0635C73.5166 84.8053 71.9679 89.5472 71.9678 94.3857C71.9678 107.568 82.3131 118.33 95.3291 118.998C77.9867 118.99 46.1227 118.981 42.3242 118.996C55.45 118.805 66.0322 108.106 66.0322 94.9346C66.0322 89.7411 64.4192 84.5478 61.0322 80.6123C54.9677 73.5155 45.9678 69.0313 35.9355 69.0312C36.3643 69.0312 36.791 69.0201 37.2158 69.0039C37.1366 69.0069 37.0569 69.0122 36.9775 69.0146C54.7534 69.5654 69 84.1532 69 102.062C69 84.1532 83.2466 69.5654 101.022 69.0146C100.943 69.0122 100.863 69.0069 100.783 69.0039Z'

describe('AnimatedAcademyLogo', () => {
  it('embeds the exact supplied paths and gives each instance a unique clip path', () => {
    const { container } = render(<><AnimatedAcademyLogo/><AnimatedAcademyLogo/></>)
    const logos = screen.getAllByRole('img', { name: 'Femoskeydev Academy' })
    expect(logos).toHaveLength(2)
    const clipIds = [...container.querySelectorAll('clipPath')].map(clip => clip.id)
    expect(new Set(clipIds).size).toBe(2)
    expect(container.querySelectorAll('svg[viewBox="0 0 138 138"]')).toHaveLength(2)
    expect(container.querySelector(`path[d="${backgroundPath}"]`)).toBeInTheDocument()
    expect(container.querySelector(`path[d="${starPath}"]`)).toBeInTheDocument()
    expect(container.querySelector(`path[d="${joiningPath}"]`)).toBeInTheDocument()
  })
})
