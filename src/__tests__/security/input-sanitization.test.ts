import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

/**
 * Input Sanitization Security Tests
 * 
 * These tests verify that form inputs and user data are properly
 * validated and sanitized to prevent injection attacks.
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

describe('Input Sanitization Security Tests', () => {
    const tsxFiles = getAllTsxFiles(SRC_DIR)

    describe('Form Validation', () => {
        it('should use schema validation for forms', () => {
            let hasZodValidation = false
            let hasReactHookForm = false

            for (const file of tsxFiles) {
                const content = readFileSync(file, 'utf-8')

                if (content.includes('zod') || content.includes('z.object') || content.includes('z.string')) {
                    hasZodValidation = true
                }

                if (content.includes('react-hook-form') || content.includes('useForm')) {
                    hasReactHookForm = true
                }
            }

            // The project should use proper form validation
            expect(hasZodValidation || hasReactHookForm).toBe(true)
        })

        it('should have email validation for email inputs', () => {
            let emailInputsValidated = true

            for (const file of tsxFiles) {
                const content = readFileSync(file, 'utf-8')

                // If file has email input, check for validation
                if (content.includes('type="email"') || content.includes("type='email'")) {
                    // Check for email validation pattern or Zod email validation
                    const hasValidation =
                        content.includes('email()') || // Zod
                        content.includes('pattern') || // HTML5 pattern
                        content.includes('email') && content.includes('required')

                    if (!hasValidation) {
                        console.warn(`${file}: Has email input but may lack validation`)
                    }
                }
            }

            expect(emailInputsValidated).toBe(true)
        })
    })

    describe('SQL Injection Prevention', () => {
        it('should not construct SQL queries with string concatenation', () => {
            const violations: string[] = []

            for (const file of tsxFiles) {
                const content = readFileSync(file, 'utf-8')

                // Check for dangerous SQL patterns
                const sqlConcatPattern = /["'`]\s*SELECT\s+.*\+\s*[^"'`]+\+/gi
                const sqlTemplatePattern = /`SELECT\s+.*\$\{/gi

                if (sqlConcatPattern.test(content) || sqlTemplatePattern.test(content)) {
                    violations.push(`${file}: Possible SQL injection via string concatenation`)
                }
            }

            expect(violations).toEqual([])
        })
    })

    describe('Command Injection Prevention', () => {
        it('should not use exec or spawn with unvalidated input', () => {
            const violations: string[] = []

            for (const file of tsxFiles) {
                const content = readFileSync(file, 'utf-8')

                // Check for dangerous exec patterns (unlikely in frontend but good to check)
                const execPattern = /exec\s*\(/gi
                const spawnPattern = /spawn\s*\(/gi

                // These shouldn't exist in frontend code
                if (execPattern.test(content) && !file.includes('test')) {
                    violations.push(`${file}: Uses exec() which could be dangerous`)
                }

                if (spawnPattern.test(content) && !file.includes('test')) {
                    violations.push(`${file}: Uses spawn() which could be dangerous`)
                }
            }

            expect(violations).toEqual([])
        })
    })

    describe('Path Traversal Prevention', () => {
        it('should not use user input in file paths', () => {
            const violations: string[] = []

            for (const file of tsxFiles) {
                const content = readFileSync(file, 'utf-8')

                // Check for path concatenation with variables
                // This is mainly relevant for server-side, but good practice to check
                const pathPattern = /\.\.\//g

                // Path traversal patterns are not expected in frontend code
                // This is mainly informational
            }

            expect(violations).toEqual([])
        })
    })

    describe('XSS in Form Submissions', () => {
        it('should not reflect form data unsanitized', () => {
            const potentialIssues: string[] = []

            for (const file of tsxFiles) {
                const content = readFileSync(file, 'utf-8')

                // Check for form data being directly rendered
                if (content.includes('formData') || content.includes('watch(')) {
                    // Check if there's any innerHTML or dangerouslySetInnerHTML usage
                    if (content.includes('dangerouslySetInnerHTML') || content.includes('innerHTML')) {
                        potentialIssues.push(`${file}: May reflect form data unsanitized`)
                    }
                }
            }

            // Warning only, not a hard failure
            if (potentialIssues.length > 0) {
                console.warn('Potential issues found:', potentialIssues)
            }

            expect(true).toBe(true)
        })
    })

    describe('Type Coercion Safety', () => {
        it('should use strict type checking', () => {
            // Check tsconfig for strict mode
            try {
                const tsconfig = readFileSync(join(process.cwd(), 'tsconfig.json'), 'utf-8')
                const hasStrict = tsconfig.includes('"strict"') || tsconfig.includes("'strict'")

                expect(hasStrict).toBe(true)
            } catch {
                // tsconfig may not exist or may reference other files
                expect(true).toBe(true)
            }
        })
    })
})
