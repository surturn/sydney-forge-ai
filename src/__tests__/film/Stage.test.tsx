import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { Stage } from '@/film/Stage'
import { Shot } from '@/film/Shot'
import { useFilmStore } from '@/film/store'
import type { ShotModule } from '@/film/useFilm'

const make = (id: string, chapter: 'cover' | 'profile'): ShotModule => ({
  def: { id, chapter, length: 1, hold: [0.2, 0.8] },
  Component: () => (
    <Shot def={{ id, chapter, length: 1, hold: [0.2, 0.8] }}>
      <h2 id={`shot-${id}-title`}>{id} title</h2>
      <a href="#x">{id} link</a>
    </Shot>
  ),
})

const shots = [make('one', 'cover'), make('two', 'profile')]

beforeEach(() => {
  useFilmStore.setState({ activeShot: 'one', mode: 'film', modeReason: 'default', reelState: 'done' })
})

describe('Stage', () => {
  it('renders every shot as a labelled section in order', () => {
    const { container } = render(<Stage shots={shots} />)
    const ids = [...container.querySelectorAll('[data-shot]')].map((el) => el.getAttribute('data-shot'))
    expect(ids).toEqual(['one', 'two'])
    expect(screen.getByRole('region', { name: 'one title' })).toBeInTheDocument()
  })

  it('makes inactive shots inert in film mode', () => {
    const { container } = render(<Stage shots={shots} />)
    expect(container.querySelector('[data-shot="one"]')).not.toHaveAttribute('inert')
    expect(container.querySelector('[data-shot="two"]')).toHaveAttribute('inert')
    act(() => useFilmStore.getState().setActiveShot('two'))
    expect(container.querySelector('[data-shot="one"]')).toHaveAttribute('inert')
    expect(container.querySelector('[data-shot="two"]')).not.toHaveAttribute('inert')
  })

  it('makes nothing inert in article mode and drops the spacer height', () => {
    useFilmStore.setState({ mode: 'article' })
    const { container } = render(<Stage shots={shots} />)
    expect(container.querySelectorAll('[inert]')).toHaveLength(0)
    expect(container.querySelector('[data-film-spacer]')).toHaveAttribute('data-mode', 'article')
    expect(screen.getByRole('link', { name: 'two link' })).toBeInTheDocument()
  })

  it('sizes the spacer to the summed shot lengths in film mode', () => {
    const { container } = render(<Stage shots={shots} />)
    // jsdom's CSS parser drops svh units, so assert the length attribute the style is derived from.
    expect(container.querySelector('[data-film-spacer]')).toHaveAttribute('data-length', '2')
  })

  it('tears down cleanly when unmounted and remounted (StrictMode-safe)', () => {
    const first = render(<Stage shots={shots} />)
    first.unmount()
    const { container } = render(<Stage shots={shots} />)
    expect(container.querySelectorAll('[data-shot]')).toHaveLength(2)
  })
})
