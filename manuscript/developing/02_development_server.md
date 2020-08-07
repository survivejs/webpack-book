# Development Server

When developing a frontend without any special tooling, you often end up having to refresh the browser to see changes. Given this gets annoying fast, there's tooling to remedy the problem.

The first tools in the market were [LiveReload](http://livereload.com/) and [Browsersync](http://www.browsersync.io/). The point of either is to allow refreshing the browser automatically as you develop. They also pick up CSS changes and apply the new style without a hard refresh that loses the state of the browser.

It's possible to setup Browsersync to work with webpack through [browser-sync-webpack-plugin](https://www.npmjs.com/package/browser-sync-webpack-plugin), but webpack has more tricks in store in the form of a `watch` mode, and a development server.

## Webpack `watch` mode

Webpack implements a `watch` mode that operates against the project files bundled by webpack. You can activate it by passing the `--watch` to webpack. Example: `npm run build -- --watch`. After this, any change made to a file captured by a webpack will trigger a rebuild.

Although this solves the problem of recompiling your source on change, it does nothing on the frontend side and browser updates. That's where further solutions are required.

## _webpack-plugin-serve_

[webpack-plugin-serve](https://www.npmjs.com/package/webpack-plugin-serve) is a third-party plugin that wraps the logic required to update the browser into a webpack plugin. Underneath it relies on webpack's watch mode, and it builds on top of that while implementing **Hot Module Replacement** (HMR) and other features seen in the official solution provided for webpack. There's also functionality that goes beyond the official development server, including support for webpack's multi-compiler mode (i.e., when you give an array of configurations to it) and a status overlay.

T> To learn mode about HMR, read the _Hot Module Replacement_ appendix. You can learn the fundamentals of the technique and why people use it. Applying it won't be necessary to complete the tutorial, though.

## _webpack-dev-server_

[webpack-dev-server](https://www.npmjs.com/package/webpack-dev-server) (WDS) is the officially maintained solution for webpack. WDS is a development server running **in-memory**, meaning the bundle contents aren't written out to files but stored in memory. The distinction is vital when trying to debug code and styles.

T> To integrate with another server, it's possible to emit files from WDS to the file system by setting `devServer.writeToDisk` property to `true`.

W> You should use WDS strictly for development. If you want to host your application, consider other standard solutions, such as Apache or Nginx.

## Getting started with WDS

To get started with WDS, install it first:

```bash
npm add webpack-dev-server -D
```

As before, this command generates a command below the `npm bin` directory, and you could run _webpack-dev-server_ from there. After running the WDS, you have a development server running at `http://localhost:8080`. Automatic browser refresh is in place now, although at a fundamental level.

{pagebreak}

## Attaching WDS to the project

To integrate WDS to the project, define an npm script for launching it. To follow npm conventions, call it as _start_ like below:

**package.json**

```json
"scripts": {
leanpub-start-insert
  "start": "webpack-dev-server --mode development",
leanpub-end-insert
  "build": "webpack --mode production"
},
```

T> WDS picks up configuration like webpack itself. The same rules apply.

If you execute either _npm run start_ or _npm start_ now, you should see something in the terminal:

```bash
> webpack-dev-server --mode development

...

ℹ ｢wds｣: Project is running at http://localhost:8080/
ℹ ｢wds｣: webpack output is served from /
ℹ ｢wds｣: Content not from webpack is served from /tmp/webpack-demo
ℹ ｢wdm｣: Hash: 2c24763e2dd29b2684e6
Version: webpack 4.43.0
Time: 289ms
Built at: 07/09/2020 12:37:16 PM
     Asset       Size  Chunks             Chunk Names
index.html  198 bytes          [emitted]
   main.js    362 KiB    main  [emitted]  main
Entrypoint main = main.js
...
```

{pagebreak}

The server is running, and if you open `http://localhost:8080/` at your browser, you should see something familiar:

![Hello world](images/hello_01.png)

If you try modifying the code, you should see the output in your terminal. The browser should also perform a hard refresh so that you can see the change.

T> WDS tries to run in another port in case the default one is being used. The terminal output tells you where it ends up running. You can debug the situation with a command like `netstat -na | grep 8080`. If something is running on the port 8080, it should display a message on Unix.

## Configuring WDS through webpack configuration

WDS functionality can be customized through the `devServer` field in the webpack configuration. You can set most of these options through the CLI as well, but managing them through webpack is a decent approach.

{pagebreak}

Enable additional functionality as below:

**webpack.config.js**

```javascript
...

module.exports = {
leanpub-start-insert
  devServer: {
    // Display only errors to reduce the amount of output.
    stats: "errors-only",

    // Parse host and port from env to allow customization.
    //
    // If you use Docker, Vagrant or Cloud9, set
    // host: "0.0.0.0";
    //
    // 0.0.0.0 is available to all network devices
    // unlike default `localhost`.
    host: process.env.HOST, // Defaults to `localhost`
    port: process.env.PORT, // Defaults to 8080
    open: true, // Open the page in browser
    overlay: true, // Show error overlay in browser
  },
leanpub-end-insert
  ...
};
```

After this change, you can configure the server host and port options through environment parameters (example: `PORT=3000 npm start`).

T> [dotenv](https://www.npmjs.com/package/dotenv) allows you to define environment variables through a _.env_ file. _dotenv_ allows you to control the host and port setting of the setup quickly.

T> Enable `devServer.historyApiFallback` if you are using HTML5 History API based routing.

T> If you want even better output, consider [error-overlay-webpack-plugin](https://www.npmjs.com/package/error-overlay-webpack-plugin) as it shows the origin of the error better.

W> Using `0.0.0.0` as `host` by itself is [considered a security issue](https://github.com/webpack/webpack-dev-server/issues/882). In that case you should set `disableHostCheck: true` in addition if you want to use the IP.

## Accessing WDS from the network

It's possible to customize host and port settings through the environment in the setup (i.e., `export PORT=3000` on Unix or `SET PORT=3000` on Windows). The default settings are enough on most platforms.

To access your server, you need to figure out the ip of your machine. On Unix, this can be achieved using `ifconfig | grep inet`. On Windows, `ipconfig` can be utilized. An npm package, such as [node-ip](https://www.npmjs.com/package/node-ip) come in handy as well. Especially on Windows, you need to set your `HOST` to match your ip to make it accessible.

{pagebreak}

## Making it faster to develop configuration

WDS will handle restarting the server when you change a bundled file. It's oblivious to changes made to webpack configuration, though, and you have to restart the WDS whenever a change occurs. The process can be automated as [discussed in GitHub](https://github.com/webpack/webpack-dev-server/issues/440#issuecomment-205757892) by using [nodemon](https://www.npmjs.com/package/nodemon) monitoring tool.

To get it to work, you have to install it first through `npm add nodemon -D`. Here's the script if you want to give it a go:

**package.json**

```json
"scripts": {
  "start": "nodemon --watch webpack.* --exec \"webpack-dev-server --mode development\"",
  "build": "webpack --mode production"
},
```

It's possible WDS [will support the functionality](https://github.com/webpack/webpack-cli/issues/15) itself in the future. If you want to make it reload itself on change, you should implement this workaround for now.

{pagebreak}

## Polling instead of watching files

It's possible the file watching setup provided by WDS won't work on your system. It can be problematic on older versions of Windows and Ubuntu.

Polling is almost mandatory when using Vagrant, Docker, or any other solution that doesn't forward events for changes on a file located in a folder shared with the virtualized machine where webpack is running. [vagrant-notify-forwarder](https://github.com/mhallin/vagrant-notify-forwarder) solves the problem for MacOS and Unix.

For any of these cases, enabling polling is a good option:

**webpack.config.js**

```javascript
const path = require("path");
const webpack = require("webpack");

module.exports = {
  devServer: {
    watchOptions: {
      // Delay the rebuild after the first change
      aggregateTimeout: 300,

      // Poll using interval (in ms, accepts boolean too)
      poll: 1000,
      // Ignore node_modules to decrease CPU usage
      ignored: /node_modules/,
    },
  },
};
```

The setup is more resource-intensive than the default, but it's worth trying out if the default setup doesn't work for you.

{pagebreak}

## Webpack middlewares for server integration

Given it's possible your frontend is tightly coupled with a backend, multiple server middlewares exist to make integration easier:

- [webpack-dev-middleware](https://www.npmjs.com/package/webpack-dev-middleware)
- [webpack-hot-middleware](https://www.npmjs.com/package/webpack-hot-middleware)
- [webpack-isomorphic-dev-middleware](https://www.npmjs.com/package/webpack-isomorphic-dev-middleware)
- [koa-webpack](https://www.npmjs.com/package/koa-webpack)

There's also a [Node API](https://webpack.js.org/configuration/dev-server/) if you want more control and flexibility.

## Watching files outside of webpack's module graph

It's possible your project depends indirectly on files, and webpack isn't aware of this. To alleviate the problem, I implemented a small plugin called [webpack-add-dependency-plugin](https://www.npmjs.com/package/webpack-add-dependency-plugin) that lets you handle the issue.

The situation can occur, for example, when you are using `MiniHtmlWebpackPlugin` and have customized its template logic to load external files.

## Other features of WDS

WDS provides functionality beyond what was covered above. There are a couple of relevant fields that you should be aware of:

- `devServer.contentBase` - Assuming you don't generate _index.html_ dynamically and prefer to maintain it yourself in a specific directory, you need to point WDS to it. `contentBase` accepts either a path (e.g., `"build"`) or an array of paths (e.g., `["build", "images"]`). The value defaults to the project root.
- `devServer.proxy` - If you are using multiple servers, you have to proxy WDS to them. The proxy setting accepts an object of proxy mappings (e.g., `{ "/api": "http://localhost:3000/api" }`) that resolve matching queries to another server. Proxy settings are disabled by default.
- `devServer.headers` - Attach custom headers to your requests here.

T> [The official documentation](https://webpack.js.org/configuration/dev-server/) covers more options.

{pagebreak}

## Development plugins

The webpack plugin ecosystem is diverse, and there are a lot of plugins that can help specifically with development:

- [case-sensitive-paths-webpack-plugin](https://www.npmjs.com/package/case-sensitive-paths-webpack-plugin) can be handy when you are developing on mixed environments. For example, Windows, Linux, and MacOS have different expectations when it comes to path naming.
- [npm-install-webpack-plugin](https://www.npmjs.com/package/npm-install-webpack-plugin) allows webpack to install and wire the installed packages with your _package.json_ as you import new ones to your project.
- [react-dev-utils](https://www.npmjs.com/package/react-dev-utils) contains webpack utilities developed for [Create React App](https://www.npmjs.com/package/create-react-app). Despite its name, they can find use beyond React. If you want only webpack message formatting, consider [webpack-format-messages](https://www.npmjs.com/package/webpack-format-messages).
- [webpack-notifier](https://www.npmjs.com/package/webpack-notifier) uses system notifications to let you know of webpack status.
- [sounds-webpack-plugin](https://www.npmjs.com/package/sounds-webpack-plugin) rings the system bell on failure instead of letting webpack fail silently.

## Conclusion

WDS complements webpack and makes it more friendly for developers by providing development-oriented functionality.

To recap:

- Webpack's `watch` mode is the first step towards a better development experience. You can have webpack compile bundles as you edit your source.
- WDS can refresh the browser on change. It also implements **Hot Module Replacement**.
- The default WDS setup can be problematic on specific systems. For this reason, more resource-intensive polling is an alternative.
- WDS can be integrated into an existing Node server using a middleware. Doing this gives you more control than relying on the command line interface.
- WDS does far more than refreshing and HMR. For example, proxying allows you to connect it to other servers.

In the next chapter, you learn to compose configuration so that it can be developed further later in the book.
