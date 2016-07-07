# Separating CSS

Even though we have a nice build set up now, where did all the CSS go? As per our configuration, it has been inlined to JavaScript! Even though this can be convenient during development, it doesn't sound ideal. The current solution doesn't allow us to cache CSS. In some cases we might suffer from a Flash of Unstyled Content (FOUC).

It just so happens that Webpack provides a means to generate a separate CSS bundle. We can achieve this using the [ExtractTextPlugin](https://www.npmjs.com/package/extract-text-webpack-plugin). It comes with overhead during the compilation phase, and it won't work with Hot Module Replacement (HMR) by design. Given we are using it only for production, that won't be a problem.

T> This same technique can be used with other assets, like templates, too.

W> It can be potentially dangerous to use inline styles in production as it represents an attack vector! Favor `ExtractTextPlugin` and similar solutions in production usage.

## Setting Up *extract-text-webpack-plugin*

It will take some configuration to make it work. Install the plugin:

```bash
npm i extract-text-webpack-plugin --save-dev
```

The plugin operates in two parts. There's a loader, `ExtractTextPlugin.extract`, that marks the assets to be extracted. The plugin will perform its work based on this annotation. The idea looks like this:

**libs/parts.js**

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
      loaders: [
        // Extract CSS during build
        {
          test: /\.css$/,
          loader: ExtractTextPlugin.extract('style', 'css'),
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

Connect the function with our configuration:

**webpack.config.js**

```javascript
...

// Detect how npm is run and branch based on that
switch(process.env.npm_lifecycle_event) {
  case 'build':
    config = merge(
      ...
      parts.minify(),
leanpub-start-insert
      parts.extractCSS(PATHS.app)
leanpub-end-insert
leanpub-start-delete
      parts.setupCSS(PATHS.app)
leanpub-end-delete
    );
    break;
  default:
    config = merge(
      ...
    );
}

module.exports = validate(config);
```

Using this setup, we can still benefit from the HMR during development. For a production build, we generate a separate CSS, though. *html-webpack-plugin* will pick it up automatically and inject it into our `index.html`.

W> Definitions, such as `loaders: [ExtractTextPlugin.extract('style', 'css')]`, won't work and will cause the build to error instead! So when using `ExtractTextPlugin`, use the `loader` form instead.

W> If you want to pass more loaders to the `ExtractTextPlugin`, you should use `!` syntax. Example: `ExtractTextPlugin.extract('style', 'css!postcss')`.

After running `npm run build`, you should see output similar to the following:

```bash
[webpack-validator] Config is valid.
clean-webpack-plugin: .../webpack-demo/build has been removed.
Hash: 27832e316f572a80ce4f
Version: webpack 1.13.0
Time: 3084ms
                               Asset       Size  Chunks             Chunk Names
         app.c3162186fdfffbe6bbed.js  277 bytes    0, 2  [emitted]  app
      vendor.21dc91b20c0b1e6e16a1.js    21.4 kB    1, 2  [emitted]  vendor
    manifest.149335ad7c6634496b11.js  821 bytes       2  [emitted]  manifest
        app.c3162186fdfffbe6bbed.css   80 bytes    0, 2  [emitted]  app
     app.c3162186fdfffbe6bbed.js.map    1.77 kB    0, 2  [emitted]  app
    app.c3162186fdfffbe6bbed.css.map  105 bytes    0, 2  [emitted]  app
  vendor.21dc91b20c0b1e6e16a1.js.map     274 kB    1, 2  [emitted]  vendor
manifest.149335ad7c6634496b11.js.map    8.78 kB       2  [emitted]  manifest
                          index.html  347 bytes          [emitted]
   [0] ./app/index.js 123 bytes {0} [built]
   [0] multi vendor 28 bytes {1} [built]
  [36] ./app/component.js 136 bytes {0} [built]
    + 35 hidden modules
Child html-webpack-plugin for "index.html":
        + 3 hidden modules
Child extract-text-webpack-plugin:
        + 2 hidden modules
```

T> If you are getting `Module build failed: CssSyntaxError:` error, make sure your `common` configuration doesn't have a CSS related section set up!

Now our styling has been pushed to a separate CSS file. As a result, our JavaScript bundles have become slightly smaller. We also avoid the FOUC problem. The browser doesn't have to wait for JavaScript to load to get styling information. Instead, it can process the CSS separately avoiding the flash.

The current setup is fairly nice. There's one problem, though. If you try to modify either *index.js* or *main.css*, the hash of both files (*app.js* and *app.css*) will change! This is because they belong to the same entry chunk due to that `require` at *app/index.js*. The problem can be avoided by separating chunks further.

T> If you have a complex project with a lot of dependencies, it is likely a good idea to use the `DedupePlugin`. It will find possible duplicate files and deduplicate them. Use `new webpack.optimize.DedupePlugin()` in your plugins definition to enable it. You should use it in your production build.

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

// Detect how npm is run and branch based on that
switch(process.env.npm_lifecycle_event) {
  case 'build':
    config = merge(
      ...
      parts.minify(),
leanpub-start-insert
      parts.extractCSS(PATHS.style)
leanpub-end-insert
leanpub-start-delete
      parts.extractCSS(PATHS.app)
leanpub-end-delete
    );
    break;
  default:
    config = merge(
      ...
leanpub-start-insert
      parts.setupCSS(PATHS.style),
leanpub-end-insert
leanpub-start-delete
      parts.setupCSS(PATHS.app),
leanpub-end-delete
      parts.devServer({
        // Customize host/port here if needed
        host: process.env.HOST,
        port: process.env.PORT
      })
    );
}

module.exports = validate(config);
```

If you build the project now through `npm run build`, you should see something like this:

```bash
[webpack-validator] Config is valid.
clean-webpack-plugin: .../webpack-demo/build has been removed.
Hash: e6e6cecdefbb54c610c1
Version: webpack 1.13.0
Time: 2788ms
                               Asset       Size  Chunks             Chunk Names
     app.a51c1a5cde933b81dc3e.js.map    1.57 kB    0, 3  [emitted]  app
         app.a51c1a5cde933b81dc3e.js  252 bytes    0, 3  [emitted]  app
      vendor.6947db44af2e47a304eb.js    21.4 kB    2, 3  [emitted]  vendor
    manifest.c2487fa71892504eb968.js  846 bytes       3  [emitted]  manifest
      style.e5eae09a78b3efd50e73.css   82 bytes    1, 3  [emitted]  style
       style.e5eae09a78b3efd50e73.js   93 bytes    1, 3  [emitted]  style
   style.e5eae09a78b3efd50e73.js.map  430 bytes    1, 3  [emitted]  style
  style.e5eae09a78b3efd50e73.css.map  107 bytes    1, 3  [emitted]  style
  vendor.6947db44af2e47a304eb.js.map     274 kB    2, 3  [emitted]  vendor
manifest.c2487fa71892504eb968.js.map    8.86 kB       3  [emitted]  manifest
                          index.html  402 bytes          [emitted]
   [0] ./app/index.js 100 bytes {0} [built]
   [0] multi vendor 28 bytes {2} [built]
  [32] ./app/component.js 136 bytes {0} [built]
    + 35 hidden modules
Child html-webpack-plugin for "index.html":
        + 3 hidden modules
Child extract-text-webpack-plugin:
        + 2 hidden modules
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
