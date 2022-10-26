# Extending with Plugins

Compared to loaders, plugins are a more flexible means to extend webpack. You have access to webpack's **compiler** and **compilation** processes. It's possible to run child compilers, and plugins can work in tandem with loaders as `MiniCssExtractPlugin` shows.

Plugins allow you to intercept webpack's execution through hooks. Webpack itself has been implemented as a collection of plugins. Underneath it relies on [tapable](https://www.npmjs.com/package/tapable) plugin interface that allows webpack to apply plugins in different ways.

You'll learn to develop a couple of small plugins next. Unlike for loaders, there is no separate environment where you can run plugins, so you have to run them against webpack itself. It's possible to push smaller logic outside of the webpack facing portion, though, as this allows you to unit test it in isolation.

## The basic flow of webpack plugins

A webpack plugin is expected to expose an `apply(compiler)` method. JavaScript allows multiple ways to do this. You could use a function and then attach methods to its `prototype`. To follow the newest syntax, you could use a `class` to model the same idea.

Regardless of your approach, you should capture possible options passed by a user at the constructor. It's a good idea to declare a schema to communicate them to the user. [schema-utils](https://www.npmjs.com/package/schema-utils) allows validation and works with loaders too.

When the plugin is connected to webpack configuration, webpack will run its constructor and call `apply` with a compiler object passed to it. The object exposes webpack's plugin API and allows you to use its hooks as listed by [the official compiler reference](https://webpack.js.org/api/plugins/compiler/).

## Setting up a development environment

To test and develop plugins against webpack, a good practice is to set up a harness that captures file output in-memory so you can assert output. You can also validate output against webpack `stats`.

The trick is to use [memfs](https://www.npmjs.com/package/memfs) in combination with `compiler.outputFileSystem`. Install **memfs** first:

```bash
npm add memfs -D
```

Implement a test bootstrap:

**plugins/test.js**

```javascript
const webpack = require("webpack");
const { createFsFromVolume, Volume } = require("memfs");

// The compiler helper accepts filenames should be in the output
// so it's possible to assert the output easily.
function compile(config, filenames = []) {
  return new Promise((resolve, reject) => {
    const compiler = webpack(config);
    compiler.outputFileSystem = createFsFromVolume(new Volume());
    const memfs = compiler.outputFileSystem;

    compiler.run((err, stats) => {
      if (err) {
        return reject(err);
      }

      // Now only errors are captured from stats.
      // It's possible to capture more to assert.
      if (stats.hasErrors()) {
        return reject(stats.toString("errors-only"));
      }

      const ret = {};
      filenames.forEach((filename) => {
        // The assumption is that webpack outputs behind ./dist.
        ret[filename] = memfs.readFileSync(`./dist/${filename}`, {
          encoding: "utf-8",
        });
      });
      return resolve(ret);
    });
  });
}

async function test() {
  console.log(
    await compile({
      entry: "./test-entry.js",
    })
  );
}

test();
```

In addition, set up a test entry:

**plugins/test-entry.js**

```javascript
console.log("hello from entry");
```

T> [See Stack Overflow](https://stackoverflow.com/questions/39923743/is-there-a-way-to-get-the-output-of-webpack-node-api-as-a-string) for related discussion.

## Implementing a basic plugin

The most basic plugin should do two things: capture options and provide `apply` method:

**plugins/demo-plugin.js**

```javascript
module.exports = class DemoPlugin {
  apply() {
    console.log("applying");
  }
};
```

To test the plugin, connect it to our test environment:

**plugins/test.js**

```javascript
...
leanpub-start-insert
const DemoPlugin = require("./demo-plugin");
leanpub-end-insert

...

async function test() {
  console.log(
    await compile({
      entry: "./test-entry.js",
leanpub-start-insert
      plugins: [new DemoPlugin()],
leanpub-end-insert
    })
  );
}
```

If you run the test (`node ./test.js`), you should see `applying` message at the console. Given most plugins accept options, it's a good idea to capture those and pass them to `apply`.

## Capturing options

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

**plugins/test.js**

```javascript
async function test() {
  console.log(
    await compile({
      entry: "./test-entry.js",
      plugins: [new DemoPlugin({ name: "demo" })],
    })
  );
}
```

Now you should see `apply { name: 'demo' }` after running.

{pagebreak}

## Understanding compiler and compilation

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
    compiler.hooks.thisCompilation.tap(
      "DemoPlugin",
      (compilation) => console.log(compilation)
    );
  }
};
```

Running the build should show more information than before because a compilation object contains the whole dependency graph traversed by webpack. You have access to everything related to it here, including entries, chunks, modules, assets, and more.

T> Many of the available hooks expose compilation, but sometimes they reveal a more specific structure, and it takes a more particular study to understand those.

## Writing files through compilation

The `assets` object of compilation can be used for writing new files. You can also capture already created assets, manipulate them, and write them back.

To write an asset, you have to use [webpack-sources](https://www.npmjs.com/package/webpack-sources) file abstraction. It's included to webpack by default starting from version 5.

Adjust the code as follows to write through `RawSource`:

**plugins/demo-plugin.js**

```javascript
const { sources, Compilation } = require("webpack");

module.exports = class DemoPlugin {
  constructor(options) {
    this.options = options;
  }
  apply(compiler) {
    const pluginName = "DemoPlugin";
    const { name } = this.options;

    compiler.hooks.thisCompilation.tap(
      pluginName,
      (compilation) => {
        compilation.hooks.processAssets.tap(
          {
            name: pluginName,
            // See lib/Compilation.js in webpack for more
            stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL,
          },
          () =>
            compilation.emitAsset(
              name,
              new sources.RawSource("hello", true)
            )
        );
      }
    );
  }
};
```

To make sure the file was emitted, adjust the test:

**plugins/test.js**

```javascript
async function test() {
  console.log(
    await compile(
      {
        entry: "./test-entry.js",
        plugins: [new DemoPlugin({ name: "demo" })],
      },
      ["demo"]
    )
  );
}
```

If you run the test again (`node ./test.js`), you should see `{ demo: 'hello' }` in the console output.

T> Compilation has a set of hooks of its own as covered in [the official compilation reference](https://webpack.js.org/api/plugins/compiler/).

## Managing warnings and errors

Plugin execution can be caused to fail by throwing (`throw new Error("Message")`). If you validate options, you can use this method.

In case you want to give the user a warning or an error message during compilation, you should use `compilation.warnings` and `compilation.errors`. Example:

```javascript
compilation.warnings.push("warning");
compilation.errors.push("error");
```

There's a logging API that lets you pass messages to webpack. Consider the API below:

```javascript
const logger = compiler.getInfrastructureLogger("Demo Plugin");
logger.log("hello from compiler");
```

You can use the API familiar from `console` so `warning`, `error`, and `group` amongst other methods will work. See [the logging documentation](https://webpack.js.org/api/logging/) for further details.

## Plugins can have plugins

A plugin can provide hooks of its own. [html-webpack-plugin](https://www.npmjs.com/package/html-webpack-plugin) is a good example of a plugin providing its own plugin interface.

## Conclusion

When you begin to design a plugin, spend time studying existing plugins that are close enough. Develop plugins piece-wise so that you validate one piece at a time. Studying webpack source can give more insight, given it's a collection of plugins itself.

To recap:

- **Plugins** can intercept webpack's execution and extend it making them more flexible than loaders.
- Plugins can be combined with loaders. `MiniCssExtractPlugin` works this way. The accompanying loader is used to mark assets to extract.
- Plugins have access to webpack's **compiler** and **compilation** processes. Both provide hooks for different stages of webpack's execution flow and allow you to manipulate it. Webpack itself works this way.
- Plugins can emit new assets and shape existing assets.
- Plugins can implement plugin systems of their own. `HtmlWebpackPlugin` is an example of such a plugin.
