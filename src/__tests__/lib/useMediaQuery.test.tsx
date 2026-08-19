import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { setMatchMedia } from '../setup'
import { useMediaQuery, usePrefersReducedMotion, useCoarsePointer } from '@/lib/useMediaQuery'

describe('useMediaQuery', () => {
  it('reports false when the query does not match', () => {
    const { result } = renderHook(() => useMediaQuery('(min-width: 900px)'))
    expect(result.current).toBe(false)
  })

  it('reports true when the query matches', () => {
    setMatchMedia({ '(min-width: 900px)': true })
    const { result } = renderHook(() => useMediaQuery('(min-width: 900px)'))
    expect(result.current).toBe(true)
  })
})

describe('usePrefersReducedMotion', () => {
  it('is false by default', () => {
    const { result } = renderHook(() => usePrefersReducedMotion())
    expect(result.current).toBe(false)
  })

  it('is true when the user asks for reduced motion', () => {
    setMatchMedia({ '(prefers-reduced-motion: reduce)': true })
    const { result } = renderHook(() => usePrefersReducedMotion())
    expect(result.current).toBe(true)
  })
})

describe('useCoarsePointer', () => {
  it('is false on a fine pointer at desktop width', () => {
    const { result } = renderHook(() => useCoarsePointer())
    expect(result.current).toBe(false)
  })

  it('is true when the primary pointer is coarse', () => {
    setMatchMedia({ '(pointer: coarse)': true })
    const { result } = renderHook(() => useCoarsePointer())
    expect(result.current).toBe(true)
  })

  it('is true on a narrow viewport even with a fine pointer', () => {
    setMatchMedia({ '(max-width: 767px)': true })
    const { result } = renderHook(() => useCoarsePointer())
    expect(result.current).toBe(true)
  })
})
