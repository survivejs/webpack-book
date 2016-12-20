# Analyzing Build Statistics

Analyzing build statistics is a good step towards understanding webpack better. We can get statistics from it easily and we can visualize them using a tool. This shows us the composition of our bundles.

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
    "stats": "webpack --env production --profile --json > stats.json",
leanpub-end-insert
    ...
  },
  ...
}
```

This is the basic setup you'll need regardless of your webpack configuration. Given our configuration matches to `env`, you execute `npm run stats` now. After a while you should find *stats.json* at your project root.

Even though having a look at the file itself gives you some idea of what's going on, often it's preferable to use a specific tool for that. I've listed a few alternatives below:

* [The official analyse tool](http://webpack.github.io/analyse/) gives you recommendations and a good idea of your application dependency graph. [Source](https://github.com/webpack/analyse).
* [Webpack Visualizer](https://chrisbateman.github.io/webpack-visualizer/) provides a pie chart showing your bundle composition. This is handy for understanding which dependencies contribute to the size of the overall result.
* [Webpack Chart](https://alexkuz.github.io/webpack-chart/) is another similar visualization.
* [Stellar Webpack](https://alexkuz.github.io/stellar-webpack/) gives a universe based visualization and allows you to examine your application in a 3D form.
* [th0r/webpack-bundle-analyzer](https://github.com/th0r/webpack-bundle-analyzer) provides a zoomable treemap.
* [robertknight/webpack-bundle-size-analyzer](https://github.com/robertknight/webpack-bundle-size-analyzer) gives a text based composition.
* [inspectpack](https://github.com/formidablelabs/inspectpack) is useful for figuring out specific places of code to improve.
* [webpack-unused](https://www.npmjs.com/package/webpack-unused) can be used to understand which assets are no longer used and can be removed from the project.

When you are optimizing the size of your bundle output, these tools are invaluable. The official tool has the most functionality, but even a simple visualization can reveal problem spots.

T> [source-map-explorer](https://www.npmjs.com/package/source-map-explorer) is a tool independent from webpack. It allows you to get insight into your build by using sourcemaps. It gives a treemap based visualization showing what code contributes to the result.

T> [madge](https://www.npmjs.com/package/madge) is another independent tool that can output a graph based on module input. This is useful if you want to understand the dependencies of your project in a greater detail.

## Webpack Stats Plugin

If you want to manage stats through a plugin, check out [stats-webpack-plugin](https://www.npmjs.com/package/stats-webpack-plugin). It gives you a bit more control over the output. You can use it to exclude certain dependencies from the output for example.

## Conclusion

It is useful to analyze your build output. You can use the same technique with older projects to understand their composition.

To complete our setup, we'll set up a little deployment script that will allow us to push build output to GitHub Pages. In practice you would use something more sophisticated, but it's enough to illustrate the idea.
