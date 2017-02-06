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
        ...
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
Hash: 7d69e56e15c0ff4de8e9
Version: webpack 2.2.1
Time: 3189ms
                                       Asset       Size  Chunks                    Chunk Names
                 app.a91508ab473aa1d86275.js  661 bytes       1  [emitted]         app
        674f50d287a8c48dc19ba404d20fe713.eot     166 kB          [emitted]  [big]
        b06871f281fee6b241d60582ae9369b9.ttf     166 kB          [emitted]  [big]
      af7ae505a9eed503f8b8e6982036873e.woff2    77.2 kB          [emitted]  [big]
       fee66e712a8a08eef5805a46892932ad.woff      98 kB          [emitted]  [big]
        9a0d8fb85dedfde24f1ab4cdb568ef2a.png    17.6 kB          [emitted]
             scripts/a21c703122450f17fd1e.js  179 bytes       0  [emitted]
        912ec66d7572ff821749319396470bde.svg     444 kB          [emitted]  [big]
              vendor.c9cd359e613c2baa00f8.js      21 kB       2  [emitted]         vendor
    app.120a7f7c301f97a38df05725c2b1a453.css    3.53 kB       1  [emitted]         app
         scripts/a21c703122450f17fd1e.js.map  850 bytes       0  [emitted]
             app.a91508ab473aa1d86275.js.map    5.68 kB       1  [emitted]         app
app.120a7f7c301f97a38df05725c2b1a453.css.map  117 bytes       1  [emitted]         app
          vendor.c9cd359e613c2baa00f8.js.map     261 kB       2  [emitted]         vendor
                                  index.html  349 bytes          [emitted]
   [4] ./~/object-assign/index.js 2.11 kB {2} [built]
   [5] ./~/react/react.js 56 bytes {2} [built]
  [15] ./app/component.js 517 bytes {1} [built]
...
```

Our files have neat hashes now. To prove that it works for styling, you could try altering *app/main.css* and see what happens to the hashes when you rebuild.

There's one problem, though. If you change the application code, it will invalidate the vendor file as well! Solving this requires extracting a **manifest**, but before that we can improve the way the production build handles module ids.

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
        ...
leanpub-start-insert
        plugins: [
          new webpack.HashedModuleIdsPlugin(),
        ],
leanpub-end-insert
      },
      ...
    ]);
  }

  ...
};
```

As you can see in the build output, the difference is negligible.

```bash
Hash: 51205fe13806e1a8cce1
Version: webpack 2.2.1
Time: 3196ms
                                       Asset       Size  Chunks                    Chunk Names
                 app.dea407139c1cb7bd9c1f.js  708 bytes       1  [emitted]         app
        912ec66d7572ff821749319396470bde.svg     444 kB          [emitted]  [big]
        674f50d287a8c48dc19ba404d20fe713.eot     166 kB          [emitted]  [big]
       fee66e712a8a08eef5805a46892932ad.woff      98 kB          [emitted]  [big]
      af7ae505a9eed503f8b8e6982036873e.woff2    77.2 kB          [emitted]  [big]
        9a0d8fb85dedfde24f1ab4cdb568ef2a.png    17.6 kB          [emitted]
             scripts/ce7751bddf1a96fd3916.js  181 bytes       0  [emitted]
        b06871f281fee6b241d60582ae9369b9.ttf     166 kB          [emitted]  [big]
              vendor.3f6cbf6cbd880986491e.js    21.5 kB       2  [emitted]         vendor
    app.120a7f7c301f97a38df05725c2b1a453.css    3.53 kB       1  [emitted]         app
         scripts/ce7751bddf1a96fd3916.js.map  858 bytes       0  [emitted]
             app.dea407139c1cb7bd9c1f.js.map    5.74 kB       1  [emitted]         app
app.120a7f7c301f97a38df05725c2b1a453.css.map  117 bytes       1  [emitted]         app
          vendor.3f6cbf6cbd880986491e.js.map     262 kB       2  [emitted]         vendor
                                  index.html  349 bytes          [emitted]
[1Q41] ./app/main.css 41 bytes {1} [built]
[2twT] ./app/index.js 516 bytes {1} [built]
[4has] ./~/react/lib/ReactClass.js 26.5 kB {2} [built]
...
```

Note how the output has changed, though. Instead of numbers, you can see hashes. But this is expected given the change we made.

## Conclusion

Even though the project generates hashes now, the output isn't flawless. The problem is that if the application changes, it will invalidate the vendor bundle as well. The next chapter digs deeper into the topic and shows you how to extract a manifest to resolve the issue.
