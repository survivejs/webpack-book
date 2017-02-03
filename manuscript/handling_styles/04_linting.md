# Linting CSS

As discussed earlier in the *Linting JavaScript* chapter, linting is a technique that allows us to avoid certain categories of mistakes. Automation is good, as it can save effort. In addition to JavaScript, it's possible to lint CSS.

[stylelint](http://stylelint.io/) is a tool that allows linting. It can be used with webpack through [postcss-loader](https://www.npmjs.com/package/postcss-loader).

## Setting Up Stylelint

To get started, install the required dependencies:

```bash
npm i stylelint postcss-loader --save-dev
```

Next, we'll need to integrate it with our configuration. Set up a configuration part first:

**webpack.parts.js**

```javascript
...

exports.lintCSS = function({ include, exclude, rules }) {
  return {
    module: {
      rules: [
        {
          test: /\.css$/,
          include: include,
          exclude: exclude,
          enforce: 'pre',

          loader: 'postcss-loader',
          options: {
            plugins: function () {
              return [
                require('stylelint')({
                  rules: rules,
                  // Ignore node_modules CSS
                  ignoreFiles: 'node_modules/**/*.css',
                }),
              ];
            },
          },
        },
      ],
    },
  };
};
```

Then add it to the `common` configuration:

**webpack.config.js**

```javascript
...

const common = merge([
  {
    ...
  },
leanpub-start-insert
  parts.lintCSS({
    include: PATHS.app,
    rules: {
      'color-hex-case': 'lower',
    },
  }),
leanpub-end-insert
]);

...
```

If you define a CSS rule, such as `background-color: #EFEFEF;` at *main.css* now, you should see a warning like this at your terminal when you run the build (`npm start` or `npm run build`):

```bash
WARNING in ./~/css-loader!./~/postcss-loader!./app/main.css
stylelint: /webpack-demo/app/main.css:2:21: Expected "#EFEFEF" to be "#efefef" (color-hex-case)
 @ ./app/main.css 4:14-117
 @ ./app/index.js
```

See stylelint documentation for a full list of rules. npm lists [possible stylelint rulesets](https://www.npmjs.com/search?q=stylelint-config) you can enable through configuration.

T> [stylelint-scss](https://www.npmjs.com/package/stylelint-scss) provides a collection of SCSS specific linting rules.

T> The `enforce` idea is discussed in greater detail at the *Loader Definitions* chapter.

## *stylelint-webpack-plugin*

[stylelint-webpack-plugin](https://www.npmjs.com/package/stylelint-webpack-plugin) is an alternate way to achieve the same result. Its greatest advantage over the setup above is that it will follow possible `@import` statements you might have in your styling.

T> [stylelint-bare-webpack-plugin](https://www.npmjs.com/package/stylelint-bare-webpack-plugin) is a variant of *stylelint-webpack-plugin* that allows you to control the version of stylelint you are using.

## Conclusion

After these changes, we have linting for our styling in place. Now you can catch at least the most obvious CSS-related problems.
