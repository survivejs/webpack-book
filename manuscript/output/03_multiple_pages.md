# Multiple Pages

Even though webpack is often used for bundling single page applications, it is possible to use it with multiple separate pages as well. The idea is similar to the way we generated multiple output files in the *Targets* chapter. This time, however, we have to generate separate pages. That's achievable through `HtmlWebpackPlugin` and a bit of configuration.

## Possible Approaches

When generating multiple pages with webpack, you have a couple of directions to consider:

* Go through the *multi-compiler mode* and return an array of configurations. This would work as long as the pages are separate and there is a minimal need for sharing code across them. The benefit of this approach is that you can process it through [parallel-webpack](https://www.npmjs.com/package/parallel-webpack) to improve build performance.
* Set up a single configuration and extract the commonalities. The way you do this can differ depending on how you chunk it up. If you follow the idea of Progressive Web Applications (PWA), you can end up with either an **app shell** or a **page shell**.

In practice you may find more dimensions. For example, you have to generate i18n variants for pages. These ideas grow on top of the basic approaches.

## Generating Multiple Separate Pages

To generate multiple separate pages, there should be means to initialize them. We should also be able to return a configuration for each page so webpack will pick them up and process them through the multi-compiler mode.

In order to initialize a page, it should receive a script, output path, and an optional template at least. Each page should receive optional output path, and a template for customization. The idea can be modeled as a configuration part like this:

**webpack.parts.js**

```javascript
...
leanpub-start-insert
const HtmlWebpackPlugin = require('html-webpack-plugin');
leanpub-end-insert

...

leanpub-start-insert
exports.page = function({ output, template } = {}) {
  return {
    plugins: [
      new HtmlWebpackPlugin({
        filename: `${output}/index.html`,
        template,
      }),
    ],
  };
};
leanpub-end-insert
```

TODO: integrate to config

```
entry for the page

+

new HtmlWebpackPlugin({
  filename: 'index.html',
  template: './src/index.html',
  inject: 'body',
  chunks: ['vendor','manifest','index']
}),
```

TODO

## Generating an App Shell

TODO

## Generating a Page Shell

TODO

## Conclusion

TODO
