# Cleaning the Build

Our current setup doesn't clean the `build` directory between builds. As this can get annoying if we change our setup, we can use a plugin to clean the directory for us.

Another valid way to resolve the issue would be to handle this outside of Webpack. You could set solve it on the system level through a npm script. In this case you would trigger `rm -rf ./build && webpack`. Alternatively a task runner could work as well.

## Setting Up *clean-webpack-plugin*

Install [clean-webpack-plugin](https://www.npmjs.com/package/clean-webpack-plugin) and change the build configuration as follows to integrate it:

```bash
npm i clean-webpack-plugin --save-dev
```

**webpack.config.js**

```javascript
...
leanpub-start-insert
const CleanWebpackPlugin = require('clean-webpack-plugin');
leanpub-end-insert

...

if(TARGET === 'build') {
  module.exports = merge(common, {
    ...
    plugins: [
leanpub-start-insert
      new CleanWebpackPlugin([PATHS.build]),
leanpub-end-insert
      ...
    ]
  });
}
```

After this change, our `build` directory should remain nice and tidy when building. You can verify this by building the project and making sure no old files remained in the output directory.

T> If you want to preserve possible dotfiles within your build directory, you can use `[path.join(PATHS.build, '/*')]` instead of `[PATHS.build]`.

## Conclusion

Our build is starting to get pretty neat now. There's one major issue, though. Our CSS has been inlined with JavaScript. This can result in the dreaded **Flash of Unstyled Content** (FOUC). It's also not ideal caching-wise.

A small change to the CSS would invalidate our `app` bundle. This doesn't hurt during development, but it's not something we want to experience in production. We can resolve this problem by separating our CSS to a file of its own.
