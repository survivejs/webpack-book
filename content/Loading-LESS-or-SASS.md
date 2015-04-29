If you want to use compiled CSS, there are two loaders available for you. The **less-loader** and the **sass-loader**. Depending on your preference, this is how you set it up.

## Installing and configuring the loader
`npm install less-loader` or `npm install sass-loader`.

*webpack.config.js*
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
      loader: 'jsx'
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

