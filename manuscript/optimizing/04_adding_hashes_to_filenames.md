# Adding Hashes to Filenames

Even though the build generates fine now, the naming it uses is problematic. It doesn't allow to leverage client level cache effectively as there's no way tell whether or not a file has changed. Cache invalidation can be achieved by including a hash to filenames.

## Placeholders

Webpack provides **placeholders** for this purpose. These strings are used to attach specific information to webpack output. The most valuable ones are:

* `[path]` - Returns the file path.
* `[name]` - Returns the file name.
* `[ext]` - Returns the extension. `[ext]` works for most available fields. `ExtractTextPlugin` is a notable exception to this rule.
* `[hash]` - Returns the build hash. If any portion of the build changes, this changes as well.
* `[chunkhash]` - Returns an entry chunk-specific hash. Each `entry` defined at the configuration receives a hash of own. If any portion of the entry changes, the hash changes as well. `[chunkhash]` is more granular than `[hash]` by definition.
* `[contenthash]` - Returns a hash specific to content. `[contenthash]` is available for `ExtractTextPlugin` only and is the most specific option available.

It's preferable to use particularly `hash` and `chunkhash` only for production purposes as hashing doesn't do much good during development.

T> It's possible to slice `hash` and `chunkhash` using specific syntax: `[chunkhash:8]`. Instead of a hash like `8c4cbfdb91ff93f3f3c5` this would yield `8c4cbfdb`.

T> There are more options available, and you can even modify the hashing and digest type as discussed at [loader-utils](https://www.npmjs.com/package/loader-utils#interpolatename) documentation.

### Example Placeholders

Assuming you have the following configuration:

```javascript
{
  output: {
    path: PATHS.build,
    filename: '[name].[chunkhash].js',
  },
},
```

Webpack would generate filenames like these:

```bash
app.d587bbd6e38337f5accd.js
vendor.dc746a5db4ed650296e1.js
```

If the file contents related to a chunk are different, the hash changes as well, thus invalidating the cache. More accurately, the browser sends a new request for the new file. If only `app` bundle gets updated, only that file needs to be requested again.

The same result can be achieved by generating static filenames and invalidating the cache through a querystring (i.e., `app.js?d587bbd6e38337f5accd`). The part behind the question mark invalidates the cache. According to [Steve Souders](http://www.stevesouders.com/blog/2008/08/23/revving-filenames-dont-use-querystring/), attaching the hash to the filename is the more performant.

{pagebreak}

## Setting Up Hashing

The build needs tweaking to generate proper hashes. Images and fonts should receive `hash` while chunks should use `chunkhash` in their names to invalidate them correctly:

**webpack.config.js**

```javascript
const commonConfig = {
  ...
  parts.loadFonts({
    options: {
leanpub-start-delete
      name: '[name].[ext]',
leanpub-end-delete
leanpub-start-insert
      name: '[name].[hash:8].[ext]',
leanpub-end-insert
    },
  }),
  ...
};

const productionConfig = merge([
  {
    ...
leanpub-start-insert
    output: {
      chunkFilename: '[name].[chunkhash:8].js',
      filename: '[name].[chunkhash:8].js',
    },
leanpub-end-insert
  },
  ...
  parts.loadImages({
    options: {
      limit: 15000,
leanpub-start-delete
      name: '[name].[ext]',
leanpub-end-delete
leanpub-start-insert
      name: '[name].[hash:8].[ext]',
leanpub-end-insert
    },
  }),
  ...
]);
```

If you used `chunkhash` for the extracted CSS as well, this would lead to problems as the code points to the CSS through JavaScript bringing it to the same entry. That means if the application code or CSS changed, it would invalidate both. Therefore, instead of `chunkhash`, you can use `contenthash` that's generated based on the extracted content:

**webpack.parts.js**

```javascript
exports.extractCSS = ({ include, exclude, use }) => {
  // Output extracted CSS to a file
  const plugin = new ExtractTextPlugin({
leanpub-start-delete
    filename: '[name].css',
leanpub-end-delete
leanpub-start-insert
    filename: '[name].[contenthash:8].css',
leanpub-end-insert
  });

  ...
};
```

W> The hashes have been sliced to make the output fit better in the book. In practice, you can skip slicing them.

{pagebreak}

If you generate a build now (`npm run build`), you should see something:

```bash
Hash: 16b92fddd41e579e77ba
Version: webpack 2.2.1
Time: 4258ms
                 Asset       Size  Chunks             Chunk Names
       app.e0f59512.js  811 bytes       1  [emitted]  app
  ...font.674f50d2.eot     166 kB          [emitted]
...font.af7ae505.woff2    77.2 kB          [emitted]
 ...font.fee66e71.woff      98 kB          [emitted]
  ...font.912ec66d.svg     444 kB          [emitted]
     logo.85011118.png      77 kB          [emitted]
         0.470796d5.js  408 bytes       0  [emitted]
  ...font.b06871f2.ttf     166 kB          [emitted]
    vendor.f897ca59.js    24.4 kB       2  [emitted]  vendor
      app.bf4d156d.css    2.54 kB       1  [emitted]  app
     0.470796d5.js.map    2.08 kB       0  [emitted]
   app.e0f59512.js.map    2.33 kB       1  [emitted]  app
  app.bf4d156d.css.map   93 bytes       1  [emitted]  app
vendor.f897ca59.js.map     135 kB       2  [emitted]  vendor
            index.html  301 bytes          [emitted]
   [4] ./~/object-assign/index.js 2.11 kB {2} [built]
  [14] ./app/component.js 461 bytes {1} [built]
  [15] ./app/shake.js 138 bytes {1} [built]
...
```

The files have neat hashes now. To prove that it works for styling, you could try altering *app/main.css* and see what happens to the hashes when you rebuild.

There's one problem, though. If you change the application code, it invalidates the vendor file as well! Solving this requires extracting a **manifest**, but before that, you can improve the way the production build handles module IDs.

{pagebreak}

## Enabling `HashedModuleIdsPlugin`

Webpack uses number based IDs for the module code it generates. The problem is that they are difficult to work with and can lead to difficult to debug issues, particularly with hashing. This is why webpack provides two plugins. `NamedModulesPlugin` replaces module IDs with paths to the modules making it ideal for development. `HashedModuleIdsPlugin` does the same except it hashes the result and hides the path information.

The process keeps module IDs stable as they aren't derived based on order. You sacrifice a couple of bytes for a cleaner setup, but the trade-off is well worth it.

Tweak the configuration as follows:

**webpack.config.js**

```javascript
leanpub-start-insert
const webpack = require('webpack');
leanpub-end-insert
...

const productionConfig = merge([
  {
    ...
leanpub-start-insert
    plugins: [
      new webpack.HashedModuleIdsPlugin(),
    ],
leanpub-end-insert
  },
  ...
]);
```

{pagebreak}

As you can see in the build output, the difference is negligible:

```bash
Hash: 11891d736f3749fb9f8f
Version: webpack 2.2.1
Time: 4115ms
                 Asset       Size  Chunks             Chunk Names
       app.4330d101.js  863 bytes       1  [emitted]  app
  ...font.912ec66d.svg     444 kB          [emitted]
  ...font.674f50d2.eot     166 kB          [emitted]
 ...font.fee66e71.woff      98 kB          [emitted]
...font.af7ae505.woff2    77.2 kB          [emitted]
     logo.85011118.png      77 kB          [emitted]
         0.b2a1fec0.js  430 bytes       0  [emitted]
  ...font.b06871f2.ttf     166 kB          [emitted]
    vendor.3c78d233.js    24.8 kB       2  [emitted]  vendor
      app.bf4d156d.css    2.54 kB       1  [emitted]  app
     0.b2a1fec0.js.map    2.08 kB       0  [emitted]
   app.4330d101.js.map    2.34 kB       1  [emitted]  app
  app.bf4d156d.css.map   93 bytes       1  [emitted]  app
vendor.3c78d233.js.map     135 kB       2  [emitted]  vendor
            index.html  301 bytes          [emitted]
[1Q41] ./app/main.css 41 bytes {1} [built]
[2twT] ./app/index.js 557 bytes {1} [built]
[5W1q] ./~/font-awesome/css/font-awesome.css 41 bytes {1} [built]
...
```

Note how the output has changed, though. Instead of numbers, you can see hashes. But this is expected given the change you made.

T> The *Hot Module Replacement* appendix shows how to set up `NamedModulesPlugin` as it can be used for debugging HMR.

{pagebreak}

## Conclusion

Including hashes related to the file contents to their names allows to invalidate them on the client side. If a hash has changed, the client is forced to download the asset again.

To recap:

* Webpack's **placeholders** allow you to shape filenames and enable you to include hashes to them.
* The most valuable placeholders are `[name]`, `[chunkhash]`, and `[ext]`. A chunk hash is derived based on the entry in which the asset belongs.
* If you are using `ExtractTextPlugin`, you should use `[contenthash]`. This way the generated assets get invalidated only if their content changes.
* `HashedModuleIdsPlugin` generates module IDs based on module paths. This is more stable than relying on the default order based numeric module IDs.

Even though the project generates hashes now, the output isn't flawless. The problem is that if the application changes, it invalidates the vendor bundle as well. The next chapter digs deeper into the topic and shows you how to extract a **manifest** to resolve the issue.
