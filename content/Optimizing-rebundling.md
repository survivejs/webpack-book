You might notice after requiring React JS into your project that the time it takes from a save to a finished rebundle of your application takes more time. In development you ideally want from 200-800 ms rebundle speed, depending on what part of the application you are working on.

## Running minified file in development
Instead of making Webpack go through React JS and all its dependencies, you can override the behavior in development.

*webpack.config.js*
```javascript
var path = require('path');
var node_modules = path.resolve(__dirname, 'node_modules');
var pathToReact = path.resolve(node_modules, 'react/dist/react.min.js');

config = {
    entry: ['webpack/hot/dev-server', path.resolve(__dirname, 'app/main.js')],
    resolve: {
	    alias: {
	      'react': pathToReact
	    }
	},
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'bundle.js',
    },
    module: {
    	loaders: [{
    		test: /\.jsx?$/,
    		loader: 'babel'
    	}],
    	noParse: [pathToReact]
    }    
};

module.exports = config;
```
We do two things in this configuration:

1. Whenever "react" is required in the code it will fetch the minified React JS file instead of going to *node_modules*

2. Whenever Webpack tries to parse the minified file, we stop it, as it is not necessary

Take a look at [Optimizing development](Optimizing-development) for more information on this.
