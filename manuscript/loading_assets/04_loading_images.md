# Loading Images

The easiest way to make your application slow is to load a lot of small assets. Each request comes with an overhead after all. HTTP/2 will help in this regard and change the situation somewhat drastically. Till then we are stuck with different approaches. Webpack allows a few of these. They are particularly relevant for loading images.

Webpack allows you to inline assets by using [url-loader](https://www.npmjs.com/package/url-loader). It will output your images as BASE64 strings within your JavaScript bundles. This will decrease the amount of requests needed while growing the bundle size. Given too large bundles aren't fun either, Webpack allows you to control the inlining process and defer loading to [file-loader](https://www.npmjs.com/package/file-loader) that outputs image files and returns paths to them.

## Setting Up *url-loader*

*url-loader* is a good starting point and it's the perfect option for development purposes as you don't have to care about the size of the resulting bundle. It comes with a *limit* option that can be used defer image generation to *file-loader* after certain limit is reached. This way you can inline small files to your JavaScript bundles while generating separate files for the bigger ones.

If you use the limit option, you will need to install both *url-loader* and *file-loader* to your project. Assuming you have configured your styles correctly, Webpack will resolve any `url()` statements your styling might have. You can of course point to the image assets through your JavaScript code as well.

In order to load *.jpg* and *.png* files while inlining files below 25kB, we would set up a loader like this:

```javascript
{
  test: /\.(jpg|png)$/,
  loader: 'url?limit=25000',
  include: PATHS.images
}
```

## Setting Up *file-loader*

If you want to skip inlining altogether, you can use *file-loader* directly. The following setup customizes the resulting filename. By default *file-loader* returns the MD5 hash of the file's contents with the original extension:

```javascript
{
  test: /\.(jpg|png)$/,
  loader: 'file?name=[path][name].[hash].[ext]',
  include: PATHS.images
}
```

## Loading SVGs

Webpack has a [few ways](https://github.com/webpack/webpack/issues/595) to load SVGs. However the simplest way is through *file-loader* as follows:

```javascript
{
  test: /\.svg$/,
  loader: 'file',
  include: PATHS.images
}
```

Assuming you have set up your styling correctly, you can refer to your SVG files like this. The example SVG path below is relative to the CSS file:

```css
.icon {
   background-image: url('../assets/icon.svg');
}
```

If you want the raw SVG content, you can use the [raw-loader](https://www.npmjs.com/package/raw-loader) for this purpose. This can be useful if you want to inject the SVG content to directly to JavaScript or HTML markup.

## Compressing Images

In case you want to compress your images, use [image-webpack-loader](https://www.npmjs.com/package/image-webpack-loader) or [svgo-loader](https://github.com/pozadi/svgo-loader) (SVG specific). This type of loader should be applied first to the data so remember to place it as the last within `loaders` listing.

Compression is particularly useful during production usage as it will decrease the amount of bandwidth required to download your image assets and speed up your site or application as a result.

## Referencing to Images

Webpack can pick up images from stylesheets through `@import` and `url()` assuming *css-loader* has been configured. You can also refer to your images within code. In this case you'll have to import the files explicitly

```jsx
const src = require('./avatar.png');

// Use the image in your code somehow now
const Profile = () => (
  <img src={src} />
);
```

If you are using React, then you use [babel-plugin-transform-react-jsx-img-import](https://www.npmjs.com/package/babel-plugin-transform-react-jsx-img-import) to generate the `require` automatically. In that case you would end up with code like this:

```jsx
const Profile = () => (
  <img src="avatar.png" />
);
```

## Conclusion

Webpack allows you to inline images within your bundles when needed. Figuring out good inlining limits for your images might take some experimentation. You have to balance between bundle sizes and the amount of requests.
