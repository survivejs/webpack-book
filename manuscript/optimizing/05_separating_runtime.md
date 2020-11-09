# Separating a Runtime

When webpack writes bundles, it maintains a **runtime** as well. The runtime includes a manifest of the files to be loaded initially. If the names of the files change, then the manifest changes and the change invalidates the file in which it is contained.

For this reason, it can be a good idea to write the runtime to a file of its own or inline the manifest information to the `index.html` file of the project.

## Extracting a runtime

Most of the work was done already when `extractBundles` was set up in the _Bundle Splitting_ chapter. To extract the runtime, define `optimization.runtimeChunk` as follows:

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
        name: "runtime",
      },
leanpub-end-insert
    },
  },
]);
```

The name `runtime` is used by convention. You can use any other name, and it will still work.

If you build the project now (`npm run build`), you should see something:

```bash
⬡ webpack: Build Finished
⬡ webpack: assets by path *.js 130 KiB
    asset vendor.1622.js 126 KiB [emitted] [immutable] [minimized] (name: vendor) (id hint: commons) 2 related assets
    asset runtime.41f8.js 3.01 KiB [emitted] [immutable] [minimized] (name: runtime) 2 related assets
    asset main.eddd.js 633 bytes [emitted] [immutable] [minimized] (name: main) 2 related assets
    asset 34.a4c5.js 257 bytes [emitted] [immutable] [minimized] 2 related assets
  asset main.aca1.css 1.87 KiB [emitted] [immutable] (name: main)
  asset index.html 324 bytes [emitted]
...
  webpack 5.1.3 compiled successfully in 7209 ms
```

This change gave a separate file that contains the runtime. In the output above it has been marked with `runtime` chunk name. As the setup is using `MiniHtmlWebpackPlugin`, there is no need to worry about loading the runtime ourselves as the plugin adds a reference to `index.html`.

Try adjusting `src/index.js` and see how the hashes change. This time around it should **not** invalidate the vendor bundle, and only the runtime and app bundle names should become different.

Starting from webpack 5, the tool will take your browserslist definition into account when generating the runtime. See the _Autoprefixing_ chapter for an expanded discussion. In webpack 5, it's possible to use `target` to define in which format the runtime is written. Setting it to `es5` would emit ECMAScript 5 compatible code while setting to `es2015` would generate shorter code for the newer target. The setting also affects the _Minifying_ process.

T> To get a better idea of the runtime contents, run the build in development mode or pass `none` to mode through configuration. You should see something familiar there.

## Using records

As hinted in the _Bundle Splitting_ chapter, `AggressiveSplittingPlugin` and others use **records** to implement caching. The approaches discussed above are still valid, but records go one step further.

Records are used for storing module IDs across separate builds. The problem is that you need to save this file. If you build locally, one option is to include it in your version control.

To generate a `records.json` file, adjust the configuration as follows:

**webpack.config.js**

```javascript
leanpub-start-insert
const path = require('path');
leanpub-end-insert

...

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

If you build the project (`npm run build`), you should see a new file, `records.json`, at the project root. The next time webpack builds, it picks up the information and rewrites the file if it has changed.

Records are particularly valuable if you have a complicated setup with code splitting and want to make sure the split parts gain correct caching behavior. The biggest problem is maintaining the record file.

T> `recordsInputPath` and `recordsOutputPath` give more granular control over input and output, but often setting only `recordsPath` is enough.

W> If you change the way webpack handles module IDs, possible existing records are still taken into account! If you want to use the new module ID scheme, you have to delete your records file as well.

## Integrating with asset pipelines

To integrate with asset pipelines, you can consider using plugins like [webpack-manifest-plugin](https://www.npmjs.com/package/webpack-manifest-plugin), or [webpack-assets-manifest](https://www.npmjs.com/package/webpack-assets-manifest). These solutions emit JSON that maps the original asset path to the new one.

## Conclusion

The project has basic caching behavior now. If you try to modify `index.js` or `component.js`, the vendor bundle should remain the same.

To recap:

- Webpack maintains a **runtime** containing information needed to run the application.
- If the runtime manifest changes, the change invalidates the containing bundle.
- Certain plugins allow you to write the runtime to the generated `index.html`. It's also possible to extract the information to a JSON file. The JSON comes in handy with _Server-Side Rendering_.
- **Records** allow you to store module IDs across builds. As a downside, you have to track the records file.

You'll learn to analyze the build in the next chapter as it's essential for understanding and improving your build.
