# CSS Modules

Perhaps the most significant challenge of CSS is that all rules exist within **global scope**, meaning that two classes with the same name will collide. The limitation is inherent to the CSS specification, but projects have workarounds for the issue. [CSS Modules](https://github.com/css-modules/css-modules) introduces **local scope** for every module by making every class declared within unique by including a hash in their name that is globally unique to the module.

## CSS Modules Through *css-loader*

Webpack's *css-loader* supports CSS Modules. You can enable it through a loader definition as above while enabling the support:

```javascript
{
  use: {
    loader: "css-loader",
    options: {
      modules: true,
    },
  },
},
```

After this change, your class definitions remain local to the files. In case you want global class definitions, you need to wrap them within `:global(.redButton) { ... }` kind of declarations.

{pagebreak}

In this case, the `import` statement gives you the local classes you can then bind to elements. Assume you had CSS as below:

**app/main.css**

```css
body {
  background: cornsilk;
}

.redButton {
  background: red;
}
```

You could then bind the resulting class to a component:

**app/component.js**

```javascript
import styles from "./main.css";

...

// Attach the generated class name
element.className = styles.redButton;
```

`body` remains as a global declaration still. It's that `redButton` that makes the difference. You can build component-specific styles that don't leak elsewhere this way.

CSS Modules provides additional features like composition to make it easier to work with your styles. You can also combine it with other loaders as long as you apply them before *css-loader*.

T> CSS Modules behavior can be modified [as discussed in the official documentation](https://www.npmjs.com/package/css-loader#local-scope). You have control over the names it generates for instance.

T> [eslint-plugin-css-modules](https://www.npmjs.com/package/eslint-plugin-css-modules) is handy for tracking CSS Modules related problems.

## Using CSS Modules with Third Party Libraries and CSS

If you are using CSS Modules in your project, you should process standard CSS through a separate loader definition without the `modules` option of *css-loader* enabled. Otherwise, all classes will be scoped to their module. In the case of third-party libraries, this is almost certainly not what you want.

You can solve the problem by processing third-party CSS differently through an `include` definition against *node_modules*. Alternately, you could use a file extension (`.mcss`) to tell files using CSS Modules apart from the rest and then manage this situation in a loader `test`.

## Conclusion

CSS Modules solve the scoping problem of CSS by defaulting to local scope per file. You can still have global styling, but it requires additional effort. Webpack can be set up to support CSS Modules easily as seen above.
