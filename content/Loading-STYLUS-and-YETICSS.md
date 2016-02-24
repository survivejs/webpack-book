Another css extension is the **stylus-loader**. A great complement to this is **yeticss** a lightweight, modular pattern library written in stylus.

## Installing and configuring the loader
`npm install stylus-loader yeticss`

**webpack.config.js**
```
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
``` 
@import 'yeticss'
//or
@import 'yeticss/components/type'
```

For more info see [stylus](https://github.com/shama/stylus-loader) and [yeticss](https://github.com/andyet/yeti.css).
