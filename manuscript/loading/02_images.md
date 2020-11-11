# Loading Images

Image loading and processing can be a concern when developing sites and applications. The problem can be solved by pushing the images to a separate service that then takes care of optimizing them and provides an interface for consuming them.

For smaller scale usage, webpack is a good option as it can both consume and process images. Doing this comes with build overhead depending on the types of operations you are performing.

Starting from webpack 5, the tool supports [asset modules](https://webpack.js.org/guides/asset-modules/). Earlier dealing with assets required using loaders such as[url-loader](https://www.npmjs.com/package/url-loader) and [file-loader](https://www.npmjs.com/package/file-loader) but now the functionality is integrated to webpack. The following options are supported at a loader definition:

- `type: "asset/inline"` emits your resources as base64 strings within the emitted assets. The process decreases the number of requests needed while growing the bundle size. The behavior corresponds with **url-loader**.
- `type: "asset/resource"` matches the behavior of **file-loader** and emits resources as separate files while writing references to them.
- `type: "asset/source"` matches [raw-loader](https://www.npmjs.com/package/raw-loader) and returns full source of the matched resource.
- `type: "asset"` is a mixture between `asset/inline` and `asset/source` and it will alter the behavior depending on the asset size. It's comparable to using the `limit` option of **file-loader** earlier.

`output.assetModuleFilename` field can be used to control where the assets are emitted. You could for example set it to `[hash][ext][query]` or include a directory to the path before these fragments.

{pagebreak}

## Integrating images to the project

The syntax above can be wrapped in a small helper that can be incorporated into the book project. Set up a function as below:

**webpack.parts.js**

```javascript
exports.loadImages = ({ limit } = {}) => ({
  module: {
    rules: [
      {
        test: /\.(png|jpg)$/,
        type: "asset",
        parser: { dataUrlCondition: { maxSize: limit } },
      },
    ],
  },
});
```

To attach it to the configuration, adjust as follows:

**webpack.config.js**

```javascript
const commonConfig = merge([
  ...
leanpub-start-insert
  parts.loadImages({ limit: 15000 }),
leanpub-end-insert
]);
```

To test that the setup works, download an image or generate it (`convert -size 100x100 gradient:blue logo.png`) and refer to it from the project:

**src/main.css**

```css
body {
  background: cornsilk;
leanpub-start-insert
  background-image: url("./logo.png");
  background-repeat: no-repeat;
  background-position: center;
leanpub-end-insert
}
```

The behavior changes depending on the `limit` you set. Below the limit, it should inline the image while above it should emit a separate asset and a path to it. The CSS lookup works because of **css-loader**. You can also try importing the image from JavaScript code and see what happens.

## Using `srcset`s

Modern browsers support `srcset` attribute that lets you define an image in different resolutions. The browser can then choose the one that fits the display the best. The main options are [resize-image-loader](https://www.npmjs.com/package/resize-image-loader), [html-loader-srcset](https://www.npmjs.com/package/html-loader-srcset), and [responsive-loader](https://www.npmjs.com/package/responsive-loader).

## Optimizing images

In case you want to compress your images, use [image-webpack-loader](https://www.npmjs.com/package/image-webpack-loader), [svgo-loader](https://www.npmjs.com/package/svgo-loader) (SVG specific), or [imagemin-webpack-plugin](https://www.npmjs.com/package/imagemin-webpack-plugin). This type of loader should be applied first to the data, so remember to place it as the last within `use` listing.

Compression is particularly valuable for production builds as it decreases the amount of bandwidth required to download your image assets and speed up your site or application as a result.

## Loading SVGs

Webpack allows a [couple ways](https://github.com/webpack/webpack/issues/595) to load SVGs. However, the easiest way is to set `type` as follows:

```javascript
const config = { test: /\.svg$/, type: "asset" };
```

Assuming you have set up your styling correctly, you can refer to your SVG files as below. The example SVG path below is relative to the CSS file:

```css
.icon {
  background-image: url("../assets/icon.svg");
}
```

Consider also the following loaders:

- [svg-inline-loader](https://www.npmjs.com/package/svg-inline-loader) goes a step further and eliminates unnecessary markup from your SVGs.
- [svg-sprite-loader](https://www.npmjs.com/package/svg-sprite-loader) can merge separate SVG files into a single sprite, making it potentially more efficient to load as you avoid request overhead. It supports raster images (_.jpg_, _.png_) as well.
- [svg-url-loader](https://www.npmjs.com/package/svg-url-loader) loads SVGs as UTF-8 encoded data urls. The result is smaller and faster to parse than base64.
- [@svgr/webpack](https://www.npmjs.com/package/@svgr/webpack) exposes imported SVGs as React components to consume.

## Loading images dynamically

Webpack allows you to load images dynamically based on a condition. The techniques covered in the _Code Splitting_ and _Dynamic Loading_ chapters are enough for this purpose. Doing this can save bandwidth and load images only when you need them or preload them while you have time.

## Loading sprites

**Spriting** technique allows you to combine multiple smaller images into a single image. It has been used for games to describe animations and it's valuable for web development as well as you avoid request overhead.

[webpack-spritesmith](https://www.npmjs.com/package/webpack-spritesmith) converts provided images into a sprite sheet and Sass/Less/Stylus mixins. You have to set up a `SpritesmithPlugin`, point it to target images, and set the name of the generated mixin. After that, your styling can pick it up:

```scss
@import "~sprite.sass";

.close-button {
  sprite($close);
}

.open-button {
  sprite($open);
}
```

## Using placeholders

[image-trace-loader](https://www.npmjs.com/package/image-trace-loader) loads images and exposes the results as `image/svg+xml` URL encoded data. It can be used in conjunction with **file-loader** and **url-loader** for showing a placeholder while the actual image is being loaded.

[lqip-loader](https://www.npmjs.com/package/lqip-loader) implements a similar idea. Instead of tracing, it provides a blurred image instead of a traced one.

## Getting image dimensions

Sometimes getting the only reference to an image isn't enough. [image-size-loader](https://www.npmjs.com/package/image-size-loader) emits image dimensions, type, and size in addition to the reference to the image itself.

## Referencing to images

Webpack can pick up images from style sheets through `@import` and `url()` assuming **css-loader** has been configured. You can also refer to your images within the code. In this case, you have to import the files explicitly:

```javascript
import src from "./avatar.png";

// Use the image in your code somehow now
const Profile = () => <img src={src} />;
```

Starting from webpack 5, it's possible to achieve the same without an import like this:

```javascript
const Profile = () => (
  <img src={new URL("./avatar.png", import.meta.url)} />
);
```

The benefit of using the [URL interface](https://developer.mozilla.org/en-US/docs/Web/API/URL) is that it lets the code work without using a bundler.

It's also possible to set up dynamic imports as discussed in the _Code Splitting_ chapter. Here's a small example: `const src = require(`./avatars/\${avatar}`);`.

## Images and **css-loader** source map gotcha

If you are using images and **css-loader** with the `sourceMap` option enabled, it's important that you set `output.publicPath` to an absolute value pointing to your development server. Otherwise, images aren't going to work. See [the relevant webpack issue](https://github.com/webpack/style-loader/issues/55) for further explanation.

## Conclusion

Webpack allows you to inline images within your bundles when needed. Figuring out proper inlining limits for your images requires experimentation. You have to balance between bundle sizes and the number of requests.

To recap:

- Use loader `type` field to set asset loading behavior. It replaces **file-loader** and **url-loader** used before webpack 5.
- You can find image optimization related loaders and plugins that allow you to tune their size further.
- It's possible to generate **sprite sheets** out of smaller images to combine them into a single request.
- Webpack allows you to load images dynamically based on a given condition.
- If you are using source maps, you should remember to set `output.publicPath` to an absolute value for the images to show up.

You'll learn to load fonts using webpack in the next chapter.
