# Composing Configuration

Even though not a lot has been done with webpack yet, the amount of configuration is starting to feel substantial. Now you have to be careful about the way you compose it as you have separate production and development targets in the project. The situation can only get worse as you want to add more functionality for testing and other purposes.

Using a single monolithic configuration file impacts comprehension and removes any potential for reusability. As the needs of your project grow, you have to figure out the means to manage webpack configuration more effectively.

## Possible ways to manage configuration

You can manage webpack configuration in the following ways:

- Maintain configuration within multiple files for each environment and point webpack to each through the `--config` parameter, sharing configuration through module imports.
- Push configuration to a library, which you then consume. Examples: [webpack-config-plugins](https://github.com/namics/webpack-config-plugins), [Neutrino](https://neutrino.js.org/), [webpack-blocks](https://www.npmjs.com/package/webpack-blocks).
- Push configuration to a tool. Examples: [create-react-app](https://www.npmjs.com/package/create-react-app), [kyt](https://www.npmjs.com/package/kyt), [nwb](https://www.npmjs.com/package/nwb).
- Maintain all configuration within a single file and branch there and rely on the `--env` parameter. The approach is explained in detail later in this chapter.

My preferred approach is to compose webpack configuration out of smaller functions that I put together. The development of this book motivated the direction as it gives you something you can approach piece-wise while giving you a small API over webpack configuration and related techniques.

## Composing configuration by merging

In composition based approach, you split webpack configuration and then merge it together. The problem is that a normal way of merging objects using a feature such as `Object.assign` doesn't do the right thing with arrays as if two objects have arrays attached to them, it's going to lose data. It's for this reason that I developed [webpack-merge](https://www.npmjs.org/package/webpack-merge).

At its core, _webpack-merge_ does two things: it concatenates arrays and merges objects instead of overriding them allowing composition. The example below shows the behavior in detail:

```bash
> { merge } = require("webpack-merge")
...
> merge(
... { a: [1], b: 5, c: 20 },
... { a: [2], b: 10, d: 421 }
... )
{ a: [ 1, 2 ], b: 10, c: 20, d: 421 }
```

_webpack-merge_ provides even more control through strategies that enable you to control its behavior per field. They allow you to force it to append, prepend, or replace content.

Even though _webpack-merge_ was designed for this book, it has proven to be an invaluable tool beyond it. You can consider it as a learning tool and pick it up in your work if you find it handy.

T> [webpack-chain](https://www.npmjs.com/package/webpack-chain) provides a fluent API for configuring webpack allowing you to avoid configuration shape-related problems while enabling composition.

{pagebreak}

## Setting up _webpack-merge_

To get started, add _webpack-merge_ to the project:

```bash
npm add webpack-merge -D
```

To give a degree of abstraction, you can define _webpack.config.js_ for higher level configuration and _webpack.parts.js_ for configuration parts to consume. Here is the development server as a function:

**webpack.parts.js**

```javascript
exports.devServer = ({ host, port } = {}) => ({
  devServer: {
    stats: "errors-only",
    host, // Defaults to `localhost`
    port, // Defaults to 8080
    open: true,
    overlay: true,
  },
});
```

T> The same `stats` idea works for production configuration as well. See [the official documentation](https://webpack.js.org/configuration/stats/) for all the available options.

T> For the sake of simplicity, we'll develop all of the configuration using JavaScript. It would be possible to use TypeScript here as well. If you want to go that route, see the _Loading JavaScript_ chapter for the required TypeScript setup.

{pagebreak}

To connect this configuration part, set up _webpack.config.js_ as in the code example below:

**webpack.config.js**

```javascript
const { merge } = require("webpack-merge");
const {
  MiniHtmlWebpackPlugin,
} = require("mini-html-webpack-plugin");

const parts = require("./webpack.parts");

const commonConfig = merge([
  {
    plugins: [
      new MiniHtmlWebpackPlugin({
        context: {
          title: "Webpack demo",
        },
      }),
    ],
  },
]);

const productionConfig = merge([]);

const developmentConfig = merge([
  parts.devServer({
    // Customize host/port here if needed
    host: process.env.HOST,
    port: process.env.PORT,
  }),
]);

module.exports = (mode) => {
  switch (mode) {
    case "production":
      return merge(commonConfig, productionConfig, { mode });
    case "development":
      return merge(commonConfig, developmentConfig, { mode });
    default:
      throw new Error(`Trying to use an unknown mode, ${mode}`);
  }
};
```

Instead of returning a configuration directly, a function capturing the passed `env` is returned. The function returns configuration based on it and also maps webpack `mode` to it. Doing this means _package.json_ needs a modification:

**package.json**

```json
"scripts": {
leanpub-start-delete
  "start": "webpack-dev-server --mode development",
  "build": "webpack --mode production"
leanpub-end-delete
leanpub-start-insert
  "start": "webpack-dev-server --env development",
  "build": "webpack --env production"
leanpub-end-insert
},
```

After these changes, the build should behave the same way as before. This time, however, you have room to expand, and you don't have to worry about how to combine different parts of the configuration.

You can add more targets by expanding the _package.json_ definition and branching at _webpack.config.js_ based on the need. _webpack.parts.js_ grows to contain specific techniques you can then use to compose the configuration.

T> `productionConfig` is a stub for now and it will grow later as we expand the configuration further.

T> The [process](https://nodejs.org/api/process.html) module used in the code is exposed by Node as a global. In addition to `env`, it provides plenty of other functionality that allows you to get more information of the host system.

W> [Webpack does not set global NODE_ENV](https://github.com/webpack/webpack/issues/7074) based on `mode` by default. If you have any external tooling, such as Babel, relying on it, make sure to set it explicitly. To do this, set `process.env.NODE_ENV = mode;` within the webpack configuration function.

{pagebreak}

### Understanding `--env`

Even though `--env` allows to pass strings to the configuration, it can do a bit more. Consider the following example:

**package.json**

```json
"scripts": {
  "start": "webpack-dev-server --env development",
  "build": "webpack --env.mode production"
},
```

Instead of a string, you should receive an object `{ mode: "production" }` at configuration now. You could pass more key-value pairs, and they would go to the `env` object. If you set `--env foo` while setting `--env.target`, the string wins. Webpack relies on [yargs](http://yargs.js.org/docs/#parsing-tricks-dot-notation) for parsing underneath.

## Benefits of composing configuration

There are several benefits to composing configuration:

- Splitting configuration into smaller functions lets you keep on expanding the setup.
- You can type the functions assuming you are using a language such as TypeScript.
- If you consume the configuration across multiple projects, you can publish the configuration as a package and then have only one place to optimize and upgrade as the underlying configuration changes. [SurviveJS - Maintenance](https://survivejs.com/maintenance/) covers practices related to the approach.
- Treating configuration as a package allows you to version it as any other and deliver change logs to document the changes to the consumers.
- Taken far enough, you can end up with your own **create-react-app** that can be used to bootstrap projects quickly with your preferred setup.

## Configuration layouts

In the book project, you will push all of the configuration into two files: _webpack.config.js_ and _webpack.parts.js_. The former contains higher level configuration while the lower level isolates you from webpack specifics. The chosen approach allows more file layouts than the one we have.

### Split per configuration target

If you split the configuration per target, you could end up with a file structure as below:

```bash
.
└── config
    ├── webpack.common.js
    ├── webpack.development.js
    ├── webpack.parts.js
    └── webpack.production.js
```

In this case, you would point to the targets through webpack `--config` parameter and `merge` common configuration through `module.exports = merge(common, config);`.

{pagebreak}

### Split parts per purpose

To add hierarchy to the way configuration parts are managed, you could decompose _webpack.parts.js_ per category:

```bash
.
└── config
    ├── parts
    │   ├── devserver.js
    ...
    │   ├── index.js
    │   └── javascript.js
    └── ...
```

This arrangement can make it faster to find configuration related to a category. Additionally, it can also reduce your build time if you're consuming parts from a published package as then only the required plugins will have to be loaded. A good alternative for better readability would be to arrange the functions within a single file and use comments to split it up.

### Guidelines for building your own configuration packages

If you go with the configuration package approach I mentioned, consider the guidelines below:

- It can make sense to develop the package using TypeScript to document the interface well. It's particularly useful if you are authoring your configuration in TypeScript as discussed in the _Loading JavaScript_ chapter.
- Expose functions that cover only one piece of functionality at a time. Doing this allows you to replace a _Hot Module Replacement_ implementation easily for example.
- Provide enough customization options through function parameters. It can be a good idea to expose an object as that lets you mimic named parameters in JavaScript. You can then destructure the parameters from that while combining this with good defaults and TypeScript types.
- Include all related dependencies within the configuration package. In specific cases you could use `peerDependencies` if you want that the consumer is able to control specific versions. Doing this means you'll likely download more dependencies that you would need but it's a good compromise.
- For parameters that have a loader string within them, use `require.resolve` to resolve against a loader within the configuration package. Otherwise the build can fail as it's looking into the wrong place for the loaders.
- When wrapping loaders, use the associated TypeScript type in function parameters.
- Consider testing the package by using snapshots (`expect().toMatchSnapshot()` in Jest) to assert output changes. The trick is to use [memory-fs](https://www.npmjs.com/package/memory-fs) in combination with `compiler.outputFileSystem` as below:

```javascript
const webpack = require("webpack");
const MemoryFs = require("memory-fs");
const _ = require("lodash");
const config = require("./webpack.config");

const compiler = webpack(config);

compiler.outputFileSystem = new MemoryFs();

compiler.run((err, stats) => {
  // 1. Handle possible err and stats.hasErrors() case
  if (err || stats.hasErrors()) {
    // stats.toString("errors-only") contains the errors
    return reject(err);
  }

  // 2. Check compile.outputFileSystem
  const pathParts = compiler.outputFileSystem
    .pathToArray(__dirname)
    .concat(["dist", "main.js"]);

  // https://lodash.com/docs/4.17.15#get
  const file = _.get(
    compiler.outputFileSystem.data,
    pathParts
  ).toString();

  // 3. Assert the file using your testing framework.
});
```

T> [See Stack Overflow](https://stackoverflow.com/questions/39923743/is-there-a-way-to-get-the-output-of-webpack-node-api-as-a-string) for related discussion.

{pagebreak}

## Conclusion

Even though the configuration is technically the same as before, now you have room to grow it through composition.

To recap:

- Given webpack configuration is JavaScript code underneath, there are many ways to manage it.
- You should choose a method to compose configuration that makes the most sense to you. [webpack-merge](https://www.npmjs.com/package/webpack-merge) was developed to provide a light approach for composition, but you can find many other options in the wild.
- Webpack's `--env` parameter allows you to control configuration target through terminal. You receive the passed `env` through a function interface.
- Composition can enable configuration sharing. Instead of having to maintain a custom configuration per repository, you can share it across repositories this way. Using npm packages allows this. Developing configuration is close to developing any other code. This time, however, you codify your practices as packages.

The next parts of this book cover different techniques, and _webpack.parts.js_ sees a lot of action as a result. The changes to _webpack.config.js_, fortunately, remain minimal.
