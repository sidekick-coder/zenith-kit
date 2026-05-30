// eslint-disable-next-line import/extensions
import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        watch: false,
        exclude: [
            '**/node_modules/**',
            '**/dist/**',
            '**/build/**',
            '**/coverage/**',
            '**/logs/**',
            '**/root/**'
        ],
        projects: [
            {
                test: {
                    name: 'unit',
                    include: ['**/*.unit.test.ts'],
                    exclude: ['**/modules/**'],
                    setupFiles: ['src/server/__tests__/setup.ts'],
                }
            },
            {
                test: {
                    name: 'integration',
                    include: ['**/*.int.test.ts'],
                    exclude: ['**/modules/**'],
                    testTimeout: 60000, // Increase timeout for integration tests
                    hookTimeout: 60000, // Increase hook timeout for integration tests
                }
            }
        ]
    },
})
