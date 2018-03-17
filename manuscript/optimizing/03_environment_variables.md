# Environment Variables

Sometimes a part of your code should execute only during development. Or you could have experimental features in your build that are not ready for production yet. Controlling **environment variables** becomes valuable as you can toggle functionality using them.

Since JavaScript minifiers can remove dead code (`if (false)`), you can build on top of this idea and write code that gets transformed into this form. Webpack's `DefinePlugin` enables replacing **free variables** so that you can convert `if (process.env.NODE_ENV === "development")` kind of code to `if (true)` or `if (false)` depending on the environment.

You can find packages that rely on this behavior. React is perhaps the most known example of an early adopter of the technique. Using `DefinePlugin` can bring down the size of your React production build somewhat as a result, and you can see a similar effect with other packages as well.

Webpack 4 sets `process.env.NODE_ENV` based on the given mode. It's good to know the technique and how it works, though.

{pagebreak}

## The Basic Idea of `DefinePlugin`

To understand the idea of `DefinePlugin` better, consider the example below:

```javascript
var foo;

// Not free due to "foo" above, not ok to replace
if (foo === "bar") {
  console.log("bar");
}

// Free since you don't refer to "bar", ok to replace
if (bar === "bar") {
  console.log("bar");
}
```

If you replaced `bar` with a string like `"foobar"`, then you would end up with the code as below:

```javascript
var foo;

// Not free due to "foo" above, not ok to replace
if (foo === "bar") {
  console.log("bar");
}

// Free since you don't refer to "bar", ok to replace
if ("foobar" === "bar") {
  console.log("bar");
}
```

{pagebreak}

Further analysis shows that `"foobar" === "bar"` equals `false` so a minifier gives the following:

```javascript
var foo;

// Not free due to "foo" above, not ok to replace
if (foo === "bar") {
  console.log("bar");
}

// Free since you don't refer to "bar", ok to replace
if (false) {
  console.log("bar");
}
```

A minifier eliminates the `if` statement as it has become dead code:

```javascript
var foo;

// Not free, not ok to replace
if (foo === "bar") {
  console.log("bar");
}

// if (false) means the block can be dropped entirely
```

Elimination is the core idea of `DefinePlugin` and it allows toggling. A minifier performs analysis and toggles entire portions of the code.

{pagebreak}

## Setting `process.env.NODE_ENV`

As before, encapsulate this idea to a function. Due to the way webpack replaces the free variable, you should push it through `JSON.stringify`. You end up with a string like `'"demo"'` and then webpack inserts that into the slots it finds:

**webpack.parts.js**

```javascript
const webpack = require("webpack");

exports.setFreeVariable = (key, value) => {
  const env = {};
  env[key] = JSON.stringify(value);

  return {
    plugins: [new webpack.DefinePlugin(env)],
  };
};
```

Connect this with the configuration:

**webpack.config.js**

```javascript
const commonConfig = merge([
  ...
leanpub-start-insert
  parts.setFreeVariable("HELLO", "hello from config"),
leanpub-end-insert
]);
```

{pagebreak}

Finally, add something to replace:

**src/component.js**

```javascript
leanpub-start-delete
export default (text = "Hello world") => {
leanpub-end-delete
leanpub-start-insert
export default (text = HELLO) => {
leanpub-end-insert
  const element = document.createElement("div");

  ...
};
```

If you run the application, you should see a new message on the button.

T> [webpack-conditional-loader](https://www.npmjs.com/package/webpack-conditional-loader) performs something similar based on code comments. It can be used to eliminate entire blocks of code.

T> `webpack.EnvironmentPlugin(["NODE_ENV"])` is a shortcut that allows you to refer to environment variables. It uses `DefinePlugin` underneath, and you can achieve the same effect by passing `process.env.NODE_ENV`.

## Replacing Free Variables Through Babel

[babel-plugin-transform-inline-environment-variables](https://www.npmjs.com/package/babel-plugin-transform-inline-environment-variables) can be used to achieve the same effect. [babel-plugin-transform-define](https://www.npmjs.com/package/babel-plugin-transform-define) and [babel-plugin-minify-replace](https://www.npmjs.com/package/babel-plugin-minify-replace) are other alternatives for Babel.

{pagebreak}

## Choosing Which Module to Use

The techniques discussed in this chapter can be used to choose entire modules depending on the environment. As seen above, `DefinePlugin` based splitting allows you to choose which branch of code to use and which to discard. This idea can be used to implement branching on module level. Consider the file structure below:

```bash
.
└── store
    ├── index.js
    ├── store.dev.js
    └── store.prod.js
```

The idea is that you choose either `dev` or `prod` version of the store depending on the environment. It's that *index.js* which does the hard work:

```javascript
if (process.env.NODE_ENV === "production") {
  module.exports = require("./store.prod");
} else {
  module.exports = require("./store.dev");
}
```

Webpack can pick the right code based on the `DefinePlugin` declaration and this code. You have to use CommonJS module definition style here as ES2015 `import`s don't allow dynamic behavior by design.

T> A related technique, **aliasing**, is discussed in the *Consuming Packages* chapter.

{pagebreak}

## Conclusion

Setting environment variables is a technique that allows you to control which paths of the source are included in the build.

To recap:

* Webpack allows you to set **environment variables** through `DefinePlugin` and `EnvironmentPlugin`. Latter maps the system level environment variables to the source.
* `DefinePlugin` operates based on **free variables** and it replaces them as webpack analyzes the source code. You can achieve similar results by using Babel plugins.
* Given minifiers eliminate dead code, using the plugins allows you to remove the code from the resulting build.
* The plugins enable module level patterns. By implementing a wrapper, you can choose which file webpack includes to the resulting build.
* In addition to these plugins, you can find other optimization related plugins that allow you to control the build result in many ways.

To ensure the build has good cache invalidation behavior, you'll learn to include hashes to the generated filenames in the next chapter. This way the client notices if assets have changed and can fetch the updated versions.
