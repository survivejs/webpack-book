# Source Maps

![Source maps in Chrome](images/sourcemaps.png)

When your source code has gone through transformations, debugging in the browser becomes a problem. **Source maps** solve this problem by providing a mapping between the original and the transformed source code. In addition to source compiling to JavaScript, this works for styling as well.

One approach is to skip source maps during development and rely on browser support of language features. If you use ES2015 without any extensions and develop using a modern browser, this can work. The advantage of doing this is that you avoid all the problems related to source maps while gaining better performance.

If you are using webpack 4 or newer and the `mode` option, the tool will generate source maps automatically for you in `development` mode. Production usage requires attention, though.

T> If you want to understand the ideas behind source maps in greater detail, [read Ryan Seddon's introduction to the topic](https://www.html5rocks.com/en/tutorials/developertools/sourcemaps/).

T> To see how webpack handles source maps, see [source-map-visualization](https://sokra.github.io/source-map-visualization/) by the author of the tool.

## Inline source maps and separate source maps

Webpack can generate both inline or separate source map files. The inline ones are included to the emitted bundles and are valuable during development due to better performance. The separate files are handy for production usage as then loading source maps is optional.

It's possible you **don't** want to generate a source map for your production bundle as this makes it effortless to inspect your application. By disabling source maps, you are performing a sort of obfuscation.

Whether or not you want to enable source maps for production, they are handy for staging. Skipping source maps speeds up your build as generating source maps at the best quality can be a complicated operation.

**Hidden source maps** give a stack trace information only. You can connect them with a monitoring service to get traces as the application crashes allowing you to fix the problematic situations. While this isn't ideal, it's better to know about possible problems than not.

## Enabling source maps

Webpack provides two ways to enable source maps. There's a `devtool` shortcut field. You can also find two plugins that give more options to tweak. The plugins are going to be discussed briefly at the end of this chapter. Beyond webpack, you also have to enable support for source maps at the browsers you are using for development.

### Enabling source maps in webpack

To get started, you can wrap the core idea within a configuration part. You can convert this to use the plugins later if you want:

**webpack.parts.js**

```javascript
exports.generateSourceMaps = ({ type }) => ({
  devtool: type,
});
```

Webpack supports a wide variety of source map types. These vary based on quality and build speed. For now, you enable `source-map` for production and let webpack use the default for development. Set it up as follows:

**webpack.config.js**

```javascript
const productionConfig = merge([
leanpub-start-insert
  parts.generateSourceMaps({ type: "source-map" }),
leanpub-end-insert
  ...
]);
```

`source-map` is the slowest and highest quality option of them all, but that's fine for a production build.

{pagebreak}

If you build the project now (`npm run build`), you should see source maps in the output:

```bash
Hash: 53d2c4e897619ee2a33f
Version: webpack 4.43.0
Time: 2775ms
Built at: 07/10/2020 2:02:04 PM
       Asset       Size  Chunks                   Chunk Names
  index.html  237 bytes          [emitted]
    main.css   8.53 KiB       0  [emitted]        main
main.css.map   85 bytes       0  [emitted] [dev]  main
     main.js   1.21 KiB       0  [emitted]        main
 main.js.map   5.13 KiB       0  [emitted] [dev]  main
Entrypoint main = main.css main.js main.css.map main.js.map
...
```

Take a good look at those _.map_ files. That's where the mapping between the generated and the source happens. During development, it writes the mapping information in the bundle.

### Enabling source maps in browsers

To use source maps within a browser, you have to enable source maps explicitly as per browser-specific instructions:

- [Chrome](https://developer.chrome.com/devtools/docs/javascript-debugging)
- [Firefox](https://developer.mozilla.org/en-US/docs/Tools/Debugger/How_to/Use_a_source_map)
- [IE Edge](https://docs.microsoft.com/en-us/microsoft-edge/devtools-guide/debugger#source-maps)
- [Safari](https://support.apple.com/guide/safari/use-the-safari-develop-menu-sfri20948/mac)

W> If you want to use breakpoints (i.e., a `debugger;` statement or ones set through the browser), the `eval`-based options won't work in Chrome!

## Source map types supported by webpack

Source map types supported by webpack can be split into two categories:

- **Inline** source maps add the mapping data directly to the generated files.
- **Separate** source maps emit the mapping data to separate source map files and link the source to them using a comment. Hidden source maps omit the comment on purpose.

Thanks to their speed, inline source maps are ideal for development. Given they make the bundles big, separate source maps are the preferred solution for production. Separate source maps work during development as well if the performance overhead is acceptable.

## Inline source map types

Webpack provides multiple inline source map variants. Often `eval` is the starting point and [webpack issue #2145](https://github.com/webpack/webpack/issues/2145#issuecomment-409029231) recommends `inline-module-source-map` as it's a good compromise between speed and quality while working reliably in Chrome and Firefox browsers.

To get a better idea of the available options, they are listed below while providing a small example for each. The examples are generated with the following extra webpack setup:

- `optimization.moduleIds = "named"` is set to improve readability. It's a good idea to set `optimization.chunkIds` as well in case you are using _Code Splitting_.
- `mode` is set to `false` to avoid webpack's default processing

{pagebreak}

### `devtool: "eval"`

`eval` generates code in which each module is wrapped within an `eval` function:

```javascript
/***/ "./src/index.js":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _main_css__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(\"./src/main.css\");\n/* harmony import */ var _main_css__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_main_css__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _component__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(\"./src/component.js\");\n\n\ndocument.body.appendChild(Object(_component__WEBPACK_IMPORTED_MODULE_1__[\"default\"])());\n\n//# sourceURL=webpack:///./src/index.js?");

/***/ }),
```

{pagebreak}

### `devtool: "cheap-eval-source-map"`

`cheap-eval-source-map` goes a step further and it includes base64 encoded version of the code as a data url. The result contains only line data while losing column mappings. If you decode the resulting base64 string, you get output containing the mapping:

```json
{
  "version": 3,
  "file": "./src/index.js.js",
  "sources": ["webpack:///./src/index.js?3700"],
  "sourcesContent": [
    "import './main.css';\nimport component from \"./component\";\ndocument.body.appendChild(component());"
  ],
  "mappings": "AAAA;AAAA;AAAA;AAAA;AAAA;AACA;AACA",
  "sourceRoot": ""
}
```

### `devtool: "cheap-module-eval-source-map"`

`cheap-module-eval-source-map` is the same idea, except with higher quality and lower performance and decoding the data reveals more:

```json
{
  "version": 3,
  "file": "./src/index.js.js",
  "sources": ["webpack:///./src/index.js?b635"],
  "sourcesContent": [
    "import './main.css';\nimport component from \"./component\";\n\ndocument.body.appendChild(component());\n"
  ],
  "mappings": "AAAA;AAAA;AAAA;AAAA;AAAA;AACA;AAEA",
  "sourceRoot": ""
}
```

In this particular case, the difference between the options is minimal.

### `devtool: "eval-source-map"`

`eval-source-map` is the highest quality option of the inline options. It's also the slowest one as it emits the most data. This time around there's more mapping data available for the browser:

```json
{
  "version": 3,
  "sources": ["webpack:///./src/index.js?b635"],
  "names": ["document", "body", "appendChild", "component"],
  "mappings": "AAAA;AAAA;AAAA;AAAA;AAAA;AACA;AAEAA,QAAQ,CAACC,IAAT,CAAcC,WAAd,CAA0BC,0DAAS,EAAnC",
  "file": "./src/index.js.js",
  "sourcesContent": [
    "import './main.css';\nimport component from \"./component\";\n\ndocument.body.appendChild(component());\n"
  ],
  "sourceRoot": ""
}
```

## Separate Source Map Types

Webpack can also generate production usage friendly source maps. These end up in separate files ending with `.map` extension and are loaded by the browser only when required. This way your users get good performance while it's easier for you to debug the application.

`source-map` is a reasonable default here. Even though it takes longer to generate the source maps this way, you get the best quality. If you don't care about production source maps, you can skip the setting there and get better performance in return.

### `devtool: "cheap-source-map"`

`cheap-source-map` is similar to the cheap options above. The result is going to miss column mappings. Also, source maps from loaders, such as **css-loader**, are not going to be used.

{pagebreak}

Examining the `.map` file reveals the following output in this case:

```json
{
  "version": 3,
  "file": "main.js",
  "sources": [
    "webpack:///webpack/bootstrap",
    "webpack:///./src/component.js",
    "webpack:///./src/index.js",
    "webpack:///./src/main.css"
  ],
  "sourcesContent": [
    "...",
    "// extracted by mini-css-extract-plugin"
  ],
  "mappings": ";AAAA;...;;ACFA;;;;A",
  "sourceRoot": ""
}
```

The source contains `//# sourceMappingURL=main.js.map` kind of comment at its end to map to this file.

### `devtool: "cheap-module-source-map"`

`cheap-module-source-map` is the same as previous except source maps from loaders are simplified to a single mapping per line. It yields the following output in this case:

```json
{
  "version": 3,
  "file": "main.js",
  "sources": [
    "webpack:///webpack/bootstrap",
    "webpack:///./src/component.js",
    "webpack:///./src/index.js",
    "webpack:///./src/main.css"
  ],
  "sourcesContent": [
    "...",
    "// extracted by mini-css-extract-plugin"
  ],
  "mappings": ";AAAA;...;;ACFA;;;;A",
  "sourceRoot": ""
}
```

W> `cheap-module-source-map` is [currently broken if minification is used](https://github.com/webpack/webpack/issues/4176) and this is an excellent reason to avoid the option for now.

### `devtool: "hidden-source-map"`

`hidden-source-map` is the same as `source-map` except it doesn't write references to the source maps to the source files. If you don't want to expose source maps to development tools directly while you wish proper stack traces, this is handy.

### `devtool: "nosources-source-map"`

`nosources-source-map` creates a source map without `sourcesContent` in it. You still get stack traces, though. The option is useful if you don't want to expose your source code to the client.

T> [The official documentation](https://webpack.js.org/configuration/devtool/#devtool) contains more information about `devtool` options.

### `devtool: "source-map"`

`source-map` provides the best quality with the complete result, but it's also the slowest option. The output reflects this:

```json
{
  "version": 3,
  "sources": [
    "webpack:///webpack/bootstrap",
    "webpack:///./src/component.js",
    "webpack:///./src/index.js",
    "webpack:///./src/main.css"
  ],
  "names": [
    "text",
    "element",
    "document",
    "createElement",
    "className",
    "innerHTML",
    "body",
    "appendChild",
    "component"
  ],
  "mappings": ";AAAA;...;;ACFA;;;;A",
  "file": "main.js",
  "sourcesContent": [
    "...",
    "// extracted by mini-css-extract-plugin"
  ],
  "sourceRoot": ""
}
```

## Other source map options

There are a couple of other options that affect source map generation:

```javascript
const config = {
  output: {
    // Modify the name of the generated source map file.
    // You can use [file], [id], and [hash] replacements here.
    // The default option is enough for most use cases.
    sourceMapFilename: "[file].map", // Default

    // This is the source map filename template. It's default
    // format depends on the devtool option used. You don't
    // need to modify this often.
    devtoolModuleFilenameTemplate:
      "webpack:///[resource-path]?[loaders]",

    // create-react-app uses the following as it shows up well
    // in developer tools
    devtoolModuleFilenameTemplate: (info) =>
      path.resolve(info.absoluteResourcePath).replace(/\\/g, "/"),
  },
};
```

T> The [official documentation](https://webpack.js.org/configuration/output/#output-sourcemapfilename) digs into `output` specifics.

## `SourceMapDevToolPlugin` and `EvalSourceMapDevToolPlugin`

If you want more control over source map generation, it's possible to use the [SourceMapDevToolPlugin](https://webpack.js.org/plugins/source-map-dev-tool-plugin/) or `EvalSourceMapDevToolPlugin` instead. The latter is a more limited alternative, and as stated by its name, it's handy for generating `eval` based source maps.

Both plugins can allow more granular control over which portions of the code you want to generate source maps for, while also having strict control over the result with `SourceMapDevToolPlugin`. Using either plugin allows you to skip the `devtool` option altogether.

Given webpack matches only `.js` and `.css` files by default for source maps, you can use `SourceMapDevToolPlugin` to overcome this issue. This can be achieved by passing a `test` pattern like `/\.(js|jsx|css)($|\?)/i`.

`EvalSourceMapDevToolPlugin` accepts only `module` and `lineToLine` options as described above. Therefore it can be considered as an alias to `devtool: "eval"` while allowing a notch more flexibility.

## Changing source map prefix

You can prefix a source map option with a **pragma** character that gets injected into the source map reference. Webpack uses `#` by default that is supported by modern browsers, so you don't have to set it.

To override this, you have to prefix your source map option with it (e.g., `@source-map`). After the change, you should see `//@` kind of reference to the source map over `//#` in your JavaScript files, assuming a separate source map type was used.

{pagebreak}

## Using dependency source maps

Assuming you are using a package that uses inline source maps in its distribution, you can use [source-map-loader](https://www.npmjs.com/package/source-map-loader) to make webpack aware of them. Without setting it up against the package, you get a minified debug output. Often you can skip this step as it's a special case.

## Source maps for styling

If you want to enable source maps for styling files, you can achieve this by enabling the `sourceMap` option. The same idea works with style loaders such as **css-loader**, **sass-loader**, and **less-loader**.

The **css-loader** is [known to have issues](https://github.com/webpack-contrib/css-loader/issues/232) when you are using relative paths in imports. To overcome this problem, you should set `output.publicPath` to resolve the server url.

## Source maps on backend

If you are using Node target with webpack as discussed in the _Build Targets_ chapter, you should still generate source maps. The trick is to configure as follows:

```javascript
const config = {
  output: {
    devtoolModuleFilenameTemplate: "[absolute-resource-path]",
  },
  plugins: [webpack.SourceMapDevToolPlugin({})],
};
```

## Ignoring source map related warnings

Sometimes third-party dependencies lead to source map related warnings in the browser inspector. Webpack allows you to filter the messages as follows:

```javascript
const config = {
  stats: {
    warningsFilter: [/Failed to parse source map/],
  },
};
```

## Conclusion

Source maps can be convenient during development. They provide better means to debug applications as you can still examine the original code over a generated one. They can be valuable even for production usage and allow you to debug issues while serving a client-friendly version of your application.

To recap:

- **Source maps** can be helpful both during development and production. They provide information about what's going on and speed up debugging.
- Webpack supports many source map variants in inline and separate categories. Inline source maps are handy during development due to their speed. Separate source maps work for production as then loading them becomes optional.
- `devtool: "source-map"` is the highest quality option valuable for production.
- `inline-module-source-map` is a good starting point for development.
- Use `devtool: "hidden-source-map"` to get only stack traces during production and to send it to a third-party service for you to examine later and fix.
- `SourceMapDevToolPlugin` and `EvalSourceMapDevToolPlugin` provide more control over the result than the `devtool` shortcut.
- You should use **source-map-loader** with third-party dependencies.
- Enabling source maps for styling requires additional effort. You have to enable `sourceMap` option per styling related loader you are using.

In the next chapter, you'll learn the art of code splitting.
