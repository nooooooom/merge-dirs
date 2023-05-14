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

export interface MergeParams {
  source: string
  dest: string
}

export interface MergeDirsResult {
  successes: MergeParams[]
  errors: MergeParams[]
}

export async function mergeDirs(
  options: MergeDirsOptions
): Promise<MergeDirsResult> {
  const {
    root = process.cwd(),
    targets,
    ignoreErrors,
    ignoreEmptyFolders
  } = resolveOptions(options)
  const mergeTargets = await collectMergeTargets(targets, root)

  const successes: MergeParams[] = []
  const errors: MergeParams[] = []

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
    if (!fs.pathExists(source)) return

    try {
      const stat = await fs.stat(source)

      const finalPath = await conflictResolver(source, dest)
      if (finalPath === source) {
        // skip
        return
      }

      if (stat.isDirectory()) {
        const files = await fs.readdir(source)
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
          await fs.rm(dest, {
            force: true,
            recursive: true
          })
          await fs.copy(source, dest, {
            recursive: true
          })
          return
        }

        // merge directory
        if (
          !(await fs.pathExists(dest)) ||
          !(await fs.stat(dest)).isDirectory()
        ) {
          await fs.rm(dest, {
            force: true,
            recursive: true
          })
          await fs.mkdir(dest, {
            recursive: true
          })
        }

        for (const file of files)
          await recursiveMerge(
            path.join(dest, file),
            root,
            path.join(src, file),
            conflictResolver
          )
      } else if (stat.isFile()) {
        await fs.copy(source, dest, {
          overwrite: true
        })
        merged.add(source)
        successes.push({
          source,
          dest
        })
      }
    } catch (error) {
      errors.push({
        source,
        dest
      })
      if (!ignoreErrors) {
        isForceEnd = true
        throw new Error(error as any)
      }
    }
  }

  for (const mergeTarget of mergeTargets) {
    const { dest, root, src, conflictResolver, overwriteDirectory } =
      mergeTarget
    await recursiveMerge(dest, root, src, conflictResolver, overwriteDirectory)
  }

  return {
    successes,
    errors
  }
}
