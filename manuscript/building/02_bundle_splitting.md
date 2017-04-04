# Bundle Splitting

Currently, the production version of the application is a single JavaScript file. If the application is changed, the client must download vendor dependencies as well.

It would be better to download only the changed portion. If the vendor dependencies change, then the client should fetch only the vendor dependencies. The same goes for actual application code. **Bundle splitting** can be achieved using `CommonsChunkPlugin`.

T> To invalidate the bundles properly, you have to attach hashes to the generated bundles as discussed in the *Adding Hashes to Filenames* chapter.

## The Idea of Bundle Splitting

With bundle splitting, you can push the vendor dependencies to a bundle of their own and benefit from client level caching. This can be done in such a way that the whole size of the application remains the same. Given there are more requests to perform, there's a slight overhead. But the benefit of caching makes up for this cost.

To give you a quick example, instead of having *app.js* (100 kB), you could end up with *app.js* (10 kB) and *vendor.js* (90 kB). Now changes made to the application are cheap for the clients that have already used the application earlier.

Caching comes with its problems. One of those is cache invalidation. A potential approach related to that is discussed in the *Adding Hashes to Filenames* chapter.

Bundle splitting isn't the only way out. The *Code Splitting* chapter discusses another, more granular way.

## Adding Something to Split

Given there's not much to split into the vendor bundle yet, you should add something there. Add React to the project first:

```bash
npm install react --save
```

Then make the project depend on it:

**app/index.js**

```
leanpub-start-insert
import 'react';
leanpub-end-insert
...
```

Execute `npm run build` to get a baseline build. You should end up with something as below:

```bash
Hash: 2db5a05e02ac73897fd4
Version: webpack 2.2.1
Time: 2864ms
        Asset       Size  Chunks                    Chunk Names
     logo.png      77 kB          [emitted]
  ...font.eot     166 kB          [emitted]
...font.woff2    77.2 kB          [emitted]
 ...font.woff      98 kB          [emitted]
  ...font.svg     444 kB          [emitted]  [big]
  ...font.ttf     166 kB          [emitted]
leanpub-start-insert
       app.js     140 kB       0  [emitted]         app
leanpub-end-insert
      app.css    3.89 kB       0  [emitted]         app
   app.js.map     165 kB       0  [emitted]         app
  app.css.map   84 bytes       0  [emitted]         app
   index.html  218 bytes          [emitted]
   [0] ./~/process/browser.js 5.3 kB {0} [built]
   [3] ./~/react/lib/ReactElement.js 11.2 kB {0} [built]
  [18] ./app/component.js 272 bytes {0} [built]
...
```

As you can see, *app.js* is big. That is something to fix next.

## Setting Up a `vendor` Bundle

So far, the project has only a single entry named as `app`. The configuration tells webpack to traverse dependencies starting from the `app` entry directory and then to output the resulting bundle below the `build` directory using the entry name and `.js` extension.

To improve the situation, you can define a `vendor` entry containing React by matching the dependency name. It's possible to generate this information automatically as discussed at the end of this chapter, but a static array is enough to illustrate the basic idea. Change the code:

**webpack.config.js**

```javascript
const commonConfig = merge([
leanpub-start-insert
  {
    entry: {
      vendor: ['react'],
    },
  },
leanpub-end-insert
  ...
]);
```

{pagebreak}

You have two separate entries, or **entry chunks**, now. `[name].js` of the existing `output.path` the configuration kicks in based on the entry name. If you try to generate a build now (`npm run build`), you should see something along this:

```bash
Hash: ebf1b976090ff95e4fcd
Version: webpack 2.2.1
Time: 2814ms
        Asset       Size  Chunks                    Chunk Names
leanpub-start-insert
       app.js     140 kB       0  [emitted]         app
leanpub-end-insert
  ...font.eot     166 kB          [emitted]
...font.woff2    77.2 kB          [emitted]
 ...font.woff      98 kB          [emitted]
  ...font.svg     444 kB          [emitted]  [big]
     logo.png      77 kB          [emitted]
  ...font.ttf     166 kB          [emitted]
leanpub-start-insert
    vendor.js     138 kB       1  [emitted]         vendor
leanpub-end-insert
      app.css    3.89 kB       0  [emitted]         app
   app.js.map     165 kB       0  [emitted]         app
  app.css.map   84 bytes       0  [emitted]         app
vendor.js.map     164 kB       1  [emitted]         vendor
   index.html  274 bytes          [emitted]
   [3] ./~/react/lib/ReactElement.js 11.2 kB {0} {1} [built]
  [18] ./~/react/react.js 56 bytes {0} {1} [built]
  [21] ./~/react/lib/React.js 2.69 kB {0} {1} [built]
...
```

*app.js* and *vendor.js* have separate chunk IDs right now given they are entry chunks of their own. The output size is off, though. Intuitively *app.js* should be smaller to attain the goal with this build.

{pagebreak}

If you examine the resulting bundle, you can see that it contains React given that's how the default definition works. Webpack pulls the related dependencies to a bundle by default as illustrated by the image below:

![Separate app and vendor bundles](images/bundle_01.png)

`CommonsChunkPlugin` is a webpack plugin that allows to alter this default behavior.

W> This step can fail on Windows due to letter casing. Instead of `c:\` you have to force your terminal to read `C:\`. There's more information in the [related webpack issue](https://github.com/webpack/webpack/issues/2362).

W> Webpack doesn't allow referring to entry files within entries. If you inadvertently do this, webpack complains loudly. Consider refactoring the module structure of your code to eliminate the situation.

{pagebreak}

## Setting Up `CommonsChunkPlugin`

[CommonsChunkPlugin](https://webpack.js.org/guides/code-splitting-libraries/#commonschunkplugin) is a powerful and complex plugin. In this case, the target is clear. You have to tell it to extract vendor related code to a bundle of its own. Before abstraction, implement it:

**webpack.config.js**

```javascript
leanpub-start-insert
const webpack = require('webpack');
leanpub-end-insert

...

const commonConfig = merge([
  {
    entry: {
      vendor: ['react'],
    },
leanpub-start-insert
    plugins: [
      new webpack.optimize.CommonsChunkPlugin({
        name: 'vendor',
      }),
    ],
leanpub-end-insert
  },
  ...
]);
```

The configuration tells the plugin to extract React to a bundle named `vendor`.

{pagebreak}

If you execute the build now using `npm run build`, you should see something along this:

```bash
Hash: af634c8857c0ffb5c5e0
Version: webpack 2.2.1
Time: 2790ms
        Asset       Size  Chunks                    Chunk Names
leanpub-start-insert
       app.js    2.15 kB       0  [emitted]         app
leanpub-end-insert
  ...font.eot     166 kB          [emitted]
...font.woff2    77.2 kB          [emitted]
 ...font.woff      98 kB          [emitted]
  ...font.svg     444 kB          [emitted]  [big]
     logo.png      77 kB          [emitted]
  ...font.ttf     166 kB          [emitted]
leanpub-start-insert
    vendor.js     141 kB       1  [emitted]         vendor
leanpub-end-insert
      app.css    3.89 kB       0  [emitted]         app
   app.js.map    1.67 kB       0  [emitted]         app
  app.css.map   84 bytes       0  [emitted]         app
vendor.js.map     167 kB       1  [emitted]         vendor
   index.html  274 bytes          [emitted]
   [0] ./~/process/browser.js 5.3 kB {1} [built]
   [3] ./~/react/lib/ReactElement.js 11.2 kB {1} [built]
   [7] ./~/react/react.js 56 bytes {1} [built]
...
```

{pagebreak}

Now the bundles look the way they should. The image below illustrates the current situation.

![App and vendor bundles after applying `CommonsChunkPlugin`](images/bundle_02.png)

If the vendor entry contained extra dependencies (white on the image), the setup would pull those into the project as well. Resolving this problem is possible by examining which packages are being used in the project using the `minChunks` parameter of the `CommonsChunksPlugin`. But before that, let's abstract the solution a bit.

T> The technique could be implemented only for `productionConfig`. It's sensible to maintain it at `commonConfig` as it improved performance.

{pagebreak}

## Abstracting Bundle Extraction

The following code combines the `entry` idea above with a basic `CommonsChunkPlugin` setup. It has been designed so that it's possible to access advanced features of `CommonsChunkPlugin` while allowing you to define multiple splits through it:

**webpack.parts.js**

```javascript
...
leanpub-start-insert
const webpack = require('webpack');
leanpub-end-insert

...

leanpub-start-insert
exports.extractBundles = (bundles) => ({
  plugins: bundles.map((bundle) => (
    new webpack.optimize.CommonsChunkPlugin(bundle)
  )),
});
leanpub-end-insert
```

Given the function handles the entry, you can drop the `vendor`-related configuration and use the function instead:

**webpack.config.js**

```javascript
leanpub-start-delete
const webpack = require('webpack');
leanpub-end-delete

...

const commonConfig = merge([
  {
    entry: {
      vendor: ['react'],
    },
leanpub-start-delete
    plugins: [
      new webpack.optimize.CommonsChunkPlugin({
        name: 'vendor',
      }),
    ],
leanpub-end-delete
  },
  ...
leanpub-start-insert
  parts.extractBundles([
    {
      name: 'vendor',
    },
  ]),
leanpub-end-insert
]);
```

Everything should work the same way as earlier. This time around, however, it's more convenient to work with the plugin. You still have access to its functionality as before, but with a smaller amount of code.

To pick React to the vendor build automatically based on usage, you have to drop the `entries` option and adjust the setup so that it picks up JavaScript files from *node_modules* to the vendor bundle.

## Loading `dependencies` to a `vendor` Bundle Automatically

`CommonsChunkPlugin` gives control over its behavior through its `minChunks` options. In addition to a number and certain other values, `minChunks` accepts a function with a signature `(module, count)`. The first parameter contains a lot of information about the matches module and allows to deduce which modules are used by the project. The second one tells how many times a particular module has been imported into the project.

The most important `module` properties have been listed below. These assume an import like `import 'purecss';` and `ExtractTextPlugin`:

* `resource` represents the path of the full path of the resource being imported. Example: `.../webpack-demo/node_modules/purecss/build/pure-min.css`.
* `context` returns the path to the directory in which the resource is. Example: `.../webpack-demo/node_modules/purecss/build`.
* `rawRequest` contains the whole unresolved request. Example: `!!../../css-loader/index.js!.../pure-min.css`.
* `userRequest` is a version of the request that has been resolved to a query. Example: `.../node_modules/css-loader/index.js!.../pure-min.css`.
* `chunks` tells in which chunks the module is contained. Check `chunks.length` to tell how many times webpack has included it to control output on the chunk level.

Particularly `resource` and `userRequest` can return the same value if you are operating with imports that aren't being processed in any way. In the example above, `ExtractTextPlugin` caused a difference between the values.

To capture only JavaScript files from *node_modules*, you should perform a check against each request using the `resource` since it contains the needed information:

**webpack.config.js**

```javascript
const commonConfig = merge([
leanpub-start-delete
  {
    entry: {
      vendor: ['react'],
    },
  },
leanpub-end-delete
  ...
  parts.extractBundles([
    {
      name: 'vendor',
leanpub-start-insert
      minChunks: ({ resource }) => (
        resource &&
        resource.indexOf('node_modules') >= 0 &&
        resource.match(/\.js$/)
      ),
leanpub-end-insert
    },
  ]),
]);
```

The build result should remain the same. This time, however, webpack pulls only dependencies that are used in the project, and you don't have to maintain the list anymore.

## Performing a More Granular Split

Sometimes having only an app and a vendor bundle isn't enough. Especially when your application grows and gains more entry points, you could split the vendor bundle into multiples ones per each entry. `CommonsChunkPlugin` operates against all entry chunks by default. This behavior can be constrained through the `chunks` option for more granular control.

Consider [the example adapted from a GitHub comment](https://github.com/webpack/webpack/issues/2855#issuecomment-239606760) below where chunks are extracted from `login` and `app` entries:

```javascript
const config = {
  ...
  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      name: 'login',
      chunks: ['login'],
      minChunks: isVendor,
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      chunks: ['app'],
      minChunks: isVendor,
    }),
    // Extract chunks common to both app and login
    new webpack.optimize.CommonsChunkPlugin({
      name: 'common',
      chunks: ['login', 'app'],
      minChunks: (module, count) => {
        return count >= 2 && isVendor(module);
      }
    }),
  ],
  ...
};

function isVendor({ resource }) {
  return resource &&
    resource.indexOf('node_modules') >= 0 &&
    resource.match(/\.js$/);
}
```

The same code would look as below using the `parts.extractBundles` abstraction:

```javascript
parts.extractBundles([
  {
    name: 'login',
    chunks: ['login'],
    minChunks: isVendor,
  },
  {
    name: 'vendor',
    chunks: ['app'],
    minChunks: isVendor,
  },
  {
    name: 'common',
    chunks: ['login', 'app'],
    minChunks: (module, count) => (
      count >= 2 && isVendor(module),
    ),
  },
]),
```

T> The `chunks` option refers to the entry chunks of your configuration.

## `CommonsChunkPlugin` `children` and `async` Flags

`CommonsChunkPlugin` provides more control through `children` and `async` flags:

* `children` - If `children` is set to `true`, webpack detects which modules are the same in the resulting bundles and push them to the parent bundle.
* `async` - The idea is the same if `async` is set to `true`. In this case, webpack generates a separate bundle with the commonalities and load it asynchronously from the parent. You can pass a string to `async` option to name the output bundle. The idea is the same as for *Code Splitting* as you will see in the next chapter.

The image below shows the difference compared to the default. The top circles represent the parent bundles. The way `B` is treated depends on the chosen option:

![`CommonsChunkPlugin` children and async](images/commonschunk.png)

T> `children` and `async` can be used together if you are using *Code Splitting* and want to extract commonalities.

W> The `children` behavior applies only to immediate children. The algorithm is not applied recursively. [Webpack issue 3981](https://github.com/webpack/webpack/issues/3981) explains this in detail.

## Splitting and Merging Chunks

Webpack provides more control over the generated chunks by providing two plugins: `AggressiveSplittingPlugin` and `AggressiveMergingPlugin`. The former allows you to emit more and smaller bundles. The behavior is handy with HTTP/2 due to the way the new standard works.

Here's the basic idea of aggressive splitting:

```javascript
{
  plugins: [
    new webpack.optimize.AggressiveSplittingPlugin({
        minSize: 10000,
        maxSize: 30000,
    }),
  ],
},
```

There's a trade-off as you lose out in caching if you split to multiple small bundles. You also get request overhead in HTTP/1 environment. For now, the approach doesn't work when `HtmlWebpackPlugin` is enabled due to [a bug in the plugin](https://github.com/ampedandwired/html-webpack-plugin/issues/446).

The aggressive merging plugin works the opposite way and allows you to combine too small bundles into bigger ones:

```javascript
{
  plugins: [
    new AggressiveMergingPlugin({
        minSizeReduce: 2,
        moveToParents: true,
    }),
  ],
},
```

It's possible to get good caching behavior with these plugins if a webpack **records** are used. The idea is discussed in detail in the *Adding Hashes to Filenames* chapter.

T> Tobias Koppers discusses [aggressive merging in detail at the official blog of webpack](https://medium.com/webpack/webpack-http-2-7083ec3f3ce6).

T> `webpack.optimize.LimitChunkCountPlugin` and `webpack.optimize.MinChunkSizePlugin` give further control over chunk size.

## Chunk Types in Webpack

In the example above, you used different types of webpack chunks. Webpack treats chunks in three types:

* **Entry chunks** - Entry chunks contain webpack runtime and modules it then loads.
* **Normal chunks** - Normal chunks **don't** contain webpack runtime. Instead, these can be loaded dynamically while the application is running. A suitable wrapper (JSONP for example) is generated for these. You generate a normal chunk in the next chapter as you set up code splitting.
* **Initial chunks** - Initial chunks are normal chunks that count towards initial loading time of the application and are generated by the `CommonsChunkPlugin`. As a user, you don't have to care about these. It's the split between entry chunks and normal chunks that is important.

{pagebreak}

## Conclusion

The situation is better now compared to the earlier. Note how small `app` bundle compared to the `vendor` bundle. To benefit from this split, you set up caching in the next part of this book in the *Adding Hashes to Filenames* chapter.

To recap:

* Webpack allows you to split bundles from configuration entries through the `CommonsChunkPlugin`.
* The most basic use case for `CommonsChunkPlugin` is to extract so-called **vendor bundle**.
* A vendor bundle contains the third party code of your project. The vendor dependencies can be detected by inspecting where the modules are imported. If they come from the *node_modules* directory, they can be split automatically through a `minChunks` rule.
* `CommonsChunkPlugin` provides control over the splitting process. You can control the position of shared modules through its `async` and `children` flags. `async` extracts shared modules to an asynchronously loaded bundle while `children` pushes the shared modules to the parent bundle.
* The `chunks` option of `CommonsChunkPlugin` allows you to control where the plugin is performing splitting. The option gives more granular control, especially in more complex setups.
* Webpack offers more control over chunking through specific plugins, such as `AggressiveSplittingPlugin` and `AggressiveMergingPlugin`. Particularly the splitting plugin can be handy in HTTP/2 oriented setups.
* Internally webpack relies on three chunk types: entry, normal, and initial chunks. `CommonsChunkPlugin` flags modules using these types.

In the next chapter, you'll learn about code splitting and loading code on demand.
