import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { seekToShot } from '@/film/seek'
import { engine } from '@/film/engine'
import { placeShots } from '@/film/registry'
import { useFilmStore } from '@/film/store'

beforeEach(() => {
  document.body.innerHTML = `
    <div data-film-spacer></div>
    <section id="shot-a"><h2 id="shot-a-title" tabindex="-1">A</h2></section>
    <section id="shot-b"><h2 id="shot-b-title" tabindex="-1">B</h2></section>`
  engine.placed = placeShots([
    { id: 'a', chapter: 'cover', length: 1, hold: [0, 0.5] },
    { id: 'b', chapter: 'contact', length: 1, hold: [0.5, 1] },
  ]).placed
  engine.spacer = document.querySelector('[data-film-spacer]')
  engine.lenis = null
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo
  Element.prototype.scrollIntoView = vi.fn()
})

describe('seekToShot', () => {
  it('in film mode, scrolls to the shot hold start through Lenis when present', () => {
    useFilmStore.setState({ mode: 'film' })
    const scrollTo = vi.fn()
    engine.lenis = { scrollTo } as never
    expect(seekToShot('b')).toBe(true)
    expect(scrollTo).toHaveBeenCalledWith(expect.any(Number), expect.objectContaining({ duration: expect.any(Number) }))
  })

  it('in article mode, scrolls the section into view', () => {
    useFilmStore.setState({ mode: 'article' })
    expect(seekToShot('b')).toBe(true)
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled()
  })

  it('moves focus to the shot title', () => {
    useFilmStore.setState({ mode: 'article' })
    seekToShot('b')
    expect(document.activeElement?.id).toBe('shot-b-title')
  })

  it('falls back when the target shot does not exist', () => {
    useFilmStore.setState({ mode: 'article' })
    expect(seekToShot('project-eventify', 'b')).toBe(true)
    expect(document.activeElement?.id).toBe('shot-b-title')
  })

  describe('in film mode, where off-screen shots are inert', () => {
    // jsdom ignores `inert`; reproduce the browser rule that focus() inside an inert subtree is a no-op.
    let realFocus: typeof HTMLElement.prototype.focus
    beforeEach(() => {
      realFocus = HTMLElement.prototype.focus
      HTMLElement.prototype.focus = function (this: HTMLElement, opts?: FocusOptions) {
        if (this.closest('[inert]')) return
        realFocus.call(this, opts)
      }
      useFilmStore.setState({ mode: 'film' })
      document.getElementById('shot-b')!.setAttribute('inert', '')
    })
    afterEach(() => {
      HTMLElement.prototype.focus = realFocus
    })

    it('moves focus to the target title even though it was inert (no Lenis)', () => {
      seekToShot('b')
      expect(document.activeElement?.id).toBe('shot-b-title')
    })

    it('moves focus once the Lenis scroll lands, not before', () => {
      let landed: (() => void) | undefined
      engine.lenis = { scrollTo: vi.fn((_y: number, o: { onComplete?: () => void }) => { landed = o.onComplete }) } as never
      seekToShot('b')
      expect(landed).toBeTypeOf('function')
      document.getElementById('shot-b')!.setAttribute('inert', '') // re-inerted while scrolling past other shots
      landed!()
      expect(document.activeElement?.id).toBe('shot-b-title')
    })
  })

  it('returns false without throwing when neither shot exists', () => {
    useFilmStore.setState({ mode: 'article' })
    expect(seekToShot('nope', 'also-nope')).toBe(false)
  })
})
