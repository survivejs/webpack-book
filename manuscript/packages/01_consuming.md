# Consuming Packages

Consuming npm packages through webpack is often convenient but there are certain special considerations to take into account. Sometimes the packages don't play with you nicely, or they can require special tweaking to work properly. At the core of this is the concept of SemVer.

## Understanding SemVer

Most popular packages out there comply with SemVer. It's problematic as sometimes packages inadvertently break it, but there are ways around this. Roughly, SemVer states that you should not break backward compatibility, given [certain rules](http://semver.org/) are met:

1. The MAJOR version gets incremented when incompatible API changes are made to stable APIs.
2. The MINOR version gets incremented when backwards-compatible functionality is added.
3. The PATCH version gets incremented when a backwards-compatible bug is fixed.

The rules are different for `0.x` versions. There the rule is `0.<MAJOR>.<MINOR>`. For packages considered stable and suitable for public usage (`1.0.0` and above), the rule is `<MAJOR>.<MINOR>.<PATCH>`. For example, if the current version of a package is `0.1.4` and a breaking change is performed, it should bump to `0.2.0`.

Given SemVer can be tricky to manage, [ComVer](https://github.com/staltz/comver) exists as an alternative. ComVer can be described as a binary decision `<not compatible>.<compatible>`.

T> You can understand SemVer much better by studying [the online tool](http://semver.npmjs.com/) and how it behaves.

## Dependency Types

An npm package comes with different types of dependencies:

* `dependencies` refer to the direct dependencies a package needs to work. On application level you could list the dependencies of the application code itself. This excludes dependencies needed to build it.
* `devDependencies` are dependencies you need to develop the package. They include packages related to building, testing, and similar tasks. When you install a package from npm, they won't be installed by default. If you run `npm install` on a project locally, npm will install them.
* `peerDependencies` are usually given as version ranges. The idea is to allow the user to decide the exact versions of these dependencies without fixing it to a specific one. The behavior was changed in npm 3. Before that npm install peer dependencies automatically. Now you have to install and include them to your project explicitly.
* `bundledDependencies` refer to dependencies that are bundled with the package itself. They are used rarely, though.
* `optionalDependencies` are dependencies that the user can install but aren't required for the package to work. This is another rare field.

Often npm consumption workflow resolves around two commands:

* `npm install <package> --save` or `npm i <package> -S`.
* `npm install <package> --save-dev` or `npm i <package> -D`

To install a specific version, you should pass it through `@<version>`. npm will set the version prefix based on *~/.npmrc*. The related ranges are discussed later in this chapter.

You can refer to a package by its name and version but that is not the only way. Consider the following alternatives:

* `<git repository>#<reference>` points to a Git repository and a Git reference.
* `<github user>/<project>#<reference>` shortcut points to GitHub in a similar manner.
* `<github user>/<project>#pull/<id>/head` points to a specific GitHub pull request.

`<reference>` can be either commit hash, tag, or a branch. The technique does not work unless the package has been set up to support consumption outside of Git. The *Authoring Packages* chapter shows how to achieve this.

## Understanding npm Lookup

npm's lookup algorithm is another aspect that's good to understand. Sometimes this can explain certain errors, and it also leads to good practices, such as preferring local dependencies over global ones. The basic algorithm goes as below:

1. Look into immediate packages. If there is *node_modules*, crawl through that and also check the parent directories until the project root is reached. You can check that using `npm root`.
2. If nothing was found, check globally installed packages. If you are using Unix, look into */usr/local/lib/node_modules* to find them. You can figure out the specific directory using `npm root -g`.
3. If the global lookup fails, it fails hard. You should get an error now.

On a package level, npm resolves to a file through the following process:

1. Look up *package.json* of the package.
2. Get the contents of the `main` field. If it doesn't exist, default to *<package>/index.js*.
3. Resolve to the `main` file.

The general lookup algorithm respects an environment variable `NODE_PATH`. If you want to tweak the resolution further, you can attach specific directories to it. Example: `NODE_PATH=$NODE_PATH:./demo`. This kind of call can be included at the beginning of a *package.json* script to patch the runtime environment temporarily, although it's better to avoid this if possible.

You can tweak webpack's module resolution through the `resolve.modules` field. Example:

```javascript
{
  resolve: {
    modules: [
      path.join(__dirname, 'demo'),
      'node_modules',
    ],
  },
},
```

Sometimes it's beneficial to use these techniques together. Compared to npm environment, webpack provides more flexibility, although you can mimic a lot of webpack's functionality using terminal based tricks.

W> Installing global packages can lead to surprising behavior. If you have a package installed both globally and it a project happens to contain it, executing associated terminal command (say `webpack`) points to the version of the project. It doesn't work unless the global package exists.

T> [app-module-path](https://www.npmjs.com/package/app-module-path) allows you adjust Node module lookup within JavaScript and this can be an alternative to patching `NODE_PATH`.

{pagebreak}

## Version Ranges

npm supports multiple version ranges as listed below:

* `~` - Tilde matches only patch versions. For example, `~1.2` would be equal to `1.2.x`.
* `^` - Caret is the default you get using `--save` or `--save-dev`. It matches minor versions, and this means `^0.2.0` would be equal to `0.2.x`.
* `*` - Asterisk matches major releases, and it's the most dangerous of the ranges. Using this recklessly can easily break your project in the future.
* `>= 1.3.0 < 2.0.0` - Ranges between versions come in handy with `peerDependencies`.

You can set the default range using `npm config set save-prefix='^'` in case you prefer something else than caret. Alternately, you can modify *~/.npmrc* directly. Especially defaulting to tilde can be a good idea that can help you to avoid trouble with dependencies, although it doesn't remove potential problems entirely. That's where shrinkwrapping comes in.

## Shrinkwrapping Versions

Using version ranges can feel dangerous as it doesn't take much to break an application. A single change in the wrong place is enough. [npm shrinkwrap](https://docs.npmjs.com/cli/shrinkwrap) allows you to fix your dependency versions and have stricter control over the versions you are using in a production environment. Most importantly it fixes the dependencies of your dependencies avoiding accidental breakage due to version changes and SemVer.

[lockdown](https://www.npmjs.com/package/lockdown) goes further and gives guarantees about dependency content, not version alone. [shrinkpack](https://www.npmjs.com/package/shrinkpack) is another complementary option.

[Yarn](https://yarnpkg.com/), an npm alternative, goes a step further as it introduces the idea of a *lockfile*. Yarn is worth a look, as it fixes certain shortcomings of npm.

## Keeping Dependencies Up to Date

An important part of maintaining a project is keeping their dependencies up to date. How to do this depends a lot of on the maturity of your project. Ideally, you have an excellent set of tests covering the functionality to avoid problems with updates. Consider the following approaches:

* You can update all dependencies at once and hope for the best. Tools, such as [npm-check-updates](https://www.npmjs.com/package/npm-check-updates), [npm-check](https://www.npmjs.com/package/npm-check), [npm-upgrade](https://www.npmjs.com/package/npm-upgrade), or [updtr](https://www.npmjs.com/package/updtr), can do this for you.
* Install the newest version of a specific dependency, e.g., `npm install lodash@* --save` as a more controlled approach.
* Patch version information by hand by modifying *package.json* directly.

It's important to remember that your dependencies can introduce backward incompatible changes. Remember how SemVer works and study the release notes of dependencies. They don't exist always, so you have to go through the project commit history.

T> `npm ls`, and more specifically `npm ls <package name>`, allow you to figure out which versions you have installed. `npm ls -g` performs a similar lookup against the globally installed packages.

{pagebreak}

## Tracking Dependencies

Certain services can help you to keep track of your dependencies:

* [David](https://david-dm.org/)
* [versioneye](https://www.versioneye.com/)
* [Gemnasium](https://gemnasium.com)

These services provide badges you can integrate into your project *README.md*, and they email you about important changes. They can also point out possible security issues that have been fixed.

For testing your project, you can consider solutions, such as [Travis CI](https://travis-ci.org/) or [SauceLabs](https://saucelabs.com/). They can test your project against different environments and browsers. The advantage of doing this is that it allows you to detect regressions. If you accept pull requests to your project, these services can help to keep their quality higher as it forces the authors to maintain their code on a higher level.

[Codecov](https://codecov.io/) and [Coveralls](https://coveralls.io/) provide code coverage information and a badge to include in your README. It's a part of improving the quality of your pull requests as they should maintain the current coverage at a minimum and ideally improve it.

T> [shields.io](http://shields.io/) lists a large number of available badges. [NodeICO](https://nodei.co/) provides badges that aggregate package related information.

T> There's a [Codecov extension](https://chrome.google.com/webstore/detail/codecov-extension/keefkhehidemnokodkdkejapdgfjmijf) for Chrome that allows you to see code coverage through GitHub user interface.

## Tweaking Module Resolution

Sometimes packages do not follow the standard rules and their *package.json* contains a faulty `main` field. It can be missing altogether. `resolve.alias` is the field to use here as in the example below:

```javascript
{
  resolve: {
    alias: {
      demo: path.resolve(
        __dirname, 'node_modules/demo/dist/demo.js'
      ),
    },
  },
},
```

The idea is that if webpack resolver matches `demo` in the beginning, it resolves from the target. You can constrain the process to an exact name by using a pattern like `demo$`.

Light React alternatives, such as [Preact](https://www.npmjs.com/package/preact), [react-lite](https://www.npmjs.com/package/react-lite), or [Inferno](https://www.npmjs.com/package/inferno), offer smaller size while trading off functionality like `propTypes` and synthetic event handling. Replacing React with a lighter alternative can save a significant amount of space but you should test well if you do this.

{pagebreak}

If you are using *react-lite*, configure it as below:

```javascript
{
  resolve: {
    alias: {
      // Swap the target based on your need.
      'react': 'react-lite',
      'react-dom': 'react-lite',
    },
  },
},
```

T> The same technique works with loaders too. You can use `resolveLoader.alias` similarly. You can use the technique to adapt a RequireJS project to work with webpack.

## Consuming Packages Outside of Webpack

Browser dependencies, like jQuery, are often served through publicly available Content Delivery Networks (CDN). CDNs allow you to push the problem of loading popular packages elsewhere. If a package has been already loaded from a CDN and it's in the user cache, there is no need to load it.

To use this technique, you should first mark the dependency in question as an external:

```javascript
externals: {
  'jquery': 'jquery',
},
```

{pagebreak}

You still have to point to a CDN and ideally provide a local fallback so there is something to load if the CDN does not work for the client:

```html
<script src="//ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js"></script>
<script>
    window.jQuery || document.write('<script src="js/jquery-3.1.1.min.js"><\/script>')
</script>
```

T> [html-webpack-cdn-plugin](https://www.npmjs.com/package/html-webpack-cdn-plugin) is one option if you are using `HtmlWebpackPlugin` and want to inject a `script` tag automatically.

## Dealing with Globals

Sometimes modules depend on globals. `$` provided by jQuery is a good example. [imports-loader](https://www.npmjs.com/package/imports-loader) allows you to inject them as below:

```javascript
{
  module: {
    rules: {
      // Resolve against package path.
      // require.resolve returns a path to it.
      test: require.resolve('jquery-plugin'),
      loader: 'imports-loader?$=jquery',
    },
  },
},
```

{pagebreak}

Webpack's `ProvidePlugin` can be used for a similar purpose. It allows webpack to resolve globals as it encounters them:

```javascript
{
  plugins: [
    new webpack.ProvidePlugin({
      $: 'jquery',
    }),
  ],
},
```

T> [script-loader](https://www.npmjs.com/package/script-loader) allows you to execute scripts in a global context. You have to do this if the scripts you are using rely on a global registration setup.

## Removing Unused Modules

Even though packages can work well out of the box, they bring too much code to your project sometimes. [Moment.js](https://www.npmjs.com/package/moment) is a popular example. It brings locale data to your project by default. The easiest method to disable that behavior is to use `IgnorePlugin` to ignore locales:

```javascript
{
  plugins: [
    new webpack.IgnorePlugin(
      /^\.\/locale$/,
      /moment$/
    ),
  ],
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

T> There's a [Stack Overflow question](https://stackoverflow.com/questions/25384360/how-to-prevent-moment-js-from-loading-locales-with-webpack/25426019) that covers these ideas in detail.

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

W> Disabling warnings should be the last measure since doing it can hide underlying issues. Do this only if you know what you are doing and consider alternatives first. There's a [webpack issue](https://github.com/webpack/webpack/issues/1617) that discusses the problem in detail.

## Managing Symbolic Links

Symbolic links, or symlinks, are an operating system level feature that allow you to point to other files through a file system without copying them. You can use `npm link` to create global symlinks for packages under development and then use `npm unlink` to remove the links.

Webpack resolves symlinks to their full path like Node does. The problem is that if you are unaware of this fact, the behavior can surprise you especially if you rely on webpack processing. It's possible to work around the behavior as discussed in webpack issues [#1643](https://github.com/webpack/webpack/issues/1643) and [#985](https://github.com/webpack/webpack/issues/985). Webpack core behavior may improve in the future to make these workarounds unnecessary.

## Exposing Globals to the Browser

Sometimes you have to expose packages to third party scripts. [expose-loader](https://www.npmjs.com/package/expose-loader) allows this as follows:

```javascript
{
  test: require.resolve('react'),
  use: 'expose-loader?React',
},
```

With the small extra tweak, the technique can be used to expose React performance utilities to the browser through `React.Perf` global. You have to insert the following code to your application entry point for this to work:

```javascript
if (process.env.NODE_ENV !== 'production') {
  React.Perf = require('react-addons-perf');
}
```

T> It can be a good idea to install [React Developer Tools](https://github.com/facebook/react-devtools) to Chrome for even more information as it allows you to inspect *props* and *state* of your application.

{pagebreak}

### Disabling Asset Loading

It's possible a package comes with formats you are not interested in. A good example of this is a font framework. They often provide fonts in all formats, but you need only a few if you support modern browsers.

[null-loader](https://www.npmjs.com/package/null-loader) fits the use case. You can tell webpack to pipe certain assets through it.

You can model an `ignore` part using *null-loader*:

**webpack.parts.js**

```javascript
exports.ignore = ({ test, include, exclude }) => ({
  module: {
    rules: [
      {
        test,
        include,
        exclude,

        use: 'null-loader',
      },
    ],
  },
});
```

{pagebreak}

To ignore all Font Awesome SVGs, you could have a definition as below:

**webpack.config.js**

```javascript
const commonConfig = merge([
  ...
leanpub-start-insert
  parts.ignore({
    test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
    include: /font-awesome/,
  }),
leanpub-end-insert
]);
```

As a result you should get `// empty (null-loader)` for the matched SVG files.

## Getting Insights on Packages

To get more information about packages, npm provides `npm info <package>` command for basic queries. You can use it to check the metadata associated with packages while figuring out version related information.

[package-config-checker](https://www.npmjs.com/package/package-config-checker) goes a step further. It allows you to understand better which packages of your project have updated recently and it provides means to get insight into your dependencies. It can reveal which packages could use download size related improvements for example.

[slow-deps](https://www.npmjs.com/package/slow-deps) can reveal which dependencies of a project are the slowest to install.

[weigh](https://www.npmjs.com/package/weigh) can be used figure out the approximate size of a package when it's served to a browser in different ways (uncompressed, minified, gzipped).

{pagebreak}

## Conclusion

Webpack can consume most npm packages without a problem. Sometimes, though, patching is required using webpack's resolution mechanism.

To recap:

* npm packages can be grouped based on their purpose. Often you split them between `dependencies` and `devDependencies`. `peerDependencies` allow you to control the exact version on the consumer side.
* To consume packages effectively, you should understand SemVer. To keep your build repeatable, use shrinkwrapping or Yarn lockfiles.
* Use webpack's module resolution to your benefit. Sometimes you can work around issues by tweaking resolution. Often it's a good idea to try to push improvements upstream to the projects themselves, though.
* Webpack allows you to patch resolved modules. Given certain dependencies expect globals, you can inject them. You can also expose modules as globals as this is necessary for certain development tooling to work.
* To understand your dependencies better, use available tooling and service to study them.

In the next chapter, you'll learn to author npm packages. It's the other side of the same coin and worth understanding even if you don't end up authoring packages of your own.
