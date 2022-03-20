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

````ts
import { mergeDirs } from 'merge-dirs'

mergeDirs({
  dest: string
  /**
   * @example
   * ```ts
   * // 1. When a folder path is passed in,
   * // all files in the current folder will be merged to dest
   *
   * // dest: /dist
   * // demo: /src/demo/1.ts, /src/demo/2.ts
   * mergeDirs({ dest: 'dist', path: ['src/demo'] })
   * // dest: /dist/1.ts, /dist/2.ts
   *
   * // 2. When a file path is passed in, the current file will be merged to dest
   *
   * // dest: /dist
   * // demo: /src/demo/1.ts
   * mergeDirs({ dest: 'dist', path: ['/src/demo/1.ts'] })
   * // dest: /dist/1.ts
   *
   * // 3. If you need to merge a single file under a folder and keep the folder path,
   * // you can use the options
   *
   * // dest: /dist
   * // demo: /src/demo/1.ts, /src/demo/2.ts, /src/demo2/2.ts
   * mergeDirs({ dest: 'dist', path: ['/src/demo/1.ts'] })
   * // dest: /dist/demo/1.ts, /dist/demo/2.ts
   * ```
   */
  paths: (
    | string
    | {
        rootDir: string
        path: string
      }
  )[]

  /**
   * ignore errors when merging and continue with subsequent merges
   */
  ignoreErrors?: boolean

  /**
   * ignore empty folders
   */
  ignoreEmptyFolders?: boolean

  /**
   * @default 'overwrite'
   */
  conflictResolution?: ConflictResolution | ConflictResolver
})
````

## Feature

Intuitive print statements on the shell, and provides path parsing capabilities.

## License

MIT
