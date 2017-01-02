# Automatic Browser Refresh

Tools, such as [LiveReload](http://livereload.com/) or [BrowserSync](http://www.browsersync.io/), allow us to refresh the browser as we develop our application and avoid refresh for CSS changes. It is possible to setup Browsersync to work with webpack through [browser-sync-webpack-plugin](https://www.npmjs.com/package/browser-sync-webpack-plugin), but webpack has more tricks in store.

## Webpack `watch` Mode and *webpack-dev-server*

A good first step towards a better development environment is to use webpack in its **watch** mode. You can activate it through `webpack --watch`. Once enabled, it will detect changes made to your files and recompiles automatically. A solution known as *webpack-dev-server* (WDS) builds on top of the watch mode and goes even further.

WDS is a development server running in-memory. It refreshes content automatically in the browser while you develop your application. It also supports an advanced webpack feature known as **Hot Module Replacement** (HMR), which provides a way to patch the browser state without a full refresh. This is particularly powerful with technology such as React.

HMR goes further than simply refreshing browser on change. WDS provides an interface that makes it possible to patch code on the fly. This means you will need to implement it for client-side code. It is trivial for something like CSS by definition (no state), but it's a harder problem with JavaScript frameworks and libraries. Often careful design is needed to allow this. When the feature works, it is beautiful, though.

W> An IDE feature known as **safe write** can wreak havoc with hot loading. Therefore it is advisable to turn it off when using a HMR based setup.

## Emitting Files from *webpack-dev-server*

Even though it's good that WDS operates in-memory by default, sometimes it can be good to emit files to the file system. This is particularly true if you are integrating with other server that expects to find the files. [webpack-disk-plugin](https://www.npmjs.com/package/webpack-disk-plugin), [write-file-webpack-plugin](https://www.npmjs.com/package/write-file-webpack-plugin), and more specifically [html-webpack-harddisk-plugin](https://www.npmjs.com/package/html-webpack-harddisk-plugin) can achieve this.

W> You should use *webpack-dev-server* strictly for development. If you want to host your application, consider other standard solutions, such as Apache or Nginx.

## Getting Started with *webpack-dev-server*

To get started with WDS, execute:

```bash
npm i webpack-dev-server@2.2.0-rc.0 --save-dev
```

As before, this command will generate a command below the `npm bin` directory. You could try running *webpack-dev-server* from there. The quickest way to enable automatic browser refresh for our project is to run `webpack-dev-server`. After that you have a development server running at `localhost:8080`.

## Attaching *webpack-dev-server* to the Project

To integrate WDS to our project, we can follow the same idea as in the previous chapter and define a new command to the `scripts` section of *package.json*:

**package.json**

```json
...
"scripts": {
leanpub-start-insert
  "start": "webpack-dev-server --env development",
leanpub-end-insert
  "build": "webpack --env production"
},
...
```

If you execute either *npm run start* or *npm start* now, you should see something like this at the terminal:

```bash
> webpack-dev-server --env development

Project is running at http://localhost:8080/
webpack output is served from /
Hash: 5901f1c1c0de0a563d85
Version: webpack 2.2.0-rc.3
Time: 731ms
     Asset       Size  Chunks             Chunk Names
    app.js     247 kB       0  [emitted]  app
index.html  180 bytes          [emitted]
chunk    {0} app.js (app) 233 kB [entry] [rendered]
...
webpack: bundle is now VALID.
```

The output means that the development server is running. If you open *http://localhost:8080/* at your browser, you should see something familiar.

![Hello world](images/hello_01.png)

If you try modifying the code, you should see output at your terminal. The problem is that the browser doesn't catch these changes without a hard refresh. That's something we need to resolve next through configuration.

T> WDS will try to run in another port in case the default one is being used. So keep an eye on the terminal output to figure out where it ends up running. You can debug the situation with a command like `netstat -na | grep 8080`. If there's something running in the port 8080, it should display a message. The exact command may depend on the platform.

## Making Module Ids More Debuggable

When webpack generates a bundle, it needs to tell different modules apart. By default it uses numbers for this purpose. The problem is that this makes it difficult to debug the code if you have to inspect the resulting code. It can also lead to issues with hashing behavior.

To overcome this problem it is a good idea to use an alternative module id scheme. As it happens, webpack provides a plugin that's ideal for debugging. This plugin, `NamedModulesPlugin`, emits module paths over numeric ids. This information is useful for development.

You can enable this better behavior as follows:

**webpack.config.js**

```javascript
const path = require('path');
leanpub-start-insert
const webpack = require('webpack');
leanpub-end-insert
const HtmlWebpackPlugin = require('html-webpack-plugin');
const merge = require('webpack-merge');

const PATHS = {
  app: path.join(__dirname, 'app'),
  build: path.join(__dirname, 'build')
};

module.exports = function(env) {
leanpub-start-delete
  return merge(common);
leanpub-end-delete
leanpub-start-insert
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
    }
  );
leanpub-end-insert
};
```

If you make your code crash somehow and examine the resulting code, you should see familiar paths in the output. Even though a small change, enabling this behavior is useful for development.

We will perform a similar trick for production usage later on in this book in the *Adding Hashes to Filenames* chapter.

## Accessing the Development Server from Network

It is possible to customize host and port settings through the environment in our setup (i.e., `export PORT=3000` on Unix or `SET PORT=3000` on Windows). This can be useful if you want to access your server using some other device within the same network. The default settings are enough on most platforms.

To access your server, you'll need to figure out the ip of your machine. On Unix this can be achieved using `ifconfig | grep inet`. On Windows `ipconfig` can be used. An npm package, such as [node-ip](https://www.npmjs.com/package/node-ip) may come in handy as well. Especially on Windows you may need to set your `HOST` to match your ip to make it accessible.

## Alternative Ways to Use *webpack-dev-server*

We could have passed the WDS options through terminal. I find it clearer to manage it within webpack configuration as that helps to keep *package.json* nice and tidy. It is also easier to understand what's going on as you don't need to dig the answers from webpack source.

Alternatively, we could have set up an Express server of our own and used WDS as a [middleware](https://webpack.js.org/guides/development/#webpack-dev-middleware). There's also a [Node.js API](https://webpack.github.io/docs/webpack-dev-server.html#api). This is a good approach if you want control and flexibility.

T> [dotenv](https://www.npmjs.com/package/dotenv) allows you to define environment variables through a *.env* file. This can be somewhat convenient during development!

W> Note that there are [slight differences](https://github.com/webpack/webpack-dev-server/issues/106) between the CLI and the Node.js API. This is the reason why some prefer to solely use the Node.js API.

## Making It Faster to Develop Configuration

Given restarting the development server each time you make a change tends to get boring after a while, it can be a good idea to let the computer do that for us. As [discussed in GitHub](https://github.com/webpack/webpack-dev-server/issues/440#issuecomment-205757892), a monitoring tool known as [nodemon](https://www.npmjs.com/package/nodemon) can be used for this purpose.

To get it to work, you will have to install it first through `npm i nodemon --save-dev`. After that you can make it watch WDS and restart it on change. Here's the script if you want to give it a go:

**package.json**

```json
...
"scripts": {
  "start": "nodemon --watch webpack.config.js --exec \"webpack-dev-server --env development\"",
  ...
},
...
```

It is possible WDS [will support the functionality](https://github.com/webpack/webpack/issues/3153) itself in the future. If you want to make it reload itself on change, you will have to implement a little work-around like this for now.

## Conclusion

In this chapter you learned to set up webpack to refresh your browser automatically. We can go a notch further and enable a feature known as Hot Module Replacement. We'll do that in the next chapter.
