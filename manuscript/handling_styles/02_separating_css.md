# Separating CSS

Even though we have a nice build set up now, where did all the CSS go? As per our configuration, it has been inlined to JavaScript! Even though this can be convenient during development, it doesn't sound ideal.

The current solution doesn't allow us to cache CSS. In some cases, we might suffer from a **Flash of Unstyled Content** (FOUC). FOUC happens because the browser will take a while to load JavaScript and the styles would be applied only then. Separating CSS to a file of its own avoids the problem by letting the browser to manage it separately.

Webpack provides a means to generate a separate CSS bundles using [ExtractTextPlugin](https://www.npmjs.com/package/extract-text-webpack-plugin). It comes with overhead during the compilation phase, and it won't work with Hot Module Replacement (HMR) by design. Given we are using it only for production, that won't be a problem.

T> This same technique can be used with other assets, like templates, too.

W> It can be potentially dangerous to use inline styles in production as it represents an attack vector. Favor `ExtractTextPlugin` and similar solutions in production usage. In limited contexts inlining a small amount of CSS can be a viable option to speed up the initial load (less requests).

## Setting Up *extract-text-webpack-plugin*

It will take some configuration to make it work. Install the plugin:

```bash
npm i extract-text-webpack-plugin@2.0.0-beta.4 --save-dev
```

*extract-text-webpack-plugin* includes a loader, `ExtractTextPlugin.extract` that marks the assets to be extracted. Then a plugin will perform its work based on this annotation. The idea looks like this:

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
            loader: 'css-loader',
          }),
        },
      ],
    },
    plugins: [
      // Output extracted CSS to a file
      new ExtractTextPlugin('[name].css'),
    ],
  };
};
leanpub-end-insert
```

That `[name]` placeholder will use the the name of the entry where the CSS is referred to. Placeholders and the overall idea are discussed in greater detail in the *Adding Hashes to Filenames* chapter.

It is important to note that if you wanted to extract CSS from a more involved format, like SASS, you would have to pass multiple loaders to the `loader` option. Both `loader` and `fallbackLoader` accept `[{ loader: 'css-loader', query: { ... } }]` (note `query` over `options`!) kind of syntax. They also accept an object (a single loader definition).

T> If you wanted to output the resulting file to a specific directory, you could do it like this: `new ExtractTextPlugin('styles/[name].css')`.

### Connecting with Configuration

Connect the function with our configuration as below:

**webpack.config.js**

```javascript
...

module.exports = function(env) {
leanpub-start-insert
  if (env === 'production') {
    return merge([
      common,
      parts.extractCSS(),
    ]);
  }
leanpub-end-insert

  ...
};
```

Using this setup, we can still benefit from the HMR during development. For a production build, we generate a separate CSS, though. *html-webpack-plugin* will pick it up automatically and inject it into our `index.html`.

After running `npm run build`, you should see output similar to the following:

```bash
Hash: fa85490b04f4c27b397c
Version: webpack 2.2.0-rc.3
Time: 748ms
     Asset       Size  Chunks             Chunk Names
    app.js    3.84 kB       0  [emitted]  app
   app.css   32 bytes       0  [emitted]  app
index.html  218 bytes          [emitted]
   [0] ./app/component.js 135 bytes {0} [built]
   [1] ./app/main.css 41 bytes {0} [built]
   [2] ./app/index.js 548 bytes {0} [built]
...
```

Now our styling has been pushed to a separate CSS file. Thus, our JavaScript bundle has become slightly smaller. We also avoid the FOUC problem. The browser doesn't have to wait for JavaScript to load to get styling information. Instead, it can process the CSS separately, avoiding the flash.

T> If you are getting `Module build failed: CssSyntaxError:` error, make sure your `common` configuration doesn't have a CSS-related section set up.

## Managing Styles Outside of JavaScript

Even though referring to styling through JavaScript and then bundling is a valid option, it is possible to achieve the same result through an `entry` and [globbinb](https://www.npmjs.com/package/glob). The basic idea goes like this:

```javascript
...
const glob = require('glob');

// Glob CSS files as an array of CSS files
const PATHS = {
  app: path.join(__dirname, 'app'),
  build: path.join(__dirname, 'build'),
  style: glob.sync('./app/**/*.css'),
};

...

const common = merge([
  {
    entry: {
      app: PATHS.app,
      style: ['purecss'].concat(PATHS.style),
    },
    ...
  },
  ...
]);
```

After this type of change, you would not have to refer to styling from your application code. It also means that CSS Modules won't work anymore. As a result, you should get both *style.css* and *style.js*. The latter file will contain roughly content like `webpackJsonp([1,3],[function(n,c){}]);` and it doesn't do anything useful. This is [a known limitation](https://github.com/webpack/webpack/issues/1967) in webpack.

The approach can be useful if you have to port a legacy project relying on CSS concatenation. If you want strict control over the ordering, you can set up a single CSS entry and then use `@import` to bring the rest to the project through it. Another option would be to set up a JavaScript entry and go through `import` to get the same effect.

## Conclusion

Our current setup separates styling from JavaScript neatly. There is more we can do with CSS, though. Often big CSS frameworks come with plenty of CSS rules, and a lot of those end up being unused. In the next chapter, I will show you how to eliminate these rules from your build.
