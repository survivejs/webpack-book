# Setting Environment Variables

React relies on `process.env.NODE_ENV` based optimizations. If we force it to `production`, React will get built in an optimized manner. This will disable some checks (e.g., property type checks). Most importantly it will give you a smaller build and improved performance.

## Setting `process.env.NODE_ENV`

In Webpack terms, you can add the following snippet to the `plugins` section of your configuration:

**webpack.config.js**

```javascript
...

if(TARGET === 'build') {
  module.exports = merge(common, {
    plugins: [
leanpub-start-insert
      // Setting DefinePlugin affects React library size!
      // DefinePlugin replaces content "as is" so we need some
      // extra quotes for the generated code to make sense
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': '"production"'

        // You can set this to '"development"' or
        // JSON.stringify('development') for your
        // development target to force NODE_ENV to development mode
        // no matter what
      }),
leanpub-end-insert
      ...
    ]
  });
}
```

This is a useful technique for your own code. If you have a section of code that evaluates as `false` after this process, the minifier will remove it from the build completely.

Execute `npm run build` again, and you should see improved results:

```bash
Hash: 789597fce7bca3428aa2
Version: webpack 1.12.14
Time: 5232ms
     Asset       Size  Chunks             Chunk Names
 bundle.js     135 kB       0  [emitted]  app
index.html  160 bytes          [emitted]
   [0] ./app/index.js 186 bytes {0} [built]
 [157] ./app/component.js 136 bytes {0} [built]
    + 156 hidden modules
Child html-webpack-plugin for "index.html":
        + 3 hidden modules
```

So we went from 687 kB to 193 kB, and finally, to 135 kB. The final build is a little faster than the previous one. As that 135 kB can be served gzipped, it is quite reasonable. gzipping will drop around another 40%. It is well supported by browsers.

T> [babel-plugin-transform-inline-environment-variables](https://www.npmjs.com/package/babel-plugin-transform-inline-environment-variables) Babel plugin can be used to achieve the same effect. See [the official documentation](https://babeljs.io/docs/plugins/transform-inline-environment-variables/) for details.

## Conclusion

Even though simply setting `process.env.NODE_ENV` the right way can help a lot with React related code, we can do better. We can split `app` and `vendor` bundles and add hashes to their filenames to benefit from browser caching. After all, the data that you don't need to fetch loads the fastest.
