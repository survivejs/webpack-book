# Enabling Sourcemaps

![Sourcemaps in Chrome](images/sourcemaps.png)

To improve the debuggability of the application, we can set up sourcemaps for both code and styling. Sourcemaps allow you to see exactly where an error was raised. Webpack can generate both inline sourcemaps included within bundles or separate sourcemap files. The former is useful during development due to better performance while the latter is handy for production usage as it will keep the bundle size small.

I'll show you how to enable sourcemaps for JavaScript code next. It is a good idea to study the documentation of the loaders you are using to see specific tips. For example with TypeScript you may need to set a certain flag to make it to work.

## Enabling Sourcemaps During Development

To enable sourcemaps during development, we can use a decent default known as `eval-source-map` and for production we can use normal sourcemaps (separate file) like this:

**webpack.config.js**

```javascript
...

switch(process.env.npm_lifecycle_event) {
  case 'build':
    config = merge(
      common,
leanpub-start-insert
      {
        devtool: 'source-map'
      },
leanpub-end-insert
      parts.setupCSS(PATHS.app)
    );
  default:
    config = merge(
      common,
leanpub-start-insert
      {
        devtool: 'eval-source-map'
      },
leanpub-end-insert
      parts.setupCSS(PATHS.app),
      ...
    );
}

module.exports = validate(config);
```

`eval-source-map` builds slowly initially, but it provides fast rebuild speed and yields real files. Faster development specific options, such as `cheap-module-eval-source-map` and `eval`, produce lower quality sourcemaps. All `eval` options will emit sourcemaps as a part of your JavaScript code.

It is possible you may need to enable sourcemaps in your browser for this to work. See [Chrome](https://developer.chrome.com/devtools/docs/javascript-debugging), [Firefox](https://developer.mozilla.org/en-US/docs/Tools/Debugger/How_to/Use_a_source_map), [IE Edge](https://developer.microsoft.com/en-us/microsoft-edge/platform/documentation/f12-devtools-guide/debugger/#source-maps), and [Safari](https://developer.apple.com/library/safari/documentation/AppleApplications/Conceptual/Safari_Developer_Guide/ResourcesandtheDOM/ResourcesandtheDOM.html#//apple_ref/doc/uid/TP40007874-CH3-SW2) instructions for further details.

## Sourcemap Types Supported by Webpack

Even though a sourcemap type, such as `eval-source-map` or `eval`, can be enough during development, Webpack provides other types too. Given these will be generated within your bundles, they won't be useful during production.

The following table adapted from the [documentation](https://webpack.github.io/docs/configuration.html#devtool) contains the supported types arranged based on speed. The lower the quality, the higher build and rebuild speeds are possible.

|Sourcemap type                 |Quality                       |Notes                                                                                   |
|-------------------------------|------------------------------|----------------------------------------------------------------------------------------|
|`eval`                         |Generated code                |Each module is executed with `eval` and `//@ sourceURL`.                                |
|`cheap-eval-source-map`        |Transformed code (lines only) |Each module is executed with `eval` and a sourcemap is added as a dataurl to the `eval`.|
|`cheap-module-eval-source-map` |Original source (lines only)  |Same idea, but higher quality with lower performance.                                   |
|`eval-source-map`              |Original source               |Same idea, but highest quality and lowest performance.                                  |

You can start from `eval-source-map` and move to other options as it starts to feel too slow.

Webpack can also generate production usage friendly sourcemaps. These will end up in separate files and will be loaded by the browser only when required. This way your users get good performance while it's easier for you to debug the application. I've listed them in a similar way below.

|Sourcemap type            |Quality                       |Notes                                                                                  |
|--------------------------|------------------------------|---------------------------------------------------------------------------------------|
|`cheap-source-map`        |Transformed code (lines only) |Generated sourcemaps don't have column mappings. Sourcemaps from loaders are not used. |
|`cheap-module-source-map` |Original source (lines only)  |Same except sourcemaps from loaders are simplified to a single mapping per line.       |
|`source-map`              |Original source               |The best quality with the most complete result, but also the slowest.                  |

`source-map` is a good default here. Even though it will take longer to generate the sourcemaps this way, you will get the best quality. If you don't care about production sourcemaps, you can simply skip the setting there and get better performance in return.

There are a couple of other options that affect sourcemap generation:

```javascript
const config = {
  output: {
    // Modify the name of the generated sourcemap file.
    // You can use [file], [id], and [hash] replacements here.
    // The default option is enough for most use cases.
    sourceMapFilename: '[file].map', // Default

    // This is the sourcemap filename template. It's default format
    // depends on the devtool option used. You don't need to modify this
    // often.
    devtoolModuleFilenameTemplate: 'webpack:///[resource-path]?[loaders]'
  },
  ...
};
```

T> The [official documentation](https://webpack.github.io/docs/configuration.html#output-sourcemapfilename) digs into devtool specifics.

## `SourceMapDevToolPlugin`

If you want more control over sourcemap generation, it is possible to use the `SourceMapDevToolPlugin` instead. This way you can generate sourcemaps only for the portions of the code you want while having strict control over the result. In case you use the plugin, you can skip `devtool` option altogether.

Here's what it looks like in its entirety (adapted from [the official documentation](https://webpack.github.io/docs/list-of-plugins.html#sourcemapdevtoolplugin)):

```javascript
const config = {
  plugins: [
    new webpack.SourceMapDevToolPlugin({
      // Match assets just like for loaders.
      test: string | RegExp | Array,
      include: string | RegExp | Array,

      // `exclude` matches file names, not package names!
      exclude: string | RegExp | Array,

      // If filename is set, output to this file.
      // See `sourceMapFileName`.
      filename: string,

      // This line is appended to the original asset processed. For
      // instance '[url]' would get replaced with an url to the
      // sourcemap.
      append: false | string,

      // See `devtoolModuleFilenameTemplate` for specifics.
      moduleFilenameTemplate: string,
      fallbackModuleFilenameTemplate: string,

      module: bool, // If false, separate sourcemaps aren't generated.
      columns: bool, // If false, column mappings are ignored.

      // Use simpler line to line mappings for the matched modules.
      lineToLine: bool | {test, include, exclude}
    }),
    ...
  ],
  ...
};
```

## Sourcemaps for Styling

If you want to enable sourcemaps for styling files, you can achieve this using a query parameter. Loaders, such as *css-loader*, *sass-loader*, and *less-loader*, accept a `?sourceMap` (i.e, `css?sourceMap`).

This isn't without gotchas. The *css-loader* documentation notes that relative paths within CSS declarations are known to be buggy and suggests using setting an absolute public path (`output.publicPath`) resolving to the server url.

## Conclusion

Sourcemaps can be convenient during development. They provide us better means to debug our applications as we can still examine the original code over generated one. They can be useful even for production usage and allow you to debug issues while serving a client friendly version of your application.

Our build configuration isn't that sophisticated yet, though. I'll show you how to push it further in the next part as we discuss various build related techniques.
