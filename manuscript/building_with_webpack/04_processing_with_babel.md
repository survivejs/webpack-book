# Processing with Babel

Webpack processes ES6 module definitions by default and transforms them into code looks roughly like this:

**build/app.js**

```javascript
webpackJsonp([1],{

/***/ 19:
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* harmony default export */ exports["a"] = function () {
  const element = document.createElement('h1');

  element.className = 'pure-button';
  element.innerHTML = 'Hello world';
  element.onclick = () => {
    __webpack_require__.e/* import() */(0).then(__webpack_require__.bind(null, 36)).then((lazy) => {
      element.textContent = lazy.default;
    }).catch((err) => {
      console.error(err);
    });
  };

  return element;
};

...
```

It is important to note that it does **not** transform ES6 specific syntax, such as `(lazy) => {` in the example, to ES5! This can be a problem especially on older browsers. It is also problematic if you minify your code through UglifyJS as it doesn't support ES6 syntax yet and will raise an error when it encounters the syntax it doesn't understand.

One way to work around this problem is to process the code through [Babel](https://babeljs.io/), a popular JavaScript compiler that supports ES6 features and more. It resembles ESLint in that it is built on top of presets and plugins. Presets are collections of plugins and you can define your own as well.

T> Given sometimes extending existing presets might not be enough, [modify-babel-preset](https://www.npmjs.com/package/modify-babel-preset) allows you to go a step further and configure the base preset in a more flexible way.

## Using Babel with Webpack

Even though Babel can be used standalone, as you can see in the *Authoring Packages* chapter, you can hook it up with webpack as well. During development we actually might skip processing.

This is a good option especially if you don't rely on any custom language features and work using a modern browser. Processing through Babel becomes almost a necessity when you compile your code for production, though.

You can use Babel with webpack through [babel-loader](https://www.npmjs.com/package/babel-loader). It can pick up project level Babel configuration or you can configure it at the loader itself.

Connecting Babel with a project allows you to process webpack configuration through Babel if you name your webpack configuration following *webpack.config.babel.js* convention. This works with other solutions too as it relies on a package known as [interpret](https://www.npmjs.com/package/interpret).

T> Babel isn't the only option although it is the most popular one. [Bublé](https://buble.surge.sh) by Rich Harris is another commpiler worth checking out. There's experimental [buble-loader](https://www.npmjs.com/package/buble-loader) that allows you to use it with webpack. Bublé doesn't support ES6 modules, but that's not a problem as webpack provides that functionality.

### Setting Up *babel-loader*

The first step towards configuring Babel to work with webpack is to set up [babel-loader](https://www.npmjs.com/package/babel-loader). It will take our code and turn it into a format older browsers can understand. Install *babel-loader* and include its peer dependency *babel-core*:

```bash
npm i babel-loader babel-core --save-dev
```

As usual, let's define a part for Babel:

Here's the full loader configuration:

**webpack.parts.js**

```javascript
...

exports.loadJavaScript = function(paths) {
  return {
    module: {
      rules: [
        {
          test: /\.js$/,
          include: paths,

          loader: 'babel-loader',
          options: {
            // Enable caching for improved performance during
            // development.
            // It uses default OS directory by default. If you need
            // something more custom, pass a path to it.
            // I.e., { cacheDirectory: '<path>' }
            cacheDirectory: true
          }
        }
      ]
    }
  };
};
```

Next we need to connect this with the main configuration. I'll process the code through Babel only during production although it would be possible to do it both for development and production usage.

In addition, I'll constrain webpack to process only our application code through Babel as I don't want it to process files from *node_modules* for example. This helps with performance and it is a good practice with JavaScript files.

**webpack.config.js**

```javascript
...

module.exports = function(env) {
  if (env === 'production') {
    return merge(
      common,
leanpub-start-insert
      parts.loadJavaScript(PATHS.app),
leanpub-end-insert
      parts.extractBundles([
        {
          name: 'vendor',
          entries: ['react']
        }
      ]),
      ...
    );
  }

  ...
};
```

Even though we have Babel installed and set up, we are still missing one bit - Babel configuration. I prefer to handle it using a dotfile known as *.babelrc* as then other tooling can pick it up as well.

W> There are times when caching Babel compilation can surprise you. This can happen particularly if your dependencies change in a way that *babel-loader* default caching mechanism doesn't notice. Override `cacheIdentifier` with a string that has been derived based on data that should invalidate the cache for better control. This is where [Node.js crypto API](https://nodejs.org/api/crypto.html) and especially its MD5 related functions can come in handy.

### Setting Up *.babelrc*

At minimum you will need a package known as [babel-preset-es2015](https://www.npmjs.com/package/babel-preset-es2015). Given our project uses dynamic `import`s and the feature isn't in the standard yet, we need a specific plugin known as [babel-plugin-syntax-dynamic-import](https://www.npmjs.com/package/babel-plugin-syntax-dynamic-import) for that. Install them:

```bash
npm i babel-plugin-syntax-dynamic-import babel-preset-es2015 --save-dev
```

To make Babel aware of them, we need to write a *.babelrc*. Given webpack supports ES6 modules out of the box, we can tell Babel to skip processing them:

**.babelrc**

```json
{
  "plugins": ["syntax-dynamic-import"],
  "presets": [
    [
      "es2015",
      {
        "modules": false
      }
    ]
  ]
}
```

If you execute `npm run build` now and examine *app.js*, you should see something a little different:

```javascript
webpackJsonp([1],{

/***/ 19:
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* harmony default export */ exports["a"] = function () {
  var element = document.createElement('h1');

  element.className = 'pure-button';
  element.innerHTML = 'Hello world';
  element.onclick = function () {
    __webpack_require__.e/* import() */(0).then(__webpack_require__.bind(null, 36)).then(function (lazy) {
      element.textContent = lazy.default;
    }).catch(function (err) {
      console.error(err);
    });
  };

  return element;
};

...
```

Note especially how the function was transformed. This code should work in older browsers now. It would be also possible to push it through UglifyJS without any errors due to parsing.

T> There are other possible [.babelrc options](https://babeljs.io/docs/usage/options/) beyond the ones covered here.

T> Just like ESLint, Babel supports [JSON5](https://www.npmjs.com/package/json5) as its configuration format. This means you can include comments in your source, use single quoted strings, and so on.

W> Sometimes you might want to use experimental features. Although you can find a lot of them within so called stage presets, I recommend enabling them one by one and even organizing them to a preset of their own unless you are working on a throwaway project. If you expect your project to live a long time, it's better to document the features you are using well.

## Polyfilling Features

Given it's not always enough to transform ES6 code to older format and expect it to work, polyfilling may be needed. The simplest way to solve this problem is to include [babel-polyfill](https://babeljs.io/docs/usage/polyfill/) to your project. A simple way to achieve that in webpack is to either include it to an entry (`app: ['babel-polyfill', PATHS.app]`) or `import 'babel-polyfill'` from code to get it bundled.

Especially in bundle size sensitive environments *babel-polyfill* might not be the best option. If you know well which environment (browser versions, Node.js) you support, [babel-preset-env](https://www.npmjs.com/package/babel-preset-env) provides a more granular way to achieve the same result with smaller size.

It is important to note that *babel-polyfill* pollutes the global scope with objects like `Promise`. Given this can be problematic for library authors, there's an option known as [transform-runtime](https://babeljs.io/docs/plugins/transform-runtime/). It can be enabled as a Babel plugin and it will avoid the problem of globals by rewriting the code in such way that they won't be needed.

## Useful Babel Presets and Plugins

Perhaps the greatest thing about Babel is that it's possible to extend with presets and  plugins. I've listed a few interesting ones below:

* [babel-preset-es2015](https://www.npmjs.org/package/babel-preset-es2015) includes ES6/ES2015 features.
* [babel-preset-es2016](https://www.npmjs.org/package/babel-preset-es2016) includes **only** ES7/ES2016 features. Remember to include the previous preset as well if you want both!
* [babel-plugin-import-asserts](https://www.npmjs.com/package/babel-plugin-import-asserts) asserts that your imports have been defined. This is useful outside of webpack as it can lead to less cryptic errors to debug.
* [babel-plugin-log-deprecated](https://www.npmjs.com/package/babel-plugin-log-deprecated) adds `console.warn` to functions that have `@deprecate` annotation in their comment.
* [babel-plugin-annotate-console-log](https://www.npmjs.com/package/babel-plugin-log-annotate-console-log) annotates `console.log` calls with information about invocation context so it's easier to see where they logged.
* [babel-plugin-webpack-loaders](https://www.npmjs.com/package/babel-plugin-webpack-loaders) allows you to use many webpack loaders through Babel.

## Conclusion

Babel has become an indispensable tool for many developers given it bridges the standard with older browsers. Even if you targeted modern browsers, transforming through Babel may be a necessity if you use UglifyJS.
