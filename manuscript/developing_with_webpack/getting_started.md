# Getting Started

Make sure you are using a recent version of [Node.js](http://nodejs.org/) installed. Particularly older versions (e.g. 0.10) are problematic and require extra work, such as polyfilling `Promise` through `require('es6-promise').polyfill()`. This technique depends on the [es6-promise](https://www.npmjs.com/package/es6-promise) package. I recommend using at least the most recent LTS (Long-Term Support) version. Before going further, make sure you have `node` and `npm` commands available at your terminal.

T> It is possible to get a more controlled environment by using a solution such as [Vagrant](https://www.vagrantup.com/) or [nvm](https://www.npmjs.com/package/nvm). Especially Vagrant comes with a performance penalty as it relies on a virtual machine. Vagrant is particularly useful in a team environment, though, as it gives you a predictable environment to develop against.

T> The completed configuration is available at [GitHub](https://github.com/survivejs-demos/webpack-demo). If you are unsure of something, refer there.

## Setting Up the Project

To get a starting point, we should create a directory for our project and set up a *package.json* there. npm uses that to manage project dependencies. Here are the basic commands:

```bash
mkdir webpack-demo
cd webpack-demo
npm init -y # -y gives you default *package.json*, skip for more control
```

You can tweak the generated *package.json* manually to make further changes to it. We'll be doing some changes through *npm* tool, but manual tweaks are acceptable. The official documentation explains various [package.json options](https://docs.npmjs.com/files/package.json) in more detail.

T> You can set those `npm init` defaults at *~/.npmrc*.

## Installing Webpack

Even though Webpack can be installed globally (`npm i webpack -g`), I recommend maintaining it as a dependency of your project. This will avoid issues as then you will have control over the exact version you are running.

The approach works nicely in **Continuous Integration** (CI) setups as well. A CI system can install your local dependencies, compile your project using them, and then push the result to a server.

To add Webpack to our project, execute

```bash
npm i webpack --save-dev # or just -D if you want to save typing
```

You should see Webpack at your *package.json* `devDependencies` section after this. In addition to installing the package locally below the *node_modules* directory, npm also generates an entry for the executable.

## Executing Webpack

You can display the exact path of the executables using `npm bin`. Most likely it points at *./node_modules/.bin*. Try executing Webpack from there through terminal using `node_modules/.bin/webpack` or a similar command.

After executing, you should see a version, a link to the command line interface guide and a long list of options. We won't be using most of those, but it's good to know that this tool is packed with functionality, if nothing else.

```bash
webpack-demo $ node_modules/.bin/webpack
webpack 1.13.0
Usage: https://webpack.github.io/docs/cli.html

Options:
  --help, -h, -?
  --config
  --context
  --entry
...
  --display-cached-assets
  --display-reasons, --verbose, -v

Output filename not configured.
```

T> We can use `--save` and `--save-dev` to separate application and development dependencies. The former will install and write to *package.json* `dependencies` field whereas the latter will write to `devDependencies` instead.

## Directory Structure

As projects with just *package.json* are boring, we should set up something more concrete. To get started, we can implement a little web site that loads some JavaScript which we then build using Webpack. After we progress a bit, we'll end up with a directory structure like this:

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

We'll need to tell Webpack how to deal with the assets we just set up. For this purpose we'll develop a *webpack.config.js* file. Webpack and its development server will be able to discover this file through convention.

To keep things simple to maintain, we'll be using [html-webpack-plugin](https://www.npmjs.com/package/html-webpack-plugin) to generate an *index.html* for our application. *html-webpack-plugin* wires up the generated assets with it. Install it to the project:

```bash
npm i html-webpack-plugin --save-dev
```

To generate a bundle to our build directory and to set up the plugin we need configuration like this:

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

The `entry` path could be given as a relative one. The [context](https://webpack.github.io/docs/configuration.html#context) field can be used to configure that lookup. Given plenty of places expect absolute paths, I prefer to use absolute paths everywhere to avoid confusion.

If you execute `node_modules/.bin/webpack`, you should see output:

```bash
Hash: 2a7a7bccea1741de9447
Version: webpack 1.13.0
Time: 813ms
     Asset       Size  Chunks             Chunk Names
    app.js    1.69 kB       0  [emitted]  app
index.html  157 bytes          [emitted]
   [0] ./app/index.js 80 bytes {0} [built]
   [1] ./app/component.js 136 bytes {0} [built]
Child html-webpack-plugin for "index.html":
        + 3 hidden modules
```

This means you have a build at your output directory at *build/app.js*. You can examine the output through your editor to see what Webpack did there. To see the application running, open the `build/index.html` file directly through a browser. On OS X `open ./build/index.html` works.

T> Another way to serve the contents of the directory through a server, such as *serve* (`npm i serve -g`). In this case, execute `serve` at the output directory and head to `localhost:3000` at your browser. You can configure the port through the `--port` parameter.

T> I like to use `path.join`, but `path.resolve` would be a good alternative. See the [Node.js path API](https://nodejs.org/api/path.html) for further details.

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

You can execute these scripts through *npm run*. For instance, in this case we could use *npm run build*. As a result you should get build output as before.

This works because npm adds *node_modules/.bin* temporarily to the path. As a result, rather than having to write `"build": "node_modules/.bin/webpack"`, we can do just `"build": "webpack"`.

Task runners, such as Grunt or Gulp, allow you to achieve the same result while operating in a cross-platform manner. If you go through *package.json* like this, you may have to be more careful. On the plus side, this is a very light approach. To keep things simple, we'll be relying on it.

T> There are shortcuts like *npm start* and *npm test*. We can run these directly without *npm run* although that will work too.

T> You can execute *npm run* anywhere within the project. It doesn't have to be run in the project root in order to work.

W> Unless Webpack is installed to the project, this can point to a possible global install. That can be potentially confusing. Prefer local installs over global for this reason.

## Conclusion

Even though we've managed to set up a basic Webpack setup, it's not that great yet. Developing this way would be slow. That's where Webpack's more advanced features come in. To make room for these features, I will show you how to split your Webpack configuration in the next chapter.
