# Minifying the Build

So far we haven't given thought to our build output and no doubt it's going to be a little chunky, especially as we included React to it. We can apply a variety of techniques to bring down the size of it. We can also leverage client level caching, load certain assets lazily. I'll discuss the latter topic in the *Understanding Chunks* chapter later on.

The first of these techniques is known as minification. It is a process where code is simplified without losing any meaning that matters to the interpreter. As a result your code will most likely look quite jumbled and it will be hard to read. But that's the point.

When certain aggressive minification techniques are applied, sometimes even the meaning of the resulting code may change. This is the reason why certain frameworks apply certain countermeasures against excessive minification. You can see this in Angular 1 definitions for example.

T> Even if we minify our build, we can still generate sourcemaps through the `devtool` option we discussed earlier. This will give us better means to debug even production code.

To get started, we should generate a baseline build so we have something to optimize. Execute `npm run build`. You should end up with something like this:

```bash
Hash: 58740194b7e319d95423
Version: webpack 1.12.14
Time: 2022ms
     Asset       Size  Chunks             Chunk Names
 bundle.js     687 kB       0  [emitted]  app
index.html  160 bytes          [emitted]
   [0] ./app/index.js 186 bytes {0} [built]
 [162] ./app/component.js 136 bytes {0} [built]
    + 161 hidden modules
Child html-webpack-plugin for "index.html":
        + 3 hidden modules
```

687 kB is a lot! Minification should bring down the size a lot.

## Minifying the Code

Minification will convert our code into a smaller format without losing any meaning. Usually this means some amount of rewriting code through predefined transformations. Sometimes, this can break code as it can rewrite pieces of code you inadvertently depend upon.

The easiest way to enable minification is to call `webpack -p` (`-p` as in `production`). Alternatively, we an use a plugin directly as this provides us more control. By default Uglify will output a lot of warnings and they don't provide value in this case, we'll be disabling them. Add the following section to your Webpack configuration:

**webpack.config.js**

```javascript
if(TARGET === 'build') {
leanpub-start-delete
  module.exports = merge(common, {});
leanpub-end-delete
leanpub-start-insert
  module.exports = merge(common, {
    plugins: [
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false
        }
      })
    ]
  });
leanpub-end-insert
}
```

T> Uglify warnings can help you to understand how it processes the code. Therefore it may be beneficial to have a peek at the output every once in a while.

If you execute `npm run build` now, you should see better results:

```bash
Hash: 64a955b2a5675a4ce31b
Version: webpack 1.12.14
Time: 5923ms
     Asset       Size  Chunks             Chunk Names
 bundle.js     193 kB       0  [emitted]  app
index.html  160 bytes          [emitted]
   [0] ./app/index.js 186 bytes {0} [built]
 [162] ./app/component.js 136 bytes {0} [built]
    + 161 hidden modules
Child html-webpack-plugin for "index.html":
        + 3 hidden modules
```

Given it needs to do more work, it took longer. But on the plus side the build is significantly smaller now.

T> It is possible to push minification further by enabling variable name mangling. It comes with some extra complexity to worry about, but it may be worth it when you are pushing for minimal size. See [the official documentation](https://webpack.github.io/docs/list-of-plugins.html#uglifyjsplugin) for details.

## Conclusion

Even though our build is a little better now, there's still a fair amount of work left. The next simple step is to set an environment variable during the build to allow React optimize itself. This technique can be used in your own code as well. You might want to skip certain checks in production usage and so on to bring the build size down.
