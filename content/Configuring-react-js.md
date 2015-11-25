## Installing React JS

`npm install react --save`

There is really nothing more to it. You can now start using React JS in your code.

## Using React JS in the code

**component.jsx**

```javascript
import React from 'react';

export default class Hello extends React.Component {
  render() {
    return <h1>Hello world</h1>;
  }
}
```

**main.js**

```javascript
import React from 'react';
import Hello from './component.jsx';

main();

function main() {
    React.render(<Hello />, document.getElementById('app'));
}
```

**build/index.html**

```javascript
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8"/>
  </head>
  <body>
    <div id="app"></div>

    <script src="http://localhost:8080/webpack-dev-server.js"></script>
    <script src="bundle.js"></script>
  </body>
</html>
```

## Converting JSX

To use the JSX syntax you will need webpack to transform your JavaScript. This is the job of a loader. We'll use [Babel](https://babeljs.io/) as it's nice and has plenty of features.
Below we install the babel-loader with two other presets, es2015 and react.

`npm install babel-loader babel-core babel-preset-es2015 babel-preset-react --save-dev`

Now we have to configure webpack to use this loader.

*webpack.config.js*
```javascript
var path = require('path');
var config = {
  entry: path.resolve(__dirname, 'app/main.js'),
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'bundle.js'
  },
  module: {
    loaders: [{
      test: /\.jsx?$/, // A regexp to test the require path. accepts either js or jsx
      loader: 'babel' // The module to load. "babel" is short for "babel-loader"
      query: {
          presets: [ 'es2015', 'react' ]
      }
    }]
  }
};

module.exports = config;
```

Webpack will test each path required in your code. In this project we are using ES6 module loader syntax, which means that the require path of `import MyComponent from './Component.jsx';` is `'./Component.jsx'`.

Run `npm run dev` in the console and refresh the page to see something.
