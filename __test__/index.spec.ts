import fs from 'fs'
import { join } from 'path'
import { expect, test } from 'vitest'
import { mergeDirs } from '../src'

const SNAPSHOT_PATH = '__test__/snapshot'

const cleanSnapshot = () => {
  fs.rmSync(SNAPSHOT_PATH, {
    force: true,
    recursive: true
  })
  fs.mkdirSync(SNAPSHOT_PATH, {
    recursive: true
  })
}

test('single file', async () => {
  cleanSnapshot()
  await mergeDirs({
    targets: [
      {
        dest: SNAPSHOT_PATH,
        src: '__test__/fixtures/a/1.ts',
        flatten: true
      }
    ]
  })
  expect(fs.existsSync(join(SNAPSHOT_PATH, '1.ts'))).toBeTruthy()
})

test('single directory', async () => {
  cleanSnapshot()
  await mergeDirs({
    targets: [
      {
        dest: SNAPSHOT_PATH,
        src: '__test__/fixtures/*',
        flatten: true
      }
    ]
  })
  expect(fs.existsSync(join(SNAPSHOT_PATH, 'b/2.ts'))).toBeTruthy()
})

test('ignore directory', async () => {
  cleanSnapshot()
  await mergeDirs({
    targets: [
      {
        dest: SNAPSHOT_PATH,
        src: '__test__/fixtures/*',
        flatten: true,
        ignore: ['**/b']
      }
    ]
  })
  expect(fs.existsSync(join(SNAPSHOT_PATH, 'b'))).toBeFalsy()
})

test('specified files', async () => {
  cleanSnapshot()
  await mergeDirs({
    targets: [
      {
        dest: SNAPSHOT_PATH,
        src: '__test__/fixtures/**/*.ts',
        flatten: true
      }
    ]
  })
  expect(fs.existsSync(join(SNAPSHOT_PATH, '1.ts'))).toBeTruthy()
})

test('specified files with directory', async () => {
  cleanSnapshot()
  await mergeDirs({
    targets: [
      {
        dest: SNAPSHOT_PATH,
        root: '__test__/fixtures',
        src: '**/*.ts'
      }
    ]
  })
  expect(fs.existsSync(join(SNAPSHOT_PATH, 'a/1.ts'))).toBeTruthy()
})
