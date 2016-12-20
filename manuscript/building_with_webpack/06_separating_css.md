# Separating CSS

Even though we have a nice build set up now, where did all the CSS go? As per our configuration, it has been inlined to JavaScript! Even though this can be convenient during development, it doesn't sound ideal. The current solution doesn't allow us to cache CSS. In some cases we might suffer from a **Flash of Unstyled Content** (FOUC).

It just so happens that webpack provides a means to generate a separate CSS bundle. We can achieve this using the [ExtractTextPlugin](https://www.npmjs.com/package/extract-text-webpack-plugin). It comes with overhead during the compilation phase, and it won't work with Hot Module Replacement (HMR) by design. Given we are using it only for production, that won't be a problem.

T> This same technique can be used with other assets, like templates, too.

W> It can be potentially dangerous to use inline styles in production as it represents an attack vector! Favor `ExtractTextPlugin` and similar solutions in production usage.

## Setting Up *extract-text-webpack-plugin*

It will take some configuration to make it work. Install the plugin:

```bash
npm i extract-text-webpack-plugin@2.0.0-beta.4 --save-dev
```

The plugin operates in two parts. There's a loader, `ExtractTextPlugin.extract`, that marks the assets to be extracted. The plugin will perform its work based on this annotation. The idea looks like this:

**webpack.parts.js**

```javascript
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
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
          loader: ExtractTextPlugin.extract({
            fallbackLoader: 'style-loader',
            loader: 'css-loader'
          }),
          include: paths
        }
      ]
    },
    plugins: [
      // Output extracted CSS to a file
      new ExtractTextPlugin('[name].[chunkhash].css')
    ]
  };
}
leanpub-end-insert
```

W> You should **not** use `ExtractTextPlugin` for development configuration. In addition to slowing it down, it won't work with Hot Module Replacement (HMR). Inline the assets there for better development experience.

### Connecting with Configuration

Connect the function with our configuration as below:

**webpack.config.js**

```javascript
...

module.exports = function(env) {
  if (env === 'production') {
    return merge(
      common,
      ...
      parts.minify(),
leanpub-start-delete
      parts.setupCSS(PATHS.app)
leanpub-end-delete
leanpub-start-insert
      parts.extractCSS(PATHS.app)
leanpub-end-insert
    );
  }

  ...
};
```

Using this setup, we can still benefit from the HMR during development. For a production build, we generate a separate CSS, though. *html-webpack-plugin* will pick it up automatically and inject it into our `index.html`.

W> If you want to pass more loaders to the `ExtractTextPlugin`, you should use `!` syntax. Example: `ExtractTextPlugin.extract({ fallbackLoader: 'style-loader', loader: 'css-loader!postcss-loader' })`.

After running `npm run build`, you should see output similar to the following:

```bash
clean-webpack-plugin: /Users/juhovepsalainen/Projects/tmp/webpack-demo/build has been removed.
Hash: 98f119f8cf4be1762511
Version: webpack 2.2.0-rc.1
Time: 1318ms
                           Asset       Size  Chunks           Chunk Names
  vendor.d2d69e2291719248289e.js    19.7 kB  0, 2[emitted]  vendor
     app.f295058dfe46ebb72667.js  230 bytes  1, 2[emitted]  app
manifest.2c4031296370b2595d31.js    1.42 kB  2[emitted]  manifest
    app.f295058dfe46ebb72667.css   88 bytes  1, 2[emitted]  app
app.f295058dfe46ebb72667.css.map  105 bytes  1, 2[emitted]  app
                      index.html  416 bytes  [emitted]
  [15] ./app/component.js 136 bytes {1} [built]
  [16] ./app/main.css 41 bytes {1} [built]
  [29] ./app/index.js 124 bytes {1} [built]
  [30] multi vendor 28 bytes {0} [built]
  [31] ./~/css-loader!./app/main.css 190 bytes [built]
    + 29 hidden modules
Child html-webpack-plugin for "index.html":
        + 4 hidden modules
Child extract-text-webpack-plugin:
       [1] ./~/css-loader!./app/main.css 190 bytes {0} [built]
        + 1 hidden modules
```

T> If you are getting `Module build failed: CssSyntaxError:` error, make sure your `common` configuration doesn't have a CSS related section set up!

Now our styling has been pushed to a separate CSS file. As a result, our JavaScript bundles have become slightly smaller. We also avoid the FOUC problem. The browser doesn't have to wait for JavaScript to load to get styling information. Instead, it can process the CSS separately avoiding the flash.

The current setup is fairly nice. There's one problem, though. If you try to modify either *index.js* or *main.css*, the hash of both files (*app.js* and *app.css*) will change! This is because they belong to the same entry chunk due to that `require` at *app/index.js*. The problem can be avoided by separating chunks further or by using an alternative module id scheme that doesn't rely on number based chunk ids.

## Separating Application Code and Styling

A logical way to solve our chunk issue is to push application code and styling to separate entry chunks. This breaks the dependency and fixes caching. To achieve this we need to decouple styling from its current chunk and define a custom chunk for it through configuration:

**app/index.js**

```javascript
require('react');

leanpub-start-delete
require('./main.css');
leanpub-end-delete

...
```

In addition, we need to define a separate entry for styling:

**webpack.config.js**

```javascript
...

const PATHS = {
  app: path.join(__dirname, 'app'),
leanpub-start-insert
  style: path.join(__dirname, 'app', 'main.css'),
leanpub-end-insert
  build: path.join(__dirname, 'build')
};

const common = {
  // Entry accepts a path or an object of entries.
  // We'll be using the latter form given it's
  // convenient with more complex configurations.
  entry: {
leanpub-start-insert
    style: PATHS.style,
leanpub-end-insert
    app: PATHS.app
  },
  ...
};

module.exports = function(env) {
  if (env === 'production') {
    return merge(
      common,
      {
        devtool: 'source-map',
        output: {
          path: PATHS.build,
          filename: '[name].[chunkhash].js',
          // This is used for code splitting. The setup
          // will work without but this is useful to set.
          chunkFilename: '[chunkhash].js'
        }
      },
      parts.clean(PATHS.build),
      parts.setFreeVariable(
        'process.env.NODE_ENV',
        'production'
      ),
      parts.extractBundle({
        name: 'vendor',
        entries: ['react']
      }),
      parts.minify(),
leanpub-start-delete
      parts.extractCSS(PATHS.app)
leanpub-end-delete
leanpub-start-insert
      parts.extractCSS(PATHS.style)
leanpub-end-insert
    );
  }

  return merge(
    common,
    {
      devtool: 'eval-source-map',
      // Disable performance hints during development
      performance: {
        hints: false
      }
    },
leanpub-start-delete
    parts.setupCSS(PATHS.app),
leanpub-end-delete
leanpub-start-insert
    parts.setupCSS(PATHS.style),
leanpub-end-insert
    parts.devServer({
      // Customize host/port here if needed
      host: process.env.HOST,
      port: process.env.PORT
    })
  );
};
```

If you build the project now through `npm run build`, you should see something like this:

```bash
clean-webpack-plugin: /Users/juhovepsalainen/Projects/tmp/webpack-demo/build has been removed.
Hash: 992b15713ea05d224ee8
Version: webpack 2.2.0-rc.1
Time: 1194ms
                              Asset       Size  Chunks           Chunk Names
     vendor.0940842d7696bb59b31f.js    19.7 kB  0, 2, 3[emitted]  vendor
        app.e4846c8c4fa21d73bb72.js  213 bytes  1, 2, 3[emitted]  app
      style.547b5113533f91256e7d.js   28 bytes  2, 3[emitted]  style
   manifest.487f0a20d591b15ab733.js    1.45 kB  3, 2[emitted]  manifest
    vendor.0940842d7696bb59b31f.css   91 bytes  0, 2, 3[emitted]  vendor
vendor.0940842d7696bb59b31f.css.map  108 bytes  0, 2, 3[emitted]  vendor
                         index.html  495 bytes  [emitted]
  [15] ./app/component.js 136 bytes {1} [built]
  [16] ./app/main.css 41 bytes {0} [built]
  [29] ./app/index.js 124 bytes {1} [built]
  [30] multi vendor 28 bytes {0} [built]
  [31] ./~/css-loader!./app/main.css 190 bytes [built]
    + 29 hidden modules
Child html-webpack-plugin for "index.html":
        + 4 hidden modules
Child extract-text-webpack-plugin:
       [1] ./~/css-loader!./app/main.css 190 bytes {0} [built]
        + 1 hidden modules
```

After this step we have managed to separate styling from JavaScript. Changes made to it shouldn't affect JavaScript chunk hashes or vice versa. The approach comes with a small glitch, though.

If you look closely, you can see a file named *style.e5eae09a78b3efd50e73.js* in the output. Yours might be different. It is a file generated by Webpack and it looks like this:

```javascript
webpackJsonp([1,3],[function(n,c){}]);
```

Technically it's redundant. It would be safe to exclude the file through a check at *HtmlWebpackPlugin* template. But this solution is good enough for the project. Ideally Webpack shouldn't generate these files at all and there's [an issue](https://github.com/webpack/webpack/issues/1967) related to it.

T> In the future we might be able to avoid this problem by using `[contenthash]` placeholder. It's generated based on file content (i.e., CSS in this case). Unfortunately it doesn't work as expected when the file is included in a chunk as in our original setup. This issue has been reported as [Webpack issue #672](https://github.com/webpack/webpack/issues/672).

## Conclusion

Our current setup separates styling from JavaScript neatly. There is more we can do with CSS, though. Often big CSS frameworks come with plenty of CSS rules and a lot of those end up being unused. In the next chapter I will show you how to eliminate these rules from your build.
