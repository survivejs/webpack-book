# Loading Images

HTTP/1 application can be made slow by loading a lot of small assets. Each request comes with an overhead. HTTP/2 will help in this regard and change the situation somewhat drastically. Till then you are stuck with different approaches. Webpack allows a couple of these. They are particularly relevant for loading images.

Webpack allows you to inline assets by using [url-loader](https://www.npmjs.com/package/url-loader). It will output your images as base64 strings within your JavaScript bundles. The process will decrease the number of requests needed while growing the bundle size. It is enough to use *url-loader* during development. You may want to consider other alternatives for the production build, though.

Webpack gives control over the inlining process and can defer loading to [file-loader](https://www.npmjs.com/package/file-loader). *file-loader* outputs image files and returns paths to them instead of inlining. This technique works with other assets types, such as fonts, as you will see in the later chapters.

## Setting Up *url-loader*

*url-loader* is a good starting point and it's the perfect option for development purposes, as you don't have to care about the size of the resulting bundle. It comes with a *limit* option that can be used to defer image generation to *file-loader* after a certain limit is reached. This way you can inline small files to your JavaScript bundles while generating separate files for the bigger ones.

If you use the limit option, you will need to install both *url-loader* and *file-loader* to your project. Assuming you have configured your styles correctly, webpack will resolve any `url()` statements your styling contains. You can point to the image assets through your JavaScript code as well.

It is important to note that if the limit option is used, *url-loader* will pass possible additional options to *file-loader* making it possible to configure its behavior further.

To load *.jpg*, *.png*, and *.svg* files while inlining files below 25kB, you would set up a loader like this:

```javascript
{
  test: /\.(jpg|png|svg)$/,
  loader: 'url-loader',
  options: {
    limit: 25000,
  },
},
```

## Setting Up *file-loader*

If you want to skip inlining altogether, you can use *file-loader* directly. The following setup customizes the resulting filename. By default, *file-loader* returns the MD5 hash of the file's contents with the original extension:

```javascript
{
  test: /\.(jpg|png|svg)$/,
  loader: 'file-loader',
  options: {
    name: '[path][name].[hash].[ext]',
  },
},
```

T> If you want to output your images below a particular directory, set it up like this: `name: './images/[hash].[ext]'`. Adjust to your liking.

W> Be careful not to apply both loaders on images at the same time! Use the `include` field for further control if *url-loader* `limit` isn't enough.

## Integrating Images to the Project

The ideas above can be wrapped in a small helper that can be incorporated into the book project. To get started, install the dependencies:

```bash
npm install file-loader url-loader --save-dev
```

Set up a function as below:

**webpack.parts.js**

```javascript
...

exports.loadImages = function({ include, exclude, options } = {}) {
  return {
    module: {
      rules: [
        {
          test: /\.(png|jpg|svg)$/,
          include,
          exclude,

          use: {
            loader: 'url-loader',
            options,
          },
        },
      ],
    },
  };
};
```

To attach it to the configuration, adjust as follows. You will default to *url-loader* during development and use both *url-loader* and *file-loader* in production to maintain smaller bundle sizes. *url-loader* uses *file-loader* implicitly when `limit` is set and both have to be installed for the setup to work.

**webpack.config.js**

```javascript
...

const productionConfig = merge([
  ...
leanpub-start-insert
  parts.loadImages({
    options: {
      limit: 15000,
      name: '[name].[ext]',
    },
  }),
leanpub-end-insert
]);

const developmentConfig = merge([
  ...
leanpub-start-insert
  parts.loadImages(),
leanpub-end-insert
]);

...
```

To test that the setup works, download an image or generate it (`convert -size 100x100 gradient:blue logo.png`) and refer to it from the project like this:

**app/main.css**

```css
body {
  background: cornsilk;
leanpub-start-insert
  background-image: url('./logo.png');
  background-repeat: no-repeat;
  background-position: center;
leanpub-end-insert
  display: flex;
}
```

Note how the behavior changes depending on the `limit` you set. Below the limit, it should inline the image while above it should emit a separate asset and a path to it.

The CSS lookup works because of *css-loader*. You can also try importing the image from JavaScript code and see what happens.

## Loading SVGs

Webpack allows a [couple ways](https://github.com/webpack/webpack/issues/595) to load SVGs. However, the easiest way is through *file-loader* as follows:

```javascript
{
  test: /\.svg$/,
  use: 'file-loader',
},
```

Assuming you have set up your styling correctly, you can refer to your SVG files like this. The example SVG path below is relative to the CSS file:

```css
.icon {
   background-image: url('../assets/icon.svg');
}
```

If you want the raw SVG content, you can use the [raw-loader](https://www.npmjs.com/package/raw-loader) for this purpose. [svg-inline-loader](https://www.npmjs.com/package/svg-inline-loader) goes a step further and eliminates unnecessary markup from your SVGs. These loaders can be valuable if you want to inject the SVG content to directly to JavaScript or HTML markup.

[svg-sprite-loader](https://www.npmjs.com/package/svg-sprite-loader) can merge separate SVG files into a single sprite, making it potentially more efficient to load as you avoid request overhead. It supports raster images (*.jpg*, *.png*) as well.

[react-svg-loader](https://www.npmjs.com/package/react-svg-loader) emits SVGs as React components meaning you could end up with code like `<Image width={50} height={50}/>` to render a SVG in your code after importing it.

T> You can still use *url-loader* and the tips above with SVGs too.

## Optimizing Images

In case you want to compress your images, use [image-webpack-loader](https://www.npmjs.com/package/image-webpack-loader), [svgo-loader](https://www.npmjs.com/package/svgo-loader) (SVG specific), or [imagemin-webpack-plugin](https://www.npmjs.com/package/imagemin-webpack-plugin). This type of loader should be applied first to the data, so remember to place it as the last within `use` listing.

Compression is particularly valuable for production builds as it will decrease the amount of bandwidth required to download your image assets and speed up your site or application as a result.

## Utilizing `srcset`

[resize-image-loader](https://www.npmjs.com/package/resize-image-loader) and [responsive-loader](https://www.npmjs.com/package/responsive-loader) allow you to generate `srcset` compatible collections of images for modern browsers. `srcset` gives more control to the browsers over what images to load and when resulting in higher performance.

## Referencing to Images

Webpack can pick up images from stylesheets through `@import` and `url()` assuming *css-loader* has been configured. You can also refer to your images within code. In this case, you'll have to import the files explicitly:

```javascript
const src = require('./avatar.png');

// Use the image in your code somehow now
const Profile = () => (
  <img src={src} />
);
```

If you are using React, then you use [babel-plugin-transform-react-jsx-img-import](https://www.npmjs.com/package/babel-plugin-transform-react-jsx-img-import) to generate the `require` automatically. In that case, you would end up with code like this:

```javascript
const Profile = () => (
  <img src="avatar.png" />
);
```

It is also possible to set up dynamic imports as discussed in the *Code Splitting* chapter. Here's a small example:

```javascript
// The name of the avatar is received from somewhere
const src = require(`./avatars/${avatar}`);

...
```

## Getting Image Dimensions

Sometimes getting the only reference to an image isn't enough. [image-size-loader](https://www.npmjs.com/package/image-size-loader) emits image dimensions, type, and size in addition to the reference to the image itself.

## Loading Sprites

**Spriting** technique allows you to combine multiple smaller images into a single image. It has been used for games to describe animations and it's valuable for web development as well as you avoid request overhead.

[webpack-spritesmith](https://www.npmjs.com/package/webpack-spritesmith) converts provided images into a sprite sheet and Sass/Less/Stylus mixins. You have to set up a `SpritesmithPlugin`, point it to target images, and set the name of the generated mixin. After that, your styling can pick it up like this:

```sass
@import '~sprite.sass';

.close-button {
  sprite($close);
}

.open-button {
  sprite($open);
}
```

## Loading Images Dynamically

Webpack allows you to load images dynamically based on a condition. The techniques covered in the *Code Splitting* chapter are enough for this purpose. Doing this can save bandwidth and load images only when you need them or preload them while you have time.

## Images and *css-loader* Source Map Gotcha

If you are using images and *css-loader* with the `sourceMap` option enabled, it is important that you will set `output.publicPath` to an absolute value pointing to your development server. Otherwise, images won't show up. See [the relevant webpack issue](https://github.com/webpack/style-loader/issues/55) for further explanation.

## Conclusion

Webpack allows you to inline images within your bundles when needed. Figuring out proper inlining limits for your images requires experimentation. You have to balance between bundle sizes and the number of requests.

To recap:

* *url-loader* inlines the assets within JavaScript. It comes with a `limit` option that allows you to defer assets above it to *file-loader*.
* *file-loader* emits image assets and returns paths to them to the code. It allows hashing the asset names.
* You can find image optimization related loaders and plugins that allow you to tune their size further.
* It is possible to generate **sprite sheets** out of smaller images to combine them into a single request.
* Webpack allows you to load images dynamically based on a given condition.
* If you are using source maps, you should remember to set `output.publicPath` to an absolute value for the images to show up.

I will explain how to load fonts using webpack in the next chapter.
