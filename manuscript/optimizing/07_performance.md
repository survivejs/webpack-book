# Performance

Webpack's performance out of the box is often enough for small projects. That said, it begins to hit limits as your project grows in scale. It's a frequent topic in webpack's issue tracker. [Issue 1905](https://github.com/webpack/webpack/issues/1905) is a good example.

There are a couple of ground rules when it comes to optimization:

1. Know what to optimize.
2. Perform fast to implement tweaks first.
3. Perform more involved tweaks after.
4. Measure impact.

Sometimes optimizations come with a cost. They can make your configuration harder to understand or tie it to a particular solution. Often the best optimization is to do less work or do it more smartly. The basic directions are covered in the next sections, so you know where to look when it's time to work on performance.

## Measuring Impact

As discussed in the previous chapter, generating stats can be used to measure build time. [speed-measure-webpack-plugin](https://www.npmjs.com/package/speed-measure-webpack-plugin) gives more granular information per plugin and loader so you know which take most of the time in your process.

{pagebreak}

## High-Level Optimizations

Webpack uses only a single instance by default meaning you aren't able to benefit from a multi-core processor without extra effort. This where third-party solutions, such as [parallel-webpack](https://www.npmjs.com/package/parallel-webpack) and [HappyPack](https://www.npmjs.com/package/happypack) come in.

### parallel-webpack - Run Multiple Webpack Instances in Parallel

*parallel-webpack* allows you to parallelize webpack configuration in two ways. Assuming you have defined your webpack configuration as an array, it can run the configurations in parallel. In addition to this, *parallel-webpack* can generate builds based on given **variants**.

Using variants allows you to generate both production and development builds at once. Variants also allow you to generate bundles with different targets to make them easier to consume depending on the environment. Variants can be used to implement feature flags when combined with `DefinePlugin` as discussed in the *Environment Variables* chapter.

The underlying idea can be implemented using a [worker-farm](https://www.npmjs.com/package/worker-farm). In fact, *parallel-webpack* relies on *worker-farm* underneath.

*parallel-webpack* can be used by installing it to your project as a development dependency and then replacing `webpack` command with `parallel-webpack`.

{pagebreak}

### HappyPack - File Level Parallelism

Compared to *parallel-webpack*, HappyPack is a more involved option. The idea is that HappyPack intercepts the loader calls you specify and then runs them in parallel. You have to set up the plugin first:

**webpack.config.js**

```javascript
...
const HappyPack = require("happypack");

...

const commonConfig = merge([{
  {
    plugins: [
      new HappyPack({
        loaders: [
          // Capture Babel loader
          "babel-loader"
        ],
      }),
    ],
  },
}];
```

{pagebreak}

To complete the connection, you have to replace the original Babel loader definition with a HappyPack one:

```javascript
exports.loadJavaScript = ({ include, exclude }) => ({
  module: {
    rules: [
      {
        ...
leanpub-start-delete
        loader: "babel-loader",
leanpub-end-delete
leanpub-start-insert
        loader: "happypack/loader",
leanpub-end-insert
        ...
      },
    ],
  },
});
```

The example above contains enough information for webpack to run the given loader parallel. HappyPack comes with more advanced options, but applying this idea is enough to get started.

Perhaps the problem with HappyPack is that it couples your configuration with it. It would be possible to overcome this issue by design and make it easier to inject. One option would be to build a higher level abstraction that can perform the replacement on top of vanilla configuration.

## Low-Level Optimizations

Specific lower-level optimizations can be good to know. The key is to allow webpack to perform less work. You have already implemented a couple of these, but it's a good idea to enumerate them:

* Consider using faster source map variants during development or skip them. Skipping is possible if you don't process the code in any way.
* Use [@babel/preset-env](https://www.npmjs.com/package/@babel/preset-env) during development instead of source maps to transpile fewer features for modern browsers and make the code more readable and more comfortable to debug.
* Skip polyfills during development. Attaching a package, such as [@babel/polyfill](https://www.npmjs.com/package/@babel/polyfill), to the development version of an application adds to the overhead.
* Disable the portions of the application you don't need during development. It can be a valid idea to compile only a small fraction you are working on as then you have less to bundle.
* Polyfill less of Node and provide nothing instead. For example, a package could use Node `process` which in turn will bloat your bundle. To disable it, set `node.process` to `false`. To disable polyfilling entirely, set `node` to `false` directly. [See webpack documentation](https://webpack.js.org/configuration/node/) for the default values.
* Push bundles that change less to **Dynamically Loaded Libraries** (DLL) to avoid unnecessary processing. The [official webpack example](https://github.com/webpack/webpack/tree/master/examples/dll-user) gets to the point while [Rob Knight's blog post](https://robertknight.me.uk/posts/webpack-dll-plugins/) explains the idea further. [autodll-webpack-plugin](https://www.npmjs.com/package/autodll-webpack-plugin) can automate the process.

### Plugin Specific Optimizations

There are a series of plugin specific optimizations to consider:

* Utilize caching through plugins like [hard-source-webpack-plugin](https://www.npmjs.com/package/hard-source-webpack-plugin) to avoid unnecessary work.
* Use equivalent, but lighter alternatives, of plugins and loaders during development. Replacing `HtmlWebpackPlugin` with a [HtmlPlugin](https://gist.github.com/bebraw/5bd5ebbb2a06936e052886f5eb1e6874) that does far less is one direction.

{pagebreak}

### Loader Specific Optimizations

Loaders have their optimizations as well:

* Perform less processing by skipping loaders during development. Especially if you are using a modern browser, you can skip using *babel-loader* or equivalent altogether.
* Use either `include` or `exclude` with JavaScript specific loaders. Webpack traverses *node_modules* by default and executes *babel-loader* over the files unless it has been configured correctly.
* Cache the results of expensive loaders (e.g., image manipulation) to the disk using the [cache-loader](https://www.npmjs.com/package/cache-loader).
* Parallelize the execution of expensive loaders using [thread-loader](https://www.npmjs.com/package/thread-loader). Given workers come with an overhead in Node, using *thread-loader* is worth it only if the parallelized operation is heavy.

## Optimizing Rebundling Speed During Development

It's possible to optimize rebundling times during development by pointing the development setup to a minified version of a library, such as React. In React's case, you lose `propType`-based validation. If speed is important, this technique is worth it.

`module.noParse` accepts a RegExp or an array of RegExps. In addition to telling webpack not to parse the minified file you want to use, you also have to point `react` to it by using `resolve.alias`. The aliasing idea is discussed in detail in the *Consuming Packages* chapter.

{pagebreak}

It's possible to encapsulate the core idea within a function:

```javascript
exports.dontParse = ({ name, path }) => {
  const alias = {};
  alias[name] = path;

  return {
    module: {
      noParse: [new RegExp(path)],
    },
    resolve: {
      alias,
    },
  };
};
```

To use the function, you would call it as follows:

```javascript
dontParse({
  name: "react",
  path: path.resolve(
    __dirname, "node_modules/react/cjs/react.production.min.js",
  ),
}),
```

After this change, the application should be faster to rebuild depending on the underlying implementation. The technique can also be applied to production.

Given `module.noParse` accepts a regular expression if you wanted to ignore all `*.min.js` files, you could set it to `/\.min\.js/`.

W> Not all modules support `module.noParse`. They should not have a reference to `require`, `define`, or similar, as that leads to an `Uncaught ReferenceError: require is not defined` error.

## Conclusion

You can optimize webpack's performance in multiple ways. Often it's a good idea to start with more accessible techniques before moving to more involved ones. The exact methods you have to use, depend on the project.

To recap:

* Start with higher level techniques that are fast to implement first.
* Lower level techniques are more involved but come with their wins.
* Since webpack runs using a single instance by default, parallelizing is worthwhile.
* Especially during development, skipping work can be acceptable thanks to modern browsers.

T> [The official build performance guide](https://webpack.js.org/guides/build-performance/) has more tips. See also [Keep webpack Fast: A Field Guide for Better Build Performance](https://slack.engineering/keep-webpack-fast-a-field-guide-for-better-build-performance-f56a5995e8f1), [
How we improved webpack build performance by 95%](https://blog.box.com/blog/how-we-improved-webpack-build-performance-95/), [webpack optimization — A Case Study](https://medium.com/walmartlabs/webpack-optimization-a-case-study-92b130334b6c), and [Web Fundamentals by Google](https://developers.google.com/web/fundamentals/performance/webpack/).
