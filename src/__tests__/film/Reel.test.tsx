import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import type gsap from 'gsap'
import { Reel, shouldPlayReel } from '@/film/Reel'
import { buildReel } from '@/film/reelTimeline'
import { useFilmStore } from '@/film/store'

beforeEach(() => {
  sessionStorage.clear()
  useFilmStore.setState({ mode: 'film', reelState: 'pending', activeShot: 'cover' })
})

describe('shouldPlayReel', () => {
  it('plays on every load in film mode, including a reload in the same session', () => {
    expect(shouldPlayReel('film')).toBe(true)
    sessionStorage.setItem('reel-seen', '1')
    expect(shouldPlayReel('film')).toBe(true)
  })
  it('never plays in article mode', () => {
    expect(shouldPlayReel('article')).toBe(false)
  })
})

describe('reel pacing', () => {
  const build = () => {
    const overlay = document.createElement('div')
    overlay.innerHTML = '<div data-reel="stripe"></div>' + '<span data-reel="word"></span>'.repeat(5) +
      '<svg data-reel="flowline"><path></path><path data-reel="break"></path><circle data-reel="mend"></circle></svg><div data-reel="wipe"></div>'
    return buildReel(overlay, null)
  }

  it('runs long enough to read, around 12 to 14 seconds', () => {
    const tl = build()
    expect(tl.duration()).toBeGreaterThanOrEqual(12)
    expect(tl.duration()).toBeLessThanOrEqual(14)
    tl.kill()
  })

  it('holds each montage word on screen for at least 0.4 seconds', () => {
    const tl = build()
    const words = tl.getChildren(true, true, false).filter((t) => (t as gsap.core.Tween).targets?.()[0] instanceof HTMLSpanElement)
    // Each word has an in-tween then an out-tween; the gap between in-end and out-start is its hold.
    for (let i = 0; i < words.length; i += 2) {
      const inEnd = words[i].startTime() + words[i].duration()
      expect(words[i + 1].startTime() - inEnd).toBeGreaterThanOrEqual(0.4)
    }
    tl.kill()
  })
})

describe('Reel', () => {
  it('puts Skip first, then Pause, both keyboard reachable', () => {
    render(<Reel />)
    const buttons = screen.getAllByRole('button')
    expect(buttons[0]).toHaveAccessibleName(/skip intro/i)
    expect(buttons[1]).toHaveAccessibleName(/pause/i)
  })

  it('Skip ends the reel', () => {
    render(<Reel />)
    fireEvent.click(screen.getByRole('button', { name: /skip intro/i }))
    expect(useFilmStore.getState().reelState).toBe('done')
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
