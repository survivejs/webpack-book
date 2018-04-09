# Composing Configuration

Even though not a lot has been done with webpack yet, the amount of configuration is starting to feel substantial. Now you have to be careful about the way you compose it as you have separate production and development targets in the project. The situation can only get worse as you want to add more functionality to the project.

Using a single monolithic configuration file impacts comprehension and removes any potential for reusability. As the needs of your project grow, you have to figure out the means to manage webpack configuration more effectively.

## Possible Ways to Manage Configuration

You can manage webpack configuration in the following ways:

* Maintain configuration within multiple files for each environment and point webpack to each through the `--config` parameter, sharing configuration through module imports.
* Push configuration to a library, which you then consume. Examples: [hjs-webpack](https://www.npmjs.com/package/hjs-webpack), [Neutrino](https://neutrino.js.org/), [webpack-blocks](https://www.npmjs.com/package/webpack-blocks).
* Push configuration to a tool. Examples: [create-react-app](https://www.npmjs.com/package/create-react-app), [kyt](https://www.npmjs.com/package/kyt), [nwb](https://www.npmjs.com/package/nwb).
* Maintain all configuration within a single file and branch there and rely on the `--env` parameter. The approach is explained in detail later in this chapter.

These approaches can be combined to create a higher level configuration that is then composed of smaller parts. Those parts could then be added to a library which you then use through npm making it possible to consume the same configuration across multiple projects.

## Composing Configuration by Merging

If the configuration file is broken into separate pieces, they have to be combined again somehow. Normally this means merging objects and arrays. To eliminate the problem of dealing with `Object.assign` and `Array.concat`, [webpack-merge](https://www.npmjs.org/package/webpack-merge) was developed.

*webpack-merge* does two things: it concatenates arrays and merges objects instead of overriding them allowing composition. The example below shows the behavior in detail:

```bash
> merge = require("webpack-merge")
...
> merge(
... { a: [1], b: 5, c: 20 },
... { a: [2], b: 10, d: 421 }
... )
{ a: [ 1, 2 ], b: 10, c: 20, d: 421 }
```

*webpack-merge* provides even more control through strategies that enable you to control its behavior per field. They allow you to force it to append, prepend, or replace content.

Even though *webpack-merge* was designed for this book, it has proven to be an invaluable tool beyond it. You can consider it as a learning tool and pick it up in your work if you find it handy.

T> [webpack-chain](https://www.npmjs.com/package/webpack-chain) provides a fluent API for configuring webpack allowing you to avoid configuration shape-related problems while enabling composition.

{pagebreak}

## Setting Up *webpack-merge*

To get started, add *webpack-merge* to the project:

```bash
npm install webpack-merge --save-dev
```

To give a degree of abstraction, you can define *webpack.config.js* for higher level configuration and *webpack.parts.js* for configuration parts to consume. Here are the parts with small function-based interfaces extracted from the existing code:

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

{pagebreak}

To connect this configuration part, set up *webpack.config.js* as in the code example below:

**webpack.config.js**

```javascript
const merge = require("webpack-merge");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const parts = require("./webpack.parts");

const commonConfig = merge([
  {
    plugins: [
      new HtmlWebpackPlugin({
        title: "Webpack demo",
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

module.exports = mode => {
  if (mode === "production") {
    return merge(commonConfig, productionConfig, { mode });
  }

  return merge(commonConfig, developmentConfig, { mode });
};
```

Instead of returning a configuration directly, a function capturing the passed `env` is returned. The function returns configuration based on it and also maps webpack `mode` to it. Doing this means *package.json* needs a modification:

**package.json**

```json
"scripts": {
leanpub-start-insert
  "start": "webpack-dev-server --env development",
  "build": "webpack --env production"
leanpub-end-insert
leanpub-start-delete
  "start": "webpack-dev-server --mode development",
  "build": "webpack --mode production"
leanpub-end-delete
},
```

After these changes, the build should behave the same way as before. This time, however, you have room to expand, and you don't have to worry about how to combine different parts of the configuration.

You can add more targets by expanding the *package.json* definition and branching at *webpack.config.js* based on the need. *webpack.parts.js* grows to contain specific techniques you can then use to compose the configuration.

T> `productionConfig` is a stub for now and it will grow later as we expand the configuration further.

T> The [process](https://nodejs.org/api/process.html) module used in the code is exposed by Node as a global. In addition to `env`, it provides plenty of other functionality that allows you to get more information of the host system.

{pagebreak}

### Understanding `--env`

Even though `--env` allows to pass strings to the configuration, it can do a bit more. Consider the following example:

**package.json**

```json
"scripts": {
  "start": "webpack-dev-server --env development",
  "build": "webpack --env.target production"
},
```

Instead of a string, you should receive an object `{ target: "production" }` at configuration now. You could pass more key-value pairs, and they would go to the `env` object. If you set `--env foo` while setting `--env.target`, the string wins. Webpack relies on [yargs](http://yargs.js.org/docs/#parsing-tricks-dot-notation) for parsing underneath.

## Benefits of Composing Configuration

Configuration splitting allows you to keep on expanding the setup. The most significant win is the fact that you can extract commonalities between different targets. You can also identify smaller configuration parts to compose. These configuration parts can be pushed to packages of their own to consume across projects.

Instead of duplicating similar configuration across multiple projects, you can manage configuration as a dependency now. As you figure out better ways to perform tasks, all your projects receive the improvements.

Each approach comes with its pros and cons. The composition-based approach is a good starting point. In addition to composition, it gives you a limited amount of code to scan through, but it's a good idea to check out how other people do it too. You can find something that works the best based on your tastes.

Perhaps the biggest problem is that with composition you need to know what you are doing, and it's possible you aren't going to get the composition right the first time around. But that's a software engineering problem that goes beyond webpack.

You can always iterate on the interfaces and find better ones. By passing in a configuration object instead of multiple arguments you can change the behavior of a part without affecting its API, effectively exposing the API as you need it.

## Configuration Layouts

In the book project, you will push all of the configuration into two files: *webpack.config.js* and *webpack.parts.js*. The former contains higher level configuration while the lower level isolates you from webpack specifics. The chosen approach allows more file layouts than the one we have.

### Split per Configuration Target

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

### Split Parts per Purpose

To add hierarchy to the way configuration parts are managed, you could decompose *webpack.parts.js* per category:

```bash
.
└── config
    ├── parts
    │   ├── devserver.js
    ...
    │   ├── index.js
    │   └── javascript.js
    └── ...
```

This arrangement would make it faster to find configuration related to a category. A good option would be to arrange the parts within a single file and use comments to split it up.

### Pushing Parts to Packages

Given all configuration is JavaScript, nothing prevents you from consuming it as a package or packages. It would be possible to package the shared configuration so that you can consume it across multiple projects. See the [SurviveJS - Maintenance](https://survivejs.com/maintenance/) book for further information on how to achieve this.

{pagebreak}

## Conclusion

Even though the configuration is technically the same as before, now you have room to grow it.

To recap:

* Given webpack configuration is JavaScript code underneath, there are many ways to manage it.
* You should choose a method to compose configuration that makes the most sense to you. [webpack-merge](https://www.npmjs.com/package/webpack-merge) was developed to provide a light approach for composition, but you can find many other options in the wild.
* Webpack's `--env` parameter allows you to control configuration target through terminal. You receive the passed `env` through a function interface.
* Composition can enable configuration sharing. Instead of having to maintain a custom configuration per repository, you can share it across repositories this way. Using npm packages allows this. Developing configuration is close to developing any other code. This time, however, you codify your practices as packages.

The next parts of this book cover different techniques, and *webpack.parts.js* sees a lot of action as a result. The changes to *webpack.config.js*, fortunately, remain minimal.
