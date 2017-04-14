# Getting Started

Before getting started, make sure you are using a recent version of [Node](http://nodejs.org/). You should use at least the most current LTS (long-term support) version. The configuration of the book has been written with Node 6 features in mind. You should have `node` and `npm` commands available at your terminal. [Yarn](https://yarnpkg.com/) is a good alternative to npm and works for the tutorial as well.

It's possible to get a more controlled environment by using a solution such as [Docker](https://www.docker.com/), [Vagrant](https://www.vagrantup.com/) or [nvm](https://www.npmjs.com/package/nvm). Vagrant comes with a performance penalty as it relies on a virtual machine. Vagrant is valuable in a team: each developer can have the same environment that is usually close to production.

T> The completed configuration is available at [GitHub](https://github.com/survivejs-demos/webpack-demo).

W> If you are using an older version than Node 6, you have to adapt the code or process your webpack configuration through Babel as discussed in the *Loading JavaScript* chapter.

{pagebreak}

## Setting Up the Project

To get a starting point, you should create a directory for the project and set up a *package.json* there. npm uses that to manage project dependencies. Here are the basic commands:

```bash
mkdir webpack-demo
cd webpack-demo
npm init -y # -y generates *package.json*, skip for more control
```

You can tweak the generated *package.json* manually to make further changes to it even though a part of the operations modify the file automatically for you. The official documentation explains [package.json options](https://docs.npmjs.com/files/package.json) in more detail.

T> You can set those `npm init` defaults at *~/.npmrc*.

T> This is a good place to set up version control using [Git](https://git-scm.com/). You can create a commit per step and tag per chapter, so it's easier to move back and forth if you want.

## Installing Webpack

Even though webpack can be installed globally (`npm install webpack -g`), it's a good idea to maintain it as a dependency of your project to avoid issues, as then you have control over the exact version you are running. The approach works nicely in **Continuous Integration** (CI) setups as well. A CI system can install your local dependencies, compile your project using them, and then push the result to a server.

{pagebreak}

To add webpack to the project, execute:

```bash
npm install webpack --save-dev # -D if you want to save typing
```

You should see webpack at your *package.json* `devDependencies` section after this. In addition to installing the package locally below the *node_modules* directory, npm also generates an entry for the executable.

## Executing Webpack

You can display the exact path of the executables using `npm bin`. Most likely it points at *./node_modules/.bin*. Try running webpack from there through the terminal using `node_modules/.bin/webpack` or a similar command.

After running, you should see a version, a link to the command line interface guide and an extensive list of options. Most aren't used in this project, but it's good to know that this tool is packed with functionality if nothing else.

```bash
webpack-demo $ node_modules/.bin/webpack
No configuration file found and no output filename configured via CLI option.
A configuration file could be named 'webpack.config.js' in the current directory.
Use --help to display the CLI options.
```

To get a quick idea of webpack output, try this:

1. Set up *app/index.js* so that it contains `console.log('Hello world');`.
2. Execute `node_modules/.bin/webpack app/index.js build/index.js`.
3. Examine *build/index.js*. You should see webpack bootstrap code that begins executing the code. Below the bootstrap you should find something familiar.

T> You can use `--save` and `--save-dev` to separate application and development dependencies. The former installs and writes to *package.json* `dependencies` field whereas the latter writes to `devDependencies` instead.

## Directory Structure

To move further, you can implement a site that loads JavaScript, which you then build using webpack. After you progress a bit, you end up with a directory structure below:

* app/
  * index.js
  * component.js
* build/
* package.json
* webpack.config.js

The idea is that you transform *app/* to a bundle below *build/*. To make this possible, you should set up the assets needed and configure webpack through *webpack.config.js*.

## Setting Up Assets

As you never get tired of `Hello world`, you will model a variant of that. Set up a component:

**app/component.js**

```javascript
export default (text = 'Hello world') => {
  const element = document.createElement('div');

  element.innerHTML = text;

  return element;
};
```

{pagebreak}

Next, you are going to need an entry point for the application. It uses `require` against the component and renders it through the DOM:

**app/index.js**

```javascript
import component from './component';

document.body.appendChild(component());
```

## Setting Up Webpack Configuration

You need to tell webpack how to deal with the assets that were set up. For this purpose, you have to develop a *webpack.config.js* file. Webpack and its development server are able to discover this file through a convention.

To keep things convenient to maintain, you can use your first plugin: [html-webpack-plugin](https://www.npmjs.com/package/html-webpack-plugin). `HtmlWebpackPlugin` generates an *index.html* for the application and adds a `script` tag to load the generated bundle. Install it:

```bash
npm install html-webpack-plugin --save-dev
```

At a minimum, it's nice to have at least `entry` and `output` fields in your configuration. Often you see a lot more as you specify how webpack deals with different file types and how it resolves them.

Entries tell webpack where to start parsing the application. In multi-page applications, you have an entry per page. Or you could have a configuration per entry as discussed later in this chapter.

All output related paths you see in the configuration are resolved against the `output.path` field. If you had an output relation option somewhere and wrote `styles/[name].css`, that would be expanded so that you get `<output.path> + <specific path>`. Example: *~/webpack-demo/build/styles/main.css*.

{pagebreak}

To illustrate how to connect `entry` and `output` with `HtmlWebpackPlugin`, consider the code below:

**webpack.config.js**

```javascript
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const PATHS = {
  app: path.join(__dirname, 'app'),
  build: path.join(__dirname, 'build'),
};

module.exports = {
  // Entries have to resolve to files! They rely on Node
  // convention by default so if a directory contains *index.js*,
  // it resolves to that.
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
```

The `entry` path could be given as a relative one using the [context](https://webpack.js.org/configuration/entry-context/#context) field used to configure that lookup. However, given plenty of places expect absolute paths, preferring them over relative paths everywhere avoids confusion.

T> **Trailing commas** are used in the book examples on purpose as it gives cleaner diffs for the code examples. You'll learn to enforce this rule in the *Linting JavaScript* chapter.

T> `[name]` is a placeholder. Placeholders are discussed in detail in the *Adding Hashes to Filenames* chapter, but they are effectively tokens that will be replaced when the string is evaluated. In this case `[name]` will be replaced by the name of the entry - 'app'.

If you execute `node_modules/.bin/webpack`, you should see output:

```bash
Hash: 3f76ae042ff0f2d98f35
Version: webpack 2.2.1
Time: 376ms
     Asset       Size  Chunks             Chunk Names
    app.js    3.13 kB       0  [emitted]  app
index.html  180 bytes          [emitted]
   [0] ./app/component.js 148 bytes {0} [built]
   [1] ./app/index.js 78 bytes {0} [built]
Child html-webpack-plugin for "index.html":
       [0] ./~/lodash/lodash.js 540 kB {0} [built]
       [1] (webpack)/buildin/global.js 509 bytes {0} [built]
       [2] (webpack)/buildin/module.js 517 bytes {0} [built]
       [3] ./~/html-webpack-plugin/lib/loader.js!./~/html-webpack-plugin/default_index.ejs 540 bytes {0} [built]
```

The output tells a lot:

* `Hash: 3f76ae042ff0f2d98f35` - The hash of the build. You can use this to invalidate assets through `[hash]` placeholder. Hashing is discussed in detail in the *Adding Hashes to Filenames* chapter.
* `Version: webpack 2.2.1` - Webpack version.
* `Time: 377ms` - Time it took to execute the build.
* `app.js    3.13 kB       0  [emitted]  app` - Name of the generated asset, size, the IDs of the **chunks** into which it's related, status information telling how it was generated, the name of the chunk.
* `index.html  180 bytes          [emitted]` - Another generated asset that was emitted by the process.
* `[0] ./app/component.js 148 bytes {0} [built]` - The ID of the entry asset, name, size, entry chunk ID, the way it was generated.
* `Child html-webpack-plugin for "index.html":` - This is plugin-related output. In this case *html-webpack-plugin* is doing the output of its own.

Examine the output below `build/`. If you look closely, you can see the same IDs within the source. To see the application running, open the `build/index.html` file directly through a browser. On macOS `open ./build/index.html` works.

T> If you want webpack to stop execution on the first error, set `bail: true` option. Setting it kills the entire webpack process. The behavior is desirable if you are building in a CI environment.

T> In addition to a configuration object, webpack accepts an array of configurations. You can also return a `Promise` and eventually `resolve` to a configuration.

## Adding a Build Shortcut

Given executing `node_modules/.bin/webpack` is verbose, you should do something about it. This is where npm and *package.json* can be used for running tasks.

{pagebreak}

Adjust the file as follows:

**package.json**

```json
"scripts": {
  "build": "webpack"
},
```

Run `npm run build` to see the same output as before. This works because npm adds *node_modules/.bin* temporarily to the path. As a result, rather than having to write `"build": "node_modules/.bin/webpack"`, you can do `"build": "webpack"`.

You can execute this kind of scripts through *npm run* and you can use *npm run* anywhere within your project. If you run the command as is, it gives you the listing of available scripts.

T> There are shortcuts like *npm start* and *npm test*. You can run these directly without *npm run* although that works too. For those in a hurry, you can use *npm t* to run your tests.

## `HtmlWebpackPlugin` Extensions

Although you can replace `HtmlWebpackPlugin` template with your own, there are premade ones like [html-webpack-template](https://www.npmjs.com/package/html-webpack-template) or [html-webpack-template-pug](https://www.npmjs.com/package/html-webpack-template-pug).

There are also specific plugins that extend `HtmlWebpackPlugin`'s functionality:

* [favicons-webpack-plugin](https://www.npmjs.com/package/favicons-webpack-plugin) is able to generate favicons.
* [script-ext-html-webpack-plugin](https://www.npmjs.com/package/script-ext-html-webpack-plugin) gives you more control over script tags and allows you to tune script loading further.
* [multipage-webpack-plugin](https://www.npmjs.com/package/multipage-webpack-plugin) builds on top of *html-webpack-plugin* and makes it easier to manage multi-page configurations.
* [resource-hints-webpack-plugin](https://www.npmjs.com/package/resource-hints-webpack-plugin) adds [resource hints](https://www.w3.org/TR/resource-hints/) to your HTML files to speed up loading time.
* [preload-webpack-plugin](https://www.npmjs.com/package/preload-webpack-plugin) enables `rel=preload` capabilities for scripts. This helps with lazy loading and it combines well with techniques discussed in the *Building* part of this book.

## Conclusion

Even though you have managed to get webpack up and running, it does not do that much yet. Developing against it would be painful. Each time you wanted to check out the application, you would have to build it manually using `npm run build` and then refresh the browser. That's where webpack's more advanced features come in.

To recap:

* It's a good idea to use a locally installed version of webpack over a globally installed one. This way you can be sure of what version you are using. The local dependency works also in a Continuous Integration environment.
* Webpack provides a command line interface. You can use it even without configuration, but then you are limited by the options it provides.
* To write more complicated setups, you most likely have to write a separate *webpack.config.js* file.
* `HtmlWebpackPlugin` can be used to generate an HTML entry point to your application. Later in the book, you see how to generate multiple separate pages using. The *Multiple Pages* chapter covers that.
* It's handy to use npm *package.json* scripts to manage webpack. You can use it as a light task runner and use system features outside of webpack.

In the next chapter you will learn how to improve the developer experience by enabling automatic browser refresh.
