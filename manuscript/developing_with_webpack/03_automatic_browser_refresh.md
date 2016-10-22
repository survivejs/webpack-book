# Automatic Browser Refresh

Tools, such as [LiveReload](http://livereload.com/) or [Browsersync](http://www.browsersync.io/), allow us to refresh the browser as we develop our application. They can even avoid refresh for CSS changes.

A good first step towards a better development environment would be to use Webpack in its **watch** mode. You can activate it through `webpack --watch`. Once enabled, it will detect changes made to your files and recompiles automatically. A solution known as *webpack-dev-server* builds on top of the watch mode and goes even further.

*webpack-dev-server* is a development server running in-memory. It refreshes content automatically in the browser while you develop your application. It also supports an advanced Webpack feature known as Hot Module Replacement (HMR), which provides a way to patch the browser state without a full refresh. This is particularly powerful with technology such as React.

W> You should use *webpack-dev-server* strictly for development. If you want to host your application, consider other standard solutions, such as Apache or Nginx.

W> An IDE feature known as **safe write** can wreak havoc with hot loading. Therefore it is advisable to turn it off when using a HMR based setup.

## Getting Started with *webpack-dev-server*

To get started with *webpack-dev-server*, execute:

```bash
npm i webpack-dev-server --save-dev
```

As before, this command will generate a command below the `npm bin` directory. You could try running *webpack-dev-server* from there. The quickest way to enable automatic browser refresh for our project is to run `webpack-dev-server --inline`. `--inline`, runs the server in so called *inline* mode that writes the webpack-dev-server client to the resulting code.

### Attaching *webpack-dev-server* to the Project

To integrate *webpack-dev-server* to our project, we can follow the same idea as in the previous chapter and define a new command to the `scripts` section of *package.json*:

**package.json**

```json
...
"scripts": {
leanpub-start-insert
  "start": "webpack-dev-server",
leanpub-end-insert
  "build": "webpack"
},
...
```

We'll add that `--inline` part back through Webpack configuration in a bit. I prefer to keep the npm *scripts* portion as simple as possible and push the complexity to configuration. Even though it's more code to write, it's also easier to maintain as you can see easier what's going on.

If you execute either *npm run start* or *npm start* now, you should see something like this at the terminal:

```bash
> webpack-dev-server

[webpack-validator] Config is valid.
http://localhost:8080/webpack-dev-server/
webpack result is served from /
content is served from .../webpack-demo
Hash: 2dca5a3850ce5d2de54c
Version: webpack 1.13.0
```

The output means that the development server is running. If you open *http://localhost:8080/* at your browser, you should see something.

If you try modifying the code, you should see output at your terminal. The problem is that the browser doesn't catch these changes without a hard refresh and that flag. That's something we need to resolve next through configuration.

![Hello world](images/hello_01.png)

T> If you fail to see anything at the browser, you may need to use a different port. The server might fail to run because there's something else running in the port. You can verify this through terminal using a command such as `netstat -na | grep 8080`. If there's something running in the port 8080, it should display a message. The exact command may depend on the platform.

## Configuring Hot Module Replacement (HMR)

Hot Module Replacement builds on top the *webpack-dev-server*. It enables an interface that makes it possible to swap modules live. For example, *style-loader* is able to update your CSS without forcing a refresh. It is easy to perform HMR with CSS as it doesn't contain any application state.

HMR is possible with JavaScript too, but due to the state we have in our applications, it's harder. In the *Configuring React* chapter we discuss how to set it up with React. You can use the same idea elsewhere.

We could use `webpack-dev-server --inline --hot` to achieve this from the CLI. `--hot` enables the HMR portion from Webpack through a specific plugin designed for this purpose and writes an entry pointing to a JavaScript file related to it.

### Defining Configuration for HMR

To keep our configuration manageable, I'll split functionalities like HMR into parts of their own. This keeps our *webpack.config.js* simple and promotes reuse. We could push a collection like this to a npm package of its own. We could even turn them into presets to use across projects. Functional composition allows that.

I'll push all of our configuration parts to *libs/parts.js* and consume them from there. Here's what a part would look like for HMR:

**libs/parts.js**

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
      inline: true,

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
        multiStep: true
      })
    ]
  };
}
```

It's plenty of code, but it's better to encapsulate it so it contains ideas we understand and want to reuse later on. Fortunately hooking up this part with our main configuration is simple:

**webpack.config.js**

```javascript
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const merge = require('webpack-merge');
const validate = require('webpack-validator');

leanpub-start-insert
const parts = require('./libs/parts');
leanpub-end-insert

...

// Detect how npm is run and branch based on that
switch(process.env.npm_lifecycle_event) {
  case 'build':
    config = merge(common, {});
    break;
  default:
leanpub-start-delete
    config = merge(common, {});
leanpub-end-delete
leanpub-start-insert
    config = merge(
      common,
      parts.devServer({
        // Customize host/port here if needed
        host: process.env.HOST,
        port: process.env.PORT
      })
    );
leanpub-end-insert
}

module.exports = validate(config);
```

Execute `npm start` and surf to **localhost:8080**. Try modifying *app/component.js*. It should refresh the browser. Note that this is a hard refresh in case you modify JavaScript code. CSS modifications work in a neater manner and can be applied without a refresh as we will see in the next chapter.

W> *webpack-dev-server* can be very particular about paths. If the given `include` paths don't match the system casing exactly, this can cause it to fail to work. Webpack [issue #675](https://github.com/webpack/webpack/issues/675) discusses this in more detail.

T> You should be able to access the application alternatively through **localhost:8080/webpack-dev-server/** instead of the root. It will provide status information within the browser itself at the top of the application.

### HMR on Windows, Ubuntu, and Vagrant

The setup may be problematic on certain versions of Windows, Ubuntu, and Vagrant. We can solve this through polling:

**libs/parts.js**

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

Given this setup polls the filesystem, it is going to be more resource intensive. It's worth giving a go if the default doesn't work, though.

T> There are more details in *webpack-dev-server* issue [#155](https://github.com/webpack/webpack-dev-server/issues/155).

## Accessing the Development Server from Network

It is possible to customize host and port settings through the environment in our setup (i.e., `export PORT=3000` on Unix or `SET PORT=3000` on Windows). This can be useful if you want to access your server using some other device within the same network. The default settings are enough on most platforms.

To access your server, you'll need to figure out the ip of your machine. On Unix this can be achieved using `ifconfig | grep inet`. On Windows `ipconfig` can be used. An npm package, such as [node-ip](https://www.npmjs.com/package/node-ip) may come in handy as well. Especially on Windows you may need to set your `HOST` to match your ip to make it accessible.

## Alternative Ways to Use *webpack-dev-server*

We could have passed *webpack-dev-server* options through terminal. I find it clearer to manage it within Webpack configuration as that helps to keep *package.json* nice and tidy. It is also easier to understand what's going on as you don't need to dig the answers from Webpack source.

Alternatively, we could have set up an Express server of our own and used *webpack-dev-server* as a [middleware](https://webpack.github.io/docs/webpack-dev-middleware.html). There's also a [Node.js API](https://webpack.github.io/docs/webpack-dev-server.html#api). This is a good approach if you want control and flexibility.

T> [dotenv](https://www.npmjs.com/package/dotenv) allows you to define environment variables through a *.env* file. This can be somewhat convenient during development!

W> Note that there are [slight differences](https://github.com/webpack/webpack-dev-server/issues/106) between the CLI and the Node.js API. This is the reason why some prefer to solely use the Node.js API.

## Conclusion

In this chapter you learned to set up Webpack to refresh your browser automatically. We can go a notch further and make this work beautifully with CSS files. We'll do that in the next chapter.
