import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { setMatchMedia } from '../setup'
import Scene0TitleCard from '@/scenes/Scene0_TitleCard'
import { content } from '@/content/content'

describe('Scene 0 — Cold Open', () => {
  it('renders the name as the page heading', () => {
    render(<Scene0TitleCard />)
    expect(
      screen.getByRole('heading', { level: 1, name: /sydney kamau/i }),
    ).toBeInTheDocument()
  })

  it('renders role, location and coordinates', () => {
    render(<Scene0TitleCard />)
    expect(screen.getByText(new RegExp(content.identity.role, 'i'))).toBeInTheDocument()
    expect(screen.getByText(/nairobi/i)).toBeInTheDocument()
    expect(screen.getByText(content.identity.coords)).toBeInTheDocument()
  })

  it('renders all its content under reduced motion', () => {
    setMatchMedia({ '(prefers-reduced-motion: reduce)': true })
    render(<Scene0TitleCard />)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    expect(screen.getByText(content.identity.coords)).toBeInTheDocument()
  })

  it('sits inside a labelled scene landmark', () => {
    render(<Scene0TitleCard />)
    expect(screen.getByRole('region', { name: 'Cold Open' })).toHaveAttribute('data-scene', '0')
  })
})
