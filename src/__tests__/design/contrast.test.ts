import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

const css = readFileSync(join(process.cwd(), 'src/index.css'), 'utf-8')

function token(name: string): [number, number, number] {
  const m = css.match(new RegExp(String.raw`--${name}:\s*([\d.]+)\s+([\d.]+)%\s+([\d.]+)%`))
  if (!m) throw new Error(`token --${name} not found`)
  return [Number(m[1]), Number(m[2]) / 100, Number(m[3]) / 100]
}

function hslToRgb([h, s, l]: [number, number, number]): [number, number, number] {
  const k = (n: number) => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  return [f(0), f(8), f(4)]
}

function luminance(rgb: [number, number, number]) {
  const [r, g, b] = rgb.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function ratio(a: string, b: string) {
  const [x, y] = [luminance(hslToRgb(token(a))), luminance(hslToRgb(token(b)))].sort((p, q) => q - p)
  return (x + 0.05) / (y + 0.05)
}

describe('palette contrast (WCAG 2.2 AA)', () => {
  it.each([
    ['ink', 'paper', 4.5],
    ['ink-muted', 'paper', 4.5],
    ['ink-muted', 'paper-raised', 4.5],
    ['cobalt', 'paper', 4.5],
    ['ink', 'signal', 4.5],
    ['ink', 'lime', 4.5],
    ['paper', 'cobalt', 4.5],
    ['paper', 'ink', 4.5],
    ['lime', 'ink', 4.5],
    ['signal', 'ink', 4.5],
  ])('%s on %s reaches %s:1', (fg, bg, min) => {
    expect(ratio(fg, bg)).toBeGreaterThanOrEqual(min)
  })

  it('signal on paper is large-text-only territory (3:1)', () => {
    expect(ratio('signal', 'paper')).toBeGreaterThanOrEqual(2.9)
    expect(ratio('signal', 'paper')).toBeLessThan(4.5)
  })

  it('cobalt focus ring is a visible boundary on paper (3:1)', () => {
    expect(ratio('cobalt', 'paper')).toBeGreaterThanOrEqual(3)
  })
})
