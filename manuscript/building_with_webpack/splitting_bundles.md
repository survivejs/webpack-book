# Splitting Bundles

The main advantage of splitting the application into two separate bundles is that it allows us to benefit from client level caching. We might, for instance, make most of our changes to the small `app` bundle. In this case, the client would have to fetch only the `app` bundle, assuming the `vendor` bundle has already been loaded.

Given each request comes with a slight overhead, this scheme won't load as fast initially as a single bundle. Caching more than makes up for that, though.

## Defining a `vendor` Entry Point

To make it easy to split the bundles, check out *package.json* and make sure only **react** is included in `dependencies`. We'll use this information for constructing our `vendor` bundle. Here's the basic setup:

**webpack.config.js**

```javascript
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const merge = require('webpack-merge');
const webpack = require('webpack');
const NpmInstallPlugin = require('npm-install-webpack-plugin');

leanpub-start-insert
// Load *package.json* so we can use `dependencies` from there
const pkg = require('./package.json');
leanpub-end-insert

const TARGET = process.env.npm_lifecycle_event;
const PATHS = {
  app: path.join(__dirname, 'app'),
  build: path.join(__dirname, 'build')
};

const common = {
  // Entry accepts a path or an object of entries.
  // We'll be using the latter form given it's
  // convenient with more complex configurations.
  entry: {
    app: PATHS.app
  },
  output: {
    path: PATHS.build,
leanpub-start-delete
    filename: 'bundle.js'
leanpub-end-delete
leanpub-start-insert
    // Output using the entry name
    filename: '[name].js'
leanpub-end-insert
  },
  ...
};

if(TARGET === 'build') {
  module.exports = merge(common, {
leanpub-start-insert
    // Define vendor entry point needed for splitting
    entry: {
      // Set up an entry chunk for our vendor bundle.
      // You can filter out dependencies here if needed with
      // `.filter(...)`.
      vendor: Object.keys(pkg.dependencies)
    },
leanpub-end-insert
    plugins: [
      ...
    ]
  });
}
```

The setup tells Webpack that we want a separate *entry chunk* for our project `vendor` level dependencies.

Beyond this, it's possible to define chunks that are loaded dynamically. This can be achieved through [require.ensure](https://webpack.github.io/docs/code-splitting.html). We'll cover it in the *Understanding Chunks* chapter.

If you execute the build now using `npm run build`, you should see something along this:

```bash
Hash: faafbe36cd3283ec761e
Version: webpack 1.12.14
Time: 7877ms
     Asset       Size  Chunks             Chunk Names
    app.js     135 kB       0  [emitted]  app
 vendor.js     131 kB       1  [emitted]  vendor
index.html  190 bytes          [emitted]
   [0] ./app/index.js 186 bytes {0} [built]
   [0] multi vendor 28 bytes {1} [built]
 [157] ./app/component.js 136 bytes {0} [built]
    + 156 hidden modules
Child html-webpack-plugin for "index.html":
        + 3 hidden modules
```

Now we have separate `app` and `vendor` bundles. There's something wrong, however. If you examine the files, you'll see that *app.js* contains *vendor* dependencies. We need to do something to tell Webpack to avoid this situation. This is where `CommonsChunkPlugin` comes in.

## Setting Up `CommonsChunkPlugin`

`CommonsChunkPlugin` allows us to extract the code we need for the `vendor` bundle. In addition, we will use it to extract a *manifest*. It is a file that tells Webpack how to map each module to each file. We will need this in the next step for setting up long term caching. Here's the setup:

**webpack.config.js**

```javascript
...

if(TARGET === 'build') {
  module.exports = merge(common, {
    // Define vendor entry point needed for splitting
    entry: {
      ...
    },
    plugins: [
leanpub-start-insert
      // Extract vendor and manifest files
      new webpack.optimize.CommonsChunkPlugin({
        names: ['vendor', 'manifest']
      }),
leanpub-end-insert
      ...
    ]
  });
}
```

If you run `npm run build` now, you should see output as below:

```bash
Hash: 5324e81665088f9c191f
Version: webpack 1.12.14
Time: 5712ms
      Asset       Size  Chunks             Chunk Names
     app.js    3.92 kB    0, 2  [emitted]  app
  vendor.js     131 kB    1, 2  [emitted]  vendor
manifest.js  743 bytes       2  [emitted]  manifest
 index.html  225 bytes          [emitted]
   [0] ./app/index.js 186 bytes {0} [built]
   [0] multi vendor 28 bytes {1} [built]
 [157] ./app/component.js 136 bytes {0} [built]
    + 156 hidden modules
Child html-webpack-plugin for "index.html":
        + 3 hidden modules
```

We have `app` and `vendor` bundles now. There's also something known as `manifest`. That's a file that maps `app` and `vendor` entry bundles to the resulting asset files. This tiny file is needed to make our caching setup work later on.

## Conclusion

The situation is far better now. Note how small `app` bundle compared to the `vendor` bundle. In order to really benefit from this split, we should set up caching. This can be achieved by adding cache busting hashes to filenames.
