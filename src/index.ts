import fs from 'fs'
import { join } from 'path'

export interface MergeDirsOptions {
  dest: string
  /**
   * @example
   * ```ts
   * // 1. When a folder path is passed in,
   * // all files in the current folder will be merged to dest
   *
   * // dest: dist
   * // demo: src/demo/1.ts, src/demo/2.ts
   * mergeDirs({ dest: 'dist', path: ['src/demo'] })
   * // dest: dist/1.ts, dist/2.ts
   *
   * // 2. When a file path is passed in, the current file will be merged to dest
   *
   * // dest: dist
   * // demo: src/demo/1.ts
   * mergeDirs({ dest: 'dist', path: ['src/demo/1.ts'] })
   * // dest: dist/1.ts
   *
   * // 3. If you need to merge a single file under a folder and keep the folder path,
   * // you can use the options
   *
   * // dest: dist
   * // demo: src/demo/1.ts, src/demo/2.ts, src/demo2/2.ts
   * mergeDirs({ dest: 'dist', path: [{ rootDir: 'src', path: 'demo' }] })
   * // dest: dist/demo/1.ts, dist/demo/2.ts
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
   * 
   * @default false
   */
  ignoreErrors?: boolean

  /**
   * ignore empty folders, if true, empty folders will not be merged into dest
   * 
   * @default false
   */
  ignoreEmptyFolders?: boolean

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
  conflictResolution?: ConflictResolution | ConflictResolver
}

type ConflictResolution = 'overwrite' | 'skip'
// | 'rename'
type ConflictResolver = (source: string, dest: string) => string

const conflictResolvers: Record<ConflictResolution, ConflictResolver> = {
  overwrite: (source, dest) => {
    return dest
  },
  skip: (source, dest) => {
    return source
  }
}

function wrapperCustomResolver(resolver: ConflictResolver): ConflictResolver {
  return (source, dest) => {
    const finalDest = resolver(source, dest)
    if (finalDest !== source && finalDest !== dest) {
      const destCwd = getCurrentDir(dest)
      const finalDestCwd = getCurrentDir(finalDest)
      if (destCwd !== finalDestCwd) {
        // TODO error
      }
      return dest
    }
    return finalDest
  }
}

function isDirectory(path: string): boolean {
  return fs.lstatSync(path).isDirectory()
}

function getCurrentDir(path: string) {
  return path.split('/').slice(0, -1).join('/')
}

function getFileName(path: string) {
  return path.split('/').slice(-1)[0]
}

function resolveOptions(options: MergeDirsOptions) {
  const { paths, conflictResolution } = options
  return {
    ...options,
    paths: paths.map((opt) => {
      if (typeof opt === 'string') {
        return { rootDir: opt, path: opt, relativePath: '' }
      }
      const { path, rootDir } = opt
      const file = getFileName(path)
      return {
        rootDir: join(rootDir, path.slice(0, -file.length)),
        path: file,
        relativePath: file
      }
    }),
    conflictResolver:
      typeof conflictResolution === 'function'
        ? wrapperCustomResolver(conflictResolution)
        : conflictResolvers[conflictResolution || 'overwrite']
  }
}

export function mergeDirs(options: MergeDirsOptions) {
  const { dest, paths, conflictResolver, ignoreErrors, ignoreEmptyFolders } =
    resolveOptions(options)

  const recursiveMerge = (
    path: string,
    rootDir: string,
    relativePath: string
  ) => {
    const absolutePath = join(rootDir, relativePath)

    if (isDirectory(absolutePath)) {
      const files = fs.readdirSync(absolutePath)
      if (!files.length && ignoreEmptyFolders) {
        return
      }

      if (relativePath) {
        const distPathRef = join(dest, relativePath)
        if (!fs.existsSync(distPathRef)) {
          fs.mkdirSync(distPathRef)
        }
      }

      files.forEach((file) =>
        recursiveMerge(file, rootDir, join(relativePath, file))
      )
    } else if (fs.existsSync(absolutePath)) {
      let distPath = join(
        dest,
        // If there is no relativePath, the current path is an absolute path
        relativePath ? relativePath : getFileName(path)
      )

      // resolve conflict
      if (fs.existsSync(distPath)) {
        distPath = conflictResolver(absolutePath, distPath)
      }
      // skip overwrite
      if (distPath === absolutePath) {
        return
      }

      fs.copyFileSync(absolutePath, distPath)
    }
  }

  try {
    paths.forEach((path) =>
      recursiveMerge(path.path, path.rootDir, path.relativePath)
    )
  } catch (error) {
    console.error(error)
    if (!ignoreErrors) {
      return
    }
  }
}
