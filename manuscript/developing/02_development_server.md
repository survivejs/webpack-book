# Development Server

When developing a frontend without any special tooling, you often end up having to refresh the browser to see changes. Given this gets annoying fast, there's tooling to remedy the problem.

The first tools on the market were [LiveReload](http://livereload.com/) and [Browsersync](http://www.browsersync.io/). The point of either is to allow refreshing the browser automatically as you develop. They also pick up CSS changes and apply the new style without a hard refresh that loses the state of the browser.

It's possible to setup Browsersync to work with webpack through [browser-sync-webpack-plugin](https://www.npmjs.com/package/browser-sync-webpack-plugin), but webpack has more tricks in store in the form of a `watch` mode, and a development server.

## Webpack `watch` mode

Webpack's `watch` mode rebuilds the bundle on any change of the project files. It can be activated either by setting `watch` field `true` in webpack configuration or by passing the `--watch` to webpack-cli.

Although this solves the problem of recompiling your source on change, it does nothing on the frontend side and browser updates. That's where further solutions are required.

{pagebreak}

## **webpack-dev-server**

[webpack-dev-server](https://www.npmjs.com/package/webpack-dev-server) (WDS) is the officially maintained development server running **in-memory**, meaning the bundle contents aren't written out to files but stored in memory. The distinction is vital when trying to debug code and styles.

If you go with WDS, there are a couple of relevant fields that you should be aware of:

- `devServer.historyApiFallback` should be set if you rely on HTML5 History API based routing.
- `devServer.contentBase` - Assuming you don't generate `index.html` dynamically and prefer to maintain it yourself in a specific directory, you need to point WDS to it. `contentBase` accepts either a path (e.g., `"build"`) or an array of paths (e.g., `["build", "images"]`). The value defaults to the project root.
- `devServer.proxy` - If you are using multiple servers, you have to proxy WDS to them. The proxy setting accepts an object of proxy mappings (e.g., `{ "/api": "http://localhost:3000/api" }`) that resolve matching queries to another server. Proxying is disabled by default.
- `devServer.headers` - Attach custom headers to your requests here.

T> To integrate with another server, it's possible to emit files from WDS to the file system by setting `devServer.writeToDisk` property to `true`.

W> You should use WDS strictly for development. If you want to host your application, consider other solutions, such as Apache or Nginx.

W> WDS depends implicitly on **webpack-cli** in command line usage.

## **webpack-plugin-serve**

[webpack-plugin-serve](https://www.npmjs.com/package/webpack-plugin-serve) (WPS) is a third-party plugin that wraps the logic required to update the browser into a webpack plugin. Underneath it relies on webpack's watch mode, and it builds on top of that while implementing **Hot Module Replacement** (HMR) and other features seen in WDS.

WPS also supports webpack's multi-compiler mode (i.e., when you give an array of configurations to it) and a status overlay.

Given webpack's watch mode emits to the file system by default, WPS provides an option for [webpack-plugin-ramdisk](https://www.npmjs.com/package/webpack-plugin-ramdisk) to write to the RAM instead. Using the option improves performance while avoiding excessive writes to the file system.

### Getting started with **webpack-plugin-serve**

To get started with WPS, install it first:

```bash
npm add webpack-plugin-serve --develop
```

To integrate WPS to the project, define an npm script for launching it:

**package.json**

```json
{
  "scripts": {
leanpub-start-insert
    "start": "wp --mode development",
leanpub-end-insert
  }
}
```

{pagebreak}

In addition, WPS has to be connected to webpack configuration. In this case we'll run it in `liveReload` mode and refresh the browser on changes. We'll make it possible to change the port by passing an environmental variable, like `PORT=3000 npm start`:

**webpack.config.js**

```javascript
const { mode } = require("webpack-nano/argv");
const {
  MiniHtmlWebpackPlugin,
} = require("mini-html-webpack-plugin");
const { WebpackPluginServe } = require("webpack-plugin-serve");

module.exports = {
  watch: mode === "development",
  entry: ["./src", "webpack-plugin-serve/client"],
  mode,
  plugins: [
    new MiniHtmlWebpackPlugin({ context: { title: "Demo" } }),
    new WebpackPluginServe({
      port: parseInt(process.env.PORT, 10) || 8080,
      static: "./dist",
      liveReload: true,
      waitForBuild: true,
    }),
  ],
};
```

W> If you use Safari, you may have to set `host: "127.0.0.1",` for `WebpackPluginServe` for live reloading to work.

{pagebreak}

If you execute either _npm run start_ or _npm start_ now, you should see something similar to this in the terminal:

```bash
> wp --mode development

⬡ wps: Server Listening on: http://[::]:8080

⬡ webpack: asset main.js 73.1 KiB [emitted] (name: main)
  asset index.html 198 bytes [compared for emit]
  runtime modules 25.2 KiB 11 modules
  cacheable modules 25 KiB
    modules by path ./node_modules/webpack-plugin-serve/lib/client/ 23.7 KiB
...
    ./node_modules/webpack-plugin-serve/client.js 1.05 KiB [built] [code generated]
  0 (webpack 5.5.0) compiled successfully in 157 ms
```

The server is running, and if you open `http://localhost:8080/` at your browser, you should see a hello:

![Hello world](images/hello_01.png)

If you try modifying the code, you should see the output in your terminal. The browser should also perform a hard refresh so that you can see the change.

T> Enable the `historyFallback` flag if you are using HTML5 History API based routing.

## Accessing development server from the network

To access your development server from the network, you need to figure out the IP address of your machine. For example, using `ifconfig | grep inet` on Unix, or `ipconfig` on Windows. Then you need to set your `HOST` to match your IP like this: `HOST=<ip goes here> npm start`.

## Polling instead of watching files

Webpack's file watching may not work on certain systems, for example on older versions of Windows and Ubuntu.

Polling is almost mandatory when using Vagrant, Docker, or any other solution that doesn't forward events for changes on a file located in a folder shared with the virtualized machine where webpack is running. [vagrant-notify-forwarder](https://github.com/mhallin/vagrant-notify-forwarder) solves the problem for macOS and Unix.

For any of these cases, polling is a good option:

**webpack.config.js**

```javascript
module.exports = {
  watchOptions: {
    aggregateTimeout: 300, // Delay the first rebuild (in ms)
    poll: 1000, // Poll using interval (in ms or a boolean)
    ignored: /node_modules/, // Ignore to decrease CPU usage
  },
};
```

The setup is more resource-intensive than the file watching, but it's worth trying out if the file watching doesn't work for you.

## Making it faster to develop webpack configuration

WPS will handle restarting the server when you change a bundled file. It's oblivious to changes made to webpack configuration, though, and you have to restart the WPS whenever you change something. The process can be automated as [discussed on GitHub](https://github.com/webpack/webpack-dev-server/issues/440#issuecomment-205757892) by using [nodemon](https://www.npmjs.com/package/nodemon) monitoring tool.

To get it to work, you have to install it first through `npm add nodemon --develop`, and then set up a script:

**package.json**

```json
{
  "scripts": {
leanpub-start-insert
    "watch": "nodemon --watch \"./webpack.*.*\" --exec \"npm start\"",
    "start": "wp --mode development"
leanpub-end-insert
  }
}
```

## Development plugins

The webpack ecosystem contains many development plugins:

- [case-sensitive-paths-webpack-plugin](https://www.npmjs.com/package/case-sensitive-paths-webpack-plugin) can be handy when you are developing on mixed environments. For example, Windows, Linux, and macOS have different expectations when it comes to path naming.
- [react-dev-utils](https://www.npmjs.com/package/react-dev-utils) contains webpack utilities developed for Create React App.
- [webpack-notifier](https://www.npmjs.com/package/webpack-notifier) uses system notifications to let you know of webpack status.

## Watching files outside of webpack's module graph

By default webpack only watches files that your project depends on directly, for example, when you are using **mini-html-webpack-plugin** and have customized it to load the template from a file. [webpack-add-dependency-plugin](https://www.npmjs.com/package/webpack-add-dependency-plugin) solves the problem.

## Conclusion

WPS and WDS complement webpack and make it more developer-friendly. To recap:

- Webpack's `watch` mode is the first step towards a better development experience. You can have webpack compile bundles as you edit your source.
- WPS and WDS refresh the browser on change. They also implement _Hot Module Replacement_.
- The default webpack watching setup can be problematic on specific systems, where more resource-intensive polling is an alternative.
- WDS can be integrated into an existing Node server using a middleware, giving you more control than relying on the command line interface.
- WPS and WDS do far more than refreshing and HMR. For example, proxying allows you to connect it to other servers.

In the next chapter, you'll learn to compose configuration so that it can be developed further later in the book.
