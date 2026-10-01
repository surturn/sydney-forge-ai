import { describe, it, expect, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import gsap from 'gsap'
import { SHOTS } from '@/shots'
import { placeShots } from '@/film/registry'
import { useFilmStore } from '@/film/store'

const EPS = 0.001

beforeEach(() => useFilmStore.setState({ mode: 'article', reelState: 'done' }))

/**
 * Spec §4: nothing moves inside a shot's hold window. Every tween a shot's
 * build adds must end before the hold starts or begin after it ends.
 */
describe('hold windows', () => {
  const { placed } = placeShots(SHOTS.map((s) => s.def))

  it.each(SHOTS.filter((s) => s.build).map((s) => [s.def.id, s] as const))('%s keeps its hold still', (_id, shot) => {
    const { container, unmount } = render(<shot.Component />)
    const root = container.querySelector<HTMLElement>(`[data-shot="${shot.def.id}"]`)!
    const tl = gsap.timeline({ paused: true })
    shot.build!(tl, root, placed.find((p) => p.id === shot.def.id)!)
    const holdStart = shot.def.hold[0] * shot.def.length
    const holdEnd = shot.def.hold[1] * shot.def.length

    const moving = tl
      .getChildren(true, true, false)
      .filter((t) => t.totalDuration() > 0)
      .map((t) => ({ start: t.startTime(), end: t.startTime() + t.totalDuration() }))
      .filter(({ start, end }) => end > holdStart + EPS && start < holdEnd - EPS)

    expect(moving, `tweens overlapping hold [${holdStart}, ${holdEnd}]`).toEqual([])
    tl.kill()
    unmount()
  })
})
