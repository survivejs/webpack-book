# What is Webpack?

Webpack is a module bundler. You can use a separate task runner while leaving it to take care of bundling, however thisline has become blurred as the community has developed plugins for it. Sometimes these plugins are used to perform tasks that are usually done outside of webpack, for example cleaning the build directory or deploying the build.

Webpack became particularly popular with React due to Hot Module Replacement (HMR) which helped greatly to popularize webpack and lead to its usage in other environments, such as [Ruby on Rails](https://github.com/rails/webpacker). Despite its name, web pack is not limited to web alone. It can bundle for other targets as well as discussed in the *Build Targets* chapter.

T> If you want to understand build tools and their history in a better detail, check out the *Comparison of Build Tools* appendix.

## Webpack Relies on Modules

If you think about the smallest project you could bundle with webpack, you’ll end up with input and output. In webpack terms, the bundling process begins from user defined **entries**. Entries themselves are **modules** and can point to other modules through **imports**.

When you bundle a project through webpack, it traverses through imports. As a result, webpack constructs a **dependency graph** of the project and then generates the **output** based on the configuration. It writes everything into a single **bundle** by default, but it can be configured to output more.

Webpack supports ES6, CommonJS, and AMD module formats out of the box. The loader mechanism works for CSS as well, and `@import` and `url()` are supported through *css-loader*. You can also find plugins for specific tasks, such as minification, internationalization, HMR, and so on.

T> A dependency graph describes is a directed graph that describes how nodes relate to each other. In this case the graph definition is defined through references (`require`, `import`) between files. Webpack can traverse this information in a static manner without executing the source to generate the graph it needs to create bundles.

## Loaders Evaluate Modules

Loaders are a crucial part of webpack. When webpack encounters a **module**, it does several things:

1. It **resolves** the module, making sure that the module exists in the supplied location. Webpack provides configuration for adjusting this behavior. The *Consuming Packages* chapter covers techniques related to this. If a module failed to resolve, webpack would give a runtime error.
2. Assuming a module resolved correctly, webpack decides which loaders the module should be passed through. Each loader is configured to match specific modules. This can be based on filetype, location or something else. If a loader is matched, webpack would try to resolve it in a similar way as a module, making sure it exists.
3. If all the loaders were found, webpack evaluates the matched loaders from bottom to top and right to left (`styleLoader(cssLoader('./main.css'))`), running the module through each loader in turn. The *Loader Definitions* chapter covers the topic in detail.
4. If all loader evaluation completed without a runtime error, webpack includes the source in the last bundle. **Plugins** can intercept this behavior and alter the way bundling happens.
5. After every module has been evaluated, webpack writes a bootstrap script including a manifest that describes how to begin executing the result in the browser. This last step can differ based on the build target you are using.

That’s not all there is to the bundling process. For example, you can define specific **split points** where webpack generates separate bundles that are loaded based on application logic. The idea is discussed in the *Code Splitting* chapter.

## Additional Control Through Plugins

Although loaders can do a lot, they don’t provide enough power for more advanced tasks by themselves. **Plugins** allow you to intercept **runtime events** provided by webpack. A good example is bundle extraction performed by `ExtractTextPlugin` which, working in tandem with a loader, extracts CSS files out of the bundle and into a file of its own.

Without this step, CSS would end up in the resulting JavaScript. This is a absolutely important part of Webpack to understand. The fact that a module declares a dependency on another module doesn't mean that this dependency is directly included into the module when it's bundled. The *Separating CSS* chapter discusses this idea in detail.

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

Given the configuration is written in JavaScript, it’s quite malleable. The model makes webpack feel a bit opaque at times, as it can be difficult to understand what it’s doing especially in more complicated cases. Covering this is one of the main reasons why this book exists.

T> To understand webpack on source code level, check out [the artsy webpack tour](https://github.com/TheLarkInn/artsy-webpack-tour).

## Hot Module Replacement

You are likely familiar with tools, such as [LiveReload](http://livereload.com/) or [BrowserSync](http://www.browsersync.io/), already. These tools refresh the browser automatically as you make changes. HMR takes things one step further. In the case of React, it allows the application to maintain its state without forcing a refresh. While this does not sound that special, it makes a big difference in practice.

Note that HMR is available in Browserify via [livereactload](https://github.com/milankinen/livereactload), so it’s not a feature that’s exclusive to webpack.

## Code Splitting

Aside from the HMR feature, webpack’s bundling capabilities are extensive. Webpack allows you to split code in various ways. You can even load code dynamically as your application gets executed. This sort of lazy loading comes in handy, especially for larger applications. You can load dependencies as you need them.

Even small applications can benefit from code splitting, as it allows the users to get something useable in their hands faster. Performance is a feature, after all. Knowing the basic techniques is worthwhile.

## Asset Hashing

With webpack, you can inject a hash to each bundle name (e.g., *app.d587bbd6.js*) to invalidate bundles on the client side as changes are made. Bundle-splitting allows the client to reload only a small part of the data in the ideal case.

## Loaders and Plugins

All these smaller features add up. Surprisingly, you can get many things done out of the box. If you are missing something, there are loaders and plugins available that allow you to go further.

Understanding the difference between loaders and plugins is vital. Loaders operate on module level. You use them to transform modules from shape to another. A loader can also emit a new module. These options are explored in the *Extending with Loaders* chapter.

Plugins operate on a higher level. Webpack itself has been implemented using a collection of plugins. Each plugin encapsulates a small amount of functionality. Plugins communicate together using hooks. They provide the most powerful means to extend webpack and can also be used in tandem with loaders.

## Conclusion

Webpack comes with a significant learning curve. However it’s a tool worth learning, given it saves so much time and effort over the long term. To get a better idea how it compares to other tools, check out [the official comparison](https://webpack.js.org/get-started/why-webpack/#comparison).

Webpack won’t solve everything. It does solve the problem of bundling, however. That’s one less worry during development. Using *package.json* and webpack alone can take you far.

To summarize:

* Webpack is a **module bundler**, but you can also use it for tasks as well.
* **Hot Module Replacement** (HMR) helped to popularize webpack. It's a feature that can enhance development experience by updating code in the browser without a full refresh.
* Webpack relies on a **dependency graph** underneath. Webpack traverses through the source to construct the graph and it uses this information and configuration to generate bundles.
* Webpack’s **configuration** describes how to transform assets of the graphs and what kind of output it should generate. A part of this information can be included in the source itself if features like code splitting are used.
* Webpack can generate **hashes** for filenames allowing you to invalidate bundles as their contents change.
* Webpack relies on **loaders** and **plugins**. Loaders operate on module level while plugins rely on hooks provided by webpack and have the best access to its execution process.

In the following chapters, you’ll examine webpack in more detail as you learn to develop a basic development and build configuration. The later chapters continue further and delve into more advanced topics.
