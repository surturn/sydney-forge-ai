import { describe, it, expect } from 'vitest'
import { execSync } from 'child_process'

/**
 * Dependency Security Tests
 * 
 * These tests check for known vulnerabilities in npm dependencies
 * using npm audit functionality.
 */

describe('Dependency Security Tests', () => {
    describe('npm Audit', () => {
        it('should not have critical vulnerabilities', () => {
            try {
                // Run npm audit and capture output
                const auditOutput = execSync('npm audit --json', {
                    encoding: 'utf-8',
                    stdio: ['pipe', 'pipe', 'pipe']
                })

                const auditResult = JSON.parse(auditOutput)
                const criticalCount = auditResult.metadata?.vulnerabilities?.critical || 0

                expect(criticalCount).toBe(0)
            } catch (error: any) {
                // npm audit exits with non-zero if vulnerabilities found
                if (error.stdout) {
                    const auditResult = JSON.parse(error.stdout)
                    const criticalCount = auditResult.metadata?.vulnerabilities?.critical || 0

                    if (criticalCount > 0) {
                        console.error(`Found ${criticalCount} critical vulnerabilities!`)
                        console.error('Run "npm audit" for details and "npm audit fix" to attempt fixes.')
                    }

                    // Only fail on critical vulnerabilities
                    expect(criticalCount).toBe(0)
                } else {
                    // Unexpected error
                    throw error
                }
            }
        })

        it('should report high severity vulnerabilities (warning)', () => {
            try {
                const auditOutput = execSync('npm audit --json', {
                    encoding: 'utf-8',
                    stdio: ['pipe', 'pipe', 'pipe']
                })

                const auditResult = JSON.parse(auditOutput)
                const highCount = auditResult.metadata?.vulnerabilities?.high || 0

                if (highCount > 0) {
                    console.warn(`Warning: ${highCount} high severity vulnerabilities found.`)
                    console.warn('Consider running "npm audit fix" to address these.')
                }

                // This is a warning, not a failure
                expect(true).toBe(true)
            } catch (error: any) {
                if (error.stdout) {
                    const auditResult = JSON.parse(error.stdout)
                    const highCount = auditResult.metadata?.vulnerabilities?.high || 0

                    if (highCount > 0) {
                        console.warn(`Warning: ${highCount} high severity vulnerabilities found.`)
                    }
                }

                expect(true).toBe(true)
            }
        })

        it('should provide vulnerability summary', () => {
            try {
                const auditOutput = execSync('npm audit --json', {
                    encoding: 'utf-8',
                    stdio: ['pipe', 'pipe', 'pipe']
                })

                const auditResult = JSON.parse(auditOutput)
                const vulnerabilities = auditResult.metadata?.vulnerabilities || {}

                console.log('Vulnerability Summary:')
                console.log(`  Critical: ${vulnerabilities.critical || 0}`)
                console.log(`  High: ${vulnerabilities.high || 0}`)
                console.log(`  Moderate: ${vulnerabilities.moderate || 0}`)
                console.log(`  Low: ${vulnerabilities.low || 0}`)
                console.log(`  Info: ${vulnerabilities.info || 0}`)

                expect(true).toBe(true)
            } catch (error: any) {
                if (error.stdout) {
                    const auditResult = JSON.parse(error.stdout)
                    const vulnerabilities = auditResult.metadata?.vulnerabilities || {}

                    console.log('Vulnerability Summary:')
                    console.log(`  Critical: ${vulnerabilities.critical || 0}`)
                    console.log(`  High: ${vulnerabilities.high || 0}`)
                    console.log(`  Moderate: ${vulnerabilities.moderate || 0}`)
                    console.log(`  Low: ${vulnerabilities.low || 0}`)
                    console.log(`  Info: ${vulnerabilities.info || 0}`)
                }

                expect(true).toBe(true)
            }
        })
    })

    describe('Outdated Dependencies', () => {
        it('should check for outdated packages', { timeout: 30000 }, () => {
            try {
                const outdatedOutput = execSync('npm outdated --json', {
                    encoding: 'utf-8',
                    stdio: ['pipe', 'pipe', 'pipe']
                })

                if (outdatedOutput.trim()) {
                    const outdated = JSON.parse(outdatedOutput)
                    const outdatedCount = Object.keys(outdated).length

                    if (outdatedCount > 0) {
                        console.log(`${outdatedCount} packages have updates available.`)
                        console.log('Run "npm outdated" for details.')
                    }
                }

                expect(true).toBe(true)
            } catch (error: any) {
                // npm outdated exits with 1 if outdated packages found
                if (error.stdout && error.stdout.trim()) {
                    try {
                        const outdated = JSON.parse(error.stdout)
                        const majorUpdates = Object.entries(outdated).filter(([_, info]: [string, any]) => {
                            return info.current?.split('.')[0] !== info.latest?.split('.')[0]
                        })

                        if (majorUpdates.length > 0) {
                            console.warn(`${majorUpdates.length} packages have major version updates available.`)
                        }
                    } catch {
                        // JSON parse error, skip
                    }
                }

                expect(true).toBe(true)
            }
        })
    })
})
