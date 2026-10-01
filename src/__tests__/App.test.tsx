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

describe('App', () => {
  it('renders the Stage A shots in film order', () => {
    const { container } = render(<App />)
    const ids = [...container.querySelectorAll('[data-shot]')].map((el) => el.getAttribute('data-shot'))
    expect(ids).toEqual(['cover', 'who', 'what', 'solves', 'for', 'back-cover'])
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
    for (const name of [/sydney kamau/i, /engineer\. founder\./i, /whole systems/i, /real conditions/i, /who it's for/i, /write to me/i]) {
      expect(screen.getByRole('heading', { name })).toBeInTheDocument()
    }
  })
})
