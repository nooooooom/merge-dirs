#!/usr/bin/env node
const { cac } = require('cac')
const { mergeDirs } = require('../dist/index')

const cli = cac('merge-dirs')

cli
  .command('[path] [dest]', 'merge dirs')
  .option(
    '-c, --conflictResolution [resolution]',
    `['overwrite' | 'skip'] resolve duplicate file conflicts`
  )
  .option(
    '-f, --ignoreErrors',
    `[boolean] ignore/not ignore to ignore the error and just execute it`
  )
  .option('-i, --ignoreEmptyFolders', `[boolean] keep/omit empty folders`)
  .action((path, dest, options) => {
    mergeDirs({
      paths: [path].filter(Boolean),
      dest,
      ignoreErrors: options.ignoreErrors,
      ignoreEmptyFolders: options.ignoreEmptyFolders
    })
  })

cli.help()
cli.version(require('../package.json').version)

cli.parse()
