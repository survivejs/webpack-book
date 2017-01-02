# Splitting Bundles

Currently the production version of our application is a single JavaScript file. This isn't ideal. If we change the application, the client has to download vendor dependencies as well. It would be better to download only the changed portion. If the vendor dependencies change, then the client should fetch only the vendor dependencies. The same goes for actual application code. This technique is known as **bundle splitting**.

## The Idea of Bundle Splitting

Using bundle splitting, we can push the vendor dependencies to a bundle of its own and benefit from client level caching. We can do this in a such way that the whole size of the application remains the same. Given there are more requests to perform, there's a slight overhead. But the benefit of caching makes up for this cost.

To give you a simple example, instead of having *app.js* (100 kB), we could end up with *app.js* (10 kB) and *vendor.js* (90 kB). Now changes made to the application are cheap for the clients that have already used the application earlier.

Caching comes with its own problems. One of those is cache invalidation. We'll discuss a potential approach related to that in the next part of this book.

Bundle splitting isn't the only way out. In the next chapter we will discuss a more granular technique known as *code splitting* that allows us to load code on demand.

## Adding Something to Split

Given there's not much to split into the vendor bundle yet, we should add something there. Add React to the project first:

```bash
npm i react --save
```

Then make the project depend on it:

**app/index.js**

```
leanpub-start-insert
import 'react';
leanpub-end-insert
import 'purecss';
import './main.css';
import component from './component';

...
```

Execute `npm run build` to get a baseline build. You should end up with something like this:

```bash
Hash: 02507cd84349e6a33ffd
Version: webpack 2.2.0-rc.2
Time: 1843ms
                                       Asset       Size  Chunks             Chunk Names
                                      app.js     140 kB       0  [emitted]  app
    app.788492b4b5beed29cef12fe793f316a0.css    2.22 kB       0  [emitted]  app
                                  app.js.map     165 kB       0  [emitted]  app
app.788492b4b5beed29cef12fe793f316a0.css.map  117 bytes       0  [emitted]  app
                                  index.html  251 bytes          [emitted]
   [3] ./~/react/lib/ReactElement.js 11.2 kB {0} [built]
   [5] ./~/object-assign/index.js 1.99 kB {0} [built]
   [9] ./~/react/lib/ReactComponent.js 4.61 kB {0} [built]
...
```

As you can see, *app.js* is quite big. This is exactly what we wanted. We have to do something about this next.

## Setting Up a `vendor` Bundle

So far our project has only a single entry named as `app`. As you might remember, our configuration tells webpack to traverse dependencies starting from the `app` entry directory and then to output the resulting bundle below our `build` directory using the entry name and `.js` extension.

To improve the situation, we can define a `vendor` entry containing React. This is done by matching the dependency name. It is possible to generate this information automatically as discussed at the end of this chapter, but I'll go with a static array here to illustrate the basic idea. Change the code like this:

```javascript
...

module.exports = function(env) {
  if (env === 'production') {
    return merge(
      common,
leanpub-start-insert
      {
        entry: {
          vendor: ['react']
        }
      },
leanpub-end-insert
      parts.generateSourcemaps('source-map'),
      parts.extractCSS(),
      parts.purifyCSS(PATHS.app)
    );
  }

  ...
};
```

We have two separate entries, or **entry chunks**, now. `[name].js` of our existing `output.path` configuration will kick in based on the entry name and if you try to generate a build now (`npm run build`), you should see something like this:

```bash
Hash: 3723651d04f393524f98
Version: webpack 2.2.0-rc.2
Time: 1880ms
                                       Asset       Size  Chunks             Chunk Names
                                      app.js     140 kB       0  [emitted]  app
                                   vendor.js     138 kB       1  [emitted]  vendor
    app.788492b4b5beed29cef12fe793f316a0.css    2.22 kB       0  [emitted]  app
                                  app.js.map     165 kB       0  [emitted]  app
app.788492b4b5beed29cef12fe793f316a0.css.map  117 bytes       0  [emitted]  app
                               vendor.js.map     164 kB       1  [emitted]  vendor
                                  index.html  307 bytes          [emitted]
   [3] ./~/react/lib/ReactElement.js 11.2 kB {0} {1} [built]
   [5] ./~/object-assign/index.js 1.99 kB {0} {1} [built]
```

*app.js* and *vendor.js* have separate chunk ids right now given they are entry chunks of their own. The output size is a little off, though. *app.js* should be significantly smaller to attain our goal with this build.

If you examine the resulting bundle, you can see that it contains React given that's how the default definition works. Webpack pulls the related dependencies to a bundle by default as illustrated by the image below:

![Separate app and vendor bundles](images/bundle_01.png)

A webpack plugin known as `CommonsChunkPlugin` allows us alter this default behavior so that we can get the bundles we might expect.

W> This step can fail on Windows due to letter casing. Instead of `c:\` you may need to force your terminal to read `C:\`. There's more information in the [related webpack issue](https://github.com/webpack/webpack/issues/2362).

W> Webpack doesn't allow referring to entry files within entries. If you inadvertently do this, webpack will complain loudly. If you end up in a case like this, consider refactoring the module structure of your code to eliminate the situation.

## Setting Up `CommonsChunkPlugin`

[CommonsChunkPlugin](https://webpack.js.org/guides/code-splitting-libraries/#commonschunkplugin) is a powerful and complex plugin. The use case we are covering here is a basic yet useful one. As before, we can define a function that wraps the basic idea.

The following code combines the `entry` idea above with a basic `CommonsChunkPlugin` setup. It has been designed so that it is possible to access advanced features of `CommonsChunkPlugin` while allowing you to define multiple splits through it.

**webpack.parts.js**

```javascript
...

leanpub-start-insert
exports.extractBundles = function(bundles, options) {
  const entry = {};
  const names = [];

  // Set up entries and names.
  bundles.forEach(({ name, entries }) => {
    if (entries) {
      entry[name] = entries;
    }

    names.push(name);
  });

  return {
    // Define an entry point needed for splitting.
    entry,
    plugins: [
      // Extract bundles.
      new webpack.optimize.CommonsChunkPlugin(
        Object.assign({}, options, { names })
      )
    ]
  };
};
leanpub-end-insert
```

Given the function handles the entry for us, we can drop our `vendor` related configuration and use the function instead:

**webpack.config.js**

```javascript
...

module.exports = function(env) {
  if (env === 'production') {
    return merge(
      common,
leanpub-start-delete
      {
        entry: {
          vendor: ['react']
        }
      },
leanpub-end-delete
leanpub-start-insert
      parts.extractBundles([
        {
          name: 'vendor',
          entries: ['react']
        }
      ]),
leanpub-end-insert
      parts.generateSourcemaps('source-map'),
      parts.extractCSS(),
      parts.purifyCSS(PATHS.app)
    );
  }

  ...
};
```

If you execute the build now using `npm run build`, you should see something along this:

```bash
Hash: 01df5abc2fa1a0d5152a
Version: webpack 2.2.0-rc.2
Time: 1781ms
                                       Asset       Size  Chunks             Chunk Names
                                      app.js    2.03 kB       0  [emitted]  app
                                   vendor.js     141 kB       1  [emitted]  vendor
    app.788492b4b5beed29cef12fe793f316a0.css    2.22 kB       0  [emitted]  app
                                  app.js.map    1.72 kB       0  [emitted]  app
app.788492b4b5beed29cef12fe793f316a0.css.map  117 bytes       0  [emitted]  app
                               vendor.js.map     167 kB       1  [emitted]  vendor
                                  index.html  307 bytes          [emitted]
   [3] ./~/react/lib/ReactElement.js 11.2 kB {1} [built]
   [5] ./~/object-assign/index.js 1.99 kB {1} [built]
   [7] ./~/react/react.js 56 bytes {1} [built]
...
```

Now our bundles look just the way we want. The image below illustrates the current situation:

![App and vendor bundles after applying `CommonsChunkPlugin`](images/bundle_02.png)

## Loading `dependencies` to a `vendor` Bundle Automatically

If you maintain strict separation between `dependencies` and `devDependencies`, you can make webpack pick up your `vendor` dependencies automatically based on this information. You avoid having to manage those manually then.

Instead of having `['react']`, we could have `Object.keys(require('./package.json').dependencies)`. That can be filtered and adjusted further if needed depending on how dynamic solution you want.

A better way to handle this is to use `CommonsChunkPlugin` and its `minChunks` parameter. In addition to a number and certain other values, it accepts a function. This makes it possible to deduce which modules are external without having to perform a lookup against *package.json*. To adapt Rafael De Leon's solution from [Stack Overflow](http://stackoverflow.com/a/38733864/228885), you could end up with code like this:

```javascript
new webpack.optimize.CommonsChunkPlugin({
  name: 'vendor',
  minChunks: (module, count) => {
    const userRequest = module.userRequest;

    // You can perform other similar checks here too.
    // Now we check just node_modules.
    return userRequest && userRequest.indexOf('node_modules') >= 0;
  }
}),
```

You can pass a custom `minChunks` field to `extractBundles` so that you have more control over the behavior. You can plug in a custom `isExternal` check for example. The advantage of this approach is that it will use **only** dependencies you refer to in your application.

Given `minChunks` receives `count` as its second parameter, you could force it to capture chunks based on usage. This is particularly useful in more complex setups where you have split your code multiple times and want more control over the result.

## Chunk Types in Webpack

In the example above, we used something known as **entry chunks**. As [discussed in the documentation](https://webpack.github.io/docs/code-splitting.html#chunk-types), internally webpack treats chunks in three types:

* **Entry chunks** - Entry chunks contain webpack runtime and modules it then loads. So far we've been dealing with these.
* **Normal chunks** - Normal chunks **don't** contain webpack runtime. Instead, these can be loaded dynamically while the application is running. A suitable wrapper (JSONP for example) is generated for these. We'll generate a normal chunk in the next chapter as we set up code splitting.
* **Initial chunks** - Initial chunks are normal chunks that count towards initial loading time of the application and are generated by the `CommonsChunkPlugin`. As a user you don't have to care about these. It's the split between entry chunks and normal chunks that's important.

## Conclusion

The situation is better now. Note how small `app` bundle compared to the `vendor` bundle. In order to really benefit from this split, we will set up caching in the next part. But before that, we can learn about a technique known as *code splitting* to go even more granular.
