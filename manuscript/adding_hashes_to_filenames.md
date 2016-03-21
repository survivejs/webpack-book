# Adding Hashes to Filenames

Webpack provides placeholders that can be used to access different types of hashes and entry name as we saw before. The most useful ones are:

* `[name]` - Returns entry name.
* `[hash]` - Returns build hash.
* `[chunkhash]` - Returns a chunk specific hash.

Using these placeholders you could end up with filenames, such as:

```bash
app.d587bbd6e38337f5accd.js
vendor.dc746a5db4ed650296e1.js
```

If the file contents are different, the hash will change as well, thus invalidating the cache, or more accurately the browser will send a new request for the new file. This means if only `app` bundle gets updated, only that file needs to be requested again.

T> An alternative way to achieve the same would be to generate static filenames and invalidate the cache through a querystring (i.e., `app.js?d587bbd6e38337f5accd`). The part behind the question mark will invalidate the cache. This method is not recommended. According to [Steve Souders](http://www.stevesouders.com/blog/2008/08/23/revving-filenames-dont-use-querystring/), attaching the hash to the filename is a more performant way to go.

## Setting Up Hashing

We can use the placeholder idea within our configuration like this:

**webpack.config.js**

```javascript
if(TARGET === 'build') {
  module.exports = merge(common, {
    // Define vendor entry point needed for splitting
    entry: {
      ...
    },
leanpub-start-insert
    output: {
      path: PATHS.build,
      filename: '[name].[chunkhash].js',
      chunkFilename: '[chunkhash].js'
    },
leanpub-end-insert
    plugins: [
      ...
    ]
  });
}
```

If you execute `npm run build` now, you should see output like this.

```bash
> webpack

Hash: d3d5126c92fb895721d8
Version: webpack 1.12.14
Time: 4014ms
                           Asset       Size  Chunks             Chunk Names
     app.d14aa423d1a0702976f0.js    3.99 kB    0, 2  [emitted]  app
  vendor.81bcf80e75a5333783c4.js     131 kB    1, 2  [emitted]  vendor
manifest.b7ada7656f01f38ce8d4.js  763 bytes       2  [emitted]  manifest
   [0] ./app/index.js 187 bytes {0} [built]
   [0] multi vendor 28 bytes {1} [built]
 [157] ./app/component.js 136 bytes {0} [built]
    + 156 hidden modules
```

Our files have neat hashes now. To prove that it works, you could try altering *app/index.js* and include a `console.log` there. After you build, only `app` and `manifest` related bundles should change.

One more way to improve the build further would be to load popular dependencies, such as React, through a CDN. That would decrease the size of the vendor bundle even further while adding an external dependency on the project. The idea is that if the user has hit the CDN earlier, caching can kick in just like here.

## Conclusion

Adding hashes to our filenames brings a new problem. If a hash changes, we still have possible older files within our output directory. To eliminate this problem, we can set up a little plugin to clean it up for us.
