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

  ignoreErrors?: boolean

  ignoreEmptyFolders?: boolean

  /**
   * @default 'overwrite'
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

function isDirectory(path: string): boolean {
  return fs.lstatSync(path).isDirectory()
}

function getLastSegmentPath(path: string) {
  return path.split('/').slice(-1)[0]
}

function resolveOptions(options: MergeDirsOptions) {
  const { dest, paths, conflictResolution } = options
  return {
    ...options,
    dest: dest.endsWith('/') ? dest.replace(/\/*$/, '') : dest,
    paths: paths.map((opt) => {
      if (typeof opt === 'string') {
        return { rootDir: '', relativePath: '', path: opt }
      }
      const { path, rootDir } = opt
      const file = getLastSegmentPath(path)
      return {
        rootDir: join(rootDir, path.slice(0, -file.length)),
        relativePath: file,
        path: file
      }
    }),
    conflictResolver:
      typeof conflictResolution === 'function'
        ? conflictResolution
        : conflictResolvers[conflictResolution || 'overwrite']
  }
}

export function mergeDirs(options: MergeDirsOptions) {
  const { dest, paths, conflictResolver, ignoreErrors, ignoreEmptyFolders } =
    resolveOptions(options)

  const doCopy = (path: string, relativePath: string, rootDir: string) => {
    const absolutePath = join(rootDir, relativePath || path)

    if (isDirectory(absolutePath)) {
      const files = fs.readdirSync(absolutePath)
      if (!files.length && ignoreEmptyFolders) {
        return
      }

      if (!rootDir) {
        // Path passed in as cwd, e.g. { paths: ['/src/demo'] }
        rootDir = absolutePath
      }

      const distDirRef = join(
        dest,
        relativePath ? relativePath : getLastSegmentPath(path)
      )
      if (!fs.existsSync(distDirRef)) {
        fs.mkdirSync(distDirRef)
      }

      files.forEach((file) => doCopy(file, join(relativePath, file), rootDir))
    } else if (fs.existsSync(absolutePath)) {
      let distPath = join(
        dest,
        // If there is no relativePath, the current path is an absolute path
        relativePath ? relativePath : getLastSegmentPath(path)
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
    paths.forEach((path) => doCopy(path.path, path.relativePath, path.rootDir))
  } catch (error) {
    console.error(error)
    if (!ignoreErrors) {
      return
    }
  }
}
