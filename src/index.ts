import fs from 'fs-extra'
import path from 'node:path'
import {
  ConflictResolver,
  MergeDirsOptions,
  OverwriteDirectoryFunc,
  resolveOptions
} from './options'
import { collectMergeTargets } from './utils'

export type {
  ConflictResolution,
  ConflictResolver,
  Target,
  MergeDirsOptions
} from './options'

export type MergedType = 'success' | 'error'
export type MergedCallback = (
  type: MergedType,
  source: string,
  dest: string
) => void

export async function mergeDirs(
  options: MergeDirsOptions,
  callback?: MergedCallback
) {
  const {
    root = process.cwd(),
    targets,
    ignoreErrors,
    ignoreEmptyFolders
  } = resolveOptions(options)
  const mergeTargets = await collectMergeTargets(targets, root)

  let isForceEnd = false
  const merged = new Set<string>()
  const recursiveMerge = async (
    dest: string,
    root: string,
    src: string,
    conflictResolver: ConflictResolver,
    overwriteDirectory?: boolean | OverwriteDirectoryFunc
  ) => {
    if (isForceEnd) return

    const source = path.resolve(root, src)
    if (merged.has(source)) return
    if (!fs.existsSync(source)) return

    const finalPath = await conflictResolver(source, dest)
    if (finalPath === source) {
      // skip
      return
    }

    const stat = fs.statSync(source)
    if (stat.isDirectory()) {
      const files = fs.readdirSync(source)
      // ignore empty folder
      if (!files.length && ignoreEmptyFolders) {
        return
      }

      // overwrite directory
      if (
        overwriteDirectory === true ||
        (typeof overwriteDirectory === 'function' &&
          overwriteDirectory(source, dest))
      ) {
        fs.copySync(source, dest)
        return
      }

      // merge directory
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, {
          recursive: true
        })
      }

      files.forEach((file) =>
        recursiveMerge(
          path.join(dest, file),
          root,
          path.join(src, file),
          conflictResolver
        )
      )
    } else if (stat.isFile()) {
      try {
        fs.copySync(source, dest)
        merged.add(source)
        callback && callback('success', source, dest)
      } catch (error) {
        callback && callback('error', source, dest)
        if (!ignoreErrors) {
          isForceEnd = true
        }
        throw new Error(error as any)
      }
    }
  }

  mergeTargets.forEach(
    ({ dest, root, src, conflictResolver, overwriteDirectory }) =>
      recursiveMerge(dest, root, src, conflictResolver, overwriteDirectory)
  )
}
