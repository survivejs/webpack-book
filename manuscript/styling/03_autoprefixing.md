# Autoprefixing

It can be difficult to remember which vendor prefixes you have to use for specific CSS rules to support a large variety of users. **Autoprefixing** solves this problem. It can be enabled through PostCSS and the [autoprefixer](https://www.npmjs.com/package/autoprefixer) plugin. *autoprefixer* uses [Can I Use](http://caniuse.com/) service to figure out which rules should be prefixed and its behavior can be tuned further.

## Setting Up Autoprefixing

Achieving autoprefixing takes a small addition to the current setup. Install *postcss-loader* and *autoprefixer* first:

```bash
npm install postcss-loader autoprefixer --save-dev
```

Add a fragment enabling autoprefixing:

**webpack.parts.js**

```javascript
exports.autoprefix = () => ({
  loader: 'postcss-loader',
  options: {
    plugins: () => ([
      require('autoprefixer')(),
    ]),
  },
});
```

{pagebreak}

To connect the loader with `ExtractTextPlugin`, hook it up as follows:

**webpack.config.js**

```javascript
const productionConfig = merge([
leanpub-start-delete
  parts.extractCSS({ use: 'css-loader' }),
leanpub-end-delete
leanpub-start-insert
  parts.extractCSS({
    use: ['css-loader', parts.autoprefix()],
  }),
leanpub-end-insert
]);
```

To confirm that the setup works, there should be something to autoprefix. Adjust the CSS:

**app/main.css**

```css
body {
  background: cornsilk;
leanpub-start-insert
  display: flex;
leanpub-end-insert
}
```

If you build the application now (`npm run build`) and examine the built CSS, you should be able to find a declaration there:

```css
body {
  background: cornsilk;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
}
```

As you can see, autoprefixing expands the rules. If you know what browsers you support, it's possible to set up a [browserslist](https://www.npmjs.com/package/browserslist) file. Different tools pick up this definition, *autoprefixer* included.

{pagebreak}

Consider the example below where you select only specific browsers:

**browserslist**

```
> 1% # Browser usage over 1%
Last 2 versions # Or last two versions
IE 8 # Or IE 8
```

## Conclusion

Autoprefixing is a convenient technique as it decreases the amount of work needed while crafting CSS. You can maintain minimum browser requirements within a *browserslist* file. The tooling can then use that information to generate optimal output.

To recap:

* Autoprefixing can be enabled through the *autoprefixer* PostCSS plugin.
* Autoprefixing writes missing CSS definitions based on your minimum browser definition.
* *browserslist* is a standard file that works with tooling beyond *autoprefixer*

In the next chapter, you'll learn to eliminate unused CSS from the project.
