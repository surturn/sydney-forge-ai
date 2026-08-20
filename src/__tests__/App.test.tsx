import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '@/App'
import { SCENES } from '@/content/content'

describe('App', () => {
  it('renders all six scenes in order as labelled landmarks', () => {
    const { container } = render(<App />)
    const sections = Array.from(container.querySelectorAll('[data-scene]'))
    expect(sections).toHaveLength(6)
    sections.forEach((section, i) => {
      expect(section).toHaveAttribute('data-scene', String(i))
      expect(section).toHaveAttribute('id', SCENES[i].id)
    })
  })

  it('renders the scene navigation', () => {
    render(<App />)
    expect(screen.getByRole('navigation', { name: /scenes/i })).toBeInTheDocument()
  })

  it('renders the cold open heading as the single h1', () => {
    render(<App />)
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
  })
})
