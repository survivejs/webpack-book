# Bundle Splitting

Currently, the production version of the application is a single JavaScript file. If the application is changed, the client must download vendor dependencies as well.

It would be better to download only the changed portion. If the vendor dependencies change, then the client should fetch only the vendor dependencies. The same goes for actual application code. **Bundle splitting** can be achieved using `optimization.splitChunks.cacheGroups`. When running in production mode, [webpack 4 can perform a series of splits out of the box](https://gist.github.com/sokra/1522d586b8e5c0f5072d7565c2bee693) but in this case, we'll do something manually.

T> To invalidate the bundles correctly, you have to attach hashes to the generated bundles as discussed in the _Adding Hashes to Filenames_ chapter.

## The idea of bundle splitting

With bundle splitting, you can push the vendor dependencies to a bundle of their own and benefit from client level caching. The process can be done in such a way that the whole size of the application remains the same. Given there are more requests to perform, there's a slight overhead. But the benefit of caching makes up for this cost.

To give you a quick example, instead of having _main.js_ (100 kB), you could end up with _main.js_ (10 kB) and _vendor.js_ (90 kB). Now changes made to the application are cheap for the clients that have already used the application earlier.

Caching comes with its problems. One of those is cache invalidation. A potential approach related to that is discussed in the _Adding Hashes to Filenames_ chapter.

## Adding something to split

Given there's not much to split into the vendor bundle yet, you should add something there. Add React to the project first:

```bash
npm add react react-dom
```

Then make the project depend on it:

**src/index.js**

```
leanpub-start-insert
import "react";
import "react-dom";
leanpub-end-insert
...
```

Execute `npm run build` to get a baseline build. You should end up with something as below:

```bash
Hash: 8243e4d4e821c80ebf23
Version: webpack 4.43.0
Time: 3440ms
Built at: 07/10/2020 3:00:42 PM
     Asset       Size  Chunks             Chunk Names
      1.js  127 bytes       1  [emitted]
index.html  237 bytes          [emitted]
  main.css    8.5 KiB       0  [emitted]  main
   main.js    129 KiB       0  [emitted]  main
Entrypoint main = main.css main.js
...
```

As you can see, _main.js_ is big. That is something to fix next.

## Setting up a `vendor` bundle

Before webpack 4, there used to be `CommonsChunkPlugin` for managing bundle splitting. The plugin has been replaced with automation and configuration. To extract a vendor bundle from the _node_modules_ directory, adjust the code as follows:

**webpack.config.js**

```javascript
const productionConfig = merge([
  ...
leanpub-start-insert
  {
    optimization: {
      splitChunks: {
        chunks: "all",
      },
    },
  },
leanpub-end-insert
]);
```

If you try to generate a build now (`npm run build`), you should see something along this:

```bash
Hash: 7d26879955396fd4464f
Version: webpack 4.43.0
Time: 3442ms
Built at: 07/10/2020 3:01:31 PM
          Asset       Size  Chunks             Chunk Names
           2.js  127 bytes       2  [emitted]
     index.html  276 bytes          [emitted]
       main.css    8.5 KiB       0  [emitted]  main
        main.js   2.65 KiB       0  [emitted]  main
vendors~main.js    127 KiB       1  [emitted]  vendors~main
Entrypoint main = vendors~main.js main.css main.js
...
```

Now the bundles look the way they should. The image below illustrates the current situation.

![Main and vendor bundles after applying configuration](images/bundle_02.png)

T> `chunks: "initial"` would give the same result in this case. You can see the difference after _Code Splitting_ as the `all` option is able to extract commonalities even chunks that have been code split while `initial` doesn't go as far.

{pagebreak}

## Controlling bundle splitting

The configuration above can be rewritten with an explicit test against _node_modules_ as below:

**webpack.config.js**

```javascript
const productionConfig = merge([
  ...
leanpub-start-insert
  {
    optimization: {
      splitChunks: {
        cacheGroups: {
          commons: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendor",
            chunks: "initial",
          },
        },
      },
    },
  },
leanpub-end-insert
]);
```

Following this format gives you more control over the splitting process if you don't prefer to rely on automation.

## Splitting and merging chunks

Webpack provides more control over the generated chunks by two plugins:

- `AggressiveSplittingPlugin` allows you to emit more and smaller bundles. The behavior is handy with HTTP/2 due to the way the new standard works.
- `AggressiveMergingPlugin` is doing the opposite.

{pagebreak}

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

There's a trade-off as you lose out in caching if you split to multiple small bundles. You also get request overhead in HTTP/1 environment.

The aggressive merging plugin works the opposite way and allows you to combine small bundles into bigger ones:

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

It's possible to get good caching behavior with these plugins if a webpack **records** are used. The idea is discussed in detail in the _Adding Hashes to Filenames_ chapter.

`webpack.optimize` contains `LimitChunkCountPlugin` and `MinChunkSizePlugin` which give further control over chunk size.

T> Tobias Koppers discusses [aggressive merging in detail at the official blog of webpack](https://medium.com/webpack/webpack-http-2-7083ec3f3ce6).

T> Starting from webpack 5, it's possible to define `minSize` per asset type. For example, you could set `minSize.javascript: 10000` and then `minSize.style` separately.

## Chunk types in webpack

In the example above, you used different types of webpack chunks. Webpack treats chunks in three types:

- **Entry chunks** - Entry chunks contain webpack runtime and modules it then loads.
- **Normal chunks** - Normal chunks **don't** contain webpack runtime. Instead, these can be loaded dynamically while the application is running. A suitable wrapper (JSONP for example) is generated for these. You generate a normal chunk in the next chapter as you set up code splitting.
- **Initial chunks** - Initial chunks are normal chunks that count towards initial loading time of the application. As a user, you don't have to care about these. It's the split between entry chunks and normal chunks that is important.

## Conclusion

The situation is better now compared to the earlier. Note how small `main` bundle compared to the `vendor` bundle. To benefit from this split, you set up caching in the next part of this book in the _Adding Hashes to Filenames_ chapter.

To recap:

- Webpack allows you to split bundles from configuration entries through the `optimization.splitChunks.cacheGroups` field. It performs bundle splitting by default in production mode as well.
- A vendor bundle contains the third party code of your project. The vendor dependencies can be detected by inspecting where the modules are imported.
- Webpack offers more control over chunking through specific plugins, such as `AggressiveSplittingPlugin` and `AggressiveMergingPlugin`. Mainly the splitting plugin can be handy in HTTP/2 oriented setups.
- Internally webpack relies on three chunk types: entry, normal, and initial chunks.

You'll learn to tidy up the build in the next chapter.
