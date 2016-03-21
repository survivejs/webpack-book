# Refreshing CSS

We can extend automatic browser refreshing to work with CSS. Webpack doesn't even have to force a full refresh in this case.

## Loading CSS

To load CSS into a project, we'll need to use a couple of loaders. To get started, invoke

```bash
npm i css-loader style-loader --save-dev
```

Now that we have the loaders we need, we'll need to make sure Webpack is aware of them. Configure as follows:

**webpack.config.js**

```javascript
...

const common = {
  ...
leanpub-start-delete
  }
leanpub-end-delete
leanpub-start-insert
  },
  module: {
    loaders: [
      {
        // Test expects a RegExp! Note the slashes!
        test: /\.css$/,
        loaders: ['style', 'css'],
        // Include accepts either a path or an array of paths.
        include: PATHS.app
      }
    ]
  }
leanpub-end-insert
}

...
```

The configuration we added means that files ending with `.css` should invoke given loaders. `test` matches against a JavaScript style regular expression. The loaders are evaluated from right to left.

In this case, *css-loader* gets evaluated first, then *style-loader*. *css-loader* will resolve `@import` and `url` statements in our CSS files. *style-loader* deals with `require` statements in our JavaScript. A similar approach works with CSS preprocessors, like Sass and Less, and their loaders.

T> Loaders are transformations that are applied to source files, and return the new source. Loaders can be chained together, like using a pipe in Unix. See Webpack's [What are loaders?](http://webpack.github.io/docs/using-loaders.html) and [list of loaders](http://webpack.github.io/docs/list-of-loaders.html).

W> If `include` isn't set, Webpack will traverse all files within the base directory. This can hurt performance! It is a good idea to set up `include` always. There's also `exclude` option that may come in handy. Prefer `include`, however.

## Setting Up the Initial CSS

We are missing just one bit, the actual CSS itself:

**app/main.css**

```css
body {
  background: cornsilk;
}
```

Also, we'll need to make Webpack aware of it. Without having a `require` pointing at it, Webpack won't be able to find the file:

**app/index.js**

```javascript
leanpub-start-insert
require('./main.css');
leanpub-end-insert

...
```

Execute `npm start` now. Point your browser to **localhost:8080** if you are using the default port.

Open up *main.css* and change the background color to something like `lime` (`background: lime`). Develop styles as needed to make it look a little nicer.

![Hello cornsilk world](images/hello_02.png)

T> An alternative way to load CSS would be to define a separate entry through which we point at CSS.

## Enabling Sourcemaps

To improve the debuggability of the application, we can set up sourcemaps. They allow you to see exactly where an error was raised. In Webpack this is controlled through the `devtool` setting. We can use a decent default as follows:

**webpack.config.js**

```javascript
...

if(TARGET === 'start' || !TARGET) {
  module.exports = merge(common, {
leanpub-start-insert
    devtool: 'eval-source-map',
leanpub-end-insert
    ...
  });
}

...
```

If you run the development build now using `npm start`, Webpack will generate sourcemaps. Webpack provides many different ways to generate them as discussed in the [official documentation](https://webpack.github.io/docs/configuration.html#devtool). In this case, we're using `eval-source-map`. It builds slowly initially, but it provides fast rebuild speed and yields real files.

Faster development specific options, such as `cheap-module-eval-source-map` and `eval`, produce lower quality sourcemaps. All `eval` options will emit sourcemaps as a part of your JavaScript code. Therefore they are not suitable for a production environment. Given size isn't an issue during development, they tend to be a good fit for that use case.

It is possible you may need to enable sourcemaps in your browser for this to work. See [Chrome](https://developer.chrome.com/devtools/docs/javascript-debugging) and [Firefox](https://developer.mozilla.org/en-US/docs/Tools/Debugger/How_to/Use_a_source_map) instructions for further details.

## Conclusion

In this chapter, you learned to set up Webpack to refresh your browser during development. I'll discuss a Webpack plugin known as *npm-install-webpack-plugin* in the next chapter. Plugins like this allow us to push our development flow further. All of these little improvements count.
