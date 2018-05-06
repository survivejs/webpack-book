# Extending with Plugins

Compared to loaders, plugins are a more flexible means to extend webpack. You have access to webpack's **compiler** and **compilation** processes. It's possible to run child compilers, and plugins can work in tandem with loaders as `MiniCssExtractPlugin` shows.

Plugins allow you to intercept webpack's execution through hooks. Webpack itself has been implemented as a collection of plugins. Underneath it relies on [tapable](https://www.npmjs.com/package/tapable) plugin interface that allows webpack to apply plugins in different ways.

You'll learn to develop a couple of small plugins next. Unlike for loaders, there is no separate environment where you can run plugins, so you have to run them against webpack itself. It's possible to push smaller logic outside of the webpack facing portion, though, as this allows you to unit test it in isolation.

## The Basic Flow of Webpack Plugins

A webpack plugin is expected to expose an `apply(compiler)` method. JavaScript allows multiple ways to do this. You could use a function and then attach methods to its `prototype`. To follow the newest syntax, you could use a `class` to model the same idea.

Regardless of your approach, you should capture possible options passed by a user at the constructor. It's a good idea to declare a schema to communicate them to the user. [schema-utils](https://www.npmjs.com/package/schema-utils) allows validation and works with loaders too.

When the plugin is connected to webpack configuration, webpack will run its constructor and call `apply` with a compiler object passed to it. The object exposes webpack's plugin API and allows you to use its hooks as listed by [the official compiler reference](https://webpack.js.org/api/plugins/compiler/).

T> [webpack-defaults](https://www.npmjs.com/package/webpack-defaults) works as a starting point for webpack plugins. It contains the infrastructure used to develop official webpack loaders and plugins.

## Setting Up a Development Environment

Since plugins have to be run against webpack, you have to set up one to run a demo plugin that will be developed further:

**webpack.plugin.js**

```javascript
const path = require("path");
const DemoPlugin = require("./plugins/demo-plugin.js");

const PATHS = {
  lib: path.join(__dirname, "app", "shake.js"),
  build: path.join(__dirname, "build"),
};

module.exports = {
  entry: {
    lib: PATHS.lib,
  },
  output: {
    path: PATHS.build,
    filename: "[name].js",
  },
  plugins: [new DemoPlugin()],
};
```

T> If you don't have a `lib` entry file set up yet, write one. The contents don't matter as long as it's JavaScript that webpack can parse.

To make it convenient to run, set up a build shortcut:

**package.json**

```json
"scripts": {
leanpub-start-insert
  "build:plugin": "webpack --config webpack.plugin.js",
leanpub-end-insert
  ...
},
```

Executing it should result in an `Error: Cannot find module` failure as the actual plugin is still missing.

T> If you want an interactive development environment, consider setting up [nodemon](https://www.npmjs.com/package/nodemon) against the build. Webpack's watcher won't work in this case.

## Implementing a Basic Plugin

The simplest plugin should do two things: capture options and provide `apply` method:

**plugins/demo-plugin.js**

```javascript
module.exports = class DemoPlugin {
  apply() {
    console.log("applying");
  }
};
```

If you run the plugin (`npm run build:plugin`), you should see `applying` message at the console. Given most plugins accept options, it's a good idea to capture those and pass them to `apply`.

{pagebreak}

## Capturing Options

Options can be captured through a `constructor`:

**plugins/demo-plugin.js**

```javascript
module.exports = class DemoPlugin {
  constructor(options) {
    this.options = options;
  }
  apply() {
    console.log("apply", this.options);
  }
};
```

Running the plugin now would result in `apply undefined` kind of message given no options were passed.

Adjust the configuration to pass an option:

**webpack.plugin.js**

```javascript
module.exports = {
  ...
leanpub-start-delete
  plugins: [new DemoPlugin()],
leanpub-end-delete
leanpub-start-insert
  plugins: [new DemoPlugin({ name: "demo" })],
leanpub-end-insert
  ],
};
```

Now you should see `apply { name: 'demo' }` after running.

{pagebreak}

## Understanding Compiler and Compilation

`apply` receives webpack's compiler as a parameter. Adjust as below:

**plugins/demo-plugin.js**

```javascript
module.exports = class DemoPlugin {
  constructor(options) {
    this.options = options;
  }
  apply(compiler) {
    console.log(compiler);
  }
};
```

After running, you should see a lot of data. Especially `options` should look familiar as it contains webpack configuration. You can also see familiar names like `records`.

If you go through webpack's [plugin development documentation](https://webpack.js.org/api/plugins/), you'll see a compiler provides a large number of hooks. Each hook corresponds to a specific stage. For example, to emit files, you could listen to the `emit` event and then write.

Change the implementation to listen and capture `compilation`:

**plugins/demo-plugin.js**

```javascript
module.exports = class DemoPlugin {
  constructor(options) {
    this.options = options;
  }
  apply(compiler) {
leanpub-start-delete
    console.log(compiler);
leanpub-end-delete
leanpub-start-insert
    compiler.plugin("emit", (compilation, cb) => {
      console.log(compilation);

      cb();
    });
leanpub-end-insert
  }
};
```

W> Forgetting the callback and running the plugin makes webpack fail silently!

Running the build should show more information than before because a compilation object contains whole dependency graph traversed by webpack. You have access to everything related to it here including entries, chunks, modules, assets, and more.

T> Many of the available hooks expose compilation, but sometimes they reveal a more specific structure, and it takes a more particular study to understand those.

T> Loaders have dirty access to `compiler` and `compilation` through underscore (`this._compiler`/`this._compilation`).

## Writing Files Through Compilation

The `assets` object of compilation can be used for writing new files. You can also capture already created assets, manipulate them, and write them back.

To write an asset, you have to use [webpack-sources](https://www.npmjs.com/package/webpack-sources) file abstraction. Install it first:

```bash
npm install webpack-sources --save-dev
```

{pagebreak}

Adjust the code as follows to write through `RawSource`:

**plugins/demo-plugin.js**

```javascript
leanpub-start-insert
const { RawSource } = require("webpack-sources");
leanpub-end-insert

module.exports = class DemoPlugin {
  constructor(options) {
    this.options = options;
  }
  apply(compiler) {
leanpub-start-insert
    const { name } = this.options;
leanpub-end-insert

    compiler.plugin("emit", (compilation, cb) => {
leanpub-start-delete
      console.log(compilation);
leanpub-end-delete
leanpub-start-insert
      compilation.assets[name] = new RawSource("demo");
leanpub-end-insert

      cb();
    });
  }
};
```

After building, you should see output:

```bash
Hash: d698e1dab6472ba42525
Version: webpack 3.8.1
Time: 51ms
 Asset     Size  Chunks             Chunk Names
lib.js   2.9 kB       0  [emitted]  lib
  demo  4 bytes          [emitted]
   [0] ./app/shake.js 107 bytes {0} [built]
```

If you examine *build/demo* file, you'll see it contains the word *demo* as per code above.

T> Compilation has a set of hooks of its own as covered in [the official compilation reference](https://webpack.js.org/api/plugins/compiler/).

## Managing Warnings and Errors

Plugin execution can be caused to fail by throwing (`throw new Error("Message")`). If you validate options, you can use this method.

In case you want to give the user a warning or an error message during compilation, you should use `compilation.warnings` and `compilation.errors`. Example:

```javascript
compilation.warnings.push("warning");
compilation.errors.push("error");
```

There is no way pass information messages to webpack yet although there is [a logging proposal](https://github.com/webpack/webpack/issues/3996). If you want to use `console.log` for this purpose, push it behind a `verbose` flag. The problem is that `console.log` will print to stdout and it will end up in webpack's `--json` output as a result. A flag will allow the user to work around this problem.

## Plugins Can Have Plugins

A plugin can provide hooks of its own. [html-webpack-plugin](https://www.npmjs.com/package/html-webpack-plugin) uses plugins to extend itself as discussed in the *Getting Started* chapter.

## Plugins Can Run Compilers of Their Own

In special cases, like [offline-plugin](https://www.npmjs.com/package/offline-plugin), it makes sense to run a child compiler. It gives full control over related entries and output. Arthur Stolyar, the author of the plugin, has explained [the idea of child compilers at Stack Overflow](https://stackoverflow.com/questions/38276028/webpack-child-compiler-change-configuration).

## Conclusion

When you begin to design a plugin, spend time studying existing plugins that are close enough. Develop plugins piece-wise so that you validate one piece at a time. Studying webpack source can give more insight given it's a collection of plugins itself.

To recap:

* **Plugins** can intercept webpack's execution and extend it making them more flexible than loaders.
* Plugins can be combined with loaders. `MiniCssExtractPlugin` works this way. The accompanying loader is used to mark assets to extract.
* Plugins have access to webpack's **compiler** and **compilation** processes. Both provide hooks for different stages of webpack's execution flow and allow you to manipulate it. Webpack itself works this way.
* Plugins can emit new assets and shape existing assets.
* Plugins can implement plugin systems of their own. `HtmlWebpackPlugin` is an example of such plugin.
* Plugins can run compilers on their own. The isolation gives more control and allows plugins like *offline-plugin* to be written.
