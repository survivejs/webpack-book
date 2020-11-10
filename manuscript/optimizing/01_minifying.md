# Minifying

Since webpack 4, the production output gets minified using [terser](https://www.npmjs.com/package/terser) by default. Terser is an ES2015+ compatible JavaScript-minifier. Compared to UglifyJS, the earlier standard for many projects, it's a future-oriented option.

Although webpack minifies the output by default, it's good to understand how to customize the behavior should you want to adjust it further or replace the minifier.

## Minifying JavaScript

The point of **minification** is to convert the code into a smaller form. Safe **transformations** do this without losing any meaning by rewriting code. Good examples of this include renaming variables or even removing entire blocks of code based on the fact that they are unreachable (`if (false)`).

Unsafe transformations can break code as they can lose something implicit the underlying code relies upon. For example, Angular 1 expects specific function parameter naming when using modules. Rewriting the parameters breaks code unless you take precautions against it in this case.

### Modifying JavaScript minification process

In webpack, minification process is controlled through two configuration fields: `optimization.minimize` flag to toggle it and `optimization.minimizer` array to configure the process.

To tune the defaults, we'll attach [terser-webpack-plugin](https://www.npmjs.com/package/terser-webpack-plugin) to the project so that it's possible to adjust it.

{pagebreak}

To get started, include the plugin to the project:

```bash
npm add terser-webpack-plugin --develop
```

To attach it to the configuration, define a part for it first:

**webpack.parts.js**

```javascript
const TerserPlugin = require("terser-webpack-plugin");

exports.minifyJavaScript = () => ({
  optimization: {
    minimizer: [new TerserPlugin()],
  },
});
```

Hook it up to the configuration:

**webpack.config.js**

```javascript
const productionConfig = merge([
leanpub-start-insert
  parts.minifyJavaScript(),
leanpub-end-insert
  ...
]);
```

If you execute `npm run build` now, you should see result close to the same as before.

T> Source maps are disabled by default. You can enable them through the `sourceMap` flag. You should check **terser-webpack-plugin** documentation for further options.

T> To adjust Terser behavior, attach `terserOptions` with the related options to the plugin.

## Minifying JavaScript with Closure Compiler

[closure-webpack-plugin](https://www.npmjs.com/package/closure-webpack-plugin) uses Google's Closure Compiler underneath, runs parallel and often gives good results.

## Speeding up JavaScript execution

Specific solutions allow you to preprocess code so that it will run faster. They complement the minification technique and can be split into **scope hoisting**, **pre-evaluation**, and **improving parsing**. It's possible these techniques grow overall bundle size sometimes while allowing faster execution.

### Scope hoisting

Since webpack 4, it applies scope hoisting in production mode by default. It hoists all modules to a single scope instead of writing a separate closure for each. Doing this slows down the build but gives you bundles that are faster to execute. [Read more about scope hoisting](https://medium.com/webpack/brief-introduction-to-scope-hoisting-in-webpack-8435084c171f) at the webpack blog.

T> Set `stats.optimizationBailout` flag as `true` to gain debugging information related to hoisting results.

## Minifying HTML

If you consume HTML templates through your code using [html-loader](https://www.npmjs.com/package/html-loader), you can preprocess it through [posthtml](https://www.npmjs.com/package/posthtml) with [posthtml-loader](https://www.npmjs.com/package/posthtml-loader). You can use [posthtml-minifier](https://www.npmjs.com/package/posthtml-minifier) to minify your HTML through it and [posthtml-minify-classnames](https://www.npmjs.com/package/posthtml-minify-classnames) to reduce the length of class names.

## Minifying CSS

[clean-css-loader](https://www.npmjs.com/package/clean-css-loader) allows you to use a popular CSS minifier [clean-css](https://www.npmjs.com/package/clean-css).

[css-minimizer-webpack-plugin](https://www.npmjs.com/package/css-minimizer-webpack-plugin) is a plugin-based option that applies a chosen minifier on CSS assets. Using `MiniCssExtractPlugin` can lead to duplicated CSS given it only merges text chunks. **css-minimizer-webpack-plugin** avoids this problem by operating on the generated result and thus can lead to a better outcome. The plugin uses [cssnano](http://cssnano.co/) underneath.

### Setting Up CSS minification

To get started, install **css-minimizer-webpack-plugin** first:

```bash
npm add css-minimizer-webpack-plugin --develop
```

{pagebreak}

Like for JavaScript, you can wrap the idea in a configuration part:

**webpack.parts.js**

```javascript
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

exports.minifyCSS = ({ options }) => ({
  optimization: {
    minimizer: [
      new CssMinimizerPlugin({ minimizerOptions: options }),
    ],
  },
});
```

T> To override **cssnano** with another option, use the `minify` option. It accepts a function with the signature `(data, inputMap, minimizerOptions) => <string>`.

Then, connect with the main configuration:

**webpack.config.js**

```javascript
const productionConfig = merge([
  ...
  parts.minifyJavaScript(),
leanpub-start-insert
  parts.minifyCSS({
    options: {
      preset: ["default"],
    },
  }),
leanpub-end-insert
  ...
]);
```

{pagebreak}

If you build the project now (`npm run build`), you should notice that CSS has become smaller as it's missing comments and has been concatenated:

```bash
⬡ webpack: Build Finished
⬡ webpack: assets by path *.js 129 KiB
    asset vendor.js 126 KiB [emitted] [minimized] (name: vendor) (id hint: commons) 2 related assets
    asset main.js 3.32 KiB [emitted] [minimized] (name: main) 2 related assets
    asset 34.js 247 bytes [emitted] [minimized] 2 related assets
  asset main.css 730 bytes [emitted] (name: main)
...
  webpack 5.1.3 compiled successfully in 6388 ms

```

T> [compression-webpack-plugin](https://www.npmjs.com/package/compression-webpack-plugin) allows you to push the problem of generating compressed files to webpack to potentially save processing time on the server.

T> Using [last-call-webpack-plugin](https://www.npmjs.com/package/last-call-webpack-plugin) is a more generic approach and you can use it to define which processing to use against which file format before webpack finishes processing.

## Compressing bundles

Compression techniques, such as gzip or brotli, can be used to reduce the file size further. The downside of using additional compression is that it will lead to extra computation on the client side but on the plus side you save bandwidth.

{pagebreak}

Often the compression setup can be done on server-side although it's possible to perform preprocessing using webpack using the following plugins:

- [compression-webpack-plugin](https://www.npmjs.com/package/compression-webpack-plugin) is a generic compression plugin that lets you choose amongst multiple option
- [brotli-webpack-plugin](https://www.npmjs.com/package/brotli-webpack-plugin) works specifically with brotli.

## Obfuscating output

To make it more tricky for third parties to use your code, [obfuscator-loader](https://github.com/javascript-obfuscator/obfuscator-loader) can be applied. Although protecting code is difficult when it's shared with the client, the code can be made much harder to use.

## Conclusion

Minification is the most comfortable step you can take to make your build smaller. To recap:

- **Minification** process analyzes your source code and turns it into a smaller form with the same meaning if you use safe transformations. Specific unsafe transformations allow you to reach even smaller results while potentially breaking code that relies, for example, on exact parameter naming.
- Webpack performs minification in production mode using Terser by default. Other solutions, such as Google Closure Compiler, provide similar functionality with costs of their own.
- Besides JavaScript, it's possible to minify other assets, such as CSS and HTML too. Minifying these requires specific technologies that have to be applied through loaders and plugins of their own.

You'll learn to apply tree shaking against code in the next chapter.
