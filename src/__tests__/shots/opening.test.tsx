import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { CoverShot } from '@/shots/Cover'
import { WhoShot } from '@/shots/Who'
import { ContextShot } from '@/shots/Context'
import { BackCoverShot } from '@/shots/BackCover'
import { useFilmStore } from '@/film/store'

beforeEach(() => useFilmStore.setState({ mode: 'article', activeShot: 'cover', reelState: 'done' }))

describe('Cover', () => {
  it('has the single h1 with the readable name', () => {
    render(<CoverShot.Component />)
    expect(screen.getByRole('heading', { level: 1, name: 'Sydney Kamau' })).toBeInTheDocument()
  })

  it('leads with the positioning line, in a person’s voice', () => {
    render(<CoverShot.Component />)
    expect(screen.getByText(/obvious solution isn't good enough/i)).toBeInTheDocument()
    expect(screen.getByText(/okay, let's figure it out/i)).toBeInTheDocument()
  })

  it('offers human CTAs first and keeps the CV as a secondary link', () => {
    render(<CoverShot.Component />)
    const links = screen.getAllByRole('link')
    expect(links.map((l) => l.textContent)).toEqual(['Have a project?', "See what I've built", "Hiring? Here's my CV ↗"])
    expect(links[0]).toHaveAttribute('href', '#shot-back-cover')
    expect(links[1]).toHaveAttribute('href', '#shot-project-assetflow')
    expect(links[2]).toHaveAttribute('target', '_blank')
    expect(links[2]).not.toHaveClass('btn-signal')
  })

  it('shows the real portrait eagerly at high priority with explicit dimensions', () => {
    render(<CoverShot.Component />)
    const img = screen.getByRole('img', { name: /portrait of sydney kamau/i })
    expect(img).toHaveAttribute('src', '/images/sydney-portrait.jpg')
    expect(img).toHaveAttribute('loading', 'eager')
    expect(img).toHaveAttribute('fetchpriority', 'high')
    expect(img).toHaveAttribute('width', '1080')
    expect(img).toHaveAttribute('height', '1080')
    expect(screen.queryByText(/placeholder/i)).toBeNull()
    expect(screen.getByText(/browser tabs/i)).toBeInTheDocument()
  })
})

describe('Who', () => {
  it('asks what I actually do, answers with real problems, and links Invonics', () => {
    render(<WhoShot.Component />)
    expect(screen.getByRole('heading', { level: 2, name: /so, what do i actually do\?/i })).toBeInTheDocument()
    expect(screen.getByText(/information scattered everywhere/i)).toBeInTheDocument()
    expect(screen.getByText(/currently building/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /invonics technologies/i })).toHaveAttribute('href', 'https://invonicstechnologies.com')
  })
})

describe('Context', () => {
  it('tells a short origin, not a biography', () => {
    render(<ContextShot.Component />)
    expect(screen.getByRole('heading', { level: 2, name: /a little context\./i })).toBeInTheDocument()
    expect(screen.getByText(/five-year plan/i)).toBeInTheDocument()
    expect(screen.getByText(/that's kind of the point\./i)).toBeInTheDocument()
  })
})

describe('Back cover', () => {
  it('invites rather than pitches, and lists every contact link and the CV', () => {
    render(<BackCoverShot.Component />)
    const region = screen.getByRole('region', { name: /tell me what you're trying to build/i })
    expect(within(region).getByText(/have a messy problem\?/i)).toBeInTheDocument()
    for (const name of ['Email', 'GitHub', 'LinkedIn', 'Invonics Technologies']) {
      expect(within(region).getByRole('link', { name })).toBeInTheDocument()
    }
    expect(within(region).getByRole('link', { name: /let's talk/i }).getAttribute('href')).toMatch(/^mailto:sydneykamau2005@gmail\.com\?subject=/)
    expect(within(region).getByRole('link', { name: /hiring\? here's my cv/i })).toBeInTheDocument()
  })

  it('never renders a phone number', () => {
    const { container } = render(<BackCoverShot.Component />)
    expect(container.textContent).not.toMatch(/\+?254|tel:/)
    expect(container.querySelector('a[href^="tel:"]')).toBeNull()
  })
})
