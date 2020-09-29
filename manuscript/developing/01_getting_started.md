# Getting Started

Before getting started, make sure you are using a recent version of [Node](http://nodejs.org/). You should use at least the most current LTS (long-term support) version as the configuration of the book has been written with the LTS Node features in mind. You should have `node` and `npm` commands available at your terminal. [Yarn](https://yarnpkg.com/) is a good alternative to npm and works for the tutorial as well.

T> To get a more controlled environment, use [Docker](https://www.docker.com/), [Vagrant](https://www.vagrantup.com/), [nvm](https://www.npmjs.com/package/nvm) or a similar tool. Vagrant comes with a performance penalty as it relies on a virtual machine. Vagrant is valuable in a team: each developer can have the same environment that is usually close to production.

T> The completed configuration is available at [GitHub](https://github.com/survivejs-demos/webpack-demo).

## Setting up the project

To get a starting point, create a directory for the project, and set up a `package.json` there as npm uses that to manage project dependencies.

```bash
mkdir webpack-demo
cd webpack-demo
npm init -y # -y generates a `package.json` with default values, skip for more control
```

{pagebreak}

You can tweak the generated `package.json` manually to make further changes to it even though a part of the operations modify the file automatically for you. The official documentation explains [package.json options](https://docs.npmjs.com/files/package.json) in more detail.

T> You can set those `npm init` defaults at `~/.npmrc`.

T> This is an excellent chance to set up version control using [Git](https://git-scm.com/). You can create a commit per step and tag per chapter, so it's easier to move back and forth if you want.

## Installing webpack

Even though webpack can be installed globally (`npm add webpack -g`), it's a good idea to maintain it as a dependency of your project to avoid issues, as then you have control over the exact version you are running.

The approach works nicely with **Continuous Integration** (CI) setups as well: a CI system can install project's local dependencies, compile the project using them, and then push the result to a server.

To add webpack to the project, run:

```bash
npm add webpack webpack-nano --develop # --develop === -D
```

You should see **webpack** and **webpack-nano** in your `package.json` `devDependencies` section after this. In addition to installing the package locally below the `node_modules` directory, npm also generates an entry for the executable in the `node_modules/.bin` directory.

We're using [webpack-nano](https://www.npmjs.com/package/webpack-nano) over the official [webpack-cli](https://www.npmjs.com/package/webpack-cli) as it has enough features for the book project while being directly compatible with webpack 4 and 5.

**webpack-cli** comes with additional functionality, including `init` and `migrate` commands that allow you to create new webpack configuration fast and update from an older version to a newer one.

T> If you want to use webpack 5 to run the examples, use `npm add webpack@next` instead.

T> `npm add` is an alias for `npm install`. It's used in the book as it aligns well with Yarn and `yarn add`. You can use which one you prefer.

## Running webpack

Type `npx wp` to run locally installed **webpack-nano**.

T> You can display the exact path of the executables using `npm bin`. Most likely it points to `./node_modules/.bin`.

T> `npx` is installed with npm and could be used to run npm packages without installation, as well as to run locally installed packages.

After running, you should see a version, a link to the command line interface guide and an extensive list of options. Most aren't used in this project, but it's good to know that this tool is packed with functionality if nothing else.

```bash
$ npx wp

⬡ webpack: Build Finished
⬡ webpack: Hash: 80f545d7d31df2164016
  Version: webpack 4.44.1
  Time: 29ms
  Built at: 08/21/2020 9:24:56 AM

WARNING in configuration
The 'mode' option has not been set, webpack will fallback to 'production' for this value. Set 'mode' option to 'development' or 'production' to enable defaults for each environment.
You can also set it to 'none' to disable any default behavior. Learn more: https://webpack.js.org/configuration/mode/

ERROR in Entry module not found: Error: Can't resolve './src' in '/tmp/webpack-demo'
```

The output tells that webpack cannot find the source to compile. Ideally we would pass `mode` parameter to it as well to define which defaults we want.

To make webpack compile, do the following:

1. Set up `src/index.js` with something like `console.log("Hello world");`.
2. Execute `npx wp`. Webpack will discover the source file by convention.
3. Examine `dist/main.js`. You should see webpack bootstrap code that begins executing the code. Below the bootstrap, you should find something familiar.

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

We also have to modify the original file to import the new file and render the application to the DOM:

**src/index.js**

```javascript
import component from "./component";

document.body.appendChild(component());
```

Examine the output after building the project by running `npx wp` again. You should see both modules in the bundle that webpack wrote to the `dist` directory. One problem remains, though. How can we test the application in the browser?

## Configuring **mini-html-webpack-plugin**

The problem can be solved by writing an `index.html` file that points to the generated file. Instead of doing that on our own, we can use a webpack plugin to do this.

To get started, install [mini-html-webpack-plugin](https://www.npmjs.com/package/mini-html-webpack-plugin):

```bash
npm add mini-html-webpack-plugin --develop
```

T> [html-webpack-plugin](https://www.npmjs.com/package/mini-html-webpack-plugin) is a versatile option that can be expanded with plugins. For anything beyond basic usage, it's a good option.

To connect the plugin with webpack, set up the configuration as below:

**webpack.config.js**

```javascript
const { mode } = require("webpack-nano/argv");
const {
  MiniHtmlWebpackPlugin,
} = require("mini-html-webpack-plugin");

module.exports = {
  mode,
  plugins: [
    new MiniHtmlWebpackPlugin({
      context: {
        title: "Webpack demo",
      },
    }),
  ],
};
```

Now that the configuration is done, try the following:

1. Build the project using `npx wp --mode production`. You can try the `development` and `none` modes too.
2. Enter the build directory using `cd dist`.
3. Run the server using `serve` (`npm add serve -g` or `npx serve`) or a similar command you are familiar with.

T> The `none` mode doesn't apply any defaults. Use it for debugging.

You should see a hello message in your browser:

![Hello world](images/hello_01.png)

T> In addition to a configuration object, webpack accepts an array of configurations. You can also return a `Promise` that eventually `resolve`s to a configuration. Latter is useful if you are fetching configuration related data from a third-party source.

W> Webpack has default configuration for its entries and output. It looks for source from `./src` by default and it emits output to `./dist`. You can control these through `entry` and `output` respectively as seen in the _What is Webpack_ chapter.

{pagebreak}

## Examining the output

If you execute `npx wp --mode production`, you should see output:

```bash
⬡ webpack: Build Finished
⬡ webpack: Hash: b3d548da335f2c806f02
  Version: webpack 4.44.1
  Time: 60ms
  Built at: 08/21/2020 9:29:03 AM
       Asset       Size  Chunks             Chunk Names
  index.html  198 bytes          [emitted]
     main.js   1.04 KiB       0  [emitted]  main
  Entrypoint main = main.js
  [0] ./src/index.js + 1 modules 219 bytes {0} [built]
      | ./src/index.js 77 bytes [built]
      | ./src/component.js 142 bytes [built]
```

The output is revealing:

- `Hash: b3d548da335f2c806f02` - The hash of the build. You can use this to invalidate assets through `[hash]` placeholder. Hashing is discussed in detail in the _Adding Hashes to Filenames_ chapter.
- `Version: webpack 4.44.1` - Webpack version.
- `Time: 60ms` - Time it took to execute the build.
- `main.js 1.04 KiB 0 [emitted] main` - Name of the generated asset, size, the IDs of the **chunks** into which it's related, status information telling how it was generated, the name of the chunk.
- `index.html 198 bytes [emitted]` - Another generated asset that was emitted by the process.
- `[0] ./src/index.js + 1 modules 219 bytes {0} [built]` - The ID of the entry asset, name, size, entry chunk ID, the way it was generated.

Examine the output inside the `dist/` directory. If you look closely, you can see the same IDs within the source.

## Adding a build shortcut

Given executing `npx wp --mode production` gets boring after a while, let's adjust `package.json` to run tasks as below:

**package.json**

```json
{
  "scripts": {
    "build": "wp --mode production"
  }
}
```

Run `npm run build` to see the same output as before. npm adds `node_modules/.bin` temporarily to the path enabling this. As a result, rather than having to write `"build": "node_modules/.bin/wp"`, you can do `"build": "wp"`.

You can execute this kind of scripts through `npm run` and you can use the command anywhere within your project. If you run the command without any parameters (`npm run`), it gives you the listing of available scripts.

T> If you want to run multiple commands concurrently, see the [concurrently](https://www.npmjs.com/package/concurrently) package. It has been designed to allow that while providing neat output.

## Webpack output plugins

There are multiple plugins to make the webpack output easier to understand and more convenient:

- [webpackbar](https://www.npmjs.com/package/webpackbar) has been made especially for tracking build progress.
- `webpack.ProgressPlugin` is included out of the box and can be used as well.
- [webpack-dashboard](https://www.npmjs.com/package/webpack-dashboard) gives an entire terminal-based dashboard over the standard webpack output. If you prefer clear visual output, this one comes in handy.
- [test-webpack-reporter-plugin](https://www.npmjs.com/package/test-webpack-reporter-plugin) abstracts webpack's internals to make it easier to write your own reporters.

## Conclusion

Even though you have managed to get webpack up and running, it does not do that much yet. Developing against it would be painful as we would have to recompile all the time. That's where webpack's more advanced features we explore in the next chapters come in.

To recap:

- It's a good idea to use a locally installed version of webpack over a globally installed one. This way you can be sure of what version you are using. The local dependency also works in a Continuous Integration environment.
- Webpack provides a command line interface through the **webpack-cli** package. You can use it even without configuration, but any advanced usage requires a config file. **webpack-nano** is a good alternative for basic usage.
- To write more complicated setups, you most likely have to write a separate `webpack.config.js` file.
- **mini-html-webpack-plugin** and **html-webpack-plugin** can be used to generate an HTML entry point to your application. In the _Multiple Pages_ chapter you will see how to generate multiple separate pages using these plugins.
- It's handy to use npm scripts in `package.json` to manage webpack. You can use them as a light task runner and use system features outside of webpack.

In the next chapter, you will learn how to improve the developer experience by enabling automatic browser refresh.
