# Separating a Manifest

When webpack writes bundles, it maintains a **manifest** as well. You can find it in the generated *vendor* bundle in this project. The manifest describes what files webpack should load. It is possible to extract it and start loading the files of our project faster instead of having to wait for the *vendor* bundle to be loaded.

This is the root of our problem. If the hashes webpack generates change, then the manifest will change as well. As a result, the contents of the vendor bundle will change and it will become invalidated. The problem can be eliminated by extracting the manifest to a file of its own or by writing it inline to the *index.html* of the project.

T> To understand how a manifest is generated in greater detail, [read the technical explanation at Stack Overflow](https://stackoverflow.com/questions/39548175/can-someone-explain-webpacks-commonschunkplugin/39600793).

## Extracting a Manifest

We have done most of the work already when we set up `extractBundles`. To extract the manifest, a single change is required:

**webpack.config.js**

```javascript
...

function production() {
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
    ...
  ]);
}

...
```

If you build the project now (`npm run build`), you should see something like this:

```bash
Hash: 4ca13abf0dfeaf38daa7
Version: webpack 2.2.1
Time: 3209ms
                                       Asset       Size  Chunks                    Chunk Names
                 app.de061a38d4efe81f14d9.js  710 bytes    2, 3  [emitted]         app
        912ec66d7572ff821749319396470bde.svg     444 kB          [emitted]  [big]
        674f50d287a8c48dc19ba404d20fe713.eot     166 kB          [emitted]  [big]
       fee66e712a8a08eef5805a46892932ad.woff      98 kB          [emitted]  [big]
      af7ae505a9eed503f8b8e6982036873e.woff2    77.2 kB          [emitted]  [big]
        9a0d8fb85dedfde24f1ab4cdb568ef2a.png    17.6 kB          [emitted]
             scripts/a749f8b7a6c990eff5b2.js  183 bytes    0, 3  [emitted]
              vendor.e9b7f566aa067b34ae88.js    20.1 kB    1, 3  [emitted]         vendor
        b06871f281fee6b241d60582ae9369b9.ttf     166 kB          [emitted]  [big]
            manifest.7985df88c95fffcba0a2.js    1.51 kB       3  [emitted]         manifest
    app.120a7f7c301f97a38df05725c2b1a453.css    3.53 kB    2, 3  [emitted]         app
         scripts/a749f8b7a6c990eff5b2.js.map  865 bytes    0, 3  [emitted]
          vendor.e9b7f566aa067b34ae88.js.map     249 kB    1, 3  [emitted]         vendor
             app.de061a38d4efe81f14d9.js.map    5.75 kB    2, 3  [emitted]         app
app.120a7f7c301f97a38df05725c2b1a453.css.map  117 bytes    2, 3  [emitted]         app
        manifest.7985df88c95fffcba0a2.js.map    14.1 kB       3  [emitted]         manifest
                                  index.html  428 bytes          [emitted]
[1Q41] ./app/main.css 41 bytes {2} [built]
[2twT] ./app/index.js 516 bytes {2} [built]
[4has] ./~/react/lib/ReactClass.js 26.5 kB {1} [built]
...
```

This simple change gave us a separate file that contains the manifest. Because we are using *html-webpack-plugin*, we don't have to worry about loading it ourselves as it adds a reference to the manifest to *index.html* for us.

Plugins, such as [inline-manifest-webpack-plugin](https://www.npmjs.com/package/inline-manifest-webpack-plugin) and [html-webpack-inline-chunk-plugin](https://www.npmjs.com/package/html-webpack-inline-chunk-plugin), [assets-webpack-plugin](https://www.npmjs.com/package/assets-webpack-plugin), work with *html-webpack-plugin* and allow you to write the manifest within *index.html* in order to avoid a request.

T> To get a better idea of the manifest contents, comment out `parts.minify()` and examine the resulting manifest. You should see something familiar there.

Try adjusting *app/index.js* and see how the hashes change. This time around it should **not** invalidate the vendor bundle, and only the manifest and app bundle names should be different like this:

```bash
Hash: 895308ab19f4b99357bd
Version: webpack 2.2.1
Time: 3425ms
                                       Asset       Size  Chunks                    Chunk Names
                 app.29ecc4e2e587bdf20f54.js  733 bytes    2, 3  [emitted]         app
        912ec66d7572ff821749319396470bde.svg     444 kB          [emitted]  [big]
        674f50d287a8c48dc19ba404d20fe713.eot     166 kB          [emitted]  [big]
       fee66e712a8a08eef5805a46892932ad.woff      98 kB          [emitted]  [big]
      af7ae505a9eed503f8b8e6982036873e.woff2    77.2 kB          [emitted]  [big]
        9a0d8fb85dedfde24f1ab4cdb568ef2a.png    17.6 kB          [emitted]
             scripts/a749f8b7a6c990eff5b2.js  183 bytes    0, 3  [emitted]
              vendor.e9b7f566aa067b34ae88.js    20.1 kB    1, 3  [emitted]         vendor
        b06871f281fee6b241d60582ae9369b9.ttf     166 kB          [emitted]  [big]
            manifest.339803870e3446a9198d.js    1.51 kB       3  [emitted]         manifest
    app.120a7f7c301f97a38df05725c2b1a453.css    3.53 kB    2, 3  [emitted]         app
         scripts/a749f8b7a6c990eff5b2.js.map  865 bytes    0, 3  [emitted]
          vendor.e9b7f566aa067b34ae88.js.map     249 kB    1, 3  [emitted]         vendor
             app.29ecc4e2e587bdf20f54.js.map    5.83 kB    2, 3  [emitted]         app
app.120a7f7c301f97a38df05725c2b1a453.css.map  117 bytes    2, 3  [emitted]         app
        manifest.339803870e3446a9198d.js.map    14.1 kB       3  [emitted]         manifest
                                  index.html  428 bytes          [emitted]
[1Q41] ./app/main.css 41 bytes {2} [built]
[2twT] ./app/index.js 537 bytes {2} [built]
[4has] ./~/react/lib/ReactClass.js 26.5 kB {1} [built]
...
```

T> In order to integrate with asset pipelines, you can consider using plugins like [chunk-manifest-webpack-plugin](https://www.npmjs.com/package/chunk-manifest-webpack-plugin), [webpack-manifest-plugin](https://www.npmjs.com/package/webpack-manifest-plugin), [webpack-assets-manifest](https://www.npmjs.com/package/webpack-assets-manifest), or [webpack-rails-manifest-plugin](https://www.npmjs.com/package/webpack-rails-manifest-plugin). These solutions emit JSON that maps the original asset path to the new one.

T> One more way to improve the build further would be to load popular dependencies, such as React, through a CDN. That would decrease the size of the vendor bundle even further while adding an external dependency on the project. The idea is that if the user has hit the CDN earlier, caching can kick in just like here.

## Using Records

As mentioned in the *Splitting Bundles* chapter, plugins such as `AggressiveSplittingPlugin` use **records** to implement caching. The approaches discussed above are still valid, but records go one step further.

Records are used for storing module IDs across separate builds. The gotcha is that you need to store this file some way. If you build locally, one option is to include it to your version control.

To generate a *records.json* file, adjust the configuration as follows:

```javascript
...

function production() {
  return merge([
    common,
    {
      ...
leanpub-start-insert
      recordsPath: 'records.json',
leanpub-end-insert
    },
    ...
  ]);
}

...
```

If you build the project (`npm run build`), you should see a new file, *records.json*, at the project root. The next time webpack builds, it will pick up the information and rewrite the file if it has changed.

Records are particularly useful if you have a complex setup with code splitting and want to make sure the split parts gain correct caching behavior. The biggest problem is maintaining the record file.

T> `recordsInputPath` and `recordsOutputPath` give more granular control over input and output, but often setting only `recordsPath` is enough.

## Conclusion

Our project has basic caching behavior now. If you try to modify *app.js* or *component.js*, the vendor bundle should remain the same. But what's contained in the build? You can figure that out by *Analyzing Build Statistics*, as we'll do in the next chapter.
