# Bundle Splitting

Currently, the production version of the application is a single JavaScript file. If the application is changed, the client must download vendor dependencies as well.

It would be better to download only the changed portion. If the vendor dependencies change, then the client should fetch only the vendor dependencies. The same goes for actual application code. **Bundle splitting** can be achieved using `optimization.splitChunks.cacheGroups`. When running in production mode, [starting from webpack 4, the tool can perform a series of splits out of the box](https://gist.github.com/sokra/1522d586b8e5c0f5072d7565c2bee693) but in this case, we'll do something manually.

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
⬡ webpack: Build Finished
⬡ webpack: assets by path *.js 127 KiB
    asset main.js 127 KiB [emitted] [minimized] (name: main) 2 related assets
    asset 34.js 187 bytes [compared for emit] [minimized] 1 related asset
  asset main.css 7.72 KiB [compared for emit] (name: main) 1 related asset
  asset index.html 237 bytes [compared for emit]
  Entrypoint main 135 KiB (323 KiB) = main.css 7.72 KiB main.js 127 KiB 2 auxiliary assets
  ...
  webpack 5.1.3 compiled successfully in 5401 ms
```

As you can see, _main.js_ is big. That is something to fix next.

## Setting up a `vendor` bundle

![Main and vendor bundles after applying configuration](images/bundle_02.png)

Before webpack 4, there used to be `CommonsChunkPlugin` for managing bundle splitting. The plugin has been replaced with automation and configuration. To extract a vendor bundle from the `node_modules` directory, adjust the code as follows:

**webpack.config.js**

```javascript
const productionConfig = merge([
  ...
leanpub-start-insert
  { optimization: { splitChunks: { chunks: "all" } } },
leanpub-end-insert
]);
```

{pagebreak}

If you try to generate a build now (`npm run build`), you should see something along this:

```bash
⬡ webpack: Build Finished
⬡ webpack: assets by status 128 KiB [emitted]
    asset 935.js 124 KiB [emitted] [minimized] (id hint: vendors) 2 related assets
    asset main.js 3.24 KiB [emitted] [minimized] (name: main) 1 related asset
    asset index.html 267 bytes [emitted]
  assets by status 7.9 KiB [compared for emit]
    asset main.css 7.72 KiB [compared for emit] (name: main) 1 related asset
    asset 34.js 187 bytes [compared for emit] [minimized] 1 related asset
  Entrypoint main 135 KiB (326 KiB) = 935.js 124 KiB main.css 7.72 KiB main.js 3.24 KiB 3 auxiliary assets
  ...
  webpack 5.1.3 compiled successfully in 4847 ms
```

Now the bundles look the same as in the image above.

T> The `chunks: "initial"` option doesn't apply to code-split modules while `all` does.

{pagebreak}

## Controlling bundle splitting

The configuration above can be rewritten with an explicit test against `node_modules` as below to gain more control:

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

Starting from webpack 5, there's more control over chunking based on asset type:

```javascript
const config = {
  optimization: {
    splitChunks: {
      // css/mini-extra is injected by mini-css-extract-plugin
      minSize: { javascript: 20000, "css/mini-extra": 10000 },
    },
  },
};
```

{pagebreak}

## Splitting and merging chunks

Webpack provides more control over the generated chunks by two plugins:

- `AggressiveSplittingPlugin` allows you to emit more and smaller bundles. The behavior is handy with HTTP/2 due to the way the new standard works.
- `AggressiveMergingPlugin` is doing the opposite.

Here's the basic idea of aggressive splitting:

```javascript
const config = {
  plugins: [
    new webpack.optimize.AggressiveSplittingPlugin({
      minSize: 10000,
      maxSize: 30000,
    }),
  ],
};
```

There's a trade-off as you lose out in caching if you split to multiple small bundles. You also get request overhead in HTTP/1 environment.

The aggressive merging plugin works the opposite way and allows you to combine small bundles into bigger ones:

```javascript
const config = {
  plugins: [
    new AggressiveMergingPlugin({
      minSizeReduce: 2,
      moveToParents: true,
    }),
  ],
};
```

It's possible to get good caching behavior with these plugins if a webpack **records** are used. The idea is discussed in detail in the _Adding Hashes to Filenames_ chapter.

`webpack.optimize` contains `LimitChunkCountPlugin` and `MinChunkSizePlugin` which give further control over chunk size.

T> Tobias Koppers discusses [aggressive merging in detail at the official blog of webpack](https://medium.com/webpack/webpack-http-2-7083ec3f3ce6).

## Chunk types in webpack

In the example above, you used different types of webpack chunks. Webpack treats chunks in three types:

- **Entry chunks** contain webpack runtime and modules it then loads.
- **Normal chunks** **don't** contain webpack runtime. Instead, these can be loaded dynamically while the application is running. A suitable wrapper (JSONP for example) is generated for these. You generate a normal chunk in the next chapter as you set up code splitting.
- **Initial chunks** are normal chunks that count towards initial loading time of the application. As a user, you don't have to care about these. It's the split between entry chunks and normal chunks that is important.

## Bundle splitting at entry configuration

Starting from webpack 5, it's possible to define bundle splitting using entries:

```javascript
const config = {
  entry: {
    app: {
      import: path.join(__dirname, "src", "index.js"),
      dependOn: "vendor",
    },
    vendor: ["react", "react-dom"],
  },
};
```

If you have this configuration in place, you can drop `optimization.splitChunks` and the output should still be the same.

W> To use the approach with **webpack-plugin-serve**, you'll have to inject `webpack-plugin-serve/client` within `app.import` in this case.

## Conclusion

The situation is better now compared to the earlier. Note how small `main` bundle compared to the `vendor` bundle. To benefit from this split, you set up caching in the next part of this book in the _Adding Hashes to Filenames_ chapter.

To recap:

- Webpack allows you to split bundles from configuration entries through the `optimization.splitChunks.cacheGroups` field. It performs bundle splitting by default in production mode as well.
- A vendor bundle contains the third-party code of your project. The vendor dependencies can be detected by inspecting where the modules are imported.
- Webpack offers more control over chunking through specific plugins, such as `AggressiveSplittingPlugin` and `AggressiveMergingPlugin`. Mainly the splitting plugin can be handy in HTTP/2 oriented setups.
- Internally webpack relies on three chunk types: entry, normal, and initial chunks.

You'll learn to tidy up the build in the next chapter.
