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

`merge-dirs` is based on the parsing mode of [`fast-glob`](https://github.com/mrmlnc/fast-glob), which will merge all matched paths into dest.

Consider the directory structure:

```
|- dest
   |- bar
      |- a.ts
|- foo
   |- b.ts
   |- bar
      |- c.ts
```

We need to merge `foo` and all files in `bar` into `dest`:

```ts
await mergeDirs({
  targets: [
    {
      dest: 'dest',
      src: ['source/foo/*']
    }
  ]
})
```

it will become:

```
|- dest
   |- bar
      |- a.ts
      |- c.ts
   |- b.ts
|- foo
   |- b.ts
   |- bar
      |- c.ts
```

The expectation of `merge-dirs` is to merge all files and folders recursively, but sometimes you may need to overwrite the entire folder instead of merging the files under the folder, you can use `target.overwriteDirectory`:

```ts
await mergeDirs({
  targets: [
    {
      dest: 'dest',
      src: ['source/foo/*'],
      overwriteDirectory: true
    }
  ]
})
```

it will become:

```
|- dest
   |- bar
      |- c.ts
   |- b.ts
|- foo
   |- b.ts
   |- bar
      |- c.ts
```

### Options

See [options.ts](https://github.com/nooooooom/merge-dirs/blob/main/src/options.ts#L56).

## Feature

Intuitive print statements on the shell, and provides path parsing capabilities.

## License

MIT
