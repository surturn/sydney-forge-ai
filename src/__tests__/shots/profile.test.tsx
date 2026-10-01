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
    expect(within(items[1]).getByRole('link', { name: /eventify/i })).toHaveAttribute('href', '#shot-project-eventify')
    expect(within(items[4]).getByRole('link', { name: /invonics automations/i })).toBeInTheDocument()
  })
})

describe('For', () => {
  it('sets every sector and the tail line', () => {
    render(<ForShot.Component />)
    expect(screen.getByText('Event organisers')).toBeInTheDocument()
    expect(screen.getByText(/without a full-time hire/i)).toBeInTheDocument()
  })
})
