# Consuming Packages

Sometimes packages have not been packaged the way you expect, and you have to tweak the way webpack interprets them. Webpack provides multiple ways to achieve this.

## `resolve.alias`

Sometimes packages do not follow the standard rules and their *package.json* contains a faulty `main` field. It can be missing altogether. `resolve.alias` is the field to use here as in the example below:

```javascript
{
  resolve: {
    alias: {
      demo: path.resolve(
        __dirname,
        "node_modules/demo/dist/demo.js"
      ),
    },
  },
},
```

The idea is that if webpack resolver matches `demo` in the beginning, it resolves from the target. You can constrain the process to an exact name by using a pattern like `demo$`.

Light React alternatives, such as [Preact](https://www.npmjs.com/package/preact), [react-lite](https://www.npmjs.com/package/react-lite), or [Inferno](https://www.npmjs.com/package/inferno), offer smaller size while trading off functionality like `propTypes` and synthetic event handling. Replacing React with a lighter alternative can save a significant amount of space, but you should test well if you do this.

If you are using *react-lite*, configure it as below:

```javascript
{
  resolve: {
    alias: {
      // Swap the target based on your need
      react: "react-lite",
      "react-dom": "react-lite",
    },
  },
},
```

T> The same technique works with loaders too. You can use `resolveLoader.alias` similarly. You can use the method to adapt a RequireJS project to work with webpack.

## `resolve.extensions`

By default, webpack will resolve only against `.js` and `.json` files while importing without an extension, to tune this to include JSX files, adjust as below:

```javascript
{
  resolve: {
    extensions: [".js", ".json", ".jsx"],
  },
},
```

## `resolve.modules`

The module resolution process can be altered by changing where webpack looks for modules. By default, it will look only within the *node_modules* directory. If you want to override packages there, you could tell webpack to look into other directories first:

```javascript
{
  resolve: {
    modules: ["my_modules", "node_modules"],
  },
},
```

After the change, webpack will try to look into the *my_modules* directory first. The method can be applicable in large projects where you want to customize behavior.

## `resolve.plugins`

Webpack allows you to customize the module resolution behavior using the `resolve.plugins` field. Consider the following plugin examples:

* [directory-named-webpack-plugin](https://www.npmjs.com/package/directory-named-webpack-plugin) maps imports made against directories to files matching the directory name. For example, it would map `import foo from "./foo";` to `import foo from "./foo/foo.js";`. The pattern is popular with React and using the plugin will allow you to simplify your code. [babel-plugin-module-resolver](https://www.npmjs.com/package/babel-plugin-module-resolver) achieves the same behavior through Babel.
* [webpack-resolve-short-path-plugin](https://www.npmjs.com/package/webpack-resolve-short-path-plugin) was designed to avoid deeply nested imports like `import foo from "../../../foo";` by adding support for tilde (`~`) syntax. `import foo from "~foo"` would resolve against the project root if the plugin is used.

## Consuming Packages Outside of Webpack

Browser dependencies, like jQuery, are often served through publicly available Content Delivery Networks (CDN). CDNs allow you to push the problem of loading popular packages elsewhere. If a package has been already loaded from a CDN and it's in the user cache, there is no need to load it.

To use this technique, you should first mark the dependency in question as an external:

```javascript
externals: {
  jquery: "jquery",
},
```

You still have to point to a CDN and ideally provide a local fallback, so there is something to load if the CDN does not work for the client:

```html
<script src="//ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js"></script>
<script>
    window.jQuery || document.write('<script src="js/jquery-3.1.1.min.js"><\/script>')
</script>
```

T> [html-webpack-cdn-plugin](https://www.npmjs.com/package/html-webpack-cdn-plugin) is one option if you are using `HtmlWebpackPlugin` and want to inject a `script` tag automatically.

## Dealing with Globals

Sometimes modules depend on globals. `$` provided by jQuery is a good example. Webpack offers a few ways that allow you to handle them.

{pagebreak}

### Injecting Globals

[imports-loader](https://www.npmjs.com/package/imports-loader) allows you to inject globals as below:

```javascript
{
  module: {
    rules: [
      {
        // Resolve against package path.
        // require.resolve returns a path to it.
        test: require.resolve("jquery-plugin"),
        loader: "imports-loader?$=jquery",
      },
    ],
  },
},
```

### Resolving Globals

Webpack's `ProvidePlugin` allows webpack to resolve globals as it encounters them:

```javascript
{
  plugins: [
    new webpack.ProvidePlugin({
      $: "jquery",
    }),
  ],
},
```

{pagebreak}

### Exposing Globals to the Browser

Sometimes you have to expose packages to third-party scripts. [expose-loader](https://www.npmjs.com/package/expose-loader) allows this as follows:

```javascript
{
  test: require.resolve("react"),
  use: "expose-loader?React",
},
```

With the small extra tweak, the technique can be used to expose React performance utilities to the browser through `React.Perf` global. You have to insert the following code to your application entry point for this to work:

```javascript
if (process.env.NODE_ENV !== "production") {
  React.Perf = require("react-addons-perf");
}
```

T> It can be a good idea to install [React Developer Tools](https://github.com/facebook/react-devtools) to Chrome for even more information as it allows you to inspect *props* and *state* of your application.

T> [script-loader](https://www.npmjs.com/package/script-loader) allows you to execute scripts in a global context. You have to do this if the scripts you are using rely on a global registration setup.

{pagebreak}

## Removing Unused Modules

Even though packages can work well out of the box, they bring too much code to your project sometimes. [Moment.js](https://www.npmjs.com/package/moment) is a popular example. It brings locale data to your project by default.

The easiest method to disable that behavior is to use `IgnorePlugin` to ignore locales:

```javascript
{
  plugins: [new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)],
},
```

T> You can use the same mechanism to work around problematic dependencies. Example: `new webpack.IgnorePlugin(/^(buffertools)$/)`.

To bring specific locales to your project, you should use `ContextReplacementPlugin`:

```javascript
{
  plugins: [
    new webpack.ContextReplacementPlugin(
      /moment[\/\\]locale$/,
      /de|fi/
    ),
  ],
},
```

T> There's a [Stack Overflow question](https://stackoverflow.com/questions/25384360/how-to-prevent-moment-js-from-loading-locales-with-webpack/25426019) that covers these ideas in detail. See also [Ivan Akulov's explanation of `ContextReplacementPlugin`](https://iamakulov.com/notes/webpack-contextreplacementplugin/).

{pagebreak}

## Managing Pre-built Dependencies

It's possible webpack gives the following warning with certain dependencies:

```bash
WARNING in ../~/jasmine-promises/dist/jasmine-promises.js
Critical dependencies:
1:113-120 This seems to be a pre-built javascript file. Though this is possible, it's not recommended. Try to require the original source to get better results.
 @ ../~/jasmine-promises/dist/jasmine-promises.js 1:113-120
```

The warning can happen if a package points at a pre-built (i.e., minified and already processed) file. Webpack detects this case and warns against it.

The warning can be eliminated by aliasing the package to a source version as discussed above. Given sometimes the source is not available, another option is to tell webpack to skip parsing the files through `module.noParse`. It accepts either a RegExp or an array of RegExps and can be configured as below:

```javascript
{
  module: {
    noParse: /node_modules\/demo-package\/dist\/demo-package.js/,
  },
},
```

W> Take care when disabling warnings as it can hide underlying issues. Consider alternatives first. There's a [webpack issue](https://github.com/webpack/webpack/issues/1617) that discusses the problem in detail.

{pagebreak}

## Managing Symbolic Links

Symbolic links, or symlinks, are an operating system level feature that allows you to point to other files through a file system without copying them. You can use `npm link` to create global symlinks for packages under development and then use `npm unlink` to remove the links.

Webpack resolves symlinks to their full path as Node does. The problem is that if you are unaware of this fact, the behavior can surprise you especially if you rely on webpack processing. It's possible to work around the behavior as discussed in webpack issues [#1643](https://github.com/webpack/webpack/issues/1643) and [#985](https://github.com/webpack/webpack/issues/985). Webpack core behavior may improve in the future to make these workarounds unnecessary.

T> You can disable webpack's symlink handling by setting `resolve.symlinks` as `false`.

## Getting Insights on Packages

To get more information, npm provides `npm info <package>` command for basic queries. You can use it to check the metadata associated with packages while figuring out version related information. Consider the following tools as well:

* [package-config-checker](https://www.npmjs.com/package/package-config-checker) goes a step further. It allows you to understand better which packages of your project have updated recently and it provides means to get insight into your dependencies. It can reveal which packages could use download size related improvements for example.
* [slow-deps](https://www.npmjs.com/package/slow-deps) can reveal which dependencies of a project are the slowest to install.
* [weigh](https://www.npmjs.com/package/weigh) can be used figure out the approximate size of a package when it's served to a browser in different ways (uncompressed, minified, gzipped).

## Conclusion

Webpack can consume most npm packages without a problem. Sometimes, though, patching is required using webpack's resolution mechanism.

To recap:

* Use webpack's module resolution to your benefit. Sometimes you can work around issues by tweaking resolution. Often it's a good idea to try to push improvements upstream to the projects themselves, though.
* Webpack allows you to patch resolved modules. Given specific dependencies expect globals, you can inject them. You can also expose modules as globals as this is necessary for certain development tooling to work.
