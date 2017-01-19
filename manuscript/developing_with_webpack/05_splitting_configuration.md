# Splitting the Configuration

Even though we haven't done a lot with webpack yet, the amount of configuration is starting to feel substantial. In addition, we have to be careful about the way we compose it as we have separate production and development targets. This can only get worse as we want to add more functionality to our project.

As the needs of your project grow, you'll need to figure out means to manage webpack configuration. There are a couple of ways to approach this problem.

## Possible Ways to Manage Configuration

You can manage webpack configuration in the following ways:

* Maintain configuration in multiple files and point webpack to each through the `--config` parameter. Share configuration through module imports. You can see this approach in action at [webpack/react-starter](https://github.com/webpack/react-starter).
* Push configuration to a library, which you then consume. Example: [HenrikJoreteg/hjs-webpack](https://github.com/HenrikJoreteg/hjs-webpack).
* Maintain configuration within a single file and branch there by relying on the `--env` parameter.

These approaches can be combined. You can end up with a higher level configuration that's then composed from smaller parts. Those parts could go to a library which you then consume through npm. This would allow consuming the same configuration across multiple projects.

This is the approach we'll use in this book to discuss through various techniques. *webpack.config.js* will maintain higher level configuration while *webpack.parts.js* will contain the building blocks.

## Composing Configuration

In order to eliminate the problem of dealing with `Object.assign` and `Array.concat`, I have developed a little tool known as [webpack-merge](https://www.npmjs.org/package/webpack-merge). Effectively it does two things: it concatenates arrays and merges objects instead of overriding them. Even though a simple idea, this allows us to compose configuration and gives us a degree of abstraction.

*webpack-merge* provides even more control through strategies that allow you to control its behavior per field. Strategies allow you to force it to append, prepend, or replace content. *webpack-merge* contains a webpack specific variant known as *smart merge* that folds webpack specific configuration into more compact form, but basic merge is enough for the configuration discussed in this book.

Even though *webpack-merge* was designed for the purposes of this book, it has proven to be an invaluable tool beyond it, as shown by its increasing popularity. You can consider it as a learning tool and pick it up in your work if you find it useful. Given how flexible webpack is, it's only one configuration approach out of many.

## Setting Up *webpack-merge*

To get started, add *webpack-merge* to the project:

```bash
npm i webpack-merge --save-dev
```

Next, we need to refactor *webpack.config.js* into parts we can consume from there and then rewrite the file to use the parts. Here are the parts with small function based interfaces extracted from the existing code:

**webpack.parts.js**

```javascript
const webpack = require('webpack');

exports.devServer = function(options) {
  return {
    devServer: {
      // Enable history API fallback so HTML5 History API based
      // routing works. This is a good default that will come
      // in handy in more complicated setups.
      historyApiFallback: true,

      // Unlike the cli flag, this doesn't set
      // HotModuleReplacementPlugin!
      hot: true,

      // Don't refresh if hot loading fails. If you want
      // refresh behavior, set inline: true instead.
      hotOnly: true,

      // Display only errors to reduce the amount of output.
      stats: 'errors-only',

      // Parse host and port from env to allow customization.
      //
      // If you use Vagrant or Cloud9, set
      // host: options.host || '0.0.0.0';
      //
      // 0.0.0.0 is available to all network devices
      // unlike default `localhost`.
      host: options.host, // Defaults to `localhost`
      port: options.port, // Defaults to 8080
    },
    plugins: [
      // Enable multi-pass compilation for enhanced performance
      // in larger projects. Good default.
      new webpack.HotModuleReplacementPlugin({
        // Disabled as this won't work with html-webpack-template
        //multiStep: true
      }),
    ],
  };
};

exports.lintJavaScript = function({ paths, options }) {
  return {
    module: {
      rules: [
        {
          test: /\.js$/,
          include: paths,
          enforce: 'pre',

          loader: 'eslint-loader',
          options: options,
        },
      ],
    },
  };
};
```

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

const common = merge([
  {
    // Entry accepts a path or an object of entries.
    // We'll be using the latter form given it's
    // convenient with more complex configurations.
    //
    // Entries have to resolve to files! It relies on Node.js
    // convention by default so if a directory contains *index.js*,
    // it will resolve to that.
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
]);

module.exports = function(env) {
  if (env === 'production') {
    return merge([
      common,
      parts.lintJavaScript({ paths: PATHS.app }),
    ]);
  }

  return merge([
    common,
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
    parts.lintJavaScript({
      paths: PATHS.app,
      options: {
        // Emit warnings over errors to avoid crashing
        // HMR on error.
        emitWarning: true,
      },
    }),
  ]);
};
```

After this change, the build should behave the same way as before. This time, however, we have room to expand and we don't have to worry about how to combine different parts of the configuration. The approach allows us to share functionality across different targets.

We can also add more by expanding the *package.json* definition and branching at *webpack.config.js* based on the need. *webpack.parts.js* will grow to contain specific techniques we can then use to compose the configuration.

Later on *webpack.parts.js* could be pushed to npm or outside of the project. But for the purposes of this book, it's enough to maintain it within the project.

T> Webpack 2 validates the configuration by default. If you make an obvious mistake, it will let you know. Earlier, it was useful to set up a solution known as [webpack-validator](https://www.npmjs.com/package/webpack-validator), but that's not needed anymore.

## Passing `env` from Webpack

Given our setup relies on `env`, we should pass it:

**package.json**

```json
...
"scripts": {
leanpub-start-delete
  "build": "webpack"
leanpub-end-delete
leanpub-start-insert
  "build": "webpack --env production"
leanpub-end-insert
},
...
```

To verify that it works, you can drop a temporary `console.log(env)` within your configuration function. It should print out `production`.

## The Benefits of Composing Configuration

Even though a simple technique, splitting configuration this way makes room for growing your setup. The biggest win is the fact that we can extract commonalities between different targets. We can also identify smaller configuration parts to compose. These configuration parts can be pushed to packages of their own to consume across projects.

This is one way to decrease the amount of boilerplate fatigue. Instead of duplicating similar configuration across multiple projects, you can manage configuration as a dependency. This means that as you figure out better ways to perform tasks, all your projects will receive the improvements.

Each approach comes with its pros and cons. I am comfortable with the composition-based approach myself, although I can see merit in others as well. In addition to composition, it gives me a fairly limited amount of code to scan through, but it's a good idea to check out how other people do it too. You'll find something that works the best based on your tastes.

Perhaps the biggest problem is that with composition you need to know what you are doing, and it is possible you won't get the composition right the first time around. But that's a software engineering problem that goes beyond webpack. You can always iterate on the interfaces and find better ones.

T> If you have to support both webpack 1 and 2, you can perform branching based on version using `require('webpack/package.json').version` kind of code to detect it. After that you have to set specific branches for each and merge. You can still extract the commonality as you see the best.

## Conclusion

Even though the configuration is technically the same as before, now we have room to grow it. The next parts of this book will cover various techniques and *webpack.parts.js* will see a lot of action as a result. The changes to *webpack.config.js* will fortunately remain minimal.
