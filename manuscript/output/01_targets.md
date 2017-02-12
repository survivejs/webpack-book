# Targets

Even though webpack is used most commonly for bundling web applications, it can do more. You can use it to target Node or desktop environments, such as Electron. Webpack can also bundle as a library while writing an appropriate output wrapper making it possible to consume the library.

Webpack's output target is controlled through the `target` field. I'll go through the main targets next and dig into library specific options after that.

## Web Targets

Webpack uses the *web* target by default. This is ideal for web application like the one we have developed in this book. Webpack will bootstrap the application and load its modules. The initial list of modules to load is maintained in a manifest and then the modules can load each other as defined.

### WebWorkers

The *webworker* target will wrap your application as a [WebWorker](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API). Using WebWorkers is useful if you want to execute computation outside of the main thread of the application without slowing down the user interface. There are a couple of limitations you should be aware of:

* You cannot use webpack's hashing features when the *webworker* target is used.
* You cannot manipulate the DOM from a WebWorker. If you wrapped the book project as a worker, it would not display anything.

T> WebWorkers and their usage is discussed in greater detail at the *Using WebWorkers* appendix.

## Node Targets

Webpack provides two Node specific targets: `node` and `async-node`. It will use standard Node `require` to load chunks unless async mode is used. In that case it will wrap modules so that they are loaded asynchronously through Node `fs` and `vm` modules.

The main use case for using the Node target is *Server Side Rendering* (SSR). The idea is discussed in the *Server Side Rendering* chapter.

## Desktop Targets

There are desktop shells, such as [NW.js](https://nwjs.io/) (previously *node-webkit*) and [Electron](http://electron.atom.io/) (previously *Atom*). Webpack can target these as follows:

* `node-webkit` - Targets NW.js while considered experimental.
* `atom`, `electron`, `electron-main` - Targets [Electron main process](https://github.com/electron/electron/blob/master/docs/tutorial/quick-start.md).
* `electron-renderer` - Targets Electron renderer process.

The *Electron* chapter discusses the topic in further detail.

## Library Targets

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

