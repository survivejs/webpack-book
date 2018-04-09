# Loader Definitions

Webpack provides multiple ways to set up module loaders. Webpack 2 simplified the situation by introducing the `use` field. It can be a good idea to prefer absolute paths here as they allow you to move configuration without breaking assumptions.

The other way is to set `context` field as this gives a similar effect and affects the way entry points and loaders are resolved. It doesn't have an impact on the output, though, and you still need to use an absolute path or `/` there.

Assuming you set an `include` or `exclude` rule, packages loaded from *node_modules* still work as the assumption is that they have been compiled in such a way that they work out of the box. If they don't, then you have to apply techniques covered in the *Consuming Packages* chapter.

T> `include`/`exclude` is handy with *node_modules* as webpack processes and traverses the installed packages by default when you import JavaScript files to your project. Therefore you need to configure it to avoid that behavior. Other file types don't suffer from this issue.

## Anatomy of a Loader

Webpack supports a large variety of formats through *loaders*. Also, it supports a couple of JavaScript module formats out of the box. The idea is the same. You always set up a loader, or loaders, and connect those with your directory structure.

{pagebreak}

Consider the example below where webpack processes JavaScript through Babel:

**webpack.config.js**

```javascript
module.exports = {
  ...
  module: {
    rules: [
      {
        // **Conditions** to match files using RegExp, function.
        test: /\.js$/,

        // **Restrictions**
        // Restrict matching to a directory. This
        // also accepts an array of paths or a function.
        // The same applies to `exclude`.
        include: path.join(__dirname, "app"),
        exclude(path) {
          // You can perform more complicated checks  as well.
          return path.match(/node_modules/);
        },

        // **Actions** to apply loaders to the matched files.
        use: "babel-loader",
      },
    ],
  },
};
```

T> If you are not sure how a particular RegExp matches, consider using an online tool, such as [regex101](https://regex101.com/), [RegExr](http://regexr.com/), or [Regexper](https://regexper.com).

## Loader Evaluation Order

It's good to keep in mind that webpack's loaders are always evaluated from right to left and from bottom to top (separate definitions). The right-to-left rule is easier to remember when you think about as functions. You can read definition `use: ["style-loader", "css-loader"]` as `style(css(input))` based on this rule.

To see the rule in action, consider the example below:

```javascript
{
  test: /\.css$/,
  use: ["style-loader", "css-loader"],
},
```

Based on the right to left rule, the example can be split up while keeping it equivalent:

```javascript
{
  test: /\.css$/,
  use: "style-loader",
},
{
  test: /\.css$/,
  use: "css-loader",
},
```

### Enforcing Order

Even though it would be possible to develop an arbitrary configuration using the rule above, it can be convenient to be able to force specific rules to be applied before or after regular ones. The `enforce` field can come in handy here. It can be set to either `pre` or `post` to push processing either before or after other loaders.

Linting is a good example because the build should fail before it does anything else. Using `enforce: "post"` is rarer and it would imply you want to perform a check against the built source. Performing analysis against the built source is one potential example.

{pagebreak}

The basic syntax goes as below:

```javascript
{
  // Conditions
  test: /\.js$/,
  enforce: "pre", // "post" too

  // Actions
  use: "eslint-loader",
},
```

It would be possible to write the same configuration without `enforce` if you chained the declaration with other loaders related to the `test` carefully. Using `enforce` removes the necessity for that and allows you to split loader execution into separate stages that are easier to compose.

## Passing Parameters to a Loader

There's a query format that allows passing parameters to loaders:

```javascript
{
  // Conditions
  test: /\.js$/,
  include: PATHS.app,

  // Actions
  use: "babel-loader?presets[]=env",
},
```

This style of configuration works in entries and source imports too as webpack picks it up. The format comes in handy in certain individual cases, but often you are better off using more readable alternatives.

{pagebreak}

It's preferable to go through `use`:

```javascript
{
  // Conditions
  test: /\.js$/,
  include: PATHS.app,

  // Actions
  use: {
    loader: "babel-loader",
    options: {
      presets: ["env"],
    },
  },
},
```

If you wanted to use more than one loader, you could pass an array to `use` and expand from there:

```javascript
{
  test: /\.js$/,
  include: PATHS.app,

  use: [
    {
      loader: "babel-loader",
      options: {
        presets: ["env"],
      },
    },
    // Add more loaders here
  ],
},
```

{pagebreak}

## Branching at `use` Using a Function

In the book setup, you compose configuration on a higher level. Another option to achieve similar results would be to branch at `use` as webpack's loader definitions accept functions that allow you to branch depending on the environment. Consider the example below:

```javascript
{
  test: /\.css$/,

  // `resource` refers to the resource path matched.
  // `resourceQuery` contains possible query passed to it
  // `issuer` tells about match context path
  use: ({ resource, resourceQuery, issuer }) => {
    // You have to return something falsy, object, or a
    // string (i.e., "style-loader") from here.
    //
    // Returning an array fails! Nest rules instead.
    if (env === "development") {
      return {
        use: {
          loader: "css-loader", // css-loader first
          rules: [
            "style-loader", // style-loader after
          ],
        },
      };
    }
  },
},
```

Carefully applied, this technique allows different means of composition.

## Inline Definitions

Even though configuration level loader definitions are preferable, it's possible to write loader definitions inline:

```javascript
// Process foo.png through url-loader and other
// possible matches.
import "url-loader!./foo.png";

// Override possible higher level match completely
import "!!url-loader!./bar.png";
```

The problem with this approach is that it couples your source with webpack. Nonetheless, it's still an excellent form to know. Since configuration entries go through the same mechanism, the same forms work there as well:

```javascript
{
  entry: {
    app: "babel-loader!./app",
  },
},
```

## Alternate Ways to Match Files

`test` combined with `include` or `exclude` to constrain the match is the most common approach to match files. These accept the data types as listed below:

* `test` - Match against a RegExp, string, function, an object, or an array of conditions like these.
* `include` - The same.
* `exclude` - The same, except the output is the inverse of `include`.
* `resource: /inline/` - Match against a resource path including the query. Examples: `/path/foo.inline.js`, `/path/bar.png?inline`.
* `issuer: /bar.js/` - Match against a resource requested from the match. Example: `/path/foo.png` would match if it was requested from `/path/bar.js`.
* `resourcePath: /inline/` - Match against a resource path without its query. Example: `/path/foo.inline.png`.
* `resourceQuery: /inline/` - Match against a resource based on its query. Example: `/path/foo.png?inline`.

Boolean based fields can be used to constrain these matchers further:

* `not` - Do **not** match against a condition (see `test` for accepted values).
* `and` - Match against an array of conditions. All must match.
* `or` - Match against an array while any must match.

## Loading Based on `resourceQuery`

`oneOf` field makes it possible to route webpack to a specific loader based on a resource related match:

```javascript
{
  test: /\.png$/,
  oneOf: [
    {
      resourceQuery: /inline/,
      use: "url-loader",
    },
    {
      resourceQuery: /external/,
      use: "file-loader",
    },
  ],
},
```

If you wanted to embed the context information to the filename, the rule could use `resourcePath` over `resourceQuery`.

{pagebreak}

## Loading Based on `issuer`

`issuer` can be used to control behavior based on where a resource was imported. In the example below adapted from [css-loader issue 287](https://github.com/webpack-contrib/css-loader/pull/287#issuecomment-261269199), *style-loader* is applied when webpack captures a CSS file from a JavaScript import:

```javascript
{
  test: /\.css$/,

  rules: [
    {
      issuer: /\.js$/,
      use: "style-loader",
    },
    {
      use: "css-loader",
    },
  ],
},
```

Another approach would be to mix `issuer` and `not`:

```javascript
{
  test: /\.css$/,

  rules: [
    // CSS imported from other modules is added to the DOM
    {
      issuer: { not: /\.css$/ },
      use: "style-loader",
    },
    // Apply css-loader against CSS imports to return CSS
    {
      use: "css-loader",
    },
  ],
}
```

## Understanding Loader Behavior

Loader behavior can be understood in greater detail by inspecting them. [loader-runner](https://www.npmjs.com/package/loader-runner) allows you to run them in isolation without webpack. Webpack uses this package internally and *Extending with Loaders* chapter covers it in detail.

[inspect-loader](https://www.npmjs.com/package/inspect-loader) allows you to inspect what's being passed between loaders. Instead of having to insert `console.log`s within *node_modules*, you can attach this loader to your configuration and inspect the flow there.

## Conclusion

Webpack provides multiple ways to setup loaders but sticking with `use` is enough in webpack 4. Be careful with loader ordering, as it's a common source of problems.

To recap:

* **Loaders** allow you determine what should happen when webpack's module resolution mechanism encounters a file.
* A loader definition consists of **conditions** based on which to match and **actions** that should be performed when a match happens.
* Webpack 2 introduced the `use` field. It combines the ideas of old `loader` and `loaders` fields into a single construct.
* Webpack 4 provides multiple ways to match and alter loader behavior. You can, for example, match based on a **resource query** after a loader has been matched and route the loader to specific actions.

In the next chapter, you'll learn to load images using webpack.
