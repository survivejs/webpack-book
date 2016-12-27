# Configuring React

Facebook's [React](https://facebook.github.io/react/) is a popular alternative for developing web applications. Even if you don't use it, it can be valuable to understand how to configure it. Most React setups rely on a transpiler known as [Babel](https://babeljs.io/).

Babel is useful beyond React development and worth understanding as it allows you to use future JavaScript features now without having to worry too much about browser support. Due to technical constraints it doesn't support all features within the specification, but still it can be a good tool to have in your arsenal.

## create-react-app - Get Started Fast

[create-react-app](https://www.npmjs.com/package/create-react-app) encapsulates a lot of best practices related to developing React applications. It's particularly useful if you want to get started with a little project fast with minimal setup.

One of the main attractions of *create-react-app* is a feature known as *ejecting*. This means that instead of treating it as a project dependency, you'll get a full webpack setup out of it.

There's a gotcha, though. After you eject, you cannot go back to the dependency based model and you will have to maintain the resulting setup yourself.

## Setting Up Babel with React

Most of the React code out there relies on a format known as [JSX](https://facebook.github.io/jsx/). It is a superset of JavaScript that allows you to mix XMLish syntax with JavaScript.

A lot of people find this convenient as they get something that resembles what they know already while they can use the power of JavaScript. This is in contrast to template DSLs that implement the same logic using custom constructs.

Some React developers prefer to attach type annotations to their code using a language extension known as [Flow](http://flowtype.org/). The technology fits React well, but it's not restricted to it. [TypeScript](http://www.typescriptlang.org/) is another viable alternative. Both work with JSX.

Babel allows us to use JSX with React easily. In addition, we can enable language features we want either using plugins or presets that encapsulate collections of plugins. For instance, you can find all ES6 features within a preset. The same goes for React related functionality. We'll be relying on these within our setup.

T> It is a good practice to name React components containing JSX using the `.jsx` suffix. In addition to communicating this fact, your editor can apply syntax highlighting automatically as you open the files.

### Installing *babel-loader*

The first step towards configuring Babel to work with webpack is to set up [babel-loader](https://www.npmjs.com/package/babel-loader). It will take our futuristic code and turn it into a format normal browsers can understand. Install *babel-loader* with:

```bash
npm i babel-loader babel-core --save-dev
```

*babel-core* contains the core logic of Babel so we need to install that as well.

### Connecting *babel-loader* with Webpack

Now that we have the loader installed, we can connect it with webpack configuration. In addition to a loader definition, we can perform an additional tweak to make imports without an extension possible. Leaving the extension visible is a valid alternative.

Webpack provides a field known as [resolve.extensions](https://webpack.js.org/guides/migrating/#resolve-extensions) that can be used for this purpose. If you want to allow imports like `import Button from './Button';`, set it up as follows:

**webpack.config.js**

```javascript
...
const common = {
  ...
  resolve: {
    extensions: ['.js', '.jsx']
  }
}
...
```

The loader configuration is straight-forward as well. We can use a RegExp to match both `.js` and `.jsx` files. It's up to your tastes to figure out a neat pattern. I prefer to use `\.(js|jsx)$` myself. This just makes `x` optional and you can extend the pattern easily to include more formats.

W> In webpack 1 you had to use `extensions: ['', '.js', '.jsx']` to match files without an extension too. This isn't needed in webpack 2.

### Configuring *babel-loader*

*babel-loader* comes with a set of options. In this case I'm going to enable `cacheDirectory` to improve its performance during development. You can also pass a specific directory to it as a parameter. I.e., `cacheDirectory=<path>`.

Here's the full loader configuration:

**webpack.config.js**

```javascript
...
module: {
  rules: [
    {
      test: /\.(js|jsx)$/,
      use: 'babel-loader',
      // Parse only app files! Without this it will go through
      // the entire project. In addition to being slow,
      // that will most likely result in an error.
      include: PATHS.app,

      options: {
        // Enable caching for improved performance during
        // development.
        // It uses default OS directory by default. If you need
        // something more custom, pass a path to it.
        // I.e., { cacheDirectory: '<path>' }
        cacheDirectory: true
      }
    },
    ...
  ]
}
...
```

Even though we have Babel installed and set up, we are still missing one bit - Babel configuration. It would be possible to pass it through the loader definition. Instead, I prefer to handle it using a dotfile known as *.babelrc*.

The benefit of doing this is that it allows us to process our webpack configuration itself using the same language rules. The rules will also be shared with Babel running outside of webpack. This can be useful for package authors.

T> If you want to process your webpack configuration through Babel, name your webpack configuration as *webpack.config.babel.js*. Webpack will notice you want to use Babel and execute your configuration through it.

W> There are times when caching Babel compilation can surprise you. This can happen particularly if your dependencies change in a way that *babel-loader* default caching mechanism doesn't notice. If you want full control over caching behavior, override `cacheIdentifier` with a string that has been derived based on data that should invalidate the cache. This is where [Node.js crypto API](https://nodejs.org/api/crypto.html) and especially its MD5 related functions can come in handy.

### Setting Up *.babelrc*

A minimal Babel and React setup needs just two Babel presets. Install them:

```bash
npm i babel-preset-es2015 babel-preset-react --save-dev
```

T> Instead of typing it all out, we could use brace expansion. Example: `npm i babel-preset-{es2015,react} -D`. `-D` equals `--save-dev` as you might remember. Note that this doesn't work on Windows CMD.

To make Babel aware of them, we need to write a *.babelrc*:

**.babelrc**

```json
{
  "presets": [
    [
      "es2015",
      {
        "modules": false
      }
    ],
    "react"
  ]
}
```

Babel should pick up the presets now and you should be able to develop both ES6 and React code using webpack now. Note that given webpack 2 handles ES6 modules, it is possible to tell Babel to skip doing that.

Sometimes you might want to use experimental features. Although you can find a lot of them within so called stage presets, I recommend enabling them one by one and even organizing them to a preset of their own unless you are working on a throwaway project. If you expect your project to live a long time, it's better to document the features you are using well.

T> There are other possible [.babelrc options](https://babeljs.io/docs/usage/options/) beyond the ones covered here.

### Rendering a React Application

To get a simple React application running you'll need to mount it to a DOM element first. [html-webpack-plugin](https://www.npmjs.com/package/html-webpack-plugin) can come in handy here. It can be combined with [html-webpack-template](https://www.npmjs.com/package/html-webpack-template) or [html-webpack-template-pug](https://www.npmjs.com/package/html-webpack-template-pug) for more advanced functionality. You can also provide a custom template of your own to it.

The webpack configuration is quite simple. Consider the following example:

**webpack.config.js**

```javascript
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackTemplate = require('html-webpack-template');

const common = {
  ...
  plugins: {
    new HtmlWebpackPlugin({
      template: HtmlWebpackTemplate,
      title: 'Demo app'
      appMountId: 'app', // Generate #app where to mount
      mobile: true, // Scale page on mobile
      inject: false // html-webpack-template requires this to work
    })
  }
};

module.exports = function(env) {
  ...
};
```

Now that there's a template and a DOM element where to render, React needs to be told to render there:

**app/index.js**

```javascript
import React from 'react';
import ReactDOM from 'react-dom';

ReactDOM.render(
  <div>Hello world</div>,
  document.getElementById('app')
);
```

It would be possible to extend the application from here. Depending on your tastes, you might want to name the file as *index.jsx* instead, but sticking with *index.js* can be acceptable too.

T> Check out the *Configuring Hot Module Replacement with React* to learn how to get webpack and React work together in a nicer manner.

### Babel Based Optimizations for React

[babel-react-optimize](https://github.com/thejameskyle/babel-react-optimize) implements a variety of React specific optimizations you may want to experiment with.

[babel-plugin-transform-react-remove-prop-types](https://www.npmjs.com/package/babel-plugin-transform-react-remove-prop-types) is handy if you want to remove `propType` related code from your production build. It also allows component authors to generated code that's wrapped so that setting environment at `DefinePlugin` can kick in and give the same effect without the consumers having to use the plugin.

## Using react-lite Instead of React for Production

React is quite heavy library even though the API is quite small considering. There are light alternatives, such as [Preact](https://www.npmjs.com/package/preact) and [react-lite](https://www.npmjs.com/package/react-lite). react-lite implements React's API apart from features like `propTypes` and server side rendering.

You lose out in debugging capabilities, but gain far smaller size. Preact implements a smaller subset of features and it's even smaller than react-lite. Interestingly [preact-compat](https://www.npmjs.com/package/preact-compat) provides support for `propTypes` and bridges the gap between vanilla React and Preact somewhat.

Using react-lite or Preact in production instead of React can save around 100 kB minified code. Depending on your application, this can be a saving worth pursuing. Fortunately integrating react-lite is simple. It takes only a few lines of configuration to pull off.

To get started, install react-lite:

```bash
npm i react-lite --save-dev
```

On the webpack side, we can use a `resolve.alias` to point our React imports to react-lite instead. Consider doing this only for your production setup!

```javascript
resolve: {
  alias: {
    'react': 'react-lite',
    'react-dom': 'react-lite'
  }
}
```

If you try building your project now, you should notice your bundle is considerably smaller.

Similar setup works for Preact too. In that case you would point to *preact-compat* instead. See [preact-boilerplate](https://github.com/developit/preact-boilerplate) for the exact setup and more information.

[Inferno](https://www.npmjs.com/package/inferno) is yet another alternative. The setup is the same and you can find *inferno-compat* with a similar idea. I discuss these alternatives in more detail at my slide set known as [React Compatible Alternatives](https://presentations.survivejs.com/react-compatible-alternatives).

T> If you stick with vanilla React, you can still optimize it for production usage. See the *Setting Environment Variables* chapter to see how to achieve this. The same trick works with preact-compat as well.

## Exposing React Performance Utilities to Browser

React provides a set of powerful [performance related utilities](https://facebook.github.io/react/docs/perf.html) for figuring out how your application performs. Enabling them takes some setup. After the setup is done, you can access them through your browser console.

To get started, install the needed dependencies:

```bash
npm i expose-loader react-addons-perf --save-dev
```

Next we need to expose React to the console through the [expose-loader](https://www.npmjs.com/package/expose-loader). The idea is that we'll bind the React performance utilities to that during development. Here's the webpack loader configuration for exposing React as a global:

```javascript
{
  test: require.resolve('react'),
  use: 'expose-loader?React'
}
```

After this you should be able to access `React` through a console. To make it possible to access the performance utilities, we need to do one more step. Add the following to the entry point of your application to enable `React.Perf` during development:

```javascript
if(process.env.NODE_ENV !== 'production') {
  React.Perf = require('react-addons-perf');
}
```

If you check out the browser console now, you should be able to access the performance related API through `React.Perf`. The utilities allow you to understand better what's taking time and squeeze the last bits of performance out of your application. The *Elements* tab in Chrome can be useful as well. You can see how React operates on the DOM as it flashes.

T> It can be a good idea to install [React Developer Tools](https://github.com/facebook/react-devtools) to Chrome for even more information. It allows you to inspect *props* and *state* of your application.

## Optimizing Rebundling Speed During Development

We can optimize React's rebundling times during development by pointing the development setup to a minified version of React. The gotcha is that we will lose `propType` based validation! But if speed is more important, this technique may be worth a go. You can hide it behind an environment flag for instance if you want type checking.

In order to achieve what we want, we can use webpack's `module.noParse` option. It accepts a RegExp or an array of RegExps. We can also pass full paths to it to keep our lives simple.

In addition to telling webpack not to parse the minified file we want to use, we also need to point `react` to it. This can be achieved using a feature known as `resolve.alias` just like we did with *react-lite* above.

We can encapsulate the basic idea within a function like this:

```javascript
...

exports.dontParse = function(options) {
  const alias = {};
  alias[options.name] = options.path;

  return {
    module: {
      noParse: [
        options.path
      ]
    },
    resolve: {
      alias: alias
    }
  };
}
```

You would use the function like this assuming you are using [webpack-merge](https://www.npmjs.com/package/webpack-merge):

```javascript
...

merge(
  common,
leanpub-start-insert
  dontParse({
    name: 'react',
    path: path.join(
      __dirname, 'node_modules', 'react', 'dist', 'react.min.js'
    )
  }),
leanpub-end-insert
  ...
)

...
```

If you try developing your application now, it should be at least a little bit faster to rebuild. The technique can be useful for production usage as well as you avoid some processing then.

T> `module.noParse` also accepts a regular expression. If we wanted to ignore all `*.min.js` files for instance, we could set it to `/\.min\.js/`. That can be a more generic way to solve the problem in some cases.

T> Note that aliasing works also with loaders through [resolveLoader.alias](https://webpack.js.org/configuration/resolve/#resolveloader).

W> Not all modules support `module.noParse`, the files included by deps array should have no call to `require`, `define` or similar, or you will get an error when the app runs: `Uncaught ReferenceError: require is not defined`.

## Setting Up Flow

[Flow](http://flowtype.org/) performs static analysis based on your code and its type annotations. This means you will install it as a separate tool. You will then run it against your code. There's a webpack plugin known as [flow-status-webpack-plugin](https://www.npmjs.com/package/flow-status-webpack-plugin) that allows you to run it through webpack during development.

When using React, the Babel preset does most of the work. It is able to strip Flow annotations and convert your code into a format that is possible to transpile further.

There's a Babel plugin known as [babel-plugin-typecheck](https://www.npmjs.com/package/babel-plugin-typecheck) that allows you to perform runtime checks based on your Flow annotations. After installing, you should just add the following section to the development section of your *.babelrc* to enable it:

**.babelrc**

```json
"plugins": [
  [
    "typecheck"
  ]
]
```

Even though useful, Flow static checker is able to catch more errors. Runtime checks are still cool, though, and worth enabling if you are using Flow.

## Setting Up TypeScript

Microsoft's [TypeScript](http://www.typescriptlang.org/) is a far more established solution than Facebook's Flow. As a result you will find more premade type definitions for it and overall the quality of support should be better. You can use it with webpack using at least the following loaders:

* [ts-loader](https://www.npmjs.com/package/ts-loader)
* [awesome-typescript-loader](https://www.npmjs.com/package/awesome-typescript-loader)
* [typescript-loader](https://www.npmjs.com/package/typescript-loader)
* [light-ts-loader](https://www.npmjs.com/package/light-ts-loader)

## Maintaining Components

One way to structure React projects is to push components to directories which expose their code through a *index.js* file. Often that's just boilerplate code which you have to add for webpack to resolve correctly. [component-directory-webpack-plugin](https://www.npmjs.com/package/component-directory-webpack-plugin) has been designed to alleviate this problem and it allows you to skip *index.js* while performing lookups based on a naming convention.

A separate tool known as [create-index](https://www.npmjs.com/package/create-index) is a different way to solve the same problem. It literally generates those boilerplate *index.js* files to your project and keeps them up to date.

## Conclusion

There are a lot of aspects to keep in mind when configuring webpack to work with React. Fortunately this is something you don't have to perform often. Once you have a solid basic setup fitting your needs together, it will take you far.
