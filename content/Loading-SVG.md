Webpack has a [few ways](https://github.com/webpack/webpack/issues/595) to load SVG. However the simplest way is through **file-loader**.

## Installation and configuration

Install the loader: `npm install file-loader --save-dev`.

In the webpack config file you can add the following loader configuration:

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
    }, {
      test: /\.svg$/,
      loader: 'file-loader'
    }]
  }
};
```

Then in your CSS:

```css
.icon {
   background-image: url(../assets/icon.svg);
}
```

In this example the `assets` folder is relative to your CSS file.

For SVG compression check out the [svgo-loader](https://github.com/pozadi/svgo-loader).