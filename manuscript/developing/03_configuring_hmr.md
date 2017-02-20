# Configuring Hot Module Replacement

**Hot Module Replacement** (HMR) builds on top the WDS. It enables an interface that makes it possible to swap modules live. For example, *style-loader* can update your CSS without forcing a refresh. It is easy to perform HMR with CSS, as it doesn't contain any application state.

HMR is possible with JavaScript too, but due to the state we have in our applications, it's harder. In the *Configuring Hot Module Replacement for React* appendix, we discuss how to set it up with React. You can use the same idea elsewhere as well. Vue and [vue-hot-reload-api](https://www.npmjs.com/package/vue-hot-reload-api) is a good example.

We could use `webpack-dev-server --hot` to achieve this from the CLI. `--hot` enables the HMR portion from webpack through a specific plugin designed for this purpose and writes an entry pointing to a JavaScript file related to it. Another option is to go through webpack configuration as that provides more flexibility.

## Defining Configuration for HMR

If you set up WDS through webpack configuration, you have to attach WDS specific options to a `devServer` field and enable `HotModuleReplacementPlugin`. In addition we need to combine the new configuration with the old one so that it doesn't get applied to the production build as HMR doesn't have any value there. Consider the basic setup below:

**webpack.config.js**

```javascript
...
leanpub-start-insert
const webpack = require('webpack');
leanpub-end-insert

...


const commonConfig = {
  ...
};

leanpub-start-insert
function productionConfig() {
  return commonConfig;
}

function developmentConfig() {
  const config = {
    devServer: {
      // Enable history API fallback so HTML5 History API based
      // routing works. This is a good default that will come
      // in handy in more complicated setups.
      historyApiFallback: true,

      // Don't refresh if hot loading fails. If you want
      // refresh behavior, set hot: true instead.
      hotOnly: true,

      // Display only errors to reduce the amount of output.
      stats: 'errors-only',

      // Parse host and port from env to allow customization.
      //
      // If you use Docker, Vagrant or Cloud9, set
      // host: options.host || '0.0.0.0';
      //
      // 0.0.0.0 is available to all network devices
      // unlike default `localhost`.
      host: process.env.HOST, // Defaults to `localhost`
      port: process.env.PORT, // Defaults to 8080

      // Enable error/warning overlay
      overlay: {
        errors: true,
        warnings: true,
      },
    },
    plugins: [
      new webpack.HotModuleReplacementPlugin(),
    ],
  };

  return Object.assign(
    {},
    commonConfig,
    config,
    {
      plugins: commonConfig.plugins.concat(config.plugins),
    }
  );
}
leanpub-end-insert

module.exports = function(env) {
leanpub-start-delete
  console.log('env', env);

  return commonConfig;
leanpub-end-delete
leanpub-start-insert
  if (env === 'production') {
    return productionConfig();
  }

  return developmentConfig();
leanpub-end-insert
};
```

It's plenty of code. Especially the `Object.assign` portion looks knotty. We'll fix that up in the *Splitting Configuration* chapter as we discuss configuration composition in detail.

Execute `npm start` and surf to **http://localhost:8080**. Try modifying *app/component.js*. Note how it fails to refresh.

![No refresh](images/no-refresh.png)

We get this behavior because we set `hotOnly: true` for WDS. Going with `inline: true` would have swallowed the error and refreshed the page. This behavior is fine, though, as we will implement the HMR interface next to avoid the need for hard refresh. Before that we can do something about those cryptic numbers to get more sensible output.

You can access the application alternately through **http://localhost:8080/webpack-dev-server/** instead of the root. It will provide status information within the browser itself at the top of the application. If your application relies on WebSockets and you use WDS proxying, you'll need to use this specific url: otherwise, WDS logic will interfere.

W> *webpack-dev-server* can be picky about paths. If the given `include` paths don't match the system casing exactly, this can cause it to fail to work. Webpack [issue #675](https://github.com/webpack/webpack/issues/675) discusses the problem in more detail.

W> You should **not** enable HMR for your production configuration. It will likely work, but having the capability enabled there won't do any good and it will make your bundles bigger than they should be.

T> [dotenv](https://www.npmjs.com/package/dotenv) allows you to define environment variables through a *.env* file. This can be somewhat convenient during development and allows you to control the host and port setting of our setup easily.

## Making the Module Ids More Debuggable

When webpack generates a bundle, it needs to tell different modules apart. By default, it uses numbers for this purpose. The problem is that this makes it difficult to debug the code if you must inspect the resulting code. It can also lead to issues with hashing behavior.

To overcome this problem, it is a good idea to use an alternative module ID scheme. As it happens, webpack provides a plugin that's ideal for debugging. This plugin, `NamedModulesPlugin`, emits module paths over numeric IDs. This information is useful for development.

You can enable this better behavior as follows:

**webpack.config.js**

```javascript
...

function developmentConfig() {
  const config = {
    ...
    plugins: [
      new webpack.HotModuleReplacementPlugin(),
leanpub-start-insert
      new webpack.NamedModulesPlugin(),
leanpub-end-insert
    ],
  };

  ...
}

...
```

If you restart the development server (terminate it and run `npm start`), you should see something more familiar:

![No refresh, but better output](images/no-refresh2.png)

The message tells us that even though the HMR interface notified the client portion of the code of a hot update, we failed to do anything about it. This is something we have to fix next to make the code work as we expect.

T> We will perform a similar trick for production usage later in this book in the *Adding Hashes to Filenames* chapter.

T> A similar effect can be achieved by setting `output.pathInfo = true`. It will still use number based indices while emitting the path to the module within a comment. This should be used for development purposes only.

## Implementing the HMR Interface

Webpack exposes the HMR interface through a global, `module.hot`. It provides updates through `module.hot.accept(<path to watch>, <handler>)` function and we need to patch the application there. In this case, it is enough to replace the old DOM node with a newer one as we receive updates.

The following implementation illustrates the idea:

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
    const nextComponent = component();

    // Replace old content with the hot loaded one
    document.body.replaceChild(nextComponent, demoComponent);

    demoComponent = nextComponent;
  });
}
leanpub-end-insert
```

If you refresh the browser, try to modify *app/component.js* after this change, and alter the text to something else, you should notice that the browser does not refresh at all. Instead, it should replace the DOM node while retaining the rest of the application as is. The image below shows possible output.

![Patched a module successfully through HMR](images/hmr.png)

The idea is the same with styling, React, Redux, and other technologies. Sometimes you may not have to implement the interface yourself even as available tooling takes care of that for you.

T> That `if(module.hot)` block will be eliminated entirely from the production build as minifier picks it up. The *Minifying Build* chapter delves deeper into this topic.

## HMR on Windows, Ubuntu, and Vagrant

The setup may be problematic on older versions of Windows, Ubuntu, and Vagrant. We can solve this through polling:

**webpack.config.js**

```javascript
...

function developmentConfig() {
  const config = {
    devServer: {
      ...

leanpub-start-insert
      watchOptions: {
        // Delay the rebuild after the first change
        aggregateTimeout: 300,

        // Poll using interval (in ms, accepts boolean too)
        poll: 1000,
      },
leanpub-end-insert
    },
    plugins: [
      ...
leanpub-start-insert
      // Ignore node_modules so CPU usage with poll
      // watching drops significantly.
      new webpack.WatchIgnorePlugin([
        path.join(__dirname, 'node_modules')
      ]),
leanpub-end-insert
    ],
  };

  ...
}

...
```

Given this setup polls the file system, it is more resource intensive. It's worth giving a go if the default doesn't work, though.

T> There are more details in *webpack-dev-server* issue [#155](https://github.com/webpack/webpack-dev-server/issues/155).

## Setting WDS Entry Points Manually

In the setup above, the WDS-related entries were injected automatically. Assuming you are using WDS through Node, you would have to set them yourself as the Node API doesn't support injecting. The example below illustrates how you might achieve this:

```javascript
entry: {
  hmr: [
    // Include the client code.
    // Note how the host/port setting maps here.
    'webpack-dev-server/client?http://localhost:8080',

    // Hot reload only when compiled successfully
    'webpack/hot/only-dev-server',

    // Alternative with refresh on failure
    // 'webpack/hot/dev-server',
  ],
  // The rest of the entries
  ...
},
```

## Other Features of *webpack-dev-server*

WDS provides functionality beyond what was covered above. There are a couple of important fields that you should be aware of:

* `devServer.contentBase` - Assuming you don't generate *index.html* dynamically like in this setup and rather prefer to maintain it yourself in some directory, you'll need to point WDS to it. `contentBase` accepts either a path (e.g., `'build'`) or an array of paths (e.g., `['build', 'images']`). This defaults to the project root.
* `devServer.proxy` - If you are using multiple servers, you may have to proxy WDS to them. The proxy setting accepts an object of proxy mappings (e.g., `{ '/api': 'http://localhost:3000/api' }`) that allow WDS to resolve matching queries to another server. Proxy settings are disabled by default.
* `devServer.headers` - If you want to attach custom headers to your requests, this is the place to do it.

T> [The official documentation](https://webpack.js.org/configuration/dev-server/) covers more options.

## Conclusion

HMR is one of those aspects of webpack that makes it interesting for developers. Even though other tools have similar functionality, webpack has taken its implementation far. To get the most out of it, you must implement the HMR interface or use solutions that implement it.

In the next chapter we'll make it harder to make mistakes by introducing linting to our project.

T> The *Hot Module Replacement with React* appendix discusses HMR specifics related to React.
