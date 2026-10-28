import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { PortraitController } from './portraitUtils'
import { InteractiveRobotPortrait } from './InteractiveRobotPortrait'

const capture = vi.hoisted(() => ({ interaction: null as unknown as { current: PortraitController } }))
vi.mock('./PortraitScene', () => ({
  PortraitScene: ({ interaction, onUnavailable }: { interaction: { current: PortraitController }; onUnavailable: () => void }) => {
    capture.interaction = interaction
    return <div data-testid="portrait-canvas"><button type="button" data-testid="simulate-renderer-failure" onClick={onUnavailable}>Renderer failure</button></div>
  },
}))

describe('InteractiveRobotPortrait', () => {
  it('maps pointer events into local shader UVs and restores the human portrait on exit', async () => {
    render(<InteractiveRobotPortrait />)
    const surface = screen.getByRole('group', { name: /interactive founder portrait/i })
    await screen.findByTestId('portrait-canvas')
    vi.spyOn(surface, 'getBoundingClientRect').mockReturnValue({ left: 20, top: 30, right: 220, bottom: 230, width: 200, height: 200, x: 20, y: 30, toJSON: () => ({}) })

    fireEvent.pointerEnter(surface, { pointerType: 'mouse', clientX: 70, clientY: 90 })
    fireEvent.pointerMove(surface, { pointerType: 'mouse', clientX: 90, clientY: 110 })
    expect(capture.interaction.current.mode).toBe('cursor-reveal')
    expect(capture.interaction.current.pointer).toEqual({ x: 0.35, y: 0.6 })
    expect(capture.interaction.current.dynamic).toBe(true)
    expect(capture.interaction.current.rippleEnergy).toBeGreaterThan(0)

    fireEvent.pointerLeave(surface, { pointerType: 'mouse' })
    expect(capture.interaction.current.mode).toBe('idle')
  })

  it('does not render a transformation control or image overlay text', async () => {
    render(<InteractiveRobotPortrait />)
    expect(screen.queryByRole('button', { name: /transformation/i })).not.toBeInTheDocument()
    expect(screen.queryByText(/move or tap to scan|explore to reveal/i)).not.toBeInTheDocument()
  })

  it('supports keyboard repositioning of the cursor reveal', async () => {
    render(<InteractiveRobotPortrait />)
    const surface = screen.getByRole('group', { name: /interactive founder portrait/i })
    await screen.findByTestId('portrait-canvas')
    fireEvent.keyDown(surface, { key: 'ArrowRight' })
    expect(capture.interaction.current.pointer.x).toBeGreaterThan(0.5)
  })

  it('keeps touch scanning local while the pointer is down and resets on release', async () => {
    render(<InteractiveRobotPortrait />)
    const surface = screen.getByRole('group', { name: /interactive founder portrait/i })
    await screen.findByTestId('portrait-canvas')
    vi.spyOn(surface, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0, right: 300, bottom: 400, width: 300, height: 400, x: 0, y: 0, toJSON: () => ({}) })
    fireEvent.pointerDown(surface, { pointerType: 'touch', clientX: 90, clientY: 120 })
    fireEvent.pointerMove(surface, { pointerType: 'touch', clientX: 150, clientY: 200 })
    expect(capture.interaction.current.mode).toBe('cursor-reveal')
    expect(capture.interaction.current.pointer).toEqual({ x: 0.5, y: 0.5 })
    expect(capture.interaction.current.dynamic).toBe(false)
    expect(capture.interaction.current.rippleEnergy).toBe(0)
    fireEvent.pointerUp(surface, { pointerType: 'touch' })
    expect(capture.interaction.current.mode).toBe('idle')
  })

  it('keeps the human portrait and restores a CSS reveal if WebGL fails', async () => {
    const { container } = render(<InteractiveRobotPortrait />)
    await screen.findByTestId('portrait-canvas')
    fireEvent.click(screen.getByTestId('simulate-renderer-failure'))
    expect(screen.getByAltText(/Femoskeydev, founder/i)).toBeInTheDocument()
    expect(container.querySelector('img[src="/images/cybernetic-portrait.png"]')).toHaveAttribute('src', '/images/cybernetic-portrait.png')
    const surface = screen.getByRole('group', { name: /interactive founder portrait/i })
    vi.spyOn(surface, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0, right: 200, bottom: 200, width: 200, height: 200, x: 0, y: 0, toJSON: () => ({}) })
    fireEvent.pointerEnter(surface, { pointerType: 'mouse', clientX: 40, clientY: 60 })
    expect(surface.style.getPropertyValue('--pointer-x')).toBe('20%')
    expect(surface.style.getPropertyValue('--pointer-y')).toBe('30%')
  })
})
