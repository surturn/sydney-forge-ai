import { describe, it, expect } from 'vitest'
import { content, SCENES } from '@/content/content'

describe('content module', () => {
  it('carries identity without a phone number', () => {
    expect(content.identity.name).toBe('Sydney Kamau')
    expect(content.identity.location).toBe('Nairobi, Kenya')
    expect(content.identity.email).toBe('sydneykamau2005@gmail.com')
    expect(JSON.stringify(content)).not.toMatch(/794\s?817\s?115/)
    expect(JSON.stringify(content)).not.toMatch(/\+254/)
  })

  it('has three panels in scene 1 and a grouped stack rail', () => {
    expect(content.scene1.panels).toHaveLength(3)
    const groups = content.scene1.stack.map((g) => g.group)
    expect(groups).toEqual(['Languages', 'Frameworks', 'Tools', 'Competencies'])
    for (const g of content.scene1.stack) expect(g.items.length).toBeGreaterThan(0)
  })

  it('carries exactly the four CV projects, each with stack and poster', () => {
    expect(content.projects.map((p) => p.id)).toEqual([
      'assetflow', 'eventify', 'farmassist', 'leadgen',
    ])
    for (const p of content.projects) {
      expect(p.stack.length).toBeGreaterThan(0)
      expect(p.bullets.length).toBeGreaterThan(0)
      expect(p).toHaveProperty('poster.alt')
    }
  })

  it('carries five credentials', () => {
    expect(content.credentials).toHaveLength(5)
  })

  it('exposes six scenes with stable ids', () => {
    expect(SCENES).toHaveLength(6)
    expect(SCENES.map((s) => s.id)).toEqual([
      'cold-open', 'personal', 'work', 'hobbies', 'credentials', 'outro',
    ])
    SCENES.forEach((s, i) => expect(s.index).toBe(i))
  })

  it('outro links contain no phone and include email and github', () => {
    const kinds = content.outro.links.map((l) => l.kind)
    expect(kinds).toContain('email')
    expect(content.outro.links.some((l) => l.href.includes('github.com/surturn'))).toBe(true)
    expect(content.outro.links.every((l) => !l.href.startsWith('tel:'))).toBe(true)
  })
})
