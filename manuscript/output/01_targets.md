# Build Targets

Even though webpack is used most commonly for bundling web applications, it can do more. You can use it to target Node or desktop environments, such as Electron. Webpack can also bundle as a library while writing an appropriate output wrapper making it possible to consume the library.

Webpack's output target is controlled by the `target` field. You'll learn about the primary targets next and dig into library-specific options after that.

## Web targets

Webpack uses the _web_ target by default. The target is ideal for a web application like the one you have developed in this book. Webpack bootstraps the application and loads its modules. The initial list of modules to load is maintained in a manifest, and then the modules can load each other as defined.

Starting from webpack 5, the default is set to _browserslist_ in case a browserslist configuration has been found. The change means that webpack will compile its runtime to match the setting instead of generating code that will work in legacy browsers as well. Webpack can target specific language specifications (i.e. `es2020`) and also an array of targets is possible (i.e. `["web", "es2020"]`).

### Web workers

The _webworker_ target wraps your application as a [web worker](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API). Using web workers is valuable if you want to execute computation outside of the main thread of the application without slowing down the user interface. There are a couple of limitations you should be aware of:

- You cannot use webpack's hashing features when the _webworker_ target is used.
- You cannot manipulate the DOM from a web worker. If you wrapped the book project as a worker, it would not display anything.

T> Web workers and their usage are discussed in detail in the _Web Workers_ chapter.

## Node targets

Webpack provides two Node-specific targets: `node` and `async-node`. It uses standard Node `require` to load chunks unless the async mode is used. In that case, it wraps modules so that they are loaded asynchronously through Node `fs` and `vm` modules.

The main use case for using the Node target is _Server-Side Rendering_ (SSR).

Starting from webpack 5, it's possible to target a specific version of Node using for example `node10.13`.

T> If you develop a server using webpack, see [nodemon-webpack-plugin](https://www.npmjs.com/package/nodemon-webpack-plugin). The plugin is able to restart your server process without having to set up an external watcher.

## Desktop targets

There are desktop shells, such as [NW.js](https://nwjs.io/) (previously _node-webkit_) and [Electron](http://electron.atom.io/) (previously _Atom_). Webpack can target these as follows:

- `node-webkit` - Targets NW.js while considered experimental.
- `atom`, `electron`, `electron-main` - Targets [Electron main process](https://github.com/electron/electron/blob/master/docs/tutorial/quick-start.md).
- `electron-renderer` - Targets Electron renderer process.

[electron-react-boilerplate](https://github.com/electron-react-boilerplate/electron-react-boilerplate) is a good starting point if you want hot loading webpack setup for Electron and React-based development. Using [the official quick start for Electron](https://github.com/electron/electron-quick-start) is one way.

## Conclusion

Webpack supports targets beyond the web. Based on this, you can say name "webpack" is an understatement considering its capabilities.

To recap:

- Webpack's output target can be controlled through the `target` field. It defaults to `web` but accepts other options too.
- Webpack can target the desktop, Node, and web workers in addition to its web target.
- The Node targets come in handy if especially in _Server-Side Rendering_ setups.

You'll learn how to handle multi-page setups in the next chapter.
