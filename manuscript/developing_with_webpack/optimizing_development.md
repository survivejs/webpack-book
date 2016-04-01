# Optimizing Development

We talked about how you could use the minified versions of your dependencies in development to make the rebundling go as fast as possible. Let us look at a small helper you can implement to make this a bit easier to handle.

## Optimizing Rebundling

You might notice after requiring React JS into your project that the time it takes from a save to a finished rebundle of your application takes more time. In development you ideally want 200-800 ms rebundle speed, depending on what part of the application you are working on.

> IMPORTANT! This setup a minified, production version of React. As a result you will lose `propTypes` based type validation!

## Running minified file in development

Instead of making Webpack go through React JS and all its dependencies, you can override the behavior in development.

**webpack.config.js**

```javascript
var path = require('path');
var node_modules = path.resolve(__dirname, 'node_modules');
var pathToReact = path.resolve(node_modules, 'react/dist/react.min.js');

config = {
    entry: ['webpack/hot/dev-server', path.resolve(__dirname, 'app/main.js')],
    resolve: {
        alias: {
          'react': pathToReact
        }
    },
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'bundle.js',
    },
    module: {
        loaders: [{
            test: /\.jsx?$/,
            loader: 'babel'
        }],
        noParse: [pathToReact]
    }
};

module.exports = config;
```

We do two things in this configuration:

1. Whenever "react" is required in the code it will fetch the minified React JS file instead of going to *node_modules*
2. Whenever Webpack tries to parse the minified file, we stop it, as it is not necessary

## XXX

*webpack.config.js*

```javascript
var webpack = require('webpack');
var path = require('path');
var node_modules_dir = path.join(__dirname, 'node_modules');

var deps = [
  'react/dist/react.min.js',
  'react-router/dist/react-router.min.js',
  'moment/min/moment.min.js',
  'underscore/underscore-min.js',
];

var config = {
  entry: ['webpack/hot/dev-server', './app/main.js'],
  output: {
    path: path.resolve(__dirname, './build'),
    filename: 'bundle.js'
  },
  resolve: {
    alias: {}
  },
  module: {
    noParse: [],
    loaders: []
  }
};

// Run through deps and extract the first part of the path,
// as that is what you use to require the actual node modules
// in your code. Then use the complete path to point to the correct
// file and make sure webpack does not try to parse it
deps.forEach(function (dep) {
  var depPath = path.resolve(node_modules_dir, dep);
  config.resolve.alias[dep.split(path.sep)[0]] = depPath;
  config.module.noParse.push(depPath);
});

module.exports = config;
```

Not all modules include a minified distributed version of the lib, but most do. Especially with large libraries like React JS you will get a significant improvement.

#### Important!

Not all modules support module.noParse, the files included by deps array should have no call to *require*, *define* or similar, or you will get an error when the app runs: **Uncaught ReferenceError: require is not defined**.

## Conclusion

TODO
