# Minifying Build

So far, we haven't given thought to our build output and no doubt it's going to be a little chunky, especially as we included React in it. We can apply a variety of techniques to bring down the size of the vendor bundle. We can also leverage client level caching and load certain assets lazily as we saw earlier.

**Minification** is a process where code is simplified without losing any meaning that matters to the interpreter. As a result, your code will most likely look quite jumbled and it will be hard to read. But that's the point.

T> Even if we minify our build, we can still generate source maps through the `devtool` option we discussed earlier. This will give us better means to debug, even production code if we want.

## Generating a Baseline Build

To get started, we should generate a baseline build so we have something to optimize. Execute `npm run build`. You should end up with something like this:

```bash
Hash: 68893abb76c6fcca56cc
Version: webpack 2.2.0
Time: 2016ms
        Asset       Size  Chunks             Chunk Names
         0.js  313 bytes       0  [emitted]
       app.js    2.34 kB       1  [emitted]  app
    vendor.js     141 kB       2  [emitted]  vendor
      app.css     2.2 kB       1  [emitted]  app
     0.js.map  233 bytes       0  [emitted]
   app.js.map    2.58 kB       1  [emitted]  app
  app.css.map   84 bytes       1  [emitted]  app
vendor.js.map     167 kB       2  [emitted]  vendor
   index.html  316 bytes          [emitted]
   [0] ./~/process/browser.js 5.3 kB {2} [built]
   [3] ./~/react/lib/ReactElement.js 11.2 kB {2} [built]
   [7] ./~/react/react.js 56 bytes {2} [built]
...
```

141 kB for a vendor bundle is a lot! Minification should bring down the size quite a bit.

## Enabling a Performance Budget

Webpack provides a feature known as a **performance budget**. The idea is that it will give your build size constraint which it has to follow. You can configure it per entry and asset. It can terminate entire build if the budget isn't met and you can also run it in warning mode. Adjust the configuration like this:

**webpack.config.js**

```javascript
...

module.exports = function(env) {
  if (env === 'production') {
    return merge([
      common,
leanpub-start-insert
      {
        performance: {
          hints: 'warning', // 'error' or false too
          maxEntrypointSize: 100000, // in kB
          maxAssetSize: 50000, // in kB
        },
      },
leanpub-end-insert
      parts.clean(PATHS.build),
      ...
    ]);
  }

  ...
};
```

If you build now (`npm run build`), you should see a warning like this within the output:

```bash
...

WARNING in asset size limit: The following asset(s) exceed the recommended size limit (50 kB).
This can impact web performance.
Assets:
  vendor.js (136 kB)

WARNING in entrypoint size limit: The following entrypoint(s) combined asset size exceeds the recommended limit (100 kB). This can impact web performance.
Entrypoints:
  app (146 kB)
     vendor.js
,      app.js
,      app.css
,
  vendor (141 kB)
     vendor.js

...
```

If we do our work right, we will meet the given budget and eliminate this warning as we develop the configuration.

## Minifying Code

Ideally, minification will convert our code into a smaller format without losing any meaning. Usually this means some amount of rewriting code through predefined transformations. Good examples of this include renaming variables or even removing entire blocks of code based on the fact that they are unreachable like an `if (false)` statement.

Sometimes minification can break code as it can rewrite pieces of code you inadvertently depend upon. Angular 1 was an example of this as it relied on a specific function parameter naming and rewriting the parameters could break code unless you took precautions against it.

The easiest way to enable minification in webpack is to call `webpack -p`. `-p` is a shortcut for `--optimize-minimize`, you can think it as `-p` for "production". Alternately, we can use a plugin directly as this provides us more control.

### Setting Up Minification

As earlier, we can define a little function for this purpose and then point to it from our main configuration. By default, UglifyJS will output a lot of warnings and they don't provide value in this case, so we'll be disabling them in our setup. Here's the basic idea:

**webpack.parts.js**

```javascript
...

leanpub-start-insert
exports.minifyJavaScript = function({ useSourceMap }) {
  return {
    plugins: [
      new webpack.optimize.UglifyJsPlugin({
        sourceMap: useSourceMap,
        compress: {
          warnings: false,
        },
      })
    ]
  };
};
leanpub-end-insert
```

Now we can hook it up with our configuration:

**webpack.config.js**

```javascript
...

module.exports = function(env) {
  if (env === 'production') {
    return merge([
      common,
      parts.clean(PATHS.build),
leanpub-start-insert
      parts.minifyJavaScript({ useSourceMap: true }),
leanpub-end-insert
      ...
    ]);
  }

  ...
};
```

If you execute `npm run build` now, you should see smaller results:

```bash
Hash: 68893abb76c6fcca56cc
Version: webpack 2.2.0
Time: 2553ms
        Asset       Size  Chunks             Chunk Names
         0.js  160 bytes       0  [emitted]
       app.js  557 bytes       1  [emitted]  app
    vendor.js    41.9 kB       2  [emitted]  vendor
      app.css     2.2 kB       1  [emitted]  app
     0.js.map  769 bytes       0  [emitted]
   app.js.map     4.8 kB       1  [emitted]  app
  app.css.map   84 bytes       1  [emitted]  app
vendor.js.map     343 kB       2  [emitted]  vendor
   index.html  316 bytes          [emitted]
   [0] ./~/process/browser.js 5.3 kB {2} [built]
   [3] ./~/react/lib/ReactElement.js 11.2 kB {2} [built]
   [7] ./~/react/react.js 56 bytes {2} [built]
...
```

Given it needs to do more work, it took longer to execute the build. But on the plus side the build is significantly smaller now and our vendor build went from 141 kB to roughly 42 kB.

T> UglifyJS warnings can help you to understand how it processes the code. Therefore, it may be beneficial to have a peek at the full output every once in a while.

T> There's a standalone version of the plugin known as [uglifyjs-webpack-plugin](https://www.npmjs.com/package/uglifyjs-webpack-plugin). It allows you to control the version of UglifyJS you are using.

## Tree Shaking

Webpack supports a feature enabled by the ES6 module definition known as **tree shaking**. The idea is that given it is possible to analyze the module definition in a static way without running it, webpack can tell which parts of the code are being used and which are not. It is possible to verify this behavior by expanding the application a little and adding code there that should be eliminated.

Adjust the component as follows:

**app/component.js**

```javascript
leanpub-start-delete
export default function () {
leanpub-end-delete
leanpub-start-insert
const component = function () {
leanpub-end-insert
  ...
leanpub-start-delete
}
leanpub-end-delete
leanpub-start-insert
};

const treeShakingDemo = function () {
  return 'this should get shaken out';
};

export {
  component,
  treeShakingDemo,
};
leanpub-end-insert
```

The application entry point needs a slight change as well given the module definition changed:

**app/index.js**

```javascript
import 'react';
import 'purecss';
import './main.css';
leanpub-start-delete
import component from './component';
leanpub-end-delete
leanpub-start-insert
import { component } from './component';
leanpub-end-insert

...
```

If you build the project again (`npm run build`), the vendor bundle should remain exactly the same while the application bundle changes due to the different kind of import. Webpack should pick up the unused code and shake it out of the project.

The same idea works with dependencies that use the ES6 module definition. Given the related packaging standards are still emerging, it is possible you may have to be careful when consuming such packages. Webpack will try to resolve *package.json* `module` field for this purpose. See the *Consuming Packages* chapter for related techniques.

T> If you want to see which parts of the code tree shaking affects, enable warnings at the `UglifyJsPlugin`. In addition to other messages, you should see lines like `Dropping unused variable treeShakingDemo [./app/component.js:17,6]`.

## Controlling UglifyJS through Webpack

An UglifyJS feature known as **mangling** will be enabled by default. The feature will reduce local function and variable names to a minimum, usually to a single character. It can also rewrite properties to a more compact format if configured specifically.

Given these transformations can break your code, you must be a little careful. A good example of this is Angular 1 and its dependency injection system. As it relies on strings, you must be careful not to mangle those or else it will fail to work.

Beyond mangling, it is possible to control all other [UglifyJS features](http://lisperator.net/uglifyjs/) through webpack as illustrated below:

```javascript
new webpack.optimize.UglifyJsPlugin({
  // Don't beautify output (enable for neater output)
  beautify: false,

  // Eliminate comments
  comments: false,

  // Compression specific options
  compress: {
    warnings: false,

    // Drop `console` statements
    drop_console: true
  },

  // Mangling specific options
  mangle: {
    // Don't mangle $
    except: ['$'],

    // Don't care about IE8
    screw_ie8 : true,

    // Don't mangle function names
    keep_fnames: true,
  }
});
```

If you enable mangling, it is a good idea to set `except: ['webpackJsonp']` to avoid mangling the webpack runtime.

T> Dropping the `console` statements can be achieved through Babel too by using the [babel-plugin-remove-console](https://www.npmjs.com/package/babel-plugin-remove-console) plugin. Babel is discussed in greater detail in the *Processing with Babel* chapter.

## Other Solutions

Yet another way to control UglifyJS would be to use the [uglify-loader](https://www.npmjs.com/package/uglify-loader). That gives yet another way to control minification behavior. [webpack-parallel-uglify-plugin](https://www.npmjs.com/package/webpack-parallel-uglify-plugin) allows you to parallelize the minifying step and may yield extra performance as webpack doesn't run in parallel by default.

I've listed a couple of UglifyJS alternatives below:

* [webpack-closure-compiler](https://www.npmjs.com/package/webpack-closure-compiler) runs parallel and may give even smaller result than UglifyJS.
* [babili](https://www.npmjs.com/package/babili) is a Babel specific solution. It can be used either as a CLI tool or through [babili-webpack-plugin](https://www.npmjs.com/package/babili-webpack-plugin).
* [optimize-js-plugin](https://www.npmjs.com/package/optimize-js-plugin) complements the other solutions by wrapping eager functions. The benefit of doing this is that it enhances the way your JavaScript code gets parsed initially. This plugin relies on [optimize-js](https://github.com/nolanlawson/optimize-js) by Nolan Lawson. [v8-lazy-parse-webpack-plugin](https://www.npmjs.com/package/v8-lazy-parse-webpack-plugin) is a similar, highly experimental, plugin doing something similar with V8.

## Minifying CSS

*css-loader* allows minifying CSS through [cssnano](http://cssnano.co/). Minification needs to be enabled explicitly using the `minimize` option. You can also pass [cssnano specific options](http://cssnano.co/optimisations/) to the query to customize the behavior further.

[clean-css-loader](https://www.npmjs.com/package/clean-css-loader) allows you to use a popular CSS minifier known as [clean-css](https://www.npmjs.com/package/clean-css).

[optimize-css-assets-webpack-plugin](https://www.npmjs.com/package/optimize-css-assets-webpack-plugin) is a plugin based option that applies a chosen minifier on CSS assets. Using *extract-text-webpack-plugin* can lead to duplicated CSS given it only merges text chunks. *optimize-css-assets-webpack-plugin* avoids this problem by operating on the generated result and thus can lead to a better result.

W> In webpack 1 `minimize` was set on by default if `UglifyJsPlugin` was used. This confusing behavior was fixed in webpack 2 and now you have explicit control over minification.

## Conclusion

Minification is the simplest step you can take to make your build smaller. However, there are a few more tricks we can perform.
