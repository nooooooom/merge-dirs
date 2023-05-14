import fastglob from 'fast-glob'
import { ResolvedTarget } from './options'
import path from 'node:path'

export interface MergeTarget extends Omit<ResolvedTarget, 'src'> {
  root: string
  src: string
}

export const collectMergeTargets = async (
  targets: ResolvedTarget[],
  root: string
) => {
  const mergeTargets: MergeTarget[] = []

  for (const target of targets) {
    const { src, dest, ignore, flatten, overwriteDirectory, conflictResolver } =
      target
    const matchedPaths = await fastglob(src, {
      onlyFiles: false,
      dot: true,
      ignore,
      cwd: root
    })

    for (const matchedPath of matchedPaths) {
      const { base, dir } = path.parse(matchedPath)
      const destDir =
        flatten || (!flatten && !dir)
          ? dest
          : dir.replace(dir.split('/')[0]!, dest)

      mergeTargets.push({
        root,
        src: matchedPath,
        dest: path.join(destDir, base),
        overwriteDirectory,
        conflictResolver
      })
    }
  }

  return mergeTargets
}
