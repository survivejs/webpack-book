# Splitting Bundles

Currently the production version of our application is a single JavaScript file. This isn't ideal. If we change the application, the client has to download vendor dependencies as well. It would be better to download only the changed portion. If the vendor dependencies change, then the client should fetch only the vendor dependencies. The same goes for actual application code. This technique is known as **bundle splitting**.

## The Idea of Bundle Splitting

Using bundle splitting, we can push the vendor dependencies to a bundle of its own and benefit from client level caching. We can do this in a such way that the whole size of the application remains the same. Given there are more requests to perform, there's a slight overhead. But the benefit of caching makes up for this cost.

To give you a simple example, instead of having *app.js* (100 kB), we could end up with *app.js* (10 kB) and *vendor.js* (90 kB). Now changes made to the application are cheap for the clients that have already used the application earlier.

Caching comes with its own problems. One of those is cache invalidation. We'll discuss a potential approach related to that in the next chapter. But before that, let's split some bundles.

Bundle splitting isn't the only way out. In the *Understanding Chunks* chapter we will discuss a technique known as **code splitting** that exists within bundle splitting and allows you to go more granular. Effectively it allows you to load code on demand based on prerequisites related to the user interface.

## Setting Up a `vendor` Bundle

So far our project has only a single entry named as `app`. As you might remember, our configuration tells webpack to traverse dependencies starting from the `app` entry directory and then to output the resulting bundle below our `build` directory using the entry name and `.js` extension.

To improve the situation, we can define a `vendor` entry containing React. This is done by matching the dependency name. It is possible to generate this information automatically as discussed at the end of this chapter, but I'll go with a static array here to illustrate the basic idea. Change the code like this:

```javascript
...

const common = {
  entry: {
leanpub-start-delete
    app: PATHS.app
leanpub-end-delete
leanpub-start-insert
    app: PATHS.app,
    vendor: ['react']
leanpub-end-insert
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
Hash: 429e76650de02eccd6f9
Version: webpack 2.2.0-rc.1
Time: 1455ms
     Asset       Size  Chunks           Chunk Names
    app.js    24.1 kB  0[emitted]  app
 vendor.js    20.1 kB  1[emitted]  vendor
index.html  236 bytes  [emitted]
  [27] ./app/component.js 136 bytes {0} [built]
  [28] ./app/main.css 904 bytes {0} [built]
  [29] ./~/css-loader!./app/main.css 190 bytes {0} [built]
  [32] ./app/index.js 124 bytes {0} [built]
  [33] multi vendor 28 bytes {1} [built]
    + 29 hidden modules
Child html-webpack-plugin for "index.html":
        + 4 hidden modules
```

*app.js* and *vendor.js* have separate chunk ids right now given they are entry chunks of their own. The output size is a little off, though. *app.js* should be significantly smaller to attain our goal with this build.

If you examine the resulting bundle, you can see that it contains React given that's how the default definition works. Webpack pulls the related dependencies to a bundle by default as illustrated by the image below:

![Separate app and vendor bundles](images/bundle_01.png)

A webpack plugin known as `CommonsChunkPlugin` allows us alter this default behavior so that we can get the bundles we might expect.

W> This step can fail on Windows due to letter casing. Instead of `c:\` you may need to force your terminal to read `C:\`. There's more information in the [related webpack issue](https://github.com/webpack/webpack/issues/2362).

## Setting Up `CommonsChunkPlugin`

[CommonsChunkPlugin](https://webpack.js.org/guides/code-splitting-libraries/#commonschunkplugin) is a powerful and complex plugin. The use case we are covering here is a basic yet useful one. As before, we can define a function that wraps the basic idea.

To make our life easier in the future, we can make it extract a file known as a **manifest**. It contains the webpack runtime that starts the whole application and contains the dependency information needed by it. This avoids a serious invalidation problem. Even though it's yet another file for the browser to load, it allows us to implement reliable caching in the next chapter.

If we don't extract a manifest, webpack will generate the runtime to the vendor bundle. In case we modify the application code, the application bundle hash will change. This is problematic as it will invalidate both bundles since the runtime needs to change too. This is why you should keep the manifest separate from the main bundles as doing this avoids the problem.

T> If you want to see this behavior in practice, try tweaking the implementation so that it **doesn't** generate the manifest after the next chapter. Change application code after that and see what happens to the generated code.

The following code combines the `entry` idea above with a basic `CommonsChunkPlugin` setup:

**webpack.parts.js**

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
  entry: {
leanpub-start-delete
    app: PATHS.app,
    vendor: ['react']
leanpub-end-delete
leanpub-start-insert
    app: PATHS.app
leanpub-end-insert
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

module.exports = function(env) {
  if (env === 'production') {
    return merge(
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
  }

  ...
};
```

If you execute the build now using `npm run build`, you should see something along this:

```bash
Hash: db8515bb8c604c66b5b7
Version: webpack 2.2.0-rc.1
Time: 1225ms
      Asset       Size  Chunks           Chunk Names
  vendor.js    19.7 kB  0, 2[emitted]  vendor
     app.js    4.06 kB  1, 2[emitted]  app
manifest.js    1.37 kB  2[emitted]  manifest
 index.html  294 bytes  [emitted]
  [15] ./app/component.js 136 bytes {1} [built]
  [16] ./app/main.css 904 bytes {1} [built]
  [17] ./~/css-loader!./app/main.css 190 bytes {1} [built]
  [32] ./app/index.js 124 bytes {1} [built]
  [33] multi vendor 28 bytes {0} [built]
    + 29 hidden modules
Child html-webpack-plugin for "index.html":
        + 4 hidden modules
```

Now our bundles look just the way we want. The image below illustrates the current situation:

![App and vendor bundles after applying `CommonsChunkPlugin`](images/bundle_02.png)

T> Beyond this, it is possible to define chunks that are loaded dynamically. This can be achieved through [require.ensure or import](https://webpack.js.org/guides/code-splitting-require/). We'll cover it in the *Understanding Chunks* chapter.

## Loading `dependencies` to a `vendor` Bundle Automatically

If you maintain strict separation between `dependencies` and `devDependencies`, you can make webpack pick up your `vendor` dependencies automatically based on this information. You avoid having to manage those manually then.

Instead of having `['react']`, we could have `Object.keys(require('./package.json').dependencies)`. That can be filtered and adjusted further if needed depending on how dynamic solution you want.

`CommonsChunkPlugin` provides a `minChunks` parameter. In addition to a number and certain other values, it accepts a function. This makes it possible to deduce which modules are external without having to perform a lookup against *package.json*. To adapt Rafael De Leon's solution from [Stack Overflow](http://stackoverflow.com/a/38733864/228885), you could end up with code like this:

```javascript
new CommonsChunkPlugin({
  name: 'vendor',
  minChunks: function(module, count) {
    const userRequest = module.userRequest;

    if (typeof userRequest !== 'string') {
      return false;
    }

    // You can perform other similar checks here too.
    // Now we check just node_modules.
    return userRequest.indexOf('node_modules') >= 0;
  }
}),
```

It would be easy to extend `extractBundle` so that you have more control over `minChunks` behavior. Then you could plug in `isExternal` check for `minChunks`. The advantage of this approach is that it will use **only** dependencies you refer to in your application.

Given `minChunks` receives `count` as its second parameter, you could force it to capture chunks based on usage. This is particularly useful in more complex setups where you have split your code multiple times and want more control over the result.

T> `webpack.ProgressPlugin` or [nyan-progress-webpack-plugin](https://www.npmjs.com/package/nyan-progress-webpack-plugin) can be used to get tidier output during the build process. Take care with Continuous Integration (CI) systems like Travis, though, as they might clobber the output.

## Tidying Up Development Console

You might notice that if you run the development server now, it prints out `[WDS] Hot Module Replacement enabled.` twice at the browser console. This happens because *webpack-dev-server* hooks up HMR per entry. One way to solve this is to perform `extractBundle` for the development configuration as well.

This can be achieved by pushing the current `extractBundle` code to `common` and merging it there to the rest so that you get `const common = merge({ ... }, extractBundle(...))`. If you do this, remember to remove `extractBundle` from the production specific branch of your configuration.

## Conclusion

The situation is far better now. Note how small `app` bundle compared to the `vendor` bundle. In order to really benefit from this split, we should set up caching. This can be achieved by adding cache busting hashes to the filenames.
