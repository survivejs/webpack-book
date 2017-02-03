# Separating a Manifest

When webpack writes bundles, it writes something known as a **manifest** as well. You can find it in the generated *vendor* bundle in this project. The manifest describes what files webpack should load. It is possible to extract it and start loading the files of our project faster instead of having to wait for the *vendor* bundle to be loaded.

This is the root of our problem. If the hashes webpack generates change, then the manifest will change as well. As a result, the contents of the vendor bundle will change and it will become invalidated. The problem can be eliminated by extracting the manifest to a file of its own or by writing it inline to the *index.html* of the project.

T> To understand how a manifest is generated in greater detail, [read the technical explanation at Stack Overflow](https://stackoverflow.com/questions/39548175/can-someone-explain-webpacks-commonschunkplugin/39600793).

## Extracting a Manifest

We have done most of the work already when we set up `extractBundles`. To extract the manifest, a single change is required:

**webpack.config.js**

```javascript
...

module.exports = function(env) {
  if (env === 'production') {
    return merge([
      ...
      parts.extractBundles({
        bundles: [
          {
            name: 'vendor',
            entries: ['react'],
          },
leanpub-start-insert
          {
            name: 'manifest',
          },
leanpub-end-insert
        ]
      }),
      parts.generateSourceMaps({ type: 'source-map' }),
      ...
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

This simple change gave us a separate file that contains the manifest. Because we are using *html-webpack-plugin*, we don't have to worry about loading it ourselves as it adds a reference to the manifest to *index.html* for us.

Plugins, such as [inline-manifest-webpack-plugin](https://www.npmjs.com/package/inline-manifest-webpack-plugin) and [html-webpack-inline-chunk-plugin](https://www.npmjs.com/package/html-webpack-inline-chunk-plugin), [assets-webpack-plugin](https://www.npmjs.com/package/assets-webpack-plugin), work with *html-webpack-plugin* and allow you to write the manifest within *index.html* in order to avoid a request.

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

Records are used for storing module ids across separate builds. The gotcha is that you need to store this file some way. If you build locally, one option is to include it to your version control.

To generate a *records.json* file, adjust the configuration as follows:

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
