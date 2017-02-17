# Compilation Targets

Even though webpack is used most commonly for bundling web applications, it can do more. You can use it to target Node or desktop environments, such as Electron. Webpack can also bundle as a library while writing an appropriate output wrapper making it possible to consume the library.

Webpack's output target is controlled through the `target` field. I'll go through the main targets next and dig into library specific options after that.

## Web Targets

Webpack uses the *web* target by default. This is ideal for web application like the one we have developed in this book. Webpack will bootstrap the application and load its modules. The initial list of modules to load is maintained in a manifest and then the modules can load each other as defined.

### Web Workers

The *webworker* target will wrap your application as a [web worker](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API). Using web workers is useful if you want to execute computation outside of the main thread of the application without slowing down the user interface. There are a couple of limitations you should be aware of:

* You cannot use webpack's hashing features when the *webworker* target is used.
* You cannot manipulate the DOM from a web worker. If you wrapped the book project as a worker, it would not display anything.

T> Web workers and their usage is discussed in greater detail at the *Using Web Workers* appendix.

## Node Targets

Webpack provides two Node specific targets: `node` and `async-node`. It will use standard Node `require` to load chunks unless async mode is used. In that case it will wrap modules so that they are loaded asynchronously through Node `fs` and `vm` modules.

The main use case for using the Node target is *Server Side Rendering* (SSR). The idea is discussed in the *Server Side Rendering* chapter.

## Desktop Targets

There are desktop shells, such as [NW.js](https://nwjs.io/) (previously *node-webkit*) and [Electron](http://electron.atom.io/) (previously *Atom*). Webpack can target these as follows:

* `node-webkit` - Targets NW.js while considered experimental.
* `atom`, `electron`, `electron-main` - Targets [Electron main process](https://github.com/electron/electron/blob/master/docs/tutorial/quick-start.md).
* `electron-renderer` - Targets Electron renderer process.

[electron-react-boilerplate](https://github.com/chentsulin/electron-react-boilerplate) is a good starting point if you want hot loading webpack setup for Electron and React based development. [electron-compile](https://github.com/electron/electron-compile) skips webpack entirely and can be a lighter alternative for compiling JavaScript and CSS for Electron. The fastest way to get started is to use [the official quick start for Electron](https://github.com/electron/electron-quick-start).

## Bundling Libraries with Webpack

To understand webpack's library targets better, we can set up a small library to bundle. The idea is to end up with a non-minified, a minified version, and a version compatible with *package.json* `module` field. The first two can be useful for standalone consumption. You can also point to the non-minified version through *package.json* `main`.

T> The *Authoring Packages* discusses the fields and more in greater detail.

### Setting Up a Library

In order to have something to build, set up a module as follows:

**lib/index.js**

```javascript
function add(a, b) {
  return a + b;
}

export {
  add,
};
```

The idea is that this file will become the entry point of the entire library and represents the API exposed to the consumers. If you want to support both CommonJS and ES6, it can be a good idea to use the CommonJS module definition here. If you go with ES6 `export default`, using such an export in a CommonJS environment often requires extra effort.

### Setting Up an npm Script

Given the `build` target of the project has been taken already by the main application, we should set up a separate one for generating the library. It will point to a library specific configuration file to keep things nice and tidy.

**package.json**

```json
...
"scripts": {
leanpub-start-insert
  "build:lib": "webpack --config webpack.lib.js",
leanpub-end-insert
  ...
},
...
```

### Setting Up Webpack

Webpack configuration itself can be adapted from the one we built. This time, however, we have to generate two files - a non-minified version and a minified one. This is possible by running webpack in so called *multi-compiler mode*. It means you can expose an array of configurations for webpack and it will execute each.

**webpack.lib.js**

```javascript
const path = require('path');
const merge = require('webpack-merge');

const parts = require('./webpack.parts');

const PATHS = {
  lib: path.join(__dirname, 'lib'),
  build: path.join(__dirname, 'dist'),
};

const commonConfig = merge([
  {
    entry: {
      demo: PATHS.lib,
    },
    output: {
      path: PATHS.build,
      library: 'Demo',
      libraryTarget: 'var', // Default
    },
  },
  parts.attachRevision(),
  parts.generateSourceMaps({ type: 'source-map' }),
  parts.loadJavaScript({ include: PATHS.app }),
]);

const libraryConfig = merge([
  commonConfig,
  {
    output: {
      filename: '[name].js',
    },
  },
]);

const libraryMinConfig = merge([
  commonConfig,
  {
    output: {
      filename: '[name].min.js',
    },
  },
  parts.minifyJavaScript({ useSourceMap: true }),
]);

module.exports = [
  libraryConfig,
  libraryMinConfig,
];
```

If you execute `npm run build:lib` now, you should see output like this:

```bash
Hash: 760c4d25403432782e1079cf0c3f76bbd168a80c
Version: webpack 2.2.1
Child
    Hash: 760c4d25403432782e10
    Time: 302ms
         Asset     Size  Chunks             Chunk Names
        lib.js  2.96 kB       0  [emitted]  lib
    lib.js.map  2.85 kB       0  [emitted]  lib
       [0] ./lib/index.js 55 bytes {0} [built]
Child
    Hash: 79cf0c3f76bbd168a80c
    Time: 291ms
             Asset       Size  Chunks             Chunk Names
        lib.min.js  695 bytes       0  [emitted]  lib
    lib.min.js.map    6.72 kB       0  [emitted]  lib
       [0] ./lib/index.js 55 bytes {0} [built]
```

Webpack ran twice as you might have expected. It can be argued that it would be smarter to minify the initial result separately. In this case the overhead is so small that it's not worth the extra setup.

Examining the build output reveals more:

**dist/lib.js**

```javascript
/*! 33c69fc */
var Demo =
/******/ (function(modules) { // webpackBootstrap
...
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "add", function() { return add; });
function add(a, b) {
  return a + b;
}

/***/ })
/******/ ]);
//# sourceMappingURL=lib.js.map
```

You can see some familiar code there and more. Webpack's bootstrap script is in place and it starts the entire execution process. It takes majority of space for a small library like this, but that's not a problem as the library begins to grow.

### Cleaning and Linting Before Building

It might be a good idea to clean the build directory and lint the code before building the library. You could expand webpack configuration like this:

```javascript
...

const libraryConfig = merge([
  commonConfig,
  {
    output: {
      filename: '[name].js',
    },
  },
  parts.clean(PATHS.build),
  parts.lintJavaScript({ include: PATHS.lib }),
]);

...
```

`parts.clean` and `parts.lintJavaScript` were included to `libraryConfig` on purpose as it makes sense to run them only once at the beginning of the execution. This solution would be problematic with *parallel-webpack* though as it can run configurations out of order.

T> There's [a proposal to improve the situation](https://github.com/webpack/webpack/issues/4271) by introducing the concepts of pre- and post-processing to webpack.

### Cleaning and Linting Through npm

Another, and in this case more fitting, way would be to handle the problem through an npm script. As discussing in the *Authoring Packages* chapter, npm provides pre- and post-script hooks. To keep this solution cross-platform, install [rimraf](https://www.npmjs.com/package/rimraf) first:

```bash
npm install rimraf --save-dev
```

Then, to remove the build directory and lint the source before building, adjust as follows:

**package.json**

```json
...
"scripts": {
leanpub-start-insert
  "prebuild:lib": "npm run lint:js && rimraf dist",
leanpub-end-insert
  ...
},
...
```

If either process fails, npm won't proceed to the `lib` script. You can verify this by breaking a linting rule and seeing what happens when you build (`npm run build:lib`). Instead, it will give you an error.

T> To get cleaner error output, run either `npm run build:lib --silent` or `npm run build:lib -s`.

T> The same idea is useful for post-processes, such as deployment. For example, you could set up a `postpublish` script to deploy the library site after you have published it to npm.

### Setting Up ESLint

To keep ESLint from linting the new build output, adjust its ignore rules as follows so it matches all *dist* related files:

**.eslintignore**

```bash
build/*
leanpub-start-insert
dist/*
dist-modules/*
leanpub-end-insert
```

If you are using Git, a neater way to handle the ignore rules would be to manage them through *.gitignore* and point ESLint to it instead. The *Linting JavaScript* chapter covers the idea in a greater detail.

### Generating `module` Field Compatible Output

In order to generate *package.json* `module` field compatible output to enable tree shaking for the consumers, the source should be processed so that it does not lose ES6 module definitions. It is better to solve this problem outside of webpack by passing the source through Babel instead. Adjust as follows:

**package.json**

```json
...
"scripts": {
leanpub-start-delete
  "prebuild:lib": "npm run lint:js && rimraf dist",
leanpub-end-delete
leanpub-start-insert
  "prebuild:lib": "npm run lint:js && rimraf dist*",
leanpub-end-insert
  "build:lib": "webpack --config webpack.lib.js",
leanpub-start-insert
  "postbuild:lib": "babel ./lib --out-dir ./dist-modules",
leanpub-end-insert
  ...
},
...
```

Note that *rimraf* related rule was extended to remove all distribution related directories.

[Babel CLI](https://babeljs.io/docs/usage/cli/) needs to be installed separately:

```bash
npm install babel-cli --save-dev
```

Make sure your Babel configuration skips processing ES6 modules like this:

**.babelrc**

```json
{
  ...
  "presets": [
    [
      "es2015",
      {
        "modules": false
      }
    ]
  ]
}
```

If you build the project (`npm run build:lib`), it should generate a *./dist-modules* directory. If you try to use ES6 specific features, the output should have been transpiled them to something ES5 compatible.

When distributing the library, you should point to that *./dist-modules* directory from *package.json* `module` field.

## Conclusion

This isn't all there is to authoring packages using webpack. If you try to import *./dist/lib.js* through Node, you will notice it will output `{}`. This has to do with the output type we chose. To understand better which output to use and why, we will go through them and the related options in the next chapter.

T> The *Authoring Packages* chapter discusses npm specific techniques in detail and it complements these chapters well.
