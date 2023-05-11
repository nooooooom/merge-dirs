export type ConflictResolution = 'overwrite' | 'skip'
export type ConflictResolver = (src: string, dest: string) => string

export type Target = {
  /**
   * Destination path of the merge operation.
   */
  dest: string

  /**
   * Project root directory. Can be an absolute path, or a path relative from
   * the location of the config file itself.
   *
   * @default process.cwd()
   */
  root?: string

  /**
   * path or glob
   */
  src: string | string[]

  /**
   * An array of glob patterns to exclude matches.
   * This is an alternative way to use negative patterns.
   */
  ignore?: string[]

  flatten?: boolean

  /**
   * How to resolve file conflicts, optional with:
   *
   * 'overwrite' | 'skip' | ((src: string, dest: string) => string)
   *
   * If you want to customize the conflict resolver,
   * please return the path where the files need to be merged eventually,
   * the valid values are src or dest or any filename in the same directory as dest.
   *
   * @default 'overwrite'
   *
   * 'overwrite' | 'skip' | ((src: string, dest: string) => string)
   */
  conflictResolution?: ConflictResolution | ConflictResolver
}

export interface MergeDirsOptions {
  /**
   * Array of targets to merge.
   */
  targets: Target[]

  /**
   * Ignore errors when merging and continue with subsequent merges.
   *
   * @default false
   */
  ignoreErrors?: boolean

  /**
   * Ignore empty folders, if true, empty folders will not be merged into dest.
   *
   * @default false
   */
  ignoreEmptyFolders?: boolean
}

export interface ResolvedTarget
  extends Omit<Target, 'root' | 'conflictResolution'> {
  root: string
  conflictResolver: ConflictResolver
}

export interface ResolvedMergeDirsOptions
  extends Omit<MergeDirsOptions, 'target'> {
  targets: ResolvedTarget[]
}

const conflictResolvers: Record<ConflictResolution, ConflictResolver> = {
  overwrite: (src, dest) => dest,
  skip: (src, dest) => src
} as const

export const resolveOptions = (
  options: MergeDirsOptions
): ResolvedMergeDirsOptions => {
  return {
    ...options,
    targets: options.targets.map((target) => {
      const { conflictResolution = 'overwrite' } = target
      return {
        root: '',
        ...target,
        conflictResolver:
          typeof conflictResolution === 'function'
            ? conflictResolution
            : conflictResolvers[conflictResolution]
      }
    })
  }
}
