import { describe, it, expect, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { fitScale } from '@/film/useFitToFrame'
import { Shot } from '@/film/Shot'
import { useFilmStore } from '@/film/store'

describe('fitScale', () => {
  it('leaves content that fits at full size', () => {
    expect(fitScale(500, 600)).toBe(1)
  })
  it('scales overflowing content down to the frame', () => {
    expect(fitScale(800, 600)).toBeCloseTo(0.75)
  })
  it('never scales below the legibility floor', () => {
    expect(fitScale(2000, 600)).toBe(0.6)
  })
  it('ignores unmeasured (zero) sizes', () => {
    expect(fitScale(0, 600)).toBe(1)
    expect(fitScale(800, 0)).toBe(1)
  })
})

describe('Shot fit-to-frame', () => {
  beforeEach(() => useFilmStore.setState({ mode: 'film', activeShot: 'tall' }))

  const renderTall = () => {
    const proto = HTMLElement.prototype
    const sh = Object.getOwnPropertyDescriptor(proto, 'scrollHeight')
    const ch = Object.getOwnPropertyDescriptor(proto, 'clientHeight')
    Object.defineProperty(proto, 'scrollHeight', { configurable: true, get() { return this.hasAttribute('data-fit') ? 900 : 0 } })
    Object.defineProperty(proto, 'clientHeight', { configurable: true, get() { return this.hasAttribute('data-shot') ? 600 : 0 } })
    const utils = render(
      <Shot def={{ id: 'tall', chapter: 'profile', length: 1, hold: [0.2, 0.8] }}>
        <h2 id="shot-tall-title">Tall</h2>
      </Shot>,
    )
    if (sh) Object.defineProperty(proto, 'scrollHeight', sh)
    if (ch) Object.defineProperty(proto, 'clientHeight', ch)
    return utils
  }

  it('scales a shot taller than the viewport so nothing is clipped in film mode', () => {
    const { container } = renderTall()
    const fit = container.querySelector('[data-fit]') as HTMLElement
    expect(fit.style.transform).toBe('scale(0.6666666666666666)')
  })

  it('does not scale in article mode, where the page scrolls normally', () => {
    useFilmStore.setState({ mode: 'article' })
    const { container } = renderTall()
    expect((container.querySelector('[data-fit]') as HTMLElement).style.transform).toBe('')
  })
})
