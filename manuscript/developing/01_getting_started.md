# Getting Started

Before getting started, make sure you are using a recent version of [Node](http://nodejs.org/). You should use at least the most current LTS (long-term support) version. The configuration of the book has been written with the LTS Node features in mind. You should have `node` and `npm` commands available at your terminal. [Yarn](https://yarnpkg.com/) is a good alternative to npm and works for the tutorial as well.

It's possible to get a more controlled environment by using a solution such as [Docker](https://www.docker.com/), [Vagrant](https://www.vagrantup.com/) or [nvm](https://www.npmjs.com/package/nvm). Vagrant comes with a performance penalty as it relies on a virtual machine. Vagrant is valuable in a team: each developer can have the same environment that is usually close to production.

T> The completed configuration is available at [GitHub](https://github.com/survivejs-demos/webpack-demo).

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

T> This is an excellent chance to set up version control using [Git](https://git-scm.com/). You can create a commit per step and tag per chapter, so it's easier to move back and forth if you want.

T> The book examples have been formatted using [Prettier](https://www.npmjs.com/package/prettier) with `"trailingComma": "es5",` and `"printWidth": 68` options enabled to make the diffs clean and fit the page.

## Installing Webpack

Even though webpack can be installed globally (`npm install webpack -g`), it's a good idea to maintain it as a dependency of your project to avoid issues, as then you have control over the exact version you are running. The approach works nicely in **Continuous Integration** (CI) setups as well. A CI system can install your local dependencies, compile your project using them, and then push the result to a server.

To add webpack to the project, execute:

```bash
npm install webpack webpack-cli --save-dev # -D to type less
```

You should see webpack at your *package.json* `devDependencies` section after this. In addition to installing the package locally below the *node_modules* directory, npm also generates an entry for the executable.

T> You can use `--save` and `--save-dev` to separate application and development dependencies. The former installs and writes to *package.json* `dependencies` field whereas the latter writes to `devDependencies` instead.

T> [webpack-cli](https://www.npmjs.com/package/webpack-cli) comes with additional functionality including `init` and `migrate` commands that allow you to create new webpack configuration fast and update from an older version to a newer one.

## Executing Webpack

You can display the exact path of the executables using `npm bin`. Most likely it points at *./node_modules/.bin*. Try running webpack from there through the terminal using `node_modules/.bin/webpack` or a similar command.

After running, you should see a version, a link to the command line interface guide and an extensive list of options. Most aren't used in this project, but it's good to know that this tool is packed with functionality if nothing else.

```bash
$ node_modules/.bin/webpack
Hash: 6736210d3313db05db58
Version: webpack 4.1.1
Time: 88ms
Built at: 3/16/2018 3:35:07 PM

WARNING in configuration
The 'mode' option has not been set. Set 'mode' option to 'development' or 'production' to enable defaults for this environment.

ERROR in Entry module not found: Error: Can't resolve './src' in '.../webpack-demo'
```

The output tells that webpack cannot find the source to compile. It's also missing a `mode` parameter to apply development or production specific defaults.

To get a quick idea of webpack output, we should fix both:

1. Set up *src/index.js* so that it contains `console.log("Hello world");`.
2. Execute `node_modules/.bin/webpack --mode development`. Webpack will discover the source file by Node convention.
3. Examine *dist/main.js*. You should see webpack bootstrap code that begins executing the code. Below the bootstrap, you should find something familiar.

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

To make the output clearer to examine, pass `--devtool false` parameter to webpack. Webpack will generate `eval` based source maps by default and doing this will disable the behavior. See the *Source Maps* chapter for more information.

One problem remains, though. How can we test the application in the browser?

## Configuring *html-webpack-plugin*

The problem can be solved by writing an *index.html* file that points to the generated file. Instead of doing that on our own, we can use a plugin and webpack configuration to do this.

To get started, install *html-webpack-plugin*:

```bash
npm install html-webpack-plugin --save-dev
```

To connect the plugin with webpack, set up configuration as below:

**webpack.config.js**

```javascript
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  plugins: [
    new HtmlWebpackPlugin({
      title: "Webpack demo",
    }),
  ],
};
```

Now that the configuration is done, you should try the following:

1. Build the project using `node_modules/.bin/webpack --mode production`. You can try the `development` mode too.
2. Enter the build directory using `cd dist`.
3. Run the server using `serve` (`npm i serve -g`) or a similar command.
4. Examine the result through a web browser. You should see something familiar there.

![Hello world](images/hello_01.png)

T> **Trailing commas** are used in the book examples on purpose as it gives cleaner diffs for the code examples.

## Examining the Output

If you execute `node_modules/.bin/webpack --mode production`, you should see output:

```bash
Hash: aafe36ba210b0fbb7073
Version: webpack 4.1.1
Time: 338ms
Built at: 3/16/2018 3:40:14 PM
     Asset       Size  Chunks             Chunk Names
   main.js  679 bytes       0  [emitted]  main
index.html  181 bytes          [emitted]
Entrypoint main = main.js
   [0] ./src/index.js + 1 modules 219 bytes {0} [built]
       | ./src/index.js 77 bytes [built]
       | ./src/component.js 142 bytes [built]
Child html-webpack-plugin for "index.html":
     1 asset
    Entrypoint undefined = index.html
       [0] (webpack)/buildin/module.js 519 bytes {0} [built]
       [1] (webpack)/buildin/global.js 509 bytes {0} [built]
        + 2 hidden modules
```

The output tells a lot:

* `Hash: aafe36ba210b0fbb7073` - The hash of the build. You can use this to invalidate assets through `[hash]` placeholder. Hashing is discussed in detail in the *Adding Hashes to Filenames* chapter.
* `Version: webpack 4.1.1` - Webpack version.
* `Time: 338ms` - Time it took to execute the build.
* `main.js  679 bytes       0  [emitted]  main` - Name of the generated asset, size, the IDs of the **chunks** into which it's related, status information telling how it was generated, the name of the chunk.
* `index.html  181 bytes          [emitted]` - Another generated asset that was emitted by the process.
* `[0] ./src/index.js + 1 modules 219 bytes {0} [built]` - The ID of the entry asset, name, size, entry chunk ID, the way it was generated.
* `Child html-webpack-plugin for "index.html":` - This is plugin-related output. In this case *html-webpack-plugin* is creating this output on its own.

Examine the output below the `dist/` directory. If you look closely, you can see the same IDs within the source.

T> In addition to a configuration object, webpack accepts an array of configurations. You can also return a `Promise` and eventually `resolve` to a configuration for example.

T> If you want a light alternative to *html-webpack-plugin*, see [mini-html-webpack-plugin](https://www.npmjs.com/package/mini-html-webpack-plugin). It does less but it's also simpler to understand.

{pagebreak}

## Adding a Build Shortcut

Given executing `node_modules/.bin/webpack` is verbose, you should do something about it. Adjust *package.json* to run tasks as below:

**package.json**

```json
"scripts": {
  "build": "webpack --mode production"
},
```

Run `npm run build` to see the same output as before. npm adds *node_modules/.bin* temporarily to the path enabling this. As a result, rather than having to write `"build": "node_modules/.bin/webpack"`, you can do `"build": "webpack"`.

You can execute this kind of scripts through *npm run* and you can use *npm run* anywhere within your project. If you run the command as is, it gives you the listing of available scripts.

T> There are shortcuts like *npm start* and *npm test*. You can run these directly without *npm run* although that works too. For those in a hurry, you can use *npm t* to run your tests.

T> To go one step further, set up system level aliases using the `alias` command in your terminal configuration. You could map `nrb` to `npm run build` for instance.

{pagebreak}

## `HtmlWebpackPlugin` Extensions

Although you can replace `HtmlWebpackPlugin` template with your own, there are premade ones like [html-webpack-template](https://www.npmjs.com/package/html-webpack-template) or [html-webpack-template-pug](https://www.npmjs.com/package/html-webpack-template-pug).

There are also specific plugins that extend `HtmlWebpackPlugin`'s functionality:

* [favicons-webpack-plugin](https://www.npmjs.com/package/favicons-webpack-plugin) is able to generate favicons.
* [script-ext-html-webpack-plugin](https://www.npmjs.com/package/script-ext-html-webpack-plugin) gives you more control over script tags and allows you to tune script loading further.
* [style-ext-html-webpack-plugin](https://www.npmjs.com/package/style-ext-html-webpack-plugin) converts CSS references to inlined CSS. The technique can be used to serve critical CSS to the client fast as a part of the initial payload.
* [resource-hints-webpack-plugin](https://www.npmjs.com/package/resource-hints-webpack-plugin) adds [resource hints](https://www.w3.org/TR/resource-hints/) to your HTML files to speed up loading time.
* [preload-webpack-plugin](https://www.npmjs.com/package/preload-webpack-plugin) enables `rel=preload` capabilities for scripts and helps with lazy loading, and it combines well with techniques discussed in the *Building* part of this book.
* [webpack-cdn-plugin](https://www.npmjs.com/package/webpack-cdn-plugin) allows you to specify which dependencies to load through a Content Delivery Network (CDN). This common technique is used for speeding up loading of popular libraries.
* [dynamic-cdn-webpack-plugin](https://www.npmjs.com/package/dynamic-cdn-webpack-plugin) achieves a similar result.

{pagebreak}

## Conclusion

Even though you have managed to get webpack up and running, it does not do that much yet. Developing against it would be painful. Each time you wanted to check out the application, you would have to build it manually using `npm run build` and then refresh the browser. That's where webpack's more advanced features come in.

To recap:

* It's a good idea to use a locally installed version of webpack over a globally installed one. This way you can be sure of what version you are using. The local dependency also works in a Continuous Integration environment.
* Webpack provides a command line interface through the *webpack-cli* package. You can use it even without configuration, but any advanced usage requires configuration.
* To write more complicated setups, you most likely have to write a separate *webpack.config.js* file.
* `HtmlWebpackPlugin` can be used to generate an HTML entry point to your application. In the *Multiple Pages* chapter you will see how to generate multiple separate pages using it.
* It's handy to use npm *package.json* scripts to manage webpack. You can use it as a light task runner and use system features outside of webpack.

In the next chapter, you will learn how to improve the developer experience by enabling automatic browser refresh.
