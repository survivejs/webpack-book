# Bundling Libraries

To understand webpack's library targets better, you could set up a small library to bundle. The idea is to end up with a non-minified, a minified version, and a version compatible with *package.json* `module` field. The first two can be used for standalone consumption. You can also point to the non-minified version through *package.json* `main`.

## Setting Up a Library

To have something to build, set up a module as follows:

**lib/index.js**

```javascript
const add = (a, b) => a + b;

export {
  add,
};
```

The idea is that this file becomes the entry point for the entire library and represents the API exposed to the consumers. If you want to support both CommonJS and ES6, it can be a good idea to use the CommonJS module definition here. If you go with ES6 `export default`, using such an export in a CommonJS environment often requires extra effort.

{pagebreak}

## Setting Up an npm Script

Given the `build` target of the project has been taken already by the main application, you should set up a separate one for generating the library. It points to a library specific configuration file to keep things nice and tidy.

**package.json**

```json
"scripts": {
leanpub-start-insert
  "build:lib": "webpack --config webpack.lib.js",
leanpub-end-insert
  ...
},
```

## Setting Up Webpack

Webpack configuration itself can be adapted from the one you built. This time, however, you have to generate two files - a non-minified version and a minified one. This can be achieved by running webpack in so called *multi-compiler mode*. It means you can expose an array of configurations for webpack and it executes each.

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
      lib: PATHS.lib,
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
  parts.minifyJavaScript(),
]);

module.exports = [
  libraryConfig,
  libraryMinConfig,
];
```

If you execute `npm run build:lib` now, you should see output:

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

Webpack ran twice in this case. It can be argued that it would be smarter to minify the initial result separately. In this case, the overhead is so small that it's not worth the extra setup.

{pagebreak}

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
var add = function add(a, b) {
  return a + b;
};

/***/ })
/******/ ]);
//# sourceMappingURL=lib.js.map
```

You can see familiar code there and more. Webpack's bootstrap script is in place, and it starts the entire execution process. It takes the majority of space for a small library, but that's not a problem as the library begins to grow.

T> Instead of using the multi-compiler mode, it would be possible to define two targets. One of them would generate the non-minified version while the other would generate the minified one. The other npm script could be called as `build:lib:dist` and you could define a `build:lib:all` script to build both.

## Cleaning and Linting Before Building

It's a good idea to clean the build directory and lint the code before building the library. You could expand webpack configuration:

```javascript
...

const libraryConfig = merge([
  commonConfig,
  {
    output: {
      filename: '[name].js',
    },
  },
leanpub-start-insert
  parts.clean(PATHS.build),
  parts.lintJavaScript({ include: PATHS.lib }),
leanpub-end-insert
]);

...
```

`parts.clean` and `parts.lintJavaScript` were included to `libraryConfig` on purpose as it makes sense to run them only once at the beginning of the execution. This solution would be problematic with *parallel-webpack* though as it can run configurations out of order.

T> There's [a proposal to improve the situation](https://github.com/webpack/webpack/issues/4271) by introducing the concepts of pre- and post-processing to webpack.

{pagebreak}

## Cleaning and Linting Through npm

Another, and in this case a more fitting, way would be to handle the problem through an npm script. As discussing in the *Package Authoring Techniques* chapter, npm provides pre- and post-script hooks. To keep this solution cross-platform, install [rimraf](https://www.npmjs.com/package/rimraf) first:

```bash
npm install rimraf --save-dev
```

Then, to remove the build directory and lint the source before building, adjust as follows:

**package.json**

```json
"scripts": {
leanpub-start-insert
  "prebuild:lib": "npm run lint:js && rimraf dist",
leanpub-end-insert
  ...
},
```

If either process fails, npm doesn't proceed to the `lib` script. You can verify this by breaking a linting rule and seeing what happens when you build (`npm run build:lib`). Instead, it gives you an error.

T> To get cleaner error output, run either `npm run build:lib --silent` or `npm run build:lib -s`.

T> The same idea can be used for post-processes, such as deployment. For example, you could set up a `postpublish` script to deploy the library site after you have published it to npm.

{pagebreak}

## Conclusion

Webpack can be used for bundling libraries. You can use it to generate multiple different output files based on your exact needs.

To recap:

* If you bundle libraries with webpack, you should set the `output` options carefully to get the result you want.
* Webpack can generate both a non-minified and a minified version of a library through its **multi-compiler** mode. It's possible to minify also as a post-process using an external tool.
* Performing tasks, such as cleaning and linting JavaScript, while using the multi-compiler mode is problematic at the moment. Instead, it can be a good idea to handle these tasks outside of webpack or run multiple webpack instances separately.

If you try to import *./dist/lib.js* through Node, you notice it emits `{}`. The problem has to do with the output type that was chosen. To understand better which output to use and why, the next chapter covers them in detail.

T> The *Package Authoring Techniques* chapter discusses npm specific techniques in detail.
