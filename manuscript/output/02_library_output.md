# Library Output

To continue on the example of the previous chapter, there's enough configuration to study webpack's library output options in greater detail.

The library target is controlled through the `output.libraryTarget` field. `output.library` will come into play as well and certain targets have extra fields related to them.

## `var`

The demonstration project of ours uses `var` by default through configuration like this:

**webpack.lib.js**

```javascript
...

const commonConfig = merge([
  {
    ...
    output: {
      path: PATHS.build,
      library: 'Demo',
      libraryTarget: 'var',
    },
  },
  ...
]);

...
```

The output configuration maps `library` and `libraryTarget` to the following form:

**dist/lib.js**

```javascript
var Demo =
/******/ (function(modules) { // webpackBootstrap
...
/******/ })
...
/******/ ([
  ...
/******/ ]);
//# sourceMappingURL=lib.js.map
```

This tells us it will generate `var <output.library> = <webpack bootstrap>` kind of code. This explains why importing the code from Node does not give us access to any functionality.

## `assign`

Changing `output.libraryTarget` to `assign` yields slightly different results:

**dist/lib.js**

```javascript
Demo =
...
```

Effectively `var Demo` becomes `Demo` instead. If you executed this code in the right context, it could associate it to a global `Demo`.

## `this`

Setting `output.libraryTarget` to `this` changes the situation further:

**dist/lib.js**

```javascript
this["Demo"] =
...
```

Now the code would associate to context `this`. You can use the code through Node REPL now (use `node` at project root):

```bash
$ node
> lib = require('./dist/lib')
{ Demo: { add: [Getter] } }
>
```

The code works through convention, but there are better ways later in the chapter.

T> You can try running the other examples through Node like this. Or you can set up a little standalone script to execute through it to reach the same results.

## `window`

`output.libraryTarget = 'window'` associates like this:

**dist/lib.js**

```javascript
window["Demo"] =
...
```

## `global`

`output.libraryTarget = 'global'` is a similar option:

**dist/lib.js**

```javascript
global["Demo"] =
...
```

## CommonJS

The CommonJS specific targets are interesting when it comes to Node. There are two options: `commonjs` and `commonjs2`. These refer to different interpretations of the [CommonJS specification](http://wiki.commonjs.org/wiki/CommonJS). Let's explore the difference.

### `commonjs`

If you used the `commonjs` option, you would end up with code that expects global `exports` in which to associate:

**dist/lib.js**

```javascript
exports["Demo"] =
...
```

If this code was imported from Node, you would get:

```javascript
{ Demo: { add: [Getter] } }
```

### `commonjs2`

`commonjs2` expects a global `module.exports` instead:

**dist/lib.js**

```javascript
module.exports =
...
```

Note that `Demo`, the library name, isn't used anywhere. As a result importing the module yields this:

```javascript
{ add: [Getter] }
```

This is a big difference. You lose the extra wrapping in the second option.

## AMD

If you remember [RequireJS](http://requirejs.org/), you might remember the AMD format it uses. In case we use the `amd` target, we'll get output like this:

**dist/lib.js**

```javascript
define("Demo", [], function() { return /******/ (function(modules) { // webpackBootstrap
...
```

In other words webpack has generated a named AMD module. The result won't work from Node as it does not support AMD.

## UMD

[Universal Module Definition](https://github.com/umdjs/umd) (UMD) was developed to solve the problem of consuming the same code from different environments. Webpack implements two output variants: `umd` and `umd2`. To understand the idea better, let's see what happens when the options are used.

### `umd`

Basic UMD output looks like this:

**dist/lib.js**

```javascript
(function webpackUniversalModuleDefinition(root, factory) {
  if(typeof exports === 'object' && typeof module === 'object')
    module.exports = factory();
  else if(typeof define === 'function' && define.amd)
    define("Demo", [], factory);
  else if(typeof exports === 'object')
    exports["Demo"] = factory();
  else
    root["Demo"] = factory();
})(this, function() {
```

There's a lot to digest, but essentially the code performs checks based on the environment and figures out what kind of an export to use. The first case covers Node, the second is for AMD, the third one for Node again, while the last one covers a global environment.

The output can be modified further by setting `output.umdNamedDefine: false`:

**dist/lib.js**

```javascript
(function webpackUniversalModuleDefinition(root, factory) {
  if(typeof exports === 'object' && typeof module === 'object')
    module.exports = factory();
  else if(typeof define === 'function' && define.amd)
    define([], factory);
  else if(typeof exports === 'object')
    exports["Demo"] = factory();
  else
    root["Demo"] = factory();
})(this, function() {
...
```

In order to understand `umd2` option, you have to understand *optional externals* first.

### Optional Externals

In webpack terms, externals are dependencies that are resolved outside of webpack and will be available through the environment. Optional externals are dependencies that can exist in the environment, but if they don't, they will get skipped instead of failing hard.

Consider the following example where we try to load jQuery if it exists:

**lib/index.js**

```javascript
var optionaljQuery;
try {
  optionaljQuery = require('jquery');
} catch(err) {} // eslint-disable-line no-empty

function add(a, b) {
  return a + b;
}

export {
  add,
};
```

To treat jQuery as an external, we should configure as follows:

```javascript
{
  externals: {
    jquery: 'jQuery',
  },
},
```

If `libraryTarget: 'umd'` is used, we would get output like this:

**dist/lib.js**

```javascript
(function webpackUniversalModuleDefinition(root, factory) {
  if(typeof exports === 'object' && typeof module === 'object')
    module.exports = factory((
      function webpackLoadOptionalExternalModule() {
        try { return require("jQuery"); } catch(e) {}
      }())
    );
  else if(typeof define === 'function' && define.amd)
    define(["jQuery"], factory);
  else if(typeof exports === 'object')
    exports["Demo"] = factory((
      function webpackLoadOptionalExternalModule() {
        try { return require("jQuery"); } catch(e) {}
      }())
    );
  else
    root["Demo"] = factory(root["jQuery"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_0__) {
return /******/ (function(modules) { // webpackBootstrap
...
```

Webpack wrapped the optional externals in `try`/`catch` blocks.

### `umd2`

To understand what the `umd2` option does, consider the following output:

**dist/lib.js**

```javascript
/*! fd0ace9 */
(function webpackUniversalModuleDefinition(root, factory) {
  if(typeof exports === 'object' && typeof module === 'object')
    module.exports = factory((
      function webpackLoadOptionalExternalModule() {
        try { return require("jQuery"); } catch(e) {}
      }())
    );
  else if(typeof define === 'function' && define.amd)
    define([], function webpackLoadOptionalExternalModuleAmd() {
      return factory(root["jQuery"]);
    });
  else if(typeof exports === 'object')
    exports["Demo"] = factory((
      function webpackLoadOptionalExternalModule() {
        try { return require("jQuery"); } catch(e) {}
      }())
    );
  else
    root["Demo"] = factory(root["jQuery"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_0__) {
return /******/ (function(modules) { // webpackBootstrap
```

You can see one important difference: the AMD block contains more code. This follows non-standard Knockout.js convention as [discussed in the related pull request](https://github.com/webpack/webpack/pull/362).

In most of the cases using `output.libraryTarget: 'umd'` is enough as optional dependencies and AMD tend to be a rare configuration especially if you use modern technologies.

## JSONP

There's one more output option: `jsonp`. It generates output like this:

**dist/lib.js**

```javascript
Demo(/******/ (function(modules) { // webpackBootstrap
...
```

In short, `output.library` maps to the JSONP function name. The idea is that you could load a file like this across domains and have it call the named function. Certain APIs implement the pattern although there is no official standard for it.

## SystemJS

[SystemJS](https://github.com/systemjs/systemjs) is an emerging standard that's starting to get more attention. [webpack-system-register](https://www.npmjs.com/package/webpack-system-register) plugin allows you to wrap your output in a `System.register` call making it compatible with the scheme.

If you want to support SystemJS this way, set up another build target where to generate a bundle for it.

## Conclusion

Webpack supports a large variety of library output formats. `umd` is the most useful for a package author. The rest are more specialized and require specific use cases in order to be valuable.

In the next chapter I will discuss the idea of managing multi-page setups as more pages are needed for additional demonstrations.
