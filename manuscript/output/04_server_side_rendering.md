# Server Side Rendering

**Server Side Rendering** (SSR) is a technique that allows you to serve an initial payload with HTML, JavaScript, CSS, and even application state. It is a more complicated than serving a **Single Page Application** (SPA) as you have to take care with the markup. SSR can yield benefits related to performance and Search Engine Optimization (SEO) while coming with a technical cost.

Webpack allows you to use SSR in a couple of ways. Often you see it used with Facebook's [React](https://facebook.github.io/react/) that helped to popularize the approach. I'll show you next how to configure React with webpack and then discuss how to handle SSR with these technologies.

## Setting Up Babel with React

The *Processing with Babel* chapter covers the essentials of using Babel with webpack. There's some React specific setup you should perform, though. Given most of React projects rely on [JSX](https://facebook.github.io/jsx/) format, you will have to enable it through Babel.

To get React, and particularly JSX, work with Babel, install the preset first:

```bash
npm install babel-preset-react --save-dev
```

Connect the preset with Babel configuration as follows:

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

## Setting Up a React Demo

To make sure the project has the dependencies in place, install React and [react-dom](https://www.npmjs.com/package/react-dom). The latter package is needed to render the application to the DOM.

```bash
npm install react react-dom --save
```

Next we are going to need a small entry point for the React code. It will mount a `Hello world` div within a `div` that we will attach to a page template.

**app/react.js**

```javascript
import React from 'react';
import ReactDOM from 'react-dom';

const app = document.createElement('div');
document.body.appendChild(app);

ReactDOM.render(<div>Hello world</div>, app);
```

We are missing one bit, the webpack configuration that attaches the React demo to a page.

T> An alternative way to handle with the element into which mount would have been to a package like [html-webpack-template](https://www.npmjs.com/package/html-webpack-template) or [html-webpack-template-pug](https://www.npmjs.com/package/html-webpack-template-pug). A custom template would have been yet another option.

## Configuring Webpack

As earlier, we can set up a page of its own for the demonstration and point the new entry point to it:

**webpack.config.js**

```javascript
...

const PATHS = {
  app: path.join(__dirname, 'app'),
  build: path.join(__dirname, 'build'),
leanpub-start-insert
  reactDemo: path.join(__dirname, 'app', 'react.js'),
leanpub-end-insert
};

...

module.exports = function(env) {
  const pages = [
    ...
leanpub-start-insert
    parts.page({
      title: 'React demo',
      path: 'react',
      entry: {
        react: reactDemo,
      },
      chunks: ['react', 'manifest', 'vendor'],
    }),
leanpub-end-insert
  ];
  ...
};
```

If you run the application now and navigate below `/react`, you should something familiar:

![Hello world](images/hello_01.png)

Even though we have a basic React application running now, it's a little difficult to develop. If you try to modify the code, you will notice that webpack will give a warning familiar from the *Configuring Hot Module Replacement* chapter. To improve the developer experience, we have to implement the hot replacement interface.

T> If you get a linting warning like `warning  'React' is defined but never used  no-unused-vars`, make sure the ESLint React plugin has been enabled and its default preset is in use.

## Configuring Hot Module Replacement with React

Hot module replacement was one of the initial selling points of webpack and React. It relies on the [react-hot-loader](https://www.npmjs.com/package/react-hot-loader) package. At the time of writing, version 3 of *react-hot-loader* is in beta. It requires changes to three places: Babel configuration, webpack configuration, and application. I'll cover these next.

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

On webpack side, *react-hot-loader* requires an additional entry it uses to patch the running application. It is important the new entry runs first as otherwise the setup will fail to work reliably:

**webpack.config.js**

```javascript
...

module.exports = function(env) {
  const pages = [
    ...
    parts.page({
      title: 'React demo',
      path: 'react',
      entry: {
leanpub-start-delete
        react: reactDemo,
leanpub-end-delete
leanpub-start-insert
        react: env === 'production' ? PATHS.reactDemo :
          ['react-hot-loader/patch', PATHS.reactDemo],
leanpub-end-insert
      },
      chunks: ['react', 'manifest', 'vendor'],
    }),
  ];
  ...
};
```

Patching is needed still as we have to make the application side aware of hot loading.

### Setting Up the Application

Compared to the earlier implementation, the basic idea is the same on application side. This time, however, `AppContainer` provided by *react-hot-loader* has to be used. It performs the patching during development. To attach it to the application, adjust as follows:

**app/react.js**

```javascript
import React from 'react';
import ReactDOM from 'react-dom';
import Counter from './counter';
import { AppContainer } from 'react-hot-loader';

const app = document.createElement('div');
document.body.appendChild(app);

const render = App => {
  ReactDOM.render(
    <AppContainer><App /></AppContainer>,
    app
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
        <button onClick={() => this.setState(addOne)}>
          Add one
        </button>
      </div>
    );
  }
}

const addOne = ({ amount }) => ({ amount: amount + 1 });

export default Counter;
```

If you run the application after these changes and modify the aforementioned file, it should pick up changes without a hard refresh while retaining the amount.

### Removing *react-hot-loader* Related Code from the Production Output

If you build the application (`npm run build`) and examine the output, you might spot references to `__REACT_HOT_LOADER__` there. This is because of the Babel setup. It will use `react-hot-loader/babel` plugin regardless of the build target. In order to overcome this slight annoyance, we should configure Babel to apply the plugin only when we are developing.

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

Even after this change the source contains some references still. This is a [bug in react-hot-loader](https://github.com/gaearon/react-hot-loader/issues/471) as it has been built so that it loses information that's valuable for a bundler.

It is possible to work around the issue by implementing a module chooser pattern as described in the *Setting Environment Variables* chapter. The idea is that `AppContainer` provided by *react-hot-loader* would be mocked with a dummy implementation during production usage.

T> The aforementioned `env` technique can be used to apply Babel presets and plugins per environment. You could enable additional checks and logging during development this way. See the *Processing with Babel* chapter for more information.

## SSR with React

TODO: show how to expand the setup to SSR one

## Configuring Webpack to Work with JSX

Some people prefer to name their React components containing JSX using the `.jsx` suffix. Webpack can be configured to work with this convention. The benefit of doing this is that then your editor will be able to pick up the right syntax based on the file name alone. Another option is to configure the editor to use JSX syntax for `.js` files as it's a superset of JavaScript.

Webpack provides [resolve.extensions](https://webpack.js.org/guides/migrating/#resolve-extensions) field that can be used for configuring its extension lookup. If you want to allow imports like `import Button from './Button';` while naming the file as *Button.jsx*, set it up as follows:

```javascript
{
  resolve: {
    extensions: ['.js', '.jsx'],
  },
},
```

The loader configuration is straightforward as well. Instead of matching against `/\.js$/`, we can expand it to include `.jsx` extension through `/\.(js|jsx)$/`. Another option would be to write `/\.jsx?$/`, but I find the explicit alternative more readable.

W> In webpack 1 you had to use `extensions: ['', '.js', '.jsx']` to match files without an extension too. This isn't needed in webpack 2.

## Maintaining Components

One way to structure React projects is to push components to directories which expose their code through a *index.js* file. Often that's just boilerplate code which you have to add for webpack to resolve correctly. [component-directory-webpack-plugin](https://www.npmjs.com/package/component-directory-webpack-plugin) has been designed to alleviate this problem and it allows you to skip *index.js* while performing lookups based on a naming convention.

[create-index](https://www.npmjs.com/package/create-index) provides a different way to solve the same problem. It literally generates those boilerplate *index.js* files to your project and keeps them up to date.

## Get Started Fast with *create-react-app*

The fastest way to get started with webpack and React is to use [create-react-app](https://www.npmjs.com/package/create-react-app). It is a zero configuration approach that encapsulates a lot of best practices and it is particularly useful if you want to get started with a little project fast with minimal setup.

One of the main attractions of *create-react-app* is a feature known as *ejecting*. This means that instead of treating it as a project dependency, you'll get a full webpack setup out of it.

There's a gotcha, though. After you eject, you cannot go back to the dependency-based model, and you will have to maintain the resulting setup yourself.

## Conclusion

TODO
