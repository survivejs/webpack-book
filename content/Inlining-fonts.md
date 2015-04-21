Fonts can be really difficult to get right. First of all we have typically 4 different formats, but only one of them will be used by the respective browser. You do not want to inline all 4 formats, as that will just bloat your CSS file and in no way be an optimization.

## Choose one format
Depending on your project you might be able to get away with one font format. If you exclude Opera Mini, all browsers support the .woff and .svg format. The thing is that fonts can look a little bit different in the different formats, on the different browsers. So try out .woff and .svg and choose the one that looks the best in all browsers.

There are probably other strategies here too, so please share by creating an issue or pull request.

## Doing the actual inlining
You do this exactly like you do when inlining images.

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
    }, {
      test: /\.woff$/,
      loader: 'url?limit=100000'
    }]
  }
};
```
Just make sure you have a limit above the size of the fonts, or they will of course not be inlined.