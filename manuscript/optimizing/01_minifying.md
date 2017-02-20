# Minifying the Build

We haven't given thought to our build output yet and no doubt it's going to be a little chunky, especially as we included React in it. We can apply a variety of techniques to bring down the size of the vendor bundle. We can also leverage client level caching and load certain assets lazily as we saw earlier.

**Minification** is a process where code is simplified without losing any meaning that matters to the interpreter. As a result, your code will most likely look jumbled and it will be hard to read. But that's the point.

T> Even if we minify our build, we can still generate source maps through the `devtool` option we discussed earlier. This will give us better means to debug, even production code if we want.

## Generating a Baseline Build

To get started, we should generate a baseline build so we have something to optimize. Execute `npm run build`. You should end up with something like this:

```bash
Hash: 4f6f78b2fd2c38e8200d
Version: webpack 2.2.1
Time: 2574ms
                    Asset       Size  Chunks             Chunk Names
                   app.js    2.75 kB       1  [emitted]  app
  fontawesome-webfont.eot     166 kB          [emitted]
fontawesome-webfont.woff2    77.2 kB          [emitted]
 fontawesome-webfont.woff      98 kB          [emitted]
  fontawesome-webfont.svg   22 bytes          [emitted]
                 logo.png      77 kB          [emitted]
                     0.js  328 bytes       0  [emitted]
  fontawesome-webfont.ttf     166 kB          [emitted]
                vendor.js     150 kB       2  [emitted]  vendor
                  app.css     3.9 kB       1  [emitted]  app
                 0.js.map  232 bytes       0  [emitted]
               app.js.map    2.78 kB       1  [emitted]  app
              app.css.map   84 bytes       1  [emitted]  app
            vendor.js.map     179 kB       2  [emitted]  vendor
               index.html  274 bytes          [emitted]
   [0] ./~/process/browser.js 5.3 kB {2} [built]
   [3] ./~/react/lib/ReactElement.js 11.2 kB {2} [built]
  [18] ./app/component.js 461 bytes {1} [built]
...
```

150 kB for a vendor bundle is a lot! Minification should bring the size down.

## Enabling a Performance Budget

Webpack allows you to define a **performance budget**. The idea is that it will give your build size constraint which it has to follow. The feature is disabled by default, but if enabled it will default to 250 kB limit per entries and assets. Note that the calculation includes extracted chunks to entry calculation.

Performance budget can be configured to provide warnings or errors. If a budget isn't met and it has been configured to emit an error, it would terminate the entire build.

To integrate the feature to the project, adjust the configuration like this:

**webpack.config.js**

```javascript
...

const productionConfig = merge([
leanpub-start-insert
  {
    performance: {
      hints: 'warning', // 'error' or false are valid too
      maxEntrypointSize: 100000, // in bytes
      maxAssetSize: 200000, // in bytes
    },
  },
leanpub-end-insert
  ...
]);

...
```

If you build now (`npm run build`), you should see a warning like this within the output:

```bash
...

WARNING in entrypoint size limit: The following entrypoint(s) combined asset size exceeds the recommended limit (100 kB). This can impact web performance.
Entrypoints:
  app (157 kB)
      vendor.js
,      app.js
,      app.css

...
```

If we do our work right, we will meet the given budget and eliminate this warning as we develop the configuration.

## Minifying JavaScript

Ideally, minification will convert our code into a smaller format without losing any meaning. Usually this means some amount of rewriting code through predefined transformations. Good examples of this include renaming variables or even removing entire blocks of code based on the fact that they are unreachable like an `if (false)` statement.

Sometimes minification can break code as it can rewrite pieces of code you inadvertently depend upon. Angular 1 was an example of this as it relied on a specific function parameter naming and rewriting the parameters could break code unless you took precautions against it.

The easiest way to enable minification in webpack is to call `webpack -p`. `-p` is a shortcut for `--optimize-minimize`, you can think it as `-p` for "production". Alternately, we can use a plugin directly as this provides us more control. Relying on the flag comes with its problems. If you want to override minification settings, you will have to drop it and rewrite the configuration yourself to avoid minifying twice.

### Setting Up JavaScript Minification

As earlier, we can define a little function for this purpose and then point to it from our main configuration. By default, UglifyJS will output a lot of warnings and they don't provide value in this case, so we'll be disabling them in our setup. Here's the basic idea:

**webpack.parts.js**

```javascript
...

exports.minifyJavaScript = function({ useSourceMap }) {
  return {
    plugins: [
      new webpack.optimize.UglifyJsPlugin({
        sourceMap: useSourceMap,
        compress: {
          warnings: false,
        },
      }),
    ],
  };
};
```

Now we can hook it up with our configuration:

**webpack.config.js**

```javascript
...

const productionConfig = merge([
  ...
  parts.clean(PATHS.build),
leanpub-start-insert
  parts.minifyJavaScript({ useSourceMap: true }),
leanpub-end-insert
  ...
]);

...
```

If you execute `npm run build` now, you should see smaller results:

```bash
Hash: 4f6f78b2fd2c38e8200d
Version: webpack 2.2.1
Time: 3313ms
                    Asset       Size  Chunks             Chunk Names
                   app.js  682 bytes       1  [emitted]  app
  fontawesome-webfont.eot     166 kB          [emitted]
fontawesome-webfont.woff2    77.2 kB          [emitted]
 fontawesome-webfont.woff      98 kB          [emitted]
  fontawesome-webfont.svg   22 bytes          [emitted]
                 logo.png      77 kB          [emitted]
                     0.js  175 bytes       0  [emitted]
  fontawesome-webfont.ttf     166 kB          [emitted]
                vendor.js    45.4 kB       2  [emitted]  vendor
                  app.css     3.9 kB       1  [emitted]  app
                 0.js.map  768 bytes       0  [emitted]
               app.js.map     5.4 kB       1  [emitted]  app
              app.css.map   84 bytes       1  [emitted]  app
            vendor.js.map     368 kB       2  [emitted]  vendor
               index.html  274 bytes          [emitted]
   [0] ./~/process/browser.js 5.3 kB {2} [built]
   [3] ./~/react/lib/ReactElement.js 11.2 kB {2} [built]
  [18] ./app/component.js 461 bytes {1} [built]
...
```

Given it needs to do more work, it took longer to execute the build. But on the plus side the build is now smaller and our vendor build went from 150 kB to roughly 45 kB.

T> UglifyJS warnings can help you to understand how it processes the code. Therefore, it may be beneficial to have a peek at the full output every once in a while.

T> There's a standalone version of the plugin packaged as [uglifyjs-webpack-plugin](https://www.npmjs.com/package/uglifyjs-webpack-plugin). It allows you to control the version of UglifyJS you are using.

## Controlling UglifyJS through Webpack

An UglifyJS feature, **mangling**, will be enabled by default. The feature will reduce local function and variable names to a minimum, usually to a single character. It can also rewrite properties to a more compact format if configured specifically.

Given these transformations can break your code, you must be a little careful. A good example of this is Angular 1 and its dependency injection system. As it relies on strings, you must be careful not to mangle those or else it will fail to work.

Beyond mangling, it is possible to control all other [UglifyJS features](http://lisperator.net/uglifyjs/) through webpack as illustrated below:

```javascript
new webpack.optimize.UglifyJsPlugin({
  beautify: false, // Don't beautify output (uglier to read)

  // Preserve comments
  comments: false,

  // Extract comments to a separate file. This works only
  // if comments is set to true above.
  extractComments: false,

  // Compression specific options
  compress: {
    warnings: false,
    drop_console: true, // Drop `console` statements
  },

  // Mangling specific options
  mangle: {
    except: ['$'], // Don't mangle $
    screw_ie8 : true, // Don't care about IE8
    keep_fnames: true, // Don't mangle function names
  }
});
```

Some of the options support further customization as discussed by the official documentation. If you enable mangling, it is a good idea to set `except: ['webpackJsonp']` to avoid mangling the webpack runtime.

T> Dropping the `console` statements can be achieved through Babel too by using the [babel-plugin-remove-console](https://www.npmjs.com/package/babel-plugin-remove-console) plugin. Babel is discussed in detail in the *Processing with Babel* chapter.

## Other Ways to Minify JavaScript

Yet another way to control UglifyJS would be to use the [uglify-loader](https://www.npmjs.com/package/uglify-loader). That gives yet another way to control minification behavior. [webpack-parallel-uglify-plugin](https://www.npmjs.com/package/webpack-parallel-uglify-plugin) allows you to parallelize the minifying step and may yield extra performance as webpack doesn't run in parallel by default.

I've listed a couple of UglifyJS alternatives below:

* [webpack-closure-compiler](https://www.npmjs.com/package/webpack-closure-compiler) runs parallel and may give even smaller result than UglifyJS.
* [babili](https://www.npmjs.com/package/babili) is a Babel specific solution. It can be used either as a command line tool or through [babili-webpack-plugin](https://www.npmjs.com/package/babili-webpack-plugin).
* [optimize-js-plugin](https://www.npmjs.com/package/optimize-js-plugin) complements the other solutions by wrapping eager functions. The benefit of doing this is that it enhances the way your JavaScript code gets parsed initially. This plugin relies on [optimize-js](https://github.com/nolanlawson/optimize-js) by Nolan Lawson. [v8-lazy-parse-webpack-plugin](https://www.npmjs.com/package/v8-lazy-parse-webpack-plugin) is a similar, highly experimental, plugin doing something similar with V8.

## Minifying CSS

*css-loader* allows minifying CSS through [cssnano](http://cssnano.co/). Minification needs to be enabled explicitly using the `minimize` option. You can also pass [cssnano specific options](http://cssnano.co/optimisations/) to the query to customize the behavior further.

[clean-css-loader](https://www.npmjs.com/package/clean-css-loader) allows you to use a popular CSS minifier [clean-css](https://www.npmjs.com/package/clean-css).

[optimize-css-assets-webpack-plugin](https://www.npmjs.com/package/optimize-css-assets-webpack-plugin) is a plugin based option that applies a chosen minifier on CSS assets. Using `ExtractTextPlugin` can lead to duplicated CSS given it only merges text chunks. `OptimizeCSSAssetsPlugin` avoids this problem by operating on the generated result and thus can lead to a better result.

W> In webpack 1 `minimize` was set on by default if `UglifyJsPlugin` was used. This confusing behavior was fixed in webpack 2 and now you have explicit control over minification.

### Setting Up CSS Minification

Out of the available solutions, `OptimizeCSSAssetsPlugin` composes the best. To attach it to the setup, install it and *cssnano* first:

```bash
npm install optimize-css-assets-webpack-plugin cssnano --save-dev
```

Just like for JavaScript, we can wrap the idea within a configuration part:

**webpack.parts.js**

```javascript
...
leanpub-start-insert
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const cssnano = require('cssnano');
leanpub-end-insert

...

leanpub-start-insert
exports.minifyCSS = function({ options }) {
  return {
    plugins: [
      new OptimizeCSSAssetsPlugin({
        cssProcessor: cssnano,
        cssProcessorOptions: options,
      }),
    ],
  };
};
leanpub-end-insert
```

Then, connect with main configuration:

**webpack.config.js**

```javascript
...

const productionConfig = merge([
  ...
  parts.minifyJavaScript({ useSourceMap: true }),
leanpub-start-insert
  parts.minifyCSS({
    options: {
      discardComments: {
        removeAll: true,
      },
      // Run cssnano in safe mode to avoid
      // potentially unsafe ones.
      safe: true,
    },
  }),
leanpub-end-insert
  ...
]);

...
```

If you build the project now (`npm run build`), you should notice that CSS has become smaller as it is missing comments:

```bash
Hash: 4f6f78b2fd2c38e8200d
Version: webpack 2.2.1
Time: 3303ms
                    Asset       Size  Chunks             Chunk Names
                   app.js  682 bytes       1  [emitted]  app
  fontawesome-webfont.eot     166 kB          [emitted]
fontawesome-webfont.woff2    77.2 kB          [emitted]
 fontawesome-webfont.woff      98 kB          [emitted]
  fontawesome-webfont.svg   22 bytes          [emitted]
                 logo.png      77 kB          [emitted]
                     0.js  175 bytes       0  [emitted]
  fontawesome-webfont.ttf     166 kB          [emitted]
                vendor.js    45.4 kB       2  [emitted]  vendor
                  app.css    2.48 kB       1  [emitted]  app
                 0.js.map  768 bytes       0  [emitted]
               app.js.map     5.4 kB       1  [emitted]  app
              app.css.map   84 bytes       1  [emitted]  app
            vendor.js.map     368 kB       2  [emitted]  vendor
               index.html  274 bytes          [emitted]
   [0] ./~/process/browser.js 5.3 kB {2} [built]
   [3] ./~/react/lib/ReactElement.js 11.2 kB {2} [built]
  [18] ./app/component.js 461 bytes {1} [built]
...
```

[cssnano](http://cssnano.co/) has a lot more options to try out.

## Minifying HTML

If you consume HTML templates through your code using [html-loader](https://www.npmjs.com/package/html-loader), you can preprocess it through [posthtml](https://www.npmjs.com/package/posthtml) with [posthtml-loader](https://www.npmjs.com/package/posthtml-loader). You can use [posthtml-minifier](https://www.npmjs.com/package/posthtml-minifier) to minify your HTML through it.

## Conclusion

Minification is the simplest step you can take to make your build smaller. However, there are more tricks we can perform.
