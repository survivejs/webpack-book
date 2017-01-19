# Eliminating Unused CSS

Frameworks like [Bootstrap](https://getbootstrap.com/) tend to come with a lot of CSS. Often you use only a small part of it. Normally, you just bundle even the unused CSS. It is possible, however, to eliminate the portions you aren't using.

A tool known as [PurifyCSS](https://github.com/purifycss/purifycss) can achieve this by analyzing files. It walks through your code and figures out which CSS classes are being used. This is enough information for it to strip unused CSS from your project. It also works with single page applications.

## Setting Up Pure.css

To make our demo more realistic, let's install a little CSS framework known as [Pure.css](http://purecss.io/) as well and refer to it from our project so that we can see PurifyCSS in action. These two projects aren't related in any way despite the naming.

```bash
npm i purecss --save
```

To make the project aware of Pure.css, `import` it:

**app/index.js**

```javascript
leanpub-start-insert
import 'purecss';
leanpub-end-insert
import './main.css';
import component from './component';

...
```

We should also make our demo component use a Pure.css class so we have something to work with:

**app/component.js**

```javascript
module.exports = function () {
  const element = document.createElement('h1');

leanpub-start-insert
  element.className = 'pure-button';
leanpub-end-insert
  element.innerHTML = 'Hello world';

  return element;
};
```

If you run the application (`npm start`), our "Hello world" should look like a button.

![Styled hello](images/styled-button.png)

Building the application (`npm run build`) should yield output like this:

```bash
Hash: a2231eda28272b4c83d5
Version: webpack 2.2.0
Time: 1210ms
     Asset       Size  Chunks             Chunk Names
    app.js    4.25 kB       0  [emitted]  app
   app.css    16.5 kB       0  [emitted]  app
index.html  218 bytes          [emitted]
   [0] ./app/component.js 172 bytes {0} [built]
   [1] ./app/main.css 41 bytes {0} [built]
   [2] ./~/purecss/build/pure-min.css 41 bytes {0} [built]
...
```

As you can see, the size of the CSS file grew quite a bit. This is something we'll fix next with PurifyCSS.

## Enabling PurifyCSS

Using PurifyCSS can lead to great savings. In their example, they purify and minify Bootstrap (140 kB) in an application using ~40% of its selectors to mere ~35 kB. That's a big difference.

Webpack plugin known as [purifycss-webpack-plugin](https://www.npmjs.com/package/purifycss-webpack-plugin) allows us to achieve results like this. It is preferable to use the `ExtractTextPlugin` with it. Install it first:

```bash
npm i purifycss-webpack-plugin --save-dev
```

We need one more bit: PurifyCSS configuration. Expand parts like this:

**webpack.parts.js**

```javascript
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
leanpub-start-insert
const PurifyCSSPlugin = require('purifycss-webpack-plugin');
leanpub-end-insert

...

leanpub-start-insert
exports.purifyCSS = function(paths) {
  paths = Array.isArray(paths) ? paths : [paths];

  return {
    plugins: [
      new PurifyCSSPlugin({
        // Our paths are absolute so Purify needs patching
        // against that to work.
        basePath: '/',

        // `paths` is used to point PurifyCSS to files not
        // visible to webpack. This expects glob patterns so
        // we adapt here.
        paths: paths.map(path => `${path}/*`),

        // Walk through only html files within node_modules. It
        // picks up .js files by default!
        resolveExtensions: ['.html'],
      }),
    ],
  };
};
leanpub-end-insert
```

Next, we have to connect this part to our configuration. It is important the plugin is used *after* the `ExtractTextPlugin`; otherwise it won't work:

**webpack.config.js**

```javascript
...

module.exports = function(env) {
  if (env === 'production') {
    return merge([
      common,
      parts.lintJavaScript({ paths: PATHS.app }),
      parts.extractCSS(),
leanpub-start-insert
      parts.purifyCSS(PATHS.app),
leanpub-end-insert
    ]);
  }

  ...
};
```

W> Note that the order matters! CSS extraction has to happen before purifying.

If you execute `npm run build` now, you should see something like this:

```bash
Hash: a2231eda28272b4c83d5
Version: webpack 2.2.0
Time: 1310ms
     Asset       Size  Chunks             Chunk Names
    app.js    4.25 kB       0  [emitted]  app
   app.css    2.17 kB       0  [emitted]  app
index.html  218 bytes          [emitted]
   [0] ./app/component.js 172 bytes {0} [built]
   [1] ./app/main.css 41 bytes {0} [built]
   [2] ./~/purecss/build/pure-min.css 41 bytes {0} [built]
...
```

The size of our style has decreased significantly. Instead of almost 16k we have roughly 2k now. The difference would be even bigger for heavier CSS frameworks.

T> PurifyCSS supports [additional options](https://github.com/purifycss/purifycss#the-optional-options-argument) including `minify`. You could for example enable additional logging by setting `purifyOptions: { info: true }` when instantiating the plugin.

W> Using PurifyCSS will lose CSS sourcemaps even if you have enabled them through loader specific configuration! This has to do with the way it works internally.

## Conclusion

The styling portion of our demo is in a good shape. We can make it better by including CSS linting to the project. We'll do that next.
