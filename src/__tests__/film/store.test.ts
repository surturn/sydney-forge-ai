import { describe, it, expect, vi, afterEach } from 'vitest'
import { resolveMode, readStored, writeStored, useFilmStore } from '@/film/store'

afterEach(() => vi.restoreAllMocks())

describe('resolveMode', () => {
  it('defaults to film', () => {
    expect(resolveMode({ reducedMotion: false, saveData: false, stored: null })).toEqual({ mode: 'film', reason: 'default' })
  })
  it('honours reduced motion', () => {
    expect(resolveMode({ reducedMotion: true, saveData: false, stored: null })).toEqual({ mode: 'article', reason: 'reduced-motion' })
  })
  it('honours Save-Data', () => {
    expect(resolveMode({ reducedMotion: false, saveData: true, stored: null })).toEqual({ mode: 'article', reason: 'save-data' })
  })
  it('lets an explicit choice win over environment', () => {
    expect(resolveMode({ reducedMotion: true, saveData: false, stored: 'film' })).toEqual({ mode: 'film', reason: 'toggle' })
    expect(resolveMode({ reducedMotion: false, saveData: false, stored: 'article' })).toEqual({ mode: 'article', reason: 'toggle' })
  })
})

describe('storage helpers', () => {
  it('return null and do not throw when storage is unavailable', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('denied') })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('denied') })
    expect(readStored('x')).toBeNull()
    expect(() => writeStored('x', '1')).not.toThrow()
    expect(() => writeStored('x', '1', true)).not.toThrow()
  })
})

describe('useFilmStore', () => {
  it('does not notify when the active shot is unchanged', () => {
    const listener = vi.fn()
    const unsub = useFilmStore.subscribe(listener)
    const current = useFilmStore.getState().activeShot
    useFilmStore.getState().setActiveShot(current)
    expect(listener).not.toHaveBeenCalled()
    unsub()
  })
})
