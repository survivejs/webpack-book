# Source Maps

![Source maps in Chrome](images/sourcemaps.png)

When your source code has gone through any transformations, debugging becomes a problem. When debugging in a browser, how to tell where the original code is? **Source maps** solve this problem by providing a mapping between the original and the transformed source code. In addition to source compiling to JavaScript, this works for styling as well.

One approach is to simply skip source maps during development and rely on browser support of language features. If you use ES6 without any extensions and develop using a modern browser, this can work. The advantage of doing this is that you avoid all the problems related to source maps while gaining better performance.

T> If you want to understand the ideas behind source maps in greater detail, [read Ryan Seddon's introduction to the topic](https://www.html5rocks.com/en/tutorials/developertools/sourcemaps/).

## Inline Source Maps and Separate Source Maps

Webpack can generate both inline source maps included within bundles or separate source map files. The former are valuable during development due to better performance while the latter are handy for production usage as it keeps the bundle size small. In this case, loading source maps is optional.

It's possible you **don't** want to generate a source map for your production bundle as this makes it effortless to inspect your application. By disabling them you are performing a sort of obfuscation. Whether or not you want to enable source maps for production, they are handy for staging. Skipping source maps entirely speeds up your build as generating source maps at the best quality can be a complex operation.

**Hidden source maps** give stack trace information only. You can connect them with a monitoring service to get traces as the application crashes allowing you to fix the problematic situations. While this isn't ideal, it's better to know about possible problems than not.

T> It's a good idea to study the documentation of the loaders you are using to see loader specific tips. For example, with TypeScript, you have to set a particular flag to make it work as you expect.

## Enabling Source Maps

Webpack provides two ways to enable source maps. There's a `devtool` shortcut field. You can also find two plugins that give more options to tweak. The plugins are be discussed briefly at the end of this chapter. Beyond webpack, you also have to enable support for source maps at the browsers you are using for development.

{pagebreak}

### Enabling Source Maps in Webpack

To get started, you can wrap the core idea within a configuration part. You can convert this to use the plugins later if you want:

**webpack.parts.js**

```javascript
exports.generateSourceMaps = ({ type }) => ({
  devtool: type,
});
```

Webpack supports a wide variety of source map types. These vary based on quality and build speed. For now, you can enable `eval-source-map` for development and `source-map` for production. This way you get good quality while trading off performance, especially during development.

Set these up as follows:

**webpack.config.js**

```javascript
const productionConfig = merge([
leanpub-start-insert
  parts.generateSourceMaps({ type: 'source-map' }),
leanpub-end-insert
  ...
]);

const developmentConfig = merge([
leanpub-start-insert
  {
    output: {
      devtoolModuleFilenameTemplate: 'webpack:///[absolute-resource-path]',
    },
  },
  parts.generateSourceMaps({ type: 'cheap-module-source-map' }),
leanpub-end-insert
  ...
]);
```

`eval-source-map` builds slowly initially, but it provides fast rebuild speed. More rapid development specific options, such as `cheap-module-source-map` and `eval`, produce lower quality source maps. All `eval` options emit source maps as a part of your JavaScript code.

`source-map` is the slowest and highest quality option of them all, but that's fine for a production build.

If you build the project now (`npm run build`), you should see source maps in the output:

```bash
Hash: 79905cd66e14d3455b7d
Version: webpack 2.2.1
Time: 2817ms
        Asset       Size  Chunks                    Chunk Names
     logo.png      77 kB          [emitted]
  ...font.eot     166 kB          [emitted]
...font.woff2    77.2 kB          [emitted]
 ...font.woff      98 kB          [emitted]
  ...font.svg     444 kB          [emitted]  [big]
  ...font.ttf     166 kB          [emitted]
       app.js    4.46 kB       0  [emitted]         app
      app.css    3.89 kB       0  [emitted]         app
leanpub-start-insert
   app.js.map    4.15 kB       0  [emitted]         app
  app.css.map   84 bytes       0  [emitted]         app
leanpub-end-insert
   index.html  218 bytes          [emitted]
   [0] ./app/component.js 272 bytes {0} [built]
   [1] ./~/font-awesome/css/font-awesome.css 41 bytes {0} [built]
   [2] ./app/main.css 41 bytes {0} [built]
...
```

Take a good look at those *.map* files. That's where the mapping between the generated and the original source happens. During development, it writes the mapping information in the bundle itself.

### Enabling Source Maps in Browsers

To use source maps within a browser, you have to enable source maps explicitly as per browser-specific instructions:

* [Chrome](https://developer.chrome.com/devtools/docs/javascript-debugging). Sometimes source maps [will not update in Chrome inspector](https://github.com/webpack/webpack/issues/2478). For now, the temporary fix is to force the inspector to reload itself by using *alt-r*.
* [Firefox](https://developer.mozilla.org/en-US/docs/Tools/Debugger/How_to/Use_a_source_map)
* [IE Edge](https://developer.microsoft.com/en-us/microsoft-edge/platform/documentation/f12-devtools-guide/debugger/#source-maps)
* [Safari](https://developer.apple.com/library/safari/documentation/AppleApplications/Conceptual/Safari_Developer_Guide/ResourcesandtheDOM/ResourcesandtheDOM.html#//apple_ref/doc/uid/TP40007874-CH3-SW2)

W> If you want to use breakpoints (i.e., a `debugger;` statement or ones set through the browser), the `eval`-based options won't work in Chrome!

## Source Map Types Supported by Webpack

Source map types supported by webpack can be split into two categories:

* **Inline** source maps add the mapping data directly to the generated files.
* **Separate** source maps emit the mapping data to separate source map files and link the original source to them using a comment. Hidden source maps omit the comment on purpose.

Thanks to their speed, inline source maps are ideal for development. Given they make the bundles big, separate source maps are the preferable solution for production. Separate source maps work during development as well if the performance overhead is acceptable.

{pagebreak}

## Inline Source Map Types

Webpack provides multiple inline source map variants. Often `eval` is the starting point and [webpack issue #2145](https://github.com/webpack/webpack/issues/2145#issuecomment-294361203) recommends `cheap-module-source-map` with `output.devtoolModuleFilenameTemplate: 'webpack:///[absolute-resource-path]'` as it's a good compromise between speed and quality while working reliably in Chrome and Firefox browsers.

To get a better idea of the available options, they are listed below while providing a small example for each. The source code contains only a single `console.log('Hello world')` and `webpack.NamedModulesPlugin` is used to keep the output easier to understand. In practice, you would see a lot more code to handle the mapping.

T> `webpack.NamedModulesPlugin` replaces number based module IDs with paths. It's discussed in the *Hot Module Replacement* appendix.

### `devtool: 'eval'`

`eval` generates code in which each module is wrapped within an `eval` function:

```javascript
webpackJsonp([1, 2], {
  "./app/index.js": function(module, exports) {
    eval("console.log('Hello world');\n\n//////////////////\n// WEBPACK FOOTER\n// ./app/index.js\n// module id = ./app/index.js\n// module chunks = 1\n\n//# sourceURL=webpack:///./app/index.js?")
  }
}, ["./app/index.js"]);
```

{pagebreak}

### `devtool: 'cheap-eval-source-map'`

`cheap-eval-source-map` goes a step further and it includes base64 encoded version of the code as a data url. The result includes only line data while losing column mappings.

```javascript
webpackJsonp([1, 2], {
  "./app/index.js": function(module, exports) {
    eval("console.log('Hello world');//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9hcHAvaW5kZXguanMuanMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9hcHAvaW5kZXguanM/MGUwNCJdLCJzb3VyY2VzQ29udGVudCI6WyJjb25zb2xlLmxvZygnSGVsbG8gd29ybGQnKTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL2FwcC9pbmRleC5qc1xuLy8gbW9kdWxlIGlkID0gLi9hcHAvaW5kZXguanNcbi8vIG1vZHVsZSBjaHVua3MgPSAxIl0sIm1hcHBpbmdzIjoiQUFBQSIsInNvdXJjZVJvb3QiOiIifQ==")
  }
}, ["./app/index.js"]);
```

If you decode that base64 string, you get output containing the mapping:

```json
{
  "file": "./app/index.js.js",
  "mappings": "AAAA",
  "sourceRoot": "",
  "sources": [
    "webpack:///./app/index.js?0e04"
  ],
  "sourcesContent": [
    "console.log('Hello world');\n\n\n//////////////////\n// WEBPACK FOOTER\n// ./app/index.js\n// module id = ./app/index.js\n// module chunks = 1"
  ],
  "version": 3
}
```

{pagebreak}

### `devtool: 'cheap-module-eval-source-map'`

`cheap-module-eval-source-map` is the same idea, except with higher quality and lower performance:

```javascript
webpackJsonp([1, 2], {
  "./app/index.js": function(module, exports) {
    eval("console.log('Hello world');//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9hcHAvaW5kZXguanMuanMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vYXBwL2luZGV4LmpzPzIwMTgiXSwic291cmNlc0NvbnRlbnQiOlsiY29uc29sZS5sb2coJ0hlbGxvIHdvcmxkJyk7XG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIGFwcC9pbmRleC5qcyJdLCJtYXBwaW5ncyI6IkFBQUEiLCJzb3VyY2VSb290IjoiIn0=")
  }
}, ["./app/index.js"]);
```

Again, decoding the data reveals more:

```json
{
  "file": "./app/index.js.js",
  "mappings": "AAAA",
  "sourceRoot": "",
  "sources": [
    "webpack:///app/index.js?2018"
  ],
  "sourcesContent": [
    "console.log('Hello world');\n\n\n// WEBPACK FOOTER //\n// app/index.js"
  ],
  "version": 3
}
```

In this particular case, the difference between the options is minimal.

{pagebreak}

### `devtool: 'eval-source-map'`

`eval-source-map` is the highest quality option of the inline options. It's also the slowest one as it emits the most data:

```javascript
webpackJsonp([1, 2], {
  "./app/index.js": function(module, exports) {
    eval("console.log('Hello world');//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9hcHAvaW5kZXguanM/ZGFkYyJdLCJuYW1lcyI6WyJjb25zb2xlIiwibG9nIl0sIm1hcHBpbmdzIjoiQUFBQUEsUUFBUUMsR0FBUixDQUFZLGFBQVoiLCJmaWxlIjoiLi9hcHAvaW5kZXguanMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zb2xlLmxvZygnSGVsbG8gd29ybGQnKTtcblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9hcHAvaW5kZXguanMiXSwic291cmNlUm9vdCI6IiJ9")
  }
}, ["./app/index.js"]);
```

This time around there's more mapping data available for the browser:

```json
{
  "file": "./app/index.js.js",
  "mappings": "AAAAA,QAAQC,GAAR,CAAY,aAAZ",
  "names": [
    "console",
    "log"
  ],
  "sourceRoot": "",
  "sources": [
    "webpack:///./app/index.js?dadc"
  ],
  "sourcesContent": [
    "console.log('Hello world');\n\n\n// WEBPACK FOOTER //\n// ./app/index.js"
  ],
  "version": 3
}
```

{pagebreak}

## Separate Source Map Types

Webpack can also generate production usage friendly source maps. These end up in separate files ending with `.map` extension and are loaded by the browser only when required. This way your users get good performance while it's easier for you to debug the application.

`source-map` is a good default here. Even though it takes longer to generate the source maps this way, you get the best quality. If you don't care about production source maps, you can simply skip the setting there and get better performance in return.

### `devtool: 'cheap-source-map'`

`cheap-source-map` is similar to the cheap options above. The result is going to miss column mappings. Also, source maps from loaders, such as *css-loader*, are not going to be used.

Examining the `.map` file reveals the following output in this case:

```json
{
  "file": "app.9aff3b1eced1f089ef18.js",
  "mappings": "AAAA",
  "sourceRoot": "",
  "sources": [
    "webpack:///app.9aff3b1eced1f089ef18.js"
  ],
  "sourcesContent": [
    "webpackJsonp([1,2],{\"./app/index.js\":function(o,n){console.log(\"Hello world\")}},[\"./app/index.js\"]);\n\n\n// WEBPACK FOOTER //\n// app.9aff3b1eced1f089ef18.js"
  ],
  "version": 3
}
```

The original source contains `//# sourceMappingURL=app.9a...18.js.map` kind of comment at its end to map to this file.

### `devtool: 'cheap-module-source-map'`

`cheap-module-source-map` is the same as previous except source maps from loaders are simplified to a single mapping per line. It yields the following output in this case:

```json
{
  "file": "app.9aff3b1eced1f089ef18.js",
  "mappings": "AAAA",
  "sourceRoot": "",
  "sources": [
    "webpack:///app.9aff3b1eced1f089ef18.js"
  ],
  "version": 3
}
```

W> `cheap-module-source-map` is [currently broken if minification is used](https://github.com/webpack/webpack/issues/4176) and this is a good reason to avoid the option for now.

{pagebreak}

### `devtool: 'source-map'`

`source-map` provides the best quality with the complete result, but it's also the slowest option. The output reflects this:

```json
{
  "file": "app.9aff3b1eced1f089ef18.js",
  "mappings": "AAAAA,cAAc,EAAE,IAEVC,iBACA,SAAUC,EAAQC,GCHxBC,QAAQC,IAAI,kBDST",
  "names": [
    "webpackJsonp",
    "./app/index.js",
    "module",
    "exports",
    "console",
    "log"
  ],
  "sourceRoot": "",
  "sources": [
    "webpack:///app.9aff3b1eced1f089ef18.js",
    "webpack:///./app/index.js"
  ],
  "sourcesContent": [
    "webpackJsonp([1,2],{\n\n/***/ \"./app/index.js\":\n/***/ (function(module, exports) {\n\nconsole.log('Hello world');\n\n/***/ })\n\n},[\"./app/index.js\"]);\n\n\n// WEBPACK FOOTER //\n// app.9aff3b1eced1f089ef18.js",
    "console.log('Hello world');\n\n\n// WEBPACK FOOTER //\n// ./app/index.js"
  ],
  "version": 3
}
```

{pagebreak}

### `devtool: 'hidden-source-map'`

`hidden-source-map` is the same as `source-map` except it doesn't write references to the source maps to the source files. If you don't want to expose source maps to development tools directly while you want proper stack traces, this is handy.

T> [The official documentation](https://webpack.js.org/configuration/devtool/#devtool) contains more information about `devtool` options.

## Other Source Map Options

There are a couple of other options that affect source map generation:

```javascript
{
  output: {
    // Modify the name of the generated source map file.
    // You can use [file], [id], and [hash] replacements here.
    // The default option is enough for most use cases.
    sourceMapFilename: '[file].map', // Default

    // This is the source map filename template. It's default
    // format depends on the devtool option used. You don't
    // need to modify this often.
    devtoolModuleFilenameTemplate: 'webpack:///[resource-path]?[loaders]'
  },
}
```

T> The [official documentation](https://webpack.js.org/configuration/output/#output-sourcemapfilename) digs into `output` specifics.

W> If you are using any `UglifyJsPlugin` and still want source maps, you need to enable `sourceMap: true` for the plugin. Otherwise, the result isn't be what you expect because UglifyJS will perform a further transformation on the code, breaking the mapping. The same has to be done with other plugins and loaders performing transformations. *css-loader* and related loaders are a good example.

## `SourceMapDevToolPlugin` and `EvalSourceMapDevToolPlugin`

If you want more control over source map generation, it's possible to use the `SourceMapDevToolPlugin` or `EvalSourceMapDevToolPlugin` instead. The latter is a more limited alternative, and as stated by its name, it's handy for generating `eval` based source maps.

Both plugins can allow more granular control over which portions of the code you want to generate source maps for, while also having strict control over the result with `SourceMapDevToolPlugin`. Using either plugin allows you to skip the `devtool` option altogether.

You could model a configuration part using `SourceMapDevToolPlugin` (adapted from [the official documentation](https://webpack.js.org/plugins/source-map-dev-tool-plugin/)):

```javascript
exports.generateSourceMaps = ({
  test, include, separateSourceMaps, columnMappings
}) => ({
  // Enable functionality as you want to expose it
  plugins: [
    new webpack.SourceMapDevToolPlugin({
      // Match assets like for loaders. This is
      // convenient if you want to match against multiple
      // file types.
      test: test, // string | RegExp | Array,
      include: include, // string | RegExp | Array,

      // `exclude` matches file names, not package names!
      // exclude: string | RegExp | Array,

      // If filename is set, output to this file.
      // See `sourceMapFileName`.
      // filename: string,

      // This line is appended to the original asset processed.
      // For instance '[url]' would get replaced with an url
      // to the source map.
      // append: false | string,

      // See `devtoolModuleFilenameTemplate` for specifics.
      // moduleFilenameTemplate: string,
      // fallbackModuleFilenameTemplate: string,

      // If false, separate source maps aren't generated.
      module: separateSourceMaps,

      // If false, column mappings are ignored.
      columns: columnMappings,

      // Use plain line to line mappings for the matched modules.
      // lineToLine: bool | {test, include, exclude},

      // Remove source content from source maps. This is handy
      // especially if your source maps are big (over 10 MB)
      // as browsers can struggle with those.
      // See https://github.com/webpack/webpack/issues/2669.
      // noSources: bool,
    }),
  ],
});
```

Given webpack matches only `.js` and `.css` files by default for source maps, you can use `SourceMapDevToolPlugin` to overcome this issue. This can be achieved by passing a `test` pattern like `/\.(js|jsx|css)($|\?)/i`.

`EvalSourceMapDevToolPlugin` accepts only `module` and `lineToLine` options as described above. Therefore it can be considered as an alias to `devtool: 'eval'` while allowing a notch more flexibility.

## Changing Source Map Prefix

You can prefix a source map option with a **pragma** character that gets injected to the source map reference. Webpack uses `#` by default that is supported by modern browsers so you don't have to set it.

To override this, you have to prefix your source map option with it (e.g., `@source-map`). After the change, you should see `//@` kind of reference to the source map over `//#` in your JavaScript files assuming a separate source map type was used.

## Using Dependency Source Maps

Assuming you are using a package that uses inline source maps in its distribution, you can use [source-map-loader](https://www.npmjs.com/package/source-map-loader) to make webpack aware of them. Without setting it up against the package, you get minified debug output. Often you can skip this step as it's a special case.

## Source Maps for Styling

If you want to enable source maps for styling files, you can achieve this by enabling the `sourceMap` option. The same idea works with style loaders such as *css-loader*, *sass-loader*, and *less-loader*.

The *css-loader* is [known to have issues](https://github.com/webpack-contrib/css-loader/issues/232) when you are using relative paths in imports. To overcome this problem, you should set `output.publicPath` to resolve against the server url.

## Conclusion

Source maps can be convenient during development. They provide better means to debug applications as you can still examine the original code over a generated one. They can be valuable even for production usage and allow you to debug issues while serving a client-friendly version of your application.

To recap:

* **Source maps** can be helpful both during development and production. They provide more accurate information about what's going on and make it faster to debug possible problems.
* Webpack supports a large variety of source map variants. They can be split into inline and separate source maps based on where they are generated. Inline source maps are handy during development due to their speed. Separate source maps work for production as then loading them becomes optional.
* `devtool: 'source-map'` is the highest quality option making it valuable for production.
* `cheap-module-eval-source-map` is a good starting point for development.
* If you want to get only stack traces during production, use `devtool: 'hidden-source-map'`. You can capture the output and send it to a third party service for you to examine. This way you can capture errors and fix them.
* `SourceMapDevToolPlugin` and `EvalSourceMapDevToolPlugin` provide more control over the result than the `devtool` shortcut.
* *source-map-loader* can come in handy if your dependencies provide source maps.
* Enabling source maps for styling requires additional effort. You have to enable `sourceMap` option per styling related loader you are using.

In the next chapter, you'll learn to split bundles and separate the current bundle into application and vendor bundles.
