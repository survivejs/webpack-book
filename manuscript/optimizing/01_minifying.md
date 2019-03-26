# Minifying

Since webpack 4, the production output gets minified using [terser](https://www.npmjs.com/package/terser) by default. Terser is an ES2015+ compatible JavaScript-minifier. Compared to UglifyJS, the earlier standard for many projects, it's a future oriented option. There was a fork of UglifyJS, *uglify-es*, but as it's not maintained anymore, terser was born as an independent fork.

Althouogh webpack 4 minifies the output by default, it's good to understand how to customize the behavior should you want to adjust it further or replace the minifier.

## Minifying JavaScript

The point of **minification** is to convert the code into a smaller form. Safe **transformations** do this without losing any meaning by rewriting code. Good examples of this include renaming variables or even removing entire blocks of code based on the fact that they are unreachable (`if (false)`).

Unsafe transformations can break code as they can lose something implicit the underlying code relies upon. For example, Angular 1 expects specific function parameter naming when using modules. Rewriting the parameters breaks code unless you take precautions against it in this case.

### Modifying JavaScript Minification Process

In webpack 4, minification process is controlled through two configuration fields: `optimization.minimize` flag to toggle it and `optimization.minimizer` array to configure the process.

To tune the defaults, we'll attach [terser-webpack-plugin](hhttps://www.npmjs.com/package/terser-webpack-plugin) to the project so that it's possible to adjust it.

To get started, include the plugin to the project:

```bash
npm install terser-webpack-plugin --save-dev
```

{pagebreak}

To attach it to the configuration, define a part for it first:

**webpack.parts.js**

```javascript
const TerserPlugin = require("terser-webpack-plugin");

exports.minifyJavaScript = () => ({
  optimization: {
    minimizer: [new TerserPlugin({ sourceMap: true })],
  },
});
```

Hook it up to the configuration:

**webpack.config.js**

```javascript
const productionConfig = merge([
  parts.clean(PATHS.build),
leanpub-start-insert
  parts.minifyJavaScript(),
leanpub-end-insert
  ...
]);
```

If you execute `npm run build` now, you should see result close to the same as before.

T> Source maps are disabled by default. You can enable them through the `sourceMap` flag. You should check *terser-webpack-plugin* for more options.

T> To adjust Terser, attach `terserOptions` with the related options to the plugin.

{pagebreak}

## Other Ways to Minify JavaScript

Although the defaults and *terser-webpack-plugin* works for this use case, there are more options you can consider:

* [babel-minify-webpack-plugin](https://www.npmjs.com/package/babel-minify-webpack-plugin) relies on [babel-preset-minify](https://www.npmjs.com/package/babel-preset-minify) underneath and it has been developed by the Babel team.
* [webpack-closure-compiler](https://www.npmjs.com/package/webpack-closure-compiler) runs parallel and gives even smaller result than *babel-minify-webpack-plugin* at times. [closure-webpack-plugin](https://www.npmjs.com/package/closure-webpack-plugin) is another option.
* [butternut-webpack-plugin](https://www.npmjs.com/package/butternut-webpack-plugin) uses Rich Harris' experimental [butternut](https://www.npmjs.com/package/butternut) minifier underneath.

## Speeding Up JavaScript Execution

Specific solutions allow you to preprocess code so that it will run faster. They complement the minification technique and can be split into **scope hoisting**, **pre-evaluation**, and **improving parsing**. It's possible these techniques grow overall bundle size sometimes while allowing faster execution.

### Scope Hoisting

Since webpack 4, it applies scope hoisting in production mode by default. It hoists all modules to a single scope instead of writing a separate closure for each. Doing this slows down the build but gives you bundles that are faster to execute. [Read more about scope hoisting](https://medium.com/webpack/brief-introduction-to-scope-hoisting-in-webpack-8435084c171f) at the webpack blog.

T>  Pass `--display-optimization-bailout` flag to webpack to gain debugging information related to hoisting results.

### Pre-evaluation

[prepack-webpack-plugin](https://www.npmjs.com/package/prepack-webpack-plugin) uses [Prepack](https://prepack.io/), a partial JavaScript evaluator. It rewrites computations that can be done compile-time and therefore speeds up code execution. See also [val-loader](https://www.npmjs.com/package/val-loader) and [babel-plugin-preval](https://www.npmjs.com/package/babel-plugin-preval) for alternative solutions.

### Improving Parsing

[optimize-js-plugin](https://www.npmjs.com/package/optimize-js-plugin) complements the other solutions by wrapping eager functions, and it enhances the way your JavaScript code gets parsed initially. The plugin relies on [optimize-js](https://github.com/nolanlawson/optimize-js) by Nolan Lawson.

## Minifying HTML

If you consume HTML templates through your code using [html-loader](https://www.npmjs.com/package/html-loader), you can preprocess it through [posthtml](https://www.npmjs.com/package/posthtml) with [posthtml-loader](https://www.npmjs.com/package/posthtml-loader). You can use [posthtml-minifier](https://www.npmjs.com/package/posthtml-minifier) to minify your HTML through it.

## Minifying CSS

[clean-css-loader](https://www.npmjs.com/package/clean-css-loader) allows you to use a popular CSS minifier [clean-css](https://www.npmjs.com/package/clean-css).

[optimize-css-assets-webpack-plugin](https://www.npmjs.com/package/optimize-css-assets-webpack-plugin) is a plugin based option that applies a chosen minifier on CSS assets. Using `MiniCssExtractPlugin` can lead to duplicated CSS given it only merges text chunks. `OptimizeCSSAssetsPlugin` avoids this problem by operating on the generated result and thus can lead to a better result.

### Setting Up CSS Minification

Out of the available solutions, `OptimizeCSSAssetsPlugin` composes the best. To attach it to the setup, install it and [cssnano](http://cssnano.co/) first:

```bash
npm install optimize-css-assets-webpack-plugin cssnano --save-dev
```

{pagebreak}

Like for JavaScript, you can wrap the idea in a configuration part:

**webpack.parts.js**

```javascript
const OptimizeCSSAssetsPlugin = require(
  "optimize-css-assets-webpack-plugin"
);
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

W> If you use `--json` output with webpack as discussed in the *Build Analysis* chapter, you should set `canPrint: false` for the plugin.

{pagebreak}

Then, connect with the main configuration:

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
Hash: f51ecf99e0da4db99834
Version: webpack 4.1.1
Time: 3125ms
Built at: 3/16/2018 5:32:55 PM
           Asset       Size  Chunks             Chunk Names
      chunk.0.js  162 bytes       0  [emitted]
      chunk.1.js   96.8 KiB       1  [emitted]  vendors~main
         main.js   2.19 KiB       2  [emitted]  main
leanpub-start-insert
        main.css    1.2 KiB       2  [emitted]  main
vendors~main.css   1.32 KiB       1  [emitted]  vendors~main
leanpub-end-insert
  chunk.0.js.map  204 bytes       0  [emitted]
  chunk.1.js.map    235 KiB       1  [emitted]  vendors~main
...
```

T> [compression-webpack-plugin](https://www.npmjs.com/package/compression-webpack-plugin) allows you to push the problem of generating compressed files to webpack to potentially save processing time on the server.

## Minifying Images

Image size can be reduced by using [img-loader](https://www.npmjs.com/package/img-loader), [imagemin-webpack](https://www.npmjs.com/package/imagemin-webpack), and [imagemin-webpack-plugin](https://www.npmjs.com/package/imagemin-webpack-plugin). The packages use image optimizers underneath.

It can be a good idea to use *cache-loader* and *thread-loader* with these as discussed in the *Performance* chapter given they can be substantial operations.

## Conclusion

Minification is the most comfortable step you can take to make your build smaller. To recap:

* **Minification** process analyzes your source code and turns it into a smaller form with the same meaning if you use safe transformations. Specific unsafe transformations allow you to reach even smaller results while potentially breaking code that relies, for example, on exact parameter naming.
* Webpack performs minification in production mode using Terser by default. Other solutions, such as *babel-minify-webpack-plugin*, provide similar functionality with costs of their own.
* Besides JavaScript, it's possible to minify other assets, such as CSS, HTML, and images, too. Minifying these requires specific technologies that have to be applied through loaders and plugins of their own.

You'll learn to apply tree shaking against code in the next chapter.
