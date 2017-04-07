# Hot Module Replacement with React

Hot module replacement was one of the initial selling points of webpack and React. It relies on the [react-hot-loader](https://www.npmjs.com/package/react-hot-loader) package. At the time of writing, version 3 of *react-hot-loader* is in beta. It requires changes to three places: Babel configuration, webpack configuration, and application.

Before proceeding, make sure you have HMR set up as discussed in the *Hot Module Replacement* appendix.

To get started, install the upcoming version of *react-hot-loader* as a normal dependency as it comes with a small application dependency:

```bash
npm install react-hot-loader@next --save
```

## Setting Up Babel

To connect Babel with *react-hot-loader*, it needs to become aware of its plugin portion:

**.babelrc**

```json
{
leanpub-start-delete
  "plugins": ["syntax-dynamic-import"],
leanpub-end-delete
leanpub-start-insert
  "plugins": ["syntax-dynamic-import", "react-hot-loader/babel"],
leanpub-end-insert
  ...
}
```

{pagebreak}

## Setting Up Webpack

On the webpack side, *react-hot-loader* requires an additional entry it uses to patch the running application. It's important the new entry runs first as otherwise the setup fails to work reliably:

**webpack.config.js**

```javascript
module.exports = (env) => {
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
        react: env === 'production' ?
          PATHS.reactDemo :
          ['react-hot-loader/patch', PATHS.reactDemo],
leanpub-end-insert
      },
      chunks: ['react', 'manifest', 'vendor'],
    }),
  ];
  ...
};
```

Patching is needed still as you have to make the application side aware of hot loading.

T> This tweak is not required in the future as *react-hot-loader* evolves. It's possible to inject an empty module for `'react-hot-loader/patch'` if it detects that production environment is used. For now, it's needed, though.

## Setting Up the Application

On React side, *react-hot-loader* relies on an `AppContainer` that deals with patching. You still have to implement the Hot Module Replacement interface as earlier. Set up an entry point for the demo as follows:

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

{pagebreak}

To test the setup, a component is needed as well. In this case, it's going to be a counter so you can see how the hot replacement mechanism maintains the state:

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

If you run the application after these changes and modify the file above, it should pick up changes without a hard refresh while retaining the amount.

{pagebreak}

## Removing *react-hot-loader* Related Code from the Production Output

If you build the application (`npm run build`) and examine the output, you spot references to `__REACT_HOT_LOADER__` there due to the Babel setup. It uses `react-hot-loader/babel` plugin regardless of the build target. To overcome this slight annoyance, you should configure Babel to apply the plugin only when you are developing.

Babel provides an [env option](https://babeljs.io/docs/usage/babelrc/#env-option) for this purpose. It respects both `NODE_ENV` and `BABEL_ENV` environment variables. If `BABEL_ENV` is set, it receives precedence. To fix the issue, you can push the problematic Babel plugin behind a development specific `env` while controlling its behavior within webpack configuration by setting `BABEL_ENV`.

The webpack portion should be adjusted:

**webpack.config.js**

```javascript
module.exports = (env) => {
leanpub-start-insert
  process.env.BABEL_ENV = env;
leanpub-end-insert

  ...
};
```

Now Babel will receive the same `env` as webpack allowing you to fix the behavior.

{pagebreak}

Tweak Babel setup, so it matches the fields below. The key part is in pushing `react-hot-loader/patch` below `env`:

**.babelrc**

```json
{
leanpub-start-delete
  "plugins": [
    "syntax-dynamic-import",
    "react-hot-loader/babel"
  ],
leanpub-end-delete
leanpub-start-insert
  "plugins": ["syntax-dynamic-import"],
leanpub-end-insert
  ...
leanpub-start-insert
  "env": {
    "development": {
      "plugins": [
        "react-hot-loader/babel"
      ]
    }
  }
leanpub-end-insert
}
```

T> This tweak may not be required in the future as *react-hot-loader* evolves further. See the *Loading JavaScript* chapter to learn more about Babel `env`.

The development setup should work after this change still. If you examine the build output, you should notice it's missing references to `__REACT_HOT_LOADER__`.

Even after this change, the source can contain references still due to a [bug in react-hot-loader](https://github.com/gaearon/react-hot-loader/issues/471) as it has been built so that it loses information. The issue can be worked around by implementing a module chooser pattern as in the *Environment Variables* chapter. `AppContainer` provided by *react-hot-loader* should be mocked with a dummy.

{pagebreak}

## Configuring HMR with Redux

[Redux](http://redux.js.org/) is a popular state management library designed HMR in mind. To configure Redux reducers to support HMR, you have to implement the protocol as above:

```javascript
const configureStore = (initialState) => {
  const store = createStoreWithMiddleware(
    rootReducer,
    initialState
  );

  if(module.hot) {
    // Enable webpack hot module replacement for reducers
    module.hot.accept(
      '../reducers',
      () => store.replaceReducer(reducers)
    );
  }

  return store;
}

export default configureStore;
```

T> You can find [a full implementation of the idea online](https://github.com/survivejs-demos/redux-demo).

{pagebreak}

## Configuring Webpack to Work with JSX

Sometimes people prefer to name their React components containing JSX using the `.jsx` suffix. Webpack can be configured to work with this convention. The benefit of doing this is that then your editor is able to pick up the right syntax based on the file name alone. Another option is to configure the editor to use JSX syntax for `.js` files as it's a superset of JavaScript.

Webpack provides [resolve.extensions](https://webpack.js.org/guides/migrating/#resolve-extensions) field that can be used for configuring its extension lookup. If you want to allow imports like `import Button from './Button';` while naming the file as *Button.jsx*, set it up as follows:

```javascript
{
  resolve: {
    extensions: ['.js', '.jsx'],
  },
},
```

To resolve the problem at loader configuration, instead of matching against `/\.js$/`, you can expand it to include `.jsx` extension through `/\.(js|jsx)$/`. Another option would be to write `/\.jsx?$/`, but the explicit alternative is more readable.

W> In webpack 1 you had to use `extensions: ['', '.js', '.jsx']` to match files without an extension too. This isn't needed in webpack 2.

## Get Started Fast with *create-react-app*

[create-react-app](https://www.npmjs.com/package/create-react-app) allows you to get started fast with webpack and React. It's a zero configuration approach that encapsulates a lot of best practices allowing you to get started fast with minimal setup.

*create-react-app* allows you to extract a full-blown webpack setup by **ejecting**. There's a problem, though. After you eject, you cannot go back to the dependency-based model, and you have to maintain the resulting setup yourself.

## Conclusion

*react-hot-loader* allows you to set up HMR with webpack. It was one of the initial selling points of both and is still a good technique. The setup takes care, but after you have it running, it's nice.

To recap:

* Setting up *react-hot-loader* requires changes to Babel, webpack, and application.
* On Babel level you must enable *react-hot-loader/babel* plugin.
* Webpack configuration has to inject `'react-hot-loader/patch'` entry before the application.
* Application has to be wrapped into `AppContainer` provided by *react-hot-loader*.
* The setup may get easier to manage as *react-hot-loader* develops further.
* HMR can be configured to work with Redux by implementing `module.hot.accept` against reducers.
* Webpack makes it convenient to work with `.jsx` files.
* *create-react-app* allows you to get started fast with webpack and React.
