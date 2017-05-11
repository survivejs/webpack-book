# Separating CSS

Even though there is a nice build set up now, where did all the CSS go? As per configuration, it has been inlined to JavaScript! Even though this can be convenient during development, it doesn't sound ideal.

The current solution doesn't allow to cache CSS. You can also get a **Flash of Unstyled Content** (FOUC). FOUC happens because the browser takes a while to load JavaScript and the styles would be applied only then. Separating CSS to a file of its own avoids the problem by letting the browser to manage it separately.

Webpack provides a means to generate a separate CSS bundles using [ExtractTextPlugin](https://www.npmjs.com/package/extract-text-webpack-plugin). It can aggregate multiple CSS files into one. For this reason, it comes with a loader that handles the extraction process. The plugin then picks up the result aggregated by the loader and emits a separate file.

Due to this process, `ExtractTextPlugin` comes with overhead during the compilation phase. It doesn't work with Hot Module Replacement by design. Given the plugin is used only for production, that is not a problem.

T> This same technique can be employed with other assets, like templates, too.

W> It can be potentially dangerous to use inline styles within JavaScript in production as it represents an attack vector. **Critical path rendering** embraces the idea and inlines the critical CSS to the initial HTML payload improving perceived performance of the site. In limited contexts inlining a small amount of CSS can be a viable option to speed up the initial load (fewer requests).

## Setting Up `ExtractTextPlugin`

Install the plugin first:

```bash
npm install extract-text-webpack-plugin --save-dev
```

`ExtractTextPlugin` includes a loader, `ExtractTextPlugin.extract` that marks the assets to be extracted. Then a plugin performs its work based on this annotation.

`ExtractTextPlugin.extract` accepts `use` and `fallback` definitions. `ExtractTextPlugin` processes content through `use` only from **initial chunks** by default and it uses `fallback` for the rest. It doesn't touch any split bundles unless `allChunks: true` is set true. The *Bundle Splitting* chapter digs into greater detail.

If you wanted to extract CSS from a more involved format, like Sass, you would have to pass multiple loaders to the `use` option. Both `use` and `fallback` accept a loader (string), a loader definition, or an array of loader definitions.

The idea can be modeled as below:

**webpack.parts.js**

```javascript
leanpub-start-insert
const ExtractTextPlugin = require('extract-text-webpack-plugin');
leanpub-end-insert

...

leanpub-start-insert
exports.extractCSS = ({ include, exclude, use }) => {
  // Output extracted CSS to a file
  const plugin = new ExtractTextPlugin({
    filename: '[name].css',
  });

  return {
    module: {
      rules: [
        {
          test: /\.css$/,
          include,
          exclude,

          use: plugin.extract({
            use,
            fallback: 'style-loader',
          }),
        },
      ],
    },
    plugins: [ plugin ],
  };
};
leanpub-end-insert
```

That `[name]` placeholder uses the name of the entry where the CSS is referred. Placeholders and hashing are discussed in detail in the *Adding Hashes to Filenames* chapter.

It would be possible to have multiple `plugin.extract` calls against different file types. This would allow you to aggregate them to a single CSS file. Another option would be to extract multiple CSS files through separate plugin definitions and then concatenate them using [merge-files-webpack-plugin](https://www.npmjs.com/package/merge-files-webpack-plugin).

T> If you wanted to output the resulting file to a specific directory, you could do it by passing a path. Example: `filename: 'styles/[name].css'`.

{pagebreak}

### Connecting with Configuration

Connect the function with the configuration as below:

**webpack.config.js**

```javascript
const commonConfig = merge([
  ...
leanpub-start-delete
  parts.loadCSS(),
leanpub-end-delete
]);

const productionConfig = merge([
leanpub-start-insert
  parts.extractCSS({ use: 'css-loader' }),
leanpub-end-insert
]);

const developmentConfig = merge([
  ...
leanpub-start-insert
  parts.loadCSS(),
leanpub-end-insert
]);
```

Using this setup, you can still benefit from the HMR during development. For a production build, it's possible to generate a separate CSS, though. `HtmlWebpackPlugin` picks it up automatically and injects it into `index.html`.

T> If you are using CSS Modules, remember to tweak `use` accordingly as discussed in the *Loading Styles* chapter. You can maintain separate setups for normal CSS and CSS Modules so that they get loaded through separate logic.

{pagebreak}

After running `npm run build`, you should see output similar to the following:

```bash
Hash: 57e54590377069688806
Version: webpack 2.2.1
Time: 952ms
     Asset       Size  Chunks             Chunk Names
    app.js    3.79 kB       0  [emitted]  app
   app.css   32 bytes       0  [emitted]  app
index.html  218 bytes          [emitted]
   [0] ./app/component.js 148 bytes {0} [built]
   [1] ./app/main.css 41 bytes {0} [built]
   [2] ./app/index.js 434 bytes {0} [built]
...
```

Now styling has been pushed to a separate CSS file. Thus, the JavaScript bundle has become slightly smaller. You also avoid the FOUC problem. The browser doesn't have to wait for JavaScript to load to get styling information. Instead, it can process the CSS separately, avoiding the flash.

T> If you are getting `Module build failed: CssSyntaxError:` or `Module build failed: Unknown word` error, make sure your `common` configuration doesn't have a CSS-related section set up.

T> [extract-loader](https://www.npmjs.com/package/extract-loader) is a light alternative to `ExtractTextPlugin`. It does less, but can be enough for basic extraction needs.

{pagebreak}

## Managing Styles Outside of JavaScript

Even though referring to styling through JavaScript and then bundling is the recommended option, it's possible to achieve the same result through an `entry` and [globbing](https://www.npmjs.com/package/glob):

```javascript
...
const glob = require('glob');

// Glob CSS files as an array of CSS files. This can be
// problematic due to CSS rule ordering so be careful!
const PATHS = {
  ...
leanpub-start-insert
  style: glob.sync('./app/**/*.css'),
leanpub-end-insert
};

...

const commonConfig = merge([
  {
    entry: {
      ...
leanpub-start-insert
      style: PATHS.style,
leanpub-end-insert
    },
    ...
  },
  ...
]);
```

After this type of change, you would not have to refer to styling from your application code. It also means that CSS Modules stop working. As a result, you should get both *style.css* and *style.js*. The latter file contains content like `webpackJsonp([1,3],[function(n,c){}]);` and it doesn't do anything as discussed in the [webpack issue 1967](https://github.com/webpack/webpack/issues/1967).

If you want strict control over the ordering, you can set up a single CSS entry and then use `@import` to bring the rest to the project through it. Another option would be to set up a JavaScript entry and go through `import` to get the same effect.

T> [css-entry-webpack-plugin](https://www.npmjs.com/package/css-entry-webpack-plugin) has been designed to help with this usage pattern. The plugin is able to extract a CSS bundle from an entry without `ExtractTextPlugin`.

## Conclusion

The current setup separates styling from JavaScript neatly. Even though the technique is most valuable with CSS, it can be used to extract HTML templates or any other files types you consume. The hard part about `ExtractTextPlugin` has to do with its setup, but the complexity can be hidden behind an abstraction.

To recap:

* Using `ExtractTextPlugin` with styling solves the problem of Flash of Unstyled Content (FOUC). Separating CSS from JavaScript also improves caching behavior and removes a potential attack vector.
* `ExtractTextPlugin` is not the only solution. *extract-loader* can give the same result in more limited contexts.
* If you don't prefer to maintain references to styling through JavaScript, an alternative is to handle them through an entry. You have to be careful with style ordering in this case, though.

In the next chapter, you'll learn to **autoprefix**. Enabling the feature makes it more convenient to develop complex CSS setups that work with older browsers as well.
