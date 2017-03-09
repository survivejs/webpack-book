# Automatic Browser Refresh

Tools, such as [LiveReload](http://livereload.com/) or [Browsersync](http://www.browsersync.io/), allow us to refresh the browser as you develop the application and avoid refresh for CSS changes. It is possible to setup Browsersync to work with webpack through [browser-sync-webpack-plugin](https://www.npmjs.com/package/browser-sync-webpack-plugin), but webpack has more tricks in store.

## Webpack `watch` Mode and *webpack-dev-server*

A good first step towards a better development environment is to use webpack in its **watch** mode. You can activate it through `webpack --watch`. Once enabled, it will detect changes made to your files and recompile automatically. *webpack-dev-server* (WDS) builds on top of the watch mode and goes even further.

WDS is a development server running **in-memory**. It refreshes content automatically in the browser while you develop your application. It also supports an advanced webpack feature, **Hot Module Replacement** (HMR). HMR allows patching the browser state without a full refresh making it handy with libraries like React.

HMR goes further than refreshing browser on change. WDS provides an interface that makes it possible to patch code on the fly. For this to work, you have to implement it for the client-side code. It is trivial for something like CSS by definition (no state), but it’s a harder problem with JavaScript frameworks and libraries. Often careful design is needed to allow this. When the feature works, it is beautiful.

## Emitting Files from *webpack-dev-server*

Even though it’s good that WDS operates in-memory by default, sometimes it can be good to emit files to the file system. If you are integrating with another server that expects to find the files, this applies in particular. [webpack-disk-plugin](https://www.npmjs.com/package/webpack-disk-plugin), [write-file-webpack-plugin](https://www.npmjs.com/package/write-file-webpack-plugin), and more specifically [html-webpack-harddisk-plugin](https://www.npmjs.com/package/html-webpack-harddisk-plugin) can achieve this.

W> You should use *webpack-dev-server* strictly for development. If you want to host your application, consider other standard solutions, such as Apache or Nginx.

## Getting Started with *webpack-dev-server*

To get started with WDS, execute:

```bash
npm install webpack-dev-server --save-dev
```

As before, this command will generate a command below the `npm bin` directory. You could try running *webpack-dev-server* from there. After running the WDS, you have a development server running at `http://localhost:8080`. Automatic browser refresh is in place now, although at a rough level.

W> If you are using an IDE, consider enabling **save write** from its settings. This way WDS will be able to detect changes made to the files correctly.

## Attaching *webpack-dev-server* to the Project

To integrate WDS to our project, you should define an npm script for it. To follow npm conventions, you can call it as *start*. To tell our targets apart, you should pass information about the environment to webpack configuration. This will allow us to specialize the configuration as needed:

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

If you execute either *npm run start* or *npm start* now, you should see something like this in the terminal:

```bash
> webpack-dev-server --env development

Project is running at http://localhost:8080/
webpack output is served from /
Hash: c1b0a0508a91f4b1ac74
Version: webpack 2.2.1
Time: 757ms
     Asset       Size  Chunks                    Chunk Names
    app.js     314 kB       0  [emitted]  [big]  app
index.html  180 bytes          [emitted]
chunk    {0} app.js (app) 300 kB [entry] [rendered]
...
webpack: bundle is now VALID.
```

The output means that the development server is running. If you open `http://localhost:8080/` at your browser, you should see something familiar:

![Hello world](images/hello_01.png)

If you try modifying the code, you should see output in your terminal. The browser should also perform a hard refresh on change.

T> WDS will try to run in another port in case the default one is being used. See the terminal output to figure out where it ends up running. You can debug the situation with a command like `netstat -na | grep 8080`. If something is running on the port 8080, it should display a message. The exact command may depend on the platform.

T> If you want to open a browser tab directly after running the server, set `devServer.open: true`. You can also achieve the same result through the CLI by using `webpack-dev-server --open`.

## Verifying that `--env` Works

Webpack configuration receives the result of `--env` if it exposes a function. To check that the correct environment is passed, adjust the configuration as follows:

**webpack.config.js**

```javascript
...

leanpub-start-delete
module.exports = {
  // Entry accepts a path or an object of entries.
  // We'll be using the latter form given it's
  // convenient with more complex configurations.
  //
  // Entries have to resolve to files! It relies on Node.js
  // convention by default so if a directory contains *index.js*,
  // it will resolve to that.
leanpub-end-delete
leanpub-start-insert
const commonConfig = {
leanpub-end-insert
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

  return commonConfig;
};
leanpub-end-insert
```

If you run the npm commands now, you should see a different terminal output depending on which one you trigger:

```bash
> webpack-dev-server --env development
env development
...
```

## Understanding `--env`

Even though `--env` allows us to pass strings to the configuration, it can do a bit more. Consider the following example:

**package.json**

```json
...
"scripts": {
  "start": "webpack-dev-server --env development",
  "build": "webpack --env.target production"
},
...
```

Instead of a string, you should receive an object `{ target: 'production' }` at configuration now. You could pass more key-value pairs, and they would go to the `env` object. It is important to note that if you set `--env foo` while setting `--env.target`, the string will override the object.

W> Webpack 2 changed argument behavior compared to webpack 1. You are not allowed to pass custom parameters through the CLI anymore. Instead, it’s better to go through the `--env` mechanism if you need to do this.

## Accessing the Development Server from Network

It is possible to customize host and port settings through the environment in our setup (i.e., `export PORT=3000` on Unix or `SET PORT=3000` on Windows). The default settings are enough on most platforms.

To access your server, you’ll need to figure out the ip of your machine. On Unix, this can be achieved using `ifconfig | grep inet`. On Windows, `ipconfig` can be utilized. An npm package, such as [node-ip](https://www.npmjs.com/package/node-ip) may come in handy as well. Especially on Windows, you may need to set your `HOST` to match your ip to make it accessible.

## Alternate Ways to Use *webpack-dev-server*

You could have passed the WDS options through a terminal. I find it clearer to manage it within webpack configuration as that helps to keep *package.json* nice and tidy. It is also easier to understand what’s going on as you don’t need to dig out the answers from the webpack source.

Alternately, you could have set up an Express server of our own and use a middleware. There are a couple of options:

* [The official WDS middleware](https://webpack.js.org/guides/development/#webpack-dev-middleware)
* [webpack-hot-middleware](https://www.npmjs.com/package/webpack-hot-middleware)
* [webpack-universal-middleware](https://www.npmjs.com/package/webpack-universal-middleware)

There’s also a [Node.js API](https://webpack.js.org/configuration/dev-server/) if you want more control and flexibility.

W> Note that there are [slight differences](https://github.com/webpack/webpack-dev-server/issues/106) between the CLI and the Node API.

## Making It Faster to Develop Configuration

Restarting the development server each time you make a change tends to get boring after a while; therefore, it can be a good idea to let the computer do that for us. As [discussed in GitHub](https://github.com/webpack/webpack-dev-server/issues/440#issuecomment-205757892), [nodemon](https://www.npmjs.com/package/nodemon) monitoring tool can be used for this purpose.

To get it to work, you will have to install it first through `npm install nodemon --save-dev`. After that, you can make it watch webpack config and restart WDS on change. Here’s the script if you want to give it a go:

**package.json**

```json
...
"scripts": {
  "start": "nodemon --watch webpack.config.js --exec \"webpack-dev-server --env development\"",
  "build": "webpack --env production"
},
...
```

It is possible WDS [will support the functionality](https://github.com/webpack/webpack/issues/3153) itself in the future. If you want to make it reload itself on change, you should implement a little workaround like this for now.

## Development Plugins

As webpack plugin ecosystem is diverse, there are a lot of plugins that can help specifically with development. I’ve listed certain of these below to give you a better idea of what’s available:

* [case-sensitive-paths-webpack-plugin](https://www.npmjs.com/package/case-sensitive-paths-webpack-plugin) can be handy when you are developing on a case-insensitive environments like macOS or Windows but using case-sensitive environment like Linux for production.
* [npm-install-webpack-plugin](https://www.npmjs.com/package/npm-install-webpack-plugin) allows webpack to install and wire the installed packages with your *package.json* as you import new packages to your project. It’s almost magical this way.
* [system-bell-webpack-plugin](https://www.npmjs.com/package/system-bell-webpack-plugin) rings the system bell on failure instead of letting webpack fail silently.
* [friendly-errors-webpack-plugin](https://www.npmjs.com/package/friendly-errors-webpack-plugin) improves on error reporting of webpack. It captures common errors and displays them in a friendlier manner, hence the name.
* [nyan-progress-webpack-plugin](https://www.npmjs.com/package/nyan-progress-webpack-plugin) can be used to get tidier output during the build process. Take care if you are using Continuous Integration (CI) systems like Travis, though, as they can clobber the output. Webpack provides `ProgressPlugin` for the same purpose. No nyan there, though.
* [react-dev-utils](https://www.npmjs.com/package/react-dev-utils) contains webpack utilities developed for [Create React App](https://www.npmjs.com/package/create-react-app). Despite its name, they can find use beyond React.
* [webpack-dashboard](https://www.npmjs.com/package/webpack-dashboard) gives an entire terminal based dashboard over the standard webpack output. If you prefer clear visual output, this one will come in handy.

In addition to plugins like these, it can be worth your while to set up linting to enforce coding standards. The *Linting JavaScript* chapter digs into that topic in detail.

## Conclusion

To recap:

* Webpack’s `watch` mode is the first step towards a better development experience. You can have webpack compile bundles as you edit your source.
* Webpack’s `--env` parameter allows you to control configuration target through terminal. You receive the passed `env` through a function interface.
* webpack-dev-server can refresh the browser on change. It also implements Hot Module Replacement.
* webpack-dev-server can be integrated to an existing Node server using a middleware. This gives you more control than relying on the command line interface.

In this chapter, you learned to set up webpack to refresh your browser automatically. You can go a notch further and enable Hot Module Replacement.
