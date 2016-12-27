# Linting CSS

[stylelint](http://stylelint.io/) allows us to lint CSS. It can be used with webpack through [postcss-loader](https://www.npmjs.com/package/postcss-loader).

## Getting Started

To get started, install the required dependencies:

```bash
npm i stylelint postcss-loader --save-dev
```

Next, we'll need to integrate it with our configuration:

**webpack.config.js**

```javascript
...
const stylelint = require('stylelint');

...

const common = {
  ...
  module: {
    rules: [
      {
        test: /\.css$/,
        include: PATHS.app,

        use: 'postcss-loader',
        enforce: 'pre'
      },
      ...
    ],
    ...
  }
}
```

This is also going to require PostCSS specific configuration:

**postcss.config.js**

```javascript
module.exports = {
  plugins: {
    stylelint: {
      rules: {
        'color-hex-case': 'lower'
      },
      // Ignore node_modules CSS
      ignoreFiles: 'node_modules/**/*.css'
    }
  }
};
```

If you define a CSS rule, such as `background-color: #EFEFEF;`, you should see a warning at your terminal. See stylelint documentation for a full list of rules. npm lists [possible stylelint rulesets](https://www.npmjs.com/search?q=stylelint-config). You consume them as your project dependency like this:

```javascript
const configSuitcss = require('stylelint-config-suitcss');

...

stylelint(configSuitcss)
```

It is possible to define configuration through a *.stylelintrc* file. The idea is similar as for other linting tools. There's also a CLI available.

T> If you want to try out an alternative way to set up stylelint, consider using the [stylelint-webpack-plugin](https://www.npmjs.com/package/stylelint-webpack-plugin) instead.

## Conclusion

After these changes we have linting for our styling in place. Now you can catch at least the most obvious CSS related problems.
