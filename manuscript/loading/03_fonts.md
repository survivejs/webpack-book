# Loading Fonts

Loading fonts is similar to loading images. It does come with special challenges, though. How to know what font formats to support? There can be up to four font formats to worry about if you want to provide first class support to each browser.

One way to solve this problem is to decide a set of browsers and platforms that should receive first class service. The rest will use system fonts.

You can approach the problem in several ways through webpack. You can still use *url-loader* and *file-loader* as with images. Font `test` patterns tend to be more complicated, though, and you may have to worry about font file related lookups.

T> [canifont](https://www.npmjs.com/package/canifont) helps you to figure out which font formats you should support. It accepts a **browserslist** definition and then checks font support of each browser based on the definition.

## Choosing One Format

If you exclude Opera Mini, all browsers support the *.woff* format. If you go only with modern browsers, its newer version, *.woff2*, can be enough.

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

A more elaborate way to achieve a similar result that includes *.woff2* and more complicated patterns, would be to end up with code like this:

```javascript
{
  // Match woff2 in addition to patterns like .woff?v=1.1.1.
  test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
  loader: 'url-loader',
  options: {
    // Limit at 50k. Above that it will emit separate files
    limit: 50000,

    // url-loader will set mimetype if it is passed.
    // Without this it will derive it from file extension
    mimetype: 'application/font-woff',

    // Output below fonts directory
    name: './fonts/[name].[ext]',
  },
},
```

## Supporting Multiple Formats

In case we want to make sure our site looks good on a maximum amount of browsers, we might as well use *file-loader* and forget about inlining. Again, it's a trade-off as we get extra requests, but perhaps it's the right move. Here we could end up with a loader configuration like this:

```javascript
{
  test: /\.(ttf|eot|woff|woff2)$/,
  loader: 'file-loader',
  options: {
    name: 'fonts/[name].[ext]',
  },
},
```

The way you write your CSS definition matters. To make sure you are getting the benefit from the newer formats, they should become first in the definition. This way the browser will pick them up.

```css
@font-face {
  font-family: 'myfontfamily';
  src: url('./fonts/myfontfile.woff2') format('woff2'),
    url('./fonts/myfontfile.woff') format('woff'),
    url('./fonts/myfontfile.eot') format('embedded-opentype'),
    url('./fonts/myfontfile.ttf') format('truetype');
    /* Add other formats as you see fit */
}
```

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
    name: './fonts/[name].[ext]',

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

Font Awesome includes Sass and Less versions as well, but given we have not set up either, this definition is enough.

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
          test: /\.(eot|ttf|woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
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
Hash: e379b2c5a9f46663f367
Version: webpack 2.2.1
Time: 2547ms
        Asset       Size  Chunks                    Chunk Names
  ...font.eot     166 kB          [emitted]
  ...font.ttf     166 kB          [emitted]
...font.woff2    77.2 kB          [emitted]
 ...font.woff      98 kB          [emitted]
  ...font.svg     444 kB          [emitted]  [big]
     logo.png      77 kB          [emitted]
       app.js    4.22 kB       0  [emitted]         app
      app.css    7.72 kB       0  [emitted]         app
   index.html  227 bytes          [emitted]
   [0] ./app/component.js 185 bytes {0} [built]
   [1] ./~/font-awesome/css/font-awesome.css 41 bytes {0} [built]
   [2] ./app/main.css 41 bytes {0} [built]
...
```

Note that the SVG file included in Font Awesome has been marked as `[big]`. It is beyond the performance budget defaults set by webpack. The topic is discussed in detail in the *Minifying Build* chapter.

To skip certain Font Awesome fonts, you could disable specific formats as discussed in the *Consuming Packages* chapter. Due to the way Font Awesome CSS has been setup, you will still have to capture the files, but instead of emitting the original content, you can replace it with empty content.

T> [font-awesome-loader](https://www.npmjs.com/package/font-awesome-loader) allows more customization. Font Awesome 5 will improve the situation further and make it easier to decide what fonts to consume. [Font Awesome wiki](https://github.com/FortAwesome/Font-Awesome/wiki/Customize-Font-Awesome) points to available online services that allow you to select specific fonts from Font Awesome collection.

## Conclusion

Loading fonts is similar to loading other assets. Here we have additional concerns to consider. We need to consider the browsers we want to support and choose the loading strategy based on that.

To recap:

* When loading fonts, the same techniques as for images apply. You can choose to inline small fonts while bigger ones will be served as separate assets.
* If you decide to provide first class support to only modern browsers, you can select only a font format or two and let the older browsers to use system level fonts.
* Using larger font collections, such as Font Awesome, may be problematic especially if you want to avoid loading additional rules. The problem is dependent on the packages in question and can be solved with webpack to an extent.

In the next chapter, I will show you how to load JavaScript using webpack. It loads JavaScript by default, but there's more to the topic as you have to consider what browsers you want to support.
