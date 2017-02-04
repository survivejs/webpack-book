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

There are a few places in the build we need to tweak to generate proper hashes. The production branch of the main configuration needs a tweak so that the output gets hashed per entry using `chunkhash`:

**webpack.config.js**

```javascript
...
module.exports = function(env) {
  if (env === 'production') {
    return merge([
      common,
      {
        performance: {
          hints: 'warning', // 'error' or false are valid too
          maxEntrypointSize: 200000, // in bytes
          maxAssetSize: 200000, // in bytes
        },
leanpub-start-insert
        output: {
          chunkFilename: 'scripts/[chunkhash].js',
          filename: '[name].[chunkhash].js',
        },
leanpub-end-insert
      },
      parts.clean(PATHS.build),
      ...
    ]);
  }

  ...
};
```

If we used `chunkhash` for the extracted CSS as well, this would lead to problems as our code points to the CSS through JavaScript bringing it to the same entry. That means if the application code or CSS changed, it would validate both. Therefore instead of `chunkhash`, we can use `contenthash` that's generated based on the extracted content:

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
      new ExtractTextPlugin('[name].[contenthash].css'),
leanpub-end-insert
    ],
  };
};

...
```

If you generate a build now (`npm run build`), you should see something like this:

```bash
Hash: b28400513ee1f3cc4b58
Version: webpack 2.2.0
Time: 2361ms
                                       Asset       Size  Chunks             Chunk Names
             scripts/a3e8b000643b89a4baf0.js  179 bytes       0  [emitted]
                 app.0463c61541fc45af4e1d.js  612 bytes       1  [emitted]  app
              vendor.0088a151dee083233d21.js    21.1 kB       2  [emitted]  vendor
    app.581584c83549d8a12e1752ef1aab2cb8.css    2.23 kB       1  [emitted]  app
         scripts/a3e8b000643b89a4baf0.js.map  850 bytes       0  [emitted]
             app.0463c61541fc45af4e1d.js.map    5.31 kB       1  [emitted]  app
app.581584c83549d8a12e1752ef1aab2cb8.css.map  117 bytes       1  [emitted]  app
          vendor.0088a151dee083233d21.js.map     261 kB       2  [emitted]  vendor
                                  index.html  391 bytes          [emitted]
   [5] ./~/react/react.js 56 bytes {2} [built]
  [15] ./app/component.js 504 bytes {1} [built]
  [16] ./app/main.css 41 bytes {1} [built]
...
```

Our files have neat hashes now. To prove that it works for styling, you could try altering *app/main.css* and see what happens to the hashes when you rebuild.

There's one problem, though. If you change the application code, it will invalidate the vendor file as well! Solving this requires extracting something known as a **manifest**, but before that we can improve the way the production build handles module ids.

## Enabling `HashedModuleIdsPlugin`

As you might remember, webpack uses number based ids for the module code it generates. The problem is that they are difficult to work with and can lead to difficult to debug issues particularly with hashing. Just as we did with the development setup earlier, we can perform a simplification here as well.

Webpack provides `HashedModuleIdsPlugin` that is like `NamedModulesPlugin` except it hashes the result and hides the path information. This keeps module ids stable as they aren't derived based on order. We sacrifice a few bytes for a cleaner setup, but the trade-off is well worth it.

The change required is simple. Tweak the configuration as follows:

**webpack.config.js**

```javascript
...

module.exports = function(env) {
  if (env === 'production') {
    return merge([
      common,
      {
        performance: {
          hints: 'warning', // 'error' or false are valid too
          maxEntrypointSize: 100000, // in bytes
          maxAssetSize: 50000, // in bytes
        },
        output: {
          chunkFilename: 'scripts/[chunkhash].js',
          filename: '[name].[chunkhash].js',
        },
leanpub-start-insert
        plugins: [
          new webpack.HashedModuleIdsPlugin(),
        ],
leanpub-end-insert
      },
      parts.setFreeVariable(
        'process.env.NODE_ENV',
        'production'
      ),
      ...
    ]);
  }

  ...
};
```

As you can see in the build output, the difference is negligible.

```bash
Hash: b2f4e0352d585455643d
Version: webpack 2.2.0
Time: 2407ms
                                       Asset       Size  Chunks             Chunk Names
             scripts/ce7751bddf1a96fd3916.js  181 bytes       0  [emitted]
                 app.a6c5ea36c65dd4a199a2.js  651 bytes       1  [emitted]  app
              vendor.e4b418854dc5baf0b331.js    21.5 kB       2  [emitted]  vendor
    app.581584c83549d8a12e1752ef1aab2cb8.css    2.23 kB       1  [emitted]  app
         scripts/ce7751bddf1a96fd3916.js.map  858 bytes       0  [emitted]
             app.a6c5ea36c65dd4a199a2.js.map    5.36 kB       1  [emitted]  app
app.581584c83549d8a12e1752ef1aab2cb8.css.map  117 bytes       1  [emitted]  app
          vendor.e4b418854dc5baf0b331.js.map     262 kB       2  [emitted]  vendor
                                  index.html  391 bytes          [emitted]
[1Q41] ./app/main.css 41 bytes {1} [built]
[2twT] ./app/index.js 591 bytes {1} [built]
[3imu] ./~/react/lib/ReactPureComponent.js 1.32 kB {2} [built]
...
```

Note how the output has changed, though. Instead of numbers, you can see hashes. But this is expected given the change we made.

## Conclusion

Even though the project generates hashes now, the output isn't flawless. The problem is that if the application changes, it will invalidate the vendor bundle as well. This happens because of something known as a manifest. The next chapter digs deeper into the topic and shows you how to extract it to resolve the issue.
