# Configuring React

Facebook's [React](https://facebook.github.io/react/) is a popular alternative for developing web applications. Even if you don't use it, it can be valuable to understand how to configure it.

## Get Started Fast with *create-react-app*

The fastest way to get started with webpack and React is to use [create-react-app](https://www.npmjs.com/package/create-react-app). It encapsulates a lot of best practices and it is particularly useful if you want to get started with a little project fast with minimal setup.

One of the main attractions of *create-react-app* is a feature known as *ejecting*. This means that instead of treating it as a project dependency, you'll get a full webpack setup out of it.

There's a gotcha, though. After you eject, you cannot go back to the dependency-based model, and you will have to maintain the resulting setup yourself.

## Setting Up Babel with React

The *Processing with Babel* chapter covers the essentials of using Babel with webpack. There's some React specific setup you should perform, though. Given most of React projects rely on [JSX](https://facebook.github.io/jsx/) format, you will have to enable it through Babel.

To get React, and particularly JSX, work with Babel, you should set up the preset:

```bash
npm install babel-preset-react --save-dev
```

You also have to connect the preset with Babel configuration:

**.babelrc**

```json
{
  "plugins": ["syntax-dynamic-import"],
  "presets": [
leanpub-start-insert
    "react",
leanpub-end-insert
    [
      "es2015",
      {
        "modules": false
      }
    ]
  ]
}
```

## Configuring React with ESLint

Using React with ESLint and JSX requires some extra work as well. [eslint-plugin-react](https://www.npmjs.com/package/eslint-plugin-react) does a part of the work, but also some ESLint configuration is needed.

Install *eslint-plugin-react* to get started:

```bash
npm install eslint-plugin-react --save-dev
```

The suggested minimum configuration is as follows:

**.eslintrc.js**

```javascript
module.exports = {
  "env": {
    "browser": true,
    "commonjs": true,
    "es6": true,
    "node": true,
  },
leanpub-start-delete
  "extends": "eslint:recommended",
leanpub-end-delete
leanpub-start-insert
  "extends": ["eslint:recommended", "plugin:react/recommended"],
leanpub-end-insert
  "parser": "babel-eslint",
  "parserOptions": {
    "sourceType": "module",
    "allowImportExportEverywhere": true,
leanpub-start-insert
    // Enable JSX
    "ecmaFeatures": {
      "jsx": true,
    },
leanpub-end-insert
  },
leanpub-start-insert
  "plugins": [
    "react",
  ],
leanpub-end-insert
  "rules": {
    "comma-dangle": ["error", "always-multiline"],
    "indent": ["error", 2],
    "linebreak-style": ["error", "unix"],
    "quotes": ["error", "single"],
    "semi": ["error", "always"],
    "no-unused-vars": ["warn"],
    "no-console": 0,
  },
};
```

You can enable more specific rules based on your liking, but the `plugin:react/recommended` gives a good starting point. It is important to remember to enable JSX at the `parserOptions` as well.

## Setting Up a Stub for React Demo

To get a simple React application running, you'll need to mount it to a DOM element first. [html-webpack-plugin](https://www.npmjs.com/package/html-webpack-plugin) can come in handy here. It can be combined with [html-webpack-template](https://www.npmjs.com/package/html-webpack-template) or [html-webpack-template-pug](https://www.npmjs.com/package/html-webpack-template-pug) for more advanced functionality. You can also provide a custom template of your own to it.

Install the template first:

```bash
npm install html-webpack-template --save-dev
```

To retain the existing demonstration in place, it is possible to generate a page for both the original demonstration and the new one. This is possible by running webpack in *multi-compiler mode* and splitting up the configuration per page. Adjust as follows:

**webpack.config.js**

```javascript
...
leanpub-start-insert
const HtmlWebpackTemplate = require('html-webpack-template');
leanpub-end-insert

...

const PATHS = {
  app: path.join(__dirname, 'app'),
leanpub-start-insert
  reactDemo: path.join(__dirname, 'app', 'react'),
leanpub-end-insert
  build: path.join(__dirname, 'build'),
};

const common = merge([
  {
leanpub-start-delete
    plugins: [
      new HtmlWebpackPlugin({
        title: 'Webpack demo',
      }),
    ],
leanpub-end-delete
  },
  ...
]);

...

leanpub-start-insert
function app() {
  return {
    entry: {
      app: PATHS.app,
    },
    plugins: [
      new HtmlWebpackPlugin({
        title: 'Webpack demo',
      }),
    ],
  };
}

function react() {
  return {
    entry: {
      react: PATHS.reactDemo,
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: HtmlWebpackTemplate,
        title: 'React demo',
        filename: 'react/index.html',
        appMountId: 'app', // Generate #app where to mount
        mobile: true, // Scale page on mobile
        inject: false, // html-webpack-template needs this to work
      }),
    ],
  };
}
leanpub-end-insert

leanpub-start-delete
module.exports = function(env) {
  if (env === 'production') {
    return production();
  }

  return development();
};
leanpub-end-delete
leanpub-start-insert
module.exports = function(env) {
  if (env === 'production') {
    return [
      merge(production(), app()),
      merge(production(), react()),
    ];
  }

  return [
    merge(development(), app()),
    merge(development(), react()),
  ];
};
leanpub-end-insert
```

The new entry will look up for *app/react.js*. To prove that the setup works, write a stub file like this:

**app/react.js**

```javascript
console.log('react demo');
```

If you run the application now (`npm start`) and navigate to `http://localhost:8080/react`, you should see a blank page and corresponding message at the browser console.

![A stub for React demo](images/react-stub.png)

## Connecting React with the Project

To make sure the project has the dependencies in place, install React and [react-dom](https://www.npmjs.com/package/react-dom). The latter package is needed to render the application to the DOM.

```bash
npm install react react-dom --save
```

Everything should be set up for rendering dummy data now:

**app/react.js**

```javascript
import React from 'react';
import ReactDOM from 'react-dom';

ReactDOM.render(
  <div>Hello world</div>,
  document.getElementById('app')
);
```

Even though we have a basic React application running now, it's a little difficult to develop. If you try to modify the code, you will notice that webpack will give a warning familiar from the *Configuring Hot Module Replacement* chapter. To improve the developer experience, we have to implement the hot replacement interface.

T> If you get a linting warning like `warning  'React' is defined but never used  no-unused-vars`, make sure the ESLint React plugin has been enabled and its default preset is in use.

## Configuring Hot Module Replacement with React

Hot module replacement was one of the initial selling points of webpack and React. It relies on the [react-hot-loader](https://www.npmjs.com/package/react-hot-loader) package. The simplest way to enable it is to use a now deprecated [babel-preset-react-hmre](https://www.npmjs.com/package/babel-preset-react-hmre). It works still, but there's another way.

At the time of writing *react-hot-loader* version 3 is in beta. The setup is more complicated than using a preset, but this is the way to go at the moment. It requires changes to three places: Babel configuration, webpack configuration, and application. I'll cover these next.

To get started, install the upcoming version of *react-hot-loader*:

```bash
npm install react-hot-loader@next --save-dev
```

### Setting Up Babel

The Babel portion is simple:

**.babelrc**

```json
{
leanpub-start-delete
  "plugins": ["syntax-dynamic-import"],
leanpub-end-delete
leanpub-start-insert
  "plugins": [
    "syntax-dynamic-import",
    "react-hot-loader/babel"
  ],
leanpub-end-insert
  ...
}
```

### Setting Up Webpack

On webpack side, *react-hot-loader* requires an additional entry it uses to patch the running application. It is important the new entry runs first as otherwise the setup will fail to work reliably.

**webpack.config.js**

```javascript
...

leanpub-start-insert
function reactDevelopment() {
  return {
    entry: {
      // react-hot-loader has to run before demo!
      react: ['react-hot-loader/patch', PATHS.reactDemo],
    },
  };
}
leanpub-end-insert

module.exports = function(env) {
  if (env === 'production') {
    return [
      merge(production(), app()),
      merge(production(), react()),
    ];
  }

  return [
    merge(development(), app()),
leanpub-start-delete
    merge(development(), react()),
leanpub-end-delete
leanpub-start-insert
    merge(development(), react(), reactDevelopment()),
leanpub-end-insert
  ];
};
```

There is still patching to do as we have to make the application side aware of hot loading.

T> You can include `react-dom` entries at `parts.extractBundles` to push it to the vendor bundle assuming you refer to packages by their name.

### Setting Up the Application

Compared to the earlier implementation, the basic idea is the same on application side. This time, however, `AppContainer` provided by *react-hot-loader* has to be used. It performs the patching during development. To attach it to the application, adjust as follows:

**app/react.js**

```javascript
import React from 'react';
import ReactDOM from 'react-dom';
import Counter from './counter';
import { AppContainer } from 'react-hot-loader';

const render = App => {
  ReactDOM.render(
    <AppContainer><App /></AppContainer>,
    document.getElementById('app')
  );
};

render(Counter);

if (module.hot) {
  module.hot.accept('./counter', () => render(Counter));
}
```

To truly test the setup, a component is needed as well. In this case it's going to be a little counter so you can see how the hot replacement mechanism maintains the state:

**app/counter.js**

```javascript
import React from 'react';

class Counter extends React.Component {
  constructor(props) {
    super(props);

    this.state = { amount: 0 };
  }
  render() {
    return (
      <div>
        <span className="fa fa-hand-spock-o fa-1g">
          Amount: {this.state.amount}
        </span>
        <button onClick={() => this.setState(addOne)}>Add one</button>
      </div>
    );
  }
}

const addOne = ({ amount }) => ({ amount: amount + 1 });

export default Counter;
```

If you run the application after these changes and modify the aforementioned file, it should pick up changes without a hard refresh while retaining the amount.

### Removing *react-hot-loader* Related Code from the Production Output

If you build the application (`npm run build`) and examine the output, you might spot references to `__REACT_HOT_LOADER__` there. This is because of the Babel setup. It will use `react-hot-loader/babel` plugin regardless of the build target. In order to overcome this slight annoyance, we should configure babel to apply the plugin only when we are developing.

Babel provides an [env option](https://babeljs.io/docs/usage/babelrc/#env-option) for this purpose. It respects both `NODE_ENV` and `BABEL_ENV` environment variables. If `BABEL_ENV` is set, it will receive precedence. To fix the issue, we can push the problematic Babel plugin behind a development specific `env` while controlling its behavior within webpack configuration by setting `BABEL_ENV`.

The webpack part of the fix is simple. Adjust like this:

**webpack.config.js**

```javascript
...

module.exports = function(env) {
leanpub-start-insert
  process.env.BABEL_ENV = env;
leanpub-end-insert

  ...
};
```

Babel will now receive the target we pass to webpack allowing us to fix the behavior. Tweak Babel setup so it matches the fields below. The key part is in pushing `react-hot-loader/patch` below `env`:

**.babelrc**

```json
{
  "plugins": [
    "syntax-dynamic-import"
  ],
  "presets": [
    [
      "es2015",
      {
        "modules": false
      }
    ],
    "react"
  ],
  "env": {
    "development": {
      "plugins": [
        "react-hot-loader/babel"
      ]
    }
  }
}
```

The development setup should work after this change still. If you examine the build output, you should notice it's missing the aforementioned references to `__REACT_HOT_LOADER__`.

There is one more problem still. The source contains some references still. This is a [bug in react-hot-loader](https://github.com/gaearon/react-hot-loader/issues/471) as it has been built so that it loses information that's valuable for a bundler.

It is possible to work around the issue by implementing a module chooser pattern as described in the *Setting Environment Variables* chapter. The idea is that `AppContainer` provided by *react-hot-loader* would be mocked with a dummy implementation during production usage. This is what *react-hot-loader* should so itself.

T> The aforementioned `env` technique can be used to apply Babel presets and plugins per environment. You could enable additional checks and logging during development this way. See the *Processing with Babel* chapter for more information.

## Babel-Based Optimizations for React

There are a few Babel-based optimizations for React you may consider enabling especially during production usage:

* [babel-react-optimize](https://github.com/thejameskyle/babel-react-optimize) implements a variety of React specific optimizations you may want to experiment with.
* [babel-plugin-transform-react-remove-prop-types](https://www.npmjs.com/package/babel-plugin-transform-react-remove-prop-types) allows you to remove `propType` related code from your production build. It also allows component authors to generate code that's wrapped so that setting environment at `DefinePlugin` can kick in as discussed in the book.

## Using *react-lite* Instead of React for Production

React is quite heavy library even though the API is quite small considering. There are light alternatives, such as [Preact](https://www.npmjs.com/package/preact) and [react-lite](https://www.npmjs.com/package/react-lite). react-lite implements React's API apart from features like `propTypes` and server side rendering.

You lose out in debugging capabilities, but gain far smaller size. Preact implements a smaller subset of features and it's even smaller than react-lite. Interestingly [preact-compat](https://www.npmjs.com/package/preact-compat) provides support for `propTypes` and bridges the gap between vanilla React and Preact somewhat.

Using react-lite or Preact in production instead of React can save around 100 kB minified code. Depending on your application, this can be a saving worth pursuing. Fortunately integrating react-lite is simple. It takes only a few lines of configuration to pull off.

To get started, install react-lite:

```bash
npm install react-lite --save-dev
```

On the webpack side, we can use a `resolve.alias` to point our React imports to react-lite instead. Consider doing this only for your production setup!

```javascript
resolve: {
  alias: {
    'react': 'react-lite',
    'react-dom': 'react-lite',
  },
},
```

If you try building your project now, you should notice your bundle is considerably smaller.

Similar setup works for Preact too. In that case you would point to *preact-compat* instead. See [preact-boilerplate](https://github.com/developit/preact-boilerplate) for the exact setup and more information.

[Inferno](https://www.npmjs.com/package/inferno) is yet another alternative. The setup is the same and you can find *inferno-compat* with a similar idea. I discuss these alternatives in more detail at my slide set [React Compatible Alternatives](https://presentations.survivejs.com/react-compatible-alternatives).

T> If you stick with vanilla React, you can still optimize it for production usage. See the *Setting Environment Variables* chapter to see how to achieve this. The same trick works with preact-compat as well.

## Exposing React Performance Utilities to Browser

React provides a set of powerful [performance related utilities](https://facebook.github.io/react/docs/perf.html) for figuring out how your application performs. Enabling them takes some setup. After the setup is done, you can access them through your browser console.

To get started, install the needed dependencies:

```bash
npm install expose-loader react-addons-perf --save-dev
```

Next, we need to expose React to the console through the [expose-loader](https://www.npmjs.com/package/expose-loader). The idea is that we'll bind the React performance utilities to that during development. Here's the webpack loader configuration for exposing React as a global:

```javascript
{
  test: require.resolve('react'),
  use: 'expose-loader?React',
},
```

After this, you should be able to access `React` through a console. To make it possible to access the performance utilities, we need to do one more step. Add the following to the entry point of your application to enable `React.Perf` during development:

```javascript
if (process.env.NODE_ENV !== 'production') {
  React.Perf = require('react-addons-perf');
}
```

If you check out the browser console now, you should be able to access the performance-related API through `React.Perf`. The utilities allow you to understand better what's taking time and to squeeze the last bits of performance out of your application. The *Elements* tab in Chrome can be useful as well. You can see how React operates on the DOM as it flashes.

T> It can be a good idea to install [React Developer Tools](https://github.com/facebook/react-devtools) to Chrome for even more information. This allows you to inspect *props* and *state* of your application.

## Optimizing Rebundling Speed During Development

We can optimize React's rebundling times during development by pointing the development setup to a minified version of React. The gotcha is that we will lose `propType`-based validation. But if speed is more important, this technique may be worth a go. You can hide it behind an environment flag if you want type checking.

In order to achieve what we want, we can use webpack's `module.noParse` option. It accepts a RegExp or an array of RegExps. We can also pass full paths to it to keep our lives simple.

In addition to telling webpack not to parse the minified file we want to use, we also need to point `react` to it. This can be achieved using `resolve.alias` just like we did with *react-lite* above.

We can encapsulate the basic idea within a function like this:

**webpack.parts.js**

```javascript
...

exports.dontParse = function(options) {
  const alias = {};
  alias[options.name] = options.path;

  return {
    module: {
      noParse: [
        new RegExp(options.path),
      ],
    },
    resolve: {
      alias: alias,
    },
  };
};
```

The function can be used like this through [webpack-merge](https://www.npmjs.com/package/webpack-merge):

**webpack.config.js**

```javascript
...

merge([
  common,
leanpub-start-insert
  dontParse({
    name: 'react',
    path: path.join(
      __dirname, 'node_modules', 'react', 'dist', 'react.min.js',
    ),
  }),
leanpub-end-insert
  ...
]);

...
```

If you try developing your application now, it should be at least a little bit faster to rebuild. The technique can be useful for production usage as well as you avoid some processing then.

T> `module.noParse` also accepts a regular expression. If we wanted to ignore all `*.min.js` files for instance, we could set it to `/\.min\.js/`. That can be a more generic way to solve the problem in some cases.

T> Note that aliasing works also with loaders through [resolveLoader.alias](https://webpack.js.org/configuration/resolve/#resolveloader).

W> Not all modules support `module.noParse`, the files included by deps array should have no call to `require`, `define` or similar, or you will get an error when the app runs: `Uncaught ReferenceError: require is not defined`.

## Configuring Webpack to Work with JSX

Some people prefer to name their React components containing JSX using the `.jsx` suffix. Webpack can be configured to work with this convention. The benefit of doing this is that then your editor will be able to pick up the right syntax based on the file name alone. Another option is to configure the editor to use JSX syntax for `.js` files as it's a superset of JavaScript.

Webpack provides [resolve.extensions](https://webpack.js.org/guides/migrating/#resolve-extensions) field that can be used for configuring its extension lookup. If you want to allow imports like `import Button from './Button';` while naming the file as *Button.jsx*, set it up as follows:

**webpack.config.js**

```javascript
...

const common = {
  ...
  resolve: {
    extensions: ['.js', '.jsx'],
  },
};

...
```

The loader configuration is straightforward as well. Instead of matching against `/\.js$/`, we can expand it to include `.jsx` extension through `/\.(js|jsx)$/`. Another option would be to write `/\.jsx?$/`, but I find the explicit alternative more readable.

W> In webpack 1 you had to use `extensions: ['', '.js', '.jsx']` to match files without an extension too. This isn't needed in webpack 2.

## Maintaining Components

One way to structure React projects is to push components to directories which expose their code through a *index.js* file. Often that's just boilerplate code which you have to add for webpack to resolve correctly. [component-directory-webpack-plugin](https://www.npmjs.com/package/component-directory-webpack-plugin) has been designed to alleviate this problem and it allows you to skip *index.js* while performing lookups based on a naming convention.

[create-index](https://www.npmjs.com/package/create-index) provides a different way to solve the same problem. It literally generates those boilerplate *index.js* files to your project and keeps them up to date.

## Conclusion

There are a lot of aspects to keep in mind when configuring webpack to work with React. Fortunately, this is something you don't have to perform often. Once you have a solid basic setup fitting your needs together, it will take you far.
