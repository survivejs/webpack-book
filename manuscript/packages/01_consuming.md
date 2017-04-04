# Consuming Packages

Consuming npm packages through webpack is often convenient but there are certain special considerations to take into account. Sometimes the packages don't play with you nicely, or they can require special tweaking to work properly. At the core of this is the concept of SemVer.

## Understanding SemVer

Most popular packages out there comply with SemVer. It's problematic as sometimes packages inadvertently break it, but there are ways around this. Roughly, SemVer states that you should not break backward compatibility, given [certain rules](http://semver.org/) are met:

1. The MAJOR version increments when incompatible API changes are made.
2. The MINOR version increments when backwards-compatible features are added.
3. The PATCH version increments when backwards-compatible bugs are fixed.

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

## Consumption Workflow

Often npm consumption workflow resolves around two commands:

* `npm install <package> --save` or `npm i <package> -S`.
* `npm install <package> --save-dev` or `npm i <package> -D`

To install a specific version, you should pass it through `@<version>`. npm will set the version prefix based on *~/.npmrc*. The related ranges are discussed later in this chapter.

You can refer to a package by its name and version but that is not the only way. Consider the following alternatives:

* `<git repository>#<reference>` points to a Git repository and a Git reference.
* `<github user>/<project>#<reference>` shortcut points to GitHub in a similar manner.
* `<github user>/<project>#pull/<id>/head` points to a specific GitHub pull request.

`<reference>` can be either commit hash, tag, or a branch. The technique does not work unless the package has been set up to support consumption outside of Git. The *Package Authoring Techniques* chapter shows how to achieve this.

T> To avoid sharing all your packages in public, npm allows you to maintain private packages through their commercial offering. Another option is to use a package like [verdaccio](https://www.npmjs.com/package/verdaccio). verdaccio allows you to maintain a private server that can also work as a cache for npm. You can also override public packages using it.

## Understanding npm Lookup

npm's lookup algorithm is another aspect that's good to understand. Sometimes this can explain certain errors, and it also leads to good practices, such as preferring local dependencies over global ones. The basic algorithm goes as below:

1. Look into immediate packages. If there is *node_modules*, crawl through that and also check the parent directories until the project root is reached. You can check that using `npm root`.
2. If nothing was found, check globally installed packages. If you are using Unix, look into */usr/local/lib/node_modules* to find them. You can figure out the specific directory using `npm root -g`.
3. If the global lookup fails, it fails hard. You should get an error now.

{pagebreak}

On a package level, npm resolves to a file through the following process:

1. Look up *package.json* of the package.
2. Get the contents of the `main` field. If it doesn't exist, default to *<package>/index.js*.
3. Resolve to the `main` file.

The general lookup algorithm respects an environment variable `NODE_PATH`. If you are using Unix, you can patch it through `NODE_PATH=$NODE_PATH:./demo`. The call can be included at the beginning of a *package.json* scripts to tweak `NODE_PATH` temporarily.

You can tweak webpack's module resolution through the `resolve.modules` field:

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

Compared to npm environment, webpack provides more flexibility, although you can mimic a lot of webpack's functionality using terminal based tricks.

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

## Conclusion

To consume npm packages, you should be aware of SemVer and its implications. Lock down your dependencies to avoid surprises. Use services to track changes.

To recap:

* npm packages can be grouped based on their purpose. Often you split them between `dependencies` and `devDependencies`. `peerDependencies` allow you to control the exact version on the consumer side.
* To consume packages effectively, you should understand SemVer. To keep your build repeatable, use shrinkwrapping or Yarn lockfiles.
* To understand your dependencies better, use available tooling and service to study them.

In the next chapter, you'll learn about consuming specific techniques.
