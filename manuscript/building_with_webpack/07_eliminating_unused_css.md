# Eliminating Unused CSS

Frameworks like [Bootstrap](https://getbootstrap.com/) tend to come with a lot of CSS. Often you use only a small part of it. Normally you just bundle even the unused CSS. It is possible, however, to eliminate the portions you aren't using. A tool known as [purifycss](https://github.com/purifycss/purifycss) can achieve this by analyzing our files. It also works with single page applications.

## Setting Up purifycss

Using purifycss can lead to great savings. In their example they purify and minify Bootstrap (140 kB) in an application using ~40% of its selectors to mere ~35 kB. That's a big difference.

Webpack plugin known as [purifycss-webpack-plugin](https://www.npmjs.com/package/purifycss-webpack-plugin) allows us to achieve results like this. It is preferable to use the `ExtractTextPlugin` with it. Install it first:

```bash
npm i purifycss-webpack-plugin --save-dev
```

To make our demo more realistic, let's install a little CSS framework known as [Pure.css](http://purecss.io/) as well and refer to it from our project so that we can see purifycss in action:

```bash
npm i purecss --save
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

As you can see, `style.e6624bc802ded7753823.css` grew from 82 bytes to 16.7 kB as it should have. Also the hash changed because the file contents changed as well.

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

PurifyCSS supports [additional options](https://github.com/purifycss/purifycss#the-optional-options-argument). You could for example enable additional logging by setting `purifyOptions: { info: true }` when instantiating the plugin.

T> To decrease size further, you should set `purifyOptions: { minify: true }`. This will enable CSS minification.

## Conclusion

Build-wise our little project is starting to get there. Now our CSS is separate and pure. In the next chapter I'll show you how to analyze Webpack build statistics so you understand better what the generated bundles actually contain.
