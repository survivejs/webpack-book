# Loading Styles

Webpack doesn’t handle styling out of the box. Instead, you must configure loaders and plugins to get the setup you need.

In this chapter, we’ll set up CSS with our project and see how it works out with automatic browser refreshing. The neat thing is that in this case, webpack doesn’t have to force a full refresh. Instead, it can do something smarter as we’ll see soon.

## Loading CSS

To load CSS, we’ll need to use [css-loader](https://www.npmjs.com/package/css-loader) and [style-loader](https://www.npmjs.com/package/style-loader). *css-loader* goes through possible `@import` and `url()` lookups within the matched files and treats them as a regular ES6 `import`.

This process allows us to rely on other loaders, such as [file-loader](https://www.npmjs.com/package/file-loader) or [url-loader](https://www.npmjs.com/package/url-loader). If an `@import` points to an external resource, *css-loader* will skip it. Only internal resources get processed further by webpack.

After *css-loader* has done its part, *style-loader* picks up the output and injects the CSS into the resulting bundle. The CSS be inlined JavaScript by default, and it implements the HMR interface. As inlining isn’t a good idea for production usage, it makes sense to use `ExtractTextPlugin` to generate a separate CSS file. We’ll do this in the next chapter.

To get started, invoke

```bash
npm install css-loader style-loader --save-dev
```

Now let’s make sure webpack is aware of them. Configure as follows:

**webpack.parts.js**

```javascript
...

exports.loadCSS = function({ include, exclude } = {}) {
  return {
    module: {
      rules: [
        {
          test: /\.css$/,
          include,
          exclude,

          use: ['style-loader', 'css-loader'],
        },
      ],
    },
  };
};
```

We also need to connect our configuration fragment with the main configuration:

**webpack.config.js**

```javascript
...

const commonConfig = merge([
  {
    ...
  },
leanpub-start-insert
  parts.loadCSS(),
leanpub-end-insert
]);

...
```

The configuration we added means that files ending with `.css` should invoke given loaders. `test` matches against a JavaScript-style regular expression. The loaders are evaluated from right to left.

T> Loaders are transformations that are applied to source files, and return the new source. Loaders can be chained together, like using a pipe in Unix. `loaders: ['style-loader', 'css-loader']` can be read as `styleLoader(cssLoader(input))`.

T> If you want to disable *css-loader* `url` parsing, set `url: false`. The same idea applies to `@import` as to disable parsing imports you can set `import: false` through the loader options.

## Setting Up the Initial CSS

We are missing one bit: the actual CSS itself:

**app/main.css**

```css
body {
  background: cornsilk;
}
```

Also, we’ll need to make webpack aware of it. Without having an entry pointing to it somehow, webpack won’t be able to find the file:

**app/index.js**

```javascript
leanpub-start-insert
import './main.css';
leanpub-end-insert
...
```

Execute `npm start` now. Browse to `http://localhost:8080` if you are using the default port and open up *main.css* and change the background color to something like `lime` (`background: lime`). Develop styles as needed to make it look a little nicer. Note that it does **not** perform a hard refresh on the browser since we have HMR setup in place.

We’ll continue from here in the next chapter. Before that, though, I will discuss styling-related techniques.

![Hello cornsilk world](images/hello_02.png)

## Understanding CSS Scoping and CSS Modules

Perhaps the biggest challenge of CSS is that all rules exist within **global scope**. Due to this reason, specific conventions that work around this feature have been developed. The [CSS Modules](https://github.com/css-modules/css-modules) specification solves the problem by introducing **local scope** per `import`. As it happens, this makes CSS more bearable to use as you don’t have to worry about namespace collisions anymore.

Webpack’s *css-loader* supports CSS Modules. You can enable it through a loader definition like this:

```javascript
{
  loader: 'css-loader',
  options: {
    modules: true,
  },
},
```

After this change, your class definitions will remain local to the files. In case you want global class definitions, you’ll need to wrap them within `:global(.redButton) { ... }` kind of declarations.

In this case, the `import` statement will give you the local classes you can then bind to elements. Assume we had CSS like this:

**app/main.css**

```css
body {
  background: cornsilk;
}

.redButton {
  background: red;
}
```

We could then bind the resulting class to a component like this:

**app/component.js**

```javascript
import styles from './main.css';

...

// Attach the generated class name
element.className = styles.redButton;
```

Note that `body` remains as a global declaration still. It’s that `redButton` that makes the difference. You can build component-specific styles that don’t leak elsewhere this way.

CSS Modules provides also features like composition to make it even easier to work with your styles. You can also combine it with other loaders as long as you apply them before *css-loader*.

T> CSS Modules behavior can be modified [as discussed in the official documentation](https://www.npmjs.com/package/css-loader#local-scope). You have control over the names it generates for instance.

T> [eslint-plugin-css-modules](https://www.npmjs.com/package/eslint-plugin-css-modules) is handy for tracking CSS Modules related problems.

## Loading Less

![Less](images/less.png)

[Less](http://lesscss.org/) is a CSS processor packed with functionality. Using Less doesn’t take a lot of effort through webpack as [less-loader](https://www.npmjs.com/package/less-loader) deals with the heavy lifting. You should install [less](https://www.npmjs.com/package/less) as well given it’s a peer dependency of *less-loader*.

Consider the following minimal setup:

```javascript
{
  test: /\.less$/,
  use: ['style-loader', 'css-loader', 'less-loader'],
},
```

The loader supports Less plugins, source maps, and so on. To understand how those work you should check out the project itself.

## Loading Sass

![Sass](images/sass.png)

[Sass](http://sass-lang.com/) is a widely used CSS preprocessor. You should use [sass-loader](https://www.npmjs.com/package/sass-loader) with it. Remember to install [node-sass](https://www.npmjs.com/package/node-sass) to your project as it’s a peer dependency.

Webpack doesn’t take much configuration:

```javascript
{
  test: /\.scss$/,
  use: ['style-loader', 'css-loader', 'sass-loader'],
},
```

T> If you want more performance, especially during development, check out [fast-sass-loader](https://www.npmjs.com/package/fast-sass-loader).

## Loading Stylus and Yeticss

![Stylus](images/stylus.png)

[Stylus](http://stylus-lang.com/) is yet another example of a CSS processor. It works well through [stylus-loader](https://www.npmjs.com/package/stylus-loader). [yeticss](https://www.npmjs.com/package/yeticss) is a pattern library that works well with it. Consider the following configuration:


```javascript
{
  ...
  module: {
    rules: [
      {
        test: /\.styl$/,
        use: ['style-loader', 'css-loader', 'stylus-loader'],
      },
    ],
  },
  plugins: [
    new webpack.LoaderOptionsPlugin({
      options: {
        // yeticss
        stylus: {
          use: [require('yeticss')],
        },
      },
    }),
  ],
},
```

To start using yeticss with Stylus, you must import it to one of your app’s *.styl* files:

```javascript
@import 'yeticss'

//or
@import 'yeticss/components/type'
```

## PostCSS

![PostCSS](images/postcss.png)

[PostCSS](http://postcss.org/) allows you to perform transformations over CSS through JavaScript plugins. You can even find plugins that provide you Sass-like features. PostCSS is the equivalent of Babel for styling. [postcss-loader](https://www.npmjs.com/package/postcss-loader) allows using it with webpack.

The example below illustrates how to set up autoprefixing using PostCSS. It also sets up [precss](https://www.npmjs.com/package/precss), a PostCSS plugin that allows you to use Sass-like markup in your CSS. You can mix this technique with other loaders to allow autoprefixing there.

```javascript
{
  test: /\.css$/,
  use: [
    'style-loader',
    'css-loader',
    {
      loader: 'postcss-loader',
      options: {
        plugins: () => ([
          require('autoprefixer'),
          require('precss'),
        ]),
      },
    },
  ],
},
```

For this to work, you will have to remember to include [autoprefixer](https://www.npmjs.com/package/autoprefixer) and [precss](https://www.npmjs.com/package/precss) to your project. The technique is discussed in detail in the *Autoprefixing* chapter.

T> PostCSS supports also *postcss.config.js* based configuration. It relies on [cosmiconfig](https://www.npmjs.com/package/cosmiconfig) internally. It can pick up configuration from your *package.json*, JSON or YAML, or that you can even push your configuration below an arbitrary directory. *cosmiconfig* will find it. The problem is that this style is harder to compose than inline configuration.

### cssnext

![cssnext](images/cssnext.jpg)

[cssnext](http://cssnext.io/) is a PostCSS plugin that allows us to experience the future now. It comes with restrictions as it’s not possible to adapt to each feature, but it may be worth a go. You can use it through [postcss-cssnext](https://www.npmjs.com/package/postcss-cssnext), and you can enable it as follows:

```javascript
{
  test: /\.css$/,
  use: [
    'style-loader',
    'css-loader',
    {
      loader: 'postcss-loader',
      options: {
        plugins: () => ([
          require('cssnext'),
        ]),
      },
    },
  ],
},
```

See [the usage documentation](http://cssnext.io/usage/) for available options.

T> Note that cssnext includes autoprefixer! You don’t have to configure autoprefixing separately for it to work in this case.

## Understanding Lookups

To get most out of *css-loader*, you should understand how it performs its lookups. Even though *css-loader* handles relative imports by default, it won’t touch absolute imports (`url("/static/img/demo.png")`). If you rely on imports like this, you will have to copy the files to your project.

[copy-webpack-plugin](https://www.npmjs.com/package/copy-webpack-plugin) works for this purpose, but you can also copy the files outside of webpack. The benefit of the former approach is that webpack-dev-server can pick that up.

T> [resolve-url-loader](https://www.npmjs.com/package/resolve-url-loader) will come in handy if you use Sass or Less. It adds support for relative imports to the environments.

### Processing *css-loader* Imports

If you want to process *css-loader* imports in a specific way, you should set up `importLoaders` option to a number that tells the loader how many loaders after the *css-loader* should be executed against the imports found. If you import other CSS files from your CSS through the `@import` statement and want to process the imports through specific loaders, you will find this technique essential.

Consider the following import from a CSS file:

```css
@import "./variables.sass";
```

To process the Sass file, you would have to write configuration like this:

```javascript
{
  test: /\.css$/,
  use: [
    'style-loader',
    {
      loader: 'css-loader',
      options: {
        importLoaders: 1,
      },
    },
    'sass-loader',
  ],
},
```

If you added more loaders, such as *postcss-loader*, to the chain, you would have to adjust the `importLoaders` option accordingly.

### Loading from *node_modules* Directory

You can load files directly from your node_modules directory. Consider Bootstrap and its usage for example:

```less
@import "~bootstrap/less/bootstrap";
```

The tilde character (`~`) tells webpack that it’s not a relative import as by default. If tilde is included, it will perform a lookup against `node_modules` (default setting) although this is configurable through the [resolve.modules](https://webpack.js.org/configuration/resolve/#resolve-modules) field.

W> If you are using *postcss-loader*, you can skip using `~` as discussed in [postcss-loader issue tracker](https://github.com/postcss/postcss-loader/issues/166). *postcss-loader* can resolve the imports without a tilde.

## Enabling Source Maps

If you want to enable source maps for CSS, you should enable `sourceMap` option for *css-loader* and set `output.publicPath` to an absolute url pointing to your development server. If you have multiple loaders in a chain, you have to enable source maps separately for each. *css-loader* [issue 29](https://github.com/webpack/css-loader/issues/29) discusses this problem further.

## Using Bootstrap

There are a couple of ways to use [Bootstrap](https://getbootstrap.com/) through webpack. One option is to point to the [npm version](https://www.npmjs.com/package/bootstrap) and perform loader configuration as above.

The [Sass version](https://www.npmjs.com/package/bootstrap-sass) is another option. In this case, you should set `precision` option of *sass-loader* to at least 8. This is [a known issue](https://www.npmjs.com/package/bootstrap-sass#sass-number-precision) explained at *bootstrap-sass*.

The third option is to go through [bootstrap-loader](https://www.npmjs.com/package/bootstrap-loader). It does a lot more but allows customization.

## Converting CSS to Strings

Especially with Angular 2, it can be convenient if you can get CSS in a string format that can be pushed to components. [css-to-string-loader](https://www.npmjs.com/package/css-to-string-loader) achieves exactly this.

## Conclusion

Webpack can load a variety of style formats. It even supports advanced specifications like [CSS Modules](https://github.com/css-modules/webpack-demo). The approaches covered here inline the styling by default.

To recap:

* *css-loader* evaluates the `@import` and `url()` definitions of your styling. *style-loader* converts it to JavaScript and implements webpack’s Hot Module Replacement interface.
* *css-loader* supports the CSS Modules specification. CSS Modules allow you maintain CSS in a local scope by default solving the biggest issue of CSS.
* Webpack supports a large variety of formats compiling to CSS through loaders. These include Sass, Less, and Stylus.
* PostCSS allows you to inject functionality to CSS in through its plugin system. cssnext is an example of a collection of plugins for PostCSS that implements future features of CSS.
* *css-loader* won’t touch absolute imports by default. It allows customization of loading behavior through the `importLoaders` option. You can perform lookups against *node_modules* by prefixing your imports with a tilde (`~`) character.
* To use source maps, you have to enable `sourceMap` boolean through each style loader you are using except for *style-loader*. You should also set `output.publicPath` to an absolute url that points to your development server.
* Using Bootstrap with webpack requires special care. You can either go through generic loaders or a bootstrap specific loader for more customization options.

Although the loading approach covered here is enough for development purposes, it’s not ideal for production as it inlines the styling to the JavaScript bundles. We’ll cover this problem in the next chapter as we learn to separate CSS.
