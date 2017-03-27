# What is Webpack

Webpack is a module bundler. You can use a separate task runner while leaving it to take care of bundling, however this line has become blurred as the community has developed plugins for it. Sometimes these plugins are used to perform tasks that are usually done outside of webpack, for example cleaning the build directory or deploying the build.

Webpack became particularly popular with React due to **Hot Module Replacement** (HMR) which helped greatly to popularize webpack and lead to its usage in other environments, such as [Ruby on Rails](https://github.com/rails/webpacker). Despite its name, web pack is not limited to web alone. It can bundle for other targets as well as discussed in the *Build Targets* chapter.

T> If you want to understand build tools and their history in a better detail, check out the *Comparison of Build Tools* appendix.

## Webpack Relies on Modules

The smallest project you could bundle with webpack consists of **input** and **output**. The bundling process begins from user defined **entries**. Entries themselves are **modules** and can point to other modules through **imports**.

When you bundle a project through webpack, it traverses through imports, constructing a **dependency graph** of the project and then generating the **output** based on the configuration. It's possible to define **split points** generating separate bundles within the project code itself.

Webpack supports ES6, CommonJS, and AMD module formats out of the box. The loader mechanism works for CSS as well, and `@import` and `url()` are supported through *css-loader*. You can also find plugins for specific tasks, such as minification, internationalization, HMR, and so on.

T> A dependency graph describes is a directed graph that describes how nodes relate to each other. In this case the graph definition is defined through references (`require`, `import`) between files. Webpack traverses this information in a static manner without executing the source to generate the graph it needs to create bundles.

## Webpack's Execution Process

![Webpack's execution process](images/webpack-process.png)

Webpack begins its work from **entries**. Often these are JavaScript modules where webpack begins its traversal process. During this process webpack evaluates the matches against **loader** configuration that tells how to transform the files.

{pagebreak}

### Resolution Process

An entry itself is a module and when webpack encounters one, it tries to match it against the file system using its `resolve` configuration. You can tell webpack to perform the lookup against specific directories in addition to *node_modules*. It's also possible to adjust the way it matches against file extensions and you can define specific aliases against directories. The *Consuming Packages* chapter covers these ideas in greater detail.

If the resolution pass failed, webpack gives a runtime error. If webpack managed to resolve a file correctly, webpack performs processing over the matched file based on the loader definition. Each loader applies a specific transformation against the module contents.

The way a loader gets matched against a resolved file can be configured in multiple ways including file type and its location in the file system. Webpack provides even more flexible ways to achieve this as you can apply specific transformation against a file based on *where* it was imported to the project.

The same resolution process is performed against webpack's loaders. It allows you to apply similar logic there while it figures out which loader it should use. Loaders have resolve configuration of their own for this reason. If webpack fails to perform a loader lookup, you will get a runtime error.

### Webpack Resolves Against Any File Type

Webpack will resolve against each module it encounters while constructing the dependency graph. If an entry contains dependencies, the process will be performed against each until the traversal has completed. Webpack performs this process against any file type unlike a specialized tool like Babel or Sass compiler.

Webpack gives you control over how to treat different assets it encounters. You can decide to **inline** assets to your JavaScript bundles to avoid requests for example. Webpack also allows you to use techniques, like CSS Modules, to couple styling with components and to avoid issues of standard CSS styling. It's this flexibility which makes webpack valuable.

Although webpack is used mainly to bundle JavaScript, it can capture assets like images or fonts and emit separate files for them. Entries are only a starting point of the bundling process. What webpack emits depends entirely on the way you configure it.

### Evaluation Process

Assuming all loaders were found, webpack evaluates the matched loaders from bottom to top and right to left (`styleLoader(cssLoader('./main.css'))`), running the module through each loader in turn. As a result you get output which webpack will inject in the resulting **bundle**. The *Loader Definitions* chapter covers the topic in detail.

If all loader evaluation completed without a runtime error, webpack includes the source in the last bundle. **Plugins** allow you to intercept **runtime events** at different stages of the bundling process.

Although loaders can do a lot, they don’t provide enough power for advanced tasks by themselves. Plugins intercept **runtime events** provided by webpack. A good example is bundle extraction performed by `ExtractTextPlugin` which, working in tandem with a loader, extracts CSS files out of the bundle and into a file of its own.

Without this step, CSS would end up in the resulting JavaScript as webpack treats all code as JavaScript by default. The extraction idea is discussed in the *Separating CSS* chapter.

### Finishing

After every module has been evaluated, webpack writes **output**. The output includes a bootstrap script with a manifest that describes how to begin executing the result in the browser. The manifest can be extracted to a file of its own as discussed later in the book. The output differs based on the build target you are using and targeting web is not the only option.

That’s not all there is to the bundling process. For example, you can define specific **split points** where webpack generates separate bundles that are loaded based on application logic. The idea is discussed in the *Code Splitting* chapter.

{pagebreak}

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

  // Adjust module resolution algorithm
  resolve: {
    alias: { ... },
  },
};
```

Webpack's configuration model can feel a bit opaque at times as the configuration file can appear monolithic. It can be difficult to understand what it's doing unless you understand the ideas behind it. Providing means to tame configuration is one of the main purposes why this book exists.

T> To understand webpack on source code level, check out [the artsy webpack tour](https://github.com/TheLarkInn/artsy-webpack-tour).

## Hot Module Replacement

You are likely familiar with tools, such as [LiveReload](http://livereload.com/) or [BrowserSync](http://www.browsersync.io/), already. These tools refresh the browser automatically as you make changes. HMR takes things one step further. In the case of React, it allows the application to maintain its state without forcing a refresh. While this does not sound that special, it makes a big difference in practice.

HMR is available in Browserify via [livereactload](https://github.com/milankinen/livereactload), so it’s not a feature that’s exclusive to webpack.

## Code Splitting

Aside from the HMR feature, webpack’s bundling capabilities are extensive. Webpack allows you to split code in various ways. You can even load code dynamically as your application gets executed. This sort of lazy loading comes in handy, especially for larger applications. You can load dependencies as you need them.

Even small applications can benefit from code splitting, as it allows the users to get something useable in their hands faster. Performance is a feature, after all. Knowing the basic techniques is worthwhile.

## Asset Hashing

With webpack, you can inject a hash to each bundle name (e.g., *app.d587bbd6.js*) to invalidate bundles on the client side as changes are made. Bundle-splitting allows the client to reload only a small part of the data in the ideal case.

## Loaders and Plugins

All these smaller features add up. Surprisingly, you can get many things done out of the box. If you are missing something, there are loaders and plugins available that allow you to go further.

Understanding the difference between loaders and plugins is vital. Loaders operate on module level. You use them to transform modules from shape to another. A loader can also emit a new module. These options are explored in the *Extending with Loaders* chapter.

Plugins operate on a higher level. Webpack itself has been implemented using a collection of plugins. Each plugin encapsulates a small amount of functionality. Plugins communicate together using hooks. They provide the most powerful means to extend webpack and can also be used in tandem with loaders. The *Extending with Plugins* chapter shows you how to write plugins yourself.

## Conclusion

Webpack comes with a significant learning curve. However it’s a tool worth learning, given it saves so much time and effort over the long term. To get a better idea how it compares to other tools, check out [the official comparison](https://webpack.js.org/get-started/why-webpack/#comparison).

Webpack won’t solve everything, however, it does solve the problem of bundling. That’s one less worry during development. Using *package.json* and webpack alone can take you far.

To summarize:

* Webpack is a **module bundler**, but you can also use it for tasks as well.
* Webpack relies on a **dependency graph** underneath. Webpack traverses through the source to construct the graph and it uses this information and configuration to generate bundles.
* Webpack relies on **loaders** and **plugins**. Loaders operate on module level while plugins rely on hooks provided by webpack and have the best access to its execution process.
* Webpack’s **configuration** describes how to transform assets of the graphs and what kind of output it should generate. A part of this information can be included in the source itself if features like **code splitting** are used.
* **Hot Module Replacement** (HMR) helped to popularize webpack. It's a feature that can enhance development experience by updating code in the browser without a full refresh.
* Webpack can generate **hashes** for filenames allowing you to invalidate bundles as their contents change.

In the next part of the book you'll learn to construct a development configuration using webpack while learning more about its basic concepts.
