import { describe, it, expect } from 'vitest'
import { placeShots, shotAt, validateShots, scrollYFor, type ShotDef } from '@/film/registry'

const shots: ShotDef[] = [
  { id: 'a', chapter: 'cover', length: 1, hold: [0, 0.5] },
  { id: 'b', chapter: 'profile', length: 3, hold: [0.4, 0.8] },
]

describe('registry', () => {
  it('places shots end to end in master progress', () => {
    const { placed, total } = placeShots(shots)
    expect(total).toBe(4)
    expect(placed[0]).toMatchObject({ start: 0, end: 0.25, holdStart: 0, holdEnd: 0.125 })
    expect(placed[1].start).toBeCloseTo(0.25)
    expect(placed[1].end).toBeCloseTo(1)
    expect(placed[1].holdStart).toBeCloseTo(0.25 + 0.4 * 0.75)
  })

  it('finds the shot containing a progress value, with 1 mapping to the last', () => {
    const { placed } = placeShots(shots)
    expect(shotAt(placed, 0).id).toBe('a')
    expect(shotAt(placed, 0.2499).id).toBe('a')
    expect(shotAt(placed, 0.25).id).toBe('b')
    expect(shotAt(placed, 1).id).toBe('b')
    expect(shotAt(placed, -0.1).id).toBe('a')
    expect(shotAt(placed, 1.4).id).toBe('b')
  })

  it.each([
    [[{ id: 'a', chapter: 'cover', length: 1, hold: [0, 0.5] }, { id: 'a', chapter: 'cover', length: 1, hold: [0, 0.5] }], /duplicate/],
    [[{ id: 'a', chapter: 'cover', length: 0, hold: [0, 0.5] }], /length/],
    [[{ id: 'a', chapter: 'cover', length: 1, hold: [0.6, 0.5] }], /hold/],
    [[{ id: 'a', chapter: 'cover', length: 1, hold: [-0.1, 0.5] }], /hold/],
    [[{ id: 'a', chapter: 'cover', length: 1, hold: [0.2, 1.2] }], /hold/],
  ])('rejects invalid shot lists', (list, msg) => {
    expect(() => validateShots(list as ShotDef[])).toThrow(msg)
  })

  it('maps progress to a scroll position inside the spacer', () => {
    expect(scrollYFor(0, 100, 5000, 1000)).toBe(100)
    expect(scrollYFor(1, 100, 5000, 1000)).toBe(4100)
    expect(scrollYFor(0.5, 100, 5000, 1000)).toBe(2100)
  })
})
