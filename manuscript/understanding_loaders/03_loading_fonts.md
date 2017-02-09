# Loading Fonts

Loading fonts is a tough problem. Normally you have up to four font formats to worry about, each for a certain browser. You have a couple of strategies to consider.

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
  src: url('myfontfile.woff') format('woff'),
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

The ideas above can be applied with [Font Awesome](https://www.npmjs.com/package/font-awesome). It's a collection of high quality font icons you can refer to using a CSS classes. To integrate it to the book project, install it first:

```bash
npm install font-awesome --save
```

Given Font Awesome doesn't define a `main` field in its *package.json* file, we'll need to point to it through a direct path instead of package name alone.

Refer to Font Awesome as follows:

**app/index.js**

```javascript
leanpub-start-insert
import 'font-awesome/css/font-awesome.css';
leanpub-end-insert

...
```

T> The `import` could be cleaned up as `import 'font-awesome'` by setting up a `resolve.alias`. The *Consuming Packages* chapter discusses this idea in greater detail.

If you run the project now (`npm start`), webpack should give a long list of errors like this:

```bash
ERROR in ./~/font-awesome/fonts/fontawesome-webfont.woff2?v=4.7.0
Module parse failed: .../node_modules/font-awesome/fonts/fontawesome-webfont.woff2?v=4.7.0 Unexpected character '' (1:4)
You may need an appropriate loader to handle this file type.
(Source code omitted for this binary file)
 @ ./~/css-loader!./~/font-awesome/css/font-awesome.css 6:479-532
 @ ./~/font-awesome/css/font-awesome.css
 @ ./app/index.js
 @ multi (webpack)-dev-server/client?http://localhost:8080 webpack/hot/only-dev-server react-hot-loader/patch ./app
```

This is expected as we haven't configured loaders for any of Font Awesome fonts yet and webpack doesn't know what to do with the files in question. To match the files and map them through *file-loader*, attach the following snippet to the project:

**webpack.parts.js**

```javascript
...

exports.loadFonts = function({ include, exclude, options } = {}) {
  return {
    module: {
      rules: [
        {
          // Capture eot, ttf, svg, woff, and woff2
          test: /\.(woff2?|ttf|svg|eot)(\?v=\d+\.\d+\.\d+)?$/,
          include,
          exclude,

          use: {
            loader: 'file-loader',
            options,
          },
        },
      ],
    },
  };
};
```

The idea is the same as for loading images. This time around we match font files. If you wanted, you could refactor the commonality to a function to share between the two.

We still need to connect the above with the main configuration:

**webpack.config.js**

```javascript
...

const common = merge([
  ...
leanpub-start-insert
  parts.loadFonts({
    options: {
      name: '[name].[ext]',
    },
  }),
leanpub-end-insert
]);

...
```

If you run the project again (`npm start`), it should run without any errors. To see Font Awesome in action, adjust the application as follows:

**app/component.js**

```javascript
export default function () {
  const element = document.createElement('h1');

leanpub-start-delete
  element.className = 'pure-button';
leanpub-end-delete
leanpub-start-insert
  element.className = 'fa fa-hand-spock-o fa-1g';
leanpub-end-insert
  element.innerHTML = 'Hello world';

  return element;
}
```

If you build the application (`npm run build`), you should see that it processed as expected while Font Awesome assets were included:

```bash
Hash: 2c5db72dfa7e206817d5
Version: webpack 2.2.1
Time: 2346ms
                    Asset       Size  Chunks                    Chunk Names
  fontawesome-webfont.eot     166 kB          [emitted]
  fontawesome-webfont.svg     444 kB          [emitted]  [big]
  fontawesome-webfont.ttf     166 kB          [emitted]
fontawesome-webfont.woff2    77.2 kB          [emitted]
 fontawesome-webfont.woff      98 kB          [emitted]
                 logo.png      77 kB          [emitted]
                   app.js    4.55 kB       0  [emitted]         app
                  app.css    3.85 kB       0  [emitted]         app
               index.html  218 bytes          [emitted]
   [0] ./app/component.js 186 bytes {0} [built]
   [1] ./~/font-awesome/css/font-awesome.css 41 bytes {0} [built]
   [2] ./app/main.css 41 bytes {0} [built]
...
```

It is good to note that Font Awesome included a lot of fonts you might not end up using. This is why [font-awesome-loader](https://www.npmjs.com/package/font-awesome-loader) exists. It encapsulates the same ideas and allows customization of Font Awesome. The approach above is more generic and can be used with other libraries as well.

W> You might notice that the Font Awesome related output is big for a single icon. This is because all icons of it get loaded by default. [Font Awesome wiki](https://github.com/FortAwesome/Font-Awesome/wiki/Customize-Font-Awesome) points to services that can be used to customize the selection. Font Awesome 5 will contain a better solution and allow you to achieve the same without an external service.

## Conclusion

Loading fonts is similar to loading other assets. Here we have extra concerns to consider. We need to consider the browsers we want to support and choose the loading strategy based on that.
