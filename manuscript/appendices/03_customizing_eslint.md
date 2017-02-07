# Customizing ESLint

Even though you can get far with vanilla ESLint, there are several techniques you should be aware of. For instance, sometimes you might want to skip some rules per file. You might even want to implement rules of your own. We'll cover these cases briefly next.

## Skipping ESLint Rules

Sometimes, you'll want to skip certain rules per file or per line. This can be useful when you happen to have some exceptional case in your code where some rule doesn't make sense. As usual, exception confirms the rule. Consider the following examples:

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

## Setting Environment

Sometimes, you may want to run ESLint in a specific environment, such as Node or Mocha. These environments have certain conventions of their own. For instance, Mocha relies on custom keywords (e.g., `describe`, `it`) and it's good if the linter doesn't choke on those.

ESLint provides two ways to deal with this: local and global. If you want to set it per file, you can use a declaration at the beginning of a file:

```javascript
/*eslint-env node, mocha */
```

Global configuration is possible as well. In this case, you can use `env` key like this:

**.eslintrc.js**

```json
module.exports = {
  "env": {
    "browser": true,
    "commonjs": true,
    "es6": true,
    "node": true,
  },
  ...
};
```

## ESLint Resources

Besides the official documentation available at [eslint.org](http://eslint.org/), you should check out the following blog posts:

* [Lint Like It's 2015](https://medium.com/@dan_abramov/lint-like-it-s-2015-6987d44c5b48) - This post by Dan Abramov shows how to get ESLint to work well with Sublime Text.
* [Detect Problems in JavaScript Automatically with ESLint](http://davidwalsh.name/eslint) - A good tutorial on the topic.
* [Understanding the Real Advantages of Using ESLint](http://rangle.io/blog/understanding-the-real-advantages-of-using-eslint/) - Evan Schultz's post digs into details.
* [eslint-plugin-smells](https://github.com/elijahmanor/eslint-plugin-smells) - This plugin by Elijah Manor allows you to lint against various JavaScript smells. Recommended.

If you just want a starting point, you can pick one of [eslint-config- packages](https://www.npmjs.com/search?q=eslint-config) or go with the [standard](https://www.npmjs.com/package/standard) style. By the looks of it, `standard` has [some issues with JSX](https://github.com/feross/standard/issues/138) so be careful with that.
