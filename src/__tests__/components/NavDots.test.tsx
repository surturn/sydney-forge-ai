import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import NavDots from '@/components/NavDots'
import ProgressBar from '@/components/ProgressBar'
import { useSceneStore } from '@/lib/scrollStore'
import { SCENES } from '@/content/content'

describe('NavDots', () => {
  beforeEach(() => useSceneStore.setState({ activeScene: 0 }))

  it('renders one labelled link per scene', () => {
    render(<NavDots />)
    const nav = screen.getByRole('navigation', { name: /scenes/i })
    expect(nav).toBeInTheDocument()
    for (const scene of SCENES) {
      expect(screen.getByRole('link', { name: scene.label })).toHaveAttribute(
        'href', `#${scene.id}`,
      )
    }
  })

  it('marks only the active scene as current', () => {
    useSceneStore.setState({ activeScene: 3 })
    render(<NavDots />)
    const current = screen.getAllByRole('link').filter(
      (a) => a.getAttribute('aria-current') === 'true',
    )
    expect(current).toHaveLength(1)
    expect(current[0]).toHaveAccessibleName(SCENES[3].label)
  })
})

describe('ProgressBar', () => {
  it('is decorative and hidden from assistive technology', () => {
    const { container } = render(<ProgressBar />)
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true')
  })
})
