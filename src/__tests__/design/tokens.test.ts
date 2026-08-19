// src/__tests__/design/tokens.test.ts
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

const css = readFileSync(join(process.cwd(), 'src/index.css'), 'utf-8')
const html = readFileSync(join(process.cwd(), 'index.html'), 'utf-8')
const tw = readFileSync(join(process.cwd(), 'tailwind.config.ts'), 'utf-8')

describe('Dusk design tokens', () => {
  it('defines the Dusk palette tokens', () => {
    expect(css).toContain('--ground: 254 37% 7%')
    expect(css).toContain('--ink: 38 35% 92%')
    expect(css).toContain('--amber: 24 100% 62%')
    expect(css).toContain('--gold: 42 86% 63%')
  })

  it('maps semantic tokens onto Dusk', () => {
    expect(css).toContain('--background: 254 37% 7%')
    expect(css).toContain('--primary: 24 100% 62%')
  })

  it('keeps radius at zero', () => {
    expect(css).toContain('--radius: 0rem')
  })

  it('has no light-mode block', () => {
    expect(css).not.toContain('.dark {')
    expect(css).not.toMatch(/prefers-color-scheme/)
  })

  it('defines the full type scale', () => {
    for (const step of ['--step--1', '--step-0', '--step-4', '--step-8']) {
      expect(css).toContain(step)
    }
  })

  it('registers the three families in Tailwind', () => {
    expect(tw).toContain("'Bodoni Moda'")
    expect(tw).toContain("'Inter Tight'")
    expect(tw).toContain("'IBM Plex Mono'")
  })

  it('loads the fonts with the attributes the perf/security tests require', () => {
    expect(html).toContain('Bodoni+Moda')
    expect(html).toContain('IBM+Plex+Mono')
    expect(html).toContain('Inter+Tight')
    expect(html).toContain('display=swap')
    expect(html).toMatch(/rel\s*=\s*["']preconnect["']/)
    expect(html).toContain('crossorigin')
  })

  it('no longer loads the retired families', () => {
    expect(html).not.toContain('Fraunces')
    expect(html).not.toContain('JetBrains+Mono')
  })
})
