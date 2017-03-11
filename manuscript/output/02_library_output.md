# Library Output

The example of the previous chapter can be expanded further to study webpack's library output options in detail.

The library target is controlled through the `output.libraryTarget` field. `output.library` comes into play as well and individual targets have additional fields related to them.

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

This tells it generates `var <output.library> = <webpack bootstrap>` kind of code and also explains why importing the code from Node does not give access to any functionality.

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

The code works through a convention, but there are better ways later in the chapter.

T> You can try running the other examples through Node like this or you can set up a standalone script to execute through it to reach the same results.

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

The CommonJS specific targets are handy when it comes to Node. There are two options: `commonjs` and `commonjs2`. These refer to different interpretations of the [CommonJS specification](http://wiki.commonjs.org/wiki/CommonJS). Let's explore the difference.

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

The library name, `Demo`, isn't used anywhere. As a result importing the module yields this:

```javascript
{ add: [Getter] }
```

You lose the extra wrapping in the second option.

## AMD

If you remember [RequireJS](http://requirejs.org/), you recognize the AMD format it uses. In case you can use the `amd` target, you get output like this:

**dist/lib.js**

```javascript
define("Demo", [], function() { return /******/ (function(modules) { // webpackBootstrap
...
```

In other words, webpack has generated a named AMD module. The result doesn't work from Node as there is no support for the AMD format.

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

There's a lot to digest, but primarily the code performs checks based on the environment and figures out what kind of export to use. The first case covers Node, the second is for AMD, the third one for Node again, while the last one includes a global environment.

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

To understand `umd2` option, you have to understand *optional externals* first.

### Optional Externals

In webpack terms, externals are dependencies that are resolved outside of webpack and are available through the environment. Optional externals are dependencies that can exist in the environment, but if they don't, they get skipped instead of failing hard.

Consider the following example where jQuery is loaded if it exists:

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

To treat jQuery as an external, you should configure as follows:

```javascript
{
  externals: {
    jquery: 'jQuery',
  },
},
```

If `libraryTarget: 'umd'` is used, you would get output like this:

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

You can see one important difference: the AMD block contains more code than earlier. The output follows non-standard Knockout.js convention as [discussed in the related pull request](https://github.com/webpack/webpack/pull/362).

In most of the cases using `output.libraryTarget: 'umd'` is enough as optional dependencies and AMD tend to be a rare configuration especially if you use modern technologies.

## JSONP

There's one more output option: `jsonp`. It generates output like this:

**dist/lib.js**

```javascript
Demo(/******/ (function(modules) { // webpackBootstrap
...
```

In short, `output.library` maps to the JSONP function name. The idea is that you could load a file like this across domains and have it call the named function. Specific APIs implement the pattern although there is no official standard for it.

## SystemJS

[SystemJS](https://www.npmjs.com/package/systemjs) is an emerging standard that's starting to get more attention. [webpack-system-register](https://www.npmjs.com/package/webpack-system-register) plugin allows you to wrap your output in a `System.register` call making it compatible with the scheme.

If you want to support SystemJS this way, set up another build target where to generate a bundle for it.

## Conclusion

Webpack supports a large variety of library output formats. `umd` is the most valuable for a package author. The rest are more specialized and require specific use cases to be valuable.

To recap:

* Most often `umd` is all you need. The other library targets exist more specialized usage in mind.
* The CommonJS variants are handy if you target only Node or consume the output through bundlers alone. UMD implements support for CommonJS, AMD, and globals.
* It's possible to target SystemJS through a plugin. Webpack does not support it out of the box.

You learn to manage multi-page setups in the next chapter.
