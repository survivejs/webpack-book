# Setting Up *npm-install-webpack-plugin*

In order to avoid some typing, we can set up a Webpack plugin known as [npm-install-webpack-plugin](https://www.npmjs.com/package/npm-install-webpack-plugin). As we develop the project, it will detect changes made to Webpack configuration and the projects files and install the dependencies for us. It will modify *package.json* automatically as well.

## Setting Up *npm-install-webpack-plugin*

To get *npm-install-webpack-plugin* installed, execute:

```bash
npm i npm-install-webpack-plugin --save-dev
```

We also need to connect it with our configuration:

**webpack.config.js**

```javascript
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const merge = require('webpack-merge');
const validate = require('webpack-validator');
leanpub-start-insert
const NpmInstallPlugin = require('npm-install-webpack-plugin');
leanpub-end-insert

...

var config;

// Detect how npm is run and branch based on that
switch(process.env.npm_lifecycle_event) {
  case 'build':
    config = merge(common, {});
  default:
    config = merge(
      common,
      {
leanpub-start-delete
        devtool: 'eval-source-map'
leanpub-end-delete
leanpub-start-insert
        devtool: 'eval-source-map',
        plugins: [
          new NpmInstallPlugin({
            save: true // --save
          })
        ]
leanpub-end-insert
      },
      parts.setupCSS(PATHS.app),
      parts.devServer({
        // Customize host/port here if needed
        host: process.env.HOST,
        port: process.env.PORT
      })
    );
}

module.exports = validate(config);
```

It would be possible to push the plugin declaration to a function of its own. I'm leaving here it as a part of the main configuration for now, though.

Enabling the plugin we can save quite a bit of typing and context switches.

## Conclusion

There's not more than this to it. This is the way you work with Webpack plugins. Each comes with options of its own so make sure you study the plugins in detail to get a better idea of their capabilities.

Our build configuration isn't that sophisticated yet, though. I'll show you how to push it further in the next part as we discuss various build related techniques.
