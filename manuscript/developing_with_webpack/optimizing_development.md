# Optimizing Development

There are times when you might want to optimize your development setup. I am going to show you one useful trick. To benefit from it, we need to make our project heavier first, though. In order to achieve this, we can install React and speed up our development build after that.

## Including React to the Project

To include React to the project, use:

```bash
npm i react --save
```

We also need to refer to it from our project:

**app/index.js**

```javascript
leanpub-start-insert
require('react');
leanpub-end-insert
require('./main.css');

...
```

If you start the project in a development mode (`npm start`) now and try to modify *app/component.js*, it should load refresh your browser a little slower than before. As our application isn't that complex yet, there probably won't be that big a difference. It's still worth knowing how to speed this up, though.

## Optimizing Rebundling

We can optimize our project by pointing the development setup to a minified version of React. The gotcha is that we will lose `propType` based validation! But if speed is more important, this technique may be worth a go. You can hide it behind an environment flag for instance if you want type checking.

In order to achieve what we want, we can use Webpack's `module.noParse` option. It accepts a RegExp or an array of RegExps. We can also pass full paths to it to keep our lives simple.

In addition to telling Webpack not to parse the minified file we want to use, we also need to point `react` to it. This can be achieved using a feature known as `resolve.alias`. It is a mapping between a module name and its target path. In other words, it tells Webpack where to look up the matching module.

Aliasing is a powerful technique and it has usages beyond this particular case. You could for example use it manage a configuration file depending on development and production environments.

We can encapsulate the basic idea within a configuration part like this:

**lib/parts.js**

```javascript
...

exports.dontParse = function(options) {
  const alias = {};
  alias[options.name] = options.path;

  return {
    module: {
      noParse: [
        options.path
      ]
    },
    resolve: {
      alias: alias
    }
  };
}
```

We also need to connect this idea with our configuration:

**webpack.config.js**

```javascript
...

const PATHS = {
leanpub-start-insert
  react: path.join(__dirname, 'node_modules/react/dist/react.min.js'),
leanpub-end-insert
  app: path.join(__dirname, 'app'),
  build: path.join(__dirname, 'build')
};

...

// Detect how npm is run and branch based on that
switch(process.env.npm_lifecycle_event) {
  case 'build':
    config = merge(
      common,
      parts.setupCSS(PATHS.app)
    );
    break;
  default:
    config = merge(
      common,
      {
        devtool: 'eval-source-map'
      },
leanpub-start-insert
      parts.dontParse({
        name: 'react',
        path: PATHS.react
      }),
leanpub-end-insert
      parts.setupCSS(PATHS.app),
      parts.devServer({
        // Customize host/port here if needed
        host: process.env.HOST,
        port: process.env.PORT
      })
    );
}

module.exports = validate(config);
```

If you try developing our application now, it should be at least a little bit faster. The difference isn't particularly big here. The technique is worth knowing, though.

T> Note that aliasing works also with loaders through [resolveLoader.alias](https://webpack.github.io/docs/configuration.html#resolveloader).

W> Not all modules support `module.noParse`, the files included by deps array should have no call to `require`, `define` or similar, or you will get an error when the app runs: `Uncaught ReferenceError: require is not defined`.

## Conclusion

In this chapter we learned a bit about `module.noParse` and `resolve.alias`. Particularly latter allows interesting configuration. Aliasing can be powerful especially when you are dealing with legacy applications you want to port to Webpack.

In the next part we'll focus on setting up a good production build.
