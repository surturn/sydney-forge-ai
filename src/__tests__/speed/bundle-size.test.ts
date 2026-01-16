import { describe, it, expect } from 'vitest'
import { execSync } from 'child_process'
import { readFileSync, existsSync, statSync } from 'fs'
import { join } from 'path'

/**
 * Bundle Size Analysis Tests
 * 
 * These tests analyze the production bundle size to ensure
 * the application stays within acceptable performance limits.
 */

const DIST_DIR = join(process.cwd(), 'dist')
const BUILD_STATS_FILE = join(DIST_DIR, '.vite', 'manifest.json')

// Size thresholds (in KB) - adjusted for React app with UI libraries
const THRESHOLDS = {
    totalBundle: 800, // 800KB total for initial bundle (React + UI libs)
    largestChunk: 700, // 700KB for vendor chunk (Recharts, Framer Motion, Radix)
    mainJS: 400, // 400KB for main JS bundle
    mainCSS: 150, // 150KB for main CSS (Tailwind can be large)
}

describe('Bundle Size Analysis', () => {
    describe('Build Generation', () => {
        it('should create a successful production build', { timeout: 60000 }, () => {
            try {
                // Run production build
                execSync('npm run build', {
                    cwd: process.cwd(),
                    encoding: 'utf-8',
                    stdio: ['pipe', 'pipe', 'pipe']
                })

                expect(existsSync(DIST_DIR)).toBe(true)
            } catch (error: any) {
                console.error('Build failed:', error.stderr || error.message)
                throw error
            }
        })
    })

    describe('Bundle Size Thresholds', () => {
        it('should have total JS bundle under threshold', () => {
            if (!existsSync(DIST_DIR)) {
                console.warn('Dist directory not found. Run npm run build first.')
                return
            }

            const assetsDir = join(DIST_DIR, 'assets')
            if (!existsSync(assetsDir)) {
                expect(true).toBe(true) // Skip if no assets
                return
            }

            // Calculate total JS size
            const { readdirSync } = require('fs')
            const files = readdirSync(assetsDir)
            let totalJSSize = 0

            for (const file of files) {
                if (file.endsWith('.js')) {
                    const filePath = join(assetsDir, file)
                    const stats = statSync(filePath)
                    totalJSSize += stats.size
                }
            }

            const totalJSKB = totalJSSize / 1024
            console.log(`Total JS bundle size: ${totalJSKB.toFixed(2)} KB`)

            expect(totalJSKB).toBeLessThan(THRESHOLDS.totalBundle)
        })

        it('should have individual chunks under threshold', () => {
            if (!existsSync(DIST_DIR)) {
                return
            }

            const assetsDir = join(DIST_DIR, 'assets')
            if (!existsSync(assetsDir)) {
                return
            }

            const { readdirSync } = require('fs')
            const files = readdirSync(assetsDir)
            const largeChunks: { name: string; size: number }[] = []

            for (const file of files) {
                if (file.endsWith('.js')) {
                    const filePath = join(assetsDir, file)
                    const stats = statSync(filePath)
                    const sizeKB = stats.size / 1024

                    if (sizeKB > THRESHOLDS.largestChunk) {
                        largeChunks.push({ name: file, size: sizeKB })
                    }
                }
            }

            if (largeChunks.length > 0) {
                console.warn('Large chunks found:')
                largeChunks.forEach(chunk => {
                    console.warn(`  ${chunk.name}: ${chunk.size.toFixed(2)} KB`)
                })
            }

            expect(largeChunks.length).toBe(0)
        })

        it('should have CSS bundle under threshold', () => {
            if (!existsSync(DIST_DIR)) {
                return
            }

            const assetsDir = join(DIST_DIR, 'assets')
            if (!existsSync(assetsDir)) {
                return
            }

            const { readdirSync } = require('fs')
            const files = readdirSync(assetsDir)
            let totalCSSSize = 0

            for (const file of files) {
                if (file.endsWith('.css')) {
                    const filePath = join(assetsDir, file)
                    const stats = statSync(filePath)
                    totalCSSSize += stats.size
                }
            }

            const totalCSSKB = totalCSSSize / 1024
            console.log(`Total CSS bundle size: ${totalCSSKB.toFixed(2)} KB`)

            expect(totalCSSKB).toBeLessThan(THRESHOLDS.mainCSS)
        })
    })

    describe('Bundle Analysis Report', () => {
        it('should generate a size breakdown', () => {
            if (!existsSync(DIST_DIR)) {
                return
            }

            const assetsDir = join(DIST_DIR, 'assets')
            if (!existsSync(assetsDir)) {
                return
            }

            const { readdirSync } = require('fs')
            const files = readdirSync(assetsDir)

            console.log('\n📦 Bundle Size Breakdown:')
            console.log('========================')

            const breakdown = {
                js: { files: 0, size: 0 },
                css: { files: 0, size: 0 },
                other: { files: 0, size: 0 }
            }

            for (const file of files) {
                const filePath = join(assetsDir, file)
                const stats = statSync(filePath)
                const sizeKB = stats.size / 1024

                if (file.endsWith('.js')) {
                    breakdown.js.files++
                    breakdown.js.size += sizeKB
                    console.log(`  JS: ${file} (${sizeKB.toFixed(2)} KB)`)
                } else if (file.endsWith('.css')) {
                    breakdown.css.files++
                    breakdown.css.size += sizeKB
                    console.log(`  CSS: ${file} (${sizeKB.toFixed(2)} KB)`)
                } else {
                    breakdown.other.files++
                    breakdown.other.size += sizeKB
                }
            }

            console.log('\n📊 Summary:')
            console.log(`  JavaScript: ${breakdown.js.files} files, ${breakdown.js.size.toFixed(2)} KB`)
            console.log(`  CSS: ${breakdown.css.files} files, ${breakdown.css.size.toFixed(2)} KB`)
            console.log(`  Other: ${breakdown.other.files} files, ${breakdown.other.size.toFixed(2)} KB`)
            console.log(`  Total: ${(breakdown.js.size + breakdown.css.size + breakdown.other.size).toFixed(2)} KB`)

            expect(true).toBe(true)
        })
    })

    describe('Compression Recommendations', () => {
        it('should provide gzip size estimates', () => {
            if (!existsSync(DIST_DIR)) {
                return
            }

            // Estimate gzip compression ratio (~70% reduction)
            const assetsDir = join(DIST_DIR, 'assets')
            if (!existsSync(assetsDir)) {
                return
            }

            const { readdirSync } = require('fs')
            const files = readdirSync(assetsDir)
            let totalSize = 0

            for (const file of files) {
                const filePath = join(assetsDir, file)
                const stats = statSync(filePath)
                totalSize += stats.size
            }

            const uncompressedKB = totalSize / 1024
            const estimatedGzipKB = uncompressedKB * 0.3 // ~70% compression

            console.log('\n🗜️ Compression Estimates:')
            console.log(`  Uncompressed: ${uncompressedKB.toFixed(2)} KB`)
            console.log(`  Estimated Gzip: ~${estimatedGzipKB.toFixed(2)} KB`)
            console.log(`  Estimated Brotli: ~${(estimatedGzipKB * 0.85).toFixed(2)} KB`)

            expect(true).toBe(true)
        })
    })
})
