# Library Output

TODO

TODO: explain UMD in greater detail

TODO: Webpack supports the [UMD format](https://github.com/umdjs/umd). UMD is compatible with multiple environments (CommonJS, AMD, globals) making it good for distribution purposes.

Allowing webpack to output your bundle in the UMD format is simple. Webpack allows you to control the output format using [output.libraryTarget](https://webpack.js.org/configuration/output/#output-librarytarget) field. It defaults to `var`. This means it will set your bundle to a variable defined using the `output.library` field.

There are other options too, but the one we are interested in is `output.libraryTarget: 'umd'`. Consider the example below:

**webpack.config.js**

```javascript
output: {
  path: PATHS.dist,
  libraryTarget: 'umd', // !!
  // Name of the generated global.
  library: 'MyLibrary',
  // Optional name for the generated AMD module.
  umdNamedDefine: 'my_library'
}
```

### `output.libraryTarget = 'var'`

### `output.libraryTarget = 'assign'`

### `output.libraryTarget = 'this'`

### `output.libraryTarget = 'window'`

### `output.libraryTarget = 'global'`

### `output.libraryTarget = 'commonjs'`

### `output.libraryTarget = 'commonjs2'`

### `output.libraryTarget = 'amd'`

### `output.libraryTarget = 'umd'`

### `output.libraryTarget = 'umd2'`

### `output.libraryTarget = 'jsonp'`

## SystemJS

[SystemJS](https://github.com/systemjs/systemjs) is an emerging standard that's starting to get more attention. [webpack-system-register](https://www.npmjs.com/package/webpack-system-register) plugin allows you to wrap your output in a `System.register` call making it compatible with the scheme.

If you want to support SystemJS this way, set up another build target where to generate a bundle for it.

## Externals

TODO: move here???

## Conclusion

TODO
