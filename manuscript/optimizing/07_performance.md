# Performance

Webpack's performance out of the box is often enough for small projects. That said, it begins to hit limits as your project grows in scale, and it's a frequent topic in webpack's issue tracker.

There are a couple of ground rules when it comes to optimization:

1. Know what to optimize.
2. Perform fast to implement tweaks first.
3. Perform more involved tweaks after.
4. Measure the impact as you go.

Sometimes optimizations come with a cost. You could, for example, trade memory for performance or end up making your configuration more complicated.

T> If you hit memory limits with webpack, you can give it more memory with `node --max-old-space-size=4096 node_modules/.bin/wp --mode development` kind of invocation. Size is given in megabytes, and in the example you would give 4 gigabytes of memory to the process.

## Measuring impact

As discussed in the previous chapter, generating stats can be used to measure build time. [webpack.debug.ProfilingPlugin](https://webpack.js.org/plugins/profiling-plugin/) and [cpuprofile-webpack-plugin](https://github.com/jantimon/cpuprofile-webpack-plugin) are able to emit the timings of plugin execution as a file you can pass to Chrome Inspector. The latter generates a flame graph as well.

{pagebreak}

## High-level optimizations

Webpack uses only a single instance by default, meaning you aren't able to benefit from a multi-core processor without extra effort. This is where solutions like [thread-loader](https://www.npmjs.com/package/thread-loader) come in. [webpack-plugin-ramdisk](https://www.npmjs.com/package/webpack-plugin-ramdisk) writes the build output to a RAM disk and it can help during development and in case you have to perform many successive builds.

## Low-level optimizations

Specific lower-level optimizations can be nice to know. The key is to allow webpack to perform less work. Consider the examples below:

- Use faster source map variants during development or skip them. Skipping is possible if you don't process the code in any way.
- Use [@babel/preset-env](https://www.npmjs.com/package/@babel/preset-env) to transpile fewer features for modern browsers and make the code more readable and more comfortable to debug while dropping source maps.
- Skip polyfills during development. Attaching a package, such as [core-js](https://www.npmjs.com/package/core-js), to the development version of an application adds processing overhead.
- Polyfill less of Node and provide nothing instead. For example, a package could be using Node `process` which in turn will bloat your bundle if polyfilled. [See webpack documentation](https://webpack.js.org/configuration/node/) for the default values.
- Starting from version 5, there's [a file system level cache](https://github.com/webpack/changelog-v5/blob/master/guides/persistent-caching.md) that can be enabled by setting `cache.type = "filesystem"`. To invalidate it on configuration change, you should set `cache.buildDependencies.config = [__filename]`. Webpack handles anything watched by the build automatically including plugins, loaders, and project files.

### Loader specific optimizations

Loaders have their optimizations as well:

- Perform less processing by skipping loaders during development. Especially if you are using a modern browser, you can skip using **babel-loader** or equivalent altogether.
- Use either `include` or `exclude` with JavaScript specific loaders. Webpack traverses `node_modules` by default, and executes **babel-loader** over the files unless it has been configured correctly.
- Parallelize the execution of expensive loaders using **thread-loader**. Given workers come with an overhead in Node, the loader is worth it only if the parallelized operation is heavy.

## Optimizing rebundling speed during development

Rebundling times during development can be improved by pointing the development setup to a minified version of a library, such as React. In React's case, you lose `propType`-based validation but if speed is paramount, this technique is worth it.

`module.noParse` accepts a RegExp or an array of RegExps. In addition to telling webpack not to parse the minified file you want to use, you have to point `react` to it by using `resolve.alias`. The idea is discussed in detail in the _Consuming Packages_ chapter.

You can encapsulate the idea within a function:

```javascript
exports.dontParse = ({ name, path }) => ({
  module: { noParse: [new RegExp(path)] },
  resolve: { alias: { [name]: path } },
});
```

To use the function, you call it as follows:

```javascript
dontParse({
  name: "react",
  path: path.resolve(
    __dirname, "node_modules/react/cjs/react.production.min.js",
  ),
}),
```

After this change, the application should be faster to rebuild, depending on the underlying implementation. The technique can also be applied to production.

Given `module.noParse` accepts a regular expression if you wanted to ignore all `*.min.js` files, you could set it to `/\.min\.js/`.

W> Not all modules support `module.noParse`. They should not have a reference to `require`, `define`, or similar, as that leads to an `Uncaught ReferenceError: require is not defined` error.

## Webpack 4 performance tricks

There are various webpack 4 specific tricks to improve performance:

- If `output.futureEmitAssets` is set, webpack 5 related logic is enabled. [Based on Shawn Wang](https://twitter.com/swyx/status/1218173290579136512), it reduces memory usage and improves situation.
- Sometimes there are version related performance regressions which can be fixed in the user space [Kenneth Chau](https://medium.com/@kenneth_chau/speeding-up-webpack-typescript-incremental-builds-by-7x-3912ba4c1d15) has compiled a great list of them for webpack 4. The main ideas are related to simplifying `stats.toJson` using **ts-loader** with `experimentalWatchApi` and setting `output.pathinfo` to `false`.
- [Jared Palmer mentions](https://twitter.com/jaredpalmer/status/1265298834906910729) that setting `optimization` property and its `splitChunks`, `removeAvailableModules`, and `removeEmptyChunks` properties to `false` can improve performance in the `development` mode.

## Conclusion

You can optimize webpack's performance in multiple ways. Often it's a good idea to start with more accessible techniques before moving to more involved ones. The exact methods you have to use depend on the project.

To recap:

- Start with high-level techniques that are fast to implement first.
- Lower level techniques are more involved but come with their wins.
- Since webpack runs using a single instance by default, parallelizing is worthwhile.
- Especially during development, skipping work can be acceptable thanks to modern browsers.

T> [The official build performance guide](https://webpack.js.org/guides/build-performance/) and [Web Fundamentals by Google](https://developers.google.com/web/fundamentals/performance/webpack/) have more tips.
