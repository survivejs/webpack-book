# Separating CSS

Even though we have a nice build set up now, where did all the CSS go? As per our configuration, it has been inlined to JavaScript! Even though this can be convenient during development, it doesn't sound ideal.

The current solution doesn't allow us to cache CSS. In some cases, we might suffer from a **Flash of Unstyled Content** (FOUC). FOUC happens because the browser will take a while to load JavaScript and the styles would be applied only then. Separating CSS to a file of its own avoids the problem by letting the browser to manage it separately.

Webpack provides a means to generate a separate CSS bundles using [ExtractTextPlugin](https://www.npmjs.com/package/extract-text-webpack-plugin). It is able to aggregate multiple CSS files into one. For this reason it comes with a loader that handles the extraction process. The plugin then picks up the result aggregated by the loader and emits a separate file.

Due to this process, ExtractTextPlugin comes with overhead during the compilation phase. It won't work with Hot Module Replacement (HMR) by design. Given we are using it only for production, that won't be a problem.

T> This same technique can be used with other assets, like templates, too.

W> It can be potentially dangerous to use inline styles in production as it represents an attack vector. Favor `ExtractTextPlugin` and similar solutions in production usage. In limited contexts inlining a small amount of CSS can be a viable option to speed up the initial load (less requests).

## Setting Up `ExtractTextPlugin`

It will take some configuration to make it work. Install the plugin:

```bash
npm i extract-text-webpack-plugin@beta --save-dev
```

`ExtractTextPlugin` includes a loader, `ExtractTextPlugin.extract` that marks the assets to be extracted. Then a plugin will perform its work based on this annotation.

`ExtractTextPlugin.extract` accepts `use` and `fallback` definitions. `ExtractTextPlugin` processes content through `use` only from **initial chunks** by default and it uses `fallback` for the rest. This means it won't touch any split bundles unless `allChunks: true` is set true. The *Splitting Bundles* chapter digs into greater detail.

It is important to note that if you wanted to extract CSS from a more involved format, like Sass, you would have to pass multiple loaders to the `use` option. Both `use` and `fallback` accept a loader (string), a loader definition, or an array of loader definitions.

The idea looks like this:

**webpack.parts.js**

```javascript
const webpack = require('webpack');
leanpub-start-insert
const ExtractTextPlugin = require('extract-text-webpack-plugin');
leanpub-end-insert

...

leanpub-start-insert
exports.extractCSS = function({ include, exclude, use }) {
  return {
    module: {
      rules: [
        {
          test: /\.css$/,
          include: include,
          exclude: exclude,

          use: ExtractTextPlugin.extract({
            use: use,
            fallback: 'style-loader',
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

That `[name]` placeholder will use the name of the entry where the CSS is referred to. Placeholders and the overall idea are discussed in greater detail at the *Adding Hashes to Filenames* chapter.

T> If you wanted to output the resulting file to a specific directory, you could do it like this: `new ExtractTextPlugin('styles/[name].css')`.

### Connecting with Configuration

Connect the function with our configuration as below:

**webpack.config.js**

```javascript
...

const common = merge([
  {
    ...
  },
leanpub-start-delete
  parts.loadCSS(),
leanpub-end-delete
]);

module.exports = function(env) {
  if (env === 'production') {
    return merge([
      common,
      parts.lintJavaScript({ include: PATHS.app }),
leanpub-start-insert
      parts.extractCSS({ use: 'css-loader' }),
leanpub-end-insert
    ]);
  }

  return merge([
    common,
    ...
leanpub-start-insert
    parts.loadCSS(),
leanpub-end-insert
  ]);
};
```

Using this setup, we can still benefit from the HMR during development. For a production build, we generate a separate CSS, though. *html-webpack-plugin* will pick it up automatically and inject it into our `index.html`.

After running `npm run build`, you should see output similar to the following:

```bash
Hash: 959bdc724d7005fba1c9
Version: webpack 2.2.1
Time: 956ms
     Asset       Size  Chunks             Chunk Names
    app.js    3.77 kB       0  [emitted]  app
   app.css   33 bytes       0  [emitted]  app
index.html  218 bytes          [emitted]
   [0] ./app/component.js 137 bytes {0} [built]
   [1] ./app/main.css 41 bytes {0} [built]
   [2] ./app/index.js 430 bytes {0} [built]
...
```

Now our styling has been pushed to a separate CSS file. Thus, our JavaScript bundle has become slightly smaller. We also avoid the FOUC problem. The browser doesn't have to wait for JavaScript to load to get styling information. Instead, it can process the CSS separately, avoiding the flash.

T> If you are getting `Module build failed: CssSyntaxError:` or `Module build failed: Unknown word` error, make sure your `common` configuration doesn't have a CSS-related section set up.

## Autoprefixing Output

It can be difficult to remember which vendor prefixes you have to use for specific CSS rules to support a large variety of users. This is where a technique known as **autoprefixing** comes in. It can be enabled through PostCSS and the [autoprefixer](https://www.npmjs.com/package/autoprefixer) plugin. *autoprefixer* uses [Can I Use](http://caniuse.com/) service to figure out which rules should be prefixed and its behavior can be tuned further.

Achieving autoprefixing takes a small addition to the current setup. Install *postcss-loader* and *autoprefixer* first:

```bash
npm i postcss-loader autoprefixer --save-dev
```

Add a fragment enabling autoprefixing like this:

**webpack.parts.js**

```javascript
...

exports.autoprefix = function() {
  return {
    loader: 'postcss-loader',
    options: {
      plugins: function () {
        return [
          require('autoprefixer'),
        ];
      },
    },
  };
};
```

To connect the loader with `ExtractTextPlugin`, hook it up as follows:

**webpack.config.js**

```javascript
...

module.exports = function(env) {
  if (env === 'production') {
    return merge([
      ...
leanpub-start-delete
      parts.extractCSS({ use: 'css-loader' }),
leanpub-end-delete
leanpub-start-insert
      parts.extractCSS({
        use: ['css-loader', parts.autoprefix()],
      }),
leanpub-end-insert
    ]);
  }

  ...
};
```

To confirm that the setup works, we should have something to autoprefix. Adjust the CSS like this:

**app/main.css**

```css
body {
  background: cornsilk;
leanpub-start-insert
  display: flex;
leanpub-end-insert
}
```

If you build the application now (`npm run build`) and examine the built CSS, you should be able to find a declaration like this there:

```css
body {
  background: cornsilk;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
}
```

As you can see, autoprefixing expands the rules so we don't have to remember to do that.

If you know what browsers you support, it is possible to set up a [browserslist](https://www.npmjs.com/package/browserslist) file. Different tools pick up this definition, *autoprefixer* included. Consider the example below where we select only specific browsers:

**browserslist**

```
> 1% # Browser usage over 1%
Last 2 versions # Last two versions too
IE 8 # And IE 8
```

## Managing Styles Outside of JavaScript

Even though referring to styling through JavaScript and then bundling is a valid option, it is possible to achieve the same result through an `entry` and [globbing](https://www.npmjs.com/package/glob). The basic idea goes like this:

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
      style: PATHS.style,
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
