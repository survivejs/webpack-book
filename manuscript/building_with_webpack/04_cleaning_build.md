# Cleaning the Build

Our current setup doesn't clean the *build* directory between builds. As a result it will keep on accumulating files as our project changes. Given this can get annoying, we should clean it up in between.

This issue can be resolved either by using a webpack plugin or solving it outside of it. You could trigger `rm -rf ./build && webpack` or `rimraf ./build && webpack` in a npm script to keep it cross-platform. A task runner could work for this purpose as well.

I will show you how to solve this issue using webpack next.

## Setting Up *clean-webpack-plugin*

Install the [clean-webpack-plugin](https://www.npmjs.com/package/clean-webpack-plugin) first:

```bash
npm i clean-webpack-plugin --save-dev
```

Next we need to define a little function to wrap the basic idea. We could use the plugin directly, but this feels like something that could be useful across projects so it makes sense to push to our library:

**webpack.parts.js**

```javascript
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const PurifyCSSPlugin = require('purifycss-webpack-plugin');
leanpub-start-insert
const CleanWebpackPlugin = require('clean-webpack-plugin');
leanpub-end-insert

...

leanpub-start-insert
exports.clean = function(path) {
  return {
    plugins: [
      new CleanWebpackPlugin([path])
    ]
  };
};
leanpub-end-insert
```

Connect it with our project like this:

**webpack.config.js**

```javascript
...

module.exports = function(env) {
  if (env === 'production') {
    return merge(
      common,
      parts.extractBundle({
        name: 'vendor',
        entries: ['react']
      }),
leanpub-start-insert
      parts.clean(PATHS.build),
leanpub-end-insert
      parts.generateSourcemaps('source-map'),
      parts.extractCSS(),
      parts.purifyCSS([PATHS.app])
    );
  }

  ...
};
```

After this change, our `build` directory should remain nice and tidy while building. You can verify this by building the project and making sure no old files remained in the output directory.

T> Copying files is another common operation you can handle with a webpack plugin such as [copy-webpack-plugin](https://www.npmjs.com/package/copy-webpack-plugin). It can be handy if you need to bring external files to your build without having webpack pointing at them directly.

## Conclusion

Often you work with webpack like this. First you identify a problem and then find a plugin to tackle it. It is entirely fine to solve these type of issues outside of webpack, but webpack can often handle them as well.

I will show you how to deploy the project in the next chapter. After that we will move onto build optimization.
