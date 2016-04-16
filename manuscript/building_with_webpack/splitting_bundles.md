# Splitting Bundles

The main advantage of splitting the application into two separate bundles is that it allows us to benefit from client level caching. We might, for instance, make most of our changes to the small `app` bundle. In this case, the client would have to fetch only the `app` bundle, assuming the `vendor` bundle has already been loaded.

Given each request comes with a slight overhead, this scheme won't load as fast initially as a single bundle. Caching more than makes up for that, though.

## Setting Up a `vendor` Bundle

So far our project has only a single entry. This entry has been named as `app`. The basic configuration looks like this:

```javascript
const common = {
  entry: {
    app: PATHS.app
  },
  output: {
    path: PATHS.build,
    filename: '[name].js'
  },
  ...
}
```

The configuration tells Webpack to traverse dependencies starting from the `app` entry directory and then to output the resulting bundle below our `build` directory using the entry name and `.js` extension.

We could add a vendor entry point to the configuration like this:

```javascript
const common = {
  entry: {
    app: PATHS.app,
    vendor: ['react']
  },
  output: {
    path: PATHS.build,
    filename: '[name].js'
  },
  ...
}
```

Based on the logic above this would generate two bundles - `app.js` and `vendor.js` - below our `build` directory. Webpack will treat these two cases separately. Given the `app` entry points at React dependency, it will be included to the `app` bundle by default.

This problem can be overcome with additional configuration that tells Webpack to generate a bundle so that it contains only dependencies belonging to the passed entry. A plugin known as `CommonsChunkPlugin` allows us to achieve this.

## Setting Up `CommonsChunkPlugin`

[CommonsChunkPlugin](https://webpack.github.io/docs/list-of-plugins.html#commonschunkplugin) is powerful and complex plugin. The use case we are covering here is a basic yet useful one. As before, we can define a function that wraps the basic idea.

To make our life easier in the future, we can make it to extract a file known as **manifest**. It contains Webpack runtime that starts the whole application and contains the dependency information needed by it. Even though it's yet another file for the browser to load, it allows us to implement reliable caching in the next chapter.

The following code combines the `entry` idea above with basic `CommonsChunkPlugin` setup. To make sure only `entry` modules are included in the resulting bundle we need to set `minChunks`. It would work without, but it's a good idea to set it to avoid issues on larger codebases. Consider the code below:

**lib/parts.js**

```javascript
...

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
```

As you might remember from the earlier, it is a good idea to separate application and development level dependencies. That is something we can leverage here. Instead of having to type in each `vendor` dependency, we can perform a lookup against *package.json* and the connect those dependencies with our solution above:

**webpack.config.js**

```javascript
...

const parts = require('./lib/parts');

leanpub-start-insert
// Load *package.json* so we can use `dependencies` from there
const pkg = require('./package.json');
leanpub-end-insert

...

// Detect how npm is run and branch based on that
switch(process.env.npm_lifecycle_event) {
  case 'build':
    config = merge(
      common,
      parts.setFreeVariable(
        'process.env.NODE_ENV',
        'production'
      ),
leanpub-start-insert
      parts.extractBundle({
        name: 'vendor',
        entries: Object.keys(pkg.dependencies)
      }),
leanpub-end-insert
      parts.minify(),
      parts.setupCSS(PATHS.app)
    );
    break;
  default:
}

module.exports = validate(config);
```

If you execute the build now using `npm run build`, you should see something along this:

```bash
[webpack-validator] Config is valid.
Hash: e8e35ff9743bdaab9f55
Version: webpack 1.12.15
Time: 2797ms
      Asset       Size  Chunks             Chunk Names
     app.js    3.91 kB    0, 2  [emitted]  app
  vendor.js    20.7 kB    1, 2  [emitted]  vendor
manifest.js  743 bytes       2  [emitted]  manifest
 index.html  225 bytes          [emitted]
   [0] ./app/index.js 123 bytes {0} [built]
   [0] multi vendor 28 bytes {1} [built]
  [35] ./app/component.js 136 bytes {0} [built]
    + 34 hidden modules
Child html-webpack-plugin for "index.html":
        + 3 hidden modules
```

If you want, you can try the same without `CommonsChunkPlugin`. In that case React should end up in the `app` bundle. Here it goes directly to `vendor`. `manifest` ties that all together. Consider taking a look at the file contents to understand better how Webpack bootstraps the code.

Beyond this, it's possible to define chunks that are loaded dynamically. This can be achieved through [require.ensure](https://webpack.github.io/docs/code-splitting.html). We'll cover it in the *Understanding Chunks* chapter.

## Conclusion

The situation is far better now. Note how small `app` bundle compared to the `vendor` bundle. In order to really benefit from this split, we should set up caching. This can be achieved by adding cache busting hashes to filenames.
