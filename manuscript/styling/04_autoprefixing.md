# Autoprefixing

It can be challenging to remember which vendor prefixes you have to use for specific CSS rules to support a large variety of users. **Autoprefixing** solves this problem. It can be enabled through PostCSS and the [autoprefixer](https://www.npmjs.com/package/autoprefixer) plugin. _autoprefixer_ uses [Can I Use](http://caniuse.com/) service to figure out which rules should be prefixed and its behavior can be tuned further.

## Setting up autoprefixing

Achieving autoprefixing takes a small addition to the current setup. Install _postcss-loader_ and _autoprefixer_ first:

```bash
npm add postcss-loader autoprefixer -D
```

Add a fragment enabling autoprefixing:

**webpack.parts.js**

```javascript
exports.autoprefix = () => ({
  loader: "postcss-loader",
  options: {
    plugins: [require("autoprefixer")()],
  },
});
```

{pagebreak}

To connect the loader with CSS extraction, hook it up as follows:

**webpack.config.js**

```javascript
leanpub-start-delete
const cssLoaders = [parts.tailwind()]
leanpub-end-delete
leanpub-start-insert
const cssLoaders = [parts.autoprefix(), parts.tailwind()];
leanpub-end-insert
```

W> The order of the loaders matters since autoprefixing should occur after Tailwind finishes processing. The above gets evaluated as `autoprefix(tailwind(input))`.

## Defining a browserslist

**autoprefixer** relies on a [browserslist](https://www.npmjs.com/package/browserslist) definition to work.

To define which browsers you want to support, set up a `.browserslistrc` file. Different tools pick up this definition, _autoprefixer_ included.

Create a file as follows:

**.browserslistrc**

```
> 1% # Browser usage over 1%
Last 2 versions # Or last two versions
IE 8 # Or IE 8
```

If you build the application now (`npm run build`) and examine the built CSS, you should see that CSS was added to support older browsers. Try adjusting the definition to see what difference it makes on the build output.

T> You can lint CSS through [Stylelint](http://stylelint.io/). It can be set up the same way through _postcss-loader_ as autoprefixing above.

T> It's possible to define a browserslist per development target (`BROWSERSLIST_ENV` or `NODE_ENV` in the environment) by using `[development]` kind of syntax between the declarations. See [browserslist documentation](https://www.npmjs.com/package/browserslist#configuring-for-different-environments) for further information and options.

## Conclusion

Autoprefixing is a convenient technique as it decreases the amount of work needed while crafting CSS. You can maintain minimum browser requirements within a _.browserslistrc_ file. The tooling can then use that information to generate optimal output.

To recap:

- Autoprefixing can be enabled through the _autoprefixer_ PostCSS plugin.
- Autoprefixing writes missing CSS definitions based on your minimum browser definition.
- _.browserslistrc_ is a standard file that works with tooling beyond _autoprefixer_
