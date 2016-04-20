# Splitting the Configuration

At minimum, your Webpack configuration can be contained in a single file. As the needs of your project grow, you'll need to figure out means to manage it. It becomes necessary to split it up per environment so that you have enough control over the build result. There is no single right way to achieve this, but at least the following ways are feasible:

* Maintain configuration in multiple files and point Webpack to each through `--config` parameter. Share configuration through module imports. You can see this approach in action at [webpack/react-starter](https://github.com/webpack/react-starter).
* Push configuration to a library which you then consume. Example: [HenrikJoreteg/hjs-webpack](https://github.com/HenrikJoreteg/hjs-webpack).
* Maintain configuration within a single file and branch there. If we trigger a script through *npm* (i.e., `npm run test`), npm sets this information in an environment variable. We can match against it and return the configuration we want.

I prefer the last approach as it allows me to understand what's going on easily. I've developed a little tool known as [webpack-merge](https://www.npmjs.org/package/webpack-merge) to achieve this. I'll show you how to set it up next.

## Setting Up *webpack-merge*

To get started, execute

```bash
npm i webpack-merge --save-dev
```

to add *webpack-merge* to the project.

Next, we need to define some split points to our configuration so we can customize it per npm script. Here's the basic idea:

**webpack.config.js**

```javascript
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
leanpub-start-insert
const merge = require('webpack-merge');
leanpub-end-insert

const PATHS = {
  app: path.join(__dirname, 'app'),
  build: path.join(__dirname, 'build')
};

leanpub-start-delete
module.exports = {
leanpub-end-delete
leanpub-start-insert
const common = {
leanpub-end-insert
  // Entry accepts a path or an object of entries.
  // We'll be using the latter form given it's
  // convenient with more complex configurations.
  entry: {
    app: PATHS.app
  },
  output: {
    path: PATHS.build,
    filename: '[name].js'
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Webpack demo'
    })
  ]
};

leanpub-start-insert
var config;

// Detect how npm is run and branch based on that
switch(process.env.npm_lifecycle_event) {
  case 'build':
    config = merge(common, {});
    break;
  default:
    config = merge(common, {});
}

module.exports = config;
leanpub-end-insert
```

After this change our build should behave exactly the same way as before. This time, however, we have room for expansion. We can hook up **Hot Module Replacement** in the next chapter to make the browser refresh and turn our the development mode into something more useful.

## Integrating *webpack-validator*

To make it easier to develop our configuration, we can integrate a tool known as [webpack-validator](https://www.npmjs.com/package/webpack-validator) to our project. It will validate the configuration against a schema and warn if we are trying to do something not sensible. This takes some pain out of learning and using Webpack.

Install it first:

```bash
npm i webpack-validator --save-dev
```

Integrating it to our project is straight-forward:

**webpack.config.js**

```javascript
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const merge = require('webpack-merge');
leanpub-start-insert
const validate = require('webpack-validator');
leanpub-end-insert

...

leanpub-start-delete
module.exports = config;
leanpub-end-delete
leanpub-start-insert
module.exports = validate(config);
leanpub-end-insert
```

If you break your Webpack configuration somehow after doing this, the validator will likely notice and give you a nice validation error to fix.

## Conclusion

Even though a simple technique, splitting configuration this way makes room for growing your setup. Each approach comes with its pros and cons. I find this one works well for small to medium projects. Bigger projects might need a different approach.

Now that we have room for growth, I will show you how to set up automatic browser refresh with Webpack in the next chapter.
