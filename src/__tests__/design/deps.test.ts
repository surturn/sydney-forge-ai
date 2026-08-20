import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

const pkg = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf-8'))
const deps = { ...pkg.dependencies, ...pkg.devDependencies }

describe('dependencies', () => {
  it('has the scroll engine installed', () => {
    expect(deps).toHaveProperty('lenis')
    expect(deps).toHaveProperty('zustand')
    expect(deps).toHaveProperty('framer-motion')
  })

  it('no longer ships the retired router and page libraries', () => {
    for (const gone of [
      'react-router-dom', 'recharts', '@tanstack/react-query',
      'react-hook-form', '@hookform/resolvers', 'embla-carousel-react',
      'react-day-picker', 'date-fns', 'cmdk', 'vaul', 'input-otp',
      'react-resizable-panels', 'next-themes', 'sonner',
    ]) {
      expect(deps, `${gone} should be removed`).not.toHaveProperty(gone)
    }
  })

  it('has not installed the 3D stack yet — that is Stage 3', () => {
    expect(deps).not.toHaveProperty('three')
    expect(deps).not.toHaveProperty('@react-three/fiber')
  })
})
