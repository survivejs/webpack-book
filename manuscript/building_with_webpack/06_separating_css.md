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

The plugin operates in two parts. There's a loader, `ExtractTextPlugin.extract`, that marks the assets to be extracted. The plugin itself will then use that information to write the file. In a function form the idea looks like this:

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

Now our styling has been pushed to a separate CSS file. As a result, our JavaScript bundles have become slightly smaller. We also avoid the FOUC problem. The browser doesn't have to wait for JavaScript to load to get styling information. Instead, it can process CSS separately avoiding flash of unstyled content (FOUC).

The current setup is fairly nice. There's one problem, though. If you try to modify either *index.js* or *main.css*, the hash of both files (*app.js* and *app.css*) will change! This is because they belong to the same entry chunk due to that `require` at *app/index.js*. The problem can be avoided by separating chunks further.

T> If you have a complex project with a lot of dependencies, it is likely a good idea to use the `DedupePlugin`. It will find possible duplicate files and deduplicate them. Use `new webpack.optimize.DedupePlugin()` in your plugins definition to enable it.

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

Technically it's redundant. It would be safe to exclude the file through a check at *HtmlWebpackPlugin* template. But this solution is good enough for the project. Ideally Webpack shouldn't generate these files at all.

T> In the future we might be able to avoid this problem by using `[contenthash]` placeholder. It's generated based on file content (i.e., CSS in this case). Unfortunately it doesn't work as expected when the file is included in a chunk as in our original setup. This issue has been reported as [Webpack issue #672](https://github.com/webpack/webpack/issues/672).

## Eliminating Unused CSS

Frameworks like [Bootstrap](https://getbootstrap.com/) tend to come with a lot of CSS. Often you use only a small part of it. Normally you just bundle even the unused CSS. It is possible, however, to eliminate the portions you aren't using. A tool known as [purifycss](https://github.com/purifycss/purifycss) can achieve this by analyzing our files. It also works with single page applications.

Using purifycss can lead to great savings. In their example they purify and minify Bootstrap (140 kB) in an application using ~40% of its selectors to mere ~35 kB. That's a big difference.

Webpack plugin known as [purifycss-webpack-plugin](https://www.npmjs.com/package/purifycss-webpack-plugin) allows us to achieve results like this. It is preferable to use the `ExtractTextPlugin` with it. Install it first:

```bash
npm i purifycss-webpack-plugin --save-dev
```

To make our demo more realistic, let's install a little CSS framework known as [Pure.css](http://purecss.io/) as well and refer to it from our project so that we can see purifycss in action:

```bash
npm i purecss --save-dev
```

We also need to refer to it from our configuration:

**webpack.config.js**

```javascript
...

const PATHS = {
  app: path.join(__dirname, 'app'),
leanpub-start-insert
  style: [
    path.join(__dirname, 'node_modules', 'purecss'),
    path.join(__dirname, 'app', 'main.css')
  ],
leanpub-end-insert
leanpub-start-delete
  style: path.join(__dirname, 'app', 'main.css'),
leanpub-end-delete
  build: path.join(__dirname, 'build')
};

...
```

Thanks to our path setup we don't need to tweak the remainder of the code. If you execute `npm run build`, you should see something like this:

```bash
[webpack-validator] Config is valid.
clean-webpack-plugin: .../webpack-demo/build has been removed.
Hash: adc32c7f82a388002a6e
Version: webpack 1.13.0
Time: 3656ms
                               Asset       Size  Chunks             Chunk Names
     app.a51c1a5cde933b81dc3e.js.map    1.57 kB    0, 3  [emitted]  app
         app.a51c1a5cde933b81dc3e.js  252 bytes    0, 3  [emitted]  app
      vendor.6947db44af2e47a304eb.js    21.4 kB    2, 3  [emitted]  vendor
    manifest.86e8bb3f3a596746a1a6.js  846 bytes       3  [emitted]  manifest
      style.e6624bc802ded7753823.css    16.7 kB    1, 3  [emitted]  style
       style.e6624bc802ded7753823.js  156 bytes    1, 3  [emitted]  style
   style.e6624bc802ded7753823.js.map  834 bytes    1, 3  [emitted]  style
  style.e6624bc802ded7753823.css.map  107 bytes    1, 3  [emitted]  style
  vendor.6947db44af2e47a304eb.js.map     274 kB    2, 3  [emitted]  vendor
manifest.86e8bb3f3a596746a1a6.js.map    8.86 kB       3  [emitted]  manifest
                          index.html  402 bytes          [emitted]
   [0] ./app/index.js 100 bytes {0} [built]
   [0] multi vendor 28 bytes {2} [built]
   [0] multi style 40 bytes {1} [built]
  [32] ./app/component.js 136 bytes {0} [built]
    + 37 hidden modules
Child html-webpack-plugin for "index.html":
        + 3 hidden modules
Child extract-text-webpack-plugin:
        + 2 hidden modules
Child extract-text-webpack-plugin:
        + 2 hidden modules
```

As you can see, `style.e6624bc802ded7753823.css` reduced from 82 bytes to 16.7 kB as it should have. Also the hash changed because the file contents changed as well.

In order to give purifycss a chance to work and not eliminate whole PureCSS, we'll need to refer to it from our code. Add a `className` to our demo component like this:

**app/component.js**

```javascript
module.exports = function () {
  var element = document.createElement('h1');

leanpub-start-insert
  element.className = 'pure-button';
leanpub-end-insert
  element.innerHTML = 'Hello world';

  return element;
};
```

If you run the application (`npm start`), our "Hello world" should look like a button.

We need one more bit, the configuration needed to make purifycss work. Expand parts like this:

**libs/parts.js**

```javascript
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
leanpub-start-insert
const PurifyCSSPlugin = require('purifycss-webpack-plugin');
leanpub-end-insert

...

leanpub-start-insert
exports.purifyCSS = function(paths) {
  return {
    plugins: [
      new PurifyCSSPlugin({
        basePath: process.cwd(),
        // `paths` is used to point PurifyCSS to files not
        // visible to Webpack. You can pass glob patterns
        // to it.
        paths: paths
      }),
    ]
  }
}
leanpub-end-insert
```

Next we need to connect this part to our configuration. It is important the plugin is used *after* the `ExtractTextPlugin` as otherwise it won't work!

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
      parts.extractCSS(PATHS.style),
      parts.purifyCSS([PATHS.app])
leanpub-end-insert
leanpub-start-delete
      parts.extractCSS(PATHS.style)
leanpub-end-delete
    );
  default:
    ...

module.exports = validate(config);
```

Given Webpack is aware of `PATHS.app` through an entry, we could skip passing it to `parts.purifyCSS`. As explicit is often nicer than implicit, having it here doesn't hurt. We'll get the same result either way.

If you execute `npm run build` now, you should see something like this:

```bash
[webpack-validator] Config is valid.
clean-webpack-plugin: .../webpack-demo/build has been removed.
Hash: 7eaf3b6bae4156774447
Version: webpack 1.13.0
Time: 8703ms
                               Asset       Size  Chunks             Chunk Names
     app.a26b058bec8ce4d237ff.js.map    1.57 kB    0, 3  [emitted]  app
         app.a26b058bec8ce4d237ff.js  252 bytes    0, 3  [emitted]  app
      vendor.6947db44af2e47a304eb.js    21.4 kB    2, 3  [emitted]  vendor
    manifest.79745ac6c18fa88e9d61.js  846 bytes       3  [emitted]  manifest
      style.e6624bc802ded7753823.css    13.1 kB    1, 3  [emitted]  style
       style.e6624bc802ded7753823.js  156 bytes    1, 3  [emitted]  style
   style.e6624bc802ded7753823.js.map  834 bytes    1, 3  [emitted]  style
  style.e6624bc802ded7753823.css.map  107 bytes    1, 3  [emitted]  style
  vendor.6947db44af2e47a304eb.js.map     274 kB    2, 3  [emitted]  vendor
manifest.79745ac6c18fa88e9d61.js.map    8.86 kB       3  [emitted]  manifest
                          index.html  402 bytes          [emitted]
   [0] ./app/index.js 100 bytes {0} [built]
   [0] multi vendor 28 bytes {2} [built]
   [0] multi style 40 bytes {1} [built]
  [32] ./app/component.js 137 bytes {0} [built]
    + 37 hidden modules
Child html-webpack-plugin for "index.html":
        + 3 hidden modules
Child extract-text-webpack-plugin:
        + 2 hidden modules
Child extract-text-webpack-plugin:
        + 2 hidden modules
```

The size of our style went from 16.7 kB to 13.1 kB. It is not a huge difference in this case, but it is still something. It is interesting to note that processing time went from three seconds to eight so there is a cost involved! The technique is useful to know as it will likely come in handy with heavier CSS frameworks.

PurifyCSS supports [additional options](https://github.com/purifycss/purifycss#the-optional-options-argument). You could for example enable additional logging by setting `purifyOptions: {info: true}` when instantiating the plugin.

## Conclusion

Build-wise our little project is starting to get there. Now our CSS is separate and pure. In the next chapter I'll show you how to analyze Webpack build statistics so you understand better what the generated bundles actually contain.
