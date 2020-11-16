# Loader Definitions

Webpack provides multiple ways to set up module loaders. Each loader is a function accepting input and returning output. They can have side effects as they can emit to the file system and can intercept execution to implement caching.

## Anatomy of a loader

Webpack supports common JavaScript formats out of the box. Other formats can be handled using **loaders** by setting up a loader, or loaders, and connecting those with your directory structure. In the example below, webpack processes JavaScript through Babel:

**webpack.config.js**

```javascript
const config = {
  module: {
    rules: [
      {
        // **Conditions** to match files using RegExp, function.
        test: /\.js$/,
        // **Restrict** matching to a directory.
        include: path.join(__dirname, "app"),
        exclude: (path) => path.match(/node_modules/);
        // **Actions** to apply loaders to the matched files.
        use: "babel-loader",
      },
    ],
  },
};
```

## Loader evaluation order

It's good to keep in mind that webpack's loaders are always evaluated from right to left and from bottom to top (separate definitions). The right-to-left rule is easier to remember when you think about as functions. You can read definition `use: ["style-loader", "css-loader"]` as `style(css(input))` based on this rule. Consider the example below:

```javascript
const config = {
  test: /\.css$/,
  use: ["style-loader", "css-loader"],
};
```

Based on the right to left rule, the example can be split up while keeping it equivalent:

```javascript
const config = [
  { test: /\.css$/, use: "style-loader" },
  { test: /\.css$/, use: "css-loader" },
];
```

T> If you are not sure how a particular RegExp matches, consider using an online tool, such as [regex101](https://regex101.com/), [RegExr](http://regexr.com/), or [ExtendsClass RegEx Tester](https://extendsclass.com/regex-tester.html).

### Enforcing order

Even though it would be possible to develop an arbitrary configuration using the rule above, it can be convenient to be able to force specific rules to be applied before or after regular ones. The `enforce` field can come in handy here. It can be set to either `pre` or `post` to push processing either before or after other loaders.

Linting is a good example because the build should fail before it does anything else. Using `enforce: "post"` is rarer and it would imply you want to perform a check against the built source. Performing analysis against the built source is one potential example.

```javascript
const config = {
  test: /\.js$/,
  enforce: "pre", // "post" too
  use: "eslint-loader",
};
```

It would be possible to write the same configuration without `enforce` if you chained the declaration with other loaders related to the `test` carefully. Using `enforce` removes the necessity for that and allows you to split loader execution into separate stages that are easier to compose.

## Passing parameters to a loader

There's a query format that allows passing parameters to loaders:

```javascript
const config = { test: /\.js$/, use: "babel-loader?presets[]=env" };
```

This style of configuration works in entries and source imports too as webpack picks it up. The format comes in handy in certain individual cases, but often you are better off using more readable alternatives. In this case, it's preferable to go through `use`:

```javascript
const config = {
  test: /\.js$/,
  use: { loader: "babel-loader", options: { presets: ["env"] } },
};
```

## Inline definitions

Even though configuration level loader definitions are preferable, it's possible to write loader definitions inline:

```javascript
import "url-loader!./foo.png"; // Process through url-loader first
import "!!url-loader!./bar.png"; // Override completely
```

The problem with this approach is that it couples your source with webpack. Nonetheless, it's still an excellent form to know.

Since configuration entries go through the same mechanism, the same forms work there as well:

```javascript
const config = { entry: { app: "babel-loader!./app" } };
```

## Branching at `use` using a function

In the book setup, you compose configuration on a higher level. Another option to achieve similar results would be to branch at `use` as webpack's loader definitions accept functions that allow you to branch depending on the environment:

```javascript
const config = {
  test: /\.css$/,
  // `resource` refers to the resource path matched.
  // `resourceQuery` contains possible query passed to it
  // `issuer` tells about match context path
  // You have to return something falsy, object, or a string
  use: ({ resource, resourceQuery, issuer }) =>
    env === "development" && ["css-loader", "style-loader"],
};
```

Carefully applied, this technique allows different means of composition.

## Loading based on `issuer`

`issuer` can be used to control behavior based on where a resource was imported. In the example below, **style-loader** is applied when webpack captures a CSS file from a JavaScript import:

```javascript
const config = {
  test: /\.css$/,
  rules: [
    { issuer: /\.js$/, use: "style-loader" },
    { use: "css-loader" },
  ],
};
```

Another approach would be to mix `issuer` and `not`:

```javascript
const config = {
  test: /\.css$/,
  rules: [
    // CSS imported from other modules is added to the DOM
    { issuer: { not: /\.css$/ }, use: "style-loader" },
    // Apply css-loader against CSS imports to return CSS
    { use: "css-loader" },
  ],
};
```

## Loading based on `resourceQuery`

`oneOf` field makes it possible to route webpack to a specific loader based on a resource related match:

```javascript
const config = {
  test: /\.png$/,
  oneOf: [
    { resourceQuery: /inline/, use: "url-loader" },
    { resourceQuery: /external/, use: "file-loader" },
  ],
};
```

If you wanted to embed the context information to the filename, the rule could use `resourcePath` over `resourceQuery`.

## Loading with `info` object

Webpack provides advanced access to compilation if you pass a function as a loader definition for the `use` field. It expects you to return a loader from the call:

```javascript
const config = {
  rules: [
    {
      test: /\.js$/,
      use: [
        (info) => ({
          loader: "babel-loader",
          options: { presets: ["env"] },
        }),
      ],
    },
  ],
};
```

If you execute code like this, you'll see a print in the console:

```bash
{
  resource: '/webpack-demo/src/main.css',
  realResource: '/webpack-demo/src/main.css',
  resourceQuery: '',
  issuer: '',
  compiler: 'mini-css-extract-plugin /webpack-demo/node_modules/css-loader/dist/cjs.js!/webpack-demo/node_modules/postcss-loader/src/index.js??ref--4-2!/webpack-demo/node_modules/postcss-loader/src/index.js??ref--4-3!/webpack-demo/src/main.css'
}
```

## Alternate ways to match files

`test` combined with `include` or `exclude` to constrain the match is the most common approach to match files. These accept the data types as listed below:

- `test` - Match against a RegExp, string, function, an object, or an array of conditions like these.
- `include` - The same.
- `exclude` - The same, except the output is the inverse of `include`.
- `resource: /inline/` - Match against a resource path including the query. Examples: `/path/foo.inline.js`, `/path/bar.png?inline`.
- `issuer: /bar.js/` - Match against a resource requested from the match. Example: `/path/foo.png` would match if it was requested from `/path/bar.js`.
- `resourcePath: /inline/` - Match against a resource path without its query. Example: `/path/foo.inline.png`.
- `resourceQuery: /inline/` - Match against a resource based on its query. Example: `/path/foo.png?inline`.

Boolean based fields can be used to constrain these matchers further:

- `not` - Do **not** match against a condition (see `test` for accepted values).
- `and` - Match against an array of conditions. All must match.
- `or` - Match against an array while any must match.

## Understanding loader behavior

Loader behavior can be understood in greater detail by inspecting them. [loader-runner](https://www.npmjs.com/package/loader-runner) allows you to run them in isolation without webpack. Webpack uses this package internally and _Extending with Loaders_ chapter covers it in detail.

[inspect-loader](https://www.npmjs.com/package/inspect-loader) allows you to inspect what's being passed between loaders. Instead of having to insert `console.log`s within `node_modules`, you can attach this loader to your configuration and inspect the flow there.

## Conclusion

Webpack provides multiple ways to setup loaders but sticking with `use` is enough starting from webpack 4. Be careful with loader ordering, as it's a common source of problems.

To recap:

- **Loaders** allow you determine what should happen when webpack's module resolution mechanism encounters a file.
- A loader definition consists of **conditions** based on which to match and **actions** that should be performed when a match happens.
- Webpack provides multiple ways to match and alter loader behavior. You can, for example, match based on a **resource query** after a loader has been matched and route the loader to specific actions.

In the next chapter, you'll learn to load images using webpack.
