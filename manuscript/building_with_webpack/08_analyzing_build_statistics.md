# Analyzing Build Statistics

Analyzing build statistics is a good step towards understanding Webpack better. We can get statistics from it easily and we can visualize them using a tool. This shows us the composition of our bundles.

## Configuring Webpack

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

This is the basic setup you'll need regardless of your Webpack configuration.

To adapt the tutorial configuration to work with the new npm script, we'll want to make sure it evaluates the build output. That gives realistic results to us. Adjust the configuration as follows:

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

leanpub-start-delete
module.exports = validate(config);
leanpub-end-delete
leanpub-start-insert
// Run validator in quiet mode to avoid output in stats
module.exports = validate(config, {
  quiet: true
});
leanpub-end-insert
```

If you execute `npm run stats` now, you should find *stats.json* at your project root after it has finished processing. Even though having a look at the file itself gives you some idea of what's going on, often it's preferable to use a specific tool for that. I've listed a few alternatives below:

* [The official analyse tool](http://webpack.github.io/analyse/) gives you recommendations and a good idea of your application dependency graph. [Source](https://github.com/webpack/analyse).
* [Webpack Visualizer](https://chrisbateman.github.io/webpack-visualizer/) provides a pie chart showing your bundle composition. This is handy for understanding which dependencies contribute to the size of the overall result.
* [Webpack Chart](https://alexkuz.github.io/webpack-chart/) is another similar visualization.
* [robertknight/webpack-bundle-size-analyzer](https://github.com/robertknight/webpack-bundle-size-analyzer) gives a text based composition.

When you are optimizing the size of your bundle output, these tools are invaluable. The official tool has the most functionality, but even a simple visualization can reveal problem spots.

## Webpack Stats Plugin

If you want to manage stats through a plugin, check out [stats-webpack-plugin](https://www.npmjs.com/package/stats-webpack-plugin). It gives you a bit more control over the output. You can use it to exclude certain dependencies from the output for example.

## Conclusion

It is useful to analyze your build output. You can use the same technique with older projects to understand their composition.

To complete our setup, we'll set up a little deployment script that will allow us to push build output to GitHub Pages. In practice you would use something more sophisticated, but it's enough to illustrate the idea.
