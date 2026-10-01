import { describe, it, expect } from 'vitest'
import { scrollState } from '@/lib/scrollStore'

describe('scrollState', () => {
  it('is a plain mutable object, not reactive state', () => {
    expect(scrollState).toEqual({ progress: 0, velocity: 0 })
    scrollState.progress = 0.5
    expect(scrollState.progress).toBe(0.5)
    scrollState.progress = 0
  })
})
