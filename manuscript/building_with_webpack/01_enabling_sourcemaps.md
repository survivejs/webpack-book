# Enabling Sourcemaps

![Sourcemaps in Chrome](images/sourcemaps.png)

To improve the debuggability of the application, we can set up sourcemaps for both code and styling. Sourcemaps allow you to see exactly where an error was raised. This makes them particularly valuable during development.

One approach is to simply skip sourcemaps during development and rely on browser support of language features. This works particularly if you use ES6 without any extensions and develop using a modern browser. The great advantage of doing this is that you avoid all the problems related to sourcemaps while gaining better performance.

## Inline Sourcemaps and Separate Sourcemaps

Webpack can generate both inline sourcemaps included within bundles or separate sourcemap files. The former are useful during development due to better performance while the latter are handy for production usage as it will keep the bundle size small. In this case, loading sourcemaps becomes optional.

You may **not** want to generate a sourcemap for your production bundle as this makes it easy to inspect your application (it depends on whether you want this or not; it is good for staging). Simply skip the `devtool` field then or generate hidden variant. Skipping sourcemaps entirely also speeds up your build a notch as generating sourcemaps at the best quality can be a heavy operation.

Hidden sourcemaps give trace information only. You can connect them with a monitoring service to get traces as the application crashes allowing you to fix the problematic situations. This isn't ideal, but it's better to know about possible problems than not.

T> It is a good idea to study the documentation of the loaders you are using to see loader specific tips. For example, with TypeScript, you may need to set a certain flag to make it work as you expect.

## Enabling Sourcemaps

Webpack provides two ways to enable sourcemaps. There's a shortcut field known as `devtool`. There's also a plugin that gives more options to tweak. We'll discuss the plugin briefly in the end of this chapter.

To get started, we can wrap the basic idea within a configuration part. You can convert this to use the plugin later if you want:

**webpack.parts.js**

```javascript
...

exports.generateSourcemaps = function(type) {
  return {
    devtool: type,
  };
};
```

Webpack supports a wide variety of sourcemap types. These vary based on quality and build speed. For now, we can enable `eval-source-map` for development and `source-map` for production. This way we get good quality while trading off performance, especially during development.

`eval-source-map` builds slowly initially, but it provides fast rebuild speed. Faster development specific options, such as `cheap-module-eval-source-map` and `eval`, produce lower quality sourcemaps. All `eval` options will emit sourcemaps as a part of your JavaScript code.

`source-map` is the slowest and highest quality option of them all, but that's fine for a production build.

You can set these up as follows:

**webpack.config.js**

```javascript
...

module.exports = function(env) {
  if (env === 'production') {
    return merge([
      common,
leanpub-start-insert
      parts.generateSourcemaps('source-map'),
leanpub-end-insert
      parts.lintJavaScript({ paths: PATHS.app }),
      parts.extractCSS(),
      parts.purifyCSS(PATHS.app),
    ]);
  }

  return merge([
    common,
    {
      plugins: [
        new webpack.NamedModulesPlugin(),
      ],
    },
leanpub-start-insert
    parts.generateSourcemaps('eval-source-map'),
leanpub-end-insert
    parts.devServer({
      // Customize host/port here if needed
      host: process.env.HOST,
      port: process.env.PORT,
    }),
    ...
  ]);
};
```

If you build the project now (`npm run build`), you should see something like this:

```bash
Hash: a2231eda28272b4c83d5
Version: webpack 2.2.0
Time: 1671ms
      Asset       Size  Chunks             Chunk Names
     app.js     4.4 kB       0  [emitted]  app
    app.css     2.2 kB       0  [emitted]  app
 app.js.map    4.21 kB       0  [emitted]  app
app.css.map   84 bytes       0  [emitted]  app
 index.html  218 bytes          [emitted]
   [0] ./app/component.js 172 bytes {0} [built]
   [1] ./app/main.css 41 bytes {0} [built]
   [2] ./~/purecss/build/pure-min.css 41 bytes {0} [built]
   [3] ./app/index.js 566 bytes {0} [built]
```

Take a good look at those *.map* files. That's where the mapping between the generated and the original source happens. During development, it will write the mapping information within the bundle itself.

### Enabling Sourcemaps on Browsers

To use sourcemaps on browsers, you may need to enable sourcemaps explicitly. I've listed reference per browser below:

* [Chrome](https://developer.chrome.com/devtools/docs/javascript-debugging)
* [Firefox](https://developer.mozilla.org/en-US/docs/Tools/Debugger/How_to/Use_a_source_map)
* [IE Edge](https://developer.microsoft.com/en-us/microsoft-edge/platform/documentation/f12-devtools-guide/debugger/#source-maps)
* [Safari](https://developer.apple.com/library/safari/documentation/AppleApplications/Conceptual/Safari_Developer_Guide/ResourcesandtheDOM/ResourcesandtheDOM.html#//apple_ref/doc/uid/TP40007874-CH3-SW2)

W> Sometimes sourcemaps [might not update in Chrome inspector](https://github.com/webpack/webpack/issues/2478). For now, the temporary fix is to force the inspector to reload itself by using *alt-r*.

W> If you want to use breakpoints (i.e., a `debugger;` statement or ones set through the browser), the `eval`-based options won't work in Chrome!

## Sourcemap Types Supported by Webpack

The following table adapted from the [documentation](https://webpack.js.org/configuration/devtool/#devtool) contains the supported types arranged based on speed. The lower the quality, the higher build and rebuild speeds are possible. It may take some experimentation to find the options that make the most sense for you.

|Sourcemap type                 |Quality                       |Notes                                                                                   |
|-------------------------------|------------------------------|----------------------------------------------------------------------------------------|
|`eval`                         |Generated code                |Each module is executed with `eval` and `//@ sourceURL`.                                |
|`cheap-eval-source-map`        |Transformed code (lines only, no column mappings!) |Each module is executed with `eval` and a sourcemap is added as a dataurl to the `eval`.|
|`cheap-module-eval-` `source-map` |Original source (lines only)  |Same idea, but higher quality with lower performance.                                   |
|`eval-source-map`              |Original source               |Same idea, but highest quality and lowest performance.                                  |

You can start from `eval-source-map` and move to other options as it starts to feel too slow.

Webpack can also generate production usage friendly sourcemaps. These will end up in separate files and will be loaded by the browser only when required. This way your users get good performance while it's easier for you to debug the application. I've listed them in a similar way below.

|Sourcemap type            |Quality                       |Notes                                                                                  |
|--------------------------|------------------------------|---------------------------------------------------------------------------------------|
|`cheap-source-map`        |Transformed code (lines only) |Generated sourcemaps don't have column mappings. Sourcemaps from loaders, such as *css-loader*, are not used. |
|`cheap-module-source-map` |Original source (lines only)  |Same except sourcemaps from loaders are simplified to a single mapping per line.       |
|`source-map`              |Original source               |The best quality with the most complete result, but also the slowest.                  |
|`hidden-source-map`       |Original without a reference | Use this if you don't want to expose sourcemaps to development tools while getting proper stack traces.

`source-map` is a good default here. Even though it will take longer to generate the sourcemaps this way, you will get the best quality. If you don't care about production sourcemaps, you can simply skip the setting there and get better performance in return.

There are a couple of other options that affect sourcemap generation:

```javascript
{
  output: {
    // Modify the name of the generated sourcemap file.
    // You can use [file], [id], and [hash] replacements here.
    // The default option is enough for most use cases.
    sourceMapFilename: '[file].map', // Default

    // This is the sourcemap filename template. It's default
    // format depends on the devtool option used. You don't
    // need to modify this often.
    devtoolModuleFilenameTemplate: 'webpack:///[resource-path]?[loaders]'
  },
}
```

T> The [official documentation](https://webpack.js.org/configuration/output/#output-sourcemapfilename) digs into `output` specifics.

W> If you are using any `UglifyJsPlugin` and want sourcemaps, you need to enable `sourceMap: true` for the plugin. Otherwise, the result won't be what you might expect.

## SourceMapDevToolPlugin

If you want more control over sourcemap generation, it is possible to use the `SourceMapDevToolPlugin` instead. This way you can generate sourcemaps only for the portions of the code you want while having strict control over the result. In case you use the plugin, you can skip `devtool` option altogether.

You could model a configuration part for the plugin like this (adapted from [the official documentation](https://webpack.github.io/docs/list-of-plugins.html#sourcemapdevtoolplugin)):

```javascript
exports.generateSourcemaps = function(options) {
  const test = options.test;
  const include = options.include;
  const separateSourcemaps = options.separateSourcemaps;
  const columnMappings = options.columnMappings;

  // Enable functionality as you want to expose it
  return {
    plugins: [
      new webpack.SourceMapDevToolPlugin({
        // Match assets just like for loaders.
        test: test, // string | RegExp | Array,
        include: include, // string | RegExp | Array,

        // `exclude` matches file names, not package names!
        // exclude: string | RegExp | Array,

        // If filename is set, output to this file.
        // See `sourceMapFileName`.
        // filename: string,

        // This line is appended to the original asset processed.
        // For instance '[url]' would get replaced with an url
        // to the sourcemap.
        // append: false | string,

        // See `devtoolModuleFilenameTemplate` for specifics.
        // moduleFilenameTemplate: string,
        // fallbackModuleFilenameTemplate: string,

        // If false, separate sourcemaps aren't generated.
        module: separateSourcemaps,

        // If false, column mappings are ignored.
        columns: columnMappings,

        // Use simpler line to line mappings for the matched modules.
        // lineToLine: bool | {test, include, exclude},

        // Remove source content from sourcemaps. This is useful
        // especially if your sourcemaps are very big (over 10 MB)
        // as browsers can struggle with those.
        // See https://github.com/webpack/webpack/issues/2669.
        // noSources: bool,
      }),
    ],
  };
};
```

Given webpack matches only `.js` and `.css` files by default for sourcemaps, you can use `SourceMapDevToolPlugin` to overcome this issue. This can be achieved by passing a `test` pattern like `/\.(js|jsx|css)($|\?)/i`.

## Using Dependency Sourcemaps

Assuming you are using a package that uses inline sourcemaps in its distribution, you can use [source-map-loader](https://www.npmjs.com/package/source-map-loader) to make webpack aware of them. Without setting it up against the package, you will get minified debug output. This is a special case, though, and often you can skip this step.

## Sourcemaps for Styling

If you want to enable sourcemaps for styling files, you can achieve this by enabling the `sourceMap` option. This works with style loaders such as *css-loader*, *sass-loader*, and *less-loader*.

This isn't without gotchas. The *css-loader* documentation notes that relative paths within CSS declarations are known to be buggy and suggests using setting an absolute public path (`output.publicPath`) resolving to the server url.

## Conclusion

Sourcemaps can be convenient during development. They provide us with better means to debug our applications as we can still examine the original code over a generated one. They can be useful even for production usage and allow you to debug issues while serving a client-friendly version of your application.
