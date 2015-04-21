Lets have a look at the simplest setup you can create for your application. Use a single bundle when:

- You have a small application
- You will rarely update the application
- You are not too concerned about perceived initial loading time

*webpack.production.config.js*
```javascript
var path = require('path');
var config = {
  entry: path.resolve(__dirname, 'app/main.js'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  module: {
    loaders: [{
      test: /\.js$/,
      loader: 'babel'
    }]
  }
};

module.exports = config;
```