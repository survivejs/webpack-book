# Consuming Packages

Even though consuming npm packages is simple using webpack, there are certain special considerations to take into account. Sometimes the packages might not play with you nicely or they might require special tweaking to work properly. At the core of this is the concept of SemVer.

## Understanding SemVer

Most of the packages out there comply with a versioning scheme known as SemVer. It's not problematic as sometimes packages may inadvertently break it, but there are ways around this. Roughly, SemVer states that you should not break backwards compatibility, given [certain rules](http://semver.org/) are met:

1. The MAJOR version gets incremented when incompatible API changes are made to stable APIs.
2. The MINOR version gets incremented when backwards-compatible functionality are added.
3. The PATCH version gets incremented when backwards-compatible bug are fixed.

The rules are a little different for `0.x` versions. There the rule is `0.<MAJOR>.<MINOR>`. For packages considered stable and suitable for public usage (`1.0.0` and above), the rules is `<MAJOR>.<MINOR>.<PATCH>`. For example, if the current version of a package is `0.1.4` and a breaking change is performed, it should bump to `0.2.0`.

Given SemVer can be a little tricky to manage, some packages use a backwards compatible alternative known as [ComVer](https://github.com/staltz/comver). SemVer can be described as a binary decision `<not compatible>.<compatible>`.

T> You can understand SemVer much better by studying [the online tool](http://semver.npmjs.com/) and how it behaves.

## Understanding npm Lookup

npm's lookup algorithm is another aspect that's good to understand. Sometimes this can explain certain errors and it also leads to good practices, such as preferring local dependencies over global ones. The basic algorithm goes like this:

1. Look into immediate packages. If there is *node_modules*, crawl through that. This will also check the parent directories until it reaches project root. You can check that using `npm root`.
2. If nothing was found, check globally installed packages. If you are using Unix, look into */usr/local/lib/node_modules* to find them. You can figure out the exact directory using `npm root -g`.
3. If the global lookup fails, fail hard. You should get an error now.

On a package level, npm resolves to a file like this:

1. Look up *package.json* of the package.
2. Get the contents of the `main` field. If it doesn't exist, default to *<package>/index.js*.
3. Resolve to the `main` file.

The general lookup algorithm respects an environment variable known as `NODE_PATH`. If you want to tweak the resolution further, you can attach specific directories to it. Example: `NODE_PATH=$NODE_PATH:./demo`. A call like this can be included in the beginning of a *package.json* script to patch the runtime environment temporarily although it's better to avoid this if possible.

You can tweak webpack's module resolution through the `resolve.modules` field. Example:

```javascript
{
  resolve: {
    modules: [
      path.join(__dirname, 'demo'),
      'node_modules'
    ]
  }
}
```

Sometimes it may be beneficial to use these techniques together. Compared to npm environment, webpack provides more flexibility, although you can mimic a lot of webpack's functionality using terminal based tricks.

W> Installing packages globally can lead to surprising behavior. If you have a package installed both globally and it a project happens to contain it, executing associated terminal command (say `webpack`) will point to the version of the project. This won't work unless the global package exists.

## Version Ranges

npm supports multiple version ranges. I've listed the common ones below:

* `~` - Tilde matches only patch versions. For example, `~1.2` would be equal to `1.2.x`.
* `^` - Caret is the default you get using `--save` or `--save-dev`. It matches to It matches minor versions. This means `^0.2.0` would be equal to `0.2.x`.
* `*` - Asterisk matches major releases. This is the most dangerous of the ranges. Using this recklessly can easily break your project in the future and I would advise against using it.
* `>= 1.3.0 < 2.0.0` - Range between versions. This can be particularly useful if you are using `peerDependencies`.

You can set the default range using `npm config set save-prefix='^'` in case you prefer something else than caret. Alternatively you can modify *~/.npmrc* directly. Especially defaulting to tilde can be a good idea that can help you to avoid some trouble with dependencies although it won't remove potential problems entirely. That's where shrinkwrapping comes in.

## Shrinkwrapping Versions

Using version ranges can feel a little dangerous as it doesn't take much to break an application. A single change in the wrong place is enough. [npm shrinkwrap](https://docs.npmjs.com/cli/shrinkwrap) allows you to fix your dependency versions and have stricter control over the versions you are using in a production environment.

[lockdown](https://www.npmjs.com/package/lockdown) goes further and gives guarantees about dependency content, not just version. [shrinkpack](https://www.npmjs.com/package/shrinkpack) is another interesting complementary option.

[Yarn](https://yarnpkg.com/), a npm alternative, goes a step further as it introduces something known as *lockfile*. Yarn is worth a look as it fixes certain shortcomings of npm.

## Keeping Dependencies Up to Date

An important part of maintaining a project is keeping their dependencies up to date. How to do this depends a lot on the maturity of your project. Ideally, you have a nice set of tests covering the functionality. If not, things can get a little hairier. There are a few ways to approach dependency updates:

* You can update all dependencies at once and hope for the best. Tools, such as [npm-check-updates](https://www.npmjs.com/package/npm-check-updates), [npm-check](https://www.npmjs.com/package/npm-check), [npm-upgrade](https://www.npmjs.com/package/npm-upgrade), or [updtr](https://www.npmjs.com/package/updtr), can do this for you.
* Install the newest version of some specific dependency, e.g., `npm i lodash@* --save`. This is a more controlled way to approach the problem.
* Patch version information by hand by modifying *package.json* directly.

It is important to remember that your dependencies may introduce backwards incompatible changes. It can be useful to remember how SemVer works and study release notes of dependencies. They might not always exist, so you may have to go through the project commit history.

## Tracking Dependencies

There are a few services that can help you to keep track of your dependencies:

* [David](https://david-dm.org/)
* [versioneye](https://www.versioneye.com/)
* [Gemnasium](https://gemnasium.com)

These services provide badges you can integrate into your project *README.md* and they may email you about important changes. They can also point out possible security issues that have been fixed.

For testing your project you can consider solutions, such as [Travis CI](https://travis-ci.org/) or [SauceLabs](https://saucelabs.com/). They can test your project against different environments and browsers even. The advantage of doing this is that it allows you to detect regressions. If you accept pull requests to your project, these services can help to keep their quality higher as it forces the authors to maintain their code on higher level.

[Codecov](https://codecov.io/) and [Coveralls](https://coveralls.io/) provide code coverage information and a badge to include in your README. This is useful for figuring out which portions of the source to test better. It is a part of improving the quality of your pull requests as they should maintain the current coverage at minimum and ideally improve it.

T> [shields.io](http://shields.io/) lists a large amount of available badges.

T> There's a [Codecov extension](https://chrome.google.com/webstore/detail/codecov-extension/keefkhehidemnokodkdkejapdgfjmijf) for Chrome that allows you to see code coverage through GitHub user interface.

## Tweaking Module Resolution

Sometimes packages might not follow the standard rules and their *package.json* might have a faulty `main` field or it might be missing altogether. This is where setting up a `resolve.alias` can come in handy. Consider the example below:

```javascript
{
  resolve: {
    alias: {
      demo: path.resolve(__dirname, 'node_modules/demo/dist/demo.js')
    }
  }
}
```

The idea is that if webpack resolver matches `demo` in the beginning, it will resolve from the target. You can constrain the process to exact name by using a pattern like `demo$`.

T> The same technique works with loaders too. You can use `resolveLoader.alias` in the same way to alias a loader elsewhere. This can be particularly useful if you have to adapt a RequireJS project to work with webpack.

## Removing Unused Modules

Even though packages might work well out of the box, they might bring too much code to your project by default. [Moment.js](https://www.npmjs.com/package/moment) is a popular example. It brings locale data to your project by default. The simplest way to disable that behavior is to use `IgnorePlugin` to ignore locales like this:

```javascript
{
  plugins: [
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
  ]
}
```

T> You can use the same mechanism to work around problematic dependencies. Example: `new webpack.IgnorePlugin(/^(buffertools)$/)`.

To bring specific locales to your project, you should use `ContextReplacementPlugin`:

```javascript
{
  plugins: [
    new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /de|fi/)
  ]
}
```

T> There's a [Stack Overflow question](https://stackoverflow.com/questions/25384360/how-to-prevent-moment-js-from-loading-locales-with-webpack/25426019) that covers these ideas in greater detail.

## Conclusion

Webpack can consume most npm packages without a hitch. Sometimes, though, some patching might be required. Fortunately its resolution mechanism is patchable enough and you can modify the way it brings source to your project if needed.

In the next chapter we'll discuss how to author your own npm packages. It's the other side of the same coin and worth understanding if you won't end up authoring packages of your own.
