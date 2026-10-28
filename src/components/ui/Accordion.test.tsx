import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Accordion } from './Accordion'
describe('Accordion', () => {
  it('opens and closes its answer with click and keyboard activation', async () => {
    const user = userEvent.setup(); render(<Accordion items={[{ question: 'Who is this for?', answer: 'For curious creatives.' }]}/>); const trigger = screen.getByRole('button', { name: /who is this for/i });
    expect(trigger).toHaveAttribute('aria-expanded', 'false'); await user.click(trigger); expect(trigger).toHaveAttribute('aria-expanded', 'true'); expect(screen.getByText('For curious creatives.')).toBeVisible(); await user.keyboard('{Enter}'); expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })
})
