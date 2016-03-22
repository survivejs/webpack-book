# Loading Styles

TODO

## Loading CSS

TODO

## Loading LESS or SASS

If you want to use compiled CSS, there are two loaders available for you. The **less-loader** and the **sass-loader**. Depending on your preference, this is how you set it up.

`npm install less-loader` or `npm install sass-loader node-sass`.

**webpack.config.js**

```javascript
var path = require('path');
var config = {
  entry: path.resolve(__dirname, 'app/main.js')
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'bundle.js'
  },
  module: {
    loaders: [{
      test: /\.jsx$/,
      loader: 'babel'
    },

    // LESS
    {
      test: /\.less$/,
      loader: 'style!css!less'
    },

    // SASS
    {
      test: /\.scss$/,
      loader: 'style!css!sass'
    }]
  }
};
```

## What about imports in LESS and SASS?
If you import one LESS/SASS file from an other, use the exact same pattern as anywhere else. Webpack will dig into these files and figure out the dependencies.

```less
@import "./variables.less";
```

You can also load LESS files directly from your node_modules directory.

```less
$import "~bootstrap/less/bootstrap";
```

## Loading Stylus and YETICSS

Another css extension is the **stylus-loader**. A great complement to this is **yeticss** a lightweight, modular pattern library written in stylus.


`npm install stylus-loader yeticss`

**webpack.config.js**

```javascript
var path = require('path');
var config = {
  entry: path.resolve(__dirname, 'app/main.js')
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'bundle.js'
  },
  module: {
    loaders: [{
      test: /\.jsx$/,
      loader: 'babel'
    },

  // STYLUS
   {
      test: /\.styl$/,
      loader: 'style!css!stylus'
    }
  },

  // YETICSS
  stylus: {
    use: [require('yeticss')]
  }
};
```

## Using Stylus

To start using Stylus, you must import it one of your app's .styl file.

```javascript
@import 'yeticss'

//or
@import 'yeticss/components/type'
```

For more info see [stylus](https://github.com/shama/stylus-loader) and [yeticss](https://github.com/andyet/yeti.css).

## Conclusion

TODO
