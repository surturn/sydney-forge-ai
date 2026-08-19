import '@testing-library/jest-dom'
import { vi, beforeEach } from 'vitest'

class MockObserver {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
  takeRecords = vi.fn(() => [])
  root = null
  rootMargin = ''
  thresholds = []
}

vi.stubGlobal('ResizeObserver', MockObserver)
vi.stubGlobal('IntersectionObserver', MockObserver)

let matchState: Record<string, boolean> = {}

/** Set which media queries report as matching. Call inside a test before render. */
export function setMatchMedia(matches: Record<string, boolean>) {
  matchState = matches
}

beforeEach(() => {
  matchState = {}
})

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: matchState[query] ?? false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})
