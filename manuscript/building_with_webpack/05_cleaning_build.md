# Cleaning the Build

Our current setup doesn't clean the *build* directory between builds. As a result, it will keep on accumulating files as our project changes. Given this can get annoying, we should clean it up in between.

This issue can be resolved either by using a webpack plugin or solving it outside of it. You could trigger `rm -rf ./build && webpack` or `rimraf ./build && webpack` in a npm script to keep it cross-platform. A task runner could work for this purpose as well.

I will show you how to solve this issue using webpack next.

## Setting Up `CleanWebpackPlugin`

Install the [clean-webpack-plugin](https://www.npmjs.com/package/clean-webpack-plugin) first:

```bash
npm install clean-webpack-plugin --save-dev
```

Next, we need to define a little function to wrap the basic idea. We could use the plugin directly, but this feels like something that could be useful across projects, so it makes sense to push it to our library:

**webpack.parts.js**

```javascript
...
leanpub-start-insert
const CleanWebpackPlugin = require('clean-webpack-plugin');
leanpub-end-insert

...

leanpub-start-insert
exports.clean = function(path) {
  return {
    plugins: [
      new CleanWebpackPlugin([path]),
    ],
  };
};
leanpub-end-insert
```

Connect it with our project like this:

**webpack.config.js**

```javascript
...

const productionConfig = merge([
leanpub-start-insert
  parts.clean(PATHS.build),
leanpub-end-insert
  ...
]);

...
```

After this change, our `build` directory should remain nice and tidy while building. You can verify this by building the project and making sure no old files remained in the output directory.

## Conclusion

Often, you work with webpack like this: First, you identify a problem and then find a plugin to tackle it. It is entirely fine to solve these types of issues outside of webpack, but webpack can often handle them as well.

T> The *Deploying Applications* appendix discusses how to get your application online. It would be possible to host the demo application even in its current state.
