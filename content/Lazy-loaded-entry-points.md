It is also possible to lazy load entry points. This means that you load parts of your application as they are requested. A typical scenario for this would be that your users only visits specific parts of the application. And an example of that would be twitter.com. You do not always visit your profile page, so why load the code for that? Here is a summary of requirements:

- You have a relatively big application where users can visit different parts of it
- You do care a lot about initial render time

*webpack.production.config.js*
```javascript
var path = require('path');
var webpack = require('webpack');
var node_modules_dir = path.resolve(__dirname, 'node_modules');

var config = {
  entry: {
    app: path.resolve(__dirname, 'app/main.js'),
    vendors: ['react']
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'app.js'
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
So we are pretty much back where we started with a split application and vendors bundle. You do not really define your lazy dependencies in a configuration, Webpack automatically understands them when analyzing your code. So let us see how we would lazy load a **profile page**:

*main.js (Using ES6 syntax)*
```javascript
import React from 'react';
import Feed from './Feed.js';

class App extends React.Component {
  constructor() {
    this.state = { currentComponent: Feed };
  }
  openProfile() {
    require.ensure([], () => {
      var Profile = require('./Profile.js');
      this.setState({
        currentComponent: Profile
      });
    });
  }
  render() {
   return (
      return <div>{this.state.currentComponent()}</div>
    );
  }
}
React.render(<App/>, document.body);
```
So this is just an example. You would probably hook this up to a router, but the important part is using `require.ensure`.

**What is the array on the first argument?**: If you try to lazy load a chunk that depends on an other lazy loaded chunk you can set it as a dependency in the array. Just type in the path to the chunk. E.g. `['./FunnyButton.js']`
