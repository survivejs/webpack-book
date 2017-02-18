# Adding Hashes to Filenames

Even though our build generates fine now, the naming it uses is a little problematic. It doesn't allow us to leverage client level cache effectively as there's no easy way to tell whether or not a file has changed. Cache invalidation can be achieved by including a hash to filenames.

Webpack provides **placeholders** for this purpose. These strings are used to attach specific information to webpack output. The most useful ones are:

* `[path]` - Returns the file path.
* `[name]` - Returns the file name.
* `[ext]` - Returns the extension. This works for most available fields. `ExtractTextPlugin` is a notable exception to this rule.
* `[hash]` - Returns the build hash. If any portion of the build changes, this will change as well.
* `[chunkhash]` - Returns an entry chunk specific hash. Each `entry` defined at the configuration receives a hash of own. If any portion of the entry changes, the hash changes as well. This is more granular than `[hash]` by definition.
* `[contenthash]` - Returns a hash specific to content. This is available for `ExtractTextPlugin` only and is the most specific option available.

It is preferable to use particularly `hash` and `chunkhash` only for production purposes as hashing won't do much good during development.

T> If you want shorter hashes, it is possible to slice `hash` and `chunkhash` using syntax like this: `[chunkhash:8]`. Instead of a hash like `8c4cbfdb91ff93f3f3c5` this would yield `8c4cbfdb`.

T> There are more options available and you can even modify the hashing and digest type as discussed at [loader-utils](https://www.npmjs.com/package/loader-utils#interpolatename) documentation.

## Using Placeholders

Assuming we have configuration like this:

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

If the file contents related to a chunk are different, the hash will change as well, thus invalidating the cache. More accurately, the browser will send a new request for the new file. This means if only `app` bundle gets updated, only that file needs to be requested again.

An alternate way to achieve the same result would be to generate static filenames and invalidate the cache through a querystring (i.e., `app.js?d587bbd6e38337f5accd`). The part behind the question mark will invalidate the cache. According to [Steve Souders](http://www.stevesouders.com/blog/2008/08/23/revving-filenames-dont-use-querystring/), attaching the hash to the filename is the more performant way to go.

## Setting Up Hashing

The build needs tweaking in order to generate proper hashes. Images and fonts should receive `hash` while chunks should use `chunkhash` in their names to invalidate them correctly:

**webpack.config.js**

```javascript
...

const commonConfig = {
  ...
  parts.loadImages({
    options: {
      limit: 15000,
leanpub-start-delete
      name: '[name].[ext]',
leanpub-end-delete
leanpub-start-insert
      name: '[hash:8].[ext]',
leanpub-end-insert
    },
  }),
  parts.loadFonts({
    options: {
leanpub-start-delete
      name: '[name].[ext]',
leanpub-end-delete
leanpub-start-insert
      name: '[hash:8].[ext]',
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
      chunkFilename: 'scripts/[chunkhash:8].js',
      filename: '[chunkhash:8].js',
    },
leanpub-end-insert
  },
  ...
]);

...
```

If we used `chunkhash` for the extracted CSS as well, this would lead to problems as our code points to the CSS through JavaScript bringing it to the same entry. That means if the application code or CSS changed, it would invalidate both. Therefore instead of `chunkhash`, we can use `contenthash` that's generated based on the extracted content:

**webpack.parts.js**

```javascript
...

exports.extractCSS = function({ include, exclude, use }) {
  return {
    module: {
      ...
    },
    plugins: [
      // Output extracted CSS to a file
leanpub-start-delete
      new ExtractTextPlugin('[name].css'),
leanpub-end-delete
leanpub-start-insert
      new ExtractTextPlugin('[contenthash:8].css'),
leanpub-end-insert
    ],
  };
};

...
```

W> `[name]` pattern has been omitted to fit the terminal output better to the book. In practice it could be a good idea to include it to make it easier to find the files you want.

If you generate a build now (`npm run build`), you should see something like this:

```bash
Hash: babf2c487b57511aa790
Version: webpack 2.2.1
Time: 3576ms
                  Asset       Size  Chunks             Chunk Names
            e0f59512.js  813 bytes       1  [emitted]  app
           674f50d2.eot     166 kB          [emitted]
         af7ae505.woff2    77.2 kB          [emitted]
          fee66e71.woff      98 kB          [emitted]
           11ec0064.svg   22 bytes          [emitted]
           85011118.png      77 kB          [emitted]
    scripts/a21c7031.js  182 bytes       0  [emitted]
           b06871f2.ttf     166 kB          [emitted]
            a0e64b11.js    24.6 kB       2  [emitted]  vendor
           eae1155e.css    46.8 kB       1  [emitted]  app
scripts/a21c7031.js.map  813 bytes       0  [emitted]
        e0f59512.js.map    6.46 kB       1  [emitted]  app
       eae1155e.css.map   89 bytes       1  [emitted]  app
        a0e64b11.js.map     286 kB       2  [emitted]  vendor
             index.html  286 bytes          [emitted]
  [14] ./app/component.js 461 bytes {1} [built]
  [15] ./app/shake.js 138 bytes {1} [built]
  [16] ./~/font-awesome/css/font-awesome.css 41 bytes {1} [built]
...
```

Our files have neat hashes now. To prove that it works for styling, you could try altering *app/main.css* and see what happens to the hashes when you rebuild.

There's one problem, though. If you change the application code, it will invalidate the vendor file as well! Solving this requires extracting a **manifest**, but before that we can improve the way the production build handles module IDs.

T> The length of hashes has been clamped to eight characters to fit the output to the book better. In practice you could avoid it and skip using `:8`.

## Enabling `HashedModuleIdsPlugin`

As you might remember, webpack uses number based IDs for the module code it generates. The problem is that they are difficult to work with and can lead to difficult to debug issues particularly with hashing. Like we did with the development setup earlier, we can perform a simplification here as well.

Webpack provides `HashedModuleIdsPlugin` that is like `NamedModulesPlugin` except it hashes the result and hides the path information. This keeps module IDs stable as they aren't derived based on order. We sacrifice a couple of bytes for a cleaner setup, but the trade-off is well worth it.

The change required is simple. Tweak the configuration as follows:

**webpack.config.js**

```javascript
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

...
```

As you can see in the build output, the difference is negligible:

```bash
Hash: e6f5b23a3f60d026cabc
Version: webpack 2.2.1
Time: 3678ms
                  Asset       Size  Chunks             Chunk Names
            4330d101.js  865 bytes       1  [emitted]  app
           11ec0064.svg   22 bytes          [emitted]
           674f50d2.eot     166 kB          [emitted]
          fee66e71.woff      98 kB          [emitted]
         af7ae505.woff2    77.2 kB          [emitted]
           85011118.png      77 kB          [emitted]
    scripts/ce7751bd.js  184 bytes       0  [emitted]
           b06871f2.ttf     166 kB          [emitted]
            04c743a4.js      25 kB       2  [emitted]  vendor
           eae1155e.css    46.8 kB       1  [emitted]  app
scripts/ce7751bd.js.map  821 bytes       0  [emitted]
        4330d101.js.map    6.54 kB       1  [emitted]  app
       eae1155e.css.map   89 bytes       1  [emitted]  app
        04c743a4.js.map     287 kB       2  [emitted]  vendor
             index.html  286 bytes          [emitted]
[1Q41] ./app/main.css 41 bytes {1} [built]
[2twT] ./app/index.js 557 bytes {1} [built]
[5W1q] ./~/font-awesome/css/font-awesome.css 41 bytes {1} [built]
...
```

Note how the output has changed, though. Instead of numbers, you can see hashes. But this is expected given the change we made.

## Conclusion

Even though the project generates hashes now, the output isn't flawless. The problem is that if the application changes, it will invalidate the vendor bundle as well. The next chapter digs deeper into the topic and shows you how to extract a manifest to resolve the issue.
