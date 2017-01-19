# Linting JavaScript

Linting is one of those techniques that can help you make less mistakes while coding JavaScript. You can spot issues before they become actual problems. Modern editors and IDEs offer strong support for popular tools allowing you to spot possible issues as you are developing.

Despite this, it is a good idea to set them up with webpack or at least in a separate task that gets run regularly. That allows you to cancel a production build that might not be up to your standards while enforcing teamwide standards.

## Brief History of Linting in JavaScript

The linter that started it all for JavaScript is Douglas Crockford's [JSLint](http://www.jslint.com/). JSLint is known to be opinionated like the man himself. The next step in evolution was [JSHint](http://jshint.com/), which took the opinionated edge out of JSLint and allowed for more customization. [ESLint](http://eslint.org/) is the newest tool in vogue, and it goes even further.

### ESLint Is Customizable

ESLint goes to the next level as it allows you to implement custom rules, parsers, and reporters. ESLint works with Babel and JSX syntax making it ideal for React projects. It doesn't support JSX by default, though, so a Babel-specific parser will need to be used. This is also true with custom language features, although ESLint supports ES6 out of the box.

ESLint rules have been documented well, and you have full control over their severity. These features alone make it a powerful tool. Better yet, there is a large number of rules and presets beyond the core as the community has built on top of it.

T> It is quite telling that a competing project, JSCS, [decided to merge its efforts with ESLint](http://eslint.org/blog/2016/04/welcoming-jscs-to-eslint). JSCS reached the end of its life with its 3.0.0 release and the core team joined with ESLint.

### eslint-config-airbnb

[eslint-config-airbnb](https://www.npmjs.com/package/eslint-config-airbnb) is a good example of a popular preset. Often it is enough to find a preset you like, tweak it a little bit to your liking with some local rules or by deriving a preset of your own based on it, and then using that. This way you don't have to worry so much about all the available functionality.

## Linting Is about More than Just Catching Issues

Besides linting for issues, it can be useful to manage the code style on some level. Nothing is more annoying than having to work with source code that has mixed tabs and spaces. Stylistically consistent code reads better and is easier to work with. Linting tools allow you to do this.

Establishing strong linting can be beneficial, especially in a context where you need to collaborate with others. Even when working alone you will benefit from linting as it can catch obvious issues you might otherwise neglect. JavaScript as a language allows a lot of usage some of which, while valid, may not be the clearest to understand or may even be incorrect.

Linting does **not** replace proper testing, but it can complement testing approaches. It is one way to harden a codebase and make it a little harder to break. This is particularly important as the size of your project grows and it becomes more challenging to manage.

## Webpack and JSHint

Interestingly, no JSLint loader seems to exist for webpack yet. Fortunately, there's one for JSHint. You could set it up on a legacy project easily. The key is in configuring [jshint-loader](https://www.npmjs.com/package/jshint-loader).

JSHint will look into specific rules to apply from `.jshintrc`. You can also define custom settings within a `jshint` object at your webpack configuration. Exact configuration options have been covered at [the JSHint documentation](http://jshint.com/docs/) in detail.

## Setting Up ESLint

![ESLint](images/eslint.png)

[ESLint](http://eslint.org/) is the most versatile linting solution for JavaScript. It builds on top of ideas presented by JSLint and JSHint. More importantly it allows you to develop custom rules. As a result, a nice set of rules have been developed for React in the form of [eslint-plugin-react](https://www.npmjs.com/package/eslint-plugin-react).

T> Since *v1.4.0* ESLint supports a feature known as [autofixing](http://eslint.org/blog/2015/09/eslint-v1.4.0-released/). It allows you to perform certain rule fixes automatically. To activate it, pass the flag `--fix` to the tool. It is also possible to use this feature with webpack, although you should be careful with it. [js-beautify](https://www.npmjs.com/package/js-beautify) can perform a similar operation.

### Connecting ESlint with *package.json*

To get started, install ESLint as a development dependency:

```bash
npm i eslint --save-dev
```

This will add ESLint as our project development dependency. Next, we'll need to do some configuration so we can run ESLint easily through npm. I am using the `test` namespace to signify it's a testing related task. I am also enabling caching to improve performance on subsequent runs. Add the following:

**package.json**

```json
...
"scripts": {
leanpub-start-insert
  "test:lint": "eslint . --cache",
leanpub-end-insert
  "start": "webpack-dev-server --env development",
  "build": "webpack --env production"
},
...
```

Given ESLint expects configuration to work, we need to define some. It relies on rules that tell what to lint and how to react if the rule isn't obeyed. The severity of an individual rule is defined by a number as follows:

* 0 - The rule has been disabled.
* 1 - The rule will emit a warning.
* 2 - The rule will emit an error.

Some rules, such as `quotes`, accept an array instead. This allows you to pass extra parameters to them. Refer to the [ESLint rules documentation](http://eslint.org/docs/rules/) for specifics.

Here's a starting point that will work with our project:

**.eslintrc.js**

```javascript
module.exports = {
  "env": {
    "browser": true,
    "commonjs": true,
    "es6": true,
    "node": true,
  },
  "extends": "eslint:recommended",
  "parserOptions": {
    "sourceType": "module",
  },
  "rules": {
    "comma-dangle": [
      "error",
      "always-multiline",
    ],
    "indent": [
      "error",
      2,
    ],
    "linebreak-style": [
      "error",
      "unix",
    ],
    "quotes": [
      "error",
      "single",
    ],
    "semi": [
      "error",
      "always",
    ],
    "no-unused-vars": [
      "warn",
    ],
    "no-console": 0,
  },
};
```

In addition, we need to tell ESLint to skip linting *node_modules* and *build* directories by setting up ignore patterns:

**.eslintignore**

```bash
node_modules/
build/
```

T> You can point ESLint to your Git ignores through `--ignore-path .gitignore`. It also accepts individual patterns, through `--ignore-pattern <pattern>`.

If you invoke `npm run test:lint` now, it should execute without any warnings or errors. If you see either, this is a good time to try ESLint feature known as autofixing. You can run like this: `node_modules/.bin/eslint . --fix`. Check the exact location of the local ESLint through `npm bin`.

Another alternative would be to push it behind a *package.json* script. Autofix won't be able to repair each error, but it can fix a lot. And as time goes by and ESLint improves, it is able to perform more work.

Beyond vanilla JSON, ESLint supports other formats, such as JavaScript or YAML. If you want to use a different format, name the file accordingly. I.e., *.eslintrc.yaml* would expect YAML. See the [documentation](http://eslint.org/docs/user-guide/configuring#configuration-file-formats) for further details.

T> When ESLint gives errors, npm will show a long `ELIFECYCLE error` error block of its own. It is possible to disable that using the `silent` flag like this: `npm run test:lint --silent` or a shortcut `npm run test:lint -s`.

### Connecting ESLint with Webpack

We can make Webpack emit ESLint messages for us by using [eslint-loader](https://www.npmjs.com/package/eslint-loader). As the first step execute

```bash
npm i eslint-loader --save-dev
```

W> Note that `eslint-loader` will use a globally installed version of ESLint unless you have one included with the project itself. Make sure you have ESLint as a development dependency to avoid strange behavior.

The loader needs some wiring to work. We'll discuss loaders in greater detail at the *Understanding Loaders* part, but the basic idea is simple. A loader is connected to webpack through a rule that contains preconditions related to it and a reference to the loader itself. In this case we'll ensure that ESLint gets executed before anything else using a separate setting as that's a good practice.

Adjust the configuration as follows:

**webpack.config.js**

```javascript
...

const developmentConfig = {
  devServer: {
    ...
  },
  plugins: [
    ...
  ],
leanpub-start-insert
  module: {
    rules: [
      {
        test: /\.js$/,
        enforce: 'pre',

        use: 'eslint-loader',
      },
    ],
  },
leanpub-end-insert
};

...
```

If you execute `npm start` now and break some linting rule while developing, you should see that in the terminal output. The same should happen when you build the project.

W> Note that the webpack configuration lints only the application code we refer to. If you want to lint webpack configuration itself, execute `npm run test:lint` separately.

T> It can be useful to attach the linting process to Git through a prepush hook. A package known as [git-prepush-hook](https://www.npmjs.com/package/git-prepush-hook) allows you to achieve this easily. This allows you to rebase your commits and fix possible problems before pushing.

## ESLint Tips

I've collected assorted ESLint tips below. The great thing about ESLint is that you can shape it to your purposes. The community around it is strong, and you can find good integration in other tooling as well.

### Usability Tips

* Sometimes you might want to rely on some existing preset or set up custom configuration. That's where `--init` can come in handy. You can run it from `npm bin` and you'll end up with a call like `node_modules/.bin/eslint --init`
* ESLint supports custom formatters through `--format` parameter. [eslint-friendly-formatter](https://www.npmjs.com/package/eslint-friendly-formatter) is an example of a formatter that provides terminal-friendly output. This way you can jump conveniently straight to the warnings and errors from there.

### Performance Tips

* Especially on bigger projects it may be beneficial to run ESLint outside of webpack. That keeps code compilation fast while still giving the advantage of linting. Solutions like [lint-staged](https://www.npmjs.com/package/lint-staged) and [fastlint](https://www.npmjs.com/package/fastlint) can make this even faster.
* You can get more performance out of ESLint by running it through a daemon, such as [eslint_d](https://www.npmjs.com/package/eslint_d). Using it brings down the overhead and it can bring down linting times considerably.

### Extension Tips

* ESLint supports ES6 features through configuration. You will have to specify the features to use through the [ecmaFeatures](http://eslint.org/docs/user-guide/configuring.html#specifying-language-options) property.
* There are useful plugins, such as [eslint-plugin-react](https://www.npmjs.com/package/eslint-plugin-react), [eslint-plugin-promise](https://www.npmjs.com/package/eslint-plugin-promise), [eslint-plugin-compat](https://www.npmjs.com/package/eslint-plugin-compat), and [eslint-plugin-import](https://www.npmjs.com/package/eslint-plugin-import), that you might want to consider integrating to your project.
* Most IDEs and editors have good ESLint integration so you can spot issues as you develop. This applies to other linting tools as well.
* To learn how to write an ESLint plugin, check out the *Writing ESLint Plugins* appendix for more information. The *Customizing ESLint* appendix digs deeper into customization options and further resources.

## EditorConfig

[EditorConfig](http://editorconfig.org/) allows you to maintain a consistent coding style across different IDEs and editors. Some even come with built-in support. For others, you should install a separate plugin. In addition, you'll need to set up a file like this:

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

T> [Prettier](https://www.npmjs.com/package/prettier) goes one step further and is able to format your code automatically according to your coding style.

T> [Danger](https://github.com/danger/danger-js) operates on a higher level than the tools discussed. For example, it can check that the project changelog was updated before a release is pushed to the public. You can also force pull requests of your project to comply specific standards.

## Conclusion

In this chapter, you learned how to lint your code using webpack in various ways. It is one of those techniques that yields benefits over the long term. You can fix possible problems before they become actual issues.

Given webpack configuration of our project is starting to get a little messy, and it won't get any easier should we extend it, it is a good time to discuss how to compose configuration and improve the situation further. We'll do that in the next chapter.
