# Automatic Browser Refresh

Tools, such as [LiveReload](http://livereload.com/) or [BrowserSync](http://www.browsersync.io/), allow us to refresh the browser as we develop our application and avoid refresh for CSS changes. It is possible to setup Browsersync to work with webpack through [browser-sync-webpack-plugin](https://www.npmjs.com/package/browser-sync-webpack-plugin), but webpack has more tricks in store.

## Webpack `watch` Mode and *webpack-dev-server*

A good first step towards a better development environment is to use webpack in its **watch** mode. You can activate it through `webpack --watch`. Once enabled, it will detect changes made to your files and recompile automatically. A solution known as *webpack-dev-server* (WDS) builds on top of the watch mode and goes even further.

WDS is a development server running **in-memory**. It refreshes content automatically in the browser while you develop your application. It also supports an advanced webpack feature known as **Hot Module Replacement** (HMR), which provides a way to patch the browser state without a full refresh. This is particularly powerful with technology such as React.

HMR goes further than simply refreshing browser on change. WDS provides an interface that makes it possible to patch code on the fly. This means you will need to implement it for client-side code. It is trivial for something like CSS by definition (no state), but it's a harder problem with JavaScript frameworks and libraries. Often careful design is needed to allow this. When the feature works, it is beautiful.

W> An IDE feature known as **safe write** can wreak havoc with hot loading. Therefore, it is advisable to turn it off when using an HMR-based setup.

## Emitting Files from *webpack-dev-server*

Even though it's good that WDS operates in-memory by default, sometimes it can be good to emit files to the file system. This is particularly true if you are integrating with another server that expects to find the files. [webpack-disk-plugin](https://www.npmjs.com/package/webpack-disk-plugin), [write-file-webpack-plugin](https://www.npmjs.com/package/write-file-webpack-plugin), and more specifically [html-webpack-harddisk-plugin](https://www.npmjs.com/package/html-webpack-harddisk-plugin) can achieve this.

W> You should use *webpack-dev-server* strictly for development. If you want to host your application, consider other standard solutions, such as Apache or Nginx.

## Getting Started with *webpack-dev-server*

To get started with WDS, execute:

```bash
npm i webpack-dev-server@beta --save-dev
```

As before, this command will generate a command below the `npm bin` directory. You could try running *webpack-dev-server* from there. The quickest way to enable automatic browser refresh for our project is to run `webpack-dev-server`. After that, you have a development server running at `localhost:8080`.

## Attaching *webpack-dev-server* to the Project

To integrate WDS to our project, we should define a npm script for it. To follow npm conventions, we can call it as *start*. To tell our targets apart, we should pass information about the environment to webpack configuration. This will allow us specialize the configuration as needed:

**package.json**

```json
...
"scripts": {
leanpub-start-insert
  "start": "webpack-dev-server --env development",
  "build": "webpack --env production"
leanpub-end-insert
leanpub-start-delete
  "build": "webpack"
leanpub-end-delete
},
...
```

If you execute either *npm run start* or *npm start* now, you should see something like this at the terminal:

```bash
> webpack-dev-server --env development

Project is running at http://localhost:8080/
webpack output is served from /
Hash: a6629a1f55a2c758876b
Version: webpack 2.2.0
Time: 727ms
     Asset       Size  Chunks             Chunk Names
    app.js     247 kB       0  [emitted]  app
index.html  180 bytes          [emitted]
chunk    {0} app.js (app) 233 kB [entry] [rendered]
...
webpack: bundle is now VALID.
```

The output means that the development server is running. If you open *http://localhost:8080/* at your browser, you should see something familiar.

![Hello world](images/hello_01.png)

If you try modifying the code, you should see output at your terminal. The browser should also perform a hard refresh on change.

T> WDS will try to run in another port in case the default one is being used. Keep an eye on the terminal output to figure out where it ends up running. You can debug the situation with a command like `netstat -na | grep 8080`. If there's something running in the port 8080, it should display a message. The exact command may depend on the platform.

## Verifying that `--env` Works

Webpack configuration receives the result of `--env` if it exposes a function. To verify that the correct environment is passed, adjust the configuration as follows:

**webpack.config.js**

```javascript
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const PATHS = {
  app: path.join(__dirname, 'app'),
  build: path.join(__dirname, 'build'),
};

leanpub-start-delete
module.exports = {
leanpub-end-delete
leanpub-start-insert
const common = {
leanpub-end-insert
  // Entry accepts a path or an object of entries.
  // We'll be using the latter form given it's
  // convenient with more complex configurations.
  //
  // Entries have to resolve to files! It relies on Node.js
  // convention by default so if a directory contains *index.js*,
  // it will resolve to that.
  entry: {
    app: PATHS.app,
  },
  output: {
    path: PATHS.build,
    filename: '[name].js',
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Webpack demo',
    }),
  ],
};

leanpub-start-insert
module.exports = function(env) {
  console.log('env', env);

  return common;
};
leanpub-end-insert
```

If you run the npm commands now, you should see a different terminal output depending on which one you trigger.

## Understanding `--env`

Even though `--env` allows us to pass strings to configuration, it can do a bit more. Consider the following example:

**package.json**

```json
...
"scripts": {
  "start": "webpack-dev-server --env development",
  "build": "webpack --env.target production"
}
...
```

Instead of a string, we should receive an object `{ target: 'production' }` at configuration now. We could pass more key-value pairs and they would go to the `env` object. It is important to note that if you set `--env foo` while setting `--env.target`, the string will override the object.

W> Webpack 2 changed argument behavior compared to webpack 1. You are not allowed to pass custom parameters through the CLI anymore. Instead, it's better to go through the `--env` mechanism if you need to do this.

## Accessing the Development Server from Network

It is possible to customize host and port settings through the environment in our setup (i.e., `export PORT=3000` on Unix or `SET PORT=3000` on Windows). This can be useful if you want to access your server using some other device within the same network. The default settings are enough on most platforms.

To access your server, you'll need to figure out the ip of your machine. On Unix, this can be achieved using `ifconfig | grep inet`. On Windows, `ipconfig` can be used. An npm package, such as [node-ip](https://www.npmjs.com/package/node-ip) may come in handy as well. Especially on Windows you may need to set your `HOST` to match your ip to make it accessible.

## Alternate Ways to Use *webpack-dev-server*

We could have passed the WDS options through terminal. I find it clearer to manage it within webpack configuration as that helps to keep *package.json* nice and tidy. It is also easier to understand what's going on as you don't need to dig out the answers from webpack source.

Alternately, we could have set up an Express server of our own and a middleware. There are a couple of options:

* [The official WDS middleware](https://webpack.js.org/guides/development/#webpack-dev-middleware)
* [webpack-hot-middleware](https://www.npmjs.com/package/webpack-hot-middleware)
* [webpack-universal-middleware](https://www.npmjs.com/package/webpack-universal-middleware)

There's also a [Node.js API](https://webpack.github.io/docs/webpack-dev-server.html#api) if you want more control and flexibility.

W> Note that there are [slight differences](https://github.com/webpack/webpack-dev-server/issues/106) between the CLI and the Node.js API. This is the reason why some prefer to solely use the Node.js API.

## Making It Faster to Develop Configuration

Restarting the development server each time you make a change tends to get boring after a while; therefore, it can be a good idea to let the computer do that for us. As [discussed in GitHub](https://github.com/webpack/webpack-dev-server/issues/440#issuecomment-205757892), a monitoring tool known as [nodemon](https://www.npmjs.com/package/nodemon) can be used for this purpose.

To get it to work, you will have to install it first through `npm i nodemon --save-dev`. After that, you can make it watch WDS and restart it on change. Here's the script if you want to give it a go:

**package.json**

```json
...
"scripts": {
  "start": "nodemon --watch webpack.config.js --exec \"webpack-dev-server --env development\"",
  "build": "webpack --env production"
},
...
```

It is possible WDS [will support the functionality](https://github.com/webpack/webpack/issues/3153) itself in the future. If you want to make it reload itself on change, you should implement a little work-around like this for now.

## Useful Development Plugins

As webpack plugin ecosystem is quite diverse, there are a lot of plugins that can help specifically with development. I've listed a few of these below to give you a better idea of what's available:

* [case-sensitive-paths-webpack-plugin](https://www.npmjs.com/package/case-sensitive-paths-webpack-plugin) has been designed to avoid issues with mixed path naming. A path that is valid on macOS might not be on Windows. If you work in a mixed environment, this plugin can be handy.
* [npm-install-webpack-plugin](https://www.npmjs.com/package/npm-install-webpack-plugin) allows webpack to install and wire the installed packages with your *package.json* as you import new packages to your project. It's almost magical this way.
* [system-bell-webpack-plugin](https://www.npmjs.com/package/system-bell-webpack-plugin) rings the system bell on failure instead of letting webpack fail silently.
* [friendly-errors-webpack-plugin](https://www.npmjs.com/package/friendly-errors-webpack-plugin) improves on error reporting of webpack. It captures common errors and displays them in a friendlier manner, hence the name.
* [nyan-progress-webpack-plugin](https://www.npmjs.com/package/nyan-progress-webpack-plugin) can be used to get tidier output during the build process. Take care with Continuous Integration (CI) systems like Travis, though, as they might clobber the output. Webpack provides `webpack.ProgressPlugin` for the same purpose. No nyan there, though.
* [webpack-dashboard](https://www.npmjs.com/package/webpack-dashboard) gives an entire terminal based dashboard over the standard webpack output. If you prefer clear visual output, this one will come in handy.

In addition to plugins like these, it can be worth your while to set up linting to enforce coding standards. The *Linting* chapter digs into that topic in greater detail.

## Conclusion

In this chapter, you learned to set up webpack to refresh your browser automatically. We can go a notch further and enable a feature known as Hot Module Replacement. We'll do that in the next chapter.
