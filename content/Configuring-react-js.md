## Installing React JS

`npm install react --save`

There is really nothing more to it. You can now start using React JS in your code.

## Using React JS in the code

*In any file*
```javascript
import React from 'react';

export default React.createClass({
  render: function () {
    return React.createElement('h1', null, 'Hello world');
  }
});
;
```

## Converting JSX
To use the JSX syntax you will need webpack to transform your JavaScript. This is the job of a loader.

`npm install jsx-loader --save-dev`

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
      loader: 'jsx?harmony' // The module to load. "jsx" is short for "jsx-loader"
    }]
  }
};

module.exports = config;
```

Webpack will test each path required in your code. In this project we are using ES6 module loader syntax, which means that the require path of `import MyComponent from './Component.jsx';` is `'./Component.jsx'`.

## Changing the Component file and running the code

In the `/app` folder we now change the filename of our *Component.js* file to **Component.jsx**.

*Component.jsx*
```javascript
import React from 'react';

export default React.createClass({
  render: function () {
    return <h1>Hello world!</h1>
  }
});
```

We have now changed the return statement of our render method to use JSX syntax. Run `npm run dev` in the console and refresh the page, unless you are already running.

## Seriously consider JavaScript next
Instead of using a specific JSX loader you can use Babel that also gives you tomorrows JavaScript today. Read more about that [here](Javascript-next).