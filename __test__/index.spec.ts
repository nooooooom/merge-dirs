import fs from 'fs'
import { join } from 'path'
import { mergeDirs } from '../src'

const snapshotPath = '__test__/snapshot'

const createSnapshotFolderSync = (name: string) => {
  const folderPath = join(snapshotPath, name)

  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath)
  }

  return folderPath
}

const createCurrentTestSnapshotFolderSync = () =>
  createSnapshotFolderSync(expect.getState().currentTestName)

createSnapshotFolderSync('')

test('Merge files', (done) => {
  const dest = createCurrentTestSnapshotFolderSync()
  mergeDirs({
    dest,
    paths: ['__test__/demo/a/1.ts']
  })

  if (!fs.existsSync(`${dest}/1.ts`)) {
    return done(new Error(''))
  }

  done()
})

test('Merge files under a folder', (done) => {
  const dest = createCurrentTestSnapshotFolderSync()
  mergeDirs({
    dest,
    paths: ['__test__/demo']
  })

  if (fs.existsSync(`${dest}/demo`)) {
    return done(new Error('Relative path resolution error.'))
  }

  done()
})

test('Merge files under a folder and keep the path', (done) => {
  const dest = createCurrentTestSnapshotFolderSync()
  mergeDirs({
    dest,
    paths: [
      {
        rootDir: '__test__',
        path: 'demo'
      }
    ]
  })

  if (!fs.existsSync(`${dest}/demo`)) {
    return done(new Error('Relative path resolution error.'))
  }

  done()
})

test('Ignore empty folders', (done) => {
  const dest = createCurrentTestSnapshotFolderSync()
  mergeDirs({
    dest,
    paths: [
      {
        rootDir: '__test__',
        path: 'demo'
      }
    ],
    ignoreEmptyFolders: true
  })

  if (fs.existsSync(`${dest}/empty`)) {
    return done(new Error('Empty folders should not be copied.'))
  }

  done()
})
