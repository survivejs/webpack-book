# Loader Definitions

Webpack provides multiple ways to set up module loaders. I'll cover the most important ones next. Generally you either use `loader` (accepts string) or `loaders` field (accepts array of strings) and then pass possible query parameters using one of the available methods.

I recommend maintaining an `include` definition per each loader definition. This will restrict its search path, improve performance, and make your configuration easier to follow. `include` accepts either a path or an array of paths.

It can be a good idea to prefer absolute paths here as it allows you to move configuration without breaking assumptions. Ideally you have to tweak just a single place during restructuring.

## Loader Evaluation Order

It is good to keep in mind that Webpack's `loaders` are always evaluated from right to left and from bottom to top (separate definitions). The right to left rule is easier to remember when you think about it in terms of functions. You can read definition `loaders: ['style', 'css']` as `style(css(input))` based on this rule. The following examples are equivalent as well:

```javascript
{
  test: /\.css$/,
  loaders: ['style', 'css'],
  include: PATHS.app
}
```

```javascript
{
  test: /\.css$/,
  loaders: ['style'],
  include: PATHS.app
},
{
  test: /\.css$/,
  loaders: ['css'],
  include: PATHS.app
}
```

The `loaders` of the latter definition could be rewritten in the query format discussed above after performing a split like this.

## Passing Parameters to a Loader

Sometimes you might want to pass query parameters to a loader. By default you could do it through a query string:

```javascript
{
  test: /\.jsx?$/,
  loaders: [
    'babel?cacheDirectory,presets[]=react,presets[]=es2015'
  ],
  include: PATHS.app
}
```

The problem with this approach is that it isn't particularly readable. A better way is to use the combination of `loader` and `query` fields:

```javascript
{
  test: /\.jsx?$/,
  loader: 'babel',
  query: {
    cacheDirectory: true,
    presets: ['react', 'es2015']
  },
  include: PATHS.app
}
```

This approach becomes problematic with multiple loaders since it's limited just to one loader at a time. If you want to use this format with multiple, you need separate declarations.

T> Another way to deal with query parameters would be to rely on Node.js [querystring](https://nodejs.org/api/querystring.html) module and stringify structures through it so they can be passed through a `loaders` definition.

## Conclusion

Webpack provides multiple ways to set up loaders. You should be careful especially with loader ordering. Sometimes naming (i.e, `loader` vs. `loaders`) can cause mysterious issues as well.

I will discuss specific assets types and how to load them using Webpack next.
