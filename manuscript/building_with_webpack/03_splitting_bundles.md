# Splitting Bundles

Currently the production version of our application is a single JavaScript file. This isn't ideal. If we change the application, the client has to download vendor dependencies as well. It would be better to download only the changed portion. If the vendor dependencies change, then the client should fetch only the vendor dependencies. The same goes for actual application code.

This technique is known as **bundle splitting**. We can push the vendor dependencies to a bundle of its own and benefit from client level caching. We can do this in a such way that the whole size of the application remains the same. Given there are more requests to perform, there's a slight overhead. But the benefit of caching makes up for this cost.

To give you a simple example, instead of having *app.js* (100 kB), we could end up with *app.js* (10 kB) and *vendor.js* (90 kB). Now changes made to the application are cheap for the clients that have already used the application earlier.

Caching comes with its own problems. One of those is cache invalidation. We'll discuss a potential approach related to that in the next chapter. But before that, let's split some bundles.

## Setting Up a `vendor` Bundle

So far our project has only a single entry named as `app`. As you might remember, our configuration tells Webpack to traverse dependencies starting from the `app` entry directory and then to output the resulting bundle below our `build` directory using the entry name and `.js` extension.

To improve the situation, we can define a `vendor` entry containing React. This is done by matching the dependency name. It is possible to generate this information automatically as discussed at the end of this chapter, but I'll go with a static array here to illustrate the basic idea. Change the code like this:

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

We have two separate entries, or **entry chunks**, now. The *Understanding Chunks* chapter digs into other available chunk types. Now we have a mapping between entries and the output configuration. `[name].js` will kick in based on the entry name and if you try to generate a build now (`npm run build`), you should see something like this:

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

*app.js* and *vendor.js* have separate chunk ids right now given they are entry chunks of their own. The output size is a little off, though. *app.js* should be significantly smaller to attain our goal with this build.

If you examine the resulting bundle, you can see that it contains React given that's how the default definition works. Webpack pulls the related dependencies to a bundle by default as illustrated by the image below:

![Separate app and vendor bundles](images/bundle_01.png)

A Webpack plugin known as `CommonsChunkPlugin` allows us alter this default behavior so that we can get the bundles we might expect.

## Setting Up `CommonsChunkPlugin`

[CommonsChunkPlugin](https://webpack.github.io/docs/list-of-plugins.html#commonschunkplugin) is a powerful and complex plugin. The use case we are covering here is a basic yet useful one. As before, we can define a function that wraps the basic idea.

To make our life easier in the future, we can make it extract a file known as a **manifest**. It contains the Webpack runtime that starts the whole application and contains the dependency information needed by it. This avoids a serious invalidation problem. Even though it's yet another file for the browser to load, it allows us to implement reliable caching in the next chapter.

If we don't extract a manifest, Webpack will generate the runtime to the vendor bundle. In case we modify the application code, the application bundle hash will change. Because that hash will change, so does the implementation of the runtime as it uses the hash to load the application bundle. Due to this the vendor bundle will receive a new hash too! This is why you should keep the manifest separate from the main bundles as doing this avoids the problem.

T> If you want to see this behavior in practice, try tweaking the implementation so that it **doesn't** generate the manifest after the next chapter. Change application code after that and see what happens to the generated code.

The following code combines the `entry` idea above with a basic `CommonsChunkPlugin` setup:

**libs/parts.js**

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
        names: [options.name, 'manifest']
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
      parts.setupCSS(PATHS.app)
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

Now our bundles look just the way we want. The image below illustrates the current situation:

![App and vendor bundles after applying `CommonsChunkPlugin`](images/bundle_02.png)

T> Beyond this, it is possible to define chunks that are loaded dynamically. This can be achieved through [require.ensure](https://webpack.github.io/docs/code-splitting.html). We'll cover it in the *Understanding Chunks* chapter.

## Loading `dependencies` to a `vendor` Bundle Automatically

If you maintain strict separation between `dependencies` and `devDependencies`, you can make Webpack to pick up your `vendor` dependencies automatically based on this information. You avoid having to manage those manually then. The basic idea goes like this:

```javascript
...

const pkg = require('./package.json');

...

const common = {
  entry: {
    app: PATHS.app,
    vendor: Object.keys(pkg.dependencies)
  },
  ...
}

...
```

You can still exclude certain dependencies from the `vendor` entry point if you want by adding a bit of code for that. You can for instance `filter` out the dependencies you don't want there.

## Conclusion

The situation is far better now. Note how small `app` bundle compared to the `vendor` bundle. In order to really benefit from this split, we should set up caching. This can be achieved by adding cache busting hashes to the filenames.
