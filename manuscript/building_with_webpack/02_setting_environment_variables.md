# Setting Environment Variables

React relies on `process.env.NODE_ENV` based optimizations. If we force it to `production`, React will get built in an optimized manner. This will disable some checks (e.g., property type checks). Most importantly it will give you a smaller build and improved performance.

## The Basic Idea of `DefinePlugin`

Webpack provides `DefinePlugin`. It is able to rewrite matching **free variables**. To understand the idea better, consider the example below:

```javascript
var foo;

// Not free, not ok to replace
if(foo === 'bar') {
  console.log('bar');
}

// Free, ok to replace
if(bar === 'bar') {
  console.log('bar');
}
```

If we replaced `bar` with a string like `'bar'`, then we would end up with code like this:

```javascript
var foo;

// Not free, not ok to replace
if(foo === 'bar') {
  console.log('bar');
}

// Free, ok to replace
if('bar' === 'bar') {
  console.log('bar');
}
```

Further analysis shows that `'bar' === 'bar'` equals `true` so UglifyJS gives us:

```javascript
var foo;

// Not free, not ok to replace
if(foo === 'bar') {
  console.log('bar');
}

// Free, ok to replace
if(true) {
  console.log('bar');
}
```

And based on this UglifyJS can eliminate the `if` statement:

```javascript
var foo;

// Not free, not ok to replace
if(foo === 'bar') {
  console.log('bar');
}

// Free, ok to replace
console.log('bar');
```

This is the core idea of `DefinePlugin`. We can toggle parts of code using it using this kind of mechanism. UglifyJS is able to perform the analysis for us and enable/disable entire portions of it as we prefer.

## Setting `process.env.NODE_ENV`

To show you the idea in practice, we could have a declaration like `if(process.env.NODE_ENV === 'development')` within our code. Using `DefinePlugin` we could replace `process.env.NODE_ENV` with `'development'` to make our statement evaluate as true just like above.

As before, we can encapsulate this idea to a function:

**libs/parts.js**

```javascript
...

leanpub-start-insert
exports.setFreeVariable = function(key, value) {
  const env = {};
  env[key] = JSON.stringify(value);

  return {
    plugins: [
      new webpack.DefinePlugin(env)
    ]
  };
}
leanpub-end-insert
```

We can connect this with our configuration like this:

**webpack.config.js**

```javascript
...

// Detect how npm is run and branch based on that
switch(process.env.npm_lifecycle_event) {
  case 'build':
    config = merge(
      common,
      {
        devtool: 'source-map'
      },
leanpub-start-insert
      parts.setFreeVariable(
        'process.env.NODE_ENV',
        'production'
      ),
leanpub-end-insert
      parts.minify(),
      parts.setupCSS(PATHS.app)
    );
    break;
  default:
    ...
}

module.exports = validate(config);
```

Execute `npm run build` again, and you should see improved results:

```bash
[webpack-validator] Config is valid.
Hash: 9880a5782dc874c824c4
Version: webpack 1.13.0
Time: 3004ms
     Asset       Size  Chunks             Chunk Names
    app.js    25.4 kB       0  [emitted]  app
app.js.map     307 kB       0  [emitted]  app
index.html  157 bytes          [emitted]
   [0] ./app/index.js 123 bytes {0} [built]
  [36] ./app/component.js 136 bytes {0} [built]
    + 35 hidden modules
Child html-webpack-plugin for "index.html":
        + 3 hidden modules
```

So we went from 133 kB to 38 kB, and finally, to 25.4 kB. The final build is a little faster than the previous one. As that 25.4 kB can be served gzipped, it is quite reasonable. gzipping will drop around another 40%. It is well supported by browsers.

T> [babel-plugin-transform-inline-environment-variables](https://www.npmjs.com/package/babel-plugin-transform-inline-environment-variables) Babel plugin can be used to achieve the same effect. See [the official documentation](https://babeljs.io/docs/plugins/transform-inline-environment-variables/) for details.

T> Note that we are missing [react-dom](https://www.npmjs.com/package/react-dom) from our build. In practice our React application would be significantly larger unless we are using a lighter version such as [preact](https://www.npmjs.com/package/preact) or [react-lite](https://www.npmjs.com/package/react-lite). These libraries might be missing some features, but they are worth knowing about if you use React.

## Conclusion

Even though simply setting `process.env.NODE_ENV` the right way can help a lot especially with React related code, we can do better. We can split `app` and `vendor` bundles and add hashes to their filenames to benefit from browser caching. After all, the data that you don't need to fetch loads the fastest.
