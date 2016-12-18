# Splitting the Configuration

At minimum, your webpack configuration can be contained in a single file. As the needs of your project grow, you'll need to figure out means to manage it. It becomes necessary to split it up per environment so that you have enough control over the build result. There is no single right way to achieve this, but at least the following ways are feasible:

* Maintain configuration in multiple files and point webpack to each through the `--config` parameter. Share configuration through module imports. You can see this approach in action at [webpack/react-starter](https://github.com/webpack/react-starter).
* Push configuration to a library which you then consume. Example: [HenrikJoreteg/hjs-webpack](https://github.com/HenrikJoreteg/hjs-webpack).
* Maintain configuration within a single file and branch there by relying on the `--env` parameter. Webpack gives us easy access to it. Earlier you had to dig the same information through npm, but in webpack 2 this is easy.

I prefer the last approach as it allows me to understand what's going on easily. I've developed a little tool known as [webpack-merge](https://www.npmjs.org/package/webpack-merge) to achieve this. Compared to `Object.assign` or a `merge` function you might know from lodash, it does a little more. It appends arrays and combines objects. There's also more control available in the form of strategies although we won't need those in this book.

## Setting Up *webpack-merge*

To get started, execute

```bash
npm i webpack-merge --save-dev
```

to add *webpack-merge* to the project.

Next, we need to define some split points to our configuration so we can customize it per npm script. Here's the basic idea in its entirety:

**webpack.config.js**

```javascript
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const merge = require('webpack-merge');

const PATHS = {
  app: path.join(__dirname, 'app'),
  build: path.join(__dirname, 'build')
};

const common = {
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

module.exports = function(env) {
  return merge(common);
};

```

After this change our build should behave exactly the same way as before. This time, however, we have room for expansion at `merge` as we can branch there based on `env`.

T> Given webpack 2 validates the configuration by default, we are good now. Earlier it was useful to set up a solution known as [webpack-validator](https://www.npmjs.com/package/webpack-validator), but that's not needed anymore.

## Passing `env` from Webpack

Given our setup relies on `env`, we should pass it:

**package.json**

```json
...
"scripts": {
leanpub-start-delete
  "build": "webpack"
leanpub-end-delete
leanpub-start-insert
  "build": "webpack --env build"
leanpub-end-insert
},
...
```

To verify that it works, you can drop a temporary `console.log(env)` within your configuration function. It should print out `build`.

## The Benefits of Composing Configuration

Even though a simple technique, splitting configuration this way makes room for growing your setup. The biggest win is the fact that we can extract commonalities between different targets. We can also identify smaller configuration parts to compose. These configuration parts can be pushed to packages of their own to consume across projects.

This is one way to decrease the amount of boilerplate fatigue. Instead of duplicating the same, or at worst similar, configuration across multiple projects, you can manage configuration as a dependency. This means that as you figure out better way to perform tasks, all your projects will receive the improvements.

Each approach comes with its pros and cons. I am comfortable with the composition based approach myself although I can see merit in others as well. In addition to composition, it gives me a fairly limited amount of code to scan through, but it's a good idea to check out how other people do it too. You'll find something that works the best based on your tastes.

Perhaps the biggest problem is that with composition you need to know what you are doing and it is possible you won't get the composition right the first time around. But that's a software engineering problem that goes beyond webpack. You can always iterate on the interfaces and find better ones.

## Conclusion

Now that we have room for growth, I will show you how to set up automatic browser refresh with Webpack in the next chapter. You will see the same theme in the chapters after that. We'll solve some specific problem through composition and we will expand our vocabulary that way.
