So this part is just freakin' awesome. With React JS and the react-hot-loader you can change the class code of your component and see the instances update live in the DOM, without losing their state! This is pretty much exactly how CSS updates behave, only that it is your components.

## Setting it up
This setup requires that you use the **webpack-dev-server** as introduced in earlier chapters. Now we just have to install the loader with `npm install react-hot-loader --save-dev`, do a small config change:

```javascript
var webpack = require('webpack');
var path = require('path');

var config = {
  entry: ['webpack/hot/dev-server', './app/main.js'],
  output: {
    path: path.resolve(__dirname, './build'),
    filename: 'bundle.js'
  },
  module: {
    loaders: [{
      test: /\.js$/,

      // Use the property "loaders" instead of "loader" and 
      // add "react-hot" in front of your existing "jsx" loader
      loaders: ['react-hot', 'babel']
    }]
  }
};

module.exports = config;
```

And you will also need a small snippet of code in your main entry file. In the example above that would be the *main.js* file located in the `app/` folder.

*app/main.js*
```javascript
// You probably already bring in your main root component, 
// maybe it is your component using react-router
var RootComponent = require('./RootComponent.jsx');

// When you render it, assign it to a variable
var rootInstance = React.render(RootComponent(), document.body);

// Then just copy and paste this part at the bottom of
// the file
if (module.hot) {
  require('react-hot-loader/Injection').RootInstanceProvider.injectProvider({
    getRootInstances: function () {
      // Help React Hot Loader figure out the root component instances on the page:
      return [rootInstance];
    }
  });
}

```

It is that simple. Render a component to the DOM and make a code change on the component's class. It will render itself again, keeping the existing state. Cool?

Read more about the [react-hot-loader](http://gaearon.github.io/react-hot-loader/getstarted/).
