# Separating a Manifest

When webpack writes bundles, it maintains a **manifest** as well. You can find it in the generated *vendor* bundle in this project. The manifest describes what files webpack should load. It's possible to extract it and start loading the files of the project faster instead of having to wait for the *vendor* bundle to be loaded.

If the hashes webpack generates change, then the manifest changes as well. As a result, the contents of the vendor bundle change, and become invalidated. The problem can be eliminated by extracting the manifest to a file of its own or by writing it inline to the *index.html* of the project.

## Extracting a Manifest

Most of the work was done already when `extractBundles` was set up in the *Bundle Splitting* chapter. To extract the manifest, define `optimization.runtimeChunk` as follows:

**webpack.config.js**

```javascript
const productionConfig = merge([
  ...
  {
    optimization: {
      splitChunks: {
        ...
      },
leanpub-start-insert
      runtimeChunk: {
        name: "manifest",
      },
leanpub-end-insert
    },
  },
  ...
]);
```

The name `manifest` is used by convention. You can use any other name, and it will still work.

If you build the project now (`npm run build`), you should see something:

```bash
Hash: aef6533295e5656c0377
Version: webpack 4.0.1
Time: 2577ms
Built at: 3/1/2018 3:15:20 PM
                    Asset       Size  Chunks             Chunk Names
      vendor.3dd53418.css   1.38 KiB       2  [emitted]  vendor
            0.554ab1b6.js  141 bytes       0  [emitted]
       vendor.0a4df2ff.js   97.6 KiB       2  [emitted]  vendor
         main.9043ef51.js  680 bytes       3  [emitted]  main
        main.d5d711b1.css   1.26 KiB       3  [emitted]  main
leanpub-start-insert
     manifest.3fd9a1eb.js   1.77 KiB       1  [emitted]  manifest
    manifest.d41d8cd9.css   64 bytes       1  [emitted]  manifest
manifest.d41d8cd9.css.map   98 bytes       1  [emitted]  manifest
leanpub-end-insert
  vendor.3dd53418.css.map   96 bytes       2  [emitted]  vendor
    main.d5d711b1.css.map   94 bytes       3  [emitted]  main
               index.html  472 bytes          [emitted]
Entrypoint main = manifest.3fd9a1eb.js manifest.d41d8cd9.css ...
[./src/index.js] ./src/index.js + 2 modules 807 bytes {3} [built]
       | ./src/index.js 193 bytes [built]
       | ./src/component.js 443 bytes [built]
       | ./src/shake.js 151 bytes [built]
...
```

This change gave a separate file that contains the manifest. In the output above it has been marked with `manifest` chunk name. Because the setup is using `HtmlWebpackPlugin`, there is no need to worry about loading the manifest ourselves as the plugin adds a reference to *index.html*.

Plugins, such as [inline-manifest-webpack-plugin](https://www.npmjs.com/package/inline-manifest-webpack-plugin) and [html-webpack-inline-chunk-plugin](https://www.npmjs.com/package/html-webpack-inline-chunk-plugin), [assets-webpack-plugin](https://www.npmjs.com/package/assets-webpack-plugin), work with `HtmlWebpackPlugin` and allow you to write the manifest within *index.html* to avoid a request.

Try adjusting *app/index.js* and see how the hashes change. This time around it should **not** invalidate the vendor bundle, and only the manifest and app bundle names should become different.

T> To get a better idea of the manifest contents, run the build in development mode or pass `none` to mode through configuration. You should see something familiar there.

T> To integrate with asset pipelines, you can consider using plugins like [chunk-manifest-webpack-plugin](https://www.npmjs.com/package/chunk-manifest-webpack-plugin), [webpack-manifest-plugin](https://www.npmjs.com/package/webpack-manifest-plugin), [webpack-assets-manifest](https://www.npmjs.com/package/webpack-assets-manifest), or [webpack-rails-manifest-plugin](https://www.npmjs.com/package/webpack-rails-manifest-plugin). These solutions emit JSON that maps the original asset path to the new one.

T> The build can be improved further by loading popular dependencies, such as React, through a CDN. That would decrease the size of the vendor bundle even further while adding an external dependency on the project. The idea is that if the user has hit the CDN earlier, caching can kick in like here.

## Using Records

As mentioned in the *Bundle Splitting* chapter, plugins such as `AggressiveSplittingPlugin` use **records** to implement caching. The approaches discussed above are still valid, but records go one step further.

Records are used for storing module IDs across separate builds. The problem is that you need to save this file. If you build locally, one option is to include it in your version control.

To generate a *records.json* file, adjust the configuration as follows:

**webpack.config.js**

```javascript
const productionConfig = merge([
  {
    ...
leanpub-start-insert
    recordsPath: path.join(__dirname, "records.json"),
leanpub-end-insert
  },
  ...
]);
```

If you build the project (`npm run build`), you should see a new file, *records.json*, at the project root. The next time webpack builds, it picks up the information and rewrites the file if it has changed.

Records are particularly valuable if you have a complicated setup with code splitting and want to make sure the split parts gain correct caching behavior. The biggest problem is maintaining the record file.

T> `recordsInputPath` and `recordsOutputPath` give more granular control over input and output, but often setting only `recordsPath` is enough.

W> If you change the way webpack handles module IDs (i.e., remove `HashedModuleIdsPlugin`), possible existing records are still taken into account! If you want to use the new module ID scheme, you have to delete your records file as well.

{pagebreak}

## Conclusion

The project has basic caching behavior now. If you try to modify *app.js* or *component.js*, the vendor bundle should remain the same.

To recap:

* Webpack maintains a **manifest** containing information needed to run the application.
* If the manifest changes, the change invalidates the containing bundle.
* Certain plugins allow you to write the manifest to the generated *index.html*. It's also possible to extract the information to a JSON file. The JSON comes in handy with *Server Side Rendering*.
* **Records** allow you to store module IDs across builds. As a downside, you have to track the records file.

You'll learn to analyze the build in the next chapter as it's essential for understanding and improving your build.
