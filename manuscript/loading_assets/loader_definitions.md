# Loader Definitions

Sometimes you might want to pass query parameters to a loader. By default you could do it through a query string:

```javascript
{
  test: /\.jsx?$/,
  loaders: [
    'babel?cacheDirectory,presets[]=react,presets[]=es2015'
  ],
  include: path.join(__dirname, 'app')
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

## Loader Evaluation Order

It is good to keep in mind that Webpack `loaders` are always evaluated from right to left and from bottom to top (separate definitions). The following two declarations are equal based on this rule:

```javascript
{
    test: /\.css$/,
    loaders: ['style', 'css']
}
```

```javascript
{
    test: /\.css$/,
    loaders: ['style']
},
{
    test: /\.css$/,
    loaders: ['css']
}
```

The `loaders` of the latter definition could be rewritten in the query format discussed above after performing a split like this.

## Conclusion

Webpack provides multiple ways to set up loaders. You should be careful especially with loader ordering. Sometimes naming (i.e, `loader` vs. `loaders`) can cause mysterious issues as well.

I will discuss specific assets types and how to load them using Webpack next.
