# Analyzing Build Statistics

Analyzing build statistics is a good step towards understanding Webpack better. We can get statistics from it easily and we can visualize them using a tool. This shows us the composition of our bundles.

In order to get suitable output we'll need to do a couple of tweaks to our configuration. We'll need to enable two flags:

* `--profile` to capture timing related information.
* `--json` to make Webpack output those statistics we want.

Here's the line of code we need to pipe the output to a file:

**package.json**

```json
{
  ...
  "scripts": {
leanpub-start-insert
    "stats": "webpack --profile --json > stats.json",
leanpub-end-insert
    ...
  },
  ...
}
```

We also need to make sure we use the correct configuration in this case:

**webpack.config.js**

```javascript
...


// Detect how npm is run and branch based on that
switch(process.env.npm_lifecycle_event) {
  case 'build':
leanpub-start-insert
  case 'stats':
leanpub-end-insert
    config = merge(
      ...
    );
    break;
  default:
    config = merge(
      ...
    );
}

module.exports = validate(config);
```

If you execute `npm run stats` now, you should find *stats.json* at your project root after it has finished processing. We can take this file and pass it to [the online tool](http://webpack.github.io/analyse/). Note that the tool works only over HTTP! If your data is sensitive, consider using [the standalone version](https://github.com/webpack/analyse) instead.

Besides helping you to understand your bundle composition, the tool can help you to optimize your output further.

T> You can achieve similar results through Webpack's Node.js API and there's [a plugin](https://www.npmjs.com/package/stats-webpack-plugin) too.

## Conclusion

There isn't a lot more to say about analyzing the build output. To complete our setup, we could make it possible to push our build output to static hosting like GitHub Pages. In practice you would probably use something more sophisticated, but this is enough for demonstrating simple applications and libraries.
