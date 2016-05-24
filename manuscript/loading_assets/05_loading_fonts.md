# Loading Fonts

Loading fonts is a surprisingly tough problem. There are typically four(!) font formats to worry about, each for certain browser. Inlining all formats at once wouldn't be a particularly good idea. There are a couple of strategies we can consider.

## Choosing One Format

Depending on your project requirements, you might be able to get away with less formats. If you exclude Opera Mini, all browsers support the *.woff* format. The render result may differ depending on the browser so you might want to experiment here.

If we go with just one format, we can use a similar setup as for images and rely on both *file-loader* and *url-loader* while using the limit option:

```javascript
{
  test: /\.woff$/,
  loader: 'url?limit=50000',
  include: PATHS.fonts
}
```

A more elaborate way to achieve a similar result would be to use:

```javascript
{
  // Match woff2 in addition to patterns like .woff?v=1.1.1.
  test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
  loader: 'url',
  query: {
    limit: 50000,
    mimetype: 'application/font-woff',
    name: './fonts/[hash].[ext]'
  }
}
```

## Supporting Multiple Formats

In case we want to make sure our site looks good on a maximum amount of browsers, we might as well use just *file-loader* and forget about inlining. Again, it's a trade-off as we get extra requests, but perhaps it's the right move. Here we could end up with a loader configuration like this:

```javascript
{
  test: /\.woff$/,
  // Inline small woff files and output them below font/.
  // Set mimetype just in case.
  loader: 'url',
  query: {
    name: 'font/[hash].[ext]',
    limit: 5000,
    mimetype: 'application/font-woff'
  },
  include: PATHS.fonts
},
{
  test: /\.ttf$|\.eot$/,
  loader: 'file',
  query: {
    name: 'font/[hash].[ext]'
  },
  include: PATHS.fonts
}
```

## Conclusion

Loading fonts is similar as loading other assets. Here we have extra concerns to consider. We need to consider the browsers we want to support and choose the loading strategy based on that.
