# Autoprefixing

It can be challenging to remember which vendor prefixes you have to use for specific CSS rules to support a large variety of users. **Autoprefixing** solves this problem. It can be enabled through PostCSS and the [autoprefixer](https://www.npmjs.com/package/autoprefixer) plugin. _autoprefixer_ uses [Can I Use](http://caniuse.com/) service to figure out which rules should be prefixed and its behavior can be tuned further.

## Setting Up Autoprefixing

Achieving autoprefixing takes a small addition to the current setup. Install _postcss-loader_ and _autoprefixer_ first:

```bash
npm add postcss-loader autoprefixer --save-dev
```

Add a fragment enabling autoprefixing:

**webpack.parts.js**

```javascript
exports.autoprefix = () => ({
  loader: "postcss-loader",
  options: {
    plugins: () => [require("autoprefixer")()],
  },
});
```

{pagebreak}

To connect the loader with CSS extraction, hook it up as follows:

**webpack.config.js**

```javascript
const productionConfig = merge([
  parts.extractCSS({
leanpub-start-delete
    use: "css-loader",
leanpub-end-delete
leanpub-start-insert
    use: ["css-loader", parts.autoprefix()],
leanpub-end-insert
  }),
  ...
]);
```

To confirm that the setup works, we have to add something to autoprefix. Adjust the CSS:

**src/main.css**

```css
...

leanpub-start-insert
.pure-button {
  -webkit-border-radius: 1em;
  border-radius: 1em;
}
leanpub-end-insert
```

If you know what browsers you prefer to support, it's possible to set up a [.browserslistrc](https://www.npmjs.com/package/browserslist) file. Different tools pick up this definition, _autoprefixer_ included.

T> You can lint CSS through [Stylelint](http://stylelint.io/). It can be set up the same way through _postcss-loader_ as autoprefixing above.

{pagebreak}

Set up a file as follows:

TODO: https://jamie.build/last-2-versions
TODO: Check browserslist 4
TODO: https://mobile.twitter.com/alexsavinme/status/1057291273294528512

**.browserslistrc**

```
> 1% # Browser usage over 1%
Last 2 versions # Or last two versions
IE 8 # Or IE 8
```

If you build the application now (`npm run build`) and examine the built CSS, you should be able to find a declaration there without the webkit portion:

```css
...

leanpub-start-insert
.pure-button {
  border-radius: 1em;
}
leanpub-end-insert
```

_autoprefixer_ is able to **remove** unnecessary rules and also add rules which are required based on the browser definition.

## Conclusion

Autoprefixing is a convenient technique as it decreases the amount of work needed while crafting CSS. You can maintain minimum browser requirements within a _.browserslistrc_ file. The tooling can then use that information to generate optimal output.

To recap:

- Autoprefixing can be enabled through the _autoprefixer_ PostCSS plugin.
- Autoprefixing writes missing CSS definitions based on your minimum browser definition.
- _.browserslistrc_ is a standard file that works with tooling beyond _autoprefixer_
