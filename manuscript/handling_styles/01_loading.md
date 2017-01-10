# Loading Styles

Webpack doesn't handle styling out of the box. Instead, you must configure loaders and plugins to get the setup you need.

In this chapter we'll set up CSS with our project and see how it works out with automatic browser refreshing. The neat thing is that in this case webpack doesn't have to force a full refresh. Instead, it can do something smarter as we'll see soon.

## Loading CSS

To load CSS, we'll need to use [css-loader](https://www.npmjs.com/package/css-loader) and [style-loader](https://www.npmjs.com/package/style-loader). *css-loader* goes through possible `@import` and `url()` lookups within the matched files and treats them as a regular `require`.

This process allows us to rely on various other loaders, such as [file-loader](https://www.npmjs.com/package/file-loader) or [url-loader](https://www.npmjs.com/package/url-loader). If an `@import` points to an external resource, *css-loader* will skip it. Only internal resources get processed further by webpack.

After *css-loader* has done its part, *style-loader* picks up the output and injects the CSS into the resulting bundle. This will be inlined JavaScript by default and it implements the HMR interface. As inlining isn't a good idea for production usage, it makes sense to use `ExtractTextPlugin` to generate a separate CSS file. We'll do this in the next chapter.

To get started, invoke

```bash
npm i css-loader style-loader --save-dev
```

Now let's make sure webpack is aware of them. Configure as follows:

**webpack.parts.js**

```javascript
...

leanpub-start-insert
exports.loadCSS = function(paths) {
  return {
    module: {
      rules: [
        {
          test: /\.css$/,
          // Restrict extraction process to the given
          // paths.
          include: paths,

          use: ['style-loader', 'css-loader']
        }
      ]
    }
  };
};
leanpub-end-insert
```

We also need to connect our configuration fragment with the main configuration:

**webpack.config.js**

```javascript
...

module.exports = function(env) {
  return merge(
    common,
    {
      // Disable performance hints during development
      performance: {
        hints: false
      },
      plugins: [
        new webpack.NamedModulesPlugin()
      ]
    },
leanpub-start-insert
    parts.loadCSS(),
leanpub-end-insert
    parts.devServer({
      // Customize host/port here if needed
      host: process.env.HOST,
      port: process.env.PORT
    })
  );
};
```

The configuration we added means that files ending with `.css` should invoke given loaders. `test` matches against a JavaScript style regular expression. The loaders are evaluated from right to left.

T> Loaders are transformations that are applied to source files, and return the new source. Loaders can be chained together, like using a pipe in Unix. `loaders: ['style-loader', 'css-loader']` can be read as `styleLoader(cssLoader(input))`.

## Setting Up the Initial CSS

We are missing just one bit, the actual CSS itself:

**app/main.css**

```css
body {
  background: cornsilk;
}
```

Also, we'll need to make webpack aware of it. Without having an entry pointing at it somehow, webpack won't be able to find the file:

**app/index.js**

```javascript
leanpub-start-insert
import './main.css';
leanpub-end-insert
import component from './component';

...
```

Execute `npm start` now. Browse to **localhost:8080** if you are using the default port and open up *main.css* and change the background color to something like `lime` (`background: lime`). Develop styles as needed to make it look a little nicer. Note that it does **not** perform a hard refresh on the browser since we have HMR setup in place.

We'll continue from here in the next chapter. Before that, though, I will discuss several styling related techniques you may find useful. If you want, integrate some of them to your project.

![Hello cornsilk world](images/hello_02.png)

T> An alternative way to load CSS would be to define a separate entry and point to the CSS there. Coupling styling to application code can be a nice way to handle it, though, as then you can see which styling is related to what file. This also enables the usage of CSS Modules with a bit of extra effort.

## Understanding CSS Scoping and CSS Modules

Perhaps the biggest challenge of CSS is that all rules exist within **global scope**. This has lead to specific conventions that work around this feature. A specification known as [CSS Modules](https://github.com/css-modules/css-modules) solves the problem by introducing **local scope** per `import`. As it happens, this makes CSS more bearable to use as you don't have to worry about namespace collisions anymore.

Enabling CSS Modules in webpack is simple as *css-loader* supports the feature. You can enable it through `css-loader?modules` or set `modules` field `true` through the loader `options`.

After this change your class definitions will remain local to the files. In case you want global class definitions, you'll need to wrap them within `:global(.redButton) { ... }` kind of declarations.

In this case the `import` statement will give you the local classes you can then bind to elements. Assuming we had styling like this:

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

Note that `body` remains as a global declaration still. It's that `redButton` that makes the difference. You can build component specific styles that don't leak elsewhere this way.

CSS Modules provides also features like composition to make it even easier to work with your styles. You can also combine it with other loaders as long as you apply them before *css-loader*.

T> The query syntax, `css-loader?modules`, and its alternatives is discussed in greater detail in the *Loader Definitions* chapter. There are multiple ways to achieve the same effect in webpack some of which are clearer than others.

T> CSS Modules behavior can be modified [as discussed in the official documentation](https://www.npmjs.com/package/css-loader#local-scope). You have control over the names it generates for instance.

## Loading LESS

![LESS](images/less.png)

[LESS](http://lesscss.org/) is a CSS processor that is packed with functionality. Using LESS doesn't take a lot of effort through webpack as [less-loader](https://www.npmjs.com/package/less-loader) deals with the heavy lifting. You should install [less](https://www.npmjs.com/package/less) as well given it's a peer dependency of *less-loader*.

Consider the following minimal setup:

```javascript
{
  test: /\.less$/,
  use: ['style-loader', 'css-loader', 'less-loader']
}
```

There is also support for Less plugins, sourcemaps, and so on. To understand how those work you should check out the project itself.

## Loading SASS

![SASS](images/sass.png)

[SASS](http://sass-lang.com/) is a widely used CSS preprocessor. You should use [sass-loader](https://www.npmjs.com/package/sass-loader) with it. Remember to install [node-sass](https://www.npmjs.com/package/node-sass) to your project as it's a peer dependency.

Webpack doesn't take much configuration:

**webpack.config.js**

```javascript
{
  test: /\.scss$/,
  use: ['style-loader', 'css-loader', 'sass-loader']
}
```

T> If you want more performance especially during development, check out [fast-sass-loader](https://www.npmjs.com/package/fast-sass-loader).

## Loading Stylus and YETICSS

![Stylus](images/stylus.png)

[Stylus](http://stylus-lang.com/) is yet another example of a CSS processor. It works well through [stylus-loader](https://github.com/shama/stylus-loader). There's also a pattern library known as [yeticss](https://www.npmjs.com/package/yeticss) that works well with it. Consider the following configuration:

**webpack.config.js**

```javascript
const common = {
  ...
  module: {
    rules: [
      {
        test: /\.styl$/,
        use: ['style-loader', 'css-loader', 'stylus-loader']
      }
    ]
  },
  plugins: [
    new webpack.LoaderOptionsPlugin({
      options: {
        // yeticss
        stylus: {
          use: [require('yeticss')]
        }
      }
    })
  ]
};
```

To start using yeticss with Stylus, you must import it to one of your app's .styl files:

```javascript
@import 'yeticss'

//or
@import 'yeticss/components/type'
```

## PostCSS

![PostCSS](images/postcss.png)

[PostCSS](http://postcss.org/) allows you to perform transformations over CSS through JavaScript plugins. You can even find plugins that provide you Sass-like features. PostCSS can be thought as the equivalent of Babel for styling. It can be used through [postcss-loader](https://www.npmjs.com/package/postcss-loader) with webpack.

The example below illustrates how to set up autoprefixing using it. It also sets up [precss](https://www.npmjs.com/package/precss), a PostCSS plugin that allows you to use Sass-like markup in your CSS. You can mix this technique with other loaders to allow autoprefixing there.

**webpack.config.js**

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader']
      }
    ]
  }
};
```

In addition to webpack configuration, we need to set up some for PostCSS:

**postcss.config.js**

```javascript
module.exports = {
  plugins: {
    autoprefixer: {},
    precss: {}
  }
};
```

For this to work, you will have to remember to include [autoprefixer](https://www.npmjs.com/package/autoprefixer) and [precss](https://www.npmjs.com/package/precss) to your project.

T> *postcss-loader* relies on [cosmiconfig](https://www.npmjs.com/package/cosmiconfig) internally. This means it can pick up configuration from your *package.json*, JSON or YAML, or that you can even push your configuration below an arbitrary directory. *cosmiconfig* will find it.

### cssnext

![cssnext](images/cssnext.jpg)

[cssnext](http://cssnext.io/) is a PostCSS plugin that allows us to experience the future now. There are some restrictions, but it may be worth a go. You can use it through [postcss-cssnext](https://www.npmjs.com/package/postcss-cssnext) and you can enable it as follows.

**postcss.config.js**

```javascript
module.exports = {
  plugins: {
    cssnext: {}
  }
};
```

See [the usage documentation](http://cssnext.io/usage/) for available options.

T> Note that cssnext includes autoprefixer! You don't have to configure autoprefixing separately for it to work in this case.

## Understanding Lookups

If you import one LESS/SASS file from another, use the exact same pattern as anywhere else. Webpack will dig into these files and figure out the dependencies.

```less
@import "./variables.less";
```

You can also load LESS and SASS files directly from your node_modules directory. This is handy with libraries like Twitter Bootstrap:

```less
@import "~bootstrap/less/bootstrap";
```

The tilde (`~`) tells webpack that it's not a relative import as by default. If tilde is included, it will perform a lookup against `node_modules` (default setting) although this is configurable through the [resolve.modules](https://webpack.js.org/configuration/resolve/#resolve-modules) field.

[resolve-url-loader](https://www.npmjs.com/package/resolve-url-loader) makes it possible to specify `url()`'s relative to the file location. This is particularly useful with *sass-loader*.

## Enabling Sourcemaps

If you want to enable sourcemaps for CSS, you should enable `sourceMap` option for *css-loader* and set `output.publicPath` to an absolute url. In case you have more loaders, each needs to enable sourcemap support separately! *css-loader* [issue 29](https://github.com/webpack/css-loader/issues/29) discusses this problem further.

## Using Bootstrap

There are a couple of ways to use [Bootstrap](https://getbootstrap.com/) through webpack. One option is to point to the [npm version](https://www.npmjs.com/package/bootstrap) and perform loader configuration as above.

The [SASS version](https://www.npmjs.com/package/bootstrap-sass) is another option. In this case you should set `precision` option of *sass-loader* to at least 8. This is [a known issue](https://www.npmjs.com/package/bootstrap-sass#sass-number-precision) explained at *bootstrap-sass*.

Third option is to go through [bootstrap-loader](https://www.npmjs.com/package/bootstrap-loader). It does a lot more, but allows customization.

## Converting CSS to Strings

Especially with Angular 2 it can be useful if you can get CSS in a string format that can be pushed to components. [css-to-string-loader](https://www.npmjs.com/package/css-to-string-loader) achieves exactly this.

## Conclusion

Loading style files through webpack is fairly straight-forward. It supports even advanced specifications like [CSS Modules](https://github.com/css-modules/webpack-demo). The approaches covered here inline the styling by default. Although that's enough for development purposes, it's not ideal for production usage. We'll cover how to handle this problem in the next chapter.
