# Loading Fonts

Loading fonts is a surprisingly tough problem. There are typically four(!) font formats to worry about, each for certain browser. Inlining all formats at once wouldn't be a particularly good idea. It is acceptable, and even preferable, during development. That said, there are a couple of production specific strategies we can consider.

## Choosing One Format

Depending on your project requirements, you might be able to get away with less formats. If you exclude Opera Mini, all browsers support the *.woff* format. The render result may differ depending on the browser so you might want to experiment here.

If we go with just one format, we can use a similar setup as for images and rely on both *file-loader* and *url-loader* while using the limit option:

```javascript
{
  test: /\.woff$/,
  use: 'url-loader',
  options: {
    limit: 50000
  },
  // An array of paths or an individual path
  include: PATHS.fonts
}
```

A more elaborate way to achieve a similar result would be to use:

```javascript
{
  // Match woff2 in addition to patterns like .woff?v=1.1.1.
  test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
  use: 'url-loader',
  options: {
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
  use: 'url-loader',
  options: {
    name: 'fonts/[hash].[ext]',
    limit: 5000,
    mimetype: 'application/font-woff'
  },
  include: PATHS.fonts
},
{
  test: /\.ttf$|\.eot$/,
  use: 'file-loader',
  options: {
    name: 'fonts/[hash].[ext]'
  },
  include: PATHS.fonts
}
```

## Generating Font Files Based on SVGs

Sometimes you might have a bunch of SVG files that would be nice to bundle as font files of their own. The setup is a little involved, but [fontgen-loader](https://www.npmjs.com/package/fontgen-loader) achieves just this.

## Manipulating `file-loader` Output Path and `publicPath`

As discussed above and in [webpack issue tracker](https://github.com/webpack/file-loader/issues/32#issuecomment-250622904), *file-loader* allows shaping the output. This way you can output your fonts below `fonts/`, images below `images/`, and so on over using the root.

Furthermore, it's possible to manipulate `publicPath` and override the default per loader definition. The following example illustrates these techniques together:

```javascript
{
  // Match woff2 in addition to patterns like .woff?v=1.1.1.
  test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
  use: 'url-loader',
  options: {
    limit: 50000,
    mimetype: 'application/font-woff',
    // Output below the fonts directory
    name: './fonts/[hash].[ext]',
    // Tweak publicPath to fix CSS lookups to take
    // the directory into account.
    publicPath: '../'
  }
}
```

## Conclusion

Loading fonts is similar as loading other assets. Here we have extra concerns to consider. We need to consider the browsers we want to support and choose the loading strategy based on that.
