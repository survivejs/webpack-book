# Build Targets

Even though webpack is used most commonly for bundling web applications, it can do more. You can use it to target Node or desktop environments, such as Electron. Webpack can also bundle as a library while writing an appropriate output wrapper making it possible to consume the library.

Webpack's output target is controlled by the `target` field. You'll learn about the primary targets next and dig into library specific options after that.

## Web Targets

Webpack uses the *web* target by default. The target is ideal for a web application like the one you have developed in this book. Webpack bootstraps the application and loads its modules. The initial list of modules to load is maintained in a manifest, and then the modules can load each other as defined.

### Web Workers

The *webworker* target wraps your application as a [web worker](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API). Using web workers is valuable if you want to execute computation outside of the main thread of the application without slowing down the user interface. There are a couple of limitations you should be aware of:

* You cannot use webpack's hashing features when the *webworker* target is used.
* You cannot manipulate the DOM from a web worker. If you wrapped the book project as a worker, it would not display anything.

T> Web workers and their usage are discussed in detail in the *Web Workers* chapter.

## Node Targets

Webpack provides two Node-specific targets: `node` and `async-node`. It uses standard Node `require` to load chunks unless async mode is used. In that case, it wraps modules so that they are loaded asynchronously through Node `fs` and `vm` modules.

The main use case for using the Node target is *Server Side Rendering* (SSR). The idea is discussed in the *Server Side Rendering* chapter.

## Desktop Targets

There are desktop shells, such as [NW.js](https://nwjs.io/) (previously *node-webkit*) and [Electron](http://electron.atom.io/) (previously *Atom*). Webpack can target these as follows:

* `node-webkit` - Targets NW.js while considered experimental.
* `atom`, `electron`, `electron-main` - Targets [Electron main process](https://github.com/electron/electron/blob/master/docs/tutorial/quick-start.md).
* `electron-renderer` - Targets Electron renderer process.

[electron-react-boilerplate](https://github.com/chentsulin/electron-react-boilerplate) is a good starting point if you want hot loading webpack setup for Electron and React based development. Using [the official quick start for Electron](https://github.com/electron/electron-quick-start) is one way.

{pagebreak}

## Conclusion

Webpack supports targets beyond the web. Based on this you can say name "webpack" is an understatement considering its capabilities.

To recap:

* Webpack's output target can be controlled through the `target` field. It defaults to `web` but accepts other options too.
* Webpack can target the desktop, Node, and web workers in addition to its web target.
* The Node targets come in handy if especially in Server Side Rendering setups.

You'll learn how to handle multi-page setups in the next chapter.
