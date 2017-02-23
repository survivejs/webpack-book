# Separating a Manifest

When webpack writes bundles, it maintains a **manifest** as well. You can find it in the generated *vendor* bundle in this project. The manifest describes what files webpack should load. It is possible to extract it and start loading the files of our project faster instead of having to wait for the *vendor* bundle to be loaded.

This is the root of our problem. If the hashes webpack generates change, then the manifest will change as well. As a result, the contents of the vendor bundle will change and it will become invalidated. The problem can be eliminated by extracting the manifest to a file of its own or by writing it inline to the *index.html* of the project.

T> To understand how a manifest is generated in detail, [read the technical explanation at Stack Overflow](https://stackoverflow.com/questions/39548175/can-someone-explain-webpacks-commonschunkplugin/39600793).

## Extracting a Manifest

We have done most of the work already when we set up `extractBundles`. To extract the manifest, a single change is required:

**webpack.config.js**

```javascript
...

const productionConfig = merge([
  ...
  parts.extractBundles([
      {
        ...
      },
leanpub-start-insert
      {
        name: 'manifest',
        minChunks: Infinity,
      },
leanpub-end-insert
  ]),
  ...
]);

...
```

T> `minChunks` is optional in this case. Passing `Infinity` to it tells webpack **not** to move any modules to the resulting bundle.

If you build the project now (`npm run build`), you should see something like this:

```bash
Hash: 02314843647ee4f50d46
Version: webpack 2.2.1
Time: 3628ms
                   Asset       Size  Chunks             Chunk Names
         app.801b7672.js  882 bytes    2, 3  [emitted]  app
    ...font.11ec0064.svg   22 bytes          [emitted]
    ...font.674f50d2.eot     166 kB          [emitted]
   ...font.fee66e71.woff      98 kB          [emitted]
  ...font.af7ae505.woff2    77.2 kB          [emitted]
       logo.9a0d8fb8.png    17.6 kB          [emitted]
           0.a749f8b7.js  199 bytes    0, 3  [emitted]
      vendor.f80a9a7b.js    23.7 kB    1, 3  [emitted]  vendor
    ...font.b06871f2.ttf     166 kB          [emitted]
    manifest.fddd3c23.js    1.52 kB       3  [emitted]  manifest
        app.4d491c24.css    1.88 kB    2, 3  [emitted]  app
       0.a749f8b7.js.map  812 bytes    0, 3  [emitted]
  vendor.f80a9a7b.js.map     274 kB    1, 3  [emitted]  vendor
     app.801b7672.js.map    6.56 kB    2, 3  [emitted]  app
    app.4d491c24.css.map   93 bytes    2, 3  [emitted]  app
manifest.fddd3c23.js.map    14.2 kB       3  [emitted]  manifest
                        index.html  368 bytes          [emitted]
[1Q41] ./app/main.css 41 bytes {2} [built]
[2twT] ./app/index.js 557 bytes {2} [built]
[5W1q] ./~/font-awesome/css/font-awesome.css 41 bytes {2} [built]
...
```

This simple change gave us a separate file that contains the manifest. In the output above it has been marked with `manifest` chunk name. Because we are using *html-webpack-plugin*, we don't have to worry about loading the manifest ourselves as the plugin adds a reference to *index.html* for us.

Plugins, such as [inline-manifest-webpack-plugin](https://www.npmjs.com/package/inline-manifest-webpack-plugin) and [html-webpack-inline-chunk-plugin](https://www.npmjs.com/package/html-webpack-inline-chunk-plugin), [assets-webpack-plugin](https://www.npmjs.com/package/assets-webpack-plugin), work with *html-webpack-plugin* and allow you to write the manifest within *index.html* in order to avoid a request.

T> To get a better idea of the manifest contents, comment out `parts.minify()` and examine the resulting manifest. You should see something familiar there.

Try adjusting *app/index.js* and see how the hashes change. This time around it should **not** invalidate the vendor bundle, and only the manifest and app bundle names should be different like this:

```bash
Hash: 3c7635d30cf399aa8e12
Version: webpack 2.2.1
Time: 3783ms
                   Asset       Size  Chunks             Chunk Names
leanpub-start-insert
         app.48532ac8.js  901 bytes    2, 3  [emitted]  app
leanpub-end-insert
    ...font.11ec0064.svg   22 bytes          [emitted]
    ...font.674f50d2.eot     166 kB          [emitted]
   ...font.fee66e71.woff      98 kB          [emitted]
  ...font.af7ae505.woff2    77.2 kB          [emitted]
       logo.9a0d8fb8.png    17.6 kB          [emitted]
           0.a749f8b7.js  199 bytes    0, 3  [emitted]
      vendor.f80a9a7b.js    23.7 kB    1, 3  [emitted]  vendor
    ...font.b06871f2.ttf     166 kB          [emitted]
leanpub-start-insert
    manifest.03cc5a22.js    1.52 kB       3  [emitted]  manifest
leanpub-end-insert
        app.4d491c24.css    1.88 kB    2, 3  [emitted]  app
       0.a749f8b7.js.map  812 bytes    0, 3  [emitted]
  vendor.f80a9a7b.js.map     274 kB    1, 3  [emitted]  vendor
leanpub-start-insert
     app.48532ac8.js.map    6.62 kB    2, 3  [emitted]  app
leanpub-end-insert
    app.4d491c24.css.map   93 bytes    2, 3  [emitted]  app
leanpub-start-insert
manifest.03cc5a22.js.map    14.2 kB       3  [emitted]  manifest
leanpub-end-insert
            index.html  368 bytes          [emitted]
[1Q41] ./app/main.css 41 bytes {2} [built]
[2twT] ./app/index.js 578 bytes {2} [built]
[5W1q] ./~/font-awesome/css/font-awesome.css 41 bytes {2} [built]
...
```

T> In order to integrate with asset pipelines, you can consider using plugins like [chunk-manifest-webpack-plugin](https://www.npmjs.com/package/chunk-manifest-webpack-plugin), [webpack-manifest-plugin](https://www.npmjs.com/package/webpack-manifest-plugin), [webpack-assets-manifest](https://www.npmjs.com/package/webpack-assets-manifest), or [webpack-rails-manifest-plugin](https://www.npmjs.com/package/webpack-rails-manifest-plugin). These solutions emit JSON that maps the original asset path to the new one.

T> One more way to improve the build further would be to load popular dependencies, such as React, through a CDN. That would decrease the size of the vendor bundle even further while adding an external dependency on the project. The idea is that if the user has hit the CDN earlier, caching can kick in like here.

## Using Records

As mentioned in the *Splitting Bundles* chapter, plugins such as `AggressiveSplittingPlugin` use **records** to implement caching. The approaches discussed above are still valid, but records go one step further.

Records are used for storing module IDs across separate builds. The gotcha is that you need to store this file some way. If you build locally, one option is to include it to your version control.

To generate a *records.json* file, adjust the configuration as follows:

**webpack.config.js**

```javascript
...

const productionConfig = merge([
  {
    ...
leanpub-start-insert
    recordsPath: 'records.json',
leanpub-end-insert
  },
  ...
]);

...
```

If you build the project (`npm run build`), you should see a new file, *records.json*, at the project root. The next time webpack builds, it will pick up the information and rewrite the file if it has changed.

Records are particularly useful if you have a complex setup with code splitting and want to make sure the split parts gain correct caching behavior. The biggest problem is maintaining the record file.

T> `recordsInputPath` and `recordsOutputPath` give more granular control over input and output, but often setting only `recordsPath` is enough.

W> If you change the way webpack handles module IDs (i.e., remove `HashedModuleIdsPlugin`), possible existing records will still taken into account! If you want to use the new module ID scheme, you will have to remove your records file as well.

## Conclusion

Our project has basic caching behavior now. If you try to modify *app.js* or *component.js*, the vendor bundle should remain the same. But what's contained in the build? You can figure that out by *Analyzing Build Statistics*, as we'll do in the next chapter.
