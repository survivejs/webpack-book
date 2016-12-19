# Adding Hashes to Filenames

Webpack relies on the concept of **placeholders**. These strings are used to attach specific information to webpack output. The most useful ones are:

* `[path]` - Returns an entry path.
* `[name]` - Returns an entry name.
* `[hash]` - Returns the build hash.
* `[chunkhash]` - Returns a chunk specific hash.

T> If you want shorter hashes, it is possible to slice `hash` and `chunkhash` using `:` syntax like this: `[chunkhash:8]`. Instead of a hash like `8c4cbfdb91ff93f3f3c5` this would yield `8c4cbfdb`.

## Using Placeholders

Assuming we have configuration like this:

```javascript
{
  output: {
    path: PATHS.build,
    filename: '[name].[chunkhash].js',
  }
}
```

We can generate filenames like these:

```bash
app.d587bbd6e38337f5accd.js
vendor.dc746a5db4ed650296e1.js
```

If the file contents related to a chunk are different, the hash will change as well, thus invalidating the cache. More accurately, the browser will send a new request for the new file. This means if only `app` bundle gets updated, only that file needs to be requested again.

An alternative way to achieve the same result would be to generate static filenames and invalidate the cache through a querystring (i.e., `app.js?d587bbd6e38337f5accd`). The part behind the question mark will invalidate the cache.

This method is not recommended, though as according to [Steve Souders](http://www.stevesouders.com/blog/2008/08/23/revving-filenames-dont-use-querystring/), attaching the hash to the filename is the more performant way to go.

## Setting Up Hashing

We have already split our application into `app.js` and `vendor.js` bundles and set up a separate `manifest` that bootstraps it. To get the hashing behavior we are after, we should generate `app.d587bbd6e38337f5accd.js` and `vendor.dc746a5db4ed650296e1.js` kind of files instead.

To make the setup work, our configuration is missing one vital part, the placeholders. Include them to the production configuration as follows:

**webpack.config.js**

```javascript
...

module.exports = function(env) {
  if (env === 'build') {
    return merge(
      common,
      {
leanpub-start-delete
        devtool: 'source-map'
leanpub-end-delete
leanpub-start-insert
        devtool: 'source-map',
        output: {
          path: PATHS.build,
          filename: '[name].[chunkhash].js',
          // This is used for code splitting. The setup
          // will work without but this is useful to set.
          chunkFilename: '[chunkhash].js'
        }
leanpub-end-insert
      },
      ...
    };
  }

  ...
};
```

If you execute `npm run build` now, you should see output like this.

```bash
Hash: 295e44e81d90cb11f12d
Version: webpack 2.2.0-rc.1
Time: 1223ms
                           Asset       Size  Chunks           Chunk Names
  vendor.6fcd8ee954db093c19c0.js    19.7 kB  0, 2[emitted]  vendor
     app.5caccf3ee1ca2f876fe1.js    4.06 kB  1, 2[emitted]  app
manifest.9236efcd5974e259d881.js    1.42 kB  2[emitted]  manifest
                      index.html  357 bytes  [emitted]
  [15] ./app/component.js 136 bytes {1} [built]
  [16] ./app/main.css 904 bytes {1} [built]
  [17] ./~/css-loader!./app/main.css 190 bytes {1} [built]
  [32] ./app/index.js 124 bytes {1} [built]
  [33] multi vendor 28 bytes {0} [built]
    + 29 hidden modules
Child html-webpack-plugin for "index.html":
        + 4 hidden modules
```

Our files have neat hashes now. To prove that it works, you could try altering *app/index.js* and include a `console.log` there. After you build, only `app` and `manifest` related bundles should change.

One more way to improve the build further would be to load popular dependencies, such as React, through a CDN. That would decrease the size of the vendor bundle even further while adding an external dependency on the project. The idea is that if the user has hit the CDN earlier, caching can kick in just like here.

## Conclusion

Even though our project has neat caching behavior now, adding hashes to our filenames brings a new problem. If a hash changes, we still have possible older files within our output directory. To eliminate this problem, we can set up a little plugin to clean it up for us.
