import fs from 'fs-extra'
import { join } from 'path'
import { expect, test } from 'vitest'
import { mergeDirs } from '../src'

const SNAPSHOT_PATH = '__test__/snapshot'

const cleanSnapshot = () => {
  fs.rmSync(SNAPSHOT_PATH, {
    force: true,
    recursive: true
  })
}

test('files', async () => {
  cleanSnapshot()
  await mergeDirs({
    targets: [
      {
        dest: SNAPSHOT_PATH,
        src: '__test__/fixtures/**/*.ts'
      }
    ]
  })
  expect((await fs.stat(join(SNAPSHOT_PATH, '4.ts'))).isFile()).toBeTruthy()
})

test('directories', async () => {
  cleanSnapshot()
  await mergeDirs({
    targets: [
      {
        dest: SNAPSHOT_PATH,
        src: '__test__/fixtures/*'
      }
    ]
  })
  expect((await fs.stat(join(SNAPSHOT_PATH, 'b/2.ts'))).isFile()).toBeTruthy()
})

test('ignore directory', async () => {
  cleanSnapshot()
  await mergeDirs({
    targets: [
      {
        dest: SNAPSHOT_PATH,
        src: '__test__/fixtures/*',
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
        src: '__test__/fixtures/**/*.ts'
      }
    ]
  })
  expect(fs.existsSync(join(SNAPSHOT_PATH, '1.ts'))).toBeTruthy()
})

test('overwrite directory', async () => {
  cleanSnapshot()
  await mergeDirs({
    targets: [
      {
        dest: SNAPSHOT_PATH,
        src: '__test__/fixtures/*'
      }
    ]
  })
  await mergeDirs({
    targets: [
      {
        dest: SNAPSHOT_PATH,
        src: '__test__/fixtures1/a',
        overwriteDirectory: true
      }
    ]
  })
  expect(fs.existsSync(join(SNAPSHOT_PATH, 'a/1.ts'))).toBeFalsy()
})
