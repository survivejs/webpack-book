Webpack allows you to load CSS like you load any other code. What strategy you choose is up to you, but you can do everything from loading all your css in the main entry point file to one css file for each component.

Loading CSS requires the **css-loader** and the **style-loader**. They have two different jobs. The **css-loader** will go through the CSS file and find `url()` expressions and resolve them. The **style-loader** will insert the raw css into a style tag on your page.

## Preparing CSS loading
Install the two loaders: `npm install css-loader style-loader --save-dev`.

In the *webpack.config.js* file you can add the following loader configuration:

*webpack.config.js*
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
      test: /\.css$/, // Only .css files
      loader: 'style!css' // Run both loaders
    }]
  }
};

module.exports = config;
```

## Loading a CSS file
Loading a CSS file is a simple as loading any file:

*main.js*
```javascript
import './main.css';
// Other code
```

*Component.jsx*
```javascript
import './Component.css';
import React from 'react';

export default React.createClass({
  render: function () {
    return <h1>Hello world!</h1>
  }
});
```

**Note!** You can of course do this with both CommonJS and AMD.

## CSS loading strategies
Depending on your application you might consider three main strategies. In addition to this you should consider including some of your basic CSS inlined with the initial payload (index.html). This will set the structure and maybe a loader while the rest of your application is downloading and executing.

### All in one
In your main entry point, e.g. `app/main.js` you can load up your entire CSS for the whole project:

*app/main.js*
```javascript
import './project-styles.css';
// Other JS code
```

The CSS is included in the application bundle and does not need to download.


### Lazy loading
If you take advantage of lazy loading by having multiple entry points to your application, you can include specific CSS for each of those entry points:

*app/main.js*
```javascript
import './style.css';
// Other JS code
```

*app/entryA/main.js*
```javascript
import './style.css';
// Other JS code
```

*app/entryB/main.js*
```javascript
import './style.css';
// Other JS code
```

You divide your modules by folders and include both CSS and JavaScript files in those folders. Again, the imported CSS is included in each entry bundle when running in production. 

### Component specific
With this strategy you create a CSS file for each component. It is common to namespace the CSS classes with the component name, thus avoiding some class of one component interfering with the class of an other.

*app/components/MyComponent.css
```css
.MyComponent-wrapper {
  background-color: #EEE;
}
```

*app/components/MyComponent.jsx*
```
import './MyComponent.css';
import React from 'react';

export default React.createClass({
  render: function () {
    return (
      <div className="MyComponent-wrapper">
        <h1>Hello world</h1>
      </div>
    )
  }
});
```

## Using inline styles instead of stylesheets
With "React Native" you do not use stylesheets at all, you only use the *style-attribute*. By defining your CSS as objects. Depending on your project, you might consider this as your CSS strategy.

*app/components/MyComponent.jsx*
```javascript
import React from 'react';

var style = {
  backgroundColor: '#EEE'
};

export default React.createClass({
  render: function () {
    return (
      <div style={style}>
        <h1>Hello world</h1>
      </div>
    )
  }
});
```