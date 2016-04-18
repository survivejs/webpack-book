# Enabling Sourcemaps

To improve the debuggability of the application, we can set up sourcemaps. They allow you to see exactly where an error was raised. In Webpack this is controlled through the `devtool` setting. Webpack can generate both inline sourcemaps included to within bundles or separate sourcemap files. Former is useful during development due to better performance while latter is handy for production usage.

## Enabling Sourcemaps during Development

To enable sourcemaps during development, we can use a decent default known as `eval-source-map` like this:

**webpack.config.js**

```javascript
...

switch(process.env.npm_lifecycle_event) {
  case 'build':
    config = merge(common, {});
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

It is possible you may need to enable sourcemaps in your browser for this to work. See [Chrome](https://developer.chrome.com/devtools/docs/javascript-debugging) and [Firefox](https://developer.mozilla.org/en-US/docs/Tools/Debugger/How_to/Use_a_source_map) instructions for further details.

T> [The official documentation](https://webpack.github.io/docs/configuration.html#devtool) covers sourcemap options in greater detail.

## Conclusion

Sourcemaps can be convenient during development. They provide us better means to debug our applications as we can still examine the original code over generated one. The next chapter covers a Webpack plugin known as *npm-install-webpack-plugin*. Plugins like this allow us to push our development flow further. All of these little improvements count.
