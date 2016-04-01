# Separating CSS

Even though we have a nice build set up now, where did all the CSS go? As per our configuration, it has been inlined to JavaScript! Even though this can be convenient during development, it doesn't sound ideal. The current solution doesn't allow us to cache CSS. In some cases we might suffer from a flash of unstyled content (FOUC).

It just so happens that Webpack provides a means to generate a separate CSS bundle. We can achieve this using the [ExtractTextPlugin](https://www.npmjs.com/package/extract-text-webpack-plugin). It comes with overhead during the compilation phase, and it won't work with Hot Module Replacement (HMR) by design. Given we are using it only for production, that won't be a problem.

## Setting Up `extract-text-webpack-plugin`

It will take some configuration to make it work. Execute

```bash
npm i extract-text-webpack-plugin --save-dev
```

to get started. Next, we need to get rid of our current CSS related declaration at `common` configuration. After that, we need to split it up between `build` and `dev` configuration sections as follows:

**webpack.config.js**

```javascript
...
leanpub-start-insert
const ExtractTextPlugin = require('extract-text-webpack-plugin');
leanpub-end-insert

...

const common = {
  entry: {
    app: PATHS.app
  },
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Webpack demo'
    })
leanpub-start-insert
  ]
leanpub-end-insert
leanpub-start-delete
  ],
  module: {
    loaders: [
      {
        // Test expects a RegExp! Note the slashes!
        test: /\.css$/,
        loaders: ['style', 'css'],
        // Include accepts either a path or an array of paths.
        include: PATHS.app
      },
    ]
  }
leanpub-end-delete
};

if(TARGET === 'start' || !TARGET) {
  module.exports = merge(common, {
    devtool: 'eval-source-map',
    devServer: {
      ...
    },
leanpub-start-insert
    module: {
      loaders: [
        // Define development specific CSS setup
        {
          test: /\.css$/,
          loaders: ['style', 'css'],
          include: PATHS.app
        }
      ]
    },
leanpub-end-insert
    plugins: [
      ...
    ]
  });
}

if(TARGET === 'build') {
  module.exports = merge(common, {
    ...
    output: {
      ...
    },
leanpub-start-insert
    module: {
      loaders: [
        // Extract CSS during build
        {
          test: /\.css$/,
          loader: ExtractTextPlugin.extract('style', 'css'),
          include: PATHS.app
        }
      ]
    },
leanpub-end-insert
    plugins: [
leanpub-start-insert
      // Output extracted CSS to a file
      new ExtractTextPlugin('[name].[chunkhash].css'),
leanpub-end-insert
      ...
    ]
  });
}
```

Using this setup, we can still benefit from the HMR during development. For a production build, we generate a separate CSS, though. *html-webpack-plugin* will pick it up automatically and inject it into our `index.html`.

W> Definitions, such as `loaders: [ExtractTextPlugin.extract('style', 'css')]`, won't work and will cause the build to error instead! So when using `ExtractTextPlugin`, use the `loader` form instead.

W> If you want to pass more loaders to the `ExtractTextPlugin`, you should use `!` syntax. Example: `ExtractTextPlugin.extract('style', 'css!postcss')`.

After running `npm run build`, you should see output similar to the following:

```bash
clean-webpack-plugin: .../webpack-demo/build has been removed.
Hash: 5576106e9ebb9a1d8c1e
Version: webpack 1.12.14
Time: 5604ms
                           Asset       Size  Chunks             Chunk Names
     app.3bdd5f69f8374d244dff.js  277 bytes    0, 2  [emitted]  app
  vendor.81bcf80e75a5333783c4.js     131 kB    1, 2  [emitted]  vendor
manifest.795f5bf566d083d8a946.js  763 bytes       2  [emitted]  manifest
    app.3bdd5f69f8374d244dff.css   24 bytes    0, 2  [emitted]  app
                      index.html  347 bytes          [emitted]
   [0] ./app/index.js 186 bytes {0} [built]
   [0] multi vendor 28 bytes {1} [built]
 [157] ./app/component.js 136 bytes {0} [built]
    + 156 hidden modules
Child html-webpack-plugin for "index.html":
        + 3 hidden modules
Child extract-text-webpack-plugin:
        + 2 hidden modules
```

T> If you are getting `Module build failed: CssSyntaxError:` error, make sure your `common` configuration doesn't have a CSS related section set up!

Now our styling has been pushed to a separate CSS file. As a result, our JavaScript bundles have become slightly smaller. We also avoid the FOUC problem. The browser doesn't have to wait for JavaScript to load to get styling information. Instead, it can process CSS separately avoiding flash of unstyled content (FOUC).

The current setup is fairly nice. There's one problem, though. If you try to modify either `index.js` or `main.css`, the hash of both files (`app.js` and `app.css`) will change! This is because they belong to the same chunk. The problem can be avoided by separating chunks further.

T> If you have a complex project with a lot of dependencies, it is likely a good idea to use the `DedupePlugin`. It will find possible duplicate files and deduplicate them. Use `new webpack.optimize.DedupePlugin()` in your plugins definition to enable it.

## Separating Application Code and Styling

A logical way to solve our chunk issue is to push application code and styling to separate entry chunks. This breaks the dependency and fixes caching. To achieve this we need to decouple styling from it current chunk and define a custom chunk for it through configuration:

**app/index.js**

```javascript
require('react');
leanpub-start-delete
require('./main.css');
leanpub-end-delete

...
```

**webpack.config.js**

```javascript
...

const PATHS = {
  app: path.join(__dirname, 'app'),
leanpub-start-delete
  build: path.join(__dirname, 'build')
leanpub-end-delete
leanpub-start-insert
  build: path.join(__dirname, 'build'),
  style: path.join(__dirname, 'app/main.css')
leanpub-end-insert
};

...

const common = {
  entry: {
leanpub-start-delete
    app: PATHS.app
leanpub-end-delete
leanpub-start-insert
    app: PATHS.app,
    style: PATHS.style
leanpub-end-insert
  },
  ...
}

...
```

If you build the project now through `npm run build`, you should see something like this:

```bash
clean-webpack-plugin: .../webpack-demo/build has been removed.
Hash: a0699bad5573ea059c39
Version: webpack 1.12.14
Time: 5827ms
                           Asset       Size  Chunks             Chunk Names
     app.0cff8ece60ddfcada2ae.js  250 bytes    0, 3  [emitted]  app
   style.896457f18867289e6614.js   38 bytes    1, 3  [emitted]  style
  vendor.d9a332053af2a294217b.js     131 kB    2, 3  [emitted]  vendor
manifest.732260bc4c7f53c7812b.js  788 bytes       3  [emitted]  manifest
  style.896457f18867289e6614.css   24 bytes    1, 3  [emitted]  style
                      index.html  402 bytes          [emitted]
   [0] ./app/index.js 163 bytes {0} [built]
   [0] multi vendor 28 bytes {2} [built]
 [153] ./app/component.js 136 bytes {0} [built]
    + 156 hidden modules
Child html-webpack-plugin for "index.html":
        + 3 hidden modules
Child extract-text-webpack-plugin:
        + 2 hidden modules
```

After this step we have managed to separate styling from JavaScript. Changes made to it shouldn't affect JavaScript chunk hashes or vice versa. The approach comes with a small glitch, though. If you look closely, you can see a file named *style.896457f18867289e6614.js* in the output. Yours might be different. It is a file generated by Webpack and it looks like this:

```javascript
webpackJsonp([1,3],[function(n,c){}]);
```

Technically it's redundant. It would be safe to exclude the file through a check at *HtmlWebpackPlugin* template. But this solution is good enough for the project. Ideally Webpack shouldn't generate these files at all.

T> In the future we might be able to avoid this problem by using `[contenthash]` placeholder. It's generated based on file content (i.e., CSS in this case). Unfortunately it doesn't work as expected when the file is included in a chunk as in our original setup. This issue has been reported as [Webpack issue #672](https://github.com/webpack/webpack/issues/672).

## Conclusion

Build-wise our little project is starting to get there. We have managed to progress a lot. But progress doesn't matter if you don't understand what your bundles contain. In the next chapter I'll show you how to analyze Webpack build statistics.
