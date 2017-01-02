# Configuring Hot Module Replacement

Hot Module Replacement (HMR) builds on top the WDS. It enables an interface that makes it possible to swap modules live. For example, *style-loader* is able to update your CSS without forcing a refresh. It is easy to perform HMR with CSS as it doesn't contain any application state.

HMR is possible with JavaScript too, but due to the state we have in our applications, it's harder. In the *Configuring React* chapter we discuss how to set it up with React. You can use the same idea elsewhere.

We could use `webpack-dev-server --hot` to achieve this from the CLI. `--hot` enables the HMR portion from webpack through a specific plugin designed for this purpose and writes an entry pointing to a JavaScript file related to it.

## Defining Configuration for HMR

To keep our configuration manageable, I'll split functionalities like HMR into *parts* of their own. This keeps our *webpack.config.js* simple and promotes reuse. We could push a collection like this to a npm package of its own. We could even turn them into presets to use across projects. Functional composition allows that.

Here's what a part implementing HMR looks like:

**webpack.parts.js**

```javascript
const webpack = require('webpack');

exports.devServer = function(options) {
  return {
    devServer: {
      // Enable history API fallback so HTML5 History API based
      // routing works. This is a good default that will come
      // in handy in more complicated setups.
      historyApiFallback: true,

      // Unlike the cli flag, this doesn't set
      // HotModuleReplacementPlugin!
      hot: true,

      // Don't refresh if hot loading fails. If you want
      // refresh behavior, set inline: true instead.
      hotOnly: true,

      // Display only errors to reduce the amount of output.
      stats: 'errors-only',

      // Parse host and port from env to allow customization.
      //
      // If you use Vagrant or Cloud9, set
      // host: options.host || '0.0.0.0';
      //
      // 0.0.0.0 is available to all network devices
      // unlike default `localhost`.
      host: options.host, // Defaults to `localhost`
      port: options.port // Defaults to 8080
    },
    plugins: [
      // Enable multi-pass compilation for enhanced performance
      // in larger projects. Good default.
      new webpack.HotModuleReplacementPlugin({
        // Disabled as this won't work with html-webpack-template yet
        //multiStep: true
      })
    ]
  };
};
```

It's plenty of code, but it's better to encapsulate it so it contains ideas we understand and want to reuse later on.

W> You should **not** enable HMR for your production configuration. It will likely work, but having the capability enabled there won't do any good and it will make your bundles bigger than they have to be.

## Connecting with Configuration

Hooking up this part with our main configuration is simple:

**webpack.config.js**

```javascript
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const merge = require('webpack-merge');

leanpub-start-insert
const parts = require('./webpack.parts');
leanpub-end-insert

...

module.exports = function(env) {
  return merge(
    common,
    {
      // Disable performance hints during development
      performance: {
        hints: false
      },
      plugins: [
        new webpack.NamedModulesPlugin()
      ]
leanpub-start-delete
    }
leanpub-end-delete
leanpub-start-insert
    },
    parts.devServer({
      // Customize host/port here if needed
      host: process.env.HOST,
      port: process.env.PORT
    })
leanpub-end-insert
  );
};
```

Execute `npm start` and surf to **localhost:8080**. Try modifying *app/component.js*. It should refresh the browser just like earlier, but now we have the setup needed to enable the rest. To demonstrate the idea better, we can implement the hot loading interface ourselves to see the system in action.

W> *webpack-dev-server* can be very particular about paths. If the given `include` paths don't match the system casing exactly, this can cause it to fail to work. Webpack [issue #675](https://github.com/webpack/webpack/issues/675) discusses this in more detail.

T> You should be able to access the application alternatively through **localhost:8080/webpack-dev-server/** instead of the root. It will provide status information within the browser itself at the top of the application. If your application relies on WebSockets and you use WDS proxying, you'll need to use this specific url as otherwise WDS own logic will interfere.

## Implementing the HMR Interface

It is possible to implement the HMR interface through a global known as `module.hot` exposed by webpack. It provides updates through a function known as `module.hot.accept`. It's first parameter will accept a path to watch for updates while the latter will accept a function where to deal with the hot update. That's where we can reload the module and patch out application.

In this case it is enough to replace the old DOM node with a newer one as we receive updates. The following implementation illustrates the idea:

**app/index.js**

```javascript
import component from './component';

leanpub-start-delete
document.body.appendChild(component());
leanpub-end-delete
leanpub-start-insert
let demoComponent = component();

document.body.appendChild(demoComponent);

// HMR interface
if(module.hot) {
  // Capture hot update
  module.hot.accept('./component', () => {
    // We have to go through CommonJS here and capture the
    // default export explicitly!
    const nextComponent = require('./component').default();

    // Replace old content with the hot loaded one
    document.body.replaceChild(nextComponent, demoComponent);

    demoComponent = nextComponent;
  });
}
leanpub-end-insert
```

If you try to modify *app/component.js* after this change and change the text to something else, you should notice that the browser does not refresh at all. Instead, it should replace the DOM node while retaining the rest of the application as is. The image below shows possible output.

![Patched a module successfully through HMR](images/hmr.png)

The idea is the same with styling, React, Redux, and other technologies. They use the same interface internally and often you don't need to care about the exact implementation. Still, it's good to know what it's doing under the hood.

W> If you make a mistake at within your `module.hot.accept` handler, it will force a refresh by default! This happens because WDS defaults to `webpack/hot/dev-server`. Follow the setup of the previous chapter and use `webpack/hot/only-dev-server` instead to avoid this behavior.

T> Check out the *Configuring Hot Module Replacement with React* to learn how to get webpack and React work together in a nicer manner.

## HMR on Windows, Ubuntu, and Vagrant

The setup may be problematic on certain versions of Windows, Ubuntu, and Vagrant. We can solve this through polling:

**webpack.parts.js**

```javascript
const webpack = require('webpack');

exports.devServer = function(options) {
  return {
    devServer: {
leanpub-start-insert
      watchOptions: {
        // Delay the rebuild after the first change
        aggregateTimeout: 300,
        // Poll using interval (in ms, accepts boolean too)
        poll: 1000
      },
leanpub-end-insert
      ...
    },
    plugins: [
leanpub-start-insert
      // ignore node_modules so CPU usage with poll watching drops significantly
      new webpack.WatchIgnorePlugin([
        path.join(__dirname, 'node_modules')
      ]),
leanpub-end-insert
      ...
    ]
  };
}
```

Given this setup polls the file system, it is going to be more resource intensive. It's worth giving a go if the default doesn't work, though.

T> There are more details in *webpack-dev-server* issue [#155](https://github.com/webpack/webpack-dev-server/issues/155).

## Setting WDS Entry Points Manually

In the setup above, the WDS related entries were injected automatically. Assuming you are using WDS through Node.js, you would have to set them yourself as the Node.js API doesn't support injecting. The example below illustrates how you might achieve this:

```javascript
entry: {
  hmr: [
    // Include the client code.
    // Note how the host/port setting maps here.
    'webpack-dev-server/client?http://localhost:8080',

    // Hot reload only when compiled successfully
    'webpack/hot/only-dev-server'

    // Alternative with refresh on failure
    // 'webpack/hot/dev-server'
  ],
  // Rest of the entries
  ...
}
```

## Conclusion

HMR is one of those aspects of webpack that makes it interesting for developers. Even though other tools have similar functionality, webpack has taken its implementation quite far. To get most out of it, you will have to implement the HMR interface or use solutions that implement it.
