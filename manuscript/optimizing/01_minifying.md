# Minifying

The build output hasn't received attention yet and no doubt it's going to be chunky, especially as you included React in it. You can apply a variety of techniques to bring down the size of the vendor bundle. You can also leverage client level caching and load individual assets lazily as you saw earlier.

**Minification** is a process where the code is simplified without losing any meaning that matters to the interpreter. As a result, your code most likely looks jumbled, and it's hard to read. But that's the point.

## Generating a Baseline Build

To get started, you should generate a baseline build, so you have something to optimize. Execute `npm run build` to see output below:

```bash
Hash: 9164f800e257bf1d9791
Version: webpack 3.8.1
Time: 2398ms
        Asset       Size  Chunks                    Chunk Names
leanpub-start-insert
    vendor.js    83.7 kB       2  [emitted]         vendor
leanpub-end-insert
       app.js    2.49 kB       1  [emitted]         app
...
   index.html  274 bytes          [emitted]
    [6] ./app/index.js 176 bytes {1} [built]
   [14] ./app/main.css 41 bytes {1} [built]
   [15] ./app/component.js 464 bytes {1} [built]
...
```

83 kB for a vendor bundle is a lot! Minification should bring the size down.

## Enabling a Performance Budget

Webpack allows you to define a **performance budget**. The idea is that it gives your build size constraint which it has to follow. The feature is disabled by default and the calculation includes extracted chunks to entry calculation. If a budget isn't met and it has been configured to emit an error, it would terminate the entire build.

To integrate the feature into the project, adjust the configuration:

**webpack.config.js**

```javascript
const productionConfig = merge([
leanpub-start-insert
  {
    performance: {
      hints: "warning", // "error" or false are valid too
      maxEntrypointSize: 50000, // in bytes, default 250k
      maxAssetSize: 450000, // in bytes
    },
  },
leanpub-end-insert
  ...
]);
```

In practice you want to maintain lower limits. The current ones are enough for this demonstration. If you build now (`npm run build`), you should see a warning:

```bash
WARNING in entrypoint size limit: The following entrypoint(s) combined asset size exceeds the recommended limit (50 kB). This can impact web performance.
Entrypoints:
  app (89.5 kB)
      vendor.js
      app.js
      app.css
```

If minification works, the warning should disappear. That's the next challenge.

## Minifying JavaScript

The point of **minification** is to convert the code into a smaller form. Safe **transformations** do this without losing any meaning by rewriting code. Good examples of this include renaming variables or even removing entire blocks of code based on the fact that they are unreachable (`if (false)`).

Unsafe transformations can break code as they can lose something implicit the underlying code relies upon. For example, Angular 1 expects specific function parameter naming when using modules. Rewriting the parameters breaks code unless you take precautions against it in this case.

Minification in webpack can be enabled through `webpack -p` (same as `--optimize-minimize`). This uses webpack's `UglifyJsPlugin` underneath.

### Setting Up JavaScript Minification

[uglifyjs-webpack-plugin](https://www.npmjs.com/package/uglifyjs-webpack-plugin) allows you to use ES2015 syntax out of the box and minify it.

To get started, include the plugin to the project:

```bash
npm install uglifyjs-webpack-plugin --save-dev
```

{pagebreak}

To attach it to the configuration, define a part for it first:

**webpack.parts.js**

```javascript
...
const UglifyWebpackPlugin = require("uglifyjs-webpack-plugin");

exports.minifyJavaScript = () => ({
  plugins: [new UglifyWebpackPlugin()],
});
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

If you execute `npm run build` now, you should see smaller results:

```bash
Hash: 9164f800e257bf1d9791
Version: webpack 3.8.1
Time: 3165ms
        Asset       Size  Chunks             Chunk Names
leanpub-start-insert
    vendor.js    28.1 kB       2  [emitted]  vendor
leanpub-end-insert
       app.js  675 bytes       1  [emitted]  app
...
  app.css.map   84 bytes       1  [emitted]  app
leanpub-start-insert
vendor.js.map   86 bytes       2  [emitted]  vendor
leanpub-end-insert
   index.html  274 bytes          [emitted]
    [6] ./app/index.js 176 bytes {1} [built]
   [15] ./app/main.css 41 bytes {1} [built]
   [16] ./app/component.js 464 bytes {1} [built]
...
```

Given it needs to do more work, it took longer to execute the build. But on the plus side, the build is now smaller, the size limit warning disappeared, and the vendor build went from 83 kB to roughly 28 kB.

T> Source maps are disabled by default. You can enable them through the `sourceMap` flag. You should check *uglifyjs-webpack-plugin* for more options.

## Other Ways to Minify JavaScript

Although *uglifyjs-webpack-plugin* works for this use case, there are more options you can consider:

* [babel-minify-webpack-plugin](https://www.npmjs.com/package/babel-minify-webpack-plugin) relies on [babel-preset-minify](https://www.npmjs.com/package/babel-preset-minify) underneath and it has been developed by the Babel team. It's slower than UglifyJS, though.
* [webpack-closure-compiler](https://www.npmjs.com/package/webpack-closure-compiler) runs parallel and gives even smaller result than *babel-minify-webpack-plugin* at times. [closure-webpack-plugin](https://www.npmjs.com/package/closure-webpack-plugin) is another option.
* [butternut-webpack-plugin](https://www.npmjs.com/package/butternut-webpack-plugin) uses Rich Harris' experimental [butternut](https://www.npmjs.com/package/butternut) minifier underneath.

## Speeding Up JavaScript Execution

Certain solutions allow you to preprocess code so that it will run faster. They complement the minification technique:

* [prepack-webpack-plugin](https://www.npmjs.com/package/prepack-webpack-plugin) uses [Prepack](https://prepack.io/), a partial JavaScript evaluator. It rewrites computations that can be done compile-time and therefore speeds up code execution.
* [optimize-js-plugin](https://www.npmjs.com/package/optimize-js-plugin) complements the other solutions by wrapping eager functions and it enhances the way your JavaScript code gets parsed initially. The plugin relies on [optimize-js](https://github.com/nolanlawson/optimize-js) by Nolan Lawson.

## Minifying CSS

*css-loader* allows minifying CSS through [cssnano](http://cssnano.co/). Minification needs to be enabled explicitly using the `minimize` option. You can also pass [cssnano specific options](http://cssnano.co/optimisations/) to the query to customize the behavior further.

[clean-css-loader](https://www.npmjs.com/package/clean-css-loader) allows you to use a popular CSS minifier [clean-css](https://www.npmjs.com/package/clean-css).

[optimize-css-assets-webpack-plugin](https://www.npmjs.com/package/optimize-css-assets-webpack-plugin) is a plugin based option that applies a chosen minifier on CSS assets. Using `ExtractTextPlugin` can lead to duplicated CSS given it only merges text chunks. `OptimizeCSSAssetsPlugin` avoids this problem by operating on the generated result and thus can lead to a better result.

### Setting Up CSS Minification

Out of the available solutions, `OptimizeCSSAssetsPlugin` composes the best. To attach it to the setup, install it and [cssnano](http://cssnano.co/) first:

```bash
npm install optimize-css-assets-webpack-plugin cssnano --save-dev
```

Like for JavaScript, you can wrap the idea in a configuration part:

**webpack.parts.js**

```javascript
...
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const cssnano = require("cssnano");

exports.minifyCSS = ({ options }) => ({
  plugins: [
    new OptimizeCSSAssetsPlugin({
      cssProcessor: cssnano,
      cssProcessorOptions: options,
      canPrint: false,
    }),
  ],
});
```

W> If you use `--json` output with webpack as discussed in the *Build Analysis* chapter, you should set `canPrint: false` to avoid output. You can solve by exposing the flag as a parameter so you can control it based on the environment.

{pagebreak}

Then, connect with main configuration:

**webpack.config.js**

```javascript
const productionConfig = merge([
  ...
  parts.minifyJavaScript(),
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

If you build the project now (`npm run build`), you should notice that CSS has become smaller as it's missing comments:

```bash
Hash: 9164f800e257bf1d9791
Version: webpack 3.8.1
Time: 3254ms
        Asset       Size  Chunks             Chunk Names
...
  ...font.ttf     166 kB          [emitted]
leanpub-start-insert
      app.css    2.25 kB       1  [emitted]  app
leanpub-end-insert
     0.js.map    2.07 kB       0  [emitted]
   app.js.map    1.64 kB       1  [emitted]  app
...
```

## Minifying HTML

If you consume HTML templates through your code using [html-loader](https://www.npmjs.com/package/html-loader), you can preprocess it through [posthtml](https://www.npmjs.com/package/posthtml) with [posthtml-loader](https://www.npmjs.com/package/posthtml-loader). You can use [posthtml-minifier](https://www.npmjs.com/package/posthtml-minifier) to minify your HTML through it.

## Conclusion

Minification is the easiest step you can take to make your build smaller. To recap:

* **Minification** process analyzes your source code and turns it into a smaller form with the same meaning if you use safe transformations. Certain unsafe transformations allow you to reach even smaller results while potentially breaking code that relies, for example, on exact parameter naming.
* **Performance budget** allows you to set limits to the build size. Maintaining a budget can keep developers more conscious of the size of the generated bundles.
* Webpack includes `UglifyJsPlugin` for minification. Other solutions, such as *babel-minify-webpack-plugin*, provide similar functionality with costs of their own.
* Besides JavaScript, it's possible to minify other assets, such as CSS and HTML, too. Minifying these requires specific technologies that have to be applied through loaders and plugins of their own.

You'll learn to apply tree shaking against code in the next chapter.
