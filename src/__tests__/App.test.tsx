import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '@/App'
import { setMatchMedia } from './setup'
import { useFilmStore } from '@/film/store'

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
  useFilmStore.setState({ activeShot: 'cover', mode: 'film', modeReason: 'default', reelState: 'pending' })
})

// The first render pays the cold import of GSAP, Lenis and the content; under a parallel suite that can exceed 5s.
describe('App', { timeout: 20000 }, () => {
  it('renders the shots in film order, with a story shot per featured project', () => {
    const { container } = render(<App />)
    const ids = [...container.querySelectorAll('[data-shot]')].map((el) => el.getAttribute('data-shot'))
    expect(ids).toEqual([
      'cover', 'who', 'what', 'context',
      'project-assetflow', 'project-eventify', 'project-digital-twin', 'project-farmassist', 'project-forus',
      'solves', 'figuring', 'for', 'back-cover',
    ])
  })

  it('has exactly one h1', () => {
    render(<App />)
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
  })

  it('renders chapters, skip link and mode toggle', () => {
    render(<App />)
    expect(screen.getByRole('navigation', { name: 'Chapters' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /skip to contact/i })).toBeInTheDocument()
  })

  it('while the reel plays, Skip intro is the first focusable control and everything behind the overlay is inert', () => {
    const { container } = render(<App />)
    const focusable = [...container.querySelectorAll<HTMLElement>('a[href], button')].filter((el) => !el.closest('[inert]'))
    expect(focusable[0]).toHaveAccessibleName(/skip intro/i)
    expect(container.querySelector('header')!.closest('[inert]')).not.toBeNull()
    expect(container.querySelector('main')!.closest('[inert]')).not.toBeNull()
  })

  it('in reduced motion, renders the article: no reel, nothing inert, every shot heading reachable', () => {
    setMatchMedia({ '(prefers-reduced-motion: reduce)': true })
    const { container } = render(<App />)
    expect(useFilmStore.getState().mode).toBe('article')
    expect(container.querySelector('[data-reel-overlay]')).toBeNull()
    expect(container.querySelectorAll('[inert]')).toHaveLength(0)
    for (const name of [
      /sydney kamau/i, /what do i actually do/i, /don't just build the screen/i, /a little context/i,
      /guess where their assets are/i, /real world/i, /figuring out/i, /people i like building with/i,
      /tell me what you're trying to build/i,
    ]) {
      expect(screen.getByRole('heading', { name })).toBeInTheDocument()
    }
  })
})
