# Autoprefixing

It can be difficult to remember which vendor prefixes you have to use for specific CSS rules to support a large variety of users. This is where **autoprefixing** comes in. It can be enabled through PostCSS and the [autoprefixer](https://www.npmjs.com/package/autoprefixer) plugin. *autoprefixer* uses [Can I Use](http://caniuse.com/) service to figure out which rules should be prefixed and its behavior can be tuned further.

## Setting Up Autoprefixing

Achieving autoprefixing takes a small addition to the current setup. Install *postcss-loader* and *autoprefixer* first:

```bash
npm install postcss-loader autoprefixer --save-dev
```

Add a fragment enabling autoprefixing like this:

**webpack.parts.js**

```javascript
...

exports.autoprefix = function() {
  return {
    loader: 'postcss-loader',
    options: {
      plugins: function () {
        return [
          require('autoprefixer'),
        ];
      },
    },
  };
};
```

To connect the loader with `ExtractTextPlugin`, hook it up as follows:

**webpack.config.js**

```javascript
...

function production() {
  return merge([
    ...
leanpub-start-delete
    parts.extractCSS({ use: 'css-loader' }),
leanpub-end-delete
leanpub-start-insert
    parts.extractCSS({
      use: ['css-loader', parts.autoprefix()],
    }),
leanpub-end-insert
  ]);
}

...
```

To confirm that the setup works, we should have something to autoprefix. Adjust the CSS like this:

**app/main.css**

```css
body {
  background: cornsilk;
leanpub-start-insert
  display: flex;
leanpub-end-insert
}
```

If you build the application now (`npm run build`) and examine the built CSS, you should be able to find a declaration like this there:

```css
body {
  background: cornsilk;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
}
```

As you can see, autoprefixing expands the rules so we don't have to remember to do that.

If you know what browsers you support, it is possible to set up a [browserslist](https://www.npmjs.com/package/browserslist) file. Different tools pick up this definition, *autoprefixer* included. Consider the example below where we select only specific browsers:

**browserslist**

```
> 1% # Browser usage over 1%
Last 2 versions # Last two versions too
IE 8 # And IE 8
```

## Managing Styles Outside of JavaScript

Even though referring to styling through JavaScript and then bundling is a valid option, it is possible to achieve the same result through an `entry` and [globbing](https://www.npmjs.com/package/glob). The basic idea goes like this:

```javascript
...
const glob = require('glob');

// Glob CSS files as an array of CSS files
const PATHS = {
  app: path.join(__dirname, 'app'),
  build: path.join(__dirname, 'build'),
  style: glob.sync('./app/**/*.css'),
};

...

const common = merge([
  {
    entry: {
      app: PATHS.app,
      style: PATHS.style,
    },
    ...
  },
  ...
]);
```

After this type of change, you would not have to refer to styling from your application code. It also means that CSS Modules won't work anymore. As a result, you should get both *style.css* and *style.js*. The latter file will contain roughly content like `webpackJsonp([1,3],[function(n,c){}]);` and it doesn't do anything useful. This is [a known limitation](https://github.com/webpack/webpack/issues/1967) in webpack.

The approach can be useful if you have to port a legacy project relying on CSS concatenation. If you want strict control over the ordering, you can set up a single CSS entry and then use `@import` to bring the rest to the project through it. Another option would be to set up a JavaScript entry and go through `import` to get the same effect.

## Conclusion

Autoprefixing is a handy technique as it decreases the amount of work needed while crafting CSS. You can maintain minimum browser requirements within a *browserslist* file. The tooling can then use that information to generate optimal output.
