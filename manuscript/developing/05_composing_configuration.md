# Composing Configuration

Even though we haven't done a lot with webpack yet, the amount of configuration is starting to feel substantial. Also, we have to be careful about the way we compose it as we have separate production and development targets. The situation can only get worse as we want to add more functionality to our project.

As the needs of your project grow, you'll need to figure out means to manage webpack configuration.

## Possible Ways to Manage Configuration

You can manage webpack configuration in the following ways:

* Maintain configuration in multiple files and point webpack to each through the `--config` parameter. Share configuration through module imports. You can see this approach in action at [webpack/react-starter](https://github.com/webpack/react-starter).
* Push configuration to a library, which you then consume. Example: [HenrikJoreteg/hjs-webpack](https://github.com/HenrikJoreteg/hjs-webpack).
* Maintain configuration within a single file and branch there and by relying on the `--env` parameter.

These approaches can be combined. You can end up with a higher level configuration that's then composed of smaller parts. Those parts could go to a library which you then use through npm making it easy to consume the same configuration across multiple projects.

We will use this approach in the book to discuss different techniques. *webpack.config.js* will maintain higher level configuration while *webpack.parts.js* will contain the building blocks.

## Composing Configuration by Merging

To eliminate the problem of dealing with `Object.assign` and `Array.concat`, I developed [webpack-merge](https://www.npmjs.org/package/webpack-merge). Effectively it does two things: it concatenates arrays and merges objects instead of overriding them. Even though a basic idea, this allows us to compose configuration and gives us a degree of abstraction.

*webpack-merge* provides even more control through strategies that enable you to control its behavior per field. Strategies allow you to force it to append, prepend, or replace content. Even though *webpack-merge* was designed for this book, it has proven to be an invaluable tool beyond it. You can consider it as a learning tool and pick it up in your work if you find it useful.

T> [webpack-chain](https://www.npmjs.com/package/webpack-chain) provides a fluent API for configuring webpack allowing you to avoid configuration shape-related problems while enabling composition.

## Setting Up *webpack-merge*

To get started, add *webpack-merge* to the project:

```bash
npm install webpack-merge --save-dev
```

Next, we need to refactor *webpack.config.js* into parts we can consume from there and then rewrite the file to use the parts. Here are the parts with small function-based interfaces extracted from the existing code:

**webpack.parts.js**

```javascript
const webpack = require('webpack');

exports.devServer = function({ host, port } = {}) {
  return {
    devServer: {
      historyApiFallback: true,
      hot: true,
      stats: 'errors-only',
      host, // Defaults to `localhost`
      port, // Defaults to 8080
      overlay: {
        errors: true,
        warnings: true,
      },
    },
    plugins: [
      new webpack.HotModuleReplacementPlugin(),
    ],
  };
};

exports.lintJavaScript = function({ include, exclude, options }) {
  return {
    module: {
      rules: [
        {
          test: /\.js$/,
          include,
          exclude,
          enforce: 'pre',

          loader: 'eslint-loader',
          options,
        },
      ],
    },
  };
};
```

T> I changed the configuration to use `hot: true` over `hotOnly: true` as I want the browser to refresh regardless of a possible error during processing. The latter option is useful for debugging HMR when you are implementing the client side interface.

To benefit from these configuration parts, we need to connect them with *webpack.config.js* as in the complete code example below:

**webpack.config.js**

```javascript
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const merge = require('webpack-merge');

const parts = require('./webpack.parts');

const PATHS = {
  app: path.join(__dirname, 'app'),
  build: path.join(__dirname, 'build'),
};

const commonConfig = merge([
  {
    entry: {
      app: PATHS.app,
    },
    output: {
      path: PATHS.build,
      filename: '[name].js',
    },
    plugins: [
      new HtmlWebpackPlugin({
        title: 'Webpack demo',
      }),
    ],
  },
  parts.lintJavaScript({ include: PATHS.app }),
]);

const productionConfig = merge([
]);

const developmentConfig = merge([
  {
    plugins: [
      new webpack.NamedModulesPlugin(),
    ],
  },
  parts.devServer({
    // Customize host/port here if needed
    host: process.env.HOST,
    port: process.env.PORT,
  }),
]);

module.exports = function(env) {
  if (env === 'production') {
    return merge(commonConfig, productionConfig);
  }

  return merge(commonConfig, developmentConfig);
};
```

After this change, the build should behave the same way as before. This time, however, we have room to expand, and we don't have to worry about how to combine different parts of the configuration. The approach allows us to share functionality across different targets.

We can also add more by expanding the *package.json* definition and branching at *webpack.config.js* based on the need. *webpack.parts.js* will grow to contain specific techniques we can then use to compose the configuration.

Later on, *webpack.parts.js* could be pushed to npm or outside of the project. But for this book, it's enough to maintain it within the project.

T> Webpack 2 validates the configuration by default. If you make an obvious mistake, it will let you know. Earlier, it was useful to set up [webpack-validator](https://www.npmjs.com/package/webpack-validator), but that's not needed anymore.

## The Benefits of Composing Configuration

Splitting configuration allows you to keep on expanding the setup. The biggest win is the fact that we can extract commonalities between different targets. We can also identify smaller configuration parts to compose. These configuration parts can be pushed to packages of their own to consume across projects.

Instead of duplicating similar configuration across multiple projects, you can manage configuration as a dependency now. As you figure out better ways to perform tasks, all your projects will receive the improvements.

Each approach comes with its pros and cons. I am comfortable with the composition-based approach myself, although I can see merit in others as well. In addition to composition, it gives me a limited amount of code to scan through, but it's a good idea to check out how other people do it too. You'll find something that works the best based on your tastes.

Perhaps the biggest problem is that with composition you need to know what you are doing, and it is possible you won't get the composition right the first time around. But that's a software engineering problem that goes beyond webpack. You can always iterate on the interfaces and find better ones.

T> If you have to support both webpack 1 and 2, you can perform branching based on version using `require('webpack/package.json').version` kind of code to detect it. After that, you have to set specific branches for each and merge. You can still extract the commonality as you see the best.

## Configuration Layouts

In the book project, we'll push all of our configuration to two files: *webpack.config.js* and *webpack.parts*. The former contains higher level configuration while the latter lower level. It isolates us from some details of webpack, but it can also grow big. Fortunately, the chosen approach allows more layouts, and you can evolve it further. Consider the following directions.

### Split per Configuration Target

If you split the configuration per target, you could end up with a file structure like this:

```bash
.
└── config
    ├── webpack.common.js
    ├── webpack.development.js
    ├── webpack.parts.js
    └── webpack.production.js
```

In this case, you would point to the targets through webpack `--config` parameter and `merge` common configuration at a target through `module.exports = merge(common, config);` kind of calls.

### Split Parts per Purpose

To add hierarchy to the way configuration parts are managed, you could decompose *webpack.parts.js* per category like this:

```bash
.
└── config
    ├── parts
    │   ├── devserver.js
    │   ├── fonts.js
    │   ├── images.js
    │   ├── index.js
    │   └── javascript.js
    └── ...
```

This arrangement would make it faster to find configuration related to a category. A good option would be to arrange the parts within a single file and use comments to split it up.

### Pushing Parts to Packages

Given all configuration is JavaScript, nothing prevents us from consuming it as a package or packages. It would be possible to package the shared configuration so that you can consume it across multiple projects. See the *Authoring Packages* chapter for further information on how to achieve this.

## Conclusion

Even though the configuration is technically the same as before, now we have room to grow it.

To recap:

* Given webpack configuration is JavaScript code underneath, there are many ways to manage it.
* You should choose a way to compose configuration that makes the most sense to you. [webpack-merge](https://www.npmjs.com/package/webpack-merge) was developed to provide a light way to compose, but you will find many other options in the wild.
* Composition can enable configuration sharing. Instead of having to maintain a custom configuration per repository, you can share it across repositories this way. Using npm packages enables this. Developing configuration is close to developing any other code. This time, however, you will codify your practices as packages.

The next parts of this book will cover different techniques, and *webpack.parts.js* will see a lot of action as a result. The changes to *webpack.config.js* will fortunately remain minimal.
