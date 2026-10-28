import { act, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AppLoader } from './AppLoader'

describe('AppLoader', () => {
  afterEach(() => vi.useRealTimers())

  it('dismisses after its bounded readiness and animation fallbacks', async () => {
    vi.useFakeTimers()
    const onDismiss = vi.fn()
    document.documentElement.classList.add('app-starting')
    const { container } = render(<AppLoader onDismiss={onDismiss}/>)

    expect(container.querySelector('svg[viewBox="0 0 138 138"]')).toBeInTheDocument()
    await act(async () => { await vi.advanceTimersByTimeAsync(4000) })
    await act(async () => { await vi.advanceTimersByTimeAsync(1000) })

    expect(onDismiss).toHaveBeenCalledOnce()
    expect(document.documentElement).not.toHaveClass('app-starting')
  })
})
