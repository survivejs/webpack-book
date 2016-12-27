# Loader Definitions

Webpack provides multiple ways to set up module loaders. Webpack 2 simplified the situation by introducing a field known as `use`. The legacy options (`loader` and `loaders`) still work. I'll discuss all of the options for completeness as you may see them in various configurations out there.

I recommend maintaining an `include` definition per each loader definition. This will restrict its search path, improve performance, and make your configuration easier to follow. `include` accepts either a path or an array of paths.

It can be a good idea to prefer absolute paths here as it allows you to move configuration without breaking assumptions. Ideally you have to tweak just a single place during restructuring.

Packages loaded from *node_modules* will still work as the assumption is that they have been compiled in such way that they work out of the box. Sometimes you may come upon a badly packaged one, but often you can work around these by tweaking your loader configuration or setting up a `resolve.alias` against an asset that is included with the offending package.

## Anatomy of a Loader

Webpack supports a large variety of formats through *loaders*. In addition, it supports a couple of JavaScript module formats out of the box. Generally, the idea is the same. You always set up a loader, or loaders, and connect those with your directory structure.

The system relies on configuration. Consider the example below where we set webpack to process JavaScript through Babel:

**webpack.config.js**

```javascript
...

module.exports = {
  ...
  module: {
    rules: [
      {
        // Match files against RegExp
        test: /\.js$/,

        // Restrict matching to a directory. This
        // also accepts an array of paths.
        // Although optional, I prefer to set this for
        // JavaScript source as it helps with
        // performance and keeps the configuration cleaner.
        include: path.join(__dirname, 'app'),

        // Apply loaders against it. These need to
        // be installed separately. In this case our
        // project would need *babel-loader*. This
        // accepts an array of loaders as well.
        use: 'babel-loader'
      }
    ]
  }
};
```

T> If you are not sure how a particular RegExp matches, consider using an online tool, such as [regex101](https://regex101.com/).

## Loader Evaluation Order

It is good to keep in mind that webpack's `loaders` are always evaluated from right to left and from bottom to top (separate definitions). The right to left rule is easier to remember when you think about it in terms of functions. You can read definition `use: ['style-loader', 'css-loader']` as `style(css(input))` based on this rule.

To see the rule in action, consider the example below:

```javascript
{
  test: /\.css$/,
  use: ['style-loader', 'css-loader']
}
```

Based on the right to left rule, the example can be split up while keeping it equivalent:

```javascript
{
  test: /\.css$/,
  use: ['style-loader']
},
{
  test: /\.css$/,
  use: ['css-loader']
}
```

## Passing Parameters to a Loader

The query format allows passing parameters as well:

```javascript
{
  test: /\.js$/,
  include: PATHS.app,
  use: 'babel-loader?cacheDirectory,presets[]=react,presets[]=es2015'
}
```

This isn't very readable. There may still be use for the old query format especially if you have to perform processing within your source files. Often there are better ways available, though.

Instead, it's preferable to use the combination of `loader` and `options` fields either like this:

```javascript
{
  // Conditions
  test: /\.js$/,
  include: PATHS.app,

  // Actions
  loader: 'babel-loader',
  options: {
    cacheDirectory: true,
    presets: ['react', 'es2015']
  }
}
```

You can also go through `use` like this:

```javascript
{
  // Conditions
  test: /\.js$/,
  include: PATHS.app,

  // Actions
  use: {
    loader: 'babel-loader',
    options: {
      cacheDirectory: true,
      presets: ['react', 'es2015']
    }
  }
}
```

If we wanted to use more than one loader, we could pass an array to `use` and expand from there:

```javascript
{
  test: /\.js$/,
  include: PATHS.app,

  use: [
    {
      loader: 'babel-loader',
      options: {
        cacheDirectory: true,
        presets: ['react', 'es2015']
      }
    }
    // Add more loaders here
  ]
}
```

## `LoaderOptionsPlugin`

Given webpack 2 forbids arbitrary root level configuration, you have to use `LoaderOptionsPlugin` to manage it. The plugin exists for legacy compatibility and may disappear in a future release. Consider the example below:

```javascript
{
  plugins: [
    new webpack.LoaderOptionsPlugin({
      sassLoader: {
        includePaths: [
          path.join(__dirname, 'style')
        ]
      }
    })
  ]
}
```

## Conclusion

Webpack provides multiple ways to set up loaders, but sticking with `use` is enough in webpack 2. You should be careful especially with loader ordering. I will discuss specific assets types and how to load them using webpack next.
