# Loading Styles

Webpack doesn't handle styling out of the box, and you will have to use loaders and plugins to allow loading style files. In this chapter, you will set up CSS with the project and see how it works out with automatic browser refreshing. When you make a change to the CSS webpack doesn't have to force a full refresh. Instead, it can patch the CSS without one.

## Loading CSS

To load CSS, you need to use [css-loader](https://www.npmjs.com/package/css-loader) and [style-loader](https://www.npmjs.com/package/style-loader).

_css-loader_ goes through possible `@import` and `url()` lookups within the matched files and treats them as a regular ES2015 `import`. If an `@import` points to an external resource, _css-loader_ skips it as only internal resources get processed further by webpack.

_style-loader_ injects the styling through a `style` element. The way it does this can be customized. It also implements the _Hot Module Replacement_ interface providing for a pleasant development experience.

The matched files can be processed through loaders like [file-loader](https://www.npmjs.com/package/file-loader) or [url-loader](https://www.npmjs.com/package/url-loader), and these possibilities are discussed in the _Loading Assets_ part of the book.

Since inlining CSS isn't a good idea for production usage, it makes sense to use `MiniCssExtractPlugin` to generate a separate CSS file. You will do this in the next chapter.

{pagebreak}

To get started, invoke

```bash
npm add css-loader style-loader -D
```

Now let's make sure webpack is aware of them. Add a new function at the end of the part definition:

**webpack.parts.js**

```javascript
exports.loadCSS = ({ include, exclude } = {}) => ({
  module: {
    rules: [
      {
        test: /\.css$/,
        include,
        exclude,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
});
```

The added configuration means that files ending with `.css` should invoke the given loaders.

Loaders are transformations that are applied to source files, and return the new source and can be chained together like a pipe in Unix. They are evaluated from right to left. This means that `loaders: ["style-loader", "css-loader"]` can be read as `styleLoader(cssLoader(input))`.

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

## Setting up the initial CSS

You are missing the CSS still:

**src/main.css**

```css
body {
  background: cornsilk;
}
```

To make webpack aware of the CSS, we have to refer to it from our source code:-

**src/index.js**

```javascript
leanpub-start-insert
import "./main.css";
leanpub-end-insert
...
```

Execute `npm start` and browse to `http://localhost:8080` if you are using the default port and open up _main.css_ and change the background color to something like `lime` (`background: lime`).

![Hello cornsilk world](images/hello_02.png)

## Using CSS preprocessors

Webpack provides support for the most popular styling approaches as listed below:

- To use Less preprocessor, see [less-loader](https://www.npmjs.com/package/less-loader).
- Sass requires [sass-loader](https://www.npmjs.com/package/sass-loader) or [fast-sass-loader](https://www.npmjs.com/package/fast-sass-loader) (more performant). In both cases you would add the loader after **css-loader** within the loader definition.
- For Stylus, see [stylus-loader](https://www.npmjs.com/package/stylus-loader).

For anything css-in-js related, please refer to the documentation of the specific solution. Often webpack is well supported by the options.

T> The _CSS Modules_ appendix discusses an approach that allows you to treat local to files by default. It avoids the scoping problem of CSS.

## PostCSS

![PostCSS](images/postcss.png)

[PostCSS](http://postcss.org/) allows you to perform transformations over CSS through JavaScript plugins. You can even find plugins that provide you Sass-like features. PostCSS is the equivalent of Babel for styling. [postcss-loader](https://www.npmjs.com/package/postcss-loader) allows using it with webpack.

The example below illustrates how to set up autoprefixing using PostCSS. It also sets up [precss](https://www.npmjs.com/package/precss), a PostCSS plugin that allows you to use Sass-like markup in your CSS. You can mix this technique with other loaders to enable autoprefixing there.

```javascript
{
  test: /\.css$/,
  use: [
    "style-loader",
    "css-loader",
    {
      loader: "postcss-loader",
      options: {
        plugins: () => ([
          require("autoprefixer"),
          require("precss"),
        ]),
      },
    },
  ],
},
```

You have to remember to include [autoprefixer](https://www.npmjs.com/package/autoprefixer) and [precss](https://www.npmjs.com/package/precss) to your project for this to work. The technique is discussed in detail in the _Autoprefixing_ chapter.

T> PostCSS supports _postcss.config.js_ based configuration. It relies on [cosmiconfig](https://www.npmjs.com/package/cosmiconfig) internally for other formats.

## Understanding **css-loader** lookups

To get most out of **css-loader**, you should understand how it performs its lookups. Even though _css-loader_ handles relative imports by default, it doesn't touch absolute imports (`url("/static/img/demo.png")`) nor root relative imports (`url("https://mydomain.com/static/demo.png")`). If you rely on this kind of imports, you have to copy the files to your project.

[copy-webpack-plugin](https://www.npmjs.com/package/copy-webpack-plugin) works for this purpose, but you can also copy the files outside of webpack. The benefit of the former approach is that webpack-dev-server can pick that up.

Any other lookup will go through webpack and it will try to evaluate the `url` and `@import` expressions. To disable this default behavior, set **css-loader** `url: false` and `import: false` through the loader options.

T> [resolve-url-loader](https://www.npmjs.com/package/resolve-url-loader) comes in handy if you use Sass or Less. It adds support for relative imports to the environments.

### Processing **css-loader** imports

If you want to process **css-loader** imports in a specific way, you should set up `importLoaders` option to a number that tells the loader how many loaders before the _css-loader_ should be executed against the imports found. If you import other CSS files from your CSS through the `@import` statement and want to process the imports through specific loaders, this technique is essential.

{pagebreak}

Consider the following import from a CSS file:

```css
@import "./variables.sass";
```

To process the Sass file, you would have to write configuration:

```javascript
{
  test: /\.css$/,
  use: [
    "style-loader",
    {
      loader: "css-loader",
      options: {
        importLoaders: 1,
      },
    },
    "sass-loader",
  ],
},
```

If you added more loaders, such as _postcss-loader_, to the chain, you would have to adjust the `importLoaders` option accordingly.

### Loading from _node_modules_ directory

You can load files directly from your node_modules directory. Consider Bootstrap and its usage for example:

```less
@import "~bootstrap/less/bootstrap";
```

The tilde character (`~`) tells webpack that it's not a relative import as by default. If tilde is included, it performs a lookup against `node_modules` (default setting) although this is configurable through the [resolve.modules](https://webpack.js.org/configuration/resolve/#resolve-modules) field.

W> If you are using _postcss-loader_, you can skip using `~` as discussed in [postcss-loader issue tracker](https://github.com/postcss/postcss-loader/issues/166). _postcss-loader_ can resolve the imports without a tilde.

## Enabling source maps

If you want to enable source maps for CSS, you should enable `sourceMap` option for _css-loader_ and set `output.publicPath` to an absolute url pointing to your development server. If you have multiple loaders in a chain, you have to enable source maps separately for each. _css-loader_ [issue 29](https://github.com/webpack/css-loader/issues/29) discusses this problem further.

## Converting CSS to strings

Especially with Angular 2, it can be convenient if you can get CSS in a string format that can be pushed to components. [css-to-string-loader](https://www.npmjs.com/package/css-to-string-loader) achieves exactly this. [to-string-loader](https://www.npmjs.com/package/to-string-loader) is another option.

## Using Bootstrap

There are a couple of ways to use [Bootstrap](https://getbootstrap.com/) through webpack. One option is to point to the [npm version](https://www.npmjs.com/package/bootstrap) and perform loader configuration as above.

The [Sass version](https://www.npmjs.com/package/bootstrap-sass) is another option. In this case, you should set `precision` option of _sass-loader_ to at least 8. This is [a known issue](https://www.npmjs.com/package/bootstrap-sass#sass-number-precision) explained at _bootstrap-sass_.

The third option is to go through [bootstrap-loader](https://www.npmjs.com/package/bootstrap-loader). It does a lot more but allows customization.

## Conclusion

Webpack can load a variety of style formats. The approaches covered here write the styling to JavaScript bundles by default.

To recap:

- _css-loader_ evaluates the `@import` and `url()` definitions of your styling. _style-loader_ converts it to JavaScript and implements webpack's _Hot Module Replacement_ interface.
- Webpack supports a large variety of formats compiling to CSS through loaders. These include Sass, Less, and Stylus.
- PostCSS allows you to inject functionality to CSS in through its plugin system. cssnext is an example of a collection of plugins for PostCSS that implements future features of CSS.
- _css-loader_ doesn't touch absolute imports by default. It allows customization of loading behavior through the `importLoaders` option. You can perform lookups against _node_modules_ by prefixing your imports with a tilde (`~`) character.
- To use source maps, you have to enable `sourceMap` boolean through each style loader you are using except for _style-loader_. You should also set `output.publicPath` to an absolute url that points to your development server.
- Using Bootstrap with webpack requires special care. You can either go through generic loaders or a bootstrap specific loader for more customization options.

Although the loading approach covered here is enough for development purposes, it's not ideal for production. You'll learn why and how to solve this in the next chapter by separating CSS from the source.
