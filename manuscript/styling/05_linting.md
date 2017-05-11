# Linting CSS

As discussed earlier in the *Linting JavaScript* chapter, linting is a technique that allows to avoid certain categories of mistakes. Automation is good, as it can save effort. In addition to JavaScript, it's possible to lint CSS.

[Stylelint](http://stylelint.io/) is a tool that allows linting. It can be used with webpack through [postcss-loader](https://www.npmjs.com/package/postcss-loader).

## Connecting Stylelint with *package.json*

To get started, install Stylelint as a development dependency:

```bash
npm install stylelint --save-dev
```

To connect Stylelint with npm and make it find the CSS files, adjust as follows:

**package.json**

```json
"scripts": {
leanpub-start-insert
  "lint:style": "stylelint app/**/*.css",
leanpub-end-insert
  ...
},
```

{pagebreak}

To have something to test with, there should be a dummy rule:

**.stylelintrc**

```json
{
  "rules": {
    "color-hex-case": "lower"
  }
}
```

If you break the rule at *app/main.css* and run `npm run lint:style`, you should see a message:

```bash
...
app/main.css
 2:15  Expected "#FFF" to be "#fff"   color-hex-case
...
```

To get less verbose output on error, use either `npm run lint:style --silent` or `npm run lint:style -s`.

The same rules can be connected with webpack.

## Connecting Stylelint with Webpack

To get started, install *postcss-loader* unless you have it set up already:

```bash
npm install postcss-loader --save-dev
```

{pagebreak}

Next, to integrate with configuration, set up a part first:

**webpack.parts.js**

```javascript
exports.lintCSS = ({ include, exclude }) => ({
  module: {
    rules: [
      {
        test: /\.css$/,
        include,
        exclude,
        enforce: 'pre',

        loader: 'postcss-loader',
        options: {
          plugins: () => ([
            require('stylelint')(),
          ]),
        },
      },
    ],
  },
});
```

{pagebreak}

Then add it to the common configuration:

**webpack.config.js**

```javascript
const commonConfig = merge([
  ...
leanpub-start-insert
  parts.lintCSS({ include: PATHS.app }),
leanpub-end-insert
]);
```

If you define a CSS rule, such as `background-color: #EFEFEF;` at *main.css* now, you should see a warning at your terminal when you run the build (`npm start` or `npm run build`):

```bash
WARNING in ./~/css-loader!./~/postcss-loader!./app/main.css
stylelint: /webpack-demo/app/main.css:2:21: Expected "#EFEFEF" to be "#efefef" (color-hex-case)
 @ ./app/main.css 4:14-117
 @ ./app/index.js
```

See the Stylelint documentation for a full list of rules. npm lists [possible rulesets](https://www.npmjs.com/search?q=stylelint-config) you can enable through configuration.

T> [stylelint-scss](https://www.npmjs.com/package/stylelint-scss) provides a collection of SCSS specific linting rules.

T> The `enforce` idea is discussed in detail in the *Loader Definitions* chapter.

W> If you get `Module build failed: Error: No configuration provided for ...` kind of error, check your *.stylelintrc*.

## *stylelint-webpack-plugin*

[stylelint-webpack-plugin](https://www.npmjs.com/package/stylelint-webpack-plugin) allows you to reach the same result. Its greatest advantage over the setup above is that it follows possible `@import` statements you have in your styling.

T> [stylelint-bare-webpack-plugin](https://www.npmjs.com/package/stylelint-bare-webpack-plugin) is a variant of *stylelint-webpack-plugin* that allows you to control the version of Stylelint you are using.

## CSSLint

[CSSLint](http://csslint.net/) is another option to Stylelint. It can be used through [csslint-loader](https://www.npmjs.com/package/csslint-loader) and follows a normal loader setup.

## Conclusion

After these changes, there is style linting in place. Now you can catch CSS-related problems.

To recap:

* It's possible to lint CSS through **Stylelint**.
* Linting CSS allows you to capture common CSS-related problems and disallow problematic patterns.
* Stylelint can be treated as a PostCSS plugin, but it can also be used through *stylelint-webpack-plugin*.
* **CSSLint** is an option to Stylelint. It's possible [the projects merge](https://github.com/CSSLint/csslint/issues/668), though.
