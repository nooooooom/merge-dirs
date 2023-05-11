# merge-dirs

Node module for synchronously and recursively merging multiple folders or collections of files into one folder.

[![npm version](https://badge.fury.io/js/@nooooooom%2Fmerge-dirs.svg)](https://badge.fury.io/js/@nooooooom%2Fmerge-dirs)

## Install

```sh
yarn add @nooooooom/merge-dirs --dev
# or
pnpm install @nooooooom/merge-dirs --save-dev
```

## Usage

```ts
import { mergeDirs } from 'merge-dirs'

mergeDirs({
  targets: [
    {
      /**
       * Destination path of the merge operation.
       */
      dest: 'dest',

      /**
       * path or glob
       */
      src: 'fixtures/test.ts',

      /**
       * An array of glob patterns to exclude matches.
       * This is an alternative way to use negative patterns.
       */
      ignore: ['**/node_modules'],

      /**
       * Whether to flatten the matched files.
       *
       * @default false
       */
      flatten: false,

      /**
       * How to resolve file conflicts, optional with:
       *
       * 'overwrite' | 'skip' | ((source: string, dest: string) => string)
       *
       * If you want to customize the conflict resolver,
       * please return the path where the files need to be merged eventually,
       * the valid values are source or dest or any filename in the same directory as dest
       *
       * @default 'overwrite'
       *
       * 'overwrite' | 'skip' | ((source: string, dest: string) => string)
       */
      conflictResolution: 'overwrite'
    }
  ],

  /**
   * ignore errors when merging and continue with subsequent merges
   *
   * @default false
   */
  ignoreErrors: false,

  /**
   * ignore empty folders, if true, empty folders will not be merged into dest
   *
   * @default false
   */
  ignoreEmptyFolders: false
})
// -> dest/fixtures/test.ts
```

## Feature

Intuitive print statements on the shell, and provides path parsing capabilities.

## License

MIT
