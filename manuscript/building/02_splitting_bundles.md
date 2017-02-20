# Splitting Bundles

Currently, the production version of our application is a single JavaScript file. This isn't ideal. If we change the application, the client must download vendor dependencies as well.

It would be better to download only the changed portion. If the vendor dependencies change, then the client should fetch only the vendor dependencies. The same goes for actual application code. This technique is known as **bundle splitting**.

## The Idea of Bundle Splitting

Using bundle splitting, we can push the vendor dependencies to a bundle of their own and benefit from client level caching. We can do this in such a way that the whole size of the application remains the same. Given there are more requests to perform, there's a slight overhead. But the benefit of caching makes up for this cost.

To give you a simple example, instead of having *app.js* (100 kB), we could end up with *app.js* (10 kB) and *vendor.js* (90 kB). Now changes made to the application are cheap for the clients that have already used the application earlier.

Caching comes with its own problems. One of those is cache invalidation. We'll discuss a potential approach related to that in the *Adding Hashes to Filenames* chapter.

Bundle splitting isn't the only way out. The *Code Splitting* chapter discusses another, more granular way.

## Adding Something to Split

Given there's not much to split into the vendor bundle yet, we should add something there. Add React to the project first:

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

Execute `npm run build` to get a baseline build. You should end up with something like this:

```bash
Hash: 909ea27e159183e169ca
Version: webpack 2.2.1
Time: 2689ms
                    Asset       Size  Chunks             Chunk Names
                 logo.png      77 kB          [emitted]
  fontawesome-webfont.eot     166 kB          [emitted]
fontawesome-webfont.woff2    77.2 kB          [emitted]
 fontawesome-webfont.woff      98 kB          [emitted]
  fontawesome-webfont.svg   22 bytes          [emitted]
  fontawesome-webfont.ttf     166 kB          [emitted]
                   app.js     140 kB       0  [emitted]  app
                  app.css    3.89 kB       0  [emitted]  app
               app.js.map     166 kB       0  [emitted]  app
              app.css.map   84 bytes       0  [emitted]  app
               index.html  218 bytes          [emitted]
   [0] ./~/process/browser.js 5.3 kB {0} [built]
   [3] ./~/react/lib/ReactElement.js 11.2 kB {0} [built]
  [18] ./app/component.js 272 bytes {0} [built]
...
```

As you can see, *app.js* is big. This is exactly what we wanted. We must do something about this next.

## Setting Up a `vendor` Bundle

So far our project has only a single entry named as `app`. As you might remember, our configuration tells webpack to traverse dependencies starting from the `app` entry directory and then to output the resulting bundle below our `build` directory using the entry name and `.js` extension.

To improve the situation, we can define a `vendor` entry containing React. This is done by matching the dependency name. It is possible to generate this information automatically as discussed in the end of this chapter, but I'll go with a static array here to illustrate the basic idea. Change the code like this:

**webpack.config.js**

```javascript
...

const productionConfig = merge([
leanpub-start-insert
  {
    entry: {
      vendor: ['react'],
    },
  },
leanpub-end-insert
  ...
]);

...
```

We have two separate entries, or **entry chunks**, now. `[name].js` of our existing `output.path` configuration will kick in based on the entry name and if you try to generate a build now (`npm run build`), you should see something along this:

```bash
Hash: 826dae8d1f861ff05cb8
Version: webpack 2.2.1
Time: 2611ms
                    Asset       Size  Chunks             Chunk Names
                   app.js     140 kB       0  [emitted]  app
  fontawesome-webfont.eot     166 kB          [emitted]
fontawesome-webfont.woff2    77.2 kB          [emitted]
 fontawesome-webfont.woff      98 kB          [emitted]
  fontawesome-webfont.svg   22 bytes          [emitted]
                 logo.png      77 kB          [emitted]
  fontawesome-webfont.ttf     166 kB          [emitted]
                vendor.js     138 kB       1  [emitted]  vendor
                  app.css    3.89 kB       0  [emitted]  app
               app.js.map     166 kB       0  [emitted]  app
              app.css.map   84 bytes       0  [emitted]  app
            vendor.js.map     164 kB       1  [emitted]  vendor
               index.html  274 bytes          [emitted]
   [0] ./~/process/browser.js 5.3 kB {0} {1} [built]
   [3] ./~/react/lib/ReactElement.js 11.2 kB {0} {1} [built]
  [18] ./~/react/react.js 56 bytes {0} {1} [built]
...
```

*app.js* and *vendor.js* have separate chunk IDs right now given they are entry chunks of their own. The output size is a little off, though. Intuitively *app.js* should be smaller to attain our goal with this build.

If you examine the resulting bundle, you can see that it contains React given that's how the default definition works. Webpack pulls the related dependencies to a bundle by default as illustrated by the image below:

![Separate app and vendor bundles](images/bundle_01.png)

`CommonsChunkPlugin` is a webpack plugin that allows us alter this default behavior so that we can get the bundles we might expect.

W> This step can fail on Windows due to letter casing. Instead of `c:\` you may need to force your terminal to read `C:\`. There's more information in the [related webpack issue](https://github.com/webpack/webpack/issues/2362).

W> Webpack doesn't allow referring to entry files within entries. If you inadvertently do this, webpack will complain loudly. If you end up in a case like this, consider refactoring the module structure of your code to eliminate the situation.

## Setting Up `CommonsChunkPlugin`

[CommonsChunkPlugin](https://webpack.js.org/guides/code-splitting-libraries/#commonschunkplugin) is a powerful and complex plugin. In this case, the target is clear. We have to tell it to extract vendor related code to a bundle of its own. Before abstraction, implement it like this:

**webpack.config.js**

```javascript
...

const productionConfig = merge([
  {
    entry: {
      vendor: ['react'],
    },
leanpub-start-insert
    plugins: [
      new webpack.optimize.CommonsChunkPlugin({
        name: 'vendor',
        entries: ['react'],
      }),
    ],
leanpub-end-insert
  },
  ...
]);

...
```

This tells the plugin to extract React to a bundle named `vendor`. If you execute the build now using `npm run build`, you should see something along this:

```bash
Hash: 9e99171a301a171aefaf
Version: webpack 2.2.1
Time: 2628ms
                    Asset       Size  Chunks             Chunk Names
                   app.js    2.48 kB       0  [emitted]  app
  fontawesome-webfont.eot     166 kB          [emitted]
fontawesome-webfont.woff2    77.2 kB          [emitted]
 fontawesome-webfont.woff      98 kB          [emitted]
  fontawesome-webfont.svg   22 bytes          [emitted]
                 logo.png      77 kB          [emitted]
  fontawesome-webfont.ttf     166 kB          [emitted]
                vendor.js     141 kB       1  [emitted]  vendor
                  app.css    3.89 kB       0  [emitted]  app
               app.js.map    2.32 kB       0  [emitted]  app
              app.css.map   84 bytes       0  [emitted]  app
            vendor.js.map     167 kB       1  [emitted]  vendor
               index.html  274 bytes          [emitted]
   [0] ./~/process/browser.js 5.3 kB {1} [built]
   [3] ./~/react/lib/ReactElement.js 11.2 kB {1} [built]
   [7] ./~/react/react.js 56 bytes {1} [built]
...
```

Now our bundles look the way we want. The image below illustrates the current situation.

![App and vendor bundles after applying `CommonsChunkPlugin`](images/bundle_02.png)

It is good to note that if the vendor entry contained extra dependencies (white on the image), the setup would pull those into the project as well. Resolving this problem is possible by examining which packages are being used in the project using the `minChunks` parameter of the `CommonsChunksPlugin`. But before that, let's abstract the solution a bit.

## Abstracting Bundle Extraction

The following code combines the `entry` idea above with a basic `CommonsChunkPlugin` setup. It has been designed so that it is possible to access advanced features of `CommonsChunkPlugin` while allowing you to define multiple splits through it:

**webpack.parts.js**

```javascript
...

exports.extractBundles = function(bundles) {
  const entry = {};
  const plugins = [];

  bundles.forEach((bundle) => {
    const { name, entries } = bundle;

    if (entries) {
      entry[name] = entries;
    }

    plugins.push(
      new webpack.optimize.CommonsChunkPlugin(bundle)
    );
  });

  return { entry, plugins };
};
```

Given the function handles the entry for us, we can drop our `vendor`-related configuration and use the function instead:

**webpack.config.js**

```javascript
...

const productionConfig = merge([
leanpub-start-delete
  {
    entry: {
      vendor: ['react'],
    },
    plugins: [
      new webpack.optimize.CommonsChunkPlugin({
        name: 'vendor',
        entries: ['react'],
      }),
    ],
  },
leanpub-end-delete
leanpub-start-insert
  parts.extractBundles([
    {
      name: 'vendor',
      entries: ['react'],
    },
  ]),
leanpub-end-insert
  ...
]);

...
```

Everything should work the same way as earlier. This time around, however, it is more convenient to work with the plugin. We still have access to its functionality as before, but with a smaller amount of code.

To pick React to the vendor build automatically based on usage, we have to drop the `entries` option and adjust the setup so that it picks up JavaScript files from *node_modules* to the vendor bundle.

## Loading `dependencies` to a `vendor` Bundle Automatically

`CommonsChunkPlugin` gives control over its behavior through its `minChunks` options. In addition to a number and certain other values, `minChunks` accepts a function with a signature `(module, count)`. The first parameter contains a lot of information about the matches module and allows us to deduce which modules are used by the project. The second one tells how many times a specific module has been imported to the project.

To capture only JavaScript files from *node_modules*, we should perform a check against each request:

**webpack.config.js**

```javascript
...

const productionConfig = merge([
  parts.extractBundles([
    {
      name: 'vendor',
leanpub-start-delete
      entries: ['react'],
leanpub-end-delete
leanpub-start-insert
      minChunks: ({ userRequest }) => (
        userRequest &&
        userRequest.indexOf('node_modules') >= 0 &&
        userRequest.match(/\.js$/)
      ),
leanpub-end-insert
    },
  ]),
  ...
]);

...
```

The build result should remain the same. This time, however, webpack will pull only dependencies we are using in the project and we don't have to maintain the list anymore. The check above works because `context`contains the full path to the module that was imported.

The first `module` parameter contains a more than `context`. If you wanted to figure out how many times a specific module is included in the chunks generated by webpack, you could check `module.chunks.length`. This is useful especially if you want more control when code splitting is used.

## Performing a More Granular Split

Sometimes having only an app and a vendor bundle isn't enough. Especially as your application grows and gains more entry points, you may want to split the vendor bundle into multiples ones per each entry. The `minChunks` idea above can be combined with more granular control by specifying `chunks` which to process. Consider [the example adapted from a GitHub comment](https://github.com/webpack/webpack/issues/2855#issuecomment-239606760) below:

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

...

const isVendor = ({ userRequest }) => (
  userRequest &&
  userRequest.indexOf('node_modules') >= 0 &&
  userRequest.match(/\.js$/)
);
```

The same code would look like this in terms of `parts.extractBundles` abstraction:

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

T> Note that the `chunks` option refers to the entry chunks of your configuration.


`CommonsChunkPlugin` provides more control through `children` and `async` flags:

* `children` - If `children` is set to `true`, webpack will detect which modules are the same in the resulting bundles and push them to the parent bundle.
* `async` - The idea is the same if `async` is set to `true`. In this case webpack will generate a separate bundle with the commonalities and load it asynchronously from the parent.

![`CommonsChunkPlugin` children and async](images/commonschunk.png)

## Splitting and Merging Chunks

Webpack provides more control over the generated chunks by providing two plugins: `AggressiveSplittingPlugin` and `AggressiveMergingPlugin`. The former is particularly interesting as it allows you to emit more and smaller bundles. This is especially useful with HTTP/2 due to the way the new standard works.

There's a trade-off involved as you'll lose out in caching if you split to multiple small bundles. You also get request overhead in HTTP/1 environment. For now, the approach doesn't work when `HtmlWebpackPlugin` is enabled due to [a bug in the plugin](https://github.com/ampedandwired/html-webpack-plugin/issues/446).

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

The aggressive merging plugin works the inverse way and allows you to combine too small bundles into bigger ones:

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

It is possible to get good caching behavior with these plugins if a webpack **records** are used. The idea is discussed in detail in the *Adding Hashes to Filenames* chapter.

T> Tobias Koppers discusses [aggressive merging in detail at the official blog of webpack](https://medium.com/webpack/webpack-http-2-7083ec3f3ce6).

T> `webpack.optimize.LimitChunkCountPlugin` and `webpack.optimize.MinChunkSizePlugin` give further control over chunk size.

## Chunk Types in Webpack

In the example above, we used different types of webpack chunks. Webpack treats chunks in three types:

* **Entry chunks** - Entry chunks contain webpack runtime and modules it then loads.
* **Normal chunks** - Normal chunks **don't** contain webpack runtime. Instead, these can be loaded dynamically while the application is running. A suitable wrapper (JSONP for example) is generated for these. We'll generate a normal chunk in the next chapter as we set up code splitting.
* **Initial chunks** - Initial chunks are normal chunks that count towards initial loading time of the application and are generated by the `CommonsChunkPlugin`. As a user, you don't have to care about these. It's the split between entry chunks and normal chunks that's important.

## Conclusion

The situation is better now. Note how small `app` bundle compared to the `vendor` bundle. To really benefit from this split, we will set up caching in the next part of this book.
