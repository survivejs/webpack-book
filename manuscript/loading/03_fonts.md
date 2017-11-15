# Loading Fonts

Loading fonts is similar to loading images. It does come with special challenges, though. How to know what font formats to support? There can be up to four font formats to worry about if you want to provide first class support to each browser.

The problem can be solved by deciding a set of browsers and platforms that should receive first class service. The rest can use system fonts.

You can approach the problem in several ways through webpack. You can still use *url-loader* and *file-loader* as with images. Font `test` patterns tend to be more complicated, though, and you have to worry about font file related lookups.

T> [canifont](https://www.npmjs.com/package/canifont) helps you to figure out which font formats you should support. It accepts a **.browserslistrc** definition and then checks font support of each browser based on the definition.

## Choosing One Format

If you exclude Opera Mini, all browsers support the *.woff* format. Its newer version, *.woff2*, is widely supported by modern browsers and can be a good alternative.

{pagebreak}

Going with one format you can use a similar setup as for images and rely on both *file-loader* and *url-loader* while using the limit option:

```javascript
{
  test: /\.woff$/,
  use: {
    loader: "url-loader",
    options: {
      limit: 50000,
    },
  },
},
```

A more elaborate approach to achieve a similar result that includes *.woff2* and others, would be to end up with code as below:

```javascript
{
  // Match woff2 in addition to patterns like .woff?v=1.1.1.
  test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
  use: "url-loader",
  options: {
    // Limit at 50k. Above that it emits separate files
    limit: 50000,

    // url-loader sets mimetype if it's passed.
    // Without this it derives it from the file extension
    mimetype: "application/font-woff",

    // Output below fonts directory
    name: "./fonts/[name].[ext]",
  },
},
```

{pagebreak}

## Supporting Multiple Formats

In case you want to make sure the site looks good on a maximum amount of browsers, you can use *file-loader* and forget about inlining. Again, it's a trade-off as you get extra requests, but perhaps it's the right move. Here you could end up with a loader configuration:

```javascript
{
  test: /\.(ttf|eot|woff|woff2)$/,
  loader: "file-loader",
  options: {
    name: "fonts/[name].[ext]",
  },
},
```

The way you write your CSS definition matters. To make sure you are getting the benefit from the newer formats, they should become first in the definition. This way the browser picks them up.

```css
@font-face {
  font-family: "myfontfamily";
  src: url("./fonts/myfontfile.woff2") format("woff2"),
    url("./fonts/myfontfile.woff") format("woff"),
    url("./fonts/myfontfile.eot") format("embedded-opentype"),
    url("./fonts/myfontfile.ttf") format("truetype");
    /* Add other formats as you see fit */
}
```

T> [MDN discusses the font-family rule](https://developer.mozilla.org/en/docs/Web/CSS/@font-face) in detail.

{pagebreak}

## Manipulating *file-loader* Output Path and `publicPath`

As discussed above and in [webpack issue tracker](https://github.com/webpack/file-loader/issues/32#issuecomment-250622904), *file-loader* allows shaping the output. This way you can output your fonts below `fonts/`, images below `images/`, and so on over using the root.

Furthermore, it's possible to manipulate `publicPath` and override the default per loader definition. The following example illustrates these techniques together:

```javascript
{
  // Match woff2 and patterns like .woff?v=1.1.1.
  test: /\.woff2?(\?v=\d+\.\d+\.\d+)?$/,
  loader: "url-loader",
  options: {
    limit: 50000,
    mimetype: "application/font-woff",
    name: "./fonts/[name].[ext]", // Output below ./fonts
    publicPath: "../", // Take the directory into account
  },
},
```

## Generating Font Files Based on SVGs

If you prefer to use SVG based fonts, they can be bundled as a single font file by using [webfonts-loader](https://www.npmjs.com/package/webfonts-loader).

W> Take care with SVGs if you have SVG specific image setup in place already. If you want to process font SVGs differently, set their definitions carefully. The *Loader Definitions* chapter covers alternatives.

## Using Google Fonts

[google-fonts-webpack-plugin](https://www.npmjs.com/package/google-fonts-webpack-plugin) can download Google Fonts to webpack build directory or connect to them using a CDN.

## Using Font Awesome

The ideas above can be applied with [Font Awesome](https://www.npmjs.com/package/font-awesome). It's a collection of high-quality font icons you can refer to using CSS classes.

### Integrating Font Awesome to the Project

To integrate Font Awesome to the book project, install it first:

```bash
npm install font-awesome --save
```

Given Font Awesome doesn't define a `main` field in its *package.json* file, you need to point to it through a direct path instead of package name alone as follows:

**app/index.js**

```javascript
leanpub-start-insert
import "font-awesome/css/font-awesome.css";
leanpub-end-insert
...
```

Font Awesome includes Sass and Less versions as well, but given you have not set up either, this definition is enough.

T> The `import` could be cleaned up as `import "font-awesome"` by setting up a `resolve.alias`. The *Package Consuming Techniques* chapter discusses this idea in detail.

{pagebreak}

If you run the project now (`npm start`), webpack should give a long list of errors:

```bash
ERROR in ./node_modules/font-awesome/fonts/fontawesome-webfont.ttf?v=4.7.0
Module parse failed: Unexpected character '' (1:0)
You may need an appropriate loader to handle this file type.
(Source code omitted for this binary file)
 @ ./node_modules/css-loader!./node_modules/font-awesome/css/font-awesome.css 6:645-696
...
```

### Implementing Webpack Configuration

The result is expected as you haven't configured loaders for any of Font Awesome fonts yet and webpack doesn't know what to do with the files in question. To match the files and map them through *file-loader*, attach the following snippet to the project:

**webpack.parts.js**

```javascript
exports.loadFonts = ({ include, exclude, options } = {}) => ({
  module: {
    rules: [
      {
        // Capture eot, ttf, woff, and woff2
        test: /\.(eot|ttf|woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
        include,
        exclude,
        use: {
          loader: "file-loader",
          options,
        },
      },
    ],
  },
});
```

The idea is the same as for loading images. This time around you match font files. If you wanted, you could refactor the commonality to a function to share between the two.

You still need to connect the above with the main configuration:

**webpack.config.js**

```javascript
const commonConfig = merge([
  ...
leanpub-start-insert
  parts.loadFonts({
    options: {
      name: "[name].[ext]",
    },
  }),
leanpub-end-insert
]);
```

The project should run (`npm start`) without any errors now.

To see Font Awesome in action, adjust the application as follows:

**app/component.js**

```javascript
export default (text = "Hello world") => {
  const element = document.createElement("div");

leanpub-start-delete
  element.className = "pure-button";
leanpub-end-delete
leanpub-start-insert
  element.className = "fa fa-hand-spock-o fa-1g";
leanpub-end-insert
  element.innerHTML = text;

  return element;
}
```

{pagebreak}

If you build the application (`npm run build`), you should see that it processed and Font Awesome assets were included.

```bash
Hash: a1278d7c20953a506768
Version: webpack 3.8.1
Time: 1738ms
        Asset       Size  Chunks                    Chunk Names
  ...font.eot     166 kB          [emitted]
  ...font.ttf     166 kB          [emitted]
...font.woff2    77.2 kB          [emitted]
 ...font.woff      98 kB          [emitted]
  ...font.svg     444 kB          [emitted]  [big]
       app.js    4.18 kB       0  [emitted]         app
      app.css    3.51 kB       0  [emitted]         app
   index.html  218 bytes          [emitted]
  [0] ./app/index.js 161 bytes {0} [built]
  [3] ./app/main.css 41 bytes {0} [built]
  [4] ./app/component.js 193 bytes {0} [built]
...
```

The SVG file included in Font Awesome has been marked as `[big]`. It's beyond the performance budget defaults set by webpack and the topic is discussed in detail in the *Minifying* chapter.

T> [font-awesome-loader](https://www.npmjs.com/package/font-awesome-loader) allows more customization. Font Awesome 5 improves the situation further and make it easier to decide what fonts to consume. [Font Awesome wiki](https://github.com/FortAwesome/Font-Awesome/wiki/Customize-Font-Awesome) points to available online services that allow you to select specific fonts from Font Awesome collection.

{pagebreak}

## Conclusion

Loading fonts is similar to loading other assets. You have to consider the browsers you want to support and choose the loading strategy based on that.

To recap:

* When loading fonts, the same techniques as for images apply. You can choose to inline small fonts while bigger ones are served as separate assets.
* If you decide to provide first class support to only modern browsers, you can select only a font format or two and let the older browsers to use system level fonts.
* Using larger font collections, such as Font Awesome, can be problematic especially if you want to avoid loading additional rules. The problem is dependent on the packages in question and can be solved with webpack to an extent.

In the next chapter, you'll learn to load JavaScript using Babel and webpack. Webpack loads JavaScript by default but there's more to the topic as you have to consider what browsers you want to support.
