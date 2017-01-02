# Minifying the Build

So far we haven't given thought to our build output and no doubt it's going to be a little chunky, especially as we include React in it. We can apply a variety of techniques to bring down the size of it. We can also leverage client level caching and load certain assets lazily. I'll discuss the latter topic in the *Understanding Chunks* chapter later on.

The first of these techniques is known as minification. It is a process where code is simplified without losing any meaning that matters to the interpreter. As a result your code will most likely look quite jumbled and it will be hard to read. But that's the point.

T> Even if we minify our build, we can still generate sourcemaps through the `devtool` option we discussed earlier. This will give us better means to debug even production code if we want.

## Generating a Baseline Build

To get started, we should generate a baseline build so we have something to optimize. Execute `npm run build`. You should end up with something like this:

```bash
Hash: 4019952cb4c3db3681ee
Version: webpack 2.2.0-rc.2
Time: 2368ms
                                       Asset       Size  Chunks             Chunk Names
             scripts/3c75491fd6387c3a7ce9.js  294 bytes       0  [emitted]
                                      app.js    2.29 kB       1  [emitted]  app
                                   vendor.js     141 kB       2  [emitted]  vendor
    app.788492b4b5beed29cef12fe793f316a0.css    2.22 kB       1  [emitted]  app
         scripts/3c75491fd6387c3a7ce9.js.map  260 bytes       0  [emitted]
                                  app.js.map    2.58 kB       1  [emitted]  app
app.788492b4b5beed29cef12fe793f316a0.css.map  117 bytes       1  [emitted]  app
                               vendor.js.map     167 kB       2  [emitted]  vendor
                                  index.html  349 bytes          [emitted]
   [0] ./~/process/browser.js 5.3 kB {2} [built]
   [3] ./~/react/lib/ReactElement.js 11.2 kB {2} [built]
   [7] ./~/react/react.js 56 bytes {2} [built]
...
```

167 kB for a vendor bundle is a lot! Minification should bring down the size quite a bit.

## Minifying the Code

Ideally minification will convert our code into a smaller format without losing any meaning. Usually this means some amount of rewriting code through predefined transformations. Good examples of this are renaming variables or even removing entire blocks of code based on the fact that they are unreachable. A simple `if (false)` statement is a good example and this is a technique you can apply with webpack as discussed in the *Setting Environment Variables* chapter.

Sometimes minification can break code as it can rewrite pieces of code you inadvertently depend upon. Angular 1 was a good example of this as it relied on a specific function parameter naming and rewriting the parameters could break code unless you took precautions against it.

The easiest way to enable minification in webpack is to call `webpack -p`. `-p` is a shortcut for `--optimize-minimize`, you can think it as `-p` for "production". Alternatively, we can use a plugin directly as this provides us more control.

### Setting Up Minification

As earlier, we can define a little function for this purpose and then point to it from our main configuration. By default UglifyJS will output a lot of warnings and they don't provide value in this case, so we'll be disabling them in our setup. Here's the basic idea:

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
};
leanpub-end-insert
```

Now we can hook it up with our configuration:

**webpack.config.js**

```javascript
...

module.exports = function(env) {
  if (env === 'production') {
    return merge(
      common,
      {
        output: {
          // Tweak this to match your GitHub project name
          publicPath: '/webpack-demo/'
        }
      },
      parts.loadJavaScript(PATHS.app),
leanpub-start-insert
      parts.minify(),
leanpub-end-insert
      parts.extractBundles([
        {
          name: 'vendor',
          entries: ['react']
        }
      ]),
      parts.clean(PATHS.build),
      parts.generateSourcemaps('source-map'),
      parts.extractCSS(),
      parts.purifyCSS(PATHS.app)
    );
  }

  ...
};
```

If you execute `npm run build` now, you should see smaller results:

```bash
Hash: 4019952cb4c3db3681ee
Version: webpack 2.2.0-rc.2
Time: 2537ms
                                       Asset       Size  Chunks             Chunk Names
             scripts/3c75491fd6387c3a7ce9.js  130 bytes       0  [emitted]
                                      app.js  525 bytes       1  [emitted]  app
                                   vendor.js    41.8 kB       2  [emitted]  vendor
    app.788492b4b5beed29cef12fe793f316a0.css    2.22 kB       1  [emitted]  app
app.788492b4b5beed29cef12fe793f316a0.css.map  117 bytes       1  [emitted]  app
                                  index.html  349 bytes          [emitted]
   [0] ./~/process/browser.js 5.3 kB {2} [built]
   [3] ./~/react/lib/ReactElement.js 11.2 kB {2} [built]
   [7] ./~/react/react.js 56 bytes {2} [built]
...
```

Given it needs to do more work, it took longer to execute the build. But on the plus side the build is significantly smaller now and our vendor build went from 167 kB to 41 kB.

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

T> Dropping the `console` statements can be achieved through Babel too by using the [babel-plugin-remove-console](https://www.npmjs.com/package/babel-plugin-remove-console) plugin. Babel is discussed in greater detail at the *Processing with Babel* chapter.

## Other Solutions

Yet another way to control UglifyJS would be to use the [uglify-loader](https://www.npmjs.com/package/uglify-loader). That gives yet another way to control minification behavior. [webpack-parallel-uglify-plugin](https://www.npmjs.com/package/webpack-parallel-uglify-plugin) allows you to parallelize the minifying step and may yield extra performance as webpack doesn't run in parallel by default.

I've listed a couple of UglifyJS alternatives below:

* [webpack-closure-compiler](https://www.npmjs.com/package/webpack-closure-compiler) runs parallel and may give even smaller result than UglifyJS.
* [babili](https://www.npmjs.com/package/babili) is a Babel specific solution. It can be used either as a CLI tool or through [babili-webpack-plugin](https://www.npmjs.com/package/babili-webpack-plugin).
* [optimize-js-plugin](https://www.npmjs.com/package/optimize-js-plugin) complements the other solutions by wrapping eager functions. The benefit of doing this is that it enhances the way your JavaScript code gets parsed initially. This plugin relies on [optimize-js](https://github.com/nolanlawson/optimize-js) by Nolan Lawson. [v8-lazy-parse-webpack-plugin](https://www.npmjs.com/package/v8-lazy-parse-webpack-plugin) is a similar, highly experimental, plugin doing something similar with V8.

## Minifying CSS

*css-loader* allows minifying CSS through [cssnano](http://cssnano.co/). Minification needs to be enabled explicitly using the `minimize` option. You can also pass [cssnano specific options](http://cssnano.co/optimisations/) to the query to customize the behavior further.

W> In webpack 1 `minimize` was set on by default if `UglifyJsPlugin` was used. This confusing behavior was fixed in webpack 2 and now you have explicit control over minification.

## Conclusion

Minification is the simplest step you can take to make your build smaller. There are a few more tricks we can perform, though.
