# Splitting the Configuration

As the development setup has certain requirements of its own, we'll need to split our Webpack configuration. Given Webpack configuration is just JavaScript, there are many ways to achieve this. At least the following ways are feasible:

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

leanpub-start-insert
// Detect how npm is run and branch based on that
const TARGET = process.env.npm_lifecycle_event;
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
    filename: 'bundle.js'
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Webpack demo'
    })
  ]
};

leanpub-start-insert
// Default configuration. We will return this if
// Webpack is called outside of npm.
if(TARGET === 'start' || !TARGET) {
  module.exports = merge(common, {});
}

if(TARGET === 'build') {
  module.exports = merge(common, {});
}
leanpub-end-insert
```

After this change our build should behave exactly the same way as before. This time, however, we have room for expansion. We can hook up Hot Module Replacement next to make the browser refresh and turn our the development mode into something more useful.

## Conclusion

Even though a simple technique, splitting configuration this way makes room for growing your setup. Each approach comes with its pros and cons. I find this one works well for small to medium projects. Bigger projects might need a different approach.

Now that we have room for growth, I will show you how to set up automatic browser refresh with Webpack in the next chapter.
