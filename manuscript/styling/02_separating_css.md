# Separating CSS

- TODO: https://github.com/faceyspacey/extract-css-chunks-webpack-plugin
- TODO: Mention `publicPath` for MCEP

Even though there is a nice build set up now, where did all the CSS go? As per configuration, it has been inlined to JavaScript! Even though this can be convenient during development, it doesn't sound ideal.

The current solution doesn't allow caching CSS. You can also get a **Flash of Unstyled Content** (FOUC). FOUC happens because the browser takes a while to load JavaScript and the styles would be applied only then. Separating CSS to a file of its own avoids the problem by letting the browser to manage it separately.

Webpack provides a means to generate a separate CSS bundles using [mini-css-extract-plugin](https://www.npmjs.com/package/mini-css-extract-plugin) (MCEP). It can aggregate multiple CSS files into one. For this reason, it comes with a loader that handles the extraction process. The plugin then picks up the result aggregated by the loader and emits a separate file with the styling.

W> It can be potentially dangerous to use inline styles within JavaScript in production as it represents an attack vector. **Critical path rendering** embraces the idea and inlines the critical CSS to the initial HTML payload improving the perceived performance of the site. In limited contexts inlining a small amount of CSS can be a viable option to speed up the initial load (fewer requests).

T> [extract-css-chunks-webpack-plugin](https://github.com/faceyspacey/extract-css-chunks-webpack-plugin) is a community maintained alternative to **mini-css-extract-plugin** designed especially server side rendering in mind.

## Setting Up `MiniCssExtractPlugin`

Install the plugin first:

```bash
npm add mini-css-extract-plugin -D
```

`MiniCssExtractPlugin` includes a loader, `MiniCssExtractPlugin.loader` that marks the assets to be extracted. Then a plugin performs its work based on this annotation.

Add the configuration below to the beginning of your configuration:

**webpack.parts.js**

```javascript
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

exports.extractCSS = ({ options = {} } = {}) => {
  return {
    module: {
      rules: [
        {
          test: /\.css$/,
          use: [
            { loader: MiniCssExtractPlugin.loader, options },
            "css-loader",
          ],
        },
      ],
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: "[name].css",
      }),
    ],
  };
};
```

That `[name]` placeholder uses the name of the entry where the CSS is referred. Placeholders and hashing are discussed in detail in the _Adding Hashes to Filenames_ chapter.

T> If you wanted to output the resulting file to a specific directory, you could do it by passing a path. Example: `filename: "styles/[name].css"`.

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

leanpub-start-delete
const productionConfig = merge([]);
leanpub-end-delete
leanpub-start-insert
const productionConfig = merge([
  parts.extractCSS(),
]);
leanpub-end-insert

const developmentConfig = merge([
  ...
leanpub-start-insert
  parts.extractCSS({ options: { hmr: true } }),
leanpub-end-insert
]);
```

Using this setup, you can still benefit from the HMR during development. For a production build, it's possible to generate a separate CSS, though. `HtmlWebpackPlugin` picks it up automatically and injects it into `index.html`.

T> If you are using _CSS Modules_, remember to tweak `use` accordingly as discussed in the _Loading Styles_ chapter. You can maintain separate setups for standard CSS and CSS Modules so that they get loaded through discrete logic.

T> You can drop the `loadCSS` function now as it won't be needed anymore. The setup above replaces it entirely.

{pagebreak}

After running `npm run build`, you should see output similar to the following:

```bash
Hash: 88be5c6578f27b8e90ff
Version: webpack 4.43.0
Time: 158ms
Built at: 07/09/2020 3:59:45 PM
     Asset       Size  Chunks             Chunk Names
index.html  237 bytes          [emitted]
  main.css   34 bytes       0  [emitted]  main
   main.js   1.06 KiB       0  [emitted]  main
Entrypoint main = main.css main.js
[0] ./src/main.css 39 bytes {0} [built]
[1] ./src/index.js + 1 modules 247 bytes {0} [built]
    | ./src/index.js 99 bytes [built]
    | ./src/component.js 143 bytes [built]
    + 1 hidden module
...
```

Now styling has been pushed to a separate CSS file. Thus, the JavaScript bundle has become slightly smaller and you avoid the FOUC problem. The browser doesn't have to wait for JavaScript to load to get styling information. Instead, it can process the CSS separately, avoiding the flash.

{pagebreak}

## Managing Styles Outside of JavaScript

Even though referring to styling through JavaScript and then bundling is the recommended option, it's possible to achieve the same result through an `entry` and [globbing](https://www.npmjs.com/package/glob) the CSS files through an entry:

```javascript
...
const glob = require("glob");

...

const commonConfig = merge([
  {
    entry: {
      ...
      style: glob.sync("./src/**/*.css"),
    },
    ...
  },
  ...
]);
```

After this type of change, you would not have to refer to styling from your application code. In this approach, you have to be careful with CSS ordering.

As a result, you should get both _style.css_ and _style.js_. The latter file contains content like `webpackJsonp([1,3],[function(n,c){}]);` and it doesn't do anything as discussed in the [webpack issue 1967](https://github.com/webpack/webpack/issues/1967). The limitation will go away in webpack 5 as it won't emit JavaScript files for anything that would be empty.

If you want strict control over the ordering, you can set up a single CSS entry and then use `@import` to bring the rest to the project through it. Another option would be to set up a JavaScript entry and go through `import` to get the same effect.

## Conclusion

The current setup separates styling from JavaScript neatly. Even though the technique is most valuable with CSS, it can be used to extract HTML templates or any other files types you consume. The hard part about `MiniCssExtractPlugin` has to do with its setup, but the complexity can be hidden behind an abstraction.

To recap:

- Using `MiniCssExtractPlugin` with styling solves the problem of Flash of Unstyled Content (FOUC). Separating CSS from JavaScript also improves caching behavior and removes a potential attack vector.
- If you don't prefer to maintain references to styling through JavaScript, an alternative is to handle them through an entry. You have to be careful with style ordering in this case, though.

In the next chapter, you'll learn to eliminate unused CSS from the project.
