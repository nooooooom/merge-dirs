import fs from 'fs-extra'
import path from 'node:path'
import { ConflictResolver, MergeDirsOptions, resolveOptions } from './options'
import { collectMergeTargets } from './utils'

export type {
  ConflictResolution,
  ConflictResolver,
  Target,
  MergeDirsOptions
} from './options'

export async function mergeDirs(options: MergeDirsOptions) {
  const { targets, ignoreErrors, ignoreEmptyFolders } = resolveOptions(options)
  const mergeTargets = await collectMergeTargets(targets)

  let isForceEnd = false
  const merged = new Set<string>()
  const recursiveMerge = async (
    dest: string,
    root: string,
    src: string,
    conflictResolver: ConflictResolver
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
      if (!files.length && ignoreEmptyFolders) {
        // ignore empty folder
        return
      }

      if (!fs.existsSync(dest)) {
        // TODO: support overwrite all directory
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
        // TODO: collect success
      } catch (error) {
        // TODO: collect error
        if (!ignoreErrors) {
          isForceEnd = true
        }
        console.error(error)
      }
    }
  }

  mergeTargets.forEach(({ dest, root, src, conflictResolver }) =>
    recursiveMerge(dest, root, src, conflictResolver)
  )
}
