import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { setMatchMedia } from '../setup'
import Scene1Personal from '@/scenes/Scene1_Personal'
import { content } from '@/content/content'

describe('Scene 1 — Personal', () => {
  it('renders all three panels', () => {
    render(<Scene1Personal />)
    for (const panel of content.scene1.panels) {
      expect(screen.getByText(panel.heading.join(' '))).toBeInTheDocument()
    }
  })

  it('renders every stack group and every item in the rail', () => {
    render(<Scene1Personal />)
    const rail = screen.getByRole('list', { name: /technical stack/i })
    for (const group of content.scene1.stack) {
      expect(within(rail).getByText(group.group)).toBeInTheDocument()
      for (const item of group.items) {
        expect(within(rail).getByText(item)).toBeInTheDocument()
      }
    }
  })

  it('uses a horizontal track on a fine pointer at desktop width', () => {
    render(<Scene1Personal />)
    expect(screen.getByTestId('scene1-track')).toHaveAttribute('data-layout', 'horizontal')
  })

  it('collapses to a vertical stack on a coarse pointer', () => {
    setMatchMedia({ '(pointer: coarse)': true })
    render(<Scene1Personal />)
    expect(screen.getByTestId('scene1-track')).toHaveAttribute('data-layout', 'stacked')
  })

  it('collapses to a vertical stack on a narrow viewport', () => {
    setMatchMedia({ '(max-width: 767px)': true })
    render(<Scene1Personal />)
    expect(screen.getByTestId('scene1-track')).toHaveAttribute('data-layout', 'stacked')
  })

  it('still renders every panel under reduced motion', () => {
    setMatchMedia({ '(prefers-reduced-motion: reduce)': true })
    render(<Scene1Personal />)
    for (const panel of content.scene1.panels) {
      expect(screen.getByText(panel.heading.join(' '))).toBeInTheDocument()
    }
  })
})
