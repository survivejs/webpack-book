# Loading Styles

Webpack doesn't handle styling out of the box, and you will have to use loaders and plugins to allow loading style files. In this chapter, you will set up CSS with the project and see how it works out with automatic browser refreshing. When you make a change to the CSS webpack doesn't have to force a full refresh. Instead, it can patch the CSS without one.

## Loading CSS

To load CSS, you need to use [css-loader](https://www.npmjs.com/package/css-loader) and [style-loader](https://www.npmjs.com/package/style-loader).

**css-loader** goes through possible `@import` and `url()` lookups within the matched files and treats them as a regular ES2015 `import`. If an `@import` points to an external resource, **css-loader** skips it as only internal resources get processed further by webpack.

**style-loader** injects the styling through a `style` element. The way it does this can be customized. It also implements the _Hot Module Replacement_ interface providing for a pleasant development experience.

The matched files can be processed through asset modules by using the `type` field at a loader definition. The feature is discussed in the _Loading Assets_ part of the book.

Since inlining CSS isn't a good idea for production usage, it makes sense to use `MiniCssExtractPlugin` to generate a separate CSS file. You will do this in the next chapter.

{pagebreak}

To get started, install the dependencies:

```bash
npm add css-loader style-loader -D
```

Add a new function at the end of the part definition:

**webpack.parts.js**

```javascript
exports.loadCSS = () => ({
  module: {
    rules: [
      { test: /\.css$/, use: ["style-loader", "css-loader"] },
    ],
  },
});
```

Above means that files ending with `.css` should invoke the given loaders. Loaders return the new source files with transformations applied on them. They can be chained together like a pipe in Unix, and are evaluated from right to left:

> `styleLoader(cssLoader(input))`

You also need to connect the fragment to the primary configuration:

**webpack.config.js**

```javascript
const commonConfig = merge([
  ...
leanpub-start-insert
  parts.loadCSS(),
leanpub-end-insert
]);
```

{pagebreak}

## Setting up initial CSS

You are missing the CSS still:

**src/main.css**

```css
body {
  background: cornsilk;
}
```

To make webpack aware of the CSS, we have to refer to it from our source code:

**src/index.js**

```javascript
leanpub-start-insert
import "./main.css";
leanpub-end-insert
...
```

Execute `npm start` and browse to `http://localhost:8080` if you are using the default port and open up `main.css` and change the background color to something like `lime` (`background: lime`).

![Hello cornsilk world](images/hello_02.png)

## PostCSS

[PostCSS](http://postcss.org/) allows you to perform transformations over CSS through JavaScript plugins. PostCSS is the equivalent of Babel for styling and you can find plugins for many purposes. It can even fix browser bugs like `100vh` behavior on Safari [postcss-100vh-fix](https://www.npmjs.com/package/postcss-100vh-fix). PostCSS is discussed in the next chapters.

## Using CSS preprocessors

Webpack provides support for the most popular styling approaches as listed below:

- To use Less preprocessor, see [less-loader](https://www.npmjs.com/package/less-loader).
- Sass requires [sass-loader](https://www.npmjs.com/package/sass-loader) or [fast-sass-loader](https://www.npmjs.com/package/fast-sass-loader) (more performant). In both cases you would add the loader after **css-loader** within the loader definition.
- For Stylus, see [stylus-loader](https://www.npmjs.com/package/stylus-loader).

For anything css-in-js related, please refer to the documentation of the specific solution. Often webpack is well supported by the options.

T> The _CSS Modules_ appendix discusses an approach that allows you to treat local to files by default. It avoids the scoping problem of CSS.

## Understanding **css-loader** lookups

To get most out of **css-loader**, you should understand how it performs its lookups. Even though the loader handles absolute and relative imports by default, it doesn't work with root relative imports - `url("/static/img/demo.png")`

If you rely on root relative imports, you have to copy the files to your project as discussed in the _Tidying Up_ chapter. [copy-webpack-plugin](https://www.npmjs.com/package/copy-webpack-plugin) works for this purpose, but you can also copy the files outside of webpack. The benefit of the former approach is that a _Development Server_ can pick that up.

Any other lookup will go through webpack and it will try to evaluate the `url` and `@import` expressions. To disable this default behavior, set **css-loader** `url: false` and `import: false` through the loader options.

T> [resolve-url-loader](https://www.npmjs.com/package/resolve-url-loader) comes in handy if you use Sass or Less. It adds support for relative imports to the environments.

### Processing **css-loader** imports

If you want to process **css-loader** imports in a specific way, you should set up `importLoaders` option to a number that tells the loader how many loaders before the **css-loader** should be executed against the imports found. If you import other CSS files from your CSS through the `@import` statement and want to process the imports through specific loaders, this technique is essential.

Consider the following import from a CSS file: `@import "./variables.sass";`. To process the Sass file, you would have to write configuration:

```javascript
const config = {
  test: /\.css$/,
  use: [
    "style-loader",
    {
      loader: "css-loader",
      options: { importLoaders: 1 },
    },
    "sass-loader",
  ],
};
```

If you added more loaders, such as **postcss-loader**, to the chain, you would have to adjust the `importLoaders` option accordingly.

### Loading from `node_modules` directory

You can load files directly from your node_modules directory. Consider Bootstrap and its usage for example: `@import "~bootstrap/less/bootstrap";`. The tilde character (`~`) tells webpack that it's not a relative import as by default. If tilde is included, it performs a lookup against `node_modules` (default setting) although this is configurable through the [resolve.modules](https://webpack.js.org/configuration/resolve/#resolve-modules) field.

W> If you are using **postcss-loader**, you can skip using `~` as discussed in [postcss-loader issue tracker](https://github.com/postcss/postcss-loader/issues/166). **postcss-loader** can resolve the imports without a tilde.

## Conclusion

Webpack can load a variety of style formats. The approaches covered here write the styling to JavaScript bundles by default.

To recap:

- **css-loader** evaluates the `@import` and `url()` definitions. **style-loader** converts it to JavaScript and implements webpack's _Hot Module Replacement_ interface.
- Webpack supports a large variety of formats compiling to CSS through loaders. These include Sass, Less, and Stylus.
- PostCSS allows you to inject functionality to CSS in through its plugin system.
- **css-loader** doesn't touch absolute nor root relative imports by default. It allows customization of loading behavior through the `importLoaders` option. You can lookup against `node_modules` by prefixing your imports with a tilde (`~`).
- Using Bootstrap with webpack requires special care. You can either go through generic loaders or a Bootstrap specific loader for more customization options.

Although the loading approach covered here is enough for development purposes, it's not ideal for production. You'll learn why and how to solve this in the next chapter by separating CSS from the source.
