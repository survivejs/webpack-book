# Consuming Packages

Even though consuming npm packages is straightforward using webpack, there are certain special considerations to take into account. Sometimes the packages might not play with you nicely, or they might require special tweaking to work properly. At the core of this is the concept of SemVer.

## Understanding SemVer

Most popular packages out there comply with SemVer. It's problematic as sometimes packages may inadvertently break it, but there are ways around this. Roughly, SemVer states that you should not break backward compatibility, given [certain rules](http://semver.org/) are met:

1. The MAJOR version gets incremented when incompatible API changes are made to stable APIs.
2. The MINOR version gets incremented when backwards-compatible functionality is added.
3. The PATCH version gets incremented when a backwards-compatible bug is fixed.

The rules are a little different for `0.x` versions. There the rule is `0.<MAJOR>.<MINOR>`. For packages considered stable and suitable for public usage (`1.0.0` and above), the rule is `<MAJOR>.<MINOR>.<PATCH>`. For example, if the current version of a package is `0.1.4` and a breaking change is performed, it should bump to `0.2.0`.

Given SemVer can be a little tricky to manage, some packages use a backward compatible alternative [ComVer](https://github.com/staltz/comver). ComVer can be described as a binary decision `<not compatible>.<compatible>`.

T> You can understand SemVer much better by studying [the online tool](http://semver.npmjs.com/) and how it behaves.

## Understanding npm Lookup

npm's lookup algorithm is another aspect that's good to understand. Sometimes this can explain certain errors, and it also leads to good practices, such as preferring local dependencies over global ones. The basic algorithm goes like this:

1. Look into immediate packages. If there is *node_modules*, crawl through that and also check the parent directories until the project root is reached. You can check that using `npm root`.
2. If nothing was found, check globally installed packages. If you are using Unix, look into */usr/local/lib/node_modules* to find them. You can figure out the specific directory using `npm root -g`.
3. If the global lookup fails, it will fail hard. You should get an error now.

On a package level, npm resolves to a file like this:

1. Look up *package.json* of the package.
2. Get the contents of the `main` field. If it doesn't exist, default to *<package>/index.js*.
3. Resolve to the `main` file.

The general lookup algorithm respects an environment variable `NODE_PATH`. If you want to tweak the resolution further, you can attach specific directories to it. Example: `NODE_PATH=$NODE_PATH:./demo`. A call like this can be included at the beginning of a *package.json* script to patch the runtime environment temporarily, although it's better to avoid this if possible.

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

Sometimes it may be beneficial to use these techniques together. Compared to npm environment, webpack provides more flexibility, although you can mimic a lot of webpack's functionality using terminal based tricks.

W> Installing global packages can lead to surprising behavior. If you have a package installed both globally and it a project happens to contain it, executing associated terminal command (say `webpack`) will point to the version of the project. The interesting thing is that it won't work unless the global package exists.

T> [app-module-path](https://www.npmjs.com/package/app-module-path) allows you adjust Node module lookup within JavaScript and this can be an interesting alternative to patching `NODE_PATH`.

## Version Ranges

npm supports multiple version ranges. I've listed the common ones below:

* `~` - Tilde matches only patch versions. For example, `~1.2` would be equal to `1.2.x`.
* `^` - Caret is the default you get using `--save` or `--save-dev`. It matches minor versions, and this means `^0.2.0` would be equal to `0.2.x`.
* `*` - Asterisk matches major releases, and it is the most dangerous of the ranges. Using this recklessly can easily break your project in the future, and I would advise against using it.
* `>= 1.3.0 < 2.0.0` - Ranges between versions can be particularly useful if you are using `peerDependencies`.

You can set the default range using `npm config set save-prefix='^'` in case you prefer something else than caret. Alternately, you can modify *~/.npmrc* directly. Especially defaulting to tilde can be a good idea that can help you to avoid some trouble with dependencies, although it won't remove potential problems entirely. That's where shrinkwrapping comes in.

## Shrinkwrapping Versions

Using version ranges can feel a little dangerous as it doesn't take much to break an application. A single change in the wrong place is enough. [npm shrinkwrap](https://docs.npmjs.com/cli/shrinkwrap) allows you to fix your dependency versions and have stricter control over the versions you are using in a production environment. Most importantly it fixes the dependencies of your dependencies avoiding accidental breakage due to version changes and SemVer.

[lockdown](https://www.npmjs.com/package/lockdown) goes further and gives guarantees about dependency content, not version alone. [shrinkpack](https://www.npmjs.com/package/shrinkpack) is another interesting complementary option.

[Yarn](https://yarnpkg.com/), an npm alternative, goes a step further as it introduces the idea of a *lockfile*. Yarn is worth a look, as it fixes certain shortcomings of npm.

## Keeping Dependencies Up to Date

An important part of maintaining a project is keeping their dependencies up to date. How to do this depends a lot of on the maturity of your project. Ideally, you have an excellent set of tests covering the functionality. If not, things can get a little hairier. You can consider the following approaches:

* You can update all dependencies at once and hope for the best. Tools, such as [npm-check-updates](https://www.npmjs.com/package/npm-check-updates), [npm-check](https://www.npmjs.com/package/npm-check), [npm-upgrade](https://www.npmjs.com/package/npm-upgrade), or [updtr](https://www.npmjs.com/package/updtr), can do this for you.
* Install the newest version of some specific dependency, e.g., `npm install lodash@* --save` as a more controlled way to approach the problem.
* Patch version information by hand by modifying *package.json* directly.

It is important to remember that your dependencies may introduce backward incompatible changes. It can be useful to remember how SemVer works and study release notes of dependencies. They might not always exist, so you may have to go through the project commit history.

T> `npm ls`, and more specifically `npm ls <package name>`, allow you to figure out which versions you have installed. `npm ls -g` performs a similar lookup against the globally installed packages.

## Tracking Dependencies

Certain services can help you to keep track of your dependencies:

* [David](https://david-dm.org/)
* [versioneye](https://www.versioneye.com/)
* [Gemnasium](https://gemnasium.com)

These services provide badges you can integrate into your project *README.md*, and they may email you about important changes. They can also point out possible security issues that have been fixed.

For testing your project, you can consider solutions, such as [Travis CI](https://travis-ci.org/) or [SauceLabs](https://saucelabs.com/). They can test your project against different environments and browsers. The advantage of doing this is that it allows you to detect regressions. If you accept pull requests to your project, these services can help to keep their quality higher as it forces the authors to maintain their code on a higher level.

[Codecov](https://codecov.io/) and [Coveralls](https://coveralls.io/) provide code coverage information and a badge to include in your README which is useful for figuring out which portions of the source to test better. It is a part of improving the quality of your pull requests as they should maintain the current coverage at a minimum and ideally improve it.

T> [shields.io](http://shields.io/) lists a large number of available badges. [NodeICO](https://nodei.co/) provides badges that aggregate package related information.

T> There's a [Codecov extension](https://chrome.google.com/webstore/detail/codecov-extension/keefkhehidemnokodkdkejapdgfjmijf) for Chrome that allows you to see code coverage through GitHub user interface.

## Tweaking Module Resolution

Sometimes packages might not follow the standard rules and their *package.json* might have a faulty `main` field or it might be missing altogether and this is where setting up a `resolve.alias` can come in handy. Consider the example below:

```javascript
{
  resolve: {
    alias: {
      demo: path.resolve(__dirname, 'node_modules/demo/dist/demo.js'),
    },
  },
},
```

The idea is that if webpack resolver matches `demo` in the beginning, it will resolve from the target. You can constrain the process to an exact name by using a pattern like `demo$`.

The technique is useful with React too. Light alternatives, such as [Preact](https://www.npmjs.com/package/preact), [react-lite](https://www.npmjs.com/package/react-lite), or [Inferno](https://www.npmjs.com/package/inferno), offer smaller size while trading off some functionality like `propTypes` and synthetic event handling. Replacing React with a lighter alternative can save a significant amount of space, but you should test well if you do this. The setup looks like this for *react-lite*. The idea is the same for others:

```javascript
{
  resolve: {
    alias: {
      'react': 'react-lite',
      'react-dom': 'react-lite',
    },
  },
  },
```

T> The same technique works with loaders too. You can use `resolveLoader.alias` in the same way to alias a loader elsewhere. The technique can be useful if you have to adapt a RequireJS project to work with webpack.

## Dealing with Globals

Sometimes modules might depend on globals, like the `$` provided by jQuery. [imports-loader](https://www.npmjs.com/package/imports-loader) allows you to inject them as below:

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

## Removing Unused Modules

Even though packages might work well out of the box, they might bring too much code to your project by default. [Moment.js](https://www.npmjs.com/package/moment) is a popular example. It brings locale data to your project by default. The simplest way to disable that behavior is to use `IgnorePlugin` to ignore locales like this:

```javascript
{
  plugins: [
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
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

T> [null-loader](https://www.npmjs.com/package/null-loader) discussed in the *Loading Fonts* chapter can be used to achieve a similar effect.

## Managing Pre-built Dependencies

It is possible webpack will give the following warning with certain dependencies:

```bash
WARNING in ../~/jasmine-promises/dist/jasmine-promises.js
Critical dependencies:
1:113-120 This seems to be a pre-built javascript file. Though this is possible, it's not recommended. Try to require the original source to get better results.
 @ ../~/jasmine-promises/dist/jasmine-promises.js 1:113-120
```

The warning can happen if a package points at a pre-built (i.e., minified and already processed) file. Webpack detects this case and warns against it.

One way to eliminate the warning would be to alias the package to a source version as discussed above. Given sometimes the source might not be available, another option is to tell webpack to skip parsing the files through `module.noParse`. It accepts either a RegExp or an array of RegExps and can be configured as below:

```javascript
{
  module: {
    noParse: /node_modules\/demo-package\/dist\/demo-package.js/,
  },
},
```

T> There's a [webpack issue](https://github.com/webpack/webpack/issues/1617) that discusses the problem in detail.

W> Disabling warnings like this one should be the last measure since doing it can hide underlying issues. Do this only if you know what you are doing and consider alternatives first.

## Exposing Globals to the Browser

Sometimes you may have to expose packages to third party scripts. [expose-loader](https://www.npmjs.com/package/expose-loader) allows this as follows:

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

## Getting Insights on Packages

Even though it's easy to consume packages through npm, there are times when it's useful to have more information available. npm provides `npm info <package>` command for basic queries. You can use it to check the metadata associated with packages while figuring out version related information.

[package-config-checker](https://www.npmjs.com/package/package-config-checker) goes a step further. It allows you to understand better which packages of your project have updated recently and it provides means to get insight into your dependencies. It can reveal which packages could use download size related improvements for example.

[slow-deps](https://www.npmjs.com/package/slow-deps) can reveal which dependencies of a project are the slowest to install.

[weigh](https://www.npmjs.com/package/weigh) can be used figure out the approximate size of a package when it's served to a browser in different ways (uncompressed, minified, gzipped).

[npms.io](https://npms.io/) provides a better search for npm. The basic search has been integrated to [npmjs.org](https://www.npmjs.com/), but npms.io can still be interesting especially because they expose their data through [a public API](https://api-docs.npms.io/) you can query programmatically.

## Conclusion

Webpack can consume most npm packages without a hitch. Sometimes, though, some patching might be required. Fortunately, its resolution mechanism is patchable enough, and you can modify the way it brings the source to your project if needed.

In the next chapter, we'll discuss how to author your npm packages. It's the other side of the same coin and worth understanding if you won't end up authoring packages of your own.
