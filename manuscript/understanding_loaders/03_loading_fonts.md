# Loading Fonts

Loading fonts is a surprisingly tough problem. There are typically four font formats to worry about, each for a certain browser. Inlining all formats at once wouldn't be a particularly good idea. It is acceptable, and even preferable, during development. That said, there are a couple of production-specific strategies we can consider.

## Choosing One Format

Depending on your project requirements, you might be able to get away with less formats. If you exclude Opera Mini, all browsers support the *.woff* format. The render result may differ depending on the browser so you might want to experiment here.

If we go with just one format, we can use a similar setup as for images and rely on both *file-loader* and *url-loader* while using the limit option:

```javascript
{
  test: /\.woff$/,
  loader: 'url-loader',
  options: {
    limit: 50000,
  },
},
```

A more elaborate way to achieve a similar result would be to use:

```javascript
{
  // Match woff2 in addition to patterns like .woff?v=1.1.1.
  test: /\.woff2?(\?v=\d+\.\d+\.\d+)?$/,
  loader: 'url-loader',
  options: {
    limit: 50000,
    mimetype: 'application/font-woff',
    name: './fonts/[hash].[ext]',
  },
},
```

## Supporting Multiple Formats

In case we want to make sure our site looks good on a maximum amount of browsers, we might as well use just *file-loader* and forget about inlining. Again, it's a trade-off as we get extra requests, but perhaps it's the right move. Here we could end up with a loader configuration like this:

```javascript
{
  test: /\.woff2?$/,
  // Inline small woff files and output them below font/.
  // Set mimetype just in case.
  loader: 'url-loader',
  options: {
    name: 'fonts/[hash].[ext]',
    limit: 50000,
    mimetype: 'application/font-woff',
  },
},
{
  test: /\.(ttf|svg|eot)$/,
  loader: 'file-loader',
  options: {
    name: 'fonts/[hash].[ext]',
  },
},
```

Note that the way you write your CSS definition matters. Assuming we are going to inline the WOFF format, we should have it first like this in your CSS:

```css
@font-face {
  font-family: 'myfontfamily';
  src: url('myfontfile.woff') format('woff2'),
    url('myfontfile.ttf') format('truetype');
    /* Other formats as you see fit */
}
```

This way the browser will try to consume the inlined font before loading remote alternatives.

T> [MDN discusses the font-family rule](https://developer.mozilla.org/en/docs/Web/CSS/@font-face) in greater detail.

## Generating Font Files Based on SVGs

Sometimes you might have a bunch of SVG files that would be nice to bundle as font files of their own. The setup is a little involved, but [fontgen-loader](https://www.npmjs.com/package/fontgen-loader) achieves this.

## Manipulating `file-loader` Output Path and `publicPath`

As discussed above and in [webpack issue tracker](https://github.com/webpack/file-loader/issues/32#issuecomment-250622904), *file-loader* allows shaping the output. This way you can output your fonts below `fonts/`, images below `images/`, and so on over using the root.

Furthermore, it's possible to manipulate `publicPath` and override the default per loader definition. The following example illustrates these techniques together:

```javascript
{
  // Match woff2 in addition to patterns like .woff?v=1.1.1.
  test: /\.woff2?(\?v=\d+\.\d+\.\d+)?$/,
  loader: 'url-loader',
  options: {
    limit: 50000,
    mimetype: 'application/font-woff',
    // Output below the fonts directory
    name: './fonts/[hash].[ext]',
    // Tweak publicPath to fix CSS lookups to take
    // the directory into account.
    publicPath: '../',
  },
},
```

## Using Font Awesome

The ideas above can be wrapped into a configuration part that allows you to work with [Font Awesome](https://www.npmjs.com/package/font-awesome). Here's the idea:

```javascript
exports.loadFonts = function(options) {
  const name = (options && options.name) || 'fonts/[hash].[ext]';

  return {
    module: {
      rules: [
        {
          // Capture eot, ttf, svg, woff, and woff2
          test: /\.(woff2?|ttf|svg|eot)(\?v=\d+\.\d+\.\d+)?$/,
          loader: 'file-loader',
          options: {
            name: name,
          },
        },
      ],
    },
  };
};
```

To include Font Awesome into your project, install it (`npm i font-awesome -S`) and then refer to it through your code. Given the distribution version is missing *package.json* `main`, you will have to point at *node_modules/font-awesome/css/font-awesome.css*. See the *Consuming Packages* chapter for further techniques.

If we wanted to integrate Font Awesome to our project, we would have to perform the following modifications:

**app/index.js**

```javascript
leanpub-start-insert
import '../node_modules/font-awesome/css/font-awesome.css';
leanpub-end-insert

...
```

**app/component.js**

```javascript
export default function () {
  const element = document.createElement('h1');

  element.className = 'fa fa-spock-o fa-1g';
  element.innerHTML = 'Hello world';

  return element;
}
```

T> The `import` could be cleaned up as `import 'font-awesome'` by setting up a `resolve.alias`. The *Consuming Packages* chapter discusses this idea in greater detail.

## Conclusion

Loading fonts is similar to loading other assets. Here we have extra concerns to consider. We need to consider the browsers we want to support and choose the loading strategy based on that.
