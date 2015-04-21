An alternative to installing the `jsx-loader` is `babel-loader`. If you have not heard of babel, you must check out [babel.io](https://babeljs.io/). It is a JavaScript transpiler that allows you to use JavaScript functionality that has not yet been implemented in the browser. Included is a JSX transpiler.

## Installing the Babel loader
`npm install babel-loader --save-dev` and in your config:

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
      test: /\.js$/,
      loader: 'babel'
    }]
  }
};

module.exports = config;
```
Now you can use all the functionality Babel provides.

## Classes
As of React JS 0.13 you will be able to define components as classes.

```javascript
class MyComponent extends React.Component {
  constructor() {
    this.state = {message: 'Hello world'};
  }
  render() {
    return (
      <h1>{this.state.message}</h1>
    );
  }
}
```

This gives you a very short and nice syntax for defining components. A drawback with using classes though is the lack of mixins. That said, you are not totally lost. Lets us see how we could still use the important **PureRenderMixin**.

```javascript
import React from 'react/addons';

class Component extends React.Component {
  shouldComponentUpdate() {
    return React.addons.PureRenderMixin.shouldComponentUpdate.apply(this, arguments);
  }
}

class MyComponent extends Component {
  constructor() {
    this.state = {message: 'Hello world'};
  }
  render() {
    return (
      <h1>{this.state.message}</h1>
    );
  }
}
```