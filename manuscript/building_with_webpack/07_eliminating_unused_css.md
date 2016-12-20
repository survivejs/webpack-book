# Eliminating Unused CSS

Frameworks like [Bootstrap](https://getbootstrap.com/) tend to come with a lot of CSS. Often you use only a small part of it. Normally you just bundle even the unused CSS. It is possible, however, to eliminate the portions you aren't using.

A tool known as [PurifyCSS](https://github.com/purifycss/purifycss) can achieve this by analyzing files. It walks through your code and figures out which CSS classes are being used. This is enough information for it to strip unused CSS from your project. It also works with single page applications.

## Setting Up PurifyCSS

Using PurifyCSS can lead to great savings. In their example they purify and minify Bootstrap (140 kB) in an application using ~40% of its selectors to mere ~35 kB. That's a big difference.

Webpack plugin known as [purifycss-webpack-plugin](https://www.npmjs.com/package/purifycss-webpack-plugin) allows us to achieve results like this. It is preferable to use the `ExtractTextPlugin` with it. Install it first:

```bash
npm i purifycss-webpack-plugin --save-dev
```

To make our demo more realistic, let's install a little CSS framework known as [Pure.css](http://purecss.io/) as well and refer to it from our project so that we can see PurifyCSS in action:

```bash
npm i purecss --save
```

W> You cannot use symlinks here. The dependencies have to be local like this or else webpack's lookups will fail to work reliably.

### Configuring Webpack

We also need to refer to it from our configuration:

**webpack.config.js**

```javascript
...

const PATHS = {
  app: path.join(__dirname, 'app'),
leanpub-start-delete
  style: path.join(__dirname, 'app', 'main.css'),
leanpub-end-delete
leanpub-start-insert
  style: [
    path.join(__dirname, 'node_modules', 'purecss'),
    path.join(__dirname, 'app', 'main.css')
  ],
leanpub-end-insert
  build: path.join(__dirname, 'build')
};

...
```

It is important to note that webpack `entry` expects files over directories. In this case webpack will resolve Pure.css in steps like this:

1. webpack looks up `node_modules/purecss/package.json`.
2. It find `"main": "build/pure-min.css"` field.
3. Based on that it will end up resolving to `node_modules/purecss/build/pure-min.css`.

Note that webpack allows you to shape this process. Sometimes `main` field might be missing entirely and you may need to define a `resolve.alias` to point to the file you want.

W> If you are using [cnpm](https://cnpmjs.org/), the path to *purecss* will be different. You can try `path.resolve(__dirname, 'node_modules/.npminstall/purecss/0.6.0/purecss')` or a similar line instead. Check out the *node_modules* directory carefully to figure out the exact path.

Thanks to our path setup we don't need to tweak the remainder of the code. If you execute `npm run build`, you should see something like this:

```bash
clean-webpack-plugin: /Users/juhovepsalainen/Projects/tmp/webpack-demo/build has been removed.
Hash: 36fadcf148aa839c3b88
Version: webpack 2.2.0-rc.1
Time: 1347ms
                              Asset       Size  Chunks           Chunk Names
     vendor.7dd64197ab77e318b260.js    19.7 kB  0, 3[emitted]  vendor
      style.e7ecd54f5d0714af3e65.js   87 bytes  1, 3[emitted]  style
        app.0936851ef7c1e4aef745.js  210 bytes  2, 3[emitted]  app
   manifest.a1de636cb54db545a66e.js    1.45 kB  3[emitted]  manifest
     style.e7ecd54f5d0714af3e65.css    15.8 kB  1, 3[emitted]  style
    vendor.7dd64197ab77e318b260.css   91 bytes  0, 3[emitted]  vendor
vendor.7dd64197ab77e318b260.css.map  108 bytes  0, 3[emitted]  vendor
 style.e7ecd54f5d0714af3e65.css.map  107 bytes  1, 3[emitted]  style
                         index.html  556 bytes  [emitted]
   [5] ./app/main.css 41 bytes {0} [built]
  [16] ./app/component.js 136 bytes {2} [built]
  [30] ./app/index.js 124 bytes {2} [built]
  [31] multi style 40 bytes {1} [built]
  [32] multi vendor 28 bytes {0} [built]
  [33] ./~/css-loader!./app/main.css 190 bytes [built]
    + 31 hidden modules
Child html-webpack-plugin for "index.html":
        + 4 hidden modules
Child extract-text-webpack-plugin:
        + 2 hidden modules
Child extract-text-webpack-plugin:
       [1] ./~/css-loader!./app/main.css 190 bytes {0} [built]
        + 1 hidden modules
```

As you can see, `style.e7ecd54f5d0714af3e65.css` grew from 28 bytes to 15.8 kB as it should have. Also the hash changed because the file contents changed as well.

In order to give PurifyCSS a chance to work and not eliminate whole Pure.css, we'll need to refer to it from our code. Add a `className` to our demo component like this:

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

### Enabling PurifyCSS

We need one more bit, PurifyCSS configuration. Expand parts like this:

**webpack.parts.js**

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
        // visible to Webpack. This expects glob patterns so
        // we adapt here.
        paths: paths.map(path => `${path}/*`),
        // Walk through only html files within node_modules. It
        // picks up .js files by default!
        resolveExtensions: ['.html']
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

module.exports = function(env) {
  if (env === 'production') {
    return merge(
      ...
      parts.minify(),
leanpub-start-delete
      parts.extractCSS(PATHS.style)
leanpub-end-delete
leanpub-start-insert
      parts.extractCSS(PATHS.style),
      parts.purifyCSS([PATHS.app])
leanpub-end-insert
    );
  }

  ...
};
```

Given webpack is aware of `PATHS.app` through an entry, we could skip passing it to `parts.purifyCSS`. As explicit is often nicer than implicit, having it here doesn't hurt. We'll get the same result either way.

If you execute `npm run build` now, you should see something like this:

```bash
clean-webpack-plugin: /Users/juhovepsalainen/Projects/tmp/webpack-demo/build has been removed.
Hash: 1e318eccaccf2a67caac
Version: webpack 2.2.0-rc.1
Time: 1488ms
                              Asset       Size  Chunks           Chunk Names
     vendor.7dd64197ab77e318b260.js    19.7 kB  0, 3[emitted]  vendor
      style.e7ecd54f5d0714af3e65.js   87 bytes  1, 3[emitted]  style
        app.2e387bc81deb031d3bcc.js  236 bytes  2, 3[emitted]  app
   manifest.84bb8a5c29115deb5756.js    1.45 kB  3[emitted]  manifest
     style.e7ecd54f5d0714af3e65.css  568 bytes  1, 3[emitted]  style
    vendor.7dd64197ab77e318b260.css   91 bytes  0, 3[emitted]  vendor
vendor.7dd64197ab77e318b260.css.map  108 bytes  0, 3[emitted]  vendor
 style.e7ecd54f5d0714af3e65.css.map  107 bytes  1, 3[emitted]  style
                         index.html  556 bytes  [emitted]
   [5] ./app/main.css 41 bytes {0} [built]
  [16] ./app/component.js 173 bytes {2} [built]
  [30] ./app/index.js 124 bytes {2} [built]
  [31] multi style 40 bytes {1} [built]
  [32] multi vendor 28 bytes {0} [built]
  [33] ./~/css-loader!./app/main.css 190 bytes [built]
    + 31 hidden modules
Child html-webpack-plugin for "index.html":
        + 4 hidden modules
Child extract-text-webpack-plugin:
        + 2 hidden modules
Child extract-text-webpack-plugin:
       [1] ./~/css-loader!./app/main.css 190 bytes {0} [built]
        + 1 hidden modules
```

The size of our style went from 15.8 kB to 568 bytes. Quite a difference! The technique is useful to know as it will likely come in handy with heavier CSS frameworks.

PurifyCSS supports [additional options](https://github.com/purifycss/purifycss#the-optional-options-argument). You could for example enable additional logging by setting `purifyOptions: { info: true }` when instantiating the plugin.

T> To decrease size further, you should set `purifyOptions: { minify: true }`. This will enable CSS minification.

## Conclusion

Build-wise our little project is starting to get there. Now our CSS is separate and pure. In the next chapter I'll show you how to analyze webpack build statistics so you understand better what the generated bundles actually contain.
