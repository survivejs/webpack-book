# Adding Hashes to Filenames

Even though our build generates fine now, the naming it uses is a little problematic. It doesn't allow us to leverage client level cache effectively as there's no easy way to tell whether or not a file has changed. Cache invalidation can be achieved by including a hash to filenames.

Webpack provides **placeholders** for this purpose. These strings are used to attach specific information to webpack output. The most useful ones are:

* `[path]` - Returns the file path.
* `[name]` - Returns the file name.
* `[ext]` - Returns the extension.
* `[hash]` - Returns the build hash.
* `[chunkhash]` - Returns a chunk specific hash.
* `[contenthash]` - Returns a hash specific to content. This is available for `ExtractTextPlugin` only.

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

There are a few places in the build we need to tweak to generate proper hashes. The production branch of the main configuration needs a tweak:

**webpack.config.js**

```javascript
...
module.exports = function(env) {
  if (env === 'production') {
    return merge([
      common,
      {
        output: {
leanpub-start-insert
          chunkFilename: 'scripts/[chunkhash].js',
          filename: '[name].[chunkhash].js',
leanpub-end-insert

          // Tweak this to match your GitHub project name
          publicPath: '/webpack-demo/',
        },
      },
      parts.clean(PATHS.build),
      ...
    ]);
  }

  ...
};
```

To make the extracted CSS pick up a hash, we should set `contenthash` for it. We cannot use `chunkhash` given it is derived based on the entry and the CSS of the project belongs to the same entry chunk as the application code.

This means a change made to the application code would invalidate CSS hash as well or vice versa. Instead, relying on a hash generated based on the CSS content is a stable way to go.

**webpack.parts.js**

```javascript
...

exports.extractCSS = function(paths) {
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
        output: {
          chunkFilename: 'scripts/[chunkhash].js',
          filename: '[name].[chunkhash].js',

          // Tweak this to match your GitHub project name
          publicPath: '/webpack-demo/',
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

## Separating a Manifest

When webpack writes bundles, it writes something known as a **manifest** as well. You can find it in the generated *vendor* bundle in this project. The manifest describes what files webpack should load. It is possible to extract it and start loading the files of our project faster instead of having to wait for the *vendor* bundle to be loaded.

This is the root of our problem. If the hashes webpack generates change, then the manifest will change as well. As a result, the contents of the vendor bundle will change and it will become invalidated. The problem can be eliminated by extracting the manifest to a file of its own or by writing it inline to the *index.html* of the project.

T> To understand how a manifest is generated in greater detail, [read the technical explanation at Stack Overflow](https://stackoverflow.com/questions/39548175/can-someone-explain-webpacks-commonschunkplugin/39600793).

### Extracting a Manifest

We have done most of the work already when we set up `extractBundles`. To extract the manifest, a single change is required:

**webpack.config.js**

```javascript
...

module.exports = function(env) {
  if (env === 'production') {
    return merge([
      ...
      parts.extractBundles([
        {
          name: 'vendor',
          entries: ['react'],
        },
leanpub-start-insert
        {
          name: 'manifest',
        },
leanpub-end-insert
      ]),
      parts.generateSourcemaps('source-map'),
      parts.lintJavaScript({ paths: PATHS.app }),
      parts.extractCSS(),
      parts.purifyCSS(
        glob.sync(path.join(PATHS.app, '*'))
      ),
    ]);
  }

  ...
};
```

If you build the project now (`npm run build`), you should see something like this:

```bash
Hash: 0a76a94d8d4b0e5663c1
Version: webpack 2.2.0
Time: 2391ms
                                       Asset       Size  Chunks             Chunk Names
         scripts/a749f8b7a6c990eff5b2.js.map  865 bytes    0, 3  [emitted]
             scripts/a749f8b7a6c990eff5b2.js  183 bytes    0, 3  [emitted]
                 app.4f0c0cbd6f41c9bb18af.js  653 bytes    2, 3  [emitted]  app
            manifest.c8e56c8521a89cb22c6f.js    1.53 kB       3  [emitted]  manifest
    app.581584c83549d8a12e1752ef1aab2cb8.css    2.23 kB    2, 3  [emitted]  app
              vendor.e9b7f566aa067b34ae88.js    20.1 kB    1, 3  [emitted]  vendor
          vendor.e9b7f566aa067b34ae88.js.map     249 kB    1, 3  [emitted]  vendor
             app.4f0c0cbd6f41c9bb18af.js.map    5.36 kB    2, 3  [emitted]  app
app.581584c83549d8a12e1752ef1aab2cb8.css.map  117 bytes    2, 3  [emitted]  app
        manifest.c8e56c8521a89cb22c6f.js.map    14.1 kB       3  [emitted]  manifest
                                  index.html  484 bytes          [emitted]
[1Q41] ./app/main.css 41 bytes {2} [built]
[2twT] ./app/index.js 591 bytes {2} [built]
[3imu] ./~/react/lib/ReactPureComponent.js 1.32 kB {1} [built]
...
```

This simple change gave us a separate file that contains the manifest. Given we are using *html-webpack-plugin*, it generates a reference to *index.html* automatically so we don't have to worry about loading it.

Plugins, such as [inline-manifest-webpack-plugin](https://www.npmjs.com/package/inline-manifest-webpack-plugin) and [html-webpack-inline-chunk-plugin](https://www.npmjs.com/package/html-webpack-inline-chunk-plugin), work with *html-webpack-plugin* and allow you to write the manifest within *index.html* in order to avoid a request.

T> To get a better idea of the manifest contents, comment out `parts.minify()` and examine the resulting manifest. You should see something familiar there.

Try adjusting *app/index.js* and see how the hashes change. This time around it should **not** invalidate the vendor bundle, and only the manifest and app bundle names should be different like this:

```bash
Hash: a8a9c6cca7360f1c485b
Version: webpack 2.2.0
Time: 2546ms
                                       Asset       Size  Chunks             Chunk Names
         scripts/a749f8b7a6c990eff5b2.js.map  865 bytes    0, 3  [emitted]
             scripts/a749f8b7a6c990eff5b2.js  183 bytes    0, 3  [emitted]
                 app.78b72e65a8da23867cd4.js  673 bytes    2, 3  [emitted]  app
            manifest.263a1718ddc308cec749.js    1.53 kB       3  [emitted]  manifest
    app.581584c83549d8a12e1752ef1aab2cb8.css    2.23 kB    2, 3  [emitted]  app
              vendor.e9b7f566aa067b34ae88.js    20.1 kB    1, 3  [emitted]  vendor
          vendor.e9b7f566aa067b34ae88.js.map     249 kB    1, 3  [emitted]  vendor
             app.78b72e65a8da23867cd4.js.map    5.44 kB    2, 3  [emitted]  app
app.581584c83549d8a12e1752ef1aab2cb8.css.map  117 bytes    2, 3  [emitted]  app
        manifest.263a1718ddc308cec749.js.map    14.1 kB       3  [emitted]  manifest
                                  index.html  484 bytes          [emitted]
[1Q41] ./app/main.css 41 bytes {2} [built]
[2twT] ./app/index.js 613 bytes {2} [built]
[3imu] ./~/react/lib/ReactPureComponent.js 1.32 kB {1} [built]
...
```

T> In order to integrate with asset pipelines, you can consider using plugins like [chunk-manifest-webpack-plugin](https://www.npmjs.com/package/chunk-manifest-webpack-plugin), [webpack-manifest-plugin](https://www.npmjs.com/package/webpack-manifest-plugin), [webpack-assets-manifest](https://www.npmjs.com/package/webpack-assets-manifest), or [webpack-rails-manifest-plugin](https://www.npmjs.com/package/webpack-rails-manifest-plugin). These solutions emit JSON that maps the original asset path to the new one.

T> One more way to improve the build further would be to load popular dependencies, such as React, through a CDN. That would decrease the size of the vendor bundle even further while adding an external dependency on the project. The idea is that if the user has hit the CDN earlier, caching can kick in just like here.

## Using Records

As mentioned in the *Splitting Bundles* chapter, plugins such as `AggressiveSplittingPlugin` use **records** to implement caching. The approaches discussed above are still valid, but records go one step further.

Records are used for storing module ids across separate build. The gotcha is that you need to store this file some way. If you build locally, one option is to include it to your version control.

To generate a *records.json* file, adjust the configuration as follows:

```javascript
...

module.exports = function(env) {
  if (env === 'production') {
    return merge([
      common,
      {
        output: {
          chunkFilename: 'scripts/[chunkhash].js',
          filename: '[name].[chunkhash].js',

          // Tweak this to match your GitHub project name
          publicPath: '/webpack-demo/',
        },
        plugins: [
          new webpack.HashedModuleIdsPlugin(),
        ],
leanpub-start-insert
        recordsPath: 'records.json',
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

If you build the project (`npm run build`), you should see a new file, *records.json*, at the project root. The next time webpack builds, it will pick up the information and rewrite the file if it has changed.

Records are particularly useful if you have a complex setup with code splitting and want to make sure the split parts gain correct caching behavior. The biggest problem is maintaining the record file.

T> `recordsInputPath` and `recordsOutputPath` give more granular control over input and output, but often setting only `recordsPath` is enough.

## Conclusion

Our project has basic caching behavior now. If you try to modify *app.js* or *component.js*, the vendor bundle should remain the same. But what's contained in the build? You can figure that out by *Analyzing Build Statistics*, as we'll do in the next chapter.
