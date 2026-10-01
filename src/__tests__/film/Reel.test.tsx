import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { Reel, shouldPlayReel } from '@/film/Reel'
import { useFilmStore } from '@/film/store'

beforeEach(() => {
  sessionStorage.clear()
  useFilmStore.setState({ mode: 'film', reelState: 'pending', activeShot: 'cover' })
})

describe('shouldPlayReel', () => {
  it('plays in film mode on first visit only', () => {
    expect(shouldPlayReel('film')).toBe(true)
    sessionStorage.setItem('reel-seen', '1')
    expect(shouldPlayReel('film')).toBe(false)
  })
  it('never plays in article mode', () => {
    expect(shouldPlayReel('article')).toBe(false)
  })
  it('plays (rather than throwing) when session storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('denied') })
    expect(shouldPlayReel('film')).toBe(true)
    vi.restoreAllMocks()
  })
})

describe('Reel', () => {
  it('puts Skip first, then Pause, both keyboard reachable', () => {
    render(<Reel />)
    const buttons = screen.getAllByRole('button')
    expect(buttons[0]).toHaveAccessibleName(/skip intro/i)
    expect(buttons[1]).toHaveAccessibleName(/pause/i)
  })

  it('Skip ends the reel and sets the session flag', () => {
    render(<Reel />)
    fireEvent.click(screen.getByRole('button', { name: /skip intro/i }))
    expect(useFilmStore.getState().reelState).toBe('done')
    expect(sessionStorage.getItem('reel-seen')).toBe('1')
  })

  it.each([
    ['wheel', () => fireEvent.wheel(window)],
    ['touchmove', () => fireEvent.touchMove(window)],
    ['keydown', () => fireEvent.keyDown(window, { key: 'ArrowDown' })],
  ])('any %s during the reel ends it instead of blocking scroll', (_name, fire) => {
    render(<Reel />)
    act(() => { fire() })
    expect(useFilmStore.getState().reelState).toBe('done')
  })

  it('Tab reaches the controls without ending the reel', () => {
    render(<Reel />)
    act(() => { fireEvent.keyDown(window, { key: 'Tab' }) })
    expect(useFilmStore.getState().reelState).toBe('playing')
  })

  it('Enter or Space on Pause pauses rather than ending the reel', () => {
    render(<Reel />)
    const pause = screen.getByRole('button', { name: /pause/i })
    act(() => { fireEvent.keyDown(pause, { key: 'Enter' }) })
    act(() => { fireEvent.keyDown(pause, { key: ' ' }) })
    expect(useFilmStore.getState().reelState).toBe('playing')
  })

  it('any scroll (scrollbar drag, autoscroll) ends the reel', () => {
    render(<Reel />)
    act(() => { fireEvent.scroll(window) })
    expect(useFilmStore.getState().reelState).toBe('done')
  })

  it('Pause toggles to Play', () => {
    render(<Reel />)
    fireEvent.click(screen.getByRole('button', { name: /pause/i }))
    expect(useFilmStore.getState().reelState).toBe('paused')
    expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument()
  })

  it('renders nothing in article mode', () => {
    useFilmStore.setState({ mode: 'article' })
    const { container } = render(<Reel />)
    expect(container).toBeEmptyDOMElement()
  })

  it('is decorative to assistive tech apart from its controls', () => {
    const { container } = render(<Reel />)
    expect(container.querySelector('[data-reel-overlay]')).toHaveAttribute('aria-hidden', 'true')
  })
})
