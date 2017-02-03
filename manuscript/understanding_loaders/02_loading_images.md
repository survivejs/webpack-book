# Loading Images

The easiest way to make your application slow is to load a lot of small assets. Each request comes with an overhead. HTTP/2 will help in this regard and change the situation somewhat drastically. Till then we are stuck with different approaches. Webpack allows a few of these. They are particularly relevant for loading images.

Webpack allows you to inline assets by using [url-loader](https://www.npmjs.com/package/url-loader). It will output your images as base64 strings within your JavaScript bundles. This will decrease the number of requests needed while growing the bundle size. It is enough to use *url-loader* during development. You may want to consider other alternatives for the production build, though.

Webpack gives control over the inlining process and can defer loading to [file-loader](https://www.npmjs.com/package/file-loader). *file-loader* outputs image files and returns paths to them instead of inlining. This technique works with other assets types, such as fonts, as we will see in the later chapters.

## Setting Up *url-loader*

*url-loader* is a good starting point and it's the perfect option for development purposes, as you don't have to care about the size of the resulting bundle. It comes with a *limit* option that can be used to defer image generation to *file-loader* after certain limit is reached. This way you can inline small files to your JavaScript bundles while generating separate files for the bigger ones.

If you use the limit option, you will need to install both *url-loader* and *file-loader* to your project. Assuming you have configured your styles correctly, webpack will resolve any `url()` statements your styling might have. You can of course point to the image assets through your JavaScript code as well.

It is important to note that if the limit option is used, *url-loader* will pass possible additional options to *file-loader* making it possible to configure its behavior further.

In order to load *.jpg* and *.png* files while inlining files below 25kB, we would set up a loader like this:

```javascript
{
  test: /\.(jpg|png)$/,
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
  test: /\.(jpg|png)$/,
  loader: 'file-loader',
  options: {
    name: '[path][name].[hash].[ext]',
  },
},
```

T> If you want to output your images below a specific directory, set it up like this: `name: './images/[hash].[ext]'`. Adjust to your liking.

W> Be careful not to apply both loaders on images at the same time! Use the `include` field for further control if *url-loader* `limit` isn't enough.

## Integrating Images to the Project

The ideas above can be wrapped in a small helper that can be integrated to the book project. To get started, install the dependencies:

```bash
npm i file-loader url-loader --save-dev
```

The functionality can be wrapped in a little helper:

**webpack.parts.js**

```javascript
exports.loadImages = function({ include, exclude, options } = {}) {
  return {
    module: {
      rules: [
        {
          test: /\.(png|jpg)$/,
          include: include,
          exclude: exclude,

          use: {
            loader: 'url-loader',
            options: options,
          },
        },
      ],
    },
  };
};
```

To attach it to the configuration, adjust as follows:

**webpack.config.js**

```javascript
...

const common = merge([
  ...
leanpub-start-insert
  parts.loadImages({
    options: {
      limit: 15000,
    },
  }),
leanpub-end-insert
]);

...
```

To test that the setup works, download an image and refer to it from the project like this:

**app/main.css**

```css
body {
  background: cornsilk;
leanpub-start-insert
  background-image: url('./logo.png');
  background-repeat: no-repeat;
leanpub-end-insert
  display: flex;
}
```

Note how the behavior changes depending on the `limit` you set. Below the limit it should inline the image while above it should emit a separate asset and a path to it.

The CSS lookup works because of *css-loader*. You can also try importing the image from JavaScript code and see what happens.

## Loading SVGs

Webpack has a [few ways](https://github.com/webpack/webpack/issues/595) to load SVGs. However, the simplest way is through *file-loader* as follows:

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

If you want the raw SVG content, you can use the [raw-loader](https://www.npmjs.com/package/raw-loader) for this purpose. [svg-inline-loader](https://www.npmjs.com/package/svg-inline-loader) goes a step further and eliminates unnecessary markup from your SVGs. These loaders can be useful if you want to inject the SVG content to directly to JavaScript or HTML markup.

[svg-sprite-loader](https://www.npmjs.com/package/svg-sprite-loader) can merge separate SVG files into a single sprite, making it potentially more effective to load as you avoid request overhead. It supports raster images (*.jpg*, *.png*) as well.

[react-svg-loader](https://www.npmjs.com/package/react-svg-loader) emits SVGs as React components meaning you could end up with code like `<Image width={50} height={50}/>` to render a SVG in your code after importing it.

T> You can still use *url-loader* and the aforementioned tips with SVGs too.

## Compressing Images

In case you want to compress your images, use [image-webpack-loader](https://www.npmjs.com/package/image-webpack-loader) or [svgo-loader](https://github.com/pozadi/svgo-loader) (SVG specific). This type of loader should be applied first to the data, so remember to place it as the last within `use` listing.

Compression is particularly useful for production builds as it will decrease the amount of bandwidth required to download your image assets and speed up your site or application as a result.

## Utilizing `srcset`

[resize-image-loader](https://www.npmjs.com/package/resize-image-loader) and [responsive-loader](https://www.npmjs.com/package/responsive-loader) allow you to generate `srcset` compatible collections of images. This is particularly useful with modern browsers. It gives more control to them over what images to load and when, resulting in higher performance.

## Referencing to Images

Webpack can pick up images from stylesheets through `@import` and `url()` assuming *css-loader* has been configured. You can also refer to your images within code. In this case, you'll have to import the files explicitly:

```jsx
const src = require('./avatar.png');

// Use the image in your code somehow now
const Profile = () => (
  <img src={src} />
);
```

If you are using React, then you use [babel-plugin-transform-react-jsx-img-import](https://www.npmjs.com/package/babel-plugin-transform-react-jsx-img-import) to generate the `require` automatically. In that case, you would end up with code like this:

```jsx
const Profile = () => (
  <img src="avatar.png" />
);
```

It is also possible to set up dynamic imports. This actually uses a feature known `require.context` internally. It is covered in greater detail in the *Code Splitting* chapter. Here's a small example:

```javascript
// The name of the avatar is received from somewhere
const src = require(`./avatars/${avatar}`);

...
```

## Getting Image Dimensions

Sometimes getting only reference to an image isn't enough. [image-size-loader](https://www.npmjs.com/package/image-size-loader) emits image dimensions, type, and size in addition to the reference to the image itself.

## Loading Sprites

A technique known as spriting allows you to combine multiple smaller images into a single image. It has been used for games to describe animations and it's useful for web development as well as you avoid request overhead.

[webpack-spritesmith](https://www.npmjs.com/package/webpack-spritesmith) converts provided images into a spritesheet and SASS/LESS/Stylus mixins. You have to set up a `SpritesmithPlugin`, point it to target images, and set the name of the generated mixin. After that, your styling can pick it up like this:

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

Sometimes you might want to load an image dynamically based on some condition. A webpack feature known as `require.context` can come in handy here. It still assumes the images are available within the file system, but if that's the case, then the technique can work. See the *Code Splitting* chapter for further information.

## Images and *css-loader* Source Map Gotcha

If you are using images and *css-loader* with the `sourceMap` option enabled, it is important that you will set `output.publicPath` to an absolute value. Otherwise, images won't show up. See [the relevant webpack issue](https://github.com/webpack/style-loader/issues/55) for further explanation.

## Conclusion

Webpack allows you to inline images within your bundles when needed. Figuring out good inlining limits for your images might take some experimentation. You have to balance between bundle sizes and the number of requests.
