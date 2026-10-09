import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ChapterBar } from '@/chrome/ChapterBar'
import { SkipLink } from '@/chrome/SkipLink'
import { useFilmStore } from '@/film/store'
import { engine } from '@/film/engine'
import { placeShots } from '@/film/registry'

beforeEach(() => {
  engine.placed = placeShots([
    { id: 'cover', chapter: 'cover', length: 1, hold: [0, 0.5] },
    { id: 'who', chapter: 'profile', length: 1, hold: [0.3, 0.7] },
    { id: 'back-cover', chapter: 'contact', length: 1, hold: [0.4, 1] },
  ]).placed
  useFilmStore.setState({ activeShot: 'who', mode: 'film', reelState: 'done' })
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo
})

describe('ChapterBar', () => {
  it('lists only chapters that have shots, marking the current one', () => {
    render(<ChapterBar />)
    const nav = screen.getByRole('navigation', { name: 'Chapters' })
    const buttons = [...nav.querySelectorAll("button")].map((b) => b.getAttribute("aria-label"))
    expect(buttons).toEqual(['Cover', 'About', 'Contact'])
    expect(screen.getByRole('button', { name: 'About' })).toHaveAttribute('aria-current', 'step')
  })

  it('offers the project CTA and the mode toggle', () => {
    render(<ChapterBar />)
    expect(screen.getByRole('button', { name: /have a project\?/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /read as article/i })).toBeInTheDocument()
  })

  it('toggles to article mode and remembers it', () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem')
    render(<ChapterBar />)
    fireEvent.click(screen.getByRole('button', { name: /read as article/i }))
    expect(useFilmStore.getState().mode).toBe('article')
    expect(setItem).toHaveBeenCalledWith('film-mode', 'article')
    expect(screen.getByRole('button', { name: /watch as film/i })).toBeInTheDocument()
  })

  it('meets the 24px target size on every control', () => {
    render(<ChapterBar />)
    for (const b of screen.getAllByRole('button')) {
      expect(b.className).toMatch(/min-h-\[(24|28|44)px\]|btn-signal/)
    }
  })
})

describe('SkipLink', () => {
  it('is a link to the contact shot', () => {
    render(<SkipLink />)
    expect(screen.getByRole('link', { name: /skip to contact/i })).toHaveAttribute('href', '#shot-back-cover')
  })
})
