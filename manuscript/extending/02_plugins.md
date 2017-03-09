# Extending with Plugins

Compared to loaders, plugins are a more flexible means to extend webpack. As `ExtractTextPlugin` shows, sometimes it can make sense to use loaders and plugins together. The great thing about plugins is that they allow you to intercept webpack's execution through many hooks and then extend it as you see fit. Internally webpack consists of an extensive collection of plugins so understanding the basic idea can be valuable if you want to delve into it.

To understand how a plugin works, you study [purifycss-webpack](https://www.npmjs.com/package/purifycss-webpack). You used it in this book already, so diving into its internals doesn't hurt. The plugin itself doesn't do much. It figures out what files to pass to PurifyCSS, lets it process the data, captures the output, and writes it to an asset.

A plugin project can be structured similarly as a loader project, so I won't delve into the project structure. Instead, you walk through the plugin portion below.

## The Basic Flow of Webpack Plugins

A webpack plugin is expected to expose an `apply` method. The way you do that is up to you. The most common way is to set up a function and then attach methods to its `prototype`. I prefer to return an object from a function and then access plugin `options` through the closure. In the `prototype` approach you would have to capture the options to `this` to access them from your methods. Using ES6 classes is an additional option. The exact approach is up to the coding style you prefer.

Regardless of your approach, you should capture possible options passed by a user, preferably validate them, and then make sure your `apply` method is ready to go. When webpack runs the plugin, it passes a `compiler` object to it. This object exposes webpack's plugin API and allows you to connect into the hooks it provides. [The official reference](https://webpack.js.org/pluginsapi/compiler/) lists all the available hooks.

In this case, you need to intercept only a `this-compilation` hook that is emitted before `compilation` event itself. It happens to be the right hook for this particular purpose although it can take a bit of experimentation to figure out which hooks you need.

The hook receives a `compilation` object that gives access to the build. It comes with a series of hooks of its own. In this case using the `additional-assets` hook is enough as you can go through the compiled chunks there and perform the logic.

T> Loaders have a dirty access to `compiler` and `compilation` through underscore (`this._compiler`/`this._compilation`). You could write arbitrary files through them.

## Understanding `PurifyCSSPlugin` in Detail

The PurifyCSS plugin exposes a small interface to the user. Consider the example below:

```javascript
{
  ...
  plugins: [
    new ExtractTextPlugin('[name].[contenthash].css'),
    // Make sure this is after ExtractTextPlugin!
    new PurifyCSSPlugin({
      // Give paths to parse for rules. These should be absolute!
      paths: glob.sync(path.join(__dirname, 'app/*.html')),
    }),
  ],
},
```

In this case it is important the plugin is executed **after** `ExtractTextPlugin`. That way there is something sensible to process. The plugin also supports more advanced forms of path input. You could pass an `entry` like object to it to constrain the purifying process per entry instead of relying on the same set of files. This adds complexity to the implementation, but it's a good feature to support as it provides more control to the user.

Given failing fast and loud is a good idea when it comes to user-facing interfaces like this, I decided to validate the input carefully. I ended up using JSON Schema for the option definition while validating the input through [ajv](https://www.npmjs.com/package/ajv) as this allows me to provide verbose errors related to the input shape and it can capture even typos as it complains if you try to pass fields that are not supported. Webpack uses a similar solution internally, and it has proven to be a good decision.

Most of the complexity of the plugin has to do with figuring out which data to pass to PurifyCSS. The process has to capture assets from the application hierarchy and perform a lookup against them. Writing the data is the easiest step. To add output, you have to use `compilation.assets['demo.css'] = 'demo';` kind of an API.

The source below walks through the main ideas of the plugin in detail. Logic, such as input validation, parsing, and searching, has been pushed behind modules of their own as they have little to do with the main flow of the plugin.

```javascript
import purify from 'purify-css';
import { ConcatSource } from 'webpack-sources';
import * as parse from './parse';
import * as search from './search';
import validateOptions from './validate-options';
import schema from './schema';

module.exports = function PurifyPlugin(options) {
  return {
    apply(compiler) {
      const validation = validateOptions(
        schema({
          entry: compiler.options.entry
        }),
        options
      );

      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      compiler.plugin('this-compilation', (compilation) => {
        const entryPaths = parse.entryPaths(options.paths);

        // Output debug information through a callback pattern
        // to avoid unnecessary processing
        const output = options.verbose ?
          messageCb => console.info(...messageCb()) :
          () => {};

        compilation.plugin('additional-assets', (cb) => {
          // Go through chunks and purify as configured
          compilation.chunks.forEach(
            ({ name: chunkName, modules }) => {
              const assetsToPurify = search.assets(
                compilation.assets, options.styleExtensions
              ).filter(
                asset => asset.name.indexOf(chunkName) >= 0
              );

              output(() => [
                'Assets to purify:',
                assetsToPurify.map(({ name }) => name).join(', ')
              ]);

              assetsToPurify.forEach(({ name, asset }) => {
                const filesToSearch = parse.entries(
                  entryPaths, chunkName
                ).concat(
                  search.files(
                    modules,
                    options.moduleExtensions || [],
                    file => file.resource
                  )
                );

                output(() => [
                  'Files to search for used rules:',
                  filesToSearch.join(', ')
                ]);

                // Compile through Purify and attach to output.
                // This loses sourcemaps should there be any!
                compilation.assets[name] = new ConcatSource(
                  purify(
                    filesToSearch,
                    asset.source(),
                    {
                      info: options.verbose,
                      minify: options.minimize,
                      ...options.purifyOptions
                    }
                  )
                );
              });
            }
          );

          cb();
        });
      });
    }
  };
};
```

Even though this is a humble plugin, it took a lot of effort to achieve a basic implementation. It would be possible to decompose the plugin logic further although it is currently in a manageable shape. There are additional observations that can be made based on the implementation:

* The plugin output has been wrapped in callbacks. This way output related logic is performed only if the output (the `verbose` flag) has been enabled. It is possible webpack receives better logging facilities of its own in the future. For now, you can log warnings and errors through `compilation.warnings.push(new Error(...))` and `compilation.errors.push(...)` interface.
* The plugin has been written in a functional style as much as possible. The individual helper functions have been tested thoroughly and written in a test driven manner.
* [webpack-sources](https://www.npmjs.com/package/webpack-sources) package comes in handy when you have to deal with the source in a format that webpack understands.

## Plugins Can Have Plugins

Sometimes it can make sense for a plugin to provide hooks of its own. This way you can write plugins for plugins to extend their functionality. [html-webpack-plugin](https://www.npmjs.com/package/html-webpack-plugin) is a good example of that. Example plugins are discussed in detail in the *Getting Started* chapter.

## Conclusion

Writing webpack plugins can be challenging at first due to the sheer size of the API webpack provides and it is the most powerful way you can extend webpack, though. When you begin to design a plugin, it is a good idea to spend time studying existing plugins that are close enough to what you are going to implement as this can generate insight on which hooks you should use and how.

It is a good idea to develop a plugin piece-wise so that you validate one piece of it at a time. The ultimate approach for understanding webpack plugins in great detail is to delve into webpack source itself as it is a big collection of plugins.

To recap:

* **Plugins** can intercept webpack's execution and extend it making them more flexible than loaders.
* Plugins can be combined with loaders. `ExtractTextPlugin` is a good example of a plugin that works this way. In that case, loaders are used to mark assets to extract.
* Most importantly plugins can emit new assets and shape existing assets. `CommonsChunkPlugin` is an example of a plugin that shapes the way webpack generates bundles.
