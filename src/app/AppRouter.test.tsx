import { fireEvent, render, screen, within } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { routeConfig } from './routeConfig'

function renderAt(path: string) { const router = createMemoryRouter(routeConfig, { initialEntries: [path] }); return render(<RouterProvider router={router}/>) }
const booking = 'https://cal.com/femoskeydev'

describe('Studio routes', () => {
  it('shows Academy and Mentorship as coming soon in the dropdown, and dismisses it with Escape', () => {
    renderAt('/')
    const toggle = screen.getByRole('button', { name: /More/ })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    const dropdown = within(toggle.closest('header')!.querySelector('#more-navigation')!)
    expect(dropdown.queryByRole('link')).not.toBeInTheDocument()
    expect(dropdown.getByText('Academy').closest('[aria-disabled]')).toHaveTextContent('Coming soon')
    expect(dropdown.getByText('Mentorship').closest('[aria-disabled]')).toHaveTextContent('Coming soon')
    fireEvent.keyDown(toggle, { key: 'Escape' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(toggle).toHaveFocus()
  })
  it('only links to live pages from the main navigation, and books a call from Contact us', () => {
    renderAt('/')
    const nav = screen.getByRole('navigation', { name: 'Main navigation' })
    expect([...nav.querySelectorAll('a')].map(a => a.getAttribute('href'))).toEqual(['/work', booking])
    expect(within(nav).getByText('Services').closest('[aria-disabled]')).toHaveTextContent('Coming soon')
    expect(within(nav).getByText('About').closest('[aria-disabled]')).toHaveTextContent('Coming soon')
  })
  it('lists the case studies on the work page, with EdgeCore marked as coming soon', async () => {
    renderAt('/')
    expect(screen.getByRole('heading', { level: 1, name: /We build and scale digital.*products.*then some/i })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('navigation', { name: 'Main navigation' }).querySelector('a[href="/work"]')!)
    await screen.findByRole('heading', { level: 1, name: 'Selected work.' })
    expect(screen.getByRole('link', { name: /Liziwaride/ })).toHaveAttribute('href', '/work/liziwaride')
    expect(screen.getByRole('link', { name: /Paymita/ })).toHaveAttribute('href', '/work/paymita')
    expect(screen.getByLabelText('EdgeCore, case study coming soon')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /SaveCircle/ })).toHaveAttribute('href', '/work/savecircle')
    expect(screen.getByRole('link', { name: /Start a project/ })).toHaveAttribute('href', booking)
  })
  it('opens the Paymita case study from its homepage cover', async () => {
    renderAt('/')
    fireEvent.click(screen.getByRole('link', { name: 'Paymita case study' }))
    expect(await screen.findByRole('heading', { level: 1, name: 'Paymita' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: /Airtime to cash/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Get in touch' })).toHaveAttribute('href', booking)
  })
  it('opens the SaveCircle case study from its homepage cover', async () => {
    renderAt('/')
    fireEvent.click(screen.getByRole('link', { name: 'SaveCircle case study' }))
    expect(await screen.findByRole('heading', { level: 1, name: 'SaveCircle' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: /Admin dashboard/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Liziwaride/ })).toHaveAttribute('href', '/work/liziwaride')
  })
  it('opens the Liziwaride case study from its homepage cover', async () => {
    renderAt('/')
    fireEvent.click(screen.getByRole('link', { name: 'Liziwaride case study' }))
    expect(await screen.findByRole('heading', { level: 1, name: 'Liziwaride' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: /Smart Bus/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Paymita/ })).toHaveAttribute('href', '/work/paymita')
  })
  it('links the footer only to live pages and Cal.com, and shows the white logo', () => {
    renderAt('/')
    const footer = screen.getByRole('navigation', { name: 'Footer navigation' })
    expect([...footer.querySelectorAll('a')].map(a => a.getAttribute('href'))).toEqual(['/work', booking])
    expect(footer.querySelectorAll('[aria-disabled]')).toHaveLength(3)
    expect(within(footer.closest('footer')!).getByRole('link', { name: 'Femoskeydev home' }).querySelector('img')).toHaveAttribute('src', '/images/portfolio/logo-white.svg')
  })
  it.each([
    ['/services', 'Services'], ['/studio', 'About'], ['/contact', 'Contact'], ['/academy', 'The Academy'],
    ['/mentorship', 'Mentorship'], ['/learning-paths/interfaces', 'Learning paths'],
  ])('shows %s as coming soon', (path, title) => {
    renderAt(path)
    expect(screen.getByRole('heading', { level: 1, name: `${title} is on its way.` })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Book a call/ })).toHaveAttribute('href', booking)
  })
  it('shows a helpful not found page for unknown routes', () => {
    renderAt('/unavailable')
    expect(screen.getByRole('heading', { name: /This page isn't on the map/i })).toBeInTheDocument()
    expect(document.title).toBe('Page not found | Femoskeydev')
  })
})
