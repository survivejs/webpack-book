# Analyzing Build Statistics

Analyzing build statistics is a good step towards understanding webpack better. We can get statistics from it easily, and we can visualize the statistics using a tool to show us the composition of our bundles.

## Configuring Webpack

To get suitable output, we'll need to do a couple of tweaks to our configuration. We'll need to enable two flags:

* `--profile` to capture timing-related information.
* `--json` to make webpack output those statistics we want.

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

The above is the basic setup you'll need, regardless of your webpack configuration. Execute `npm run stats` now. After a while you should find *stats.json* at your project root. This file can be pushed through a variety of tools to understand better what's going on.

W> Given we piggyback on the production target in our current setup, this process will clean the build directory! If you want to avoid that, set up a separate target where you don't clean.

### `StatsWebpackPlugin` and `WebpackStatsPlugin`

If you want to manage stats through a plugin, check out [stats-webpack-plugin](https://www.npmjs.com/package/stats-webpack-plugin). It gives you a bit more control over the output. You can use it to exclude certain dependencies from the output.

[webpack-stats-plugin](https://www.npmjs.com/package/webpack-stats-plugin) is another option. It allows you to transform the data before outputting it.

### Node API

Stats can be captured through Node. Note that stats can contain errors, so it is a good idea to handle that case separately:

```javascript
const webpack = require('webpack');
const config = require('./webpack.config.js')('production');

webpack(config, (err, stats) => {
  if (err) {
    return console.error(err);
  }

  if (stats.hasErrors()) {
    return console.error(stats.toString('errors-only'));
  }

  console.log(stats);
});
```

This technique can be useful if you want to do further processing on stats although often the other solutions are enough.

## Available Analysis Tools

Even though having a look at the file itself gives you some idea of what's going on, often it's preferable to use a particular tool for that. I've listed alternatives below.

### The Official Analyse Tool

![The Official Analyse Tool](images/analyse.png)

[The official analyse tool](https://github.com/webpack/analyse) gives you recommendations and a good idea of your application dependency graph. It can be run locally as well.

### Webpack Visualizer

![Webpack Visualizer](images/webpack-visualizer.png)

[Webpack Visualizer](https://chrisbateman.github.io/webpack-visualizer/) provides a pie chart showing your bundle composition allowing to understand which dependencies contribute to the size of the overall result.

### Webpack Chart

![Webpack Chart](images/webpack-chart.png)

[Webpack Chart](https://alexkuz.github.io/webpack-chart/) is another similar visualization.

### Stellar Webpack

![Stellar Webpack](images/stellar-webpack.jpg)

[Stellar Webpack](https://alexkuz.github.io/stellar-webpack/) gives a universe based visualization and allows you to examine your application in a 3D form.

### webpack-bundle-analyzer

![webpack-bundle-analyzer](images/webpack-bundle-analyzer.jpg)

[webpack-bundle-analyzer](https://www.npmjs.com/package/webpack-bundle-analyzer) provides a zoomable treemap.

### webpack-bundle-size-analyzer

```bash
$ webpack-bundle-size-analyzer stats.json
react: 93.99 KB (74.9%)
purecss: 15.56 KB (12.4%)
style-loader: 6.99 KB (5.57%)
fbjs: 5.02 KB (4.00%)
object-assign: 1.95 KB (1.55%)
css-loader: 1.47 KB (1.17%)
<self>: 572 B (0.445%)
```

[webpack-bundle-size-analyzer](https://www.npmjs.com/package/webpack-bundle-size-analyzer) gives a text based composition.

### inspectpack

```bash
$ inspectpack --action=duplicates --bundle=bundle.js
## Summary

* Bundle:
    * Path:                /PATH/TO/bundle.js
    * Bytes (min):         1678533
* Missed Duplicates:
    * Num Unique Files:    116
    * Num Extra Files:     131
    * Extra Bytes (min):   253955
    * Pct of Bundle Size:  15 %
```

[inspectpack](https://www.npmjs.com/package/inspectpack) is useful for figuring out specific places of code to improve.

### webpack-bundle-tracker

[webpack-bundle-tracker](https://www.npmjs.com/package/webpack-bundle-tracker) can capture data while webpack is compiling. It uses JSON for this purpose.

### webpack-unused

[webpack-unused](https://www.npmjs.com/package/webpack-unused) prints out unused files and can be used to understand which assets are no longer used and can be removed from the project.

### `DuplicatePackageCheckerPlugin`

[duplicate-package-checker-webpack-plugin](https://www.npmjs.com/package/duplicate-package-checker-webpack-plugin) warns you if it finds single package multiple times in your build. This situation can be hard to spot otherwise.

## Independent Tools

In addition to tools that work with webpack output, there are a couple that are webpack agnostic and worth a mention.

### source-map-explorer

[source-map-explorer](https://www.npmjs.com/package/source-map-explorer) is a tool independent from webpack. It allows you to get insight into your build by using source maps. It gives a treemap based visualization showing what code contributes to the result.

### madge

![madge](images/madge.png)

[madge](https://www.npmjs.com/package/madge) is another independent tool that can output a graph based on module input. The graph output is useful if you want to understand the dependencies of your project in greater detail.

## Conclusion

When you are optimizing the size of your bundle output, these tools are invaluable. The official tool has the most functionality, but even a simple visualization can reveal problem spots. You can use the same technique with old projects to understand their composition.
