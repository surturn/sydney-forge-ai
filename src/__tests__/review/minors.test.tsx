import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import gsap from 'gsap'
import { ProofChips } from '@/shots/ProofChips'
import { Reel } from '@/film/Reel'
import { Stage } from '@/film/Stage'
import { ChapterBar } from '@/chrome/ChapterBar'
import { engine } from '@/film/engine'
import { placeShots } from '@/film/registry'
import { useFilmStore } from '@/film/store'
import type { ShotModule } from '@/film/useFilm'

beforeEach(() => {
  sessionStorage.clear()
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo
})

describe('Minor 1 — proof chips only link to shots that exist', () => {
  it('renders a plain chip, not a dead link, when the project shot is not built yet', () => {
    engine.placed = placeShots([{ id: 'solves', chapter: 'profile', length: 1, hold: [0.2, 0.8] }]).placed
    render(<ProofChips ids={['eventify']} />)
    expect(screen.queryByRole('link', { name: /eventify/i })).toBeNull()
    expect(screen.getByText('Eventify')).toHaveClass('chip')
  })

  it('links once the project shot exists', () => {
    engine.placed = placeShots([{ id: 'project-eventify', chapter: 'work', length: 1, hold: [0.2, 0.8] }]).placed
    render(<ProofChips ids={['eventify']} />)
    expect(screen.getByRole('link', { name: /eventify/i })).toHaveAttribute('href', '#shot-project-eventify')
  })
})

describe('Minor 3 — Skip keeps focus on the page', () => {
  it('moves focus to the cover title when Skip is used from the keyboard', () => {
    useFilmStore.setState({ mode: 'film', reelState: 'pending' })
    const title = document.createElement('h1')
    title.id = 'shot-cover-title'
    title.tabIndex = -1
    document.body.appendChild(title)
    render(<Reel />)
    const skip = screen.getByRole('button', { name: /skip intro/i })
    skip.focus()
    fireEvent.click(skip)
    expect(document.activeElement).toBe(title)
    title.remove()
  })
})

describe('Minor 4 — the reel is not built when it will not play', () => {
  it('never mounts the overlay in article mode', () => {
    useFilmStore.setState({ mode: 'article', reelState: 'pending' })
    const seen: boolean[] = []
    const origRender = Reel
    const Probe = () => {
      const el = origRender()
      seen.push(el !== null)
      return el
    }
    render(<Probe />)
    expect(seen.every((rendered) => !rendered)).toBe(true)
  })
})

describe('Minor 5 — chapter bar fits a 375px phone', () => {
  it('keeps full names as accessible names but shows numerals on small screens', () => {
    engine.placed = placeShots([
      { id: 'cover', chapter: 'cover', length: 1, hold: [0, 0.5] },
      { id: 'who', chapter: 'profile', length: 1, hold: [0.3, 0.7] },
      { id: 'back-cover', chapter: 'contact', length: 1, hold: [0.4, 1] },
    ]).placed
    useFilmStore.setState({ mode: 'film', activeShot: 'cover', reelState: 'done' })
    render(<ChapterBar />)
    expect(screen.getByRole('button', { name: 'Profile' }).querySelector('.sm\\:hidden')?.textContent).toBe('II')
    expect(screen.getByRole('button', { name: /read as article/i }).querySelector('.sm\\:hidden')?.textContent).toBe('Article')
  })
})

describe('Minor 6 — GSAP global lag smoothing is restored', () => {
  it('puts lagSmoothing back to the GSAP default when the film unmounts', () => {
    useFilmStore.setState({ mode: 'film', activeShot: 'a', reelState: 'done' })
    const spy = vi.spyOn(gsap.ticker, 'lagSmoothing')
    const shot: ShotModule = {
      def: { id: 'a', chapter: 'cover', length: 1, hold: [0, 0.5] },
      Component: () => <section data-shot="a" />,
    }
    const { unmount } = render(<Stage shots={[shot]} />)
    act(() => unmount())
    expect(spy).toHaveBeenLastCalledWith(500, 33)
    spy.mockRestore()
  })
})
