# Adding Hashes to Filenames

Webpack relies on the concept of **placeholders**. These strings are used to attach specific information to Webpack output. The most useful ones are:

* `[path]` - Returns an entry path.
* `[name]` - Returns an entry name.
* `[hash]` - Returns the build hash.
* `[chunkhash]` - Returns a chunk specific hash.

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

An alternative way to achieve the same result would be to generate static filenames and invalidate the cache through a querystring (i.e., `app.js?d587bbd6e38337f5accd`). The part behind the question mark will invalidate the cache. This method is not recommended, though. According to [Steve Souders](http://www.stevesouders.com/blog/2008/08/23/revving-filenames-dont-use-querystring/), attaching the hash to the filename is the more performant way to go.

## Setting Up Hashing

We have already split our application into `app.js` and `vendor.js` bundles and set up a separate `manifest` that bootstraps it. To get the hashing behavior we are after, we should generate `app.d587bbd6e38337f5accd.js` and `vendor.dc746a5db4ed650296e1.js` kind of files instead.

To make the setup work, our configuration is missing one vital part, the placeholders. Include them to the production configuration as follows:

**webpack.config.js**

```javascript
...

// Detect how npm is run and branch based on that
switch(process.env.npm_lifecycle_event) {
  case 'build':
    config = merge(
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
          // This is used for require.ensure. The setup
          // will work without but this is useful to set.
          chunkFilename: '[chunkhash].js'
        }
leanpub-end-insert
      },
      ...
    );
    break;
  default:
    ...
}

module.exports = validate(config);
```

If you execute `npm run build` now, you should see output like this.

```bash
[webpack-validator] Config is valid.
Hash: 77395b0652b78e910b14
Version: webpack 1.13.0
Time: 2679ms
                               Asset       Size  Chunks             Chunk Names
         app.81e040e8c3dcc71d5624.js    3.96 kB    0, 2  [emitted]  app
      vendor.21dc91b20c0b1e6e16a1.js    21.4 kB    1, 2  [emitted]  vendor
    manifest.9e0e3d4035bea9b56f55.js  821 bytes       2  [emitted]  manifest
     app.81e040e8c3dcc71d5624.js.map    30.8 kB    0, 2  [emitted]  app
  vendor.21dc91b20c0b1e6e16a1.js.map     274 kB    1, 2  [emitted]  vendor
manifest.9e0e3d4035bea9b56f55.js.map    8.78 kB       2  [emitted]  manifest
                          index.html  288 bytes          [emitted]
   [0] ./app/index.js 123 bytes {0} [built]
   [0] multi vendor 28 bytes {1} [built]
  [36] ./app/component.js 136 bytes {0} [built]
    + 35 hidden modules
Child html-webpack-plugin for "index.html":
        + 3 hidden modules
```

Our files have neat hashes now. To prove that it works, you could try altering *app/index.js* and include a `console.log` there. After you build, only `app` and `manifest` related bundles should change.

One more way to improve the build further would be to load popular dependencies, such as React, through a CDN. That would decrease the size of the vendor bundle even further while adding an external dependency on the project. The idea is that if the user has hit the CDN earlier, caching can kick in just like here.

## Conclusion

Even though our project has neat caching behavior now, adding hashes to our filenames brings a new problem. If a hash changes, we still have possible older files within our output directory. To eliminate this problem, we can set up a little plugin to clean it up for us.
