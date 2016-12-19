# Cleaning the Build

Our current setup doesn't clean the `build` directory between builds. As this can get annoying if we change our setup, we can use a plugin to clean the directory for us.

Another valid way to resolve the issue would be to handle this outside of webpack. You could solve it on the system level through a npm script. In this case you would trigger `rm -rf ./build && webpack` or `rimraf ./build && webpack` to keep it cross-platform. A task runner could work as well.

## Setting Up *clean-webpack-plugin*

Install the [clean-webpack-plugin](https://www.npmjs.com/package/clean-webpack-plugin) first:

```bash
npm i clean-webpack-plugin --save-dev
```

Next we need to define a little function to wrap the basic idea. We could use the plugin directly, but this feels like something that could be useful across projects so it makes sense to push to our library:

**webpack.parts.js**

```javascript
const webpack = require('webpack');
leanpub-start-insert
const CleanWebpackPlugin = require('clean-webpack-plugin');
leanpub-end-insert

...

leanpub-start-insert
exports.clean = function(path) {
  return {
    plugins: [
      new CleanWebpackPlugin([path], {
        // Without `root` CleanWebpackPlugin won't point to our
        // project and will fail to work.
        root: process.cwd()
      })
    ]
  };
}
leanpub-end-insert
```

We can connect it with our project like this:

**webpack.config.js**

```javascript
...

module.exports = function(env) {
  if (env === 'build') {
    return merge(
      common,
      {
        devtool: 'source-map',
        output: {
          path: PATHS.build,
          filename: '[name].[chunkhash].js',
          // This is used for code splitting. The setup
          // will work without but this is useful to set.
          chunkFilename: '[chunkhash].js'
        }
      },
leanpub-start-insert
      parts.clean(PATHS.build),
leanpub-end-insert
      ...
    };
  }

  ...
};
```

After this change, our `build` directory should remain nice and tidy when building. You can verify this by building the project and making sure no old files remained in the output directory.

T> If you want to preserve possible dotfiles within your build directory, you can use `path.join(PATHS.build, '*')` instead of `PATHS.build`.

## Conclusion

Our build is starting to get pretty neat now. There's one major issue, though. Our CSS has been inlined with JavaScript. This can result in the dreaded **Flash of Unstyled Content** (FOUC). It's also not ideal caching-wise.

A small change to the CSS would invalidate our `app` bundle. This doesn't hurt during development, but it's not something we want to experience in production. We can resolve this problem by separating our CSS to a file of its own.
