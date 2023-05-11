#!/usr/bin/env node
const { cac } = require('cac')
const { mergeDirs } = require('../dist/index')

const cli = cac('merge-dirs')

cli
  .command('[src] [dest]', 'merge dirs')
  .option(
    '-r, --root [root]',
    `['overwrite' | 'skip'] resolve duplicate file conflicts`
  )
  .option(
    '-c, --conflictResolution [resolution]',
    `['overwrite' | 'skip'] resolve duplicate file conflicts`
  )
  .option(
    '-f, --ignoreErrors',
    `[boolean] ignore/not ignore to ignore the error and just execute it`
  )
  .option('-i, --ignoreEmptyFolders', `[boolean] keep/omit empty folders`)
  .action((src, dest, options) => {
    console.log('start merge dirs')

    mergeDirs({
      targets: [
        {
          src,
          dest,
          root: options.root,
          conflictResolution: options.conflictResolution
        }
      ],
      ignoreErrors: options.ignoreErrors,
      ignoreEmptyFolders: options.ignoreEmptyFolders
    })
  })

cli.help()
cli.version(require('../package.json').version)

cli.parse()
