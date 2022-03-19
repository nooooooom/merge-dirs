
export function mergeDirs(options: MergeDirsOptions) {
  const { dest, paths, conflictResolver, ignoreErrors } =
    resolveOptions(options)

  const doCopy = (path: string, parentPath = '', rootDir = '') => {
    const absolutePath = join(rootDir, parentPath || path)
    if (isDirectory(absolutePath)) {
      const files = fs.readdirSync(absolutePath)
      if (!rootDir) {
        rootDir = absolutePath
      }

      const distPath = join(
        dest,
        parentPath ? parentPath : getLastSegmentPath(path)
      )
      if (parentPath && !parentPath.includes('/') && !fs.existsSync(distPath)) {
        fs.mkdirSync(distPath)
      }

      files.forEach((file) => doCopy(file, join(parentPath, file), rootDir))
    } else if (fs.existsSync(absolutePath)) {
      let dist = join(
        dest,
        // If there is no parentPath, the current path is an absolute path
        parentPath ? parentPath : getLastSegmentPath(path)
      )
      if (fs.existsSync(dist)) {
        // dist file exists
        dist = conflictResolver(absolutePath, dist)
      }

      if (dist === absolutePath) {
        return
      }

      fs.copyFileSync(absolutePath, dist)
    }
  }

  try {
    paths.forEach((path) => doCopy(path.path, '', path.rootDir))
  } catch (error) {
    console.error(error)
    if (!ignoreErrors) {
      return
    }
  }
}