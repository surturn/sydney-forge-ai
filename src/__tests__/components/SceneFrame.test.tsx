import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import SceneFrame from '@/components/SceneFrame'

describe('SceneFrame', () => {
  it('renders as a labelled landmark carrying its scene index', () => {
    render(<SceneFrame index={2} id="work" label="Work"><p>body</p></SceneFrame>)
    const section = screen.getByRole('region', { name: 'Work' })
    expect(section).toHaveAttribute('id', 'work')
    expect(section).toHaveAttribute('data-scene', '2')
  })

  it('renders its children', () => {
    render(<SceneFrame index={0} id="cold-open" label="Cold Open"><p>hello</p></SceneFrame>)
    expect(screen.getByText('hello')).toBeInTheDocument()
  })

  it('hides decorative layers from assistive technology', () => {
    const { container } = render(
      <SceneFrame index={0} id="cold-open" label="Cold Open"><p>hi</p></SceneFrame>,
    )
    const decorations = container.querySelectorAll('[data-decoration]')
    expect(decorations.length).toBeGreaterThan(0)
    decorations.forEach((d) => expect(d).toHaveAttribute('aria-hidden', 'true'))
  })
})
