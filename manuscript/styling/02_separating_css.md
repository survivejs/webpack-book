# Separating CSS

Even though there is a nice build set up now, where did all the CSS go? As per configuration, it has been inlined to JavaScript! Although this can be convenient during development, it doesn't sound ideal.

The current solution doesn't allow caching CSS. You can also get a **Flash of Unstyled Content** (FOUC). FOUC happens because the browser takes a while to load JavaScript, and the styles would be applied only then. Separating CSS to a file of its own avoids the problem by letting the browser to manage it separately.

Webpack provides a means to generate a separate CSS bundles using [mini-css-extract-plugin](https://www.npmjs.com/package/mini-css-extract-plugin) (MCEP). It can aggregate multiple CSS files into one. For this reason, it comes with a loader that handles the extraction process. The plugin then picks up the result aggregated by the loader and emits a separate file with the styling.

W> It can be potentially dangerous to load inline styles with JavaScript in production as it represents an attack vector. **Critical path rendering** embraces the idea of rendering the critical CSS with inline styles in the initial HTML payload, improving the perceived performance of the site. In limited contexts inlining a small amount of CSS can be a viable option to speed up the initial load due to fewer requests.

T> [extract-css-chunks-webpack-plugin](https://github.com/faceyspacey/extract-css-chunks-webpack-plugin) is a community maintained alternative to **mini-css-extract-plugin** designed especially server-side rendering in mind.

{pagebreak}

## Setting up `MiniCssExtractPlugin`

Install the plugin first:

```bash
npm add mini-css-extract-plugin --develop
```

`MiniCssExtractPlugin` includes a loader, `MiniCssExtractPlugin.loader` that marks the assets to be extracted. Then a plugin performs its work based on this annotation.

Add configuration as below:

**webpack.parts.js**

```javascript
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

exports.extractCSS = ({ options = {}, loaders = [] } = {}) => {
  return {
    module: {
      rules: [
        {
          test: /\.css$/,
          use: [
            { loader: MiniCssExtractPlugin.loader, options },
            "css-loader",
          ].concat(loaders),
          sideEffects: true,
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

T> `sideEffects: true` is needed if you distribute your code as a package and want to use _Tree Shaking_ against it. In most use cases, you don't have to worry about setting the flag.

T> If you wanted to output the resulting file to a specific directory, you could do it by passing a path. Example: `filename: "styles/[name].css"`.

### Connecting with configuration

Connect the function with the configuration as below:

**webpack.config.js**

```javascript
const commonConfig = merge([
  ...
leanpub-start-delete
  parts.loadCSS(),
leanpub-end-delete
leanpub-start-insert
  parts.extractCSS(),
leanpub-end-insert
]);
```

T> If you are using _CSS Modules_, remember to tweak `use` as discussed in the _Loading Styles_ chapter. You can maintain separate setups for standard CSS and CSS Modules so that they get loaded through discrete logic.

{pagebreak}

After running `npm run build`, you should see output similar to the following:

```bash
> wp5-demo@0.0.0 build webpack-demo
> wp --mode production

⬡ webpack: Build Finished
⬡ webpack: asset index.html 237 bytes [compared for emit]
  asset main.js 136 bytes [compared for emit] [minimized] (name: main)
  asset main.css 33 bytes [compared for emit] (name: main)
...
  webpack 5.1.3 compiled successfully in 301 ms
```

Now styling has been pushed to a separate CSS file. Thus, the JavaScript bundle has become slightly smaller, and you avoid the FOUC problem. The browser doesn't have to wait for JavaScript to load to get styling information. Instead, it can process the CSS separately, avoiding the flash.

## Managing styles outside of JavaScript

Even though referring to styling through JavaScript and then bundling is the recommended option, it's possible to achieve the same result through an `entry` and [globbing](https://www.npmjs.com/package/glob) the CSS files through an entry:

```javascript
const glob = require("glob");

const commonConfig = merge([
  {
    entry: { style: glob.sync("./src/**/*.css") },
  },
]);
```

After this change, you don't have to refer to styling from your application code anymore. In this approach, you have to be careful with CSS ordering, though.

If you want strict control over the ordering, you can set up a single CSS entry and then use `@import` to bring the rest to the project through it. Another option would be to set up a JavaScript entry and go through `import` to get the same effect.

T> [webpack-watched-glob-entries-plugin](https://www.npmjs.com/package/webpack-watched-glob-entries-plugin) provides a helper for achieving the same. As a bonus, it supports webpack's watch mode so when you modify the entries, webpack will notice.

## Conclusion

The current setup separates styling from JavaScript neatly. Even though the technique is most valuable with CSS, it can be used to extract any type of modules to a separate file. The hard part of `MiniCssExtractPlugin` has to do with its setup, but the complexity can be hidden behind an abstraction.

To recap:

- Using `MiniCssExtractPlugin` with styling solves the problem of Flash of Unstyled Content (FOUC). Separating CSS from JavaScript also improves caching behavior and removes a potential attack vector.
- If you don't prefer to maintain references to styling through JavaScript, an alternative is to handle them through an entry. You have to be careful with style ordering in this case, though.

In the next chapter, you'll learn to eliminate unused CSS from the project.
