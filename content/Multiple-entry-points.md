Maybe you are building an application that has multiple urls. An example of this would be a solution where you have two, or more, different URLs responding with different pages. Maybe you have one user page and one admin page. They both share a lot of code, but you do not want to load all the admin stuff for normal users. That is a good scenario for using multiple entry points. A list of use cases could be:

- You have an application with multiple isolated user experiences, but they share a lot of code
- You have a mobile version using less components
- You have a typical user/admin application where you do not want to load all the admin code for a normal user

Let us create an example with a mobile experience using less components:
*webpack.production.config.js*
```javascript
var path = require('path');
var webpack = require('webpack');
var node_modules_dir = path.resolve(__dirname, 'node_modules');

var config = {
  entry: {
    app: path.resolve(__dirname, 'app/main.js'),
    mobile: path.resolve(__dirname, 'app/mobile.js'),
    vendors: ['react'] // And other vendors
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js' // Notice we use a variable
  },
  module: {
    loaders: [{
      test: /\.js$/,
      exclude: [node_modules_dir],
      loader: 'babel'
    }]
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin('vendors', 'vendors.js')
  ]
};

module.exports = config;
```
This configuration will create three files in the `dist/` folder. **app.js**, **mobile.js** and **vendors.js**. Most of the code in the **mobile.js** file also exists in **app.js**, but that is what we want. We will never load **app.js** and **mobile.js** on the same page.