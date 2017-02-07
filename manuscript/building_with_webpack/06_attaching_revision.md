# Attaching Revision to the Build

It can be useful to attach information about the current build revision to the build files themselves. This can be achieved using [webpack.BannerPlugin](https://webpack.js.org/plugins/banner-plugin/). It can be used in combination with [git-revision-webpack-plugin](https://www.npmjs.com/package/git-revision-webpack-plugin) to generate a small comment at the beginning of the generated files.

## Setting Up `BannerPlugin` and `GitRevisionPlugin`

To get started, install the revision plugin:

```bash
npm install git-revision-webpack-plugin --save-dev
```

Then define a part to wrap the idea:

**webpack.parts.js**

```javascript
...
leanpub-start-insert
const GitRevisionPlugin = require('git-revision-webpack-plugin');
leanpub-end-insert

...

leanpub-start-insert
exports.attachRevision = function() {
  return {
    plugins: [
      new webpack.BannerPlugin({
        banner: new GitRevisionPlugin().version(),
      }),
    ],
  };
};
leanpub-end-insert

...
```

And connect it to the main configuration:

**webpack.config.js**

```javascript
...

function production() {
  return merge([
    common,
    parts.clean(PATHS.build),
leanpub-start-insert
    parts.attachRevision(),
leanpub-end-insert
    ...
  ]);
}

...
```

If you build the project (`npm run build`), you should notice the built files contain comments like `/*! v1.7.0-9-g5f82fe8 */` in the beginning.

The output can be customized further by adjusting the banner. You can also pass revision information to the application using `webpack.DefinePlugin`. This technique is discussed in greater detail at the *Setting Environments Chapter*.

## Copying Files

Copying files is another common operation you can handle with webpack. [copy-webpack-plugin](https://www.npmjs.com/package/copy-webpack-plugin) can be handy if you need to bring external files to your build without having webpack pointing at them directly.

[cpy-cli](https://www.npmjs.com/package/cpy-cli) is a good option if you want to copy outside of webpack in a cross-platform way. Plugins should be cross-platforms by definition.

## Conclusion

Attaching a revision number to the build can be handy during debugging. Instead of having to guess, you can see the deployed version straight from the file.
