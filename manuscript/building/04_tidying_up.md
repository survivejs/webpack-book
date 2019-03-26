# Tidying Up

The current setup doesn't clean the *build* directory between builds. As a result, it keeps on accumulating files as the project changes. Given this can get annoying, you should clean it up in between.

Another nice touch would be to include information about the build itself to the generated bundles as a small comment at the top of each file including version information at least.

## Cleaning the Build Directory

This issue can be resolved either by using a webpack plugin or solving it outside of it. You could trigger `rm -rf ./build && webpack` or `rimraf ./build && webpack` in an npm script to keep it cross-platform. A task runner could work for this purpose as well.

### Setting Up `CleanWebpackPlugin`

Install the [clean-webpack-plugin](https://www.npmjs.com/package/clean-webpack-plugin) first:

```bash
npm install clean-webpack-plugin --save-dev
```

{pagebreak}

Next, you need to define a function to wrap the basic idea. You could use the plugin directly, but this feels like something that could be used across projects, so it makes sense to push it to the library:

**webpack.parts.js**

```javascript
...
const CleanWebpackPlugin = require("clean-webpack-plugin");

exports.clean = path => ({
  plugins: [new CleanWebpackPlugin()],
});
```

Connect it with the project:

**webpack.config.js**

```javascript
...

const productionConfig = merge([
leanpub-start-insert
  parts.clean(),
leanpub-end-insert
  ...
]);
```

After this change, the `build` directory should remain nice and tidy while building. You can verify this by building the project and making sure no old files remained in the output directory.

{pagebreak}

## Attaching a Revision to the Build

Attaching information related to the current build revision to the build files themselves can be used for debugging. [webpack.BannerPlugin](https://webpack.js.org/plugins/banner-plugin/) allows you to achieve this. It can be used in combination with [git-revision-webpack-plugin](https://www.npmjs.com/package/git-revision-webpack-plugin) to generate a small comment at the beginning of the generated files.

### Setting Up `BannerPlugin` and `GitRevisionPlugin`

To get started, install the revision plugin:

```bash
npm install git-revision-webpack-plugin --save-dev
```

Then define a part to wrap the idea:

**webpack.parts.js**

```javascript
...
const webpack = require("webpack");
const GitRevisionPlugin = require("git-revision-webpack-plugin");

exports.attachRevision = () => ({
  plugins: [
    new webpack.BannerPlugin({
      banner: new GitRevisionPlugin().version(),
    }),
  ],
});
```

{pagebreak}

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

If you build the project (`npm run build`), you should notice the built files contain comments like `/*! 0b5bb05 */` or `/*! v1.7.0-9-g5f82fe8 */` in the beginning.

The output can be customized further by adjusting the banner. You can also pass revision information to the application using `webpack.DefinePlugin`. This technique is discussed in detail in the *Environment Variables* chapter.

W> The code expects you run it within a Git repository! Otherwise, you get a `fatal: Not a git repository (or any of the parent directories): .git` error. If you are not using Git, you can replace the banner with other data.

## Copying Files

Copying files is another ordinary operation you can handle with webpack. [copy-webpack-plugin](https://www.npmjs.com/package/copy-webpack-plugin) can be handy if you need to bring external data to your build without having webpack pointing at them directly.

[cpy-cli](https://www.npmjs.com/package/cpy-cli) is a good option if you want to copy outside of webpack in a cross-platform way. Plugins should be cross-platforms by definition.

## Conclusion

Often, you work with webpack by identifying a problem and then finding a plugin to tackle it. It's entirely acceptable to solve these types of issues outside of webpack, but webpack can often handle them as well.

To recap:

* You can find many small plugins that work as tasks and push webpack closer to a task runner.
* These tasks include cleaning the build and deployment. The *Deploying Applications* chapter discusses the latter topic in detail.
* It can be a good idea to add small comments to the production build to tell what version has been deployed. This way you can debug potential issues faster.
* Secondary tasks like these can be performed outside of webpack. If you are using a multi-page setup as discussed in the *Multiple Pages* chapter, this becomes a necessity.
