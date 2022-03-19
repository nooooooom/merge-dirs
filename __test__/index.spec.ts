import fs from 'fs'
import { mergeDirs } from '../src'

const rimraf = require('rimraf')

const dest = '__test__/snapshot'

const clearSnapshot = () => rimraf.sync(`${dest}/*`)

test('Merge files', () => {
  mergeDirs({
    dest,
    paths: ['__test__/demo/a/1.ts']
  })

  clearSnapshot()
})

test('Merge files under a folder', () => {
  mergeDirs({
    dest,
    paths: ['__test__/demo']
  })

  clearSnapshot()
})

test('Merge files under a folder and keep the path', () => {
  mergeDirs({
    dest,
    paths: [
      {
        rootDir: '__test__',
        path: 'demo'
      }
    ]
  })

  clearSnapshot()
})

test('Ignore empty folders', (done) => {
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

  clearSnapshot()
})
