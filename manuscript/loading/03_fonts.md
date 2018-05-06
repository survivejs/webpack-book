# Loading Fonts

Loading fonts is similar to loading images. It does come with unique challenges, though. How to know what font formats to support? There can be up to four font formats to worry about if you want to provide first class support to each browser.

The problem can be solved by deciding a set of browsers and platforms that should receive first class service. The rest can use system fonts.

You can approach the problem in several ways through webpack. You can still use *url-loader* and *file-loader* as with images. Font `test` patterns tend to be more complicated, though, and you have to worry about font file related lookups.

T> [canifont](https://www.npmjs.com/package/canifont) helps you to figure out which font formats you should support. It accepts a **.browserslistrc** definition and then checks font support of each browser based on the definition.

## Choosing One Format

If you exclude Opera Mini, all browsers support the *.woff* format. Its newer version, *.woff2*, is widely supported by modern browsers and can be a good alternative.

{pagebreak}

Going with one format, you can use a similar setup as for images and rely on both *file-loader* and *url-loader* while using the limit option:

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

A more elaborate approach to achieve a similar result that includes *.woff2* and others would be to end up with the code as below:

```javascript
{
  // Match woff2 in addition to patterns like .woff?v=1.1.1.
  test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
  use: {
    loader: "url-loader",
    options: {
      // Limit at 50k. Above that it emits separate files
      limit: 50000,

      // url-loader sets mimetype if it's passed.
      // Without this it derives it from the file extension
      mimetype: "application/font-woff",

      // Output below fonts directory
      name: "./fonts/[name].[ext]",
    }
  },
},
```

{pagebreak}

## Supporting Multiple Formats

In case you want to make sure the site looks good on a maximum amount of browsers, you can use *file-loader* and forget about inlining. Again, it's a trade-off as you get extra requests, but perhaps it's the right move. Here you could end up with a loader configuration:

```javascript
{
  test: /\.(ttf|eot|woff|woff2)$/,
  use: {
    loader: "file-loader",
    options: {
      name: "fonts/[name].[ext]",
    },
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
  use: {
    loader: "url-loader",
    options: {
      limit: 50000,
      mimetype: "application/font-woff",
      name: "./fonts/[name].[ext]", // Output below ./fonts
      publicPath: "../", // Take the directory into account
    },
  },
},
```

## Generating Font Files Based on SVGs

If you prefer to use SVG based fonts, they can be bundled as a single font file by using [webfonts-loader](https://www.npmjs.com/package/webfonts-loader).

W> Take care with SVG images if you have SVG specific image setup in place already. If you want to process font SVGs differently, set their definitions carefully. The *Loader Definitions* chapter covers alternatives.

## Using Google Fonts

[google-fonts-webpack-plugin](https://www.npmjs.com/package/google-fonts-webpack-plugin) can download Google Fonts to webpack build directory or connect to them using a CDN.

## Using Icon Fonts

[iconfont-webpack-plugin](https://www.npmjs.com/package/iconfont-webpack-plugin) was designed to simplify loading icon based fonts. It inlines SVG references within CSS files.

## Conclusion

Loading fonts is similar to loading other assets. You have to consider the browsers you want to support and choose the loading strategy based on that.

To recap:

* When loading fonts, the same techniques as for images apply. You can choose to inline small fonts while bigger ones are served as separate assets.
* If you decide to provide first class support to only modern browsers, you can select only a font format or two and let the older browsers to use system level fonts.

In the next chapter, you'll learn to load JavaScript using Babel and webpack. Webpack loads JavaScript by default, but there's more to the topic as you have to consider what browsers you want to support.
