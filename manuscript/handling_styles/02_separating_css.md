# Separating CSS

Even though we have a nice build set up now, where did all the CSS go? As per our configuration, it has been inlined to JavaScript! Even though this can be convenient during development, it doesn't sound ideal. The current solution doesn't allow us to cache CSS. In some cases we might suffer from a **Flash of Unstyled Content** (FOUC).

It just so happens that webpack provides a means to generate a separate CSS bundle. We can achieve this using the [ExtractTextPlugin](https://www.npmjs.com/package/extract-text-webpack-plugin). It comes with overhead during the compilation phase, and it won't work with Hot Module Replacement (HMR) by design. Given we are using it only for production, that won't be a problem.

T> This same technique can be used with other assets, like templates, too.

W> It can be potentially dangerous to use inline styles in production as it represents an attack vector! Favor `ExtractTextPlugin` and similar solutions in production usage. In limited contexts inlining a small amount of CSS can be a viable option to speed up the initial load (less requests).

## Setting Up *extract-text-webpack-plugin*

It will take some configuration to make it work. Install the plugin:

```bash
npm i extract-text-webpack-plugin@2.0.0-beta.4 --save-dev
```

The plugin operates in two parts. There's a loader, `ExtractTextPlugin.extract`, that marks the assets to be extracted. Then a plugin will perform its work based on this annotation. The idea looks like this:

**webpack.parts.js**

```javascript
const webpack = require('webpack');
leanpub-start-insert
const ExtractTextPlugin = require('extract-text-webpack-plugin');
leanpub-end-insert

...

leanpub-start-insert
exports.extractCSS = function(paths) {
  return {
    module: {
      rules: [
        // Extract CSS during build
        {
          test: /\.css$/,
          // Restrict extraction process to the given
          // paths.
          include: paths,

          loader: ExtractTextPlugin.extract({
            fallbackLoader: 'style-loader',
            loader: 'css-loader'
          })
        }
      ]
    },
    plugins: [
      // Output extracted CSS to a file
      new ExtractTextPlugin('[name].css')
    ]
  };
};
leanpub-end-insert
```

That `[name]` placeholder will use name derived based on the entry where the CSS is referred to. Placeholders are discussed in greater detail in the *Adding Hashes to Filenames* chapter.

If you wanted to output the resulting file to a specific directory, you could do it like this: `new ExtractTextPlugin('styles/[name].css')`.

W> If you want to pass more loaders to the `ExtractTextPlugin`, you should use `!` syntax. Example: `ExtractTextPlugin.extract({ fallbackLoader: 'style-loader', loader: 'css-loader!postcss-loader' })`. It also supports `loader: { loader: 'css-loader', query: { ... } }` (note `query` over `options`!) formats, but not the webpack 2 standard format (`use` etc.).

### Connecting with Configuration

Connect the function with our configuration as below:

**webpack.config.js**

```javascript
...

module.exports = function(env) {
leanpub-start-insert
  if (env === 'production') {
    return merge(
      common,
      parts.extractCSS()
    );
  }
leanpub-end-insert

  ...
};
```

Using this setup, we can still benefit from the HMR during development. For a production build, we generate a separate CSS, though. *html-webpack-plugin* will pick it up automatically and inject it into our `index.html`.

After running `npm run build`, you should see output similar to the following:

```bash
Hash: e1ca76f06cdae42a00d6
Version: webpack 2.2.0-rc.2
Time: 1014ms
                                   Asset       Size  Chunks             Chunk Names
                                  app.js     3.9 kB       0  [emitted]  app
app.667b25a532447ab7bb849943e873bb62.css   33 bytes       0  [emitted]  app
                              index.html  251 bytes          [emitted]
   [0] ./app/component.js 133 bytes {0} [built]
   [1] ./app/main.css 41 bytes {0} [built]
   [2] ./app/index.js 582 bytes {0} [built]
...
```

Now our styling has been pushed to a separate CSS file. As a result, our JavaScript bundle has become slightly smaller. We also avoid the FOUC problem. The browser doesn't have to wait for JavaScript to load to get styling information. Instead, it can process the CSS separately avoiding the flash.

T> If you are getting `Module build failed: CssSyntaxError:` error, make sure your `common` configuration doesn't have a CSS related section set up!

## Conclusion

Our current setup separates styling from JavaScript neatly. There is more we can do with CSS, though. Often big CSS frameworks come with plenty of CSS rules and a lot of those end up being unused. In the next chapter I will show you how to eliminate these rules from your build.
