# Minifying

The build output hasn't received attention yet and no doubt it's going to be chunky, especially as you included React in it. You can apply a variety of techniques to bring down the size of the vendor bundle. You can also leverage client level caching and load individual assets lazily as you saw earlier.

**Minification** is a process where the code is simplified without losing any meaning that matters to the interpreter. As a result, your code most likely looks jumbled, and it's hard to read. But that's the point.

T> Even if you minify the build, you can still generate source maps through the `devtool` option that was discussed earlier to gain a better debugging experience, even production code if you want.

## Generating a Baseline Build

To get started, you should generate a baseline build, so you have something to optimize. Execute `npm run build` to see output below:

```bash
Hash: 12aec469d54202150429
Version: webpack 2.2.1
Time: 2863ms
        Asset       Size  Chunks                    Chunk Names
       app.js    2.42 kB       1  [emitted]         app
  ...font.eot     166 kB          [emitted]
...font.woff2    77.2 kB          [emitted]
 ...font.woff      98 kB          [emitted]
  ...font.svg     444 kB          [emitted]  [big]
     logo.png      77 kB          [emitted]
         0.js    1.89 kB       0  [emitted]
  ...font.ttf     166 kB          [emitted]
leanpub-start-insert
    vendor.js     150 kB       2  [emitted]         vendor
leanpub-end-insert
      app.css     3.9 kB       1  [emitted]         app
     0.js.map    2.22 kB       0  [emitted]
   app.js.map    2.13 kB       1  [emitted]         app
  app.css.map   84 bytes       1  [emitted]         app
vendor.js.map     178 kB       2  [emitted]         vendor
   index.html  274 bytes          [emitted]
   [3] ./~/react/lib/ReactElement.js 11.2 kB {2} [built]
  [18] ./app/component.js 461 bytes {1} [built]
  [19] ./~/font-awesome/css/font-awesome.css 41 bytes {1} [built]
...
```

150 kB for a vendor bundle is a lot! Minification should bring the size down.

## Enabling a Performance Budget

Webpack allows you to define a **performance budget**. The idea is that it gives your build size constraint which it has to follow. The feature is disabled by default, but if enabled it defaults to 250 kB limit per entries and assets. The calculation includes extracted chunks to entry calculation.

Performance budget can be configured to provide warnings or errors. If a budget isn't met and it has been configured to emit an error, it would terminate the entire build.

{pagebreak}

To integrate the feature into the project, adjust the configuration:

**webpack.config.js**

```javascript
const productionConfig = merge([
leanpub-start-insert
  {
    performance: {
      hints: 'warning', // 'error' or false are valid too
      maxEntrypointSize: 100000, // in bytes
      maxAssetSize: 450000, // in bytes
    },
  },
leanpub-end-insert
  ...
]);
```

In practice you want to maintain lower limits. The current ones are enough for this demonstration. If you build now (`npm run build`), you should see a warning within the output:

```bash
...
WARNING in entrypoint size limit: The following entrypoint(s) combined asset size exceeds the recommended limit (100 kB). This can impact web performance.
Entrypoints:
  app (156 kB)
      vendor.js
,      app.js
,      app.css
...
```

If minification works, the warning should disappear. That's the next challenge.

{pagebreak}

## Minifying JavaScript

The point of **minification** is to convert the code into a smaller form. Safe **transformations** do this without losing any meaning by rewriting code. Good examples of this include renaming variables or even removing entire blocks of code based on the fact that they are unreachable (`if (false)`).

Unsafe transformations can break code as they can lose something implicit the underlying code relies upon. For example, Angular 1 expects specific function parameter naming when using modules. Rewriting the parameters breaks code unless you take precautions against it in this case.

Minification in webpack can be enabled through `webpack -p` (same as `--optimize-minimize`). This uses webpack's `UglifyJsPlugin` underneath. The problem is that UglifyJS doesn't support ES6 syntax yet making it problematic if Babel and *babel-preset-env* are used while targeting specific browsers. You have to go another route in this case for this reason.

### Setting Up JavaScript Minification

[babili](https://www.npmjs.com/package/babili) is a JavaScript minifier maintained by the Babel team and it provides support for ES6 and newer features. [babili-webpack-plugin](https://www.npmjs.com/package/babili-webpack-plugin) makes it possible to use it through webpack.

To get started, include the plugin to the project:

```bash
npm install babili-webpack-plugin --save-dev
```

{pagebreak}

To attach it to the configuration, define a part for it first:

**webpack.parts.js**

```javascript
...
leanpub-start-insert
const BabiliPlugin = require('babili-webpack-plugin');
leanpub-end-insert

...

leanpub-start-insert
exports.minifyJavaScript = () => ({
  plugins: [
    new BabiliPlugin(),
  ],
});
leanpub-end-insert
```

The plugin exposes more functionality, but having the possibility of toggling source maps is enough. Hook it up with the configuration:

**webpack.config.js**

```javascript
const productionConfig = merge([
  ...
  parts.clean(PATHS.build),
leanpub-start-insert
  parts.minifyJavaScript(),
leanpub-end-insert
  ...
]);
```

{pagebreak}

If you execute `npm run build` now, you should see smaller results:

```bash
Hash: 12aec469d54202150429
Version: webpack 2.2.1
Time: 5265ms
        Asset       Size  Chunks             Chunk Names
       app.js  669 bytes       1  [emitted]  app
  ...font.eot     166 kB          [emitted]
...font.woff2    77.2 kB          [emitted]
 ...font.woff      98 kB          [emitted]
  ...font.svg     444 kB          [emitted]
     logo.png      77 kB          [emitted]
         0.js  399 bytes       0  [emitted]
  ...font.ttf     166 kB          [emitted]
leanpub-start-insert
    vendor.js    45.2 kB       2  [emitted]  vendor
leanpub-end-insert
      app.css     3.9 kB       1  [emitted]  app
     0.js.map    2.07 kB       0  [emitted]
   app.js.map    1.64 kB       1  [emitted]  app
  app.css.map   84 bytes       1  [emitted]  app
leanpub-start-insert
vendor.js.map     169 kB       2  [emitted]  vendor
leanpub-end-insert
   index.html  274 bytes          [emitted]
   [3] ./~/react/lib/ReactElement.js 11.2 kB {2} [built]
  [18] ./app/component.js 461 bytes {1} [built]
  [19] ./~/font-awesome/css/font-awesome.css 41 bytes {1} [built]
...
```

Given it needs to do more work, it took longer to execute the build. But on the plus side, the build is now smaller, the size limit warning disappeared, and the vendor build went from 150 kB to roughly 45 kB.

You should check *babili-webpack-plugin* and Babili documentation for more options. Babili gives you control over how to handle code comments for example.

{pagebreak}

## Other Ways to Minify JavaScript

Although Babili works for this use case, there are more options you can consider:

* [webpack-closure-compiler](https://www.npmjs.com/package/webpack-closure-compiler) runs parallel and gives even smaller result than Babili at times.
* [optimize-js-plugin](https://www.npmjs.com/package/optimize-js-plugin) complements the other solutions by wrapping eager functions and it enhances the way your JavaScript code gets parsed initially. The plugin relies on [optimize-js](https://github.com/nolanlawson/optimize-js) by Nolan Lawson.
* [webpack.optimize.UglifyJsPlugin](https://webpack.js.org/plugins/uglifyjs-webpack-plugin/) is the official UglifyJS plugin for webpack. It doesn't support ES6 yet.
* [uglifyjs-webpack-plugin](https://www.npmjs.com/package/uglifyjs-webpack-plugin) allows you to try out an experimental version of UglifyJS that provides better support for ES6 than the stable version.
* [uglify-loader](https://www.npmjs.com/package/uglify-loader) gives more granular control than webpack's `UglifyJsPlugin` in case you prefer to use UglifyJS.
* [webpack-parallel-uglify-plugin](https://www.npmjs.com/package/webpack-parallel-uglify-plugin) allows you to parallelize the minifying step and can yield extra performance as webpack doesn't run in parallel by default.

## Minifying CSS

*css-loader* allows minifying CSS through [cssnano](http://cssnano.co/). Minification needs to be enabled explicitly using the `minimize` option. You can also pass [cssnano specific options](http://cssnano.co/optimisations/) to the query to customize the behavior further.

[clean-css-loader](https://www.npmjs.com/package/clean-css-loader) allows you to use a popular CSS minifier [clean-css](https://www.npmjs.com/package/clean-css).

[optimize-css-assets-webpack-plugin](https://www.npmjs.com/package/optimize-css-assets-webpack-plugin) is a plugin based option that applies a chosen minifier on CSS assets. Using `ExtractTextPlugin` can lead to duplicated CSS given it only merges text chunks. `OptimizeCSSAssetsPlugin` avoids this problem by operating on the generated result and thus can lead to a better result.

W> In webpack 1 `minimize` was set on by default if `UglifyJsPlugin` was used. This confusing behavior was fixed in webpack 2, and now you have explicit control over minification.

### Setting Up CSS Minification

Out of the available solutions, `OptimizeCSSAssetsPlugin` composes the best. To attach it to the setup, install it and *cssnano* first:

```bash
npm install optimize-css-assets-webpack-plugin cssnano --save-dev
```

Like for JavaScript, you can wrap the idea in a configuration part:

**webpack.parts.js**

```javascript
...
leanpub-start-insert
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const cssnano = require('cssnano');
leanpub-end-insert

...

leanpub-start-insert
exports.minifyCSS = ({ options }) => ({
  plugins: [
    new OptimizeCSSAssetsPlugin({
      cssProcessor: cssnano,
      cssProcessorOptions: options,
      canPrint: false,
    }),
  ],
});
leanpub-end-insert
```

W> If you use `--json` output with webpack as discussed in the *Analyzing Build Statistics* chapter, you should set `canPrint: false` to avoid output. You can solve by exposing the flag as a parameter so you can control it based on the environment.

Then, connect with main configuration:

**webpack.config.js**

```javascript
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
      // potentially unsafe transformations.
      safe: true,
    },
  }),
leanpub-end-insert
  ...
]);
```

{pagebreak}

If you build the project now (`npm run build`), you should notice that CSS has become smaller as it's missing comments:

```bash
Hash: 12aec469d54202150429
Version: webpack 2.2.1
Time: 4764ms
        Asset       Size  Chunks             Chunk Names
       app.js  669 bytes       1  [emitted]  app
  ...font.eot     166 kB          [emitted]
...font.woff2    77.2 kB          [emitted]
 ...font.woff      98 kB          [emitted]
  ...font.svg     444 kB          [emitted]
     logo.png      77 kB          [emitted]
         0.js  399 bytes       0  [emitted]
  ...font.ttf     166 kB          [emitted]
    vendor.js    45.2 kB       2  [emitted]  vendor
leanpub-start-insert
      app.css    2.48 kB       1  [emitted]  app
leanpub-end-insert
     0.js.map    2.07 kB       0  [emitted]
   app.js.map    1.64 kB       1  [emitted]  app
  app.css.map   84 bytes       1  [emitted]  app
vendor.js.map     169 kB       2  [emitted]  vendor
   index.html  274 bytes          [emitted]
   [3] ./~/react/lib/ReactElement.js 11.2 kB {2} [built]
  [18] ./app/component.js 461 bytes {1} [built]
  [19] ./~/font-awesome/css/font-awesome.css 41 bytes {1} [built]
...
```

[cssnano](http://cssnano.co/) has a lot more options to try out.

{pagebreak}

## Minifying HTML

If you consume HTML templates through your code using [html-loader](https://www.npmjs.com/package/html-loader), you can preprocess it through [posthtml](https://www.npmjs.com/package/posthtml) with [posthtml-loader](https://www.npmjs.com/package/posthtml-loader). You can use [posthtml-minifier](https://www.npmjs.com/package/posthtml-minifier) to minify your HTML through it.

## Conclusion

Minification is the easiest step you can take to make your build smaller. To recap:

* **Minification** process analyzes your source code and turns it into a smaller form with the same meaning if you use safe transformations. Certain unsafe transformations allow you to reach even smaller results while potentially breaking code that relies, for example, on exact parameter naming.
* **Performance budget** allows you to set limits to the build size. Maintaining a budget can keep developers more conscious of the size of the generated bundles.
* Webpack includes `UglifyJsPlugin` for minification. Other solutions, such as Babili, provide similar functionality with costs of their own. While Babili supports ES6, it can be less performant than UglifyJS.
* Besides JavaScript, it's possible to minify other assets, such as CSS and HTML, too. Minifying these requires specific technologies that have to be applied through loaders and plugins of their own.

You'll learn to apply tree shaking against code in the next chapter.
