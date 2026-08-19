import { describe, it, expect, beforeEach } from 'vitest'
import {
  computeSceneProgress,
  activeSceneFrom,
  scrollState,
  useSceneStore,
} from '@/lib/scrollStore'

describe('computeSceneProgress', () => {
  const VH = 800

  it('is 0 when the scene sits exactly below the fold', () => {
    expect(computeSceneProgress(800, 800, VH).progress).toBe(0)
  })

  it('is 1 when the scene has fully passed above the viewport', () => {
    expect(computeSceneProgress(-800, 800, VH).progress).toBe(1)
  })

  it('is 0.5 at the midpoint of its travel', () => {
    // travel = vh + height = 1600; midpoint when vh - top = 800 -> top = 0
    expect(computeSceneProgress(0, 800, VH).progress).toBeCloseTo(0.5, 5)
  })

  it('clamps below 0 and above 1', () => {
    expect(computeSceneProgress(5000, 800, VH).progress).toBe(0)
    expect(computeSceneProgress(-5000, 800, VH).progress).toBe(1)
  })

  it('marks visibility only while some part is on screen', () => {
    expect(computeSceneProgress(799, 800, VH).visible).toBe(true)
    expect(computeSceneProgress(801, 800, VH).visible).toBe(false)
    expect(computeSceneProgress(-799, 800, VH).visible).toBe(true)
    expect(computeSceneProgress(-800, 800, VH).visible).toBe(false)
  })
})

describe('activeSceneFrom', () => {
  it('picks the visible scene whose progress is nearest the middle', () => {
    const scenes = [
      { progress: 0.95, visible: true },
      { progress: 0.45, visible: true },
      { progress: 0.0, visible: false },
    ]
    expect(activeSceneFrom(scenes)).toBe(1)
  })

  it('falls back to the last scene it passed when nothing is visible', () => {
    const scenes = [
      { progress: 1, visible: false },
      { progress: 1, visible: false },
      { progress: 0, visible: false },
    ]
    expect(activeSceneFrom(scenes)).toBe(1)
  })
})

describe('scrollState', () => {
  it('is a plain mutable object, not React state', () => {
    scrollState.progress = 0.42
    expect(scrollState.progress).toBe(0.42)
    scrollState.progress = 0
  })
})

describe('useSceneStore', () => {
  beforeEach(() => {
    useSceneStore.setState({ activeScene: 0, reducedMotion: false, coarsePointer: false })
  })

  it('updates the active scene', () => {
    useSceneStore.getState().setActiveScene(3)
    expect(useSceneStore.getState().activeScene).toBe(3)
  })

  it('returns an identical state object when the scene has not changed', () => {
    const before = useSceneStore.getState()
    before.setActiveScene(0)
    expect(useSceneStore.getState()).toBe(before)
  })

  it('merges environment flags', () => {
    useSceneStore.getState().setEnv({ reducedMotion: true })
    expect(useSceneStore.getState().reducedMotion).toBe(true)
    expect(useSceneStore.getState().coarsePointer).toBe(false)
  })
})
