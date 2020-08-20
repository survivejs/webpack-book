# Separating a Runtime

When webpack writes bundles, it maintains a **runtime** as well. The runtime includes a manifest of the files to be loaded initially. If the names of the files change, then the manifest changes and the change invalidates the file in which it is contained.

For this reason, it can be a good idea to write the runtime to a file of its own or inline the manifest information to the _index.html_ file of the project.

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
Hash: 78dfb4662ef4977a2fde
Version: webpack 4.43.0
Time: 3641ms
Built at: 07/10/2020 4:10:48 PM
          Asset       Size  Chunks                         Chunk Names
      3.b965.js  191 bytes       3  [emitted] [immutable]
     index.html  324 bytes          [emitted]
  main.0166.css   1.61 KiB       0  [emitted] [immutable]  main
   main.8406.js  580 bytes       0  [emitted] [immutable]  main
leanpub-start-insert
runtime.b241.js   2.29 KiB       1  [emitted] [immutable]  runtime
leanpub-end-insert
 vendor.3be8.js    126 KiB       2  [emitted] [immutable]  vendor
Entrypoint main = runtime.b241.js vendor.3be8.js main.0166.css main.8406.js
...
```

This change gave a separate file that contains the runtime. In the output above it has been marked with `runtime` chunk name. Because the setup is using `MiniHtmlWebpackPlugin`, there is no need to worry about loading the manifest ourselves as the plugin adds a reference to _index.html_.

Try adjusting _src/index.js_ and see how the hashes change. This time around it should **not** invalidate the vendor bundle, and only the runtime and app bundle names should become different.

T> Starting from webpack 5, it's possible to use `output.ecmaVersion` to define in which format the runtime is written. Setting it to `5` would emit ECMAScript 5 compatible code while setting to `2015` would generate shorter code for the newer target. The setting also affects the _Minifying_ process.

T> To get a better idea of the runtime contents, run the build in development mode or pass `none` to mode through configuration. You should see something familiar there.

T> The build can be improved further by loading popular dependencies, such as React, through a CDN. That would decrease the size of the vendor bundle even further while adding an external dependency on the project. The idea is that if the user has hit the CDN earlier, caching can kick in like here.

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

{pagebreak}

If you build the project (`npm run build`), you should see a new file, _records.json_, at the project root. The next time webpack builds, it picks up the information and rewrites the file if it has changed.

Records are particularly valuable if you have a complicated setup with code splitting and want to make sure the split parts gain correct caching behavior. The biggest problem is maintaining the record file.

T> `recordsInputPath` and `recordsOutputPath` give more granular control over input and output, but often setting only `recordsPath` is enough.

W> If you change the way webpack handles module IDs, possible existing records are still taken into account! If you want to use the new module ID scheme, you have to delete your records file as well.

## Integrating with asset pipelines

To integrate with asset pipelines, you can consider using plugins like [webpack-manifest-plugin](https://www.npmjs.com/package/webpack-manifest-plugin), or [webpack-assets-manifest](https://www.npmjs.com/package/webpack-assets-manifest). These solutions emit JSON that maps the original asset path to the new one.

{pagebreak}

## Conclusion

The project has basic caching behavior now. If you try to modify _index.js_ or _component.js_, the vendor bundle should remain the same.

To recap:

- Webpack maintains a **runtime** containing information needed to run the application.
- If the runtime manifest changes, the change invalidates the containing bundle.
- Certain plugins allow you to write the runtime to the generated _index.html_. It's also possible to extract the information to a JSON file. The JSON comes in handy with _Server-Side Rendering_.
- **Records** allow you to store module IDs across builds. As a downside, you have to track the records file.

You'll learn to analyze the build in the next chapter as it's essential for understanding and improving your build.
