# Getting Started

Before getting started, make sure you are using a recent version of [Node](http://nodejs.org/). You should use at least the most current LTS (long-term support) version as the configuration of the book has been written with the LTS Node features in mind. You should have `node` and `npm` commands available at your terminal. [Yarn](https://yarnpkg.com/) is a good alternative to npm and works for the tutorial as well.

It's possible to get a more controlled environment by using a solution such as [Docker](https://www.docker.com/), [Vagrant](https://www.vagrantup.com/) or [nvm](https://www.npmjs.com/package/nvm). Vagrant comes with a performance penalty as it relies on a virtual machine. Vagrant is valuable in a team: each developer can have the same environment that is usually close to production.

T> The completed configuration is available at [GitHub](https://github.com/survivejs-demos/webpack-demo).

{pagebreak}

## Setting up the project

To get a starting point, you should create a directory for the project and set up a `package.json` there. npm uses that to manage project dependencies. Here are the basic commands:

```bash
mkdir webpack-demo
cd webpack-demo
npm init -y # -y generates *package.json*, skip for more control
```

You can tweak the generated `package.json` manually to make further changes to it even though a part of the operations modify the file automatically for you. The official documentation explains [package.json options](https://docs.npmjs.com/files/package.json) in more detail.

T> You can set those `npm init` defaults at `~/.npmrc`.

T> This is an excellent chance to set up version control using [Git](https://git-scm.com/). You can create a commit per step and tag per chapter, so it's easier to move back and forth if you want.

T> The book examples have been formatted using [Prettier](https://www.npmjs.com/package/prettier) with `"printWidth": 68` to make the examples fit the book pages.

## Installing webpack

Even though webpack can be installed globally (`npm add webpack -g`), it's a good idea to maintain it as a dependency of your project to avoid issues, as then you have control over the exact version you are running.

The approach works nicely with **Continuous Integration** (CI) setups as well as a CI system can install your local dependencies, compile your project using them, and then push the result to a server.

To add webpack to the project, execute:

```bash
npm add webpack webpack-cli -D # -D === -D
```

You should see webpack at your `package.json` `devDependencies` section after this. In addition to installing the package locally below the _node_modules_ directory, npm also generates an entry for the executable you can find at `node_modules/.bin` directory.

T> If you run `npm add`, it will write the dependencies to `package.json` `dependencies`. The `-D` (`-D`) flag writes them to `devDependencies` instead. The split allows you to communicate which dependencies are application specific and which are required for developing it. It's optional to follow this convention and it's more important for npm package authors as it defines which packages depend on the one they are distributing.

T> [webpack-cli](https://www.npmjs.com/package/webpack-cli) comes with additional functionality including `init` and `migrate` commands that allow you to create new webpack configuration fast and update from an older version to a newer one.

T> [webpack-nano](https://www.npmjs.com/package/webpack-nano) is a light option to **webpack-cli**.

## Executing webpack

You can display the exact path of the executables using `npm bin`. Most likely it points to `./node_modules/.bin`. Try running webpack from there through the terminal using `node_modules/.bin/webpack` or a similar command.

After running, you should see a version, a link to the command line interface guide and an extensive list of options. Most aren't used in this project, but it's good to know that this tool is packed with functionality if nothing else.

```bash
$ node_modules/.bin/webpack

Insufficient number of arguments or no entry found.
Alternatively, run 'webpack(-cli) --help' for usage info.

Hash: 825466854a76efce42e4
Version: webpack 4.43.0
Time: 28ms
Built at: 07/09/2020 10:48:13 AM

WARNING in configuration
The 'mode' option has not been set, webpack will fallback to 'production' for this value. Set 'mode' option to 'development' or 'production' to enable defaults for each environment.
You can also set it to 'none' to disable any default behavior. Learn more: https://webpack.js.org/configuration/mode/

ERROR in Entry module not found: Error: Can't resolve './src' in '/tmp/webpack-demo'
```

The output tells that webpack cannot find the source to compile. Ideally we would pass `mode` parameter to it as well to define which defaults we want.

{pagebreak}

To make webpack compile, do the following:

1. Set up `src/index.js` so that it contains `console.log("Hello world");`.
2. Execute `node_modules/.bin/webpack --mode development`. Webpack will discover the source file by Node convention. If you skip `--mode`, you'll get **production** output instead.
3. Examine `dist/main.js`. You should see webpack bootstrap code that begins executing the code. Below the bootstrap, you should find something familiar.

T> There's third mode, `--mode none`, that doesn't apply any defaults. The main use for this one is debugging your output without any additional processing applied by the main targets.

## Setting up assets

To make the build more complex, we can add another module to the project and start developing a small application:

**src/component.js**

```javascript
export default (text = "Hello world") => {
  const element = document.createElement("div");

  element.innerHTML = text;

  return element;
};
```

{pagebreak}

We also have to modify the original file to import the new file and render the application through the DOM:

**src/index.js**

```javascript
import component from "./component";

document.body.appendChild(component());
```

Examine the output after building the project with one of the commands above. You should see both modules in the bundle that webpack wrote to the `dist` directory. One problem remains, though. How can we test the application in the browser?

## Configuring **mini-html-webpack-plugin**

The problem can be solved by writing an `index.html` file that points to the generated file. Instead of doing that on our own, we can use a plugin and webpack configuration to do this.

To get started, install **mini-html-webpack-plugin**:

```bash
npm add mini-html-webpack-plugin -D
```

{pagebreak}

To connect the plugin with webpack, set up configuration as below:

**webpack.config.js**

```javascript
const {
  MiniHtmlWebpackPlugin,
} = require("mini-html-webpack-plugin");

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

1. Build the project using `node_modules/.bin/webpack --mode production`. You can try the `development` and `none` modes too.
2. Enter the build directory using `cd dist`.
3. Run the server using `serve` (`npm add serve -g` or `npx serve`) or a similar command you are familiar with.
4. Examine the result through a web browser. You should see something familiar there.

![Hello world](images/hello_01.png)

T> **Trailing commas** are used in the book examples on purpose as it gives cleaner diffs for the code examples.

T> See [mini-html-webpack-plugin](https://www.npmjs.com/package/mini-html-webpack-plugin) documentation for further options. You can override the HTML template fully, and process individual parts injected to it freely.

W> Webpack has default configuration for its entries and output. It looks for source from `./src` by default and its emits output to `./dist`. You can control these through `entry` and `output` respectively as seen in the _What is Webpack_ chapter.

## Examining the output

If you execute `node_modules/.bin/webpack --mode production`, you should see output:

```bash
Hash: 4a1682d15fc37fdfcce1
Version: webpack 4.43.0
Time: 168ms
Built at: 07/09/2020 11:09:21 AM
     Asset       Size  Chunks             Chunk Names
index.html  198 bytes          [emitted]
   main.js   1.04 KiB       0  [emitted]  main
Entrypoint main = main.js
[0] ./src/index.js + 1 modules 220 bytes {0} [built]
    | ./src/index.js 77 bytes [built]
    | ./src/component.js 143 bytes [built]
```

The output tells a lot:

- `Hash: 4a1682d15fc37fdfcce1` - The hash of the build. You can use this to invalidate assets through `[hash]` placeholder. Hashing is discussed in detail in the _Adding Hashes to Filenames_ chapter.
- `Version: webpack 4.43.0` - Webpack version.
- `Time: 168ms` - Time it took to execute the build.
- `index.html 198 bytes [emitted]` - Another generated asset that was emitted by the process.
- `main.js 1.04 KiB 0 [emitted] main` - Name of the generated asset, size, the IDs of the **chunks** into which it's related, status information telling how it was generated, the name of the chunk.
- `[0] ./src/index.js + 1 modules 220 bytes {0} [built]` - The ID of the entry asset, name, size, entry chunk ID, the way it was generated.

Examine the output below the `dist/` directory. If you look closely, you can see the same IDs within the source.

T> In addition to a configuration object, webpack accepts an array of configurations. You can also return a `Promise` and eventually `resolve` to a configuration for example. Latter is useful if you are fetching configuration related data from a third-party source.

## Webpack output plugins

Given the output given by webpack can be difficult to decipher, multiple options exist:

- [webpack-stylish](https://www.npmjs.com/package/webpack-stylish) is a webpack plugin that formats webpack's output in a visually more attractive manner.
- [friendly-errors-webpack-plugin](https://www.npmjs.com/package/friendly-errors-webpack-plugin) improves on error reporting of webpack. It captures common errors and displays them in a friendly manner.
- [webpackbar](https://www.npmjs.com/package/webpackbar) has been made especially for tracking build progress.
- `webpack.ProgressPlugin` is included out of the box and can be used as well.
- [webpack-dashboard](https://www.npmjs.com/package/webpack-dashboard) gives an entire terminal based dashboard over the standard webpack output. If you prefer clear visual output, this one comes in handy.
- [test-webpack-reporter-plugin](https://www.npmjs.com/package/test-webpack-reporter-plugin) abstracts webpack's internals to make it easier to write your own reporters.

Give the above options a go if you want to go beyond default output.

## Adding a build shortcut

Given executing `node_modules/.bin/webpack` gets boring after a while, lets adjust `package.json` to run tasks as below:

**package.json**

```json
{
  "scripts": {
    "build": "webpack --mode production"
  }
}
```

Run `npm run build` to see the same output as before. npm adds _node_modules/.bin_ temporarily to the path enabling this. As a result, rather than having to write `"build": "node_modules/.bin/webpack"`, you can do `"build": "webpack"`.

You can execute this kind of scripts through _npm run_ and you can use the command anywhere within your project. If you run the command without any parameters (_npm run_), it gives you the listing of available scripts.

T> If you don't want to use the default configuration name, use `--config <configuration file>`. Run `webpack --help` to see all the available options.

T> There are shortcuts like _npm start_ and _npm test_. You can run these directly without _npm run_ although that works too. For those in a hurry, you can use _npm t_ to run your tests.

T> To go one step further, set up system-level aliases using the `alias` command in your terminal configuration. You could map `nrb` to `npm run build`, for instance.

T> If you want to run multiple commands concurrently, see the [concurrently](https://www.npmjs.com/package/concurrently) package. It has been designed to allow that while providing neat output.

## `HtmlWebpackPlugin` and its extensions

Although **mini-html-webpack-plugin** is enough for basic use cases, there can be times when you want more functionality. That's where [html-webpack-plugin](https://www.npmjs.com/package/html-webpack-plugin) and its extensions come in:

- [favicons-webpack-plugin](https://www.npmjs.com/package/favicons-webpack-plugin) is able to generate favicons.
- [script-ext-html-webpack-plugin](https://www.npmjs.com/package/script-ext-html-webpack-plugin) gives you more control over script tags and allows you to tune script loading further.
- [webpack-cdn-plugin](https://www.npmjs.com/package/webpack-cdn-plugin) allows you to specify which dependencies to load through a Content Delivery Network (CDN). This common technique is used for speeding up loading of popular libraries.
- [dynamic-cdn-webpack-plugin](https://www.npmjs.com/package/dynamic-cdn-webpack-plugin) achieves a similar result.

{pagebreak}

## Conclusion

Even though you have managed to get webpack up and running, it does not do that much yet. Developing against it would be painful as we would have to recompile all the time. That's where webpack's more advanced features we explore in the next chapters come in.

To recap:

- It's a good idea to use a locally installed version of webpack over a globally installed one. This way you can be sure of what version you are using. The local dependency also works in a Continuous Integration environment.
- Webpack provides a command line interface through the **webpack-cli** package. You can use it even without configuration, but any advanced usage requires work.
- To write more complicated setups, you most likely have to write a separate `webpack.config.js` file.
- **mini-html-webpack-plugin** and **html-webpack-plugin** can be used to generate an HTML entry point to your application. In the _Multiple Pages_ chapter you will see how to generate multiple separate pages using the plugin.
- It's handy to use npm `package.json` scripts to manage webpack. You can use it as a light task runner and use system features outside of webpack.

In the next chapter, you will learn how to improve the developer experience by enabling automatic browser refresh.
