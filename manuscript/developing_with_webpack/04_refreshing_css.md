# Refreshing CSS

In this chapter we'll set up CSS with our project and see how it works out with automatic browser refreshing. The neat thing is that in this case webpack doesn't have to force a full refresh. Instead, it can do something smarter as we'll see soon.

## Loading CSS

To set up CSS, we'll need to use a couple of loaders. To get started, invoke

```bash
npm i css-loader style-loader --save-dev
```

Now let's make sure webpack is aware of them. Configure as follows:

**webpack.parts.js**

```javascript
...

leanpub-start-insert
exports.setupCSS = function(paths) {
  return {
    module: {
      rules: [
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
          include: paths
        }
      ]
    }
  };
}
leanpub-end-insert
```

We also need to connect our configuration fragment with the main configuration:

**webpack.config.js**

```javascript
...

module.exports = function(env) {
  if (env === 'production') {
leanpub-start-delete
    return merge(common);
leanpub-end-delete
leanpub-start-insert
    return merge(
      common,
      parts.setupCSS(PATHS.app)
    );
leanpub-end-insert
  }

  return merge(
    common,
    {
      // Disable performance hints during development
      performance: {
        hints: false
      }
    },
leanpub-start-insert
    parts.setupCSS(PATHS.app),
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

In this case, *css-loader* gets evaluated first, then *style-loader*. *css-loader* will resolve `@import` and `url` statements in our CSS files. *style-loader* deals with `require` statements in our JavaScript. A similar approach works with CSS preprocessors, like Sass and Less, and their loaders.

T> Loaders are transformations that are applied to source files, and return the new source. Loaders can be chained together, like using a pipe in Unix. `loaders: ['style-loader', 'css-loader']` can be read as `styleLoader(cssLoader(input))`.

T> See webpack's [loader documentation](https://webpack.js.org/concepts/loaders/) and [list of loaders](https://webpack.js.org/loaders/) for further information.

W> If `include` isn't set, webpack will traverse all files within the base directory. This can hurt performance! It is a good idea to set up `include` always. There's also `exclude` option that may come in handy. Prefer `include`, however as it's literally more inclusive option.

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
require('./main.css');
leanpub-end-insert

...
```

Execute `npm start` now. Browse to **localhost:8080** if you are using the default port and open up *main.css* and change the background color to something like `lime` (`background: lime`). Develop styles as needed to make it look a little nicer. Note that it does **not** perform a hard refresh on the browser.

![Hello cornsilk world](images/hello_02.png)

T> An alternative way to load CSS would be to define a separate entry through which we point at the CSS. We'll apply this technique later in the book.

## Understanding CSS Scoping and CSS Modules

When you `require` a CSS file like this, webpack will include it to the bundle where you `require` it. Assuming you are using the *style-loader*, webpack will write it to a `style` tag. This means it's going to be in a global scope by default!

Specification known as [CSS Modules](https://github.com/css-modules/css-modules) allows you to default to local scoping and webpack's *css-loader* supports it. So if you want local scope by default over a global one, enable them through `css?modules`. After this you'll need to wrap your global styles within `:global(body) { ... }` kind of declarations.

T> The query syntax, `css?modules`, and its alternatives is discussed in greater detail in the *Loader Definitions* chapter. There are multiple ways to achieve the same effect in webpack some of which are clearer than others.

In this case the `require` statement will give you the local classes you can then bind to elements. Assuming we had styling like this:

**app/main.css**

```css
:local(.redButton) {
  background: red;
}
```

We could then bind the resulting class to a component like this:

**app/component.js**

```javascript
var styles = require('./main.css');

...

// Attach the generated class name
element.className = styles.redButton;
```

Even though this might feel like a strange way of working, defaulting to local scoping can take away a lot of pain you encounter with CSS. We'll be using old skool styling in this little demonstration project of ours, but it's a good technique to be aware of. It even enables features like composition so it's worth knowing.

## Conclusion

In this chapter, you learned to set up webpack to refresh your browser during development. The next chapter covers a convenience feature known as sourcemaps.
