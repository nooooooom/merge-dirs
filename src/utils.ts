import fs from 'fs-extra'
import fastglob from 'fast-glob'
import { ResolvedTarget } from './options'
import path from 'node:path'

export interface MergeTarget extends Omit<ResolvedTarget, 'src'> {
  src: string
}

export const collectMergeTargets = (targets: ResolvedTarget[]) => {
  const mergeTargets: MergeTarget[] = []

  for (const target of targets) {
    const { root, src, dest, ignore, flatten, conflictResolver } = target
    const matchedPaths = fastglob.sync(src, {
      onlyFiles: false,
      dot: true,
      ignore,
      cwd: root
    })

    for (const matchedPath of matchedPaths) {
      const srcStat = fs.statSync(path.resolve(root, matchedPath))
      const { base, dir } = path.parse(matchedPath)
      const destDir =
        flatten || (!flatten && !dir)
          ? dest
          : srcStat.isFile()
          ? path.join(dest, dir)
          : dir.replace(dir.split('/')[0]!, dest)

      mergeTargets.push({
        root,
        src: matchedPath,
        dest: path.join(destDir, base),
        conflictResolver
      })
    }
  }

  return mergeTargets
}
