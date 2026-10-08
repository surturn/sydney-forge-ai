import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mkdtempSync, cpSync, readFileSync, writeFileSync, rmSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'
import { loadContent } from '../../../vite/loadContent'

const REAL = join(process.cwd(), 'src/content')
let dir: string

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'content-'))
  cpSync(REAL, dir, { recursive: true, filter: (p) => !p.endsWith('.ts') })
})
afterEach(() => rmSync(dir, { recursive: true, force: true }))

const edit = (rel: string, fn: (s: string) => string) => {
  const p = join(dir, rel)
  writeFileSync(p, fn(readFileSync(p, 'utf-8')))
}

describe('loadContent', () => {
  it('loads the real content', () => {
    const { content } = loadContent(REAL)
    expect(content.profile.name).toBe('Sydney Kamau')
    expect(content.projects.filter((p) => p.tier === 'featured').map((p) => p.id)).toEqual([
      'assetflow', 'eventify', 'digital-twin', 'farmassist', 'forus',
    ])
    expect(content.projects.filter((p) => p.tier === 'index')).toHaveLength(5)
    expect(content.projects.filter((p) => p.status === 'Concept').map((p) => p.id)).toEqual(['halcyne', 'fenn-atelier'])
  })

  it('sorts projects by order', () => {
    const { content } = loadContent(REAL)
    const orders = content.projects.map((p) => p.order)
    expect(orders).toEqual([...orders].sort((a, b) => a - b))
  })

  it('parses files saved with Windows line endings', () => {
    edit('projects/eventify.md', (s) => s.replace(/\r?\n/g, '\r\n'))
    const { content } = loadContent(dir)
    expect(content.projects.find((p) => p.id === 'eventify')?.flow?.actors).toContain('M-Pesa')
  })

  it('names the file and field when a required field is missing', () => {
    edit('projects/eventify.md', (s) => s.replace(/^standfirst:.*\r?\n/m, ''))
    expect(() => loadContent(dir)).toThrow(/eventify\.md[\s\S]*standfirst/)
  })

  it('rejects a project story with no problem', () => {
    edit('projects/eventify.md', (s) => s.replace(/^ {2}problem:.*\r?\n/m, ''))
    expect(() => loadContent(dir)).toThrow(/eventify\.md[\s\S]*story\.problem/)
  })

  it('rejects a solves proof that names no project', () => {
    edit('profile.json', (s) => s.replace('"proof": ["digital-twin"]', '"proof": ["twin"]'))
    expect(() => loadContent(dir)).toThrow(/profile\.json[\s\S]*twin/)
  })

  it('rejects a flow step naming an unknown actor', () => {
    edit('projects/eventify.md', (s) => s.replace('from: Gate, to: Gate', 'from: Turnstile, to: Gate'))
    expect(() => loadContent(dir)).toThrow(/eventify\.md[\s\S]*Turnstile/)
  })

  it('rejects a placeholder figure without placeholder: true', () => {
    edit('projects/farmassist.md', (s) => s.replace('placeholder: true', 'placeholder: false'))
    expect(() => loadContent(dir)).toThrow(/farmassist\.md[\s\S]*placeholder/)
  })

  it('rejects unsupported markdown in a body', () => {
    edit('projects/forus.md', (s) => s + '\n\n# A heading\n')
    expect(() => loadContent(dir)).toThrow(/forus\.md[\s\S]*heading/)
  })

  it('rejects duplicate project ids', () => {
    edit('projects/forus.md', (s) => s.replace('id: forus', 'id: eventify'))
    expect(() => loadContent(dir)).toThrow(/duplicate project id "eventify"/)
  })

  it('converts a body to the restricted node tree', () => {
    const { content } = loadContent(REAL)
    const body = content.projects.find((p) => p.id === 'eventify')!.body
    expect(body.length).toBeGreaterThan(0)
    expect(['p', 'ul']).toContain(body[0].t)
  })

  it('never uses the word senior', () => {
    const { content } = loadContent(REAL)
    expect(JSON.stringify(content).toLowerCase()).not.toContain('senior')
  })
})
