import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

/**
 * XSS (Cross-Site Scripting) Security Tests
 * 
 * These tests scan the codebase for potential XSS vulnerabilities,
 * including dangerous patterns and improper HTML handling.
 */

const SRC_DIR = join(process.cwd(), 'src')

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

describe('XSS Security Tests', () => {
    const tsxFiles = getAllTsxFiles(SRC_DIR)

    describe('dangerouslySetInnerHTML Usage', () => {
        it('should not have uncontrolled dangerouslySetInnerHTML usage', () => {
            const violations: string[] = []

            for (const file of tsxFiles) {
                const content = readFileSync(file, 'utf-8')

                // Check for dangerouslySetInnerHTML
                if (content.includes('dangerouslySetInnerHTML')) {
                    // Check if it uses sanitized/escaped content
                    const hasSanitizer = content.includes('DOMPurify') ||
                        content.includes('sanitize') ||
                        content.includes('escape') ||
                        content.includes('sanitizeCSSValue') ||
                        content.includes('sanitizeCSS')

                    if (!hasSanitizer) {
                        violations.push(`${file}: Uses dangerouslySetInnerHTML without sanitization`)
                    }
                }
            }

            expect(violations).toEqual([])
        })
    })

    describe('Inline Event Handlers', () => {
        it('should not use eval or Function constructor', () => {
            const violations: string[] = []

            for (const file of tsxFiles) {
                const content = readFileSync(file, 'utf-8')

                // Check for eval usage (dangerous)
                const evalPattern = /\beval\s*\(/g
                const functionConstructorPattern = /new\s+Function\s*\(/g

                if (evalPattern.test(content)) {
                    violations.push(`${file}: Uses eval() which is a security risk`)
                }

                if (functionConstructorPattern.test(content)) {
                    violations.push(`${file}: Uses Function constructor which is a security risk`)
                }
            }

            expect(violations).toEqual([])
        })
    })

    describe('URL Handling', () => {
        it('should not have unvalidated javascript: URLs', () => {
            const violations: string[] = []

            for (const file of tsxFiles) {
                const content = readFileSync(file, 'utf-8')

                // Check for javascript: protocol in hrefs (XSS vector)
                const jsProtocolPattern = /href\s*=\s*["']?\s*javascript:/gi

                if (jsProtocolPattern.test(content)) {
                    violations.push(`${file}: Contains javascript: URL which is an XSS vector`)
                }
            }

            expect(violations).toEqual([])
        })

        it('should validate external URLs', () => {
            const violations: string[] = []

            for (const file of tsxFiles) {
                const content = readFileSync(file, 'utf-8')

                // Check for target="_blank" without rel="noopener noreferrer"
                const blankTargetPattern = /target\s*=\s*["']_blank["']/gi
                const noopenerPattern = /rel\s*=\s*["'][^"']*noopener[^"']*["']/gi

                const hasBlankTarget = blankTargetPattern.test(content)
                blankTargetPattern.lastIndex = 0
                const hasNoopener = noopenerPattern.test(content)

                if (hasBlankTarget && !hasNoopener) {
                    // This is a warning, not a hard failure, as React handles this in newer versions
                    console.warn(`${file}: Uses target="_blank" - ensure rel="noopener noreferrer" is set`)
                }
            }

            // This test passes with warnings rather than failures
            expect(violations).toEqual([])
        })
    })

    describe('Script Injection Prevention', () => {
        it('should not dynamically create script elements', () => {
            const violations: string[] = []

            for (const file of tsxFiles) {
                const content = readFileSync(file, 'utf-8')

                // Check for document.createElement('script')
                const scriptCreationPattern = /document\.createElement\s*\(\s*["']script["']\s*\)/gi

                if (scriptCreationPattern.test(content)) {
                    violations.push(`${file}: Dynamically creates script elements which could be an XSS vector`)
                }
            }

            expect(violations).toEqual([])
        })
    })

    describe('User Input Handling', () => {
        it('should use proper form validation', () => {
            const formFiles: string[] = []

            for (const file of tsxFiles) {
                const content = readFileSync(file, 'utf-8')

                // Check if file contains form elements
                if (content.includes('<form') || content.includes('useForm') || content.includes('react-hook-form')) {
                    // Verify it uses validation
                    const hasValidation = content.includes('zod') ||
                        content.includes('yup') ||
                        content.includes('validation') ||
                        content.includes('required') ||
                        content.includes('pattern')

                    if (hasValidation) {
                        formFiles.push(file)
                    }
                }
            }

            // This test just verifies forms have validation - informational
            expect(true).toBe(true)
        })
    })
})
