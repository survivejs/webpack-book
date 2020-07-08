# Getting Started

Before getting started, make sure you are using a recent version of [Node](http://nodejs.org/). You should use at least the most current LTS (long-term support) version. The configuration of the book has been written with the LTS Node features in mind. You should have `node` and `npm` commands available at your terminal. [Yarn](https://yarnpkg.com/) is a good alternative to npm and works for the tutorial as well.

It's possible to get a more controlled environment by using a solution such as [Docker](https://www.docker.com/), [Vagrant](https://www.vagrantup.com/) or [nvm](https://www.npmjs.com/package/nvm). Vagrant comes with a performance penalty as it relies on a virtual machine. Vagrant is valuable in a team: each developer can have the same environment that is usually close to production.

T> The completed configuration is available at [GitHub](https://github.com/survivejs-demos/webpack-demo).

{pagebreak}

## Setting Up the Project

To get a starting point, you should create a directory for the project and set up a _package.json_ there. npm uses that to manage project dependencies. Here are the basic commands:

```bash
mkdir webpack-demo
cd webpack-demo
npm init -y # -y generates *package.json*, skip for more control
```

You can tweak the generated _package.json_ manually to make further changes to it even though a part of the operations modify the file automatically for you. The official documentation explains [package.json options](https://docs.npmjs.com/files/package.json) in more detail.

T> You can set those `npm init` defaults at _~/.npmrc_.

T> This is an excellent chance to set up version control using [Git](https://git-scm.com/). You can create a commit per step and tag per chapter, so it's easier to move back and forth if you want.

T> The book examples have been formatted using [Prettier](https://www.npmjs.com/package/prettier) with `"trailingComma": "es5",` and `"printWidth": 68` options enabled to make the diffs clean and fit the page.

## Installing Webpack

- TODO: Mention webpack-nano as an option

Even though webpack can be installed globally (`npm add webpack -g`), it's a good idea to maintain it as a dependency of your project to avoid issues, as then you have control over the exact version you are running. The approach works nicely in **Continuous Integration** (CI) setups as well. A CI system can install your local dependencies, compile your project using them, and then push the result to a server.

To add webpack to the project, execute:

```bash
npm add webpack webpack-cli -D # -D === --save-dev
```

You should see webpack at your _package.json_ `devDependencies` section after this. In addition to installing the package locally below the _node_modules_ directory, npm also generates an entry for the executable.

T> You can use `--save` and `--save-dev` (`-D`) to separate application and development dependencies. The former installs and writes to _package.json_ `dependencies` field whereas the latter writes to `devDependencies` instead.

T> [webpack-cli](https://www.npmjs.com/package/webpack-cli) comes with additional functionality including `init` and `migrate` commands that allow you to create new webpack configuration fast and update from an older version to a newer one.

## Executing Webpack

You can display the exact path of the executables using `npm bin`. Most likely it points at _./node_modules/.bin_. Try running webpack from there through the terminal using `node_modules/.bin/webpack` or a similar command.

After running, you should see a version, a link to the command line interface guide and an extensive list of options. Most aren't used in this project, but it's good to know that this tool is packed with functionality if nothing else.

```bash
$ node_modules/.bin/webpack

Insufficient number of arguments or no entry found.
Alternatively, run 'webpack(-cli) --help' for usage info.

Hash: 825466854a76efce42e4
Version: webpack 4.32.2
Time: 45ms
Built at: 05/28/2019 2:34:56 PM

WARNING in configuration
The 'mode' option has not been set, webpack will fallback to 'production' for this value. Set 'mode' option to 'development' or 'production' to enable defaults for each environment.
You can also set it to 'none' to disable any default behavior. Learn more: https://webpack.js.org/configuration/mode/

ERROR in Entry module not found: Error: Can't resolve './src' in '/Users/juhovepsalainen/Projects/tmp/webpack-demo'
```

The output tells that webpack cannot find the source to compile. It's also missing a `mode` parameter to apply development or production specific defaults.

To get a quick idea of webpack output, we should fix both:

1. Set up _src/index.js_ so that it contains `console.log("Hello world");`.
2. Execute `node_modules/.bin/webpack --mode development`. Webpack will discover the source file by Node convention.
3. Examine _dist/main.js_. You should see webpack bootstrap code that begins executing the code. Below the bootstrap, you should find something familiar.

T> Try also `--mode production` and compare the output.

{pagebreak}

## Setting Up Assets

To make the build more involved, we can add another module to the project and start developing a small application:

**src/component.js**

```javascript
export default (text = "Hello world") => {
  const element = document.createElement("div");

  element.innerHTML = text;

  return element;
};
```

We also have to modify the original file to import the new file and render the application through the DOM:

**src/index.js**

```javascript
import component from "./component";

document.body.appendChild(component());
```

Examine the output after building (`node_modules/.bin/webpack --mode development`). You should see both modules in the bundle that webpack wrote to the `dist` directory.

To make the output clearer to examine, pass `--devtool false` parameter to webpack. Webpack will generate `eval` based source maps by default and doing this will disable the behavior. See the _Source Maps_ chapter for more information. Another option would be to run webpack without a mode using `--mode none`.

One problem remains, though. How can we test the application in the browser?

## Configuring _mini-html-webpack-plugin_

The problem can be solved by writing an _index.html_ file that points to the generated file. Instead of doing that on our own, we can use a plugin and webpack configuration to do this.

To get started, install _mini-html-webpack-plugin_:

```bash
npm add mini-html-webpack-plugin -D
```

To connect the plugin with webpack, set up configuration as below:

**webpack.config.js**

```javascript
const { MiniHtmlWebpackPlugin } = require("mini-html-webpack-plugin");

module.exports = {
  plugins: [
    new MiniHtmlWebpackPlugin({
      context: {
        title: "Webpack demo",
      },
    }),
  ],
};
```

Now that the configuration is done, you should try the following:

1. Build the project using `node_modules/.bin/webpack --mode production`. You can try the `development` mode too.
2. Enter the build directory using `cd dist`.
3. Run the server using `serve` (`npm add serve -g` or `npx serve`) or a similar command you are familiar with.
4. Examine the result through a web browser. You should see something familiar there.

![Hello world](images/hello_01.png)

T> **Trailing commas** are used in the book examples on purpose as it gives cleaner diffs for the code examples.

T> To override default _index.html_, pass `filename` in the plugin options. You can also override the default `template` by passing a function (`context => ... markup ...`) to it.

## Examining the Output

If you execute `node_modules/.bin/webpack --mode production`, you should see output:

```bash
Hash: b2fc68c7429b699aceb7
Version: webpack 4.32.2
Time: 313ms
Built at: 05/28/2019 2:39:52 PM
     Asset       Size  Chunks             Chunk Names
index.html  199 bytes          [emitted]
   main.js   1.04 KiB       0  [emitted]  main
Entrypoint main = main.js
[0] ./src/index.js + 1 modules 219 bytes {0} [built]
    | ./src/index.js 77 bytes [built]
    | ./src/component.js 142 bytes [built]
```

The output tells a lot:

- `Hash: b2fc68c7429b699aceb7` - The hash of the build. You can use this to invalidate assets through `[hash]` placeholder. Hashing is discussed in detail in the _Adding Hashes to Filenames_ chapter.
- `Version: webpack 4.32.2` - Webpack version.
- `Time: 313ms` - Time it took to execute the build.
- `index.html 199 bytes [emitted]` - Another generated asset that was emitted by the process.
- `main.js 1.04 KiB 0 [emitted] main` - Name of the generated asset, size, the IDs of the **chunks** into which it's related, status information telling how it was generated, the name of the chunk.
- `[0] ./src/index.js + 1 modules 219 bytes {0} [built]` - The ID of the entry asset, name, size, entry chunk ID, the way it was generated.

Examine the output below the `dist/` directory. If you look closely, you can see the same IDs within the source.

T> In addition to a configuration object, webpack accepts an array of configurations. You can also return a `Promise` and eventually `resolve` to a configuration for example. Latter is useful if you are fetching configuration related data from a third party source.

{pagebreak}

## Adding a Build Shortcut

Given executing `node_modules/.bin/webpack` is verbose, you should do something about it. Adjust _package.json_ to run tasks as below:

**package.json**

```json
"scripts": {
  "build": "webpack --mode production"
},
```

Run `npm run build` to see the same output as before. npm adds _node_modules/.bin_ temporarily to the path enabling this. As a result, rather than having to write `"build": "node_modules/.bin/webpack"`, you can do `"build": "webpack"`.

You can execute this kind of scripts through _npm run_ and you can use _npm run_ anywhere within your project. If you run the command as is, it gives you the listing of available scripts.

T> There are shortcuts like _npm start_ and _npm test_. You can run these directly without _npm run_ although that works too. For those in a hurry, you can use _npm t_ to run your tests.

T> To go one step further, set up system level aliases using the `alias` command in your terminal configuration. You could map `nrb` to `npm run build` for instance.

{pagebreak}

## `HtmlWebpackPlugin` and Its Extensions

TODO: https://github.com/trevorblades/emoji-favicon/tree/master/packages/emoji-favicon-webpack-plugin

Although _mini-html-webpack-plugin_ is enough for basic use cases, there can be times when you need more functionality. That's where [html-webpack-plugin](https://www.npmjs.com/package/html-webpack-plugin) and its extensions come in:

- [html-webpack-template](https://www.npmjs.com/package/html-webpack-template) goes beyond the default template of _html-webpack-plugin_.
- [favicons-webpack-plugin](https://www.npmjs.com/package/favicons-webpack-plugin) is able to generate favicons.
- [script-ext-html-webpack-plugin](https://www.npmjs.com/package/script-ext-html-webpack-plugin) gives you more control over script tags and allows you to tune script loading further.
- [style-ext-html-webpack-plugin](https://www.npmjs.com/package/style-ext-html-webpack-plugin) converts CSS references to inlined CSS. The technique can be used to serve critical CSS to the client fast as a part of the initial payload.
- [resource-hints-webpack-plugin](https://www.npmjs.com/package/resource-hints-webpack-plugin) adds [resource hints](https://www.w3.org/TR/resource-hints/) to your HTML files to speed up loading time.
- [preload-webpack-plugin](https://www.npmjs.com/package/preload-webpack-plugin) enables `rel=preload` capabilities for scripts and helps with lazy loading, and it combines well with techniques discussed in the _Building_ part of this book.
- [webpack-cdn-plugin](https://www.npmjs.com/package/webpack-cdn-plugin) allows you to specify which dependencies to load through a Content Delivery Network (CDN). This common technique is used for speeding up loading of popular libraries.
- [dynamic-cdn-webpack-plugin](https://www.npmjs.com/package/dynamic-cdn-webpack-plugin) achieves a similar result.

- TODO: https://www.npmjs.com/package/webpack-cdn-plugin
- TODO: https://www.npmjs.com/package/chunks-webpack-plugin

{pagebreak}

## Conclusion

Even though you have managed to get webpack up and running, it does not do that much yet. Developing against it would be painful. Each time you wanted to check out the application, you would have to build it manually using `npm run build` and then refresh the browser. That's where webpack's more advanced features come in.

To recap:

- It's a good idea to use a locally installed version of webpack over a globally installed one. This way you can be sure of what version you are using. The local dependency also works in a Continuous Integration environment.
- Webpack provides a command line interface through the _webpack-cli_ package. You can use it even without configuration, but any advanced usage requires configuration.
- To write more complicated setups, you most likely have to write a separate _webpack.config.js_ file.
- _mini-html-webpack-plugin_ and _html-webpack-plugin_ can be used to generate an HTML entry point to your application. In the _Multiple Pages_ chapter you will see how to generate multiple separate pages using it.
- It's handy to use npm _package.json_ scripts to manage webpack. You can use it as a light task runner and use system features outside of webpack.

In the next chapter, you will learn how to improve the developer experience by enabling automatic browser refresh.
