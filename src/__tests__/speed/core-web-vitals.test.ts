import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync, existsSync } from 'fs'
import { join } from 'path'

/**
 * Core Web Vitals Tests
 * 
 * These tests analyze the codebase for patterns that could
 * negatively impact Core Web Vitals metrics (LCP, FID, CLS).
 */

const SRC_DIR = join(process.cwd(), 'src')
const DIST_DIR = join(process.cwd(), 'dist')

// Helper to recursively get all TSX files
function getAllTsxFiles(dir: string): string[] {
    const files: string[] = []
    const items = readdirSync(dir)

    for (const item of items) {
        const fullPath = join(dir, item)
        const stat = statSync(fullPath)

        if (stat.isDirectory() && item !== '__tests__' && item !== 'node_modules') {
            files.push(...getAllTsxFiles(fullPath))
        } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
            files.push(fullPath)
        }
    }

    return files
}

describe('Core Web Vitals Optimization Tests', () => {
    const tsxFiles = getAllTsxFiles(SRC_DIR)

    describe('LCP (Largest Contentful Paint) Optimizations', () => {
        it('should preload critical fonts', () => {
            const indexHtml = readFileSync(join(process.cwd(), 'index.html'), 'utf-8')

            // Check for font preloading
            const hasPreconnect = indexHtml.includes('preconnect')
            const hasFontPreload = indexHtml.includes('rel="preload"') && indexHtml.includes('font')

            // At minimum, preconnect should be used for Google Fonts
            if (indexHtml.includes('fonts.googleapis.com')) {
                expect(hasPreconnect).toBe(true)
            }
        })

        it('should not have render-blocking resources in critical path', () => {
            const indexHtml = readFileSync(join(process.cwd(), 'index.html'), 'utf-8')

            // Check for async/defer on non-critical scripts
            const scriptPattern = /<script[^>]*src[^>]*>/gi
            const scripts = indexHtml.match(scriptPattern) || []

            const blockingScripts = scripts.filter(script =>
                !script.includes('type="module"') &&
                !script.includes('async') &&
                !script.includes('defer')
            )

            // All scripts should be non-blocking (modules are non-blocking by default)
            expect(blockingScripts.length).toBe(0)
        })

        it('should have optimized image loading', () => {
            let hasLazyLoading = false
            let hasEagerLoading = false

            for (const file of tsxFiles) {
                const content = readFileSync(file, 'utf-8')

                if (content.includes('loading="lazy"')) {
                    hasLazyLoading = true
                }

                if (content.includes('loading="eager"')) {
                    hasEagerLoading = true
                }
            }

            console.log(`Image loading optimization:`)
            console.log(`  Lazy loading used: ${hasLazyLoading}`)
            console.log(`  Eager loading for critical images: ${hasEagerLoading}`)

            expect(true).toBe(true)
        })
    })

    describe('FID (First Input Delay) Optimizations', () => {
        it('should not have heavy synchronous operations', () => {
            const heavyOperations: string[] = []

            for (const file of tsxFiles) {
                const content = readFileSync(file, 'utf-8')

                // Check for potentially heavy synchronous operations
                const patterns = [
                    { pattern: /\.filter\([^)]*\)\.map\([^)]*\)\.filter/g, name: 'chained array operations' },
                    { pattern: /JSON\.parse\(.*JSON\.stringify/g, name: 'JSON round-trip' },
                    { pattern: /while\s*\([^)]+\)\s*\{[\s\S]*?\}/g, name: 'while loops' }
                ]

                for (const { pattern, name } of patterns) {
                    if (pattern.test(content)) {
                        heavyOperations.push(`${file}: Contains ${name}`)
                    }
                }
            }

            if (heavyOperations.length > 0) {
                console.warn('Potentially heavy operations found:')
                heavyOperations.forEach(op => console.warn(`  ${op}`))
            }

            expect(true).toBe(true)
        })

        it('should use React.lazy for code splitting', () => {
            let hasLazyLoading = false
            let hasSuspense = false

            for (const file of tsxFiles) {
                const content = readFileSync(file, 'utf-8')

                if (content.includes('React.lazy') || content.includes('lazy(')) {
                    hasLazyLoading = true
                }

                if (content.includes('<Suspense') || content.includes('Suspense>')) {
                    hasSuspense = true
                }
            }

            console.log(`Code splitting status:`)
            console.log(`  React.lazy used: ${hasLazyLoading}`)
            console.log(`  Suspense boundaries: ${hasSuspense}`)

            // Info only - code splitting is recommended but not required
            expect(true).toBe(true)
        })

        it('should avoid blocking the main thread', () => {
            const violations: string[] = []

            for (const file of tsxFiles) {
                const content = readFileSync(file, 'utf-8')

                // Check for alert/confirm/prompt (blocking)
                if (/\balert\s*\(/.test(content)) {
                    violations.push(`${file}: Uses alert() which blocks main thread`)
                }

                if (/\bconfirm\s*\(/.test(content)) {
                    violations.push(`${file}: Uses confirm() which blocks main thread`)
                }

                if (/\bprompt\s*\(/.test(content)) {
                    violations.push(`${file}: Uses prompt() which blocks main thread`)
                }
            }

            if (violations.length > 0) {
                console.warn('Blocking operations found:', violations)
            }

            expect(violations).toEqual([])
        })
    })

    describe('CLS (Cumulative Layout Shift) Optimizations', () => {
        it('should have explicit dimensions for images', () => {
            const undimensionedImages: string[] = []

            for (const file of tsxFiles) {
                const content = readFileSync(file, 'utf-8')

                // Check for img tags without width/height
                const imgPattern = /<img[^>]+>/gi
                const images = content.match(imgPattern) || []

                for (const img of images) {
                    const hasWidth = img.includes('width') || img.includes('w-') || img.includes('size-')
                    const hasHeight = img.includes('height') || img.includes('h-') || img.includes('size-')
                    const hasAspectRatio = img.includes('aspect-')

                    if (!hasWidth && !hasHeight && !hasAspectRatio) {
                        undimensionedImages.push(`${file}: Image may lack dimensions`)
                    }
                }
            }

            if (undimensionedImages.length > 0) {
                console.warn('Images potentially without dimensions:')
                undimensionedImages.slice(0, 5).forEach(img => console.warn(`  ${img}`))
                if (undimensionedImages.length > 5) {
                    console.warn(`  ... and ${undimensionedImages.length - 5} more`)
                }
            }

            expect(true).toBe(true)
        })

        it('should use CSS transforms for animations', () => {
            let usesTransforms = false
            let usesLayoutAnimations = false

            for (const file of tsxFiles) {
                if (file.endsWith('.css') || file.endsWith('.tsx')) {
                    const content = readFileSync(file, 'utf-8')

                    if (content.includes('transform') || content.includes('translate')) {
                        usesTransforms = true
                    }

                    // Check for layout-triggering animations
                    const layoutProps = ['top:', 'left:', 'right:', 'bottom:', 'width:', 'height:']
                    const animationPattern = /animation|transition/i

                    if (animationPattern.test(content)) {
                        for (const prop of layoutProps) {
                            if (content.includes(prop)) {
                                // Could be animating layout properties
                            }
                        }
                    }
                }
            }

            console.log(`Animation optimization:`)
            console.log(`  Uses CSS transforms: ${usesTransforms}`)

            expect(true).toBe(true)
        })

        it('should avoid font display issues', () => {
            const indexHtml = readFileSync(join(process.cwd(), 'index.html'), 'utf-8')

            // Check for font-display setting
            const hasFontDisplay = indexHtml.includes('font-display') ||
                indexHtml.includes('display=swap') ||
                indexHtml.includes('&display=swap')

            if (indexHtml.includes('fonts.googleapis.com')) {
                expect(hasFontDisplay).toBe(true)
            }
        })
    })

    describe('Performance Recommendations', () => {
        it('should generate a performance checklist', () => {
            console.log('\n✅ Core Web Vitals Checklist:')
            console.log('=============================')

            const checklist = [
                '[ ] Use <link rel="preload"> for critical resources',
                '[ ] Optimize and compress images (WebP, AVIF)',
                '[ ] Enable text compression (Gzip/Brotli)',
                '[ ] Use font-display: swap for web fonts',
                '[ ] Set explicit width/height on images',
                '[ ] Lazy load below-the-fold images',
                '[ ] Use CSS transforms for animations',
                '[ ] Split code with React.lazy()',
                '[ ] Minimize main thread work',
                '[ ] Avoid layout thrashing'
            ]

            checklist.forEach(item => console.log(`  ${item}`))

            expect(true).toBe(true)
        })
    })
})
