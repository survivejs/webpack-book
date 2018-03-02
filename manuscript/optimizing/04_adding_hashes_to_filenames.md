# Adding Hashes to Filenames

Even though the build generates fine now, the naming it uses is problematic. It doesn't allow to leverage client level cache efficiently as there's no way tell whether or not a file has changed. Cache invalidation can be achieved by including a hash to the filenames.

## Placeholders

Webpack provides **placeholders** for this purpose. These strings are used to attach specific information to webpack output. The most valuable ones are:

* `[path]` - Returns the file path.
* `[name]` - Returns the file name.
* `[ext]` - Returns the extension. `[ext]` works for most available fields. `ExtractTextPlugin` is a notable exception to this rule.
* `[hash]` - Returns the build hash. If any portion of the build changes, this changes as well.
* `[chunkhash]` - Returns an entry chunk-specific hash. Each `entry` defined in the configuration receives a hash of its own. If any portion of the entry changes, the hash will change as well. `[chunkhash]` is more granular than `[hash]` by definition.
* `[contenthash]` - Returns a hash specific to content. `[contenthash]` is available for `ExtractTextPlugin` only and is the most specific option available.

It's preferable to use particularly `hash` and `chunkhash` only for production purposes as hashing doesn't do much good during development.

T> It's possible to slice `hash` and `chunkhash` using specific syntax: `[chunkhash:8]`. Instead of a hash like `8c4cbfdb91ff93f3f3c5` this would yield `8c4cbfdb`.

T> There are more options available, and you can even modify the hashing and digest type as discussed at [loader-utils](https://www.npmjs.com/package/loader-utils#interpolatename) documentation.

### Example Placeholders

Assume you have the following configuration:

```javascript
{
  output: {
    path: PATHS.build,
    filename: "[name].[chunkhash].js",
  },
},
```

Webpack would generate filenames like these based on it:

```bash
app.d587bbd6e38337f5accd.js
vendor.dc746a5db4ed650296e1.js
```

If the file contents related to a chunk are different, the hash changes as well, thus the cache gets invalidated. More accurately, the browser sends a new request for the new file. If only `app` bundle gets updated, only that file needs to be requested again.

The same result can be achieved by generating static filenames and invalidating the cache through a querystring (i.e., `app.js?d587bbd6e38337f5accd`). The part behind the question mark invalidates the cache. According to [Steve Souders](http://www.stevesouders.com/blog/2008/08/23/revving-filenames-dont-use-querystring/), attaching the hash to the filename is the most performant option.

{pagebreak}

## Setting Up Hashing

The build needs tweaking to generate proper hashes. Images and fonts should receive `hash` while chunks should use `chunkhash` in their names to invalidate them correctly:

**webpack.config.js**

```javascript
const productionConfig = merge([
leanpub-start-insert
  {
    output: {
      chunkFilename: "[name].[chunkhash:8].js",
      filename: "[name].[chunkhash:8].js",
    },
  },
leanpub-end-insert
  ...
  parts.loadImages({
    options: {
      limit: 15000,
leanpub-start-delete
      name: "[name].[ext]",
leanpub-end-delete
leanpub-start-insert
      name: "[name].[hash:8].[ext]",
leanpub-end-insert
    },
  }),
  ...
]);
```

If you used `chunkhash` for the extracted CSS as well, this would lead to problems as the code points to the CSS through JavaScript bringing it to the same entry. That means if the application code or CSS changed, it would invalidate both.

{pagebreak}

Therefore, instead of `chunkhash`, you can use `contenthash` that is generated based on the extracted content:

**webpack.parts.js**

```javascript
exports.extractCSS = ({ include, exclude, use }) => {
  // Output extracted CSS to a file
  const plugin = new ExtractTextPlugin({
    // `allChunks` is needed to extract from extracted chunks as well.
    allChunks: true,
leanpub-start-delete
    filename: "[name].css",
leanpub-end-delete
leanpub-start-insert
    filename: "[name].[contenthash:8].css",
leanpub-end-insert
  });

  ...
};
```

W> The hashes have been sliced to make the output fit better in the book. In practice, you can skip slicing them.

If you generate a build now (`npm run build`), you should see something:

```bash
Hash: 3d74e35d7f69c1738a2b
Version: webpack 4.0.1
Time: 2556ms
Built at: 3/1/2018 3:00:46 PM
                  Asset       Size  Chunks             Chunk Names
          0.08477a8d.js  126 bytes       0  [emitted]
     vendor.3b5f19b6.js   96.2 KiB       1  [emitted]  vendor
       main.ae19a118.js   2.21 KiB       2  [emitted]  main
      main.d5d711b1.css   1.26 KiB       2  [emitted]  main
    vendor.3dd53418.css   1.38 KiB       1  [emitted]  vendor
vendor.3dd53418.css.map   96 bytes       1  [emitted]  vendor
  main.d5d711b1.css.map   94 bytes       2  [emitted]  main
             index.html  353 bytes          [emitted]
Entrypoint main = vendor.3b5f19b6.js vendor.3dd53418.css ...
...
```

The files have neat hashes now. To prove that it works for styling, you could try altering *src/main.css* and see what happens to the hashes when you rebuild.

There's one problem, though. If you change the application code, it invalidates the vendor file as well! Solving this requires extracting a **manifest**, but before that, you can improve the way the production build handles module IDs.

## Enabling `NamedModulesPlugin`

Webpack uses number based IDs for the module code it generates. The problem is that they are difficult to work with and can lead to painful to debug issues, particularly with hashing. For this reason webpack provides two plugins:

* `NamedModulesPlugin` replaces module IDs with paths to the modules making it ideal for development.
* `HashedModuleIdsPlugin` does the same except it hashes the result and hides the path information.

The process keeps module IDs stable as they aren't derived based on order. You sacrifice a couple of bytes for a cleaner setup, but the trade-off is well worth it. In this case, you can use `NamedModulesPlugin` to get a better development experience while fixing the module ID stability issue.

{pagebreak}

Tweak the configuration as follows:

**webpack.config.js**

```javascript
leanpub-start-insert
const webpack = require("webpack");
leanpub-end-insert
...

const commonConfig = merge([
  {
    ...
leanpub-start-insert
    plugins: [new webpack.NamedModulesPlugin()],
leanpub-end-insert
  },
  ...
]);
```

As you can see in the build output, the difference is negligible:

```bash
Hash: 7c3f5a49e2cb31e1072e
Version: webpack 4.0.1
Time: 2628ms
Built at: 3/1/2018 3:02:18 PM
                  Asset       Size  Chunks             Chunk Names
          0.554ab1b6.js  141 bytes       0  [emitted]
     vendor.369742c8.js   97.6 KiB       1  [emitted]  vendor
       main.b1814756.js   2.38 KiB       2  [emitted]  main
      main.d5d711b1.css   1.26 KiB       2  [emitted]  main
    vendor.3dd53418.css   1.38 KiB       1  [emitted]  vendor
vendor.3dd53418.css.map   96 bytes       1  [emitted]  vendor
  main.d5d711b1.css.map   94 bytes       2  [emitted]  main
             index.html  353 bytes          [emitted]
Entrypoint main = vendor.369742c8.js vendor.3dd53418.css ...
...
```

Note how the output has changed, though. Instead of numbers, you can see file paths.

T> If you want to hide the path information from the client, use `HashedModuleIdsPlugin`.

T> `NamedChunksPlugin` achieves a similar result for split points. See [Predictable long-term caching with Webpack](https://medium.com/webpack/predictable-long-term-caching-with-webpack-d3eee1d3fa31) by Tim Sebastian for further details.

## Conclusion

Including hashes related to the file contents to their names allows to invalidate them on the client side. If a hash has changed, the client is forced to download the asset again.

To recap:

* Webpack's **placeholders** allow you to shape filenames and enable you to include hashes to them.
* The most valuable placeholders are `[name]`, `[chunkhash]`, and `[ext]`. A chunk hash is derived based on the entry in which the asset belongs.
* If you are using `ExtractTextPlugin`, you should use `[contenthash]`. This way the generated assets get invalidated only if their content changes.
* `HashedModuleIdsPlugin` generates module IDs based on module paths. Doing this is more stable than relying on the default order based numeric module IDs.

Even though the project generates hashes now, the output isn't flawless. The problem is that if the application changes, it invalidates the vendor bundle as well. The next chapter digs deeper into the topic and shows you how to extract a **manifest** to resolve the issue.
