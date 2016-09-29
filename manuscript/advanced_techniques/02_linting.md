# Linting in Webpack

Nothing is easier than making mistakes when coding in JavaScript. Linting is one of those techniques that can help you to make less mistakes. You can spot issues before they become actual problems.

Better yet, modern editors and IDEs offer strong support for popular tools. This means you can spot possible issues as you are developing. Despite this, it is a good idea to set them up with Webpack. That allows you to cancel a production build that might not be up to your standards for example.

## Brief History of Linting in JavaScript

The linter that started it all for JavaScript is Douglas Crockford's [JSLint](http://www.jslint.com/). It is opinionated like the man himself. The next step in evolution was [JSHint](http://jshint.com/). It took the opinionated edge out of JSLint and allowed for more customization. [ESLint](http://eslint.org/) is the newest tool in vogue.

ESLint goes to the next level as it allows you to implement custom rules, parsers, and reporters. ESLint works with Babel and JSX syntax making it ideal for React projects. The project rules have been documented well and you have full control over their severity. These features alone make it a powerful tool.

It is quite telling that a competing project, JSCS, [decided to merge its efforts with ESLint](http://eslint.org/blog/2016/04/welcoming-jscs-to-eslint). JSCS reached end of life with its 3.0.0 release and the core team joined with ESLint.

Besides linting for issues, it can be useful to manage the code style on some level. Nothing is more annoying than having to work with source code that has mixed tabs and spaces. Stylistically consistent code reads better and is easier to work with. Linting tools allow you to do this.

## Webpack and JSHint

Interestingly, no JSLint loader seems to exist for Webpack yet. Fortunately, there's one for JSHint. You could set it up on a legacy project easily. To get started, install [jshint-loader](https://www.npmjs.com/package/jshint-loader) to your project first:

```bash
npm i jshint jshint-loader --save-dev
```

In addition, you will need a little bit of configuration:

```javascript
var common = {
  ...
  module: {
    preLoaders: [
      {
        test: /\.jsx?$/,
        loaders: ['jshint'],
        // define an include so we check just the files we need
        include: PATHS.app
      }
    ]
  },
};
```

`preLoaders` section of the configuration gets executed before `loaders`. If linting fails, you'll know about it first. There's a third section, `postLoaders`, that gets executed after `loaders`. You could include code coverage checking there during testing, for instance.

JSHint will look into specific rules to apply from `.jshintrc`. You can also define custom settings within a `jshint` object at your Webpack configuration. Exact configuration options have been covered at [the JSHint documentation](http://jshint.com/docs/) in detail. `.jshintrc` could look like this:

**.jshintrc**

```json
{
  "browser": true,
  "camelcase": false,
  "esnext": true,
  "indent": 2,
  "latedef": false,
  "newcap": true,
  "quotmark": "double"
}
```

This tells JSHint we're operating within browser environment, don't care about linting for camelcase naming, want to use double quotes everywhere and so on.

## Setting Up ESLint

![ESLint](images/eslint.png)

[ESLint](http://eslint.org/) is a recent linting solution for JavaScript. It builds on top of ideas presented by JSLint and JSHint. More importantly it allows you to develop custom rules. As a result, a nice set of rules have been developed for React in the form of [eslint-plugin-react](https://www.npmjs.com/package/eslint-plugin-react).

T> Since *v1.4.0* ESLint supports a feature known as [autofixing](http://eslint.org/blog/2015/09/eslint-v1.4.0-released/). It allows you to perform certain rule fixes automatically. To activate it, pass the flag `--fix` to the tool. It is also possible to use this feature with Webpack, although you should be careful with it.

### Connecting ESlint with *package.json*

To get started, install ESLint as a development dependency:

```bash
npm i eslint --save-dev
```

This will add ESLint as our project development dependency. Next, we'll need to do some configuration so we can run ESLint easily through npm. I am using the `test` namespace to signify it's a testing related task. I am also enabling caching to improve performance on subsequent runs. Add the following:

**package.json**

```json
"scripts": {
  ...
  "test:lint": "eslint . --ext .js --ext .jsx --cache"
}
...
```

Given ESLint expects configuration to work, generate a sample:

```bash
node_modules/.bin/eslint --init
```

T> You can check the exact location through `npm bin`. This can be different depending on your operating system.

If you run `npm run test:lint` now, it will trigger ESLint against all JS and JSX files of our project. This configuration will likely lint a bit too much. Set up *.eslintignore* to the project root like this to skip *build/*:

**.eslintignore**

```bash
build/
```

Given most projects contain *.gitignore*, ESLint can be configured to use that instead of *.eslintignore* like this:

**package.json**

```json
"scripts": {
  ...
  "test:lint": "eslint . --ext .js --ext .jsx --ignore-path .gitignore --cache"
}
...
```

If you need to ignore some specific directory in addition to the *.gitignore* definitions, you can pass `--ignore-pattern dist` kind of declaration to ESLint.

T> ESLint supports custom formatters through `--format` parameter. [eslint-friendly-formatter](https://www.npmjs.com/package/eslint-friendly-formatter) is an example of a formatter that provides terminal friendly output. This way you can jump conveniently straight to the warnings and errors from there.

T> You can get more performance out of ESLint by running it through a daemon, such as [eslint_d](https://www.npmjs.com/package/eslint_d). Using it brings down the overhead and it can bring down linting times considerably.

### Configuring ESLint

In order to truly benefit from ESLint, you'll need to configure it. There are a lot of rules included, you can load even more through plugins, and you can even write your own. See the official [ESLint rules documentation](http://eslint.org/docs/rules/) for more details on rules.

Consider the sample configuration below. It extends the recommended set of rules with some of our own:

**.eslintrc**

```json
{
  // Extend existing configuration
  // from ESlint and eslint-plugin-react defaults.
  "extends": [
    "eslint:recommended", "plugin:react/recommended"
  ],
  // Enable ES6 support. If you want to use custom Babel
  // features, you will need to enable a custom parser
  // as described in a section below.
  "parserOptions": {
    "ecmaVersion": 6,
    "sourceType": "module"
  },
  "env": {
    "browser": true,
    "node": true
  },
  // Enable custom plugin known as eslint-plugin-react
  "plugins": [
    "react"
  ],
  "rules": {
    // Disable `no-console` rule
    "no-console": 0,
    // Give a warning if identifiers contain underscores
    "no-underscore-dangle": 1,
    // Default to single quotes and raise an error if something
    // else is used
    "quotes": [2, "single"]
  }
}
```

Beyond vanilla JSON, ESLint supports other formats, such as JavaScript or YAML. If you want to use a different format, name the file accordingly. I.e., *.eslintrc.js* would work for JavaScript. In that case you should export the configuration through `module.exports`. See the [documentation](http://eslint.org/docs/user-guide/configuring#configuration-file-formats) for further details.

T> It is possible to generate a custom *.eslintrc* by using `eslint --init`. It will ask you a series of questions and then write the file for you.

T> ESLint supports ES6 features through configuration. You will have to specify the features to use through the [ecmaFeatures](http://eslint.org/docs/user-guide/configuring.html#specifying-language-options) property.

T> There are useful plugins, such as [eslint-plugin-react](https://www.npmjs.com/package/eslint-plugin-react) and [eslint-plugin-import](https://www.npmjs.com/package/eslint-plugin-import), that you might want to consider integrating to your project.

### Connecting ESLint with Babel

In case you want to lint against custom language features that go beyond standard ES6, use [babel-eslint](https://www.npmjs.com/package/babel-eslint). Install the parser first:

```bash
npm i babel-eslint --save-dev
```

Change *.eslintrc* like this so that ESLint knows to use the custom parser over the default one:

```json
{
  ...
leanpub-start-insert
  "parser": "babel-eslint",
leanpub-end-insert
leanpub-start-delete
  "parserOptions": {
    "ecmaVersion": 6,
    "sourceType": "module"
  },
leanpub-end-delete
  ...
}
```

### Severity of ESLint Rules

The severity of an individual rule is defined by a number as follows:

* 0 - The rule has been disabled.
* 1 - The rule will emit a warning.
* 2 - The rule will emit an error.

Some rules, such as `quotes`, accept an array instead. This allows you to pass extra parameters to them. Refer to the rule's documentation for specifics.

T> Note that you can write ESLint configuration directly to *package.json*. Set up a `eslintConfig` field, and write your declarations below it.

T> It is possible to generate a sample `.eslintrc` using `eslint --init` (or `node_modules/.bin/eslint --init` for local install). This can be useful on new projects.

### Dealing with `ELIFECYCLE` Error

In case the linting process fails, `npm` will give you a nasty looking `ELIFECYCLE` error. A good way to achieve a tidier output is to invoke `npm run lint --silent`. That will hide the `ELIFECYCLE` bit. You can define an alias for this purpose. In Unix you would do `alias run='npm run --silent'` and then `run <script>`.

Alternatively, you could pipe output to `true` like this:

**package.json**

```json
"scripts": {
  ...
  "test:lint": "eslint . --ext .js --ext .jsx || true"
}
...
```

The problem with this approach is that if you invoke `test:lint` through some other command, it will pass even if there are failures. If you have another script that does something like `npm run test:lint && npm run build`, it will build regardless of the output of the first command!

### Connecting ESLint with Webpack

We can make Webpack emit ESLint messages for us by using [eslint-loader](https://www.npmjs.com/package/eslint-loader). As the first step execute

```bash
npm i eslint-loader --save-dev
```

W> Note that `eslint-loader` will use a globally installed version of ESLint unless you have one included with the project itself! Make sure you have ESLint as a development dependency to avoid strange behavior.

A good way to set it up is to go through `preLoaders` like this:

**webpack.config.js**

```javascript
const common = {
  ...
  module: {
    preLoaders: [
      {
        test: /\.jsx?$/,
        loaders: ['eslint'],
        include: PATHS.app
      }
    ]
  },
  ...
};
```

By using a preloader definition, we make sure ESLint goes through our code before processing it any further. This way we'll know early of if our code fails to lint during development. It is useful to include linting to the production target of your project as well.

If you execute `npm start` now and break some linting rule while developing, you should see that in the terminal output. The same should happen when you build the project.

## Customizing ESLint

Even though you can get very far with vanilla ESLint, there are several techniques you should be aware of. For instance, sometimes you might want to skip some particular rules per file. You might even want to implement rules of your own. We'll cover these cases briefly next.

### Skipping ESLint Rules

Sometimes, you'll want to skip certain rules per file or per line. This can be useful when you happen to have some exceptional case in your code where some particular rule doesn't make sense. As usual, exception confirms the rule. Consider the following examples:

```javascript
// everything
/* eslint-disable */
...
/* eslint-enable */
```

```javascript
// specific rule
/* eslint-disable no-unused-vars */
...
/* eslint-enable no-unused-vars */
```

```javascript
// tweaking a rule
/* eslint no-comma-dangle:1 */
```

```javascript
// disable rule per line
alert('foo'); // eslint-disable-line no-alert
```

Note that the rule specific examples assume you have the rules in your configuration in the first place! You cannot specify new rules here. Instead, you can modify the behavior of existing rules.

### Setting Environment

Sometimes, you may want to run ESLint in a specific environment, such as Node.js or Mocha. These environments have certain conventions of their own. For instance, Mocha relies on custom keywords (e.g., `describe`, `it`) and it's good if the linter doesn't choke on those.

ESLint provides two ways to deal with this: local and global. If you want to set it per file, you can use a declaration at the beginning of a file:

```javascript
/*eslint-env node, mocha */
```

Global configuration is possible as well. In this case, you can use `env` key like this:

**.eslintrc**

```json
{
  "env": {
    "browser": true,
    "node": true,
    "mocha": true
  },
  ...
}
```

### Writing Your Own Rules

ESLint rules rely on Abstract Syntax Tree (AST) definition of JavaScript. It is a data structure that describes JavaScript code after it has been lexically analyzed. There are tools, such as [recast](https://github.com/benjamn/recast), that allow you to perform transformations on JavaScript code by using AST transformations. The idea is that you match some structure, then transform it somehow and convert AST back to JavaScript.

To get a better idea of how AST works and what it looks like, you can check [Esprima online JavaScript AST visualization](http://esprima.org/demo/parse.html) or [AST Explorer by Felix Kling](http://astexplorer.net/). Alternatively you can install `recast` and examine the output it gives. That is the structure we'll be working with for ESLint rules.

T> [Codemod](https://github.com/facebook/codemod) allows you to perform large scale changes to your codebase through AST based transformations.

In ESLint's case we just want to check the structure and report in case something is wrong. Getting a simple rule done is surprisingly simple:

1. Set up a new project named `eslint-plugin-custom`. You can replace `custom` with whatever you want. ESLint follows this naming convention.
2. Execute `npm init -y` to create a dummy *package.json*
3. Set up `index.js` in the project root with content like this:

**eslint-plugin-custom/index.js**

```javascript
module.exports = {
  rules: {
    demo: function(context) {
      return {
        Identifier: function(node) {
          context.report(node, 'This is unexpected!');
        }
      };
    }
  }
};
```

In this case, we just report for every identifier found. In practice, you'll likely want to do something more complex than this, but this is a good starting point.

Next, you need to execute `npm link` within `eslint-plugin-custom`. This will make your plugin visible within your system. `npm link` allows you to easily consume a development version of a library you are developing. To reverse the link you can execute `npm unlink` when you feel like it.

T> If you want to do something serious, you should point to your plugin through *package.json*.

We need to alter our project configuration to make it find the plugin and the rule within.

**.eslintrc**

```json
{
  ...
  "plugins": [
leanpub-start-delete
    "react",
leanpub-end-delete
leanpub-start-insert
    "react",
    "custom"
leanpub-end-insert
  ],
  "rules": {
leanpub-start-insert
    "custom/demo": 1,
leanpub-end-insert
    ...
  }
}
```

If you invoke ESLint now, you should see a bunch of warnings. Mission accomplished!

Of course the rule doesn't do anything useful yet. To move forward, I recommend checking out the official documentation about [plugins](http://eslint.org/docs/developer-guide/working-with-plugins.html) and [rules](http://eslint.org/docs/developer-guide/working-with-rules.html).

You can also check out some of the existing rules and plugins for inspiration to see how they achieve certain things. ESLint allows you to [extend these rulesets](http://eslint.org/docs/user-guide/configuring.html#extending-configuration-files) through `extends` property. It accepts either a path to it (`"extends": "./node_modules/coding-standard/.eslintrc"`) or an array of paths. The entries are applied in the given order and later ones override the former.

### ESLint Resources

Besides the official documentation available at [eslint.org](http://eslint.org/), you should check out the following blog posts:

* [Lint Like It's 2015](https://medium.com/@dan_abramov/lint-like-it-s-2015-6987d44c5b48) - This post by Dan Abramov shows how to get ESLint to work well with Sublime Text.
* [Detect Problems in JavaScript Automatically with ESLint](http://davidwalsh.name/eslint) - A good tutorial on the topic.
* [Understanding the Real Advantages of Using ESLint](http://rangle.io/blog/understanding-the-real-advantages-of-using-eslint/) - Evan Schultz's post digs into details.
* [eslint-plugin-smells](https://github.com/elijahmanor/eslint-plugin-smells) - This plugin by Elijah Manor allows you to lint against various JavaScript smells. Recommended.

If you just want some starting point, you can pick one of [eslint-config- packages](https://www.npmjs.com/search?q=eslint-config) or go with the [standard](https://www.npmjs.com/package/standard) style. By the looks of it, `standard` has [some issues with JSX](https://github.com/feross/standard/issues/138) so be careful with that.

## Linting CSS

[stylelint](http://stylelint.io/) allows us to lint CSS. It can be used with Webpack through [postcss-loader](https://www.npmjs.com/package/postcss-loader).

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
    preLoaders: [
      {
        test: /\.css$/,
        loaders: ['postcss'],
        include: PATHS.app
      },
      ...
    ],
    ...
  },
  postcss: function () {
    return [
      stylelint({
        rules: {
          'color-hex-case': 'lower'
        }
      })
    ];
  },
  ...
}
```

If you define a CSS rule, such as `background-color: #EFEFEF;`, you should see a warning at your terminal. See stylelint documentation for a full list of rules. npm lists [possible stylelint rulesets](https://www.npmjs.com/search?q=stylelint-config). You consume them as your project dependency like this:

```javascript
const configSuitcss = require('stylelint-config-suitcss');

...

stylelint(configSuitcss)
```

It is possible to define configuration through a *.stylelintrc* file. The idea is similar as for other linting tools. There's also a CLI available.

T> If you want to try out an alternative way to set up stylelint, consider using the [stylelint-webpack-plugin](https://www.npmjs.com/package/stylelint-webpack-plugin) instead.

## EditorConfig

[EditorConfig](http://editorconfig.org/) allows you to maintain a consistent coding style across different IDEs and editors. Some even come with built-in support. For others, you have to install a separate plugin. In addition to this you'll need to set up a `.editorconfig` file like this:

**.editorconfig**

```yaml
root = true

# General settings for whole project
[*]
indent_style = space
indent_size = 4

end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

# Format specific overrides
[*.md]
trim_trailing_whitespace = false

[app/**.js]
indent_style = space
indent_size = 2
```

## Conclusion

In this chapter, you learned how to lint your code using Webpack in various ways. It is one of those techniques that yields benefits over the long term. You can fix possible problems before they become actual issues.
