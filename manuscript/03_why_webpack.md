# Why Webpack?

Why would you use webpack over tools like Gulp or Grunt? It's not an either-or proposition. Webpack deals with the difficult problem of bundling, but there's so much more. I picked up webpack because of its support for **Hot Module Replacement** (HMR).

You can use webpack with task runners and let it tackle the hardest part. The community has developed a large number of plugins to support it so it is fair to say that the line between webpack and task runners has become blurred, though. Often, you set up npm scripts to invoke webpack in various ways, and that's enough.

Webpack may be too complex for simple projects: I consider it a power tool. Therefore, it is good to be aware of lighter alternatives and choose the right tool based on the need instead of hype.

Due to HMR, you see webpack quite a bit especially in React-based projects. There are certain niches where it's more popular than others and it has become almost the standard, especially for React.

## Webpack Supports Various Formats

Webpack will traverse through the `require` and `import` statements of your project and will generate the bundles you have defined. It supports ES6, CommonJS, and AMD module formats out of the box.

The loader mechanism works for CSS as well and `@import` is supported. There are also plugins for specific tasks, such as minification, localization, hot loading, and so on.

To give you an example, `require('style-loader!css-loader!./main.css')` loads the contents of *main.css* and processes it through CSS and style loaders from right to left. The result will be inlined to your JavaScript code by default; since this isn't nice for production usage, there's a plugin to extract it as a separate file.

## Webpack Is Configuration Driven

Inline declarations containing loaders tie your source to webpack. This is the reason why it is preferable to set up the loaders at configuration instead. Here is a sample configuration adapted from [the official webpack tutorial](https://webpack.js.org/get-started/):

**webpack.config.js**

```javascript
const webpack = require('webpack');

module.exports = {
  // Where to start bundling
  entry: {
    main: './entry.js'
  },
  // Where to output
  output: {
    // Output to the same directory
    path: __dirname,
    // Capture name from the entry using a pattern.
    filename: '[name].js'
  },
  // How to resolve encountered imports
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  // What extra processing to perform
  plugins: [
    new webpack.optimize.UglifyJsPlugin()
  ],
  // How to adjust module resolution
  resolve: {
    // This would be a good place to monkeypatch packages
    alias: { ... }
  }
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

## Conclusion

In the following chapters, we'll examine webpack in more detail as you will learn to develop a basic development and build configuration. The later chapters delve into more advanced topics. You can use these building blocks you can use to develop your own setup.

You can use webpack with some other tools. It won't solve everything. It does solve the difficult problem of bundling, however. That's one less worry during development. Just using *package.json*, `scripts`, and webpack takes you far, as we will see soon.
