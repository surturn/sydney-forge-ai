import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

const css = readFileSync(join(process.cwd(), 'src/index.css'), 'utf-8')
const html = readFileSync(join(process.cwd(), 'index.html'), 'utf-8')
const tw = readFileSync(join(process.cwd(), 'tailwind.config.ts'), 'utf-8')

describe('Matatu pop design tokens', () => {
  it('defines the palette', () => {
    expect(css).toContain('--paper: 35 100% 94%')
    expect(css).toContain('--ink: 249 27% 10%')
    expect(css).toContain('--cobalt: 232 100% 57%')
    expect(css).toContain('--signal: 13 100% 56%')
    expect(css).toContain('--lime: 73 86% 57%')
  })

  it('maps semantic tokens onto the palette', () => {
    expect(css).toContain('--background: 35 100% 94%')
    expect(css).toContain('--foreground: 249 27% 10%')
    expect(css).toContain('--ring: 232 100% 57%')
  })

  it('keeps radius at zero and has no theme blocks', () => {
    expect(css).toContain('--radius: 0rem')
    expect(css).not.toContain('.dark {')
    expect(css).not.toMatch(/prefers-color-scheme/)
  })

  it('retires the Dusk palette', () => {
    for (const gone of ['--ground', '--amber', '--gold', '--dusk', '.dusk-bg']) {
      expect(css).not.toContain(gone)
    }
  })

  it('defines the full type scale', () => {
    for (const step of ['--step--1', '--step-0', '--step-4', '--step-8']) {
      expect(css).toContain(step)
    }
  })

  it('registers the three families and the palette in Tailwind', () => {
    expect(tw).toContain("'Bodoni Moda'")
    expect(tw).toContain("'Inter Tight'")
    expect(tw).toContain("'IBM Plex Mono'")
    expect(tw).toContain('paper')
    expect(tw).not.toContain('sidebar')
  })

  it('loads roman and italic Bodoni with the perf/security attributes', () => {
    expect(html).toContain('Bodoni+Moda:ital,opsz,wght@')
    expect(html).toContain('IBM+Plex+Mono')
    expect(html).toContain('Inter+Tight')
    expect(html).toContain('display=swap')
    expect(html).toMatch(/rel\s*=\s*["']preconnect["']/)
    expect(html).toContain('crossorigin')
  })

  it('loads the font stylesheet without blocking first paint', () => {
    const withoutNoscript = html.replace(/<noscript>[\s\S]*?<\/noscript>/g, '')
    const fontLinks = withoutNoscript.match(/<link[^>]*fonts\.googleapis\.com\/css2[^>]*>/g) ?? []
    expect(fontLinks.length).toBeGreaterThan(0)
    for (const link of fontLinks) {
      expect(link).toMatch(/rel="preload"/)
      expect(link).toMatch(/as="style"/)
    }
    // No-JS visitors still get the fonts.
    expect(html).toMatch(/<noscript>\s*<link[^>]*rel="stylesheet"[^>]*fonts\.googleapis\.com/)
  })
})
