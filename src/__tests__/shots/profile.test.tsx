import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { WhatShot } from '@/shots/What'
import { SolvesShot } from '@/shots/Solves'
import { ForShot } from '@/shots/For'
import { useFilmStore } from '@/film/store'

beforeEach(() => useFilmStore.setState({ mode: 'article', activeShot: 'what', reelState: 'done' }))

describe('What', () => {
  it('renders the stack as five labelled layers with every item as text', () => {
    render(<WhatShot.Component />)
    const list = screen.getByRole('list', { name: /stack, by layer/i })
    const layers = [...list.querySelectorAll('[data-layer]')]
    expect(layers.map((l) => l.getAttribute('data-layer'))).toEqual(['AI', 'Android', 'Web', 'Backend', 'Data / infra'])
    for (const tech of ['PyTorch', 'Kotlin', 'Fastify', 'PostgreSQL']) {
      expect(within(list).getByText(tech)).toBeInTheDocument()
    }
  })
})

describe('Solves', () => {
  it('lists six conditions, each with proof chips naming real projects', () => {
    render(<SolvesShot.Component />)
    const items = screen.getAllByRole('listitem').filter((li) => li.hasAttribute('data-condition'))
    expect(items).toHaveLength(6)
    // Project shots arrive in Stage B; until then the chips are labels, not dead links.
    expect(within(items[1]).getByText('Eventify')).toHaveClass('chip')
    expect(within(items[4]).getByText('Invonics automations')).toHaveClass('chip')
    expect(within(items[1]).queryByRole('link')).toBeNull()
  })
})

describe('For', () => {
  it('sets every sector and the tail line', () => {
    render(<ForShot.Component />)
    expect(screen.getByText('Event organisers')).toBeInTheDocument()
    expect(screen.getByText(/without a full-time hire/i)).toBeInTheDocument()
  })
})
