# What is Webpack?

Webpack is a module bundler. You can use it with task runners while leaving bundling to it. The line has become blurred, though, as the community has developed many plugins for it. Sometimes these plugins are used to perform tasks that are usually done outside of webpack. Cleaning the build directory or deploying the result are examples of this.

Webpack became particularly popular with React due to Hot Module Replacement (HMR). That helped to popularize webpack to a large extent and lead to usage in other environments, such as [Ruby on Rails](https://github.com/rails/webpacker). Despite its name, webpack has not been meant for web alone. It can bundle for other targets as well as discussed in the *Build Targets* chapter.

T> If you want to understand build tools and their history in a better detail, check out the *Comparison of Build Tools* appendix.

## Webpack Relies on Modules

If you think about the smallest project you could bundle with webpack, you’ll end up with input and output. In webpack terms, the bundling process begins from user defined **entries**. Entries themselves are **modules** and can point to other modules through **imports**.

When you bundle a project through webpack, it will traverse through imports. As a result, webpack constructs a **dependency graph** of the project and then generates the **output** based on the configuration. It will output everything into a single **bundle** by default, but it can be configured to output more.

Webpack supports ES6, CommonJS, and AMD module formats out of the box. The loader mechanism works for CSS as well, and `@import` and `url()` are supported through *css-loader*. You can also find plugins for specific tasks, such as minification, internationalization, HMR, and so on.

T> A dependency graph describes is a directed graph that describes how nodes relate to each other. In this case the graph definition is defined through references (`require`, `import`) between files. Webpack can traverse this information in a static manner without executing the source to generate the graph it needs to create bundles.

## Loaders Evaluate Modules

When webpack encounters a **module**, it will try to perform several things:

1. It will **resolve** the module. Webpack provides configuration for adjusting this behavior. Especially the *Consuming Packages* chapter covers techniques related to this. If a module failed to resolve, webpack would give a runtime error.
2. Assuming a module resolved correctly, webpack will try to pass it through **loaders** in your configuration. Each loader definition contains a condition based on which it should be executed. If a loader was matched, webpack would try to resolve it in a similar way as a module.
3. If all the loaders were found, webpack will evaluate the matched loaders from bottom to up and right to left (`styleLoader(cssLoader('./main.css'))`). The *Loader Definitions* chapter covers the topic in detail.
4. If loader evaluation completed without a runtime error, webpack will include the source to the last bundle. **Plugins** can intercept this behavior and alter the way bundling happens.
5. After each module has been evaluated, webpack will write a bootstrap script including a manifest that describes how to begin executing the result in the browser. This last step can differ based on the build target you are using.

That’s not all there is to the bundling process. For example, you can define specific **split points** where webpack will generate separate bundles that are loaded based on application logic. The idea is discussed in the *Code Splitting* chapter.

## Additional Control Through Plugins

Although loaders can do a lot, they don’t provide enough power for more advanced tasks. **Plugins** allow you to intercept **runtime events** provided by webpack. A good example is bundle extraction performed by `ExtractTextPlugin`.

The plugin works in tandem with a loader that captures files to extract out of the bundle and into a file of its own. Otherwise the CSS would end up in the resulting JavaScript. The *Separating CSS* chapter discusses this idea in detail.

The image below recaps the main concepts discussed above and shows how they relate to each other:

![Webpack process](images/webpack-process.png)

## Webpack Is Configuration Driven

At its core webpack relies on configuration. Here is a sample adapted from [the official webpack tutorial](https://webpack.js.org/get-started/) that shows how the main ideas go together:

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

    // Capture name from the entry using a pattern
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

Given the configuration is written in JavaScript, it’s quite malleable. The model may make webpack feel a bit opaque at times, as it can be difficult to understand what it’s doing especially in more complicated cases. Covering those is one of the main reasons why this book exists.

T> To understand webpack on source code level, check out [the artsy webpack tour](https://github.com/TheLarkInn/artsy-webpack-tour).

## Hot Module Replacement

You could be familiar with tools, such as [LiveReload](http://livereload.com/) or [BrowserSync](http://www.browsersync.io/), already. These tools refresh the browser automatically as you make changes. HMR takes things one step further. In the case of React, it allows the application to maintain its state without forcing a refresh. While this does not sound that special, it makes a big difference in practice.

Note that HMR is available in Browserify via [livereactload](https://github.com/milankinen/livereactload), so it’s not a feature that’s exclusive to webpack.

## Code Splitting

Aside from the HMR feature, webpack’s bundling capabilities are extensive. Webpack allows you to split code in various ways. You can even load code dynamically as your application gets executed. This sort of lazy loading comes in handy, especially for larger applications. You can load dependencies as you need them.

Even small applications can benefit from code splitting, as it allows the users to get something useable in their hands faster. Performance is a feature, after all. Knowing the basic techniques is worthwhile.

## Asset Hashing

With webpack, you can inject a hash to each bundle name (e.g., *app.d587bbd6.js*) to invalidate bundles on the client side as changes are made. Bundle-splitting allows the client to reload only a small part of the data in the ideal case.

## Loaders and Plugins

All these smaller features add up. Surprisingly, you can get many things done out of the box. If you are missing something, there are loaders and plugins available that allow you to go further.

Webpack comes with a significant learning curve. Even still, it’s a tool worth learning, given it saves so much time and effort over the long term. To get a better idea how it compares to other tools, check out [the official comparison](https://webpack.js.org/get-started/why-webpack/#comparison).

## Conclusion

You can use webpack with other tools. It won’t solve everything. It does solve the problem of bundling, however. That’s one less worry during development. Using *package.json*, `scripts`, and webpack alone takes you far, as you will see soon.

To summarize:

* Webpack is a **module bundler**, but you can also use it for tasks as well.
* **Hot Module Replacement** (HMR) helped to popularize webpack. It is a feature that can enhance development experience.
* Webpack relies on a **dependency graph** underneath. Webpack will traverse through the source to construct the graph and it uses this information and configuration to generate bundles.
* Webpack’s **configuration** describes how to transform assets of the graphs and what kind of output it should generate. A part of this information may be included in the source itself if features like code splitting are used.
* Webpack can generate **hashes** for filenames allowing you to invalidate bundles as their contents change.
* Webpack’s logic is contained within **loaders** and **plugins**. These are called through webpack’s configuration.

In the following chapters, you’ll examine webpack in more detail as you will learn to develop a basic development and build configuration. The later chapters continue further and delve into more advanced topics.
