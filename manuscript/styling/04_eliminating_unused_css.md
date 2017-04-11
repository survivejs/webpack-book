# Eliminating Unused CSS

Frameworks like [Bootstrap](https://getbootstrap.com/) tend to come with a lot of CSS. Often you use only a small part of it. Typically, you bundle even the unused CSS. It's possible, however, to eliminate the portions you aren't using.

[PurifyCSS](https://www.npmjs.com/package/purifycss) is a tool that can achieve this by analyzing files. It walks through your code and figures out which CSS classes are being used. Often there is enough information for it to strip unused CSS from your project. It also works with single page applications to an extent.

[uncss](https://www.npmjs.com/package/uncss) is a good alternative to PurifyCSS. It operates through PhantomJS and performs its work in a different manner. You can use uncss itself as a PostCSS plugin.

W> The approach does **not** work with CSS Modules and `ExtractTextPlugin` yet. See [issue 97](https://github.com/webpack-contrib/purifycss-webpack/issues/97) for more information.

## Setting Up Pure.css

To make the demo more realistic, let's install [Pure.css](http://purecss.io/), a small CSS framework, as well and refer to it from the project so that you can see PurifyCSS in action. These two projects aren't related in any way despite the naming.

```bash
npm install purecss --save
```

{pagebreak}

To make the project aware of Pure.css, `import` it:

**app/index.js**

```javascript
leanpub-start-insert
import 'purecss';
leanpub-end-insert
...
```

You should also make the demo component use a Pure.css class, so there is something to work with:

**app/component.js**

```javascript
module.exports = () => {
  const element = document.createElement('div');

leanpub-start-insert
  element.className = 'pure-button';
leanpub-end-insert
  element.innerHTML = 'Hello world';

  return element;
};
```

If you run the application (`npm start`), the "Hello world" should look like a button.

![Styled hello](images/styled-button.png)

{pagebreak}

Building the application (`npm run build`) should yield output:

```bash
Hash: e8601af01b5c5a5e722c
Version: webpack 2.2.1
Time: 1255ms
     Asset       Size  Chunks             Chunk Names
    app.js    4.15 kB       0  [emitted]  app
   app.css    16.5 kB       0  [emitted]  app
index.html  218 bytes          [emitted]
   [0] ./app/component.js 185 bytes {0} [built]
   [1] ./app/main.css 41 bytes {0} [built]
   [2] ./~/purecss/build/pure-min.css 41 bytes {0} [built]
...
```

As you can see, the size of the CSS file grew. This is something to fix with PurifyCSS.

## Enabling PurifyCSS

Using PurifyCSS can lead to significant savings. In the official example of the project, they purify and minify Bootstrap (140 kB) in an application using ~40% of its selectors to mere ~35 kB. That's a big difference.

[purifycss-webpack](https://www.npmjs.com/package/purifycss-webpack) allows to achieve similar results. You should use the `ExtractTextPlugin` with it for the best results. Install it and a [glob](https://www.npmjs.org/package/glob) helper first:

```bash
npm install glob purifycss-webpack --save-dev
```

{pagebreak}

You also need PurifyCSS configuration as below:

**webpack.parts.js**

```javascript
...
leanpub-start-insert
const PurifyCSSPlugin = require('purifycss-webpack');
leanpub-end-insert

...

leanpub-start-insert
exports.purifyCSS = ({ paths }) => ({
  plugins: [
    new PurifyCSSPlugin({ paths }),
  ],
});
leanpub-end-insert
```

Next, the part has to be connected with the configuration. It's important the plugin is used *after* the `ExtractTextPlugin`; otherwise it doesn't work:

**webpack.config.js**

```javascript
...
leanpub-start-insert
const glob = require('glob');
leanpub-end-insert

const parts = require('./webpack.parts');

...

const productionConfig = merge([
  ...
leanpub-start-insert
  parts.purifyCSS({
    paths: glob.sync(`${PATHS.app}/**/*`, { nodir: true }),
  }),
leanpub-end-insert
]);
```

W> The order matters. CSS extraction has to happen before purifying.

If you execute `npm run build` now, you should see something:

```bash
Hash: e8601af01b5c5a5e722c
Version: webpack 2.2.1
Time: 1363ms
     Asset       Size  Chunks             Chunk Names
    app.js    4.15 kB       0  [emitted]  app
   app.css    2.19 kB       0  [emitted]  app
index.html  218 bytes          [emitted]
   [0] ./app/component.js 185 bytes {0} [built]
   [1] ./app/main.css 41 bytes {0} [built]
   [2] ./~/purecss/build/pure-min.css 41 bytes {0} [built]
...
```

The size of the style has decreased noticeably. Instead of 16k, you have roughly 2k now. The difference would be even bigger for heavier CSS frameworks.

PurifyCSS supports [additional options](https://github.com/purifycss/purifycss#the-optional-options-argument) including `minify`. You can enable these through the `purifyOptions` field when instantiating the plugin. Given PurifyCSS cannot pick all of the classes you are using always, you should use `purifyOptions.whitelist` array to define selectors which it should leave in the result no matter what.

W> Using PurifyCSS loses CSS source maps even if you have enabled them through loader specific configuration due to the way it works underneath.

{pagebreak}

### Critical Path Rendering

The idea of [critical path rendering](https://developers.google.com/web/fundamentals/performance/critical-rendering-path/) takes a look at CSS performance from a different angle. Instead of optimizing for size, it optimizes for render order and puts emphasis on **above-the-fold** CSS.

[isomorphic-style-loader](https://www.npmjs.com/package/isomorphic-style-loader) achieves this using webpack and React. [critical-path-css-tools](https://github.com/addyosmani/critical-path-css-tools) listing by Addy Osmani lists other related tools.

## Conclusion

Using PurifyCSS can lead to a significant decrease in file size. It's particularly valuable for static sites that rely on a heavy CSS framework. The more dynamic a site or an application becomes, the harder it becomes to analyze reliably.

To recap:

* Eliminating unused CSS is possible using PurifyCSS. It performs static analysis against the source.
* The functionality can be enabled through *purifycss-webpack* and the plugin should be applied *after* `ExtractTextPlugin`.
* At best, PurifyCSS can eliminate most, if not all, unused CSS rules.
* Critical path rendering is another CSS technique that puts emphasis on rendering the above-the-fold CSS first. The idea is to render something as fast as possible instead of waiting for all CSS to load.

The styling portion of the demo is in good shape. It can be made easier to develop by including CSS linting to the project.
