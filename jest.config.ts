import type { Config } from '@jest/types'

const config: Config.InitialOptions = {
  rootDir: '__test__',
  preset: 'ts-jest',
  testTimeout: 30000,
  testMatch: ['**/*.spec.[jt]s?(x)'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/']
}

export default config
