# Analyzing Build Statistics

Analyzing build statistics is a good step towards understanding webpack better. Visualizing them helps you to understand the composition of your bundles.

## Configuring Webpack

To get suitable output, you need to do a couple of tweaks to the configuration. Most importantly, you have to enable two flags:

* `--profile` to capture timing-related information. This is optional, but good to set.
* `--json` to make webpack output statistics.

Here's the line of code you need to pipe the output to a file:

**package.json**

```json
"scripts": {
leanpub-start-insert
  "stats": "webpack --env production --profile --json > stats.json",
leanpub-end-insert
  ...
},
```

The above is the basic setup you need, regardless of your webpack configuration. Execute `npm run stats` now. After a while you should find *stats.json* at your project root. This file can be pushed through a variety of tools to understand better what's going on.

T> To understand why webpack includes a specific module to the build while processing, pass `--display-reasons` flag to it. Example: `npm run build -- --display-reasons`.

W> Given you piggyback on the production target in the current setup, this process cleans the build directory! If you want to avoid that, set up a separate target where you don't clean.

### Node API

Stats can be captured through Node. Since stats can contain errors, so it's a good idea to handle that case separately:

```javascript
const webpack = require("webpack");
const config = require("./webpack.config.js")("production");

webpack(config, (err, stats) => {
  if (err) {
    return console.error(err);
  }

  if (stats.hasErrors()) {
    return console.error(stats.toString("errors-only"));
  }

  console.log(stats);
});
```

This technique can be valuable if you want to do further processing on stats although often the other solutions are enough.

### `StatsWebpackPlugin` and `WebpackStatsPlugin`

If you want to manage stats through a plugin, check out [stats-webpack-plugin](https://www.npmjs.com/package/stats-webpack-plugin). It gives you a bit more control over the output. You can use it to exclude certain dependencies from the output.

[webpack-stats-plugin](https://www.npmjs.com/package/webpack-stats-plugin) is another option. It allows you to transform the data before outputting it.

## Available Analysis Tools

Even though having a look at the file itself gives you idea of what's going on, often it's preferable to use a particular tool for that. Consider the following.

### The Official Analyse Tool

![The Official Analyse Tool](images/analyse.png)

[The official analyse tool](https://github.com/webpack/analyse) gives you recommendations and a good idea of your application's dependency graph. It can be run locally as well.

### Webpack Visualizer

![Webpack Visualizer](images/webpack-visualizer.png)

[Webpack Visualizer](https://chrisbateman.github.io/webpack-visualizer/) provides a pie chart showing your bundle composition allowing to understand which dependencies contribute to the size of the overall result.

### `DuplicatePackageCheckerPlugin`

[duplicate-package-checker-webpack-plugin](https://www.npmjs.com/package/duplicate-package-checker-webpack-plugin) warns you if it finds single package multiple times in your build. This situation can be hard to spot otherwise.

### Webpack Chart

![Webpack Chart](images/webpack-chart.png)

[Webpack Chart](https://alexkuz.github.io/webpack-chart/) is another similar visualization.

### webpack-unused

[webpack-unused](https://www.npmjs.com/package/webpack-unused) prints out unused files and can be used to understand which assets are no longer used and can be removed from the project.

### Stellar Webpack

![Stellar Webpack](images/stellar-webpack.jpg)

[Stellar Webpack](https://alexkuz.github.io/stellar-webpack/) gives a universe based visualization and allows you to examine your application in a 3D form.

### webpack-bundle-tracker

[webpack-bundle-tracker](https://www.npmjs.com/package/webpack-bundle-tracker) can capture data while webpack is compiling. It uses JSON for this purpose.

### webpack-bundle-analyzer

![webpack-bundle-analyzer](images/webpack-bundle-analyzer.jpg)

[webpack-bundle-analyzer](https://www.npmjs.com/package/webpack-bundle-analyzer) provides a zoomable treemap.

{pagebreak}

### webpack-bundle-size-analyzer

[webpack-bundle-size-analyzer](https://www.npmjs.com/package/webpack-bundle-size-analyzer) gives a text based composition.

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

### inspectpack

[inspectpack](https://www.npmjs.com/package/inspectpack) can be used for figuring out specific places of code to improve. The example below performs duplication analysis:

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

{pagebreak}

## Duplication Analysis

In addition to inspectpack, there are other tools for figuring out duplicates:

* [bundle-duplicates-plugin](https://www.npmjs.com/package/bundle-duplicates-plugin) operates on a function level.
* [find-duplicate-dependencies](https://www.npmjs.com/package/find-duplicate-dependencies) achieves the same on a npm package level.
* [depcheck](https://www.npmjs.com/package/depcheck) goes further and warns if there are useless dependencies or dependencies missing from the project.
* [bundle-buddy](https://www.npmjs.com/package/bundle-buddy) can find duplicates across bundles while providing a user interface to tune webpack code splitting behavior. [bundle-buddy-webpack-plugin](https://www.npmjs.com/package/bundle-buddy-webpack-plugin) makes it simpler to use.

## Independent Tools

In addition to tools that work with webpack output, there are a couple that are webpack agnostic and worth a mention.

### source-map-explorer

[source-map-explorer](https://www.npmjs.com/package/source-map-explorer) is a tool independent from webpack. It allows you to get insight into your build by using source maps. It gives a treemap based visualization showing what code contributes to the result.

### madge

![madge](images/madge.png)

[madge](https://www.npmjs.com/package/madge) is another independent tool that can output a graph based on module input. The graph output allows you to understand the dependencies of your project in greater detail.

{pagebreak}

## Conclusion

When you are optimizing the size of your bundle output, these tools are invaluable. The official tool has the most functionality, but even a basic visualization can reveal problem spots. You can use the same technique with old projects to understand their composition.

To recap:

* Webpack allows you to extract a JSON file containing information about the build. The information can include the build composition and timing.
* The generated information can be analyzed using various tools that give insight into aspects such as the bundle composition.
* Understanding the bundles is the key to insights on how to optimize the overall size, what to load and when. It can also reveal bigger issues, such as redundant data.
* You can find third party tools that don't depend on webpack but are still valuable for analysis.

You'll learn to tune webpack performance in the next chapter.
