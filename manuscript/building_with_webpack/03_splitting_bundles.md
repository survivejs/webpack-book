# Splitting Bundles

The main advantage of splitting the application into two separate bundles is that it allows us to benefit from client level caching. We might, for instance, make most of our changes to the small `app` bundle. In this case, the client would have to fetch only the `app` bundle, assuming the `vendor` bundle has already been loaded.

Given each request comes with a slight overhead, this scheme won't load as fast initially as a single bundle. Caching more than makes up for that, though.

## Setting Up a `vendor` Bundle

So far our project has only a single entry named as `app`. As you might remember, our configuration tells Webpack to traverse dependencies starting from the `app` entry directory and then to output the resulting bundle below our `build` directory using the entry name and `.js` extension.

To improve the situation, we could define a `vendor` entry containing React. Change the code like this:

```javascript
...

const common = {
  // Entry accepts a path or an object of entries.
  // We'll be using the latter form given it's
  // convenient with more complex configurations.
  entry: {
leanpub-start-insert
    app: PATHS.app,
    vendor: ['react']
leanpub-end-insert
leanpub-start-delete
    app: PATHS.app
leanpub-end-delete
  },
  output: {
    path: PATHS.build,
    filename: '[name].js'
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Webpack demo'
    })
  ]
};

...
```

If you try to generate a build now (`npm run build`), you should see something like this:

```bash
[webpack-validator] Config is valid.
Hash: 6b55239dc87e2ae8efd6
Version: webpack 1.13.0
Time: 4168ms
        Asset       Size  Chunks             Chunk Names
       app.js    25.4 kB       0  [emitted]  app
    vendor.js    21.6 kB       1  [emitted]  vendor
   app.js.map     307 kB       0  [emitted]  app
vendor.js.map     277 kB       1  [emitted]  vendor
   index.html  190 bytes          [emitted]
   [0] ./app/index.js 123 bytes {0} [built]
   [0] multi vendor 28 bytes {1} [built]
  [36] ./app/component.js 136 bytes {0} [built]
    + 35 hidden modules
Child html-webpack-plugin for "index.html":
        + 3 hidden modules
```

This might not be what you expected. The problem is that our `app` bundle contains data it shouldn't. React has been bundled with it given how entry chunks work by definition. Fortunately there's a way to get around this by using the `CommonsChunkPlugin`.

T> It can be convenient to define a `vendor` entry based on *package.json* `dependencies`. Load the file first using `const pkg = require('./package.json');` and then do `vendor: Object.keys(pkg.dependencies)`.

## Setting Up `CommonsChunkPlugin`

[CommonsChunkPlugin](https://webpack.github.io/docs/list-of-plugins.html#commonschunkplugin) is a powerful and complex plugin. The use case we are covering here is a basic yet useful one. As before, we can define a function that wraps the basic idea.

To make our life easier in the future, we can make it to extract a file known as **manifest**. It contains Webpack runtime that starts the whole application and contains the dependency information needed by it. Even though it's yet another file for the browser to load, it allows us to implement reliable caching in the next chapter.

The following code combines the `entry` idea above with basic `CommonsChunkPlugin` setup. To make sure only `entry` modules are included in the resulting bundle we need to set `minChunks`. It would work without it, but it's a good idea to set it to avoid issues on larger codebases. Set up a function like this:

**lib/parts.js**

```javascript
...

leanpub-start-insert
exports.extractBundle = function(options) {
  const entry = {};
  entry[options.name] = options.entries;

  return {
    // Define an entry point needed for splitting.
    entry: entry,
    plugins: [
      // Extract bundle and manifest files. Manifest is
      // needed for reliable caching.
      new webpack.optimize.CommonsChunkPlugin({
        names: [options.name, 'manifest'],

        // options.name modules only
        minChunks: Infinity
      })
    ]
  };
}
leanpub-end-insert
```

Given the function handles the entry for us, we can drop our `vendor` related configuration and use the function instead:

**webpack.config.js**

```javascript
...

const common = {
  // Entry accepts a path or an object of entries.
  // We'll be using the latter form given it's
  // convenient with more complex configurations.
  entry: {
leanpub-start-insert
    app: PATHS.app
leanpub-end-insert
leanpub-start-delete
    app: PATHS.app,
    vendor: ['react']
leanpub-end-delete
  },
  output: {
    path: PATHS.build,
    filename: '[name].js'
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Webpack demo'
    })
  ]
};

...

// Detect how npm is run and branch based on that
switch(process.env.npm_lifecycle_event) {
  case 'build':
    config = merge(
      common,
      {
        devtool: 'source-map'
      },
      parts.setFreeVariable(
        'process.env.NODE_ENV',
        'production'
      ),
leanpub-start-insert
      parts.extractBundle({
        name: 'vendor',
        entries: ['react']
      }),
leanpub-end-insert
      parts.minify(),
      parts.setupCSS(PATHS.style)
    );
    break;
  default:
    ...
}

module.exports = validate(config);
```

If you execute the build now using `npm run build`, you should see something along this:

```bash
[webpack-validator] Config is valid.
Hash: 516a574ca6ee19e87209
Version: webpack 1.13.0
Time: 2568ms
          Asset       Size  Chunks             Chunk Names
         app.js    3.94 kB    0, 2  [emitted]  app
      vendor.js    21.4 kB    1, 2  [emitted]  vendor
    manifest.js  780 bytes       2  [emitted]  manifest
     app.js.map    30.7 kB    0, 2  [emitted]  app
  vendor.js.map     274 kB    1, 2  [emitted]  vendor
manifest.js.map    8.72 kB       2  [emitted]  manifest
     index.html  225 bytes          [emitted]
   [0] ./app/index.js 123 bytes {0} [built]
   [0] multi vendor 28 bytes {1} [built]
  [36] ./app/component.js 136 bytes {0} [built]
    + 35 hidden modules
Child html-webpack-plugin for "index.html":
        + 3 hidden modules
```

Now our bundles look just the way we want. Beyond this, it is possible to define chunks that are loaded dynamically. This can be achieved through [require.ensure](https://webpack.github.io/docs/code-splitting.html). We'll cover it in the *Understanding Chunks* chapter.

## Conclusion

The situation is far better now. Note how small `app` bundle compared to the `vendor` bundle. In order to really benefit from this split, we should set up caching. This can be achieved by adding cache busting hashes to the filenames.
