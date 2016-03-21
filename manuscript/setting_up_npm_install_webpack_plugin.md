# Setting Up *npm-install-webpack-plugin*

In order to avoid some typing, we can set up a Webpack plugin known as [npm-install-webpack-plugin](https://www.npmjs.com/package/npm-install-webpack-plugin). As we develop the project, it will detect changes made to Webpack configuration and the projects files and install the dependencies for us. It will modify *package.json* automatically as well.

You can still install dependencies manually if you want. Any dependencies within `app` should be installed through `--save` (or `-S`). Root level dependencies (i.e. packages needed by Webpack), should be installed through `--save-dev` (or `-D`). This separation will become handy when we generate production bundles at *Building Kanban*.

## Setting Up *npm-install-webpack-plugin*

To get *npm-install-webpack-plugin* installed, execute:

```bash
npm i npm-install-webpack-plugin --save-dev
```

We also need to connect it with our configuration:

**webpack.config.js**

```javascript
const path = require('path');
const merge = require('webpack-merge');
const webpack = require('webpack');
leanpub-start-insert
const NpmInstallPlugin = require('npm-install-webpack-plugin');
leanpub-end-insert

...

// Default configuration
if(TARGET === 'start' || !TARGET) {
  module.exports = merge(common, {
    ...
    plugins: [
leanpub-start-delete
      new webpack.HotModuleReplacementPlugin(),
leanpub-end-delete
leanpub-start-insert
      new webpack.HotModuleReplacementPlugin(),
      new NpmInstallPlugin({
        save: true // --save
      })
leanpub-end-insert
    ]
  });
}

if(TARGET === 'build') {
  module.exports = merge(common, {});
}
```

After this change we can save quite a bit of typing and context switches.

## Conclusion

There's not more than this to it. This is the way you work with Webpack plugins. Each comes with options of its own so make sure you study the plugins in detail to get a better idea of their capabilities.

Our build configuration isn't that sophisticated yet, though. I'll show you how to push it further in the next chapter.
