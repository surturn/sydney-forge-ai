import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { CoverShot } from '@/shots/Cover'
import { WhoShot } from '@/shots/Who'
import { BackCoverShot } from '@/shots/BackCover'
import { useFilmStore } from '@/film/store'

beforeEach(() => useFilmStore.setState({ mode: 'article', activeShot: 'cover', reelState: 'done' }))

describe('Cover', () => {
  it('has the single h1 with the readable name', () => {
    render(<CoverShot.Component />)
    expect(screen.getByRole('heading', { level: 1, name: 'Sydney Kamau' })).toBeInTheDocument()
  })

  it('shows positioning, three proof chips and both CTAs in the first frame', () => {
    render(<CoverShot.Component />)
    expect(screen.getByText(/solution nobody has drawn yet/i)).toBeInTheDocument()
    for (const name of ['AssetFlow Schools', 'Eventify', 'Digital Twin']) {
      expect(screen.getByRole('link', { name: new RegExp(name) })).toBeInTheDocument()
    }
    expect(screen.getByRole('link', { name: /work with me/i })).toHaveAttribute('href', '#shot-back-cover')
    expect(screen.getByRole('link', { name: /hiring\? cv/i })).toHaveAttribute('target', '_blank')
  })

  it('loads the portrait eagerly at high priority with explicit dimensions', () => {
    render(<CoverShot.Component />)
    const img = screen.getByRole('img', { name: /portrait of sydney kamau/i })
    expect(img).toHaveAttribute('loading', 'eager')
    expect(img).toHaveAttribute('fetchpriority', 'high')
    expect(img).toHaveAttribute('width', '1200')
    expect(img).toHaveAttribute('height', '1500')
  })

  it('captions placeholder figures as placeholders', () => {
    render(<CoverShot.Component />)
    expect(screen.getByText(/placeholder/i)).toBeInTheDocument()
  })
})

describe('Who', () => {
  it('states who and links Invonics', () => {
    render(<WhoShot.Component />)
    expect(screen.getByRole('heading', { level: 2, name: /engineer\. founder\./i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /invonics technologies/i })).toHaveAttribute('href', 'https://invonicstechnologies.com')
  })
})

describe('Back cover (interim)', () => {
  it('lists every contact link and the CV', () => {
    render(<BackCoverShot.Component />)
    const region = screen.getByRole('region', { name: /write to me/i })
    for (const name of ['Email', 'GitHub', 'LinkedIn', 'Invonics Technologies']) {
      expect(within(region).getByRole('link', { name })).toBeInTheDocument()
    }
    expect(within(region).getByRole('link', { name: /bring me onto your project/i }).getAttribute('href')).toMatch(/^mailto:sydneykamau2005@gmail\.com\?subject=/)
    expect(within(region).getByRole('link', { name: /hiring\? cv/i })).toBeInTheDocument()
  })

  it('never renders a phone number', () => {
    const { container } = render(<BackCoverShot.Component />)
    expect(container.textContent).not.toMatch(/\+?254|tel:/)
    expect(container.querySelector('a[href^="tel:"]')).toBeNull()
  })
})
