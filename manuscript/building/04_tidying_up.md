# Tidying Up

The current setup doesn't clean the _build_ directory between builds. As a result, it keeps on accumulating files as the project changes. Given this can get annoying, you should clean it up in between.

Another nice touch would be to include information about the build itself to the generated bundles as a small comment at the top of each file, including version information at least.

## Cleaning the build directory

Starting from webpack 5.20, it supports cleaning out of the box by using the following configuration:

```javascript
const config = {
  output: {
    clean: true,
  },
};
```

For earlier versions, you can either use [clean-webpack-plugin](https://www.npmjs.com/package/clean-webpack-plugin) or solve the problem outside of webpack. You could for example trigger `rm -rf ./build && webpack` or `rimraf ./build && webpack` in an npm script to keep it cross-platform.

{pagebreak}

### Setting up `output.clean`

To wrap the syntax into a function, add a function as follows.

**webpack.parts.js**

```javascript
exports.clean = () => ({
  output: {
    clean: true,
  },
});
```

Connect the configuration as follows:

**webpack.config.js**

```javascript
leanpub-start-insert
const path = require("path");
leanpub-end-insert

const commonConfig = merge([
leanpub-start-insert
  parts.clean(),
leanpub-end-insert
  ...
]);
```

After this change, the `build` directory should remain tidy while building and developing. You can verify this by building the project and making sure no old files remained in the output directory.

## Attaching a revision to the build

Attaching information related to the current build revision to the build files themselves can be used for debugging. [webpack.BannerPlugin](https://webpack.js.org/plugins/banner-plugin/) allows you to achieve this. It can be used in combination with [git-revision-webpack-plugin](https://www.npmjs.com/package/git-revision-webpack-plugin) to generate a small comment at the beginning of the generated files.

### Setting up `BannerPlugin` and `GitRevisionPlugin`

To get started, install the revision plugin:

```bash
npm add git-revision-webpack-plugin -D
```

Then define a part to wrap the idea:

**webpack.parts.js**

```javascript
const webpack = require("webpack");
const { GitRevisionPlugin } = require("git-revision-webpack-plugin");

exports.attachRevision = () => ({
  plugins: [
    new webpack.BannerPlugin({
      banner: new GitRevisionPlugin().version(),
    }),
  ],
});
```

And connect it to the main configuration:

**webpack.config.js**

```javascript
const productionConfig = merge([
  ...
leanpub-start-insert
  parts.attachRevision(),
leanpub-end-insert
]);
```

If you build the project (`npm run build`), you should notice the files ending with `.LICENSE.txt` containing comments like `/*! 0b5bb05 */` or `/*! v1.7.0-9-g5f82fe8 */` in the beginning.

The output can be customized further by adjusting the banner. You can also pass revision information to the application using `webpack.DefinePlugin`. This technique is discussed in detail in the _Environment Variables_ chapter.

W> The code expects you run it within a Git repository! Otherwise, you get a `fatal: Not a git repository (or any of the parent directories): .git` error. If you are not using Git, you can replace the banner with other data.

## Copying files

Copying files is another ordinary operation you can handle with webpack. [copy-webpack-plugin](https://www.npmjs.com/package/copy-webpack-plugin) can be handy if you need to bring external data to your build without having webpack pointing at them directly.

[cpy-cli](https://www.npmjs.com/package/cpy-cli) is a good option if you want to copy outside of webpack in a cross-platform way. Plugins should be cross-platform by definition.

## Conclusion

Often, you work with webpack by identifying a problem and then discovering a plugin to tackle it. It's entirely acceptable to solve these types of issues outside of webpack, but webpack can often handle them as well.

To recap:

- You can find many small plugins that work as tasks and push webpack closer to a task runner.
- These tasks include cleaning the build and deployment. The _Deploying Applications_ chapter discusses the latter topic in detail.
- It can be a good idea to add small comments to the production build to tell what version has been deployed. This way you can debug potential issues faster.
- Secondary tasks, like these, can be performed outside of webpack. If you are using a multi-page setup as discussed in the _Multiple Pages_ chapter, this becomes a necessity.
