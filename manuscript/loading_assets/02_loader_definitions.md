# Loader Definitions

Webpack provides multiple ways to set up module loaders. I'll cover the most important ones next. Generally you either use `loader` (accepts string or `options` field) or `loaders` field (accepts array of strings) and then pass possible option parameters using one of the available methods.

I recommend maintaining an `include` definition per each loader definition. This will restrict its search path, improve performance, and make your configuration easier to follow. `include` accepts either a path or an array of paths.

It can be a good idea to prefer absolute paths here as it allows you to move configuration without breaking assumptions. Ideally you have to tweak just a single place during restructuring.

## Loader Evaluation Order

It is good to keep in mind that webpack's `loaders` are always evaluated from right to left and from bottom to top (separate definitions). The right to left rule is easier to remember when you think about it in terms of functions. You can read definition `loaders: ['style-loader', 'css-loader']` as `style(css(input))` based on this rule.

The `use` field added in webpack 2 gives syntax like this:

```javascript
{
  test: /\.css$/,
  use: ['style-loader', 'css-loader'],
  include: PATHS.app
}
```

Furthermore each loader definition can be expanded further as shown later in this chapter. The above example would be equivalent to this without `use`:

```javascript
{
  test: /\.css$/,
  loader: ['style-loader'],
  include: PATHS.app
},
{
  test: /\.css$/,
  loader: ['css-loader'],
  include: PATHS.app
}
```

You could also use the old query style format, but that's not preferable anymore given `use` exists. I've included it below for completeness:

```javascript
{
  test: /\.css$/,
  loader: ['style-loader!css-loader'],
  include: PATHS.app
}
```

T> There may still be use for the old query format especially if you have to perform quick processing in your source files.

## Passing Parameters to a Loader

The query format allows passing parameters as well:

```javascript
{
  test: /\.(js|jsx)$/,
  loader: 'babel-loader?cacheDirectory,presets[]=react,presets[]=es2015'
  include: PATHS.app
}
```

This isn't readable. Instead it's preferable to use the combination of `loader` and `options` fields either like this:

```javascript
{
  test: /\.(js|jsx)$/,
  loader: 'babel-loader',
  options: {
    cacheDirectory: true,
    presets: ['react', 'es2015']
  },
  include: PATHS.app
}
```

Or like this if you want to apply multiple loaders:

```javascript
{
  test: /\.(js|jsx)$/,
  use: [
    {
      loader: 'babel-loader',
      options: {
        cacheDirectory: true,
        presets: ['react', 'es2015']
      }
    }
  ],
  include: PATHS.app
}
```

T> Another way to deal with query parameters would be to rely on Node.js [querystring](https://nodejs.org/api/querystring.html) module and stringify structures through it so they can be passed through a `loaders` definition.

## Conclusion

Webpack provides multiple ways to set up loaders. You should be careful especially with loader ordering. Sometimes naming (i.e, `loader` vs. `loaders`) can cause mysterious issues as well.

I will discuss specific assets types and how to load them using webpack next.
