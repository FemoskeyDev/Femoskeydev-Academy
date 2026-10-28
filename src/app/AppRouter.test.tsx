import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { routeConfig } from './routeConfig'

function renderAt(path: string) { const router = createMemoryRouter(routeConfig, { initialEntries: [path] }); return render(<RouterProvider router={router}/>) }
describe('Academy routes', () => {
  it('renders the home page and shared navigation', () => { renderAt('/'); expect(screen.getByRole('heading', { name: /pathway to becoming an awesome creative/i })).toBeInTheDocument(); expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument() })
  it('renders pathway links and a supported detail page', () => { const { unmount } = renderAt('/learning-paths'); expect(screen.getAllByRole('link', { name: /FDA Interfaces/i }).every(link => link.getAttribute('href') === '/learning-paths/interfaces')).toBe(true); unmount(); renderAt('/learning-paths/interfaces'); expect(screen.getByRole('heading', { name: 'FDA Interfaces' })).toBeInTheDocument() })
  it('shows helpful not found pages for unknown routes and pathways', () => { const { unmount } = renderAt('/learning-paths/unknown'); expect(screen.getByText(/That path hasn't been mapped yet/i)).toBeInTheDocument(); unmount(); renderAt('/unavailable'); expect(screen.getByRole('heading', { name: /This page isn't on the map/i })).toBeInTheDocument() })
})
