# Loading Fonts

Loading fonts is problematic. Normally you have up to four font formats to worry about, each for a particular browser. You have a couple of strategies to consider.

## Choosing One Format

Depending on your project requirements, you might be able to get away with fewer formats. If you exclude Opera Mini, all browsers support the *.woff* format. The rendered result may differ depending on the browser so you might want to experiment here.

If we go with one format, we can use a similar setup as for images and rely on both *file-loader* and *url-loader* while using the limit option:

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

In case we want to make sure our site looks good on a maximum amount of browsers, we might as well use *file-loader* and forget about inlining. Again, it's a trade-off as we get extra requests, but perhaps it's the right move. Here we could end up with a loader configuration like this:

```javascript
{
  test: /\.woff2?$/,
  // Inline small woff files and output them below fonts/.
  // Set mimetype just in case.
  loader: 'url-loader',
  options: {
    name: 'fonts/[hash].[ext]',
    limit: 50000,
    mimetype: 'application/font-woff',
  },
},
{
  test: /\.(ttf|eot)$/,
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
  src: url('myfontfile.woff2') format('woff2'),
    url('myfontfile.woff') format('woff'),
    url('myfontfile.ttf') format('truetype');
    /* Add other formats as you see fit */
}
```

This way the browser will try to consume the inlined font before loading remote alternatives.

T> [MDN discusses the font-family rule](https://developer.mozilla.org/en/docs/Web/CSS/@font-face) in detail.

## Generating Font Files Based on SVGs

Sometimes you might have a bunch of SVG files that would be nice to bundle as font files of their own. The setup is a little involved, but [fontgen-loader](https://www.npmjs.com/package/fontgen-loader) achieves this.

W> Take care with SVGs if you have SVG specific image setup in place already. If you want to process font SVGs differently, set their definitions carefully. The *Loader Definitions* chapter covers alternatives.

## Manipulating *file-loader* Output Path and `publicPath`

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

The ideas above can be applied with [Font Awesome](https://www.npmjs.com/package/font-awesome). It's a collection of high-quality font icons you can refer to using CSS classes.

### Integrating Font Awesome to the Project

To integrate Font Awesome to the book project, install it first:

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

T> The `import` could be cleaned up as `import 'font-awesome'` by setting up a `resolve.alias`. The *Consuming Packages* chapter discusses this idea in detail.

W> If you are using CSS Modules in your project, you should process normal CSS like this through a separate loader definition without `modules` option of *css-loader* enabled. Otherwise it will rewrite the class names and Font Awesome will not work as you expect.

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

### Implementing Webpack Configuration

The result is expected as we haven't configured loaders for any of Font Awesome fonts yet and webpack doesn't know what to do with the files in question. To match the files and map them through *file-loader*, attach the following snippet to the project:

**webpack.parts.js**

```javascript
...

exports.loadFonts = function({ include, exclude, options } = {}) {
  return {
    module: {
      rules: [
        {
          // Capture eot, ttf, woff, and woff2
          test: /\.(woff2?|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
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

const commonConfig = merge([
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
export default function (text = 'Hello world') {
  const element = document.createElement('div');

leanpub-start-delete
  element.className = 'pure-button';
leanpub-end-delete
leanpub-start-insert
  element.className = 'fa fa-hand-spock-o fa-1g';
leanpub-end-insert
  element.innerHTML = text;

  return element;
}
```

If you build the application (`npm run build`), you should see that it processed as expected while Font Awesome assets were included.

```bash
Hash: 540d34dcccc83368dabf
Version: webpack 2.2.1
Time: 2481ms
                    Asset       Size  Chunks                    Chunk Names
  fontawesome-webfont.eot     166 kB          [emitted]
  fontawesome-webfont.svg     444 kB          [emitted]  [big]
  fontawesome-webfont.ttf     166 kB          [emitted]
fontawesome-webfont.woff2    77.2 kB          [emitted]
 fontawesome-webfont.woff      98 kB          [emitted]
                 logo.png      77 kB          [emitted]
                   app.js    4.56 kB       0  [emitted]         app
                  app.css    3.85 kB       0  [emitted]         app
               index.html  218 bytes          [emitted]
   [0] ./app/component.js 198 bytes {0} [built]
   [1] ./~/font-awesome/css/font-awesome.css 41 bytes {0} [built]
   [2] ./app/main.css 41 bytes {0} [built]
...
```

Note that the SVG file included in Font Awesome has been marked as `[big]`. It is beyond the performance budget defaults set by webpack. The topic is discussed in detail in the *Minifying Build* chapter.

T> [font-awesome-loader](https://www.npmjs.com/package/font-awesome-loader) allows more customization. Font Awesome 5 will improve the situation further. See also the *Consuming Packages* chapter to see how to disable asset loading. You could explicitly disable SVGs in this case.

T> If you want full control over which fonts you are using, [Font Awesome wiki](https://github.com/FortAwesome/Font-Awesome/wiki/Customize-Font-Awesome) points to available online services.

## Conclusion

Loading fonts is similar to loading other assets. Here we have additional concerns to consider. We need to consider the browsers we want to support and choose the loading strategy based on that.

To recap:

* When loading fonts, the same techniques as for images apply. You can choose to inline small fonts while bigger ones will be served as separate assets.
* Using larger font collections, such as Font Awesome, may be problematic especially if you want to avoid loading additional rules. The problem is dependent on the packages in question and can be solved with webpack to an extent.

In the next chapter, I will show you how to load JavaScript using webpack. It loads JavaScript by default, but there's more to the topic as you have to consider what browsers you want to support.
