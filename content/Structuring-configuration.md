There are two things you want to do preparing for a production build.

1. Configure a script to run in your package.json file
2. Create a production config

### Creating the script
We have already used *package.json* to create the `npm run dev` script. Now let us set up `npm run deploy`.

```json
{
  "name": "my-project",
  "version": "0.0.0",
  "description": "My awesome project!",
  "main": "app/main.js",
  "scripts": {
    "dev": "webpack-dev-server --devtool eval --progress --colors --hot --content-base build",
    "deploy": "NODE_ENV=production webpack -p --config webpack.production.config.js"
  },
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "webpack": "^1.4.13",
    "webpack-dev-server": "^1.6.6"
  },
  "dependencies": {}
}
```

As you can see we are just running webpack with the production argument and pointing to a different configuration file. We also use the environment variable "production" to allow our required modules to do their optimizations. Lets us create the config file now.

### Creating the production config
So there really is not much difference in creating the dev and production versions of your webpack config. You basically point to a different output path and there are no workflow configurations or optimizations. What you also want to bring into this configuration is cache handling.

```javascript
var path = require('path');
var node_modules_dir = path.resolve(__dirname, 'node_modules');

var config = {
  entry: path.resolve(__dirname, 'app/main.js'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  module: {
    loaders: [{
      test: /\.js$/,
      
      // There is not need to run the loader through
      // vendors
      exclude: [node_modules_dir],
      loader: 'babel'
    }]
  }
};

module.exports = config;
```

### Doing the deploy
Run `npm run deploy` in the root of the project. Webpack will now run in production mode. It does some optimizations on its own, but also React JS will do its optimizations. Look into caching for even more production configuration.
