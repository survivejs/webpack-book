# Formats Supported

Webpack supports a large variety of formats through *loaders*. In addition, it supports a couple of JavaScript module formats out of the box. Generally, the idea is always the same. You always set up a loader, or loaders, and connect those with your directory structure. The system relies on configuration. Consider the example below where we set Webpack to load CSS:

**webpack.config.js**

```javascript
...

module.exports = {
  ...
  module: {
    loaders: [
      {
        // Match files against RegExp
        test: /\.css$/,

        // Apply loaders against it. These need to
        // be installed separately. In this case our
        // project would need *style-loader* and *css-loader*.
        loaders: ['style', 'css'],

        // Restrict matching to a directory. This also accepts an array of paths.
        // Although optional, I prefer to set this (better performance,
        // clearer configuration).
        include: path.join(__dirname, 'app')
      }
    ]
  }
};
```

Webpack's loader definition is almost too flexible. I'll cover variants in the next chapter. Before that we can take a quick look at JavaScript module formats supported by Webpack.

T> If you are not sure how a particular RegExp matches, consider using an online tool, such as [regex101](https://regex101.com/).

## JavaScript Module Formats Supported by Webpack

Webpack allows you to use different module formats, but under the hood they all work the same way. Most importantly you get CommonJS and AMD support out of the box. Webpack 2 will support ES6 module definition as well. For now, you have to stick with [Babel](https://babeljs.io) and [babel-loader](https://www.npmjs.org/package/babel-loader) to attain ES6 support.

I'll give you brief examples of the modules supported next so you have a better idea of what they look like. I consider CommonJS and AMD legacy formats. If possible, stick to ES6. Due to the definition characteristics, it's not entirely comparable with CommonJS, but it's enough for most use cases.

### CommonJS

If you have used Node.js, it is likely that you are familiar with CommonJS already. Here's a brief example:

```javascript
var MyModule = require('./MyModule');

// export at module root
module.exports = function() { ... };

// alternatively, export individual functions
exports.hello = function() {...};
```

### ES6

ES6 is the format we all have been waiting for since 1995. As you can see, it resembles CommonJS a little bit and is quite clear!

```javascript
import MyModule from './MyModule.js';

// export at module root
export default function () { ... };

// or export as module function,
// you can have multiple of these per module
export function hello() {...};
```

T> Webpack doesn't support this format out of the box yet so you will have to use [babel-loader](https://www.npmjs.com/package/babel-loader). Webpack 2 will change the situation.

### AMD

AMD, or asynchronous module definition, was invented as a workaround and popularized by [RequireJS](http://requirejs.org/) script loader. It introduced a `define` wrapper:

```javascript
define(['./MyModule.js'], function (MyModule) {
  // export at module root
  return function() {};
});

// or
define(['./MyModule.js'], function (MyModule) {
  // export as module function
  return {
    hello: function() {...}
  };
});
```

Incidentally, it is possible to use `require` within the wrapper like this:

```javascript
define(['require'], function (require) {
  var MyModule = require('./MyModule.js');

  return function() {...};
});
```

This latter approach definitely eliminates some of the clutter. You will still end up with some code that might feel redundant. Given there's ES6 now, it probably doesn't make much sense to use AMD anymore unless you really have to.

### UMD

UMD, universal module definition, takes it all to the next level. It is a monster of a format that aims to make the aforementioned formats compatible with each other. I will spare your eyes from it. Never write it yourself, leave it to the tools. If that didn't scare you off, check out [the official definitions](https://github.com/umdjs/umd).

Webpack can generate UMD wrappers for you (`output.libraryTarget: 'umd'`). This is particularly useful for package authors. We'll get back to this later in the *Authoring Packages* chapter.

## Conclusion

Webpack supports a large variety of file formats. More often than not you will have to install some loader. Webpack itself supports just a couple of common JavaScript module formats.

I will discuss Webpack's loader definitions in detail next.
