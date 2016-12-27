# Writing ESLint Plugins

ESLint plugins rely on Abstract Syntax Tree (AST) definition of JavaScript. It is a data structure that describes JavaScript code after it has been lexically analyzed. There are tools, such as [recast](https://github.com/benjamn/recast), that allow you to perform transformations on JavaScript code by using AST transformations. The idea is that you match some structure, then transform it somehow and convert AST back to JavaScript.

## Understanding AST

To get a better idea of how AST works and what it looks like, you can check [Esprima online JavaScript AST visualization](http://esprima.org/demo/parse.html) or [AST Explorer by Felix Kling](http://astexplorer.net/). Alternatively you can install `recast` and examine the output it gives. That is the structure we'll be working with for ESLint rules.

T> [Codemod](https://github.com/facebook/codemod) allows you to perform large scale changes to your codebase through AST based transformations.

## Writing a Plugin

In ESLint's case we just want to check the structure and report in case something is wrong. Getting a simple rule done is surprisingly simple:

1. Set up a new project named `eslint-plugin-custom`. You can replace `custom` with whatever you want. ESLint follows this naming convention.
2. Execute `npm init -y` to create a dummy *package.json*
3. Set up `index.js` in the project root with content like this:

**eslint-plugin-custom/index.js**

```javascript
module.exports = {
  rules: {
    demo: {
      docs: {
        description: 'Demo rule',
        category: 'Best Practices',
        recommended: true
      },
      schema: [{
        type: 'object',
        // JSON Schema to describe properties
        properties: {},
        additionalProperties: false
      }],
      create: function(context) {
        return {
          Identifier: function(node) {
            context.report(node, 'This is unexpected!');
          }
        };
      }
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

## Conclusion

You can also check out some of the existing rules and plugins for inspiration to see how they achieve certain things. ESLint allows you to [extend these rulesets](http://eslint.org/docs/user-guide/configuring.html#extending-configuration-files) through `extends` property. It accepts either a path to it (`"extends": "./node_modules/coding-standard/.eslintrc"`) or an array of paths. The entries are applied in the given order and later ones override the former.
