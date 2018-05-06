# Eliminating Unused CSS

Frameworks like [Bootstrap](https://getbootstrap.com/) tend to come with a lot of CSS. Often you use only a small part of it. Typically, you bundle even the unused CSS. It's possible, however, to eliminate the portions you aren't using.

[PurifyCSS](https://www.npmjs.com/package/purifycss) is a tool that can achieve this by analyzing files. It walks through your code and figures out which CSS classes are being used. Often there is enough information for it to strip unused CSS from your project. It also works with single page applications to an extent.

[uncss](https://www.npmjs.com/package/uncss) is a good alternative to PurifyCSS. It operates through PhantomJS and performs its work differently. You can use uncss itself as a PostCSS plugin.

W> You have to be careful if you are using CSS Modules. You have to **whitelist** the related classes as discussed in [purifycss-webpack readme](https://github.com/webpack-contrib/purifycss-webpack#usage-with-css-modules).

## Setting Up Pure.css

To make the demo more realistic, let's install [Pure.css](http://purecss.io/), a small CSS framework, as well and refer to it from the project so that you can see PurifyCSS in action. These two projects aren't related in any way despite the naming.

```bash
npm install purecss --save
```

{pagebreak}

To make the project aware of Pure.css, `import` it:

**src/index.js**

```javascript
leanpub-start-insert
import "purecss";
leanpub-end-insert
...
```

T> The `import` works because webpack will resolve against `"browser": "build/pure-min.css",` field in the *package.json* file of Pure.css due to [resolve.mainFields](https://webpack.js.org/configuration/resolve/#resolve-mainfields). Webpack will try to resolve possible `browser` and `module` fields before looking into `main`.

You should also make the demo component use a Pure.css class, so there is something to work with:

**src/component.js**

```javascript
export default (text = "Hello world") => {
  const element = document.createElement("div");

leanpub-start-insert
  element.className = "pure-button";
leanpub-end-insert
  element.innerHTML = text;

  return element;
};
```

If you run the application (`npm start`), the "Hello world" should look like a button.

![Styled hello](images/styled-button.png)

Building the application (`npm run build`) should yield output:

```bash
Hash: 36bff4e71a3f746d46fa
Version: webpack 4.1.1
Time: 739ms
Built at: 3/16/2018 4:26:49 PM
     Asset       Size  Chunks             Chunk Names
   main.js  747 bytes       0  [emitted]  main
  main.css   16.1 KiB       0  [emitted]  main
index.html  220 bytes          [emitted]
...
```

As you can see, the size of the CSS file grew, and this is something to fix with PurifyCSS.

## Enabling PurifyCSS

Using PurifyCSS can lead to significant savings. In the example of the project, they purify and minify Bootstrap (140 kB) in an application using ~40% of its selectors to mere ~35 kB. That's a big difference.

{pagebreak}

[purifycss-webpack](https://www.npmjs.com/package/purifycss-webpack) allows to achieve similar results. You should use the `MiniCssExtractPlugin` with it for the best results. Install it and a [glob](https://www.npmjs.org/package/glob) helper first:

```bash
npm install glob purifycss-webpack purify-css --save-dev
```

You also need PurifyCSS configuration as below:

**webpack.parts.js**

```javascript
const PurifyCSSPlugin = require("purifycss-webpack");

exports.purifyCSS = ({ paths }) => ({
  plugins: [new PurifyCSSPlugin({ paths })],
});
```

Next, the part has to be connected with the configuration. It's essential the plugin is used *after* the `MiniCssExtractPlugin`; otherwise, it doesn't work:

**webpack.config.js**

```javascript
...
leanpub-start-insert
const path = require("path");
const glob = require("glob");
leanpub-end-insert

const parts = require("./webpack.parts");

leanpub-start-insert
const PATHS = {
  app: path.join(__dirname, "src"),
};
leanpub-end-insert

...

const productionConfig = merge([
  ...
leanpub-start-insert
  parts.purifyCSS({
    paths: glob.sync(`${PATHS.app}/**/*.js`, { nodir: true }),
  }),
leanpub-end-insert
]);
```

W> The order matters. CSS extraction has to happen before purifying.

If you execute `npm run build` now, you should see something:

```bash
Hash: 36bff4e71a3f746d46fa
Version: webpack 4.1.1
Time: 695ms
Built at: 3/16/2018 4:29:54 PM
     Asset       Size  Chunks             Chunk Names
   main.js  747 bytes       0  [emitted]  main
  main.css   2.07 KiB       0  [emitted]  main
index.html  220 bytes          [emitted]
...
```

The size of the style has decreased noticeably. Instead of 16k, you have roughly 2k now. The difference would be even more significant for more massive CSS frameworks.

PurifyCSS supports [additional options](https://github.com/purifycss/purifycss#the-optional-options-argument) including `minify`. You can enable these through the `purifyOptions` field when instantiating the plugin. Given PurifyCSS cannot pick all of the classes you are always using, you should use `purifyOptions.whitelist` array to define selectors which it should leave in the result no matter what.

W> Using PurifyCSS loses CSS source maps even if you have enabled them with loader specific configuration due to the way it works underneath.

{pagebreak}

### Critical Path Rendering

The idea of [critical path rendering](https://developers.google.com/web/fundamentals/performance/critical-rendering-path/) takes a look at CSS performance from a different angle. Instead of optimizing for size, it optimizes for render order and emphasizes **above-the-fold** CSS. The result is achieved by rendering the page and then figuring out which rules are required to obtain the shown result.

[webpack-critical](https://www.npmjs.com/package/webpack-critical) and [html-critical-webpack-plugin](https://www.npmjs.com/package/html-critical-webpack-plugin) implement the technique as a `HtmlWebpackPlugin` plugin. [isomorphic-style-loader](https://www.npmjs.com/package/isomorphic-style-loader) achieves the same using webpack and React.

[critical-path-css-tools](https://github.com/addyosmani/critical-path-css-tools) by Addy Osmani lists other related tools.

## Conclusion

Using PurifyCSS can lead to a significant decrease in file size. It's mainly valuable for static sites that rely on a massive CSS framework. The more dynamic a site or an application becomes, the harder it becomes to analyze reliably.

To recap:

* Eliminating unused CSS is possible using PurifyCSS. It performs static analysis against the source.
* The functionality can be enabled through *purifycss-webpack*, and the plugin should be applied *after* `MiniCssExtractPlugin`.
* At best, PurifyCSS can eliminate most, if not all, unused CSS rules.
* Critical path rendering is another CSS technique that emphasizes rendering the above-the-fold CSS first. The idea is to render something as fast as possible instead of waiting for all CSS to load.

In the next chapter, you'll learn to **autoprefix**. Enabling the feature makes it more convenient to develop complicated CSS setups that work with older browsers as well.
