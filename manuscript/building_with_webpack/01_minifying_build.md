# Minifying the Build

So far we haven't given thought to our build output and no doubt it's going to be a little chunky, especially as we include React in it. We can apply a variety of techniques to bring down the size of it. We can also leverage client level caching and load certain assets lazily. I'll discuss the latter topic in the *Understanding Chunks* chapter later on.

The first of these techniques is known as minification. It is a process where code is simplified without losing any meaning that matters to the interpreter. As a result your code will most likely look quite jumbled and it will be hard to read. But that's the point.

T> Even if we minify our build, we can still generate sourcemaps through the `devtool` option we discussed earlier. This will give us better means to debug even production code if we want.

## Generating a Baseline Build

To get started, we should generate a baseline build so we have something to optimize. Given our project is so small, there isn't much to optimize yet. We could bring a large dependency like React to get something to slim up. Install React first:

```bash
npm i react --save
```

We also need to make our project depend on it:

**app/index.js**

```
leanpub-start-insert
require('react');
leanpub-end-insert

...
```

Now that we have something to optimize, execute `npm run build`. You should end up with something like this:

```bash
Hash: 8ce504f07a063d49058a
Version: webpack 2.2.0-rc.1
Time: 866ms
     Asset       Size  Chunks           Chunk Names
    app.js     148 kB  0[emitted]  app
app.js.map     177 kB  0[emitted]  app
index.html  180 bytes  [emitted]
  [18] ./app/component.js 136 bytes {0} [built]
  [20] ./app/main.css 904 bytes {0} [built]
  [21] ./~/css-loader!./app/main.css 190 bytes {0} [built]
  [36] ./app/index.js 124 bytes {0} [built]
    + 33 hidden modules
Child html-webpack-plugin for "index.html":
        + 4 hidden modules
```

148 kB is a lot! Minification should bring down the size quite a bit.

## Minifying the Code

Minification will convert our code into a smaller format without losing any meaning. Usually this means some amount of rewriting code through predefined transformations. Sometimes, this can break code as it can rewrite pieces of code you inadvertently depend upon.

The easiest way to enable minification is to call `webpack -p`. `-p` is a shortcut for `--optimize-minimize`, you can think it as `-p` for "production". Alternatively, we can use a plugin directly as this provides us more control. By default UglifyJS will output a lot of warnings and they don't provide value in this case, we'll be disabling them.

As earlier, we can define a little function for this purpose and then point to it from our main configuration. Here's the basic idea:

**webpack.parts.js**

```javascript
...

leanpub-start-insert
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
leanpub-end-insert
```

Now we can hook it up with our configuration like this:

**webpack.config.js**

```javascript
...

module.exports = function(env) {
  if (env === 'production') {
    return merge(
      common,
      {
        devtool: 'source-map'
      },
leanpub-start-insert
      parts.minify(),
leanpub-end-insert
      parts.setupCSS(PATHS.app)
    );
  }

  ...
};
```

If you execute `npm run build` now, you should see better results:

```bash
Hash: 8ce504f07a063d49058a
Version: webpack 2.2.0-rc.1
Time: 1345ms
     Asset       Size  Chunks           Chunk Names
    app.js    44.8 kB  0[emitted]  app
index.html  180 bytes  [emitted]
  [18] ./app/component.js 136 bytes {0} [built]
  [20] ./app/main.css 904 bytes {0} [built]
  [21] ./~/css-loader!./app/main.css 190 bytes {0} [built]
  [36] ./app/index.js 124 bytes {0} [built]
    + 33 hidden modules
Child html-webpack-plugin for "index.html":
        + 4 hidden modules
```

Given it needs to do more work, it took longer. But on the plus side the build is significantly smaller now.

T> UglifyJS warnings can help you to understand how it processes the code. Therefore it may be beneficial to have a peek at the full output every once in a while.

## Controlling UglifyJS through Webpack

An UglifyJS feature known as **mangling** will be enabled by default. The feature will reduce local function and variable names to a minimum, usually to a single character. It can also rewrite properties to a more compact format if configured specifically.

Given these transformations can break your code, you have to be a little careful. A good example of this is Angular 1 and its dependency injection system. As it relies on strings, you must be careful not to mangle those or else it will fail to work.

Beyond mangling, it is possible to control all other [UglifyJS features](http://lisperator.net/uglifyjs/) through webpack as illustrated below:

```javascript
new webpack.optimize.UglifyJsPlugin({
  // Don't beautify output (enable for neater output)
  beautify: false,

  // Eliminate comments
  comments: false,

  // Compression specific options
  compress: {
    warnings: false,

    // Drop `console` statements
    drop_console: true
  },

  // Mangling specific options
  mangle: {
    // Don't mangle $
    except: ['$'],

    // Don't care about IE8
    screw_ie8 : true,

    // Don't mangle function names
    keep_fnames: true
  }
});
```

If you enable mangling, it is a good idea to set `except: ['webpackJsonp']` to avoid mangling the webpack runtime.

T> Dropping the `console` statements can be achieved through Babel too by using the [babel-plugin-remove-console](https://www.npmjs.com/package/babel-plugin-remove-console) plugin. Babel is discussed in greater detail at the *Configuring React* chapter.

## Other Solutions

Yet another way to control UglifyJS would be to use the [uglify-loader](https://www.npmjs.com/package/uglify-loader). That gives yet another way to control minification behavior. [webpack-parallel-uglify-plugin](https://www.npmjs.com/package/webpack-parallel-uglify-plugin) allows you to parallelize the minifying step and may yield extra performance as webpack doesn't run in parallel by default.

I've listed a couple of UglifyJS alternatives below:

* [webpack-closure-compiler](https://www.npmjs.com/package/webpack-closure-compiler) runs parallel and may give even smaller result than UglifyJS.
* [babili](https://www.npmjs.com/package/babili) is a Babel specific solution. It can be used either as a CLI tool or through [babili-webpack-plugin](https://www.npmjs.com/package/babili-webpack-plugin).

## Minifying CSS

*css-loader* allows minifying CSS through [cssnano](http://cssnano.co/). Minification needs to be enabled explicitly using the `minimize` option. You can also pass [cssnano specific options](http://cssnano.co/optimisations/) to the query to customize the behavior further.

W> In webpack 1 `minimize` was set on by default if `UglifyJsPlugin` was used. This confusing behavior was fixed in webpack 2 and now you have explicit control over minification.

## Conclusion

Even though our build is a little better now, there's still a fair amount of work left. The next simple step is to set an environment variable during the build to allow React to optimize itself. This technique can be used in your own code as well. You might want to skip certain checks in production usage and so on to bring the build size down.
