import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

const pkg = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf-8'))
const deps = { ...pkg.dependencies, ...pkg.devDependencies }

describe('dependencies', () => {
  it('has the film engine installed', () => {
    for (const name of ['gsap', 'lenis', 'zustand', 'zod']) {
      expect(deps, `${name} should be installed`).toHaveProperty(name)
    }
  })

  it('has the build-time content tooling as dev dependencies', () => {
    expect(pkg.devDependencies).toHaveProperty('yaml')
    expect(pkg.devDependencies).toHaveProperty('marked')
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

  it('never installs a 3D stack', () => {
    for (const name of ['three', '@react-three/fiber', '@react-three/drei']) {
      expect(deps).not.toHaveProperty(name)
    }
  })
})
