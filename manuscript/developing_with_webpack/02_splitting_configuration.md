# Splitting the Configuration

At minimum, your webpack configuration can be contained in a single file. As the needs of your project grow, you'll need to figure out means to manage it. It becomes necessary to split it up per environment so that you have enough control over the build result. There are a few ways to achieve this.

## Possible Ways to Manage Configuration

You can manage webpack configuration in the following ways:

* Maintain configuration in multiple files and point webpack to each through the `--config` parameter. Share configuration through module imports. You can see this approach in action at [webpack/react-starter](https://github.com/webpack/react-starter).
* Push configuration to a library, which you then consume. Example: [HenrikJoreteg/hjs-webpack](https://github.com/HenrikJoreteg/hjs-webpack).
* Maintain configuration within a single file and branch there by relying on the `--env` parameter. Webpack gives us easy access to it. Earlier, you had to dig the same information through npm, but since webpack 2, this is easy.

I prefer the last approach as it allows me to understand what's going on easily. I've developed a little tool known as [webpack-merge](https://www.npmjs.org/package/webpack-merge) to achieve this.

## Why *webpack-merge*?

Compared to `Object.assign` or a `merge` function you might know from Lodash, *webpack-merge* does a little more. It appends arrays and combines objects instead of overriding them. This is useful as it allows you to define common configuration parts and then compose. Compared to monolithic configuration, this gives a degree of abstraction.

*webpack-merge* provides even more control through strategies that allow you to control its behavior per field. Strategies allow you to force it to append, prepend, or replace content. *webpack-merge* contains a webpack specific variant known as *smart merge* that folds webpack specific configuration into more compact form, but basic merge is enough for the configuration discussed in this book.

Even though *webpack-merge* was designed for the purposes of this book, it has proven to be an invaluable tool beyond it, as shown by its increasing popularity. You can consider it as a learning tool and pick it up in your work if you find it useful. Given how flexible webpack is, it's only one configuration approach out of many.

## Setting Up *webpack-merge*

To get started, add *webpack-merge* to the project:

```bash
npm i webpack-merge --save-dev
```

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

const common = merge(
  {
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
  }
);

module.exports = function(env) {
  return merge(common);
};
```

After this change, our build should behave the same way as before. This time, however, we have room for expansion at `merge` as we can branch there based on `env`.

T> Webpack 2 validates the configuration by default. If you make an obvious mistake, it will let you know. Earlier, it was useful to set up a solution known as [webpack-validator](https://www.npmjs.com/package/webpack-validator), but that's not needed anymore.

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
  "build": "webpack --env production"
leanpub-end-insert
},
...
```

To verify that it works, you can drop a temporary `console.log(env)` within your configuration function. It should print out `production`.

## Understanding `--env`

Even though `--env` allows us to pass strings, it can do a bit more. Consider the following example:

**package.json**

```json
...
"scripts": {
  "build": "webpack --env.target production"
}
...
```

Instead of a string, we should receive an object `{ target: 'production' }` at configuration now. We could pass more key-value pairs and they would go to the `env` object. It is important to note that if you set `--env foo` while setting `--env.target`, the string will override the object.

W> Webpack 2 changed argument behavior compared to webpack 1. You are not allowed to pass custom parameters through the CLI anymore. Instead, it's better to go through the `--env` mechanism if you need to do this.

## The Benefits of Composing Configuration

Even though a simple technique, splitting configuration this way makes room for growing your setup. The biggest win is the fact that we can extract commonalities between different targets. We can also identify smaller configuration parts to compose. These configuration parts can be pushed to packages of their own to consume across projects.

This is one way to decrease the amount of boilerplate fatigue. Instead of duplicating similar configuration across multiple projects, you can manage configuration as a dependency. This means that as you figure out better ways to perform tasks, all your projects will receive the improvements.

Each approach comes with its pros and cons. I am comfortable with the composition-based approach myself, although I can see merit in others as well. In addition to composition, it gives me a fairly limited amount of code to scan through, but it's a good idea to check out how other people do it too. You'll find something that works the best based on your tastes.

Perhaps the biggest problem is that with composition you need to know what you are doing, and it is possible you won't get the composition right the first time around. But that's a software engineering problem that goes beyond webpack. You can always iterate on the interfaces and find better ones.

T> If you have to support both webpack 1 and 2, you can perform branching based on version using `require('webpack/package.json').version` kind of code to detect it. After that you have to set specific branches for each and merge. You can still extract the commonality as you see the best.

## Conclusion

Now that we have room for growth, I will show you how to set up automatic browser refresh with webpack in the next chapter. You will see the same theme in the chapters after that. We'll solve specific problems through composition and expand our vocabulary that way.
