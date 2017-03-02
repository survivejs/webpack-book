# Performance

Webpack's performance out of the box is often enough for small projects. That said, it begins to hit limits as your project grows in scale. It is a common topic in webpack's issue tracker. [Issue 1905](https://github.com/webpack/webpack/issues/1905) is a good example.

There are a couple of ground rules when it comes to optimization:

1. Know what to optimize.
2. Perform easy tweaks first.
3. Perform hard tweaks after.
4. Measure impact.

Sometimes optimizations come with a cost. They might make your configuration harder to understand or tie it to a particular solution. Often the best optimization is to do less work or do it in a smarter way. I'll go through basic directions in the next sections, so you know where to look when it's time to work on build performance.

## High-Level Optimizations

Webpack uses only a single instance by default meaning you won't be able to benefit from a multi-core processor without extra effort. This where third party solutions, such as [parallel-webpack](https://www.npmjs.com/package/parallel-webpack) and [HappyPack](https://www.npmjs.com/package/happypack) come in.

### parallel-webpack - Run Multiple Webpack's in Parallel

*parallel-webpack* allows you to parallelize webpack configuration in two ways. Assuming you have defined your webpack configuration as an array, it can run the configurations in parallel. In addition to this, *parallel-webpack* can generate builds based on given **variants**.

Using variants would be a good way to generate both production and development builds at once. Variants would also allow you to generate bundles with different targets to make them easier to consume depending on the environment.

The underlying idea can be implemented using a [worker-farm](https://www.npmjs.com/package/worker-farm). In fact, *parallel-webpack* relies on *worker-farm* underneath.

The easiest way to use *parallel-webpack* is to install it to your project as a development dependency and then replace `webpack` command with `parallel-webpack`.

### HappyPack - File Level Parallelism

Compared to *parallel-webpack*, HappyPack is a more involved option. The idea is that HappyPack intercepts the loader calls you specify and then runs them in parallel. You will have to set up the plugin like this first:

**webpack.config.js**

```javascript
...
const HappyPack = require('happypack');

...

const commonConfig = merge([{
  {
    plugins: [
      new HappyPack({
        loaders: [
          // Capture Babel loader
          'babel-loader'
        ],
      }),
    ],
  },
}];
```

To complete the connection, you have to replace the original Babel loader definition with a HappyPack one:

```javascript
exports.loadJavaScript = function({ include, exclude }) {
  return {
    module: {
      rules: [
        {
          test: /\.js$/,
          include,
          exclude,
leanpub-start-delete
          loader: 'babel-loader',
leanpub-end-delete
leanpub-start-insert
          loader: 'happypack/loader',
leanpub-end-insert
          ...
        },
      ],
    },
  };
};
```

The example above contains enough information for webpack to run the given loader parallel. HappyPack comes with more advanced options, but applying this idea is enough to get started.

Perhaps the problem with HappyPack is that it couples your configuration with it. It would be possible to overcome this issue by design and make it easier to inject. One interesting option would be to build a higher level abstraction that can perform the replacement on top of vanilla configuration.

## Low-Level Optimizations

Certain lower-level optimizations can become useful. The key is to allow webpack to perform less work. We've already implemented some of these, but it's a good idea to enumerate them:

* Consider using faster source map variants during development or skip them. Skipping is possible if you don't process the code in any way.
* Use [babel-preset-env](https://www.npmjs.com/package/babel-preset-env) during development instead of source maps to transpile fewer features for modern browsers and make the code more readable and easier to debug.
* Skip polyfills during development. Attaching a package, such as [babel-polyfill](https://www.npmjs.com/package/babel-polyfill), to the development version of an application adds to the overhead.
* Disable the portions of the application you don't need during development. It can be a valid idea to compile only a small portion you are working on as then you will have less to bundle.
* Push bundles that change less to **Dynamically Loaded Libraries** (DLL) to avoid unnecessary processing. It's one more thing to worry about, but can lead to speed increases as there is less to bundle. The [official webpack example](https://github.com/webpack/webpack/tree/master/examples/dll-user) gets to the point while [Rob Knight's blog post](https://robertknight.github.io/posts/webpack-dll-plugins/) explains the idea further.

### Loader and Plugin Specific Optimizations

There are a series of loader and plugin specific optimizations to consider:

* Perform less processing by skipping loaders during development. Especially if you are using a modern browser, you may be able to skip using *babel-loader* or equivalent altogether.
* Use either `include` or `exclude` with JavaScript specific loaders. Webpack will traverse *node_modules* by default and execute *babel-loader* over the files unless it has been configured correctly.
* Utilize caching through plugins like [hard-source-webpack-plugin](https://www.npmjs.com/package/hard-source-webpack-plugin) to avoid unnecessary work. The caching idea applies to loaders as well. For example, you might want to enable cache on *babel-loader*.
* Use equivalent, but lighter alternatives, of plugins and loaders during development. Replacing `HtmlWebpackPlugin` with a [HtmlPlugin](https://gist.github.com/bebraw/5bd5ebbb2a06936e052886f5eb1e6874) that does far less is one direction.
* Consider using parallel variants of plugins if they are available. [webpack-uglify-parallel](https://www.npmjs.com/package/webpack-uglify-parallel) is one example.

## Optimizing Rebundling Speed During Development

It is possible to optimize rebundling times during development by pointing the development setup to a minified version of a library, such as React. In React's case, we will lose `propType`-based validation. But if speed is more important, this technique may be worth a go.

To achieve what we want, it is possible to use `module.noParse` option. It accepts a RegExp or an array of RegExps. In addition to telling webpack not to parse the minified file we want to use, we also need to point `react` to it by using `resolve.alias`.

It is possible to encapsulate the core idea within a function like this:

**webpack.parts.js**

```javascript
...

exports.dontParse = function({ name, path }) {
  const alias = {};
  alias[name] = path;

  return {
    module: {
      noParse: [
        new RegExp(path),
      ],
    },
    resolve: {
      alias,
    },
  };
};
```

To use the function, you would call it like this:

**webpack.config.js**

```javascript
...

const commonConfig = merge([
  {
    ...
leanpub-start-insert
    dontParse({
      name: 'react',
      path: path.resolve(
        __dirname, 'node_modules/react/dist/react.min.js',
      ),
    }),
leanpub-end-insert
  },
  ...
]);

...
```

After this change, the application should be at least a little faster to rebuild. The amount of impact depends on the underlying implementation. The technique can also be applied during production usage.

T> Given `module.noParse` accepts a regular expression if we wanted to ignore all `*.min.js` files, we could set it to `/\.min\.js/`. That can be a more generic way to solve the problem sometimes.

T> The aliasing idea is discussed in detail in the *Consuming Packages* chapter.

W> Not all modules support `module.noParse`. They should not have a reference to `require`, `define`, or similar, as that will lead to an `Uncaught ReferenceError: require is not defined` error.

## Conclusion

You can optimize webpack's performance in multiple ways. Often it's a good idea to start with easier techniques before moving to more involved ones. The exact methods you have to use, depend on the project.

To recap:

* Start with higher level techniques that are easy first.
* Lower level techniques are more involved but may come with their wins.
* Given webpack runs using a single instance by default, finding ways to parallelize its execution can lead to big wins.
* Sometimes the best optimization is to skip work. Especially during development, cheating can be the way to go thanks to modern browsers.
