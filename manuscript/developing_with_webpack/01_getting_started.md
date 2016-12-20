# Getting Started

Before getting started, make sure you are using a recent version of [Node.js](http://nodejs.org/) installed. I recommend using at least the most recent LTS (Long-Term Support) version. Before going further, you should have `node` and `npm` commands available at your terminal.

The completed configuration is available at [GitHub](https://github.com/survivejs-demos/webpack-demo). If you are unsure of something, refer there.

T> It is possible to get a more controlled environment by using a solution such as [Vagrant](https://www.vagrantup.com/) or [nvm](https://www.npmjs.com/package/nvm). Especially Vagrant comes with a performance penalty as it relies on a virtual machine. Vagrant is particularly useful in a team environment, though, as it gives you a predictable environment to develop against.

W> Particularly older version of Node.js (e.g. 0.10) are problematic and require extra work, such as polyfilling `Promise` through `require('es6-promise').polyfill()`. This technique depends on the [es6-promise](https://www.npmjs.com/package/es6-promise) package.

## Setting Up the Project

To get a starting point, we should create a directory for our project and set up a *package.json* there. npm uses that to manage project dependencies. Here are the basic commands:

```bash
mkdir webpack-demo
cd webpack-demo
npm init -y # -y generates *package.json*, skip for more control
```

You can tweak the generated *package.json* manually to make further changes to it. We'll be doing some changes through *npm* tool, but manual tweaks are acceptable. The official documentation explains various [package.json options](https://docs.npmjs.com/files/package.json) in more detail.

T> You can set those `npm init` defaults at *~/.npmrc*.

T> This is a good place to set up version control using [Git](https://git-scm.com/). You can create a commit per step and tag per chapter so it's easier to move back and forth if you want.

## Installing Webpack

Even though webpack can be installed globally (`npm i webpack -g`), I recommend maintaining it as a dependency of your project. This will avoid issues as then you will have control over the exact version you are running.

The approach works nicely in **Continuous Integration** (CI) setups as well. A CI system can install your local dependencies, compile your project using them, and then push the result to a server.

To add webpack to our project, execute

```bash
npm i webpack@beta --save-dev # or just -D if you want to save typing
```

You should see webpack at your *package.json* `devDependencies` section after this. In addition to installing the package locally below the *node_modules* directory, npm also generates an entry for the executable.

W> We are using the most recent `beta` version of webpack 2 in this tutorial! You can drop that `@beta` part in the future. A lot of loaders and plugins may give peer dependency warnings as well.

## Executing Webpack

You can display the exact path of the executables using `npm bin`. Most likely it points at *./node_modules/.bin*. Try executing webpack from there through terminal using `node_modules/.bin/webpack` or a similar command.

After executing, you should see a version, a link to the command line interface guide and a long list of options. We won't be using most of those, but it's good to know that this tool is packed with functionality, if nothing else.

```bash
webpack-demo $ node_modules/.bin/webpack
No configuration file found and no output filename configured via CLI option.
A configuration file could be named 'webpack.config.js' in the current directory.
Use --help to display the CLI options.
```

T> We can use `--save` and `--save-dev` to separate application and development dependencies. The former will install and write to *package.json* `dependencies` field whereas the latter will write to `devDependencies` instead.

## Directory Structure

As projects with just *package.json* are boring, we should set up something more concrete. To get started, we can implement a little web site that loads some JavaScript which we then build using webpack. After we progress a bit, we'll end up with a directory structure like this:

- app/
  - index.js
  - component.js
- build/
- package.json
- webpack.config.js

The idea is that we'll transform that *app/* to as a bundle below *build/*. To make this possible, we should set up the assets needed and *webpack.config.js* of course.

## Setting Up Assets

As you never get tired of `Hello world`, we might as well model a variant of that. Set up a component like this:

**app/component.js**

```javascript
module.exports = function () {
  var element = document.createElement('h1');

  element.innerHTML = 'Hello world';

  return element;
};
```

Next, we are going to need an entry point for our application. It will simply `require` our component and render it through the DOM:

**app/index.js**

```javascript
var component = require('./component');

document.body.appendChild(component());
```

## Setting Up Webpack Configuration

We'll need to tell webpack how to deal with the assets we just set up. For this purpose we'll develop a *webpack.config.js* file. Webpack and its development server will be able to discover this file through convention.

To keep things simple to maintain, we'll be using [html-webpack-plugin](https://www.npmjs.com/package/html-webpack-plugin) to generate an *index.html* for our application. *html-webpack-plugin* wires up the generated assets with it. Install it in the project:

```bash
npm i html-webpack-plugin --save-dev
```

Here is the configuration to setup the plugin and generate a bundle in our build directory:

**webpack.config.js**

```javascript
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const PATHS = {
  app: path.join(__dirname, 'app'),
  build: path.join(__dirname, 'build')
};

module.exports = {
  // Entry accepts a path or an object of entries.
  // We'll be using the latter form given it's
  // convenient with more complex configurations.
  //
  // Entries have to resolve to files! It relies on Node.js
  // convention by default so if a directory contains *index.js*,
  // it will resolve to that.
  entry: {
    app: PATHS.app
  },
  output: {
    path: PATHS.build,
    filename: '[name].js'
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Webpack demo'
    })
  ]
};
```

The `entry` path could be given as a relative one. The [context](https://webpack.js.org/configuration/entry-context/#context) field can be used to configure that lookup. Given plenty of places expect absolute paths, I prefer to use absolute paths everywhere to avoid confusion and keep it simple.

T> I like to use `path.join`, but `path.resolve` would be a good alternative. See the [Node.js path API](https://nodejs.org/api/path.html) for further details.

If you execute `node_modules/.bin/webpack`, you should see output:

```bash
Hash: 57470680d11512534351
Version: webpack 2.2.0-rc.1
Time: 381ms
     Asset       Size  Chunks           Chunk Names
    app.js     2.8 kB  0[emitted]  app
index.html  180 bytes  [emitted]
   [0] ./app/component.js 136 bytes {0} [built]
   [1] ./app/index.js 80 bytes {0} [built]
Child html-webpack-plugin for "index.html":
        + 4 hidden modules
```

The output tells us a lot. I've annotated it below:

* `Hash: 57470680d11512534351` - The hash of the build. You can use this to invalidate assets through `[hash]` placeholder. We'll discuss hashing in detail at the *Adding Hashes to Filenames* chapter.
* `Version: webpack 2.2.0-rc.1` - Webpack version.
* `Time: 381ms` - Time it took to execute the build.
* `app.js     2.8 kB  0[emitted]  app` - Name of the generated asset, size, the ids of the **chunks** into which it is related, status information telling how it was generated, name of the chunk.
* `index.html  180 bytes  [emitted]` - Another generated asset that was emitted by the process.
* `[0] ./app/component.js 136 bytes {0} [built]` - The id of the generated asset, name, size, entry chunk id, the way it was generated.
* `Child html-webpack-plugin for "index.html":` - This is plugin related output. In this case *html-webpack-plugin* is doing output of its own.
* `+ 4 hidden modules` - This tells you that webpack is omitting some output, namely modules within `node_modules` and similar directories. You can run webpack using `webpack --display-modules` to display this information. See [Stack Overflow](https://stackoverflow.com/questions/28858176/what-does-webpack-mean-by-xx-hidden-modules) for an expanded explanation.

Examine the output below `build/`. If you look closely, you can see the same ids within the source. To see the application running, open the `build/index.html` file directly through a browser. On macOS `open ./build/index.html` works.

T> It can be convenient to use a tool like *serve* (`npm i serve -g`) to serve the build directory. In this case, execute `serve` at the output directory and head to `localhost:3000` at your browser. You can configure the port through the `--port` parameter.

T> [html-webpack-template](https://www.npmjs.com/package/html-webpack-template) or [html-webpack-template-pug](https://www.npmjs.com/package/html-webpack-template-pug) complement *html-webpack-plugin* and provide more powerful templates to use with it.

T> There are also specific plugins for the plugin and you can even generate favicons using [favicons-webpack-plugin](https://www.npmjs.com/package/favicons-webpack-plugin). [script-ext-html-webpack-plugin](https://www.npmjs.com/package/script-ext-html-webpack-plugin) gives you more control over script tags and allows you to tune script loading further. [html-webpack-cdn-plugin](https://www.npmjs.com/package/html-webpack-cdn-plugin) makes it easier to use popular open source CDNs with it.

## Adding a Build Shortcut

Given executing `node_modules/.bin/webpack` is a little verbose, we should do something about it. npm and *package.json* double as a task runner with some configuration. Adjust it as follows:

**package.json**

```json
...
"scripts": {
  "build": "webpack"
},
...
```

You can execute these scripts through *npm run*. If you run it as is, it will give you the listing of available scripts. In this case we can use just *npm run build*. As a result you should get the same output as before.

This works because npm adds *node_modules/.bin* temporarily to the path. As a result, rather than having to write `"build": "node_modules/.bin/webpack"`, we can do just `"build": "webpack"`.

T> There are shortcuts like *npm start* and *npm test*. We can run these directly without *npm run* although that will work too. For those in hurry, you can use *npm t* to run your tests.

T> It is possible to execute *npm run* anywhere within the project. It doesn't have to be run in the project root in order to work. npm will figure out the project root for you.

## Useful Plugins for Development

Given different systems treat paths differently, it can be handy to force path case sensitivity. [case-sensitive-paths-webpack-plugin](https://www.npmjs.com/package/case-sensitive-paths-webpack-plugin) has been designed for this purpose. Consider setting it up especially if you work in a mixed environment.

[npm-install-webpack-plugin](https://www.npmjs.com/package/npm-install-webpack-plugin) allows webpack to install and wire the installed packages with your *package.json* as you import new packages to your project. It's almost magical this way.

As sometimes your build can fail for some reason, it can be handy to hear it. This is where [system-bell-webpack-plugin](https://www.npmjs.com/package/system-bell-webpack-plugin) comes in. It rings the system bell on failure.

[webpack-dashboard](https://www.npmjs.com/package/webpack-dashboard) gives an entire terminal based dashboard over the standard webpack output. If you prefer clear visual output, this one will come in handy.

There are more small plugins like this. It can be worth your while to set up linting to enforce coding standards. The *Linting* chapter digs into that topic in greater detail.

## Conclusion

Even though we've managed to get webpack up and running, it's not that much yet. Developing against it would be painful. Each time we wanted to check out our application, we would have to build it manually using `npm run build` and then refresh the browser.

That's where webpack's more advanced features come in. To make room for these features, I will show you how to split your webpack configuration in the next chapter.
