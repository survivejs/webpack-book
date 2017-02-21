# What is Webpack?

Webpack is a module bundler. You can use it with task runners while leaving bundling to it. The line between task runners and webpack has become blurred, though, as the community has developed a large amount of plugins for it. Sometimes these plugins are used to perform tasks that are usually done outside of webpack. Cleaning the build directory or deploying the result are examples of this.

Webpack became particularly popular with React due to Hot Module Replacement (HMR). That helped to popularize webpack to a large extent. This has lead to usage in other environments. Despite its name, webpack has not been meant for web alone. It can bundle for other targets as well as discussed in the *Build Targets* chapter.

## Webpack Relies on Modules

If you think about the simplest project you could bundle with webpack, you'll end up with input and output. In webpack terms inputs are known as **entries**. Entries themselves are **modules** and can point to other modules through **imports**.

When you bundle a project through webpack, it will traverse through imports. As a result webpack constructs a **dependency graph** of the project and then generates the **output** based on the configuration. It will output everything into a single **bundle** by default, but it can be configured to output more.

Webpack supports ES6, CommonJS, and AMD module formats out of the box. The loader mechanism works for CSS as well and `@import` and `@url` are supported through *css-loader*. You can also find plugins for specific tasks, such as minification, internationalization, HMR, and so on.

## Modules Are Evaluated Through Loaders

When webpack encounters a **module**, it will try to perform several things:

1. It will **resolve** the module. Webpack provides configuration for adjusting this behavior. Especially the *Consuming Packages* chapter covers techniques related to this. If a module failed to resolve, webpack will give a runtime error.
2. Assuming a module was resolved correctly, webpack will try to pass it through **loaders** in your configuration. Each loader definition contains a condition based on which it should be executed. If a loader was matched, webpack will try to resolve it in a similar way as a module.
3. If all the loaders were found, webpack will evaluate the matched loaders from bottom to up and right to left (`styleLoader(cssLoader('./main.css'))`). The *Loader Definitions* chapter covers the topic in detail.
4. If loader evaluation completed without a runtime error, webpack will include the source to the final bundle. **Plugins** can intercept this behavior and alter the way bundling happens.
5. After all modules have been evaluated, webpack will write a bootstrap script including a manifest that describes how to begin evaluating the result in the browser.

The last step can differ based on the build target you are using. This is the default behavior, though.

There is more to the bundling process. For example, you can define specific **split points** where webpack will generate separate bundles that are loaded based on application logic. The idea is discussed at the *Code Splitting* chapter.

## Plugins Are Used for Additional Control

Although loaders are useful, they don't provide enough power for more advanced tasks. This is where **plugins** come in. They allow you to intercept **runtime events** provided by webpack. A good example is bundle extraction performed by `ExtractTextPlugin`.

The plugin works in tandem with a loader that captures files to extract out of the bundle and into a file of its own. This is useful for extracting CSS as otherwise it would end up within the resulting JavaScript. The *Separating CSS* chapter discusses this idea in detail.

The image below recaps the main concepts discussed above and shows how they relate to each other:

![Webpack process](images/webpack-process.png)

## Webpack Is Configuration Driven

Webpack relies on configuration to describe the flow above. Here is a sample configuration adapted from [the official webpack tutorial](https://webpack.js.org/get-started/) that shows how the main ideas go together:

**webpack.config.js**

```javascript
const webpack = require('webpack');

module.exports = {
  // Where to start bundling
  entry: {
    app: './entry.js',
  },

  // Where to output
  output: {
    // Output to the same directory
    path: __dirname,

    // Capture name from the entry using a pattern.
    filename: '[name].js',
  },

  // How to resolve encountered imports
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.js$/,
        use: 'babel-loader',
      },
    ],
  },

  // What extra processing to perform
  plugins: [
    new webpack.optimize.UglifyJsPlugin(),
  ],

  // Adjust resolution algorithm
  resolve: {
    alias: { ... },
  },
};
```

Given the configuration is written in JavaScript, it's quite malleable. The configuration model may make webpack feel a bit opaque at times, as it can be difficult to understand what it's doing. This is particularly true for more complicated cases. Covering those is one of the main reasons why this book exists.

## Hot Module Replacement

You might be familiar with tools, such as [LiveReload](http://livereload.com/) or [BrowserSync](http://www.browsersync.io/), already. These tools refresh the browser automatically as you make changes. HMR takes things one step further. In the case of React, it allows the application to maintain its state without forcing a refresh. This sounds simple, but it makes a big difference in practice.

Note that HMR is available in Browserify via [livereactload](https://github.com/milankinen/livereactload), so it's not a feature that's exclusive to webpack.

## Code Splitting

Aside from the HMR feature, webpack's bundling capabilities are extensive. Webpack allows you to split code in various ways. You can even load code dynamically as your application gets executed. This sort of lazy loading comes in handy, especially for larger applications. You can load dependencies as you need them.

Even small applications can benefit from code splitting, as it allows the users to get something useable in their hands faster. Performance is a feature, after all. So, knowing the basic techniques is worthwhile.

## Asset Hashing

With webpack, you can easily inject a hash to each bundle name (e.g., *app.d587bbd6.js*). This allows you to invalidate bundles on the client side as changes are made. Bundle-splitting allows the client to reload only a small part of the data in the ideal case.

Unfortunately, this isn't as easy as I would like, but it's manageable assuming you understand the possible setups well enough.

## Loaders and Plugins

All these smaller features add up. Surprisingly, you can get many things done out of the box. If you are missing something, there are loaders and plugins available that allow you to go further.

Webpack comes with a significant learning curve. Even still, it's a tool worth learning, given it saves so much time and effort over the long term. To get a better idea how it compares to some other tools, check out [the official comparison](https://webpack.js.org/get-started/why-webpack/#comparison).

## Glossary

Given webpack comes with specific nomenclature, I've gathered the main terms and their explanations below based on the book part where they are discussed.

### Developing

* **Entry** - Entry refers to a file where you point from webpack's `entry` configuration.
* **Module** - Module can be an entry, but it can be also a file where an entry points. Modules can point to other modules.
* **Plugin** - Plugins connect to webpack's event system and can inject functionality to it. They provide the most powerful way to extend webpack and can be combined with loaders for maximum control.
* **Hot module replacement** - Hot module replacement refers to a specific technique that allows you to patch code while it is running in the browser.
* **Linting** - Linting refers to the process in which code is statically examined for specific faults. A linter will alert if any of these faults are found. It is a way to improve code quality.

### Loading

* **Loader** - Loader is a transformation that accepts source and returns transformed source. It can also skip transforming and perform a check against the input instead.
* **Asset** - Asset is a general term for media and source files of a project and webpack can emit them as a build result. They can also be handled outside of webpack and copied to the output separately.

### Buildling

* **Source map** - Source maps describe the mapping between the original source and the generated source allowing browsers to provide a better debugging experience.
* **Bundle** - When webpack runs successfully, it will generate output files which we call bundles.
* **Bundle splitting** - Bundle splitting is a specific technique that allows us to generate multiple bundles based on a condition.
* **Code splitting** - Code splitting is a more granular way to generate bundles. The term refers to bundle splitting that is performed within source code using specific syntax.
* **Chunk** - Chunk is a webpack specific term that is used internally to manage the bundling process. Webpack composes bundles out of chunks and there are several types of those.

### Optimizing

* **Minifying** - Minifying, or minification, is an optimization technique in which code is written in a more compact form without losing meaning. There are also destructive transformations that may break code if you are not careful.
* **Tree shaking** - Tree shaking is the process of dropping unused code based on static analysis. A good ES6 module definition allows this process as it is possible to analyze in this particular manner.
* **Hashing** - Hashing refers to the process of generating a hash that is attached to the asset/bundle path to invalidate it on the client. Example of a hashed bundle name: *app.f6f78b2fd2c38e8200d.js*.
* **Dependency graph** - When webpack traverses through the source through modules, it will construct a **dependency graph** of modules to describe how they relate to each other.

### Output

* **Output** - Output refers to files emitted by webpack. More specifically, webpack will emit **bundles** and **assets** based on the output settings.
* **Target** - Even though webpack is used mainly with the web, it can target other platforms as well. Target configuration is used to alter this behavior.

### Packages

* **Resolving** - When webpack encounters a module or a loader, it will try to resolve it based on its resolution rules. Resolving is the generic term describing this process.

## Conclusion

You can use webpack with some other tools. It won't solve everything. It does solve the difficult problem of bundling, however. That's one less worry during development. Using *package.json*, `scripts`, and webpack alone takes you far, as we will see soon.

In the following chapters, we'll examine webpack in more detail as you will learn to develop a basic development and build configuration. The later chapters delve into more advanced topics. You can use these building blocks you can use to develop your own setup.
