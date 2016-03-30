# Loading Images

The easiest way to make your application slow is to load a lot of small assets. Each request comes with an overhead after all. HTTP/2 will help in this regard and change the situation somewhat drastically. Till then we are stuck with different approaches. Webpack allows a few of these. They are particularly relevant for loading images.

Webpack allows you to inline assets by using [url-loader](https://www.npmjs.com/package/url-loader). It will output your images as BASE64 strings within your JavaScript bundles. This will decrease the amount of requests needed while growing the bundle size. Given too large bundles aren't fun either, Webpack allows you to control the inlining process and defer loading to [file-loader](https://www.npmjs.com/package/file-loader) that outputs image files and returns paths to them.

## Setting Up *url-loader*

If you want to use *url-loader* and its *limit* feature, you will need to install both *url-loader* and *file-loader* to your project. Assuming you have configured your styles correctly, Webpack will resolve any `url()` statements your styling might have. You can of course point to the image assets through your JavaScript code as well.

In order to load *.jpg* and *.png* files while inlining files below 25kB, we would set up a loader like this:

```javascript
{
  test: /\.(jpg|png)$/,
  loader: 'url?limit=25000'
  include: PATHS.images
}
```

## Setting Up *file-loader*

If you want to skip inlining, you can use *file-loader* directly. The following setup customizes the resulting filename. By default *file-loader* returns the MD5 hash of the file's contents with the original extension:

```javascript
{
  test: /\.(jpg|png)$/,
  loader: 'file?name=[path][name].[hash].[ext]'
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
   background-image: url(../assets/icon.svg);
}
```

T> For SVG compression check out the [svgo-loader](https://github.com/pozadi/svgo-loader).

## Conclusion

Webpack allows you to inline images within your bundles when needed. Figuring out good inlining limits for your images might take some experimentation. You have to balance between bundle sizes and the amount of requests.
