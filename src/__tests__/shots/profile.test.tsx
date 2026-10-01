import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { WhatShot } from '@/shots/What'
import { SolvesShot } from '@/shots/Solves'
import { FiguringShot } from '@/shots/Figuring'
import { ForShot } from '@/shots/For'
import { SHOTS } from '@/shots'
import { useFilmStore } from '@/film/store'

beforeEach(() => useFilmStore.setState({ mode: 'article', activeShot: 'what', reelState: 'done' }))

describe('What', () => {
  it('leads with the idea, then the stack in simple groups with every item as text', () => {
    render(<WhatShot.Component />)
    expect(screen.getByRole('heading', { name: /i don't just build the screen\./i })).toBeInTheDocument()
    const list = screen.getByRole('list', { name: /stack, by layer/i })
    const layers = [...list.querySelectorAll('[data-layer]')]
    expect(layers.map((l) => l.getAttribute('data-layer'))).toEqual(['Frontend', 'Backend', 'Data', 'AI', 'Mobile'])
    for (const tech of ['React', 'Spring Boot', 'PostgreSQL', 'PyTorch', 'Kotlin']) {
      expect(within(list).getByText(tech)).toBeInTheDocument()
    }
  })
})

describe('Project stories', () => {
  const story = (id: string) => SHOTS.find((s) => s.def.id === `project-${id}`)!

  it('tells AssetFlow as problem, build and lesson', () => {
    const Shot = story('assetflow').Component
    render(<Shot />)
    expect(screen.getByRole('heading', { level: 2, name: /schools shouldn't have to guess where their assets are\./i })).toBeInTheDocument()
    for (const label of ['The problem', 'What I built', 'What I learned']) {
      expect(screen.getByText(label)).toBeInTheDocument()
    }
    expect(screen.getByText(/understanding how people actually work/i)).toBeInTheDocument()
  })

  it('leaves out the lesson when there is none on record', () => {
    const Shot = story('farmassist').Component
    render(<Shot />)
    expect(screen.getByText('What I built')).toBeInTheDocument()
    expect(screen.queryByText('What I learned')).toBeNull()
  })

  it('links code and live builds that are public', () => {
    const Shot = story('eventify').Component
    render(<Shot />)
    expect(screen.getByRole('link', { name: /read the code/i })).toHaveAttribute('href', 'https://github.com/surturn/ticketing-app')
    expect(screen.getByRole('link', { name: /see it live/i })).toHaveAttribute('target', '_blank')
  })
})

describe('Solves', () => {
  it('turns six capabilities into real-world scenarios, each with proof chips', () => {
    render(<SolvesShot.Component />)
    expect(screen.getByRole('heading', { name: /i like building for the real world\./i })).toBeInTheDocument()
    const items = screen.getAllByRole('listitem').filter((li) => li.hasAttribute('data-condition'))
    expect(items).toHaveLength(6)
    expect(within(items[0]).getByText('Event tickets')).toBeInTheDocument()
    expect(within(items[2]).getByText(/the software still has to work/i)).toBeInTheDocument()
    expect(within(items[4]).getByText('Invonics automations')).toHaveClass('chip')
  })
})

describe('Figuring', () => {
  it('asks open questions rather than claiming answers', () => {
    render(<FiguringShot.Component />)
    expect(screen.getByRole('heading', { name: /things i'm figuring out\./i })).toBeInTheDocument()
    const qs = screen.getAllByRole('listitem')
    expect(qs).toHaveLength(4)
    for (const q of qs) expect(q.textContent).toMatch(/\?$/)
  })
})

describe('For', () => {
  it('describes people, not industries, ending with the line they would say', () => {
    render(<ForShot.Component />)
    expect(screen.getByRole('heading', { name: /people i like building with\./i })).toBeInTheDocument()
    expect(screen.getByText(/outgrown spreadsheets/i)).toBeInTheDocument()
    expect(screen.getByText('There has to be a better way to do this.').tagName).toBe('Q')
  })
})
