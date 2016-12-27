# Configuring Hot Module Replacement with React

One of the features that sets React and webpack apart is a feature known as hot loading. This is something that sits on top of webpack's Hot Module Replacement (HMR). The idea is that instead of forcing a full refresh on modification, we patch the code that changed during the runtime.

The advantage of doing this is that it allows our application to retain its state. The process isn't fool proof, but when it works, it's quite neat. As a result we get good developer experience (DX).

You could achieve something similar by persisting your application state in other ways. For instance you could consider using `localStorage` for a similar purpose. You will still get a refresh, but it's far better than losing the entire state. You can reach the same result using multiple ways.

You can even implement the hot loading interface on your own. I'll show you the basic setup for a state container known as [Redux](http://redux.js.org/). It was designed with hot loading in mind and the approach works very well with it.

## Setting Up *babel-preset-react-hmre*

A lot of the hard work has been done for us already. In order to configure our setup to support hot loading, we need to enable a Babel preset known as [babel-preset-react-hmre](https://www.npmjs.com/package/babel-preset-react-hmre) during development. To get started, install it:

```bash
npm i babel-preset-react-hmre --save-dev
```

Given it doesn't make sense to instrument our code with the hot loading logic for production usage, we should restrict it development only. One way to achieve this is to control *.babelrc* through `BABEL_ENV` environment variable.

If you are following the single file setup discussed in this book, we can control it using npm lifecycle event captured when npm is executed. This gives a predictable mapping between *package.json* and *.babelrc*. You can achieve this as follows:

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

In addition, we need to expand our Babel configuration to include the plugin we need during development. This is where that `BABEL_ENV` comes in. Babel determines the value of `env` like this:

1. Use the value of `BABEL_ENV` if set.
2. Use the value of `NODE_ENV` if set.
3. Default to `development`.

To connect `BABEL_ENV='start'` with Babel, configure as follows:

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
leanpub-start-delete
  ]
leanpub-end-delete
leanpub-start-insert
  ],
  "env": {
    "start": {
      "presets": [
        "react-hmre"
      ]
    }
  }
leanpub-end-insert
}
```

After these steps your development setup should support hot loading. It is one of those features that makes development a little faster.

T> If you prefer to see possible syntax errors at the browser console instead of the HMR overlay, enable `webpack.NoErrorsPlugin()` at your webpack `plugins` declaration.

T> Given Babel uses [JSON5](http://json5.org/) underneath, this means you can comment your *.babelrc* files using regular (`//`) comments.

## Configuring Redux

In order to configure Redux reducers to support hot loading, we need to implement webpack's hot loading protocol. Webpack provides a hook known as `module.hot.accept`. It gets called whenever webpack detects a change. This allows you to reload and patch your code.

The idea is useful beyond Redux and can be used with other systems as well. To give you a rough implementation, consider the code below:

```javascript
...

export default function configureStore(initialState) {
  const store = createStoreWithMiddleware(rootReducer, initialState);

  if(module.hot) {
    // Enable webpack hot module replacement for reducers
    module.hot.accept('../reducers', () => {
      const nextReducer = require('../reducers/index').default;

      store.replaceReducer(nextReducer);
    });
  }

  return store;
}
```

The code doesn't do that much. It just waits for a change and then patches the code. The feasibility of patching depends on the underlying architecture. For a system like Redux it is simple given it was designed to be patched. It might be harder to pull off for something else.

T> You can find [a full implementation of the idea online](https://github.com/survivejs-demos/redux-demo).

## Conclusion

You can connect webpack and React in a variety of ways. The approaches allow you to patch React components and store logic even.
