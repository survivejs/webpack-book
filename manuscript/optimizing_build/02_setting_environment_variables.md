# Setting Environment Variables

Sometimes a part of your code should execute only during development. Or you might have experimental features in your build that are not ready for production yet. This code should not end up in the production build.

As JavaScript minifiers can remove dead code (`if (false)`), we can build on top of this idea and write code that gets transformed into this form. Webpack's `DefinePlugin` enables replacing **free variables** so that we can convert `if (process.env.NODE_ENV === 'development')` kind of code to `if (true)` or `if (false)` depending on the environment.

Many packages rely on this behavior. React is perhaps the most known example of an early adopter of the technique. Using `DefinePlugin` can bring down the size of your React production build somewhat as a result and you may see a similar effect with other packages as well.

## The Basic Idea of `DefinePlugin`

To understand the idea of `DefinePlugin` better, consider the example below:

```javascript
var foo;

// Not free due to "foo" above, not ok to replace
if (foo === 'bar') {
  console.log('bar');
}

// Free since we don't refer to "bar", ok to replace
if (bar === 'bar') {
  console.log('bar');
}
```

If we replaced `bar` with a string like `'foobar'`, then we would end up with code like this:

```javascript
var foo;

// Not free due to "foo" above, not ok to replace
if (foo === 'bar') {
  console.log('bar');
}

// Free since we don't refer to "bar", ok to replace
if ('foobar' === 'bar') {
  console.log('bar');
}
```

Further analysis shows that `'bar' === 'bar'` equals `true` so a minifier gives us:

```javascript
var foo;

// Not free due to "foo" above, not ok to replace
if (foo === 'bar') {
  console.log('bar');
}

// Free since we don't refer to "bar", ok to replace
if (false) {
  console.log('bar');
}
```

And based on this a minifier can eliminate the `if` statement as it has become dead code:

```javascript
var foo;

// Not free, not ok to replace
if (foo === 'bar') {
  console.log('bar');
}

// if (false) means the block can be dropped entirely
```

This is the core idea of `DefinePlugin`. We can toggle parts of code using this kind of mechanism. A good minifier is able to perform the analysis for us and enable/disable entire portions of it as we prefer.

## Setting `process.env.NODE_ENV`

Given we are using React in our project and it happens to use the technique, we can try to enable `DefinePlugin` and see what it does to our production build.

As before, encapsulate this idea to a function. It is important to note that given the way webpack replaces the free variable, we should push it through `JSON.stringify`. We'll end up with a string like `'\"demo\"' and then webpack will insert that into the slots it finds.

**webpack.parts.js**

```javascript
...

leanpub-start-insert
exports.setFreeVariable = function(key, value) {
  const env = {};
  env[key] = JSON.stringify(value);

  return {
    plugins: [
      new webpack.DefinePlugin(env),
    ],
  };
};
leanpub-end-insert
```

We can connect this with our configuration like this:

**webpack.config.js**

```javascript
...

module.exports = function(env) {
  if (env === 'production') {
    return merge([
      common,
      {
        output: {
          // Tweak this to match your GitHub project name
          publicPath: '/webpack-demo/',
        },
      },
leanpub-start-insert
      parts.setFreeVariable(
        'process.env.NODE_ENV',
        'production'
      ),
leanpub-end-insert
      parts.clean(PATHS.build),
      ...
    ]);
  }

  ...
};
```

Execute `npm run build` again, and you should see improved results:

```bash
Version: webpack 2.2.0-rc.3
Time: 2435ms
      Asset       Size  Chunks             Chunk Names
       0.js  130 bytes       0  [emitted]
     app.js  525 bytes       1  [emitted]  app
  vendor.js    21.1 kB       2  [emitted]  vendor
    app.css    2.18 kB       1  [emitted]  app
app.css.map   84 bytes       1  [emitted]  app
 index.html  316 bytes          [emitted]
   [5] ./~/react/react.js 56 bytes {2} [built]
  [15] ./app/component.js 360 bytes {1} [built]
  [16] ./app/main.css 41 bytes {1} [built]
```

We went from 141 kB to 42 kB, and finally, to 21.1 kB. The final build is a little faster than the previous one as well.

Given the 21.1 kB can be served gzipped, it is somewhat reasonable. gzipping will drop around another 40% and it is well supported by browsers.

It is good to remember that we didn't include *react-dom* in this case and that would add around 100 kB to the final result. To get back to these figures, we would have to use a lighter alternative such as Preact or react-lite as discussed in the *Configuring React* chapter.

T> [babel-plugin-transform-inline-environment-variables](https://www.npmjs.com/package/babel-plugin-transform-inline-environment-variables) Babel plugin can be used to achieve the same effect. See [the official documentation](https://babeljs.io/docs/plugins/transform-inline-environment-variables/) for details.

T> `webpack.EnvironmentPlugin(['NODE_ENV'])` is a shortcut that allows you to refer to environment variables. It uses `DefinePlugin` internally and can be useful by itself in more limited cases. You can achieve the same effect by passing `process.env.NODE_ENV` to the custom function we made.

## Webpack Optimization Plugins

Webpack includes a collection of optimization related plugins, some of which we'll cover in greater detail in this book. In addition there are a few outside the core. I've listed the most important ones below:

* [compression-webpack-plugin](https://www.npmjs.com/package/compression-webpack-plugin) allows you to push the problem of generating compressed files to webpack. This can potentially save processing time on the server.
* `webpack.optimize.UglifyJsPlugin` discussed in the previous chapter allows you to minify output using different heuristics. Some of them might break code unless you are careful.
* `webpack.optimize.OccurrenceOrderPlugin` sorts module ids so that the most used modules get the shortest numeric ids. This can give slightly better size if you prefer to rely on number based ids over the setup proposed in the book.
* `webpack.optimize.AggressiveSplittingPlugin` allows you to split code into smaller bundles as discussed in the *Splitting Bundles* chapter. This can be particularly useful in HTTP/2 environment.
* `webpack.optimize.CommonsChunkPlugin` discussed in the same chapter allows you to extract common dependencies into bundles of their own.
* `webpack.DefinePlugin` allows you to use feature flags in your code and eliminate the redundant code as discussed in this chapter.

## Conclusion

Even though simply setting `process.env.NODE_ENV` the right way can help a lot especially with React-related code, we can do better. Currently our build doesn't benefit on client level cache invalidation.

To achieve this, the build requires placeholders in which webpack can insert hashes that invalidate the files as we update the application.
