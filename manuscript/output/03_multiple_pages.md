# Multiple Pages

Even though webpack is often used for bundling single page applications, it is possible to use it with multiple separate pages as well. The idea is similar to the way we generated multiple output files in the *Targets* chapter. This time, however, we have to generate separate pages. That's achievable through `HtmlWebpackPlugin` and a bit of configuration.

## Possible Approaches

When generating multiple pages with webpack, you have a couple of considerations:

* Go through the *multi-compiler mode* and return an array of configurations. This would work as long as the pages are separate and there is a minimal need for sharing code across them. The benefit of this approach is that you can process it through [parallel-webpack](https://www.npmjs.com/package/parallel-webpack) to improve build performance.
* Set up a single configuration and extract the commonalities. The way you do this can differ depending on how you chunk it up.
* If you follow the idea of Progressive Web Applications (PWA), you can end up with either an **app shell** or a **page shell**.

In practice you may find more dimensions. For example, you have to generate i18n variants for pages. These ideas grow on top of the basic approaches.

## Generating Multiple Pages

To generate multiple separate pages, there should be means to initialize them. We should also be able to return a configuration for each page so webpack will pick them up and process them through the multi-compiler mode.

### Modeling a Configuration Part

In order to initialize a page, it should receive page title, output path, and an optional template at least. Each page should receive optional output path, and a template for customization. The idea can be modeled as a configuration part like this:

**webpack.parts.js**

```javascript
...
leanpub-start-insert
const HtmlWebpackPlugin = require('html-webpack-plugin');
leanpub-end-insert

...

leanpub-start-insert
exports.page = function({
  path = '',
  template = require.resolve('html-webpack-plugin/default_index.ejs'),
  title,
} = {}) {
  return {
    plugins: [
      new HtmlWebpackPlugin({
        filename: `${path && path + '/'}index.html`,
        template,
        title,
      }),
    ],
  };
};
leanpub-end-insert
```

### Integrating to Main Configuration

To integrate the idea to the configuration, the way it is composed has to change. Also a page definition is required. To get started, let's reuse the same JavaScript logic for each page for now:

**webpack.config.js**

```javascript
const path = require('path');
leanpub-start-delete
const HtmlWebpackPlugin = require('html-webpack-plugin');
leanpub-end-delete
...


const commonConfig = merge([
  {
    ...
leanpub-start-delete
    plugins: [
      new HtmlWebpackPlugin({
        title: 'Webpack demo',
      }),
    ],
leanpub-end-delete
  },
]);

...

module.exports = function(env) {
leanpub-start-delete
  if (env === 'production') {
    return merge(commonConfig, productionConfig);
  }

  return merge(commonConfig, developmentConfig);
leanpub-end-delete
leanpub-start-insert
  const pages = [
    parts.page({ title: 'Webpack demo' }),
    parts.page({ title: 'Another demo', path: 'another' }),
  ];
  const config = env === 'production' ? productionConfig : developmentConfig;

  return pages.map(page => merge(commonConfig, config, page));
leanpub-end-insert
};
```

After this change you should have two pages in the application: `/` and `/another`. It should be possible to navigate to both while seeing the same output.

### Injecting Different Script per Page

The question is, how to inject a different script per each page. In the current configuration the same `entry` is shared by both. To solve the problem, we should move `entry` configuration to lower level and manage it per page. To have a script to test with, set up another entry point like this:

**app/another.js**

```javascript
import './main.css';
import component from './component';

let demoComponent = component('Another');

document.body.appendChild(demoComponent);
```

This could go to a directory of its own. Here we reuse the existing code to get something to show up. Webpack configuration has to point to this file:

**webpack.config.js**

```javascript
...

const commonConfig = merge([
  {
leanpub-start-delete
    // Entry accepts a path or an object of entries.
    // We'll be using the latter form given it's
    // convenient with more complex configurations.
    //
    // Entries have to resolve to files! It relies on Node.js
    // convention by default so if a directory contains *index.js*,
    // it will resolve to that.
    entry: {
      app: PATHS.app,
    },
leanpub-end-delete
    ...
  },
  ...
]);

...

module.exports = function(env) {
leanpub-start-delete
  const pages = [
    parts.page({ title: 'Webpack demo' }),
    parts.page({ title: 'Another demo', path: 'another' }),
  ];
leanpub-end-delete
leanpub-start-insert
  const pages = [
    parts.page({
      title: 'Webpack demo',
      entry: {
        app: PATHS.app,
      },
    }),
    parts.page({
      title: 'Another demo',
      path: 'another',
      entry: {
        another: path.join(PATHS.app, 'another.js'),
      },
    }),
  ];
leanpub-end-insert
  const config = env === 'production' ? productionConfig : developmentConfig;

  return pages.map(page => merge(commonConfig, config, page));
};
```

This also requires a change at the related part so that `entry` gets included to the configuration:

**webpack.parts.js**

```javascript
...

exports.page = function({
  ...
leanpub-start-insert
  entry,
leanpub-end-insert
} = {}) {
  return {
leanpub-start-insert
    entry,
leanpub-end-insert
    ...
  };
};
```

After these changes `/another` should show something familiar:

![Another page shows up](images/another.png)

If you build the application (`npm run build`), you should find *another/index.html*. Based on the generated code, we can make the following observations:

* The scripts related to each page should probably belong behind the page paths instead of pointing to the site root. This requires more abstraction. `parts.page` should control entire configuration so there's enough access for injecting the path configuration.
* Records should be written separately per each page in files of their own.
* Processes like linting and cleaning run twice currently. The *Targets* chapter discussed potential solutions to that problem.

The approach can be pushed to another direction by dropping the multi-compiler mode. Even though it's slower to process a build like this, it enables code sharing, and the implementation of shells. The first step towards a shell setup is to rework the configuration so that it picks up the code shared between the pages.

## Generating Multiple Pages While Sharing Code

TODO

## Generating an App Shell

TODO

```
entry for the page

+

new HtmlWebpackPlugin({
  filename: 'index.html',
  template: './src/index.html',
  inject: 'body',
  chunks: ['vendor', 'manifest', 'index']
}),
```

## Generating a Page Shell

TODO

## Conclusion

TODO
