# Minifying the Build

So far we haven't given thought to our build output and no doubt it's going to be a little chunky, especially as we included React to it. We can apply a variety of techniques to bring down the size of it. We can also leverage client level caching, load certain assets lazily. I'll discuss the latter topic in the *Understanding Chunks* chapter later on.

The first of these techniques is known as minification. It is a process where code is simplified without losing any meaning that matters to the interpreter. As a result your code will most likely look quite jumbled and it will be hard to read. But that's the point.

When certain aggressive minification techniques are applied, sometimes even the meaning of the resulting code may change. This is the reason why certain frameworks apply certain countermeasures against excessive minification. You can see this in Angular 1 definitions for example.

T> Even if we minify our build, we can still generate sourcemaps through the `devtool` option we discussed earlier. This will give us better means to debug even production code.

## Generating a Baseline Build

To get started, we should generate a baseline build so we have something to optimize. Execute `npm run build`. You should end up with something like this:

```bash
[webpack-validator] Config is valid.
Hash: 9dda4176279d454a7542
Version: webpack 1.13.0
Time: 1448ms
     Asset       Size  Chunks             Chunk Names
    app.js     131 kB       0  [emitted]  app
index.html  160 bytes          [emitted]
   [0] ./app/index.js 123 bytes {0} [built]
  [36] ./app/component.js 136 bytes {0} [built]
    + 35 hidden modules
Child html-webpack-plugin for "index.html":
        + 3 hidden modules
```

131 kB is a lot! Minification should bring down the size a lot.

## Minifying the Code

Minification will convert our code into a smaller format without losing any meaning. Usually this means some amount of rewriting code through predefined transformations. Sometimes, this can break code as it can rewrite pieces of code you inadvertently depend upon.

The easiest way to enable minification is to call `webpack -p` (`-p` as in `production`). Alternatively, we an use a plugin directly as this provides us more control. By default Uglify will output a lot of warnings and they don't provide value in this case, we'll be disabling them.

As earlier, we can define a little function for this purpose and then point to it from our main configuration. Here's the basic idea:

**lib/parts.js**

```javascript
...

exports.minify = function() {
  return {
    plugins: [
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false
        }
      })
    ]
  };
}
```

Now we can hook it up with our configuration like this:

**webpack.config.js**

```javascript
...

// Detect how npm is run and branch based on that
switch(process.env.npm_lifecycle_event) {
  case 'build':
    config = merge(
      common,
leanpub-start-insert
      parts.minify()
leanpub-end-insert
      parts.setupCSS(PATHS.app)
    );
    break;
  default:
    ...
}

module.exports = validate(config);
}
```

If you execute `npm run build` now, you should see better results:

```bash
[webpack-validator] Config is valid.
Hash: b7f78734454b5f37c435
Version: webpack 1.13.0
Time: 3018ms
     Asset       Size  Chunks             Chunk Names
    app.js    37.3 kB       0  [emitted]  app
index.html  160 bytes          [emitted]
   [0] ./app/index.js 123 bytes {0} [built]
  [36] ./app/component.js 136 bytes {0} [built]
    + 35 hidden modules
Child html-webpack-plugin for "index.html":
        + 3 hidden modules
```

Given it needs to do more work, it took longer. But on the plus side the build is significantly smaller now.

T> Uglify warnings can help you to understand how it processes the code. Therefore it may be beneficial to have a peek at the full output every once in a while.

T> It is possible to push minification further by enabling variable name mangling. It comes with some extra complexity to worry about, but it may be worth it when you are pushing for minimal size. See [the official documentation](https://webpack.github.io/docs/list-of-plugins.html#uglifyjsplugin) for details.

## Conclusion

Even though our build is a little better now, there's still a fair amount of work left. The next simple step is to set an environment variable during the build to allow React optimize itself. This technique can be used in your own code as well. You might want to skip certain checks in production usage and so on to bring the build size down.
