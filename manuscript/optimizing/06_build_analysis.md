# Build Analysis

Analyzing build statistics is a good step towards understanding webpack better. The available tooling helps to answer the following questions:

- What's the composition of the project bundles?
- What kind of dependencies do project modules have?
- How does the size of the project change over time?
- Which project modules can be safely dropped?
- Which project modules are duplicates?
- Why is a specific module included to the project bundles?

## Configuring webpack

To make webpack emit analysis information, you should set the `--json` flag and pipe the output to a file as follows:

**package.json**

```json
"scripts": {
leanpub-start-insert
  "build:stats": "webpack --env production --json > stats.json",
leanpub-end-insert
  ...
},
```

The above is the basic setup you need, regardless of your webpack configuration. Execute `npm run build:stats` now. After a while you should find _stats.json_ at your project root. This file can be pushed through a variety of tools to understand better what's going on.

You can also consider using the following flags:

- `--profile` to capture timing-related information. The setting is optional but good to set.
- `--progress` to show how long webpack spent in different stages of the build.

T> To understand why webpack includes a specific module to the build while processing, use [whybundled](https://www.npmjs.com/package/whybundled) or [webpack-why](https://www.npmjs.com/package/webpack-why). `--display-reasons` flag gives more information as well. Example: `npm run build -- --display-reasons`.

W> Given you piggyback on the production target in the current setup; this process cleans the build directory! If you want to avoid that, set up a separate destination where you don't clean.

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

T> If you want JSON output from `stats`, use `stats.toJson()`. To get _verbose_ output, use `stats.toJson("verbose")`. It follows all stat options webpack supports.

T> To mimic the `--json` flag, use `console.log(JSON.stringify(stats.toJson(), null, 2));`. The output is formatted to be readable.

### webpack-stats-plugin and webpack-bundle-tracker

If you want to manage stats through a plugin, check out [webpack-stats-plugin](https://www.npmjs.com/package/webpack-stats-plugin). It gives you control over the output and lets you transform it before writing. You can use it to exclude specific dependencies from the output.

[webpack-bundle-tracker](https://www.npmjs.com/package/webpack-bundle-tracker) can capture data while webpack is compiling. It uses JSON for this purpose.

## Enabling a performance budget

Webpack allows you to define a **performance budget**. The idea is that it gives your build size constraint, which it has to follow. The feature is disabled by default, and the calculation includes extracted chunks to entry calculation.

{pagebreak}

To integrate the feature into the project, adjust the configuration as below:

**webpack.config.js**

```javascript
const productionConfig = merge([
leanpub-start-insert
  {
    performance: {
      hints: "warning", // "error" or false are valid too
      maxEntrypointSize: 50000, // in bytes, default 250k
      maxAssetSize: 100000, // in bytes
    },
  },
leanpub-end-insert
  ...
]);
```

In case your project exceeds the limits, you should see a warning similar to below:

```bash
WARNING in entrypoint size limit: The following entrypoint(s) combined asset size exceeds the recommended limit (48.8 KiB). This can impact web performance.
Entrypoints:
  main (130 KiB)
      runtime.b241.js
      vendor.3be8.js
      main.0166.css
      main.8406.js
```

If you want to enforce a strict limit in a CI environment, set `hints` to `error`. Doing this will fail the build in case it is reached and force the developers either go below the limit or raise a discussion about good limits.

{pagebreak}

## Dependency analysis

It's possible to analyze bundle dependencies in a graphical manner, and many tools exist for this purpose.

### The Official analyse tool

![The official analyse tool](images/analyse.png)

[The official analyse tool](https://github.com/webpack/analyse) gives you recommendations and a good idea of your application's dependency graph. It can be run locally as well.

### webpack-xray

[webpack-xray](https://github.com/akx/webpack-xray) is similar to the official analyse tool while having a modernized UI and support for drilling down in the data.

### Stellar Webpack

![Stellar Webpack](images/stellar-webpack.jpg)

[Stellar Webpack](https://alexkuz.github.io/stellar-webpack/) gives a universe based visualization and allows you to examine your application in a 3D form.

### webpack-deps-tree

[webpack-deps-tree](https://restrry.github.io/webpack-deps-tree/static/) displays webpack module graph. Using the tool you can understand how modules of your bundles are related to each other.

### circular-dependency-plugin

[circular-dependency-plugin](https://www.npmjs.com/package/circular-dependency-plugin) lets you detect cycles in the module graph. Often this implies a bug, and it can be a good idea to refactor cycles out.

### dependency-cruiser

[dependency-cruiser](https://www.npmjs.com/package/dependency-cruiser) is a bundler independent tool for analyzing project dependencies.

### madge

![madge](images/madge.png)

[madge](https://www.npmjs.com/package/madge) is another independent tool that can output a graph based on module input. The graph output allows you to understand the dependencies of your project in greater detail.

{pagebreak}

## Composition analysis

Pie charts, treemaps, and command-line tools let you visualize bundle composition. Studying the generated graphics can generate insights and understand what's contributing to the bundle size.

### Pie charts

![Webpack Visualizer](images/webpack-visualizer.png)

[Webpack Visualizer](https://chrisbateman.github.io/webpack-visualizer/) provides a pie chart showing your bundle composition, allowing to understand which dependencies contribute to the size of the overall result. [Webpack Chart](https://alexkuz.github.io/webpack-chart/) is another similar option.

In addition to providing a pie chart visualization, [Auxpack](http://auxpack.com/) is able to track bundle size over time.

### Treemaps

![webpack-bundle-analyzer](images/webpack-bundle-analyzer.jpg)

[webpack-bundle-analyzer](https://www.npmjs.com/package/webpack-bundle-analyzer) provides a zoomable treemap.

[Webpack Monitor](http://webpackmonitor.com/) is another similar tool with an emphasis on a clear user interface. It's able to provide recommendations on what to improve the build.

[source-map-explorer](https://www.npmjs.com/package/source-map-explorer) is a tool independent of webpack. It allows you to get insight into your build by using source maps. It gives a treemap based visualization showing what code contributes to the result. [bundle-wizard](https://www.npmjs.com/package/bundle-wizard) is another similar tool.

### Command line utilities

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

## Online services

It's possible to integrate bundle analysis to your build process by using [Bundle Analyzer](https://www.bundle-analyzer.com) (free) and [Packtracker](https://packtracker.io/) (commercial). The services integrate well with GitHub and will show up in your pull requests, as it's valuable to have the information visible there.

## Bundle comparison

[@mixer/webpack-bundle-compare](https://www.npmjs.com/package/@mixer/webpack-bundle-compare) lets you compare bundle size over time through a user interface.

[webpack-bundle-diff](https://github.com/smikula/webpack-bundle-diff) operates on a lower level and emits a JSON file with the difference. It could work well with a custom visualization.

[size-plugin](https://github.com/GoogleChromeLabs/size-plugin) prints out the size difference since the last build, and it can be useful during local development.

## Unused files analysis

[unused-webpack-plugin](https://www.npmjs.com/package/unused-webpack-plugin) is able to discover files that aren't used by the webpack build but are included to the project. [remnants](https://www.npmjs.com/package/remnants) is a solution that goes beyond webpack and can be used with other tools as well.

## Duplication analysis

In addition to inspectpack, there are other tools for figuring out duplicates:

- [bundle-duplicates-plugin](https://www.npmjs.com/package/bundle-duplicates-plugin) operates on a function level.
- [find-duplicate-dependencies](https://www.npmjs.com/package/find-duplicate-dependencies) achieves the same on an npm package level.
- [depcheck](https://www.npmjs.com/package/depcheck) goes further and warns if there are redundant dependencies or dependencies missing from the project.
- [bundle-buddy](https://www.npmjs.com/package/bundle-buddy) can find duplicates across bundles while providing a user interface to tune webpack code splitting behavior. [bundle-buddy-webpack-plugin](https://www.npmjs.com/package/bundle-buddy-webpack-plugin) makes it simpler to use.

[duplicate-package-checker-webpack-plugin](https://www.npmjs.com/package/duplicate-package-checker-webpack-plugin) warns you if it finds single package multiple times in your build. This situation can be hard to spot otherwise.

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

The tool also comes with a plugin you can attach directly to your configuration in case you prefer to perform the check during the build.

## Understanding why a module was bundled

[whybundled](https://www.npmjs.com/package/whybundled) has been designed to answer the question why a specific module was included to the bundles.

{pagebreak}

## Conclusion

When you are optimizing the size of your bundle output, these tools are invaluable. The official tool has the most functionality, but even basic visualization can reveal problem spots. You can use the same technique with old projects to understand their composition.

To recap:

- Webpack allows you to extract a JSON file containing information about the build. The data can include build composition and timing.
- The generated data can be analyzed using various tools that give insight into aspects such as the bundle composition.
- **Performance budget** allows you to set limits to the build size. Maintaining a budget can keep developers more conscious of the size of the generated bundles.
- Understanding the bundles is the key to optimizing the overall size, what to load and when. It can also reveal more significant issues, such as redundant data.

You'll learn to tune webpack performance in the next chapter.
