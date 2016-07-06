# Authoring Packages

Even though Webpack is useful for bundling applications, it has its uses for package authors as well. You can use it to output your bundle in the [UMD format](https://github.com/umdjs/umd). It is a format that's compatible with various environments (CommonJS, AMD, globals).

As Webpack alone isn't enough, I'll provide a short overview of the npm side of things before discussing specific techniques.

## Anatomy of a npm Package

Most of the available npm packages are small and include just a select few files:

* *index.js* - On small projects it's enough to have the code at the root. On larger ones you may want to start splitting it up further.
* *package.json* - npm metadata in JSON format
* *README.md* - README is the most important document of your project. It is written in Markdown format and provides an overview. For simple projects the whole documentation can fit there. It will be shown at the package page at *npmjs.com*.
* *LICENSE* - You should include licensing information within your project. You can refer to it from *package.json*.

In larger projects, you may find the following:

* *CONTRIBUTING.md* - A guide for potential contributors. How should the code be developed and so on.
* *CHANGELOG.md* - This document describes major changes per version. If you do major API changes, it can be a good idea to cover them here. It is possible to generate the file based on Git commit history, provided you write nice enough commits.
* *.travis.yml* - [Travis CI](https://travis-ci.org/) is a popular continuous integration platform that is free for open source projects. You can run the tests of your package over multiple systems using it. There are other alternatives of course, but Travis is very popular.
* *.gitignore* - Ignore patterns for Git, i.e., which files shouldn't go under version control. It can be useful to ignore npm distribution files here so they don't clutter your repository.
* *.npmignore* - Ignore patterns for npm. This describes which files shouldn't go to your distribution version. A good alternative is to use the [files](https://docs.npmjs.com/files/package.json#files) field at *package.json*. It allows you to maintain a whitelist of files to include into your distribution version.
* *.eslintignore* - Ignore patterns for ESLint. Again, tool specific.
* *.eslintrc* - Linting rules. You can use *.jshintrc* and such based on your preferences.
* *webpack.config.js* - If you are using a simple setup, you might as well have the configuration at project root.

In addition, you'll likely have various directories for source, tests, demos, documentation, and so on.

T> If you want to decrease the size of your dependencies, consider using a tool like [package-config-checker](https://www.npmjs.com/package/package-config-checker). It can pinpoint packages not using the `files` field correctly. Once you know which ones haven't set it, you can consider making Pull Requests (PRs) to those projects.

## Understanding *package.json*

All packages come with a *package.json* that describes metadata related to them. This includes information about the author, various links, dependencies, and so on. The [official documentation](https://docs.npmjs.com/files/package.json) covers them in detail.

I've annotated a part of *package.json* of my [React component boilerplate](https://github.com/survivejs/react-component-boilerplate) below:

```json
{
  /* Name of the project */
  "name": "react-component-boilerplate",
  /* Brief description */
  "description": "Boilerplate for React.js components",
  /* Who is the author + optional email + optional site */
  "author": "Juho Vepsäläinen <email goes here> (site goes here)",
  /* Version of the package */
  "version": "0.0.0",
  /* `npm run <name>` */
  "scripts": {
    "start": "webpack-dev-server",

    "test": "karma start",
    "test:tdd": "npm run test -- --auto-watch --no-single-run",
    "test:lint": "eslint . --ext .js --ext .jsx --cache",

    "gh-pages": "webpack",
    "gh-pages:deploy": "gh-pages -d gh-pages",
    "gh-pages:stats": "webpack --profile --json > stats.json",

    "dist": "webpack",
    "dist:min": "webpack",
    "dist:modules": "rm -rf ./dist-modules && babel ./src --out-dir ./dist-modules",

    "pretest": "npm run test:lint",
    "preversion": "npm run test && npm run dist && npm run dist:min && git commit --allow-empty -am \"Update dist\"",
    "prepublish": "npm run dist:modules",
    "postpublish": "npm run gh-pages && npm run gh-pages:deploy",
    /* If your library is installed through Git, you may want to transpile it */
    "postinstall": "node lib/post_install.js"
  },
  /* Entry point for terminal (i.e., <package name>) */
  /* Don't set this unless you intend to allow CLI usage */
  "bin": "./index.js",
  /* Entry point (defaults to index.js) */
  "main": "dist-modules",
  /* Package dependencies */
  "dependencies": {},
  /* Package development dependencies */
  "devDependencies": {
    "babel": "^6.3.17",
    ...
    "webpack": "^1.12.2",
    "webpack-dev-server": "^1.12.0",
    "webpack-merge": "^0.7.0"
  },
  /* Package peer dependencies. The consumer will fix exact versions. */
  /* In npm3 these won't get installed automatically and it's up to the */
  /* user to define which versions to use. */
  /* If you want to include RC versions to the range, consider using */
  /* a pattern such as ^4.0.0-0 */
  "peerDependencies": {
    "lodash": ">= 3.5.0 < 4.0.0",
    "react": ">= 0.11.2 < 16.0.0"
  }
  /* Links to repository, homepage, and issue tracker */
  "repository": {
    "type": "git",
    "url": "https://github.com/bebraw/react-component-boilerplate.git"
  },
  "homepage": "https://bebraw.github.io/react-component-boilerplate/",
  "bugs": {
    "url": "https://github.com/bebraw/react-component-boilerplate/issues"
  },
  /* Keywords related to package. */
  /* Fill this well to make the package findable. */
  "keywords": [
    "react",
    "reactjs",
    "boilerplate"
  ],
  /* Which license to use */
  "license": "MIT"
}
```

As you can see, *package.json* can contain a lot of information. You can attach non-npm specific metadata there that can be used by tooling. Given this can bloat *package.json*, it may be preferable to keep metadata at files of their own.

T> JSON doesn't support comments even though I'm using them above. There are extended notations, such as [Hjson](http://hjson.org/), that do.

## npm Workflow

Working with npm is surprisingly simple. To get started, you will need to use [npm adduser](https://docs.npmjs.com/cli/adduser) (aliased to `npm login`). It allows you to set up an account. After this process has completed, it will create *~/.npmrc* and use that data for authentication. There's also [npm logout](https://docs.npmjs.com/cli/logout) that will clear the credentials.

T> When creating a project, `npm init` respects the values set at *~/.npmrc*. Hence it may be worth your while to set reasonable defaults there to save some time.

### Publishing a Package

Provided you have logged in, creating new packages is just a matter of executing `npm publish`. Given that the package name is still available and everything goes fine, you should have something out there! After this, you can install your package through `npm install` or `npm i`.

An alternative way to consume a library is to point at it directly in *package.json*. In that case, you can do `"depName": "<github user>/<project>#<reference>"` where `<reference>` can be either commit hash, tag, or branch. This can be useful, especially if you need to hack around something and cannot wait for a fix.

T> If you want to see what files will be published to npm, consider using a tool known as [irish-pub](https://www.npmjs.com/package/irish-pub). It will give you a listing to review.

### Bumping a Version

In order to bump your package version, you'll just need to invoke one of these commands:

* `npm version <x.y.z>` - Define version yourself.
* `npm version <major|minor|patch>` - Let npm bump the version for you based on SemVer.
* `npm version <premajor|preminor|prepatch|prerelease>` - Same as previous expect this time it will generate `-<prerelease number>` suffix. Example: `v2.1.2-2`.

Invoking any of these will update *package.json* and create a version commit to git automatically. If you execute `npm publish` after doing this, you should have something new out there.

Note that in the example above I've set up `version` related hooks to make sure a version will contain a fresh version of a distribution build. I also run tests just in case. It's better to catch potential issues early on after all.

T> Consider using [semantic-release](https://www.npmjs.com/package/semantic-release) if you prefer more structured approach. It can take some pain out of the release process while automating a part of it. For instance, it is able to detect possible breaking changes and generate changelogs.

### Respect the SemVer

Even though it is simple to publish new versions out there, it is important to respect the SemVer. Roughly, it states that you should not break backwards compatibility, given certain rules are met. For example, if your current version is `0.1.4` and you do a breaking change, you should bump to `0.2.0` and document the changes. You can understand SemVer much better by studying [the online tool](http://semver.npmjs.com/) and how it behaves.

### Publishing a Prerelease Version

Sometimes, you might want to publish something preliminary for other people to test. There are certain conventions for this. You rarely see *alpha* releases at npm. *beta* and *rc (release candidate) are common, though. For example, a package might have versions like this:

* v0.5.0-alpha1
* v0.5.0-beta1
* v0.5.0-beta2
* v0.5.0-rc1
* v0.5.0-rc2
* v0.5.0

The initial alpha release will allow the users to try out the upcoming functionality and provide feedback. The beta releases can be considered more stable. The release candidates (rc) are close to an actual release and won't introduce any new functionality. They are all about refining the release till it's suitable for general consumption.

The workflow in this case is straight-forward:

1. `npm version 0.5.0-alpha1` - Update *package.json* as discussed earlier.
2. `npm publish --tag alpha1` - Publish the package under *alpha1* tag.

In order to consume the test version, your users will have to use `npm i <your package name>@alpha1`.

T> It can be useful to utilize `npm link` during development. That will allow you to use a development version of your library from some other context. Node.js will resolve to the linked version unless local `node_modules` happens to contain a version. If you want to remove the link, use `npm unlink`.

### On Naming Packages

Before starting to develop, it can be a good idea to spend a little bit of time on figuring out a good name for your package. It's not very fun to write a great package just to notice the name has been taken. A good name is easy to find through a search engine, and most importantly, is available at npm.

As of npm 2.7.0 it is possible to create [scoped packages](https://docs.npmjs.com/getting-started/scoped-packages). They follow format `@username/project-name`. Simply follow that when naming your project.

### Version Ranges

npm supports multiple version ranges. I've listed the common ones below:

* `~` - Tilde matches only patch versions. For example, `~1.2` would be equal to `1.2.x`.
* `^` - Caret is the default you get using `--save` or `--save-dev`. It matches to It matches minor versions. This means `^0.2.0` would be equal to `0.2.x`.
* `*` - Asterisk matches major releases. This is the most dangerous of the ranges. Using this recklessly can easily break your project in the future and I would advise against using it.
* `>= 1.3.0 < 2.0.0` - Range between versions. This can be particularly useful if you are using `peerDependencies`.

You can set the default range using `npm config set save-prefix='^'` in case you prefer something else than caret. Alternatively you can modify *~/.npmrc* directly. Especially defaulting to tilde can be a good idea that can help you to avoid some trouble with dependencies.

T> Sometimes, using version ranges can feel a little dangerous. What if some future version is broken? [npm shrinkwrap](https://docs.npmjs.com/cli/shrinkwrap) allows you to fix your dependency versions and have stricter control over the versions you are using in a production environment. [lockdown](https://www.npmjs.com/package/lockdown) goes further and gives guarantees about dependency content, not just version.

T> If you want to bundle some dependencies with your distribution version, consider using the [bundledDependencies](https://docs.npmjs.com/files/package.json#bundleddependencies) (or just `bundleDependencies`) field. This can be useful if you want to share third party files not available through npm. There's a great [Stack Overflow answer](http://stackoverflow.com/a/25044361/228885) discussing the topic further.

## npm Lifecycle Hooks

npm provides various lifecycle hooks that can be useful. Suppose you are authoring a React component using Babel and some of its goodies. You could let the *package.json* `main` field point at the UMD version as generated above. This won't be ideal for those consuming the library through npm, though.

It is better to generate a ES5 compatible version of the package for npm consumers. This can be achieved using **babel** CLI tool:

```bash
babel ./lib --out-dir ./dist-modules
```

This will walk through the `./lib` directory and output a processed file for each library it encounters to `./dist-modules`.

Since we want to avoid having to run the command directly whenever we publish a new version, we can connect it to `prepublish` hook like this:

```json
"scripts": {
  ...
  "prepublish": "babel ./lib --out-dir ./dist-modules"
}
```

Make sure you execute `npm i babel --save-dev` to include the tool into your project.

You probably don't want the directory content to end up in your Git repository. In order to avoid this and to keep your `git status` clean, consider this sort of `.gitignore`:

```bash
dist-modules/
...
```

Besides `prepublish`, npm provides a set of other hooks. The naming is always the same and follows the pattern `pre<hook>`, `<hook>`, `post<hook>` where `<hook>` can be `publish`, `install`, `test`, `stop`, `start`, `restart`, or `version`. Even though npm will trigger scripts bound to these automatically, you can trigger them explicitly through `npm run` for testing (i.e., `npm run prepublish`).

There are plenty of smaller tricks to learn for advanced usage. Those are better covered by [the official documentation](https://docs.npmjs.com/misc/scripts). Often all you need is just a `prepublish` script for build automation.

## Keeping Dependencies Up to Date

An important part of maintaining npm packages is keeping their dependencies up to date. How to do this depends a lot on the maturity of your package. Ideally, you have a nice set of tests covering the functionality. If not, things can get a little hairier. There are a few ways to approach dependency updates:

* You can update all dependencies at once and hope for the best. Tools, such as [npm-check-updates](https://www.npmjs.com/package/npm-check-updates) or [npm-check](https://www.npmjs.com/package/npm-check), can do this for you.
* Install the newest version of some specific dependency, e.g., `npm i lodash@* --save`. This is a more controlled way to approach the problem.
* Patch version information by hand by modifying *package.json* directly.

It is important to remember that your dependencies may introduce backwards incompatible changes. It can be useful to remember how SemVer works and study dependency release notes. They might not always exist, so you may have to go through the project commit history. There are a few services that can help you to keep track of your project dependencies:

* [David](https://david-dm.org/)
* [versioneye](https://www.versioneye.com/)
* [Gemnasium](https://gemnasium.com)

These services provide badges you can integrate into your project *README.md* and they may email you about important changes. They can also point out possible security issues that have been fixed.

For testing your projects you can consider solutions, such as [Travis CI](https://travis-ci.org/) or [SauceLabs](https://saucelabs.com/). [Coveralls](https://coveralls.io/) gives you code coverage information and a badge to include in your README.

The services are valuable as they allow you to test your updates against a variety of platforms quickly. Something that might work on your system might not work in some specific configuration. You'll want to know about that as fast as possible to avoid introducing problems.

T> [shields.io](http://shields.io/) lists a large amount of available badges.

## Sharing Authorship

As packages evolve, you may want to start developing with others. You could become the new maintainer of some project, or pass the torch to someone else. These things happen as packages evolve.

npm provides a few commands for these purposes. It's all behind `npm owner` namespace. More specifically, you'll find `ls <package name>`, `add <user> <package name>` and `rm <user> <package name>` there (i.e., `npm owner ls`). That's about it.

See [npm documentation](https://docs.npmjs.com/cli/owner) for the most up to date information about the topic.

## Package Authoring Techniques

There are a couple of package authoring related techniques that are good to know. You can set up Webpack to generate a UMD build. You can also exclude certain dependencies out of your bundle. To make it easier to consume your packages, you can also generate a Node.js friendly versions. This technique can be improved further by setting up a script to generate a Node.js friendly version.

### Setting Up UMD

Allowing Webpack to output your bundle in the UMD format is simple. Webpack allows you to control the output format using [output.libraryTarget](https://webpack.github.io/docs/configuration.html#output-librarytarget) field. It defaults to `var`. This means it will set your bundle to a variable defined using the `output.library` field.

There are other options too, but the one we are interested in is `output.libraryTarget: 'umd'`. Consider the example below:

**webpack.config.js**

```javascript
output: {
  path: PATHS.dist,
  libraryTarget: 'umd', // !!
  // Name of the generated global.
  library: 'MyLibrary',
  // Optional name for the generated AMD module.
  umdNamedDefine: 'my_library'
}
```

### Avoiding Bundling Dependencies

Given it's not a good idea to bundle your package dependencies, such as React, within the distribution bundle itself, you should let the user inject them. You can configure external dependencies using the `externals` configuration. You can control it like this:

**webpack.config.js**

```javascript
externals: {
  // Adapt `import merge from 'lodash/merge';` to different environments.
  'lodash/merge': {
    commonjs: 'lodash/merge',
    commonjs2: 'lodash/merge',
    // Look up lodash.merge below ['lodash', 'merge'] for AMD.
    amd:  ['lodash', 'merge'],
    // Look up lodash.merge through `_.merge` in global environment.
    root: ['_', 'merge']
  },
  // Adapt React to different environments.
  'react': {
    commonjs: 'react',
    commonjs2: 'react',
    amd: 'React',
    root: 'React'
  }
},
```

These two fields help you a lot as a package author but there's more to it.

T> If you want to include all modules in *node_modules* by default, it could be interesting to use [webpack-node-externals](https://www.npmjs.com/package/webpack-node-externals) instead. Then you would end up with `externals: [nodeExternals()]` kind of declaration. If you don't need to adapt to different environments, this could be a neat way to go.

### Processing Node.js Version through Babel

If you are processing your code through Babel, I suggest you process the Node.js version of the package directly through Babel and skip Webpack. The advantage of doing this is that it gives you separate modules that are easier to consume one by one if needed. This avoids having to go through a heavy bundle. In this case you'll likely want a setup like this:

**package.json**

```json
{
  ..
  /* `npm run <name>` */
  "scripts": {
    ...
    "dist": "webpack",
    "dist:min": "webpack",

    /* Process source through Babel! */
    "dist:modules": "babel ./src --out-dir ./dist-modules",

    ...

    "preversion": "npm run test && npm run dist && npm run dist:min && git commit --allow-empty -am \"Update dist\"",
    "prepublish": "npm run dist:modules",
    ...
  },
  /* Point to the Node.js specific version */
  "main": "dist-modules",
  ...
}
```

There is one problem, though. What if someone points to a development version of your package directly through GitHub? It simply won't work as the `dist-modules` directory will be missing. This can be fixed using a hook that will generate the needed source.

### Generating a Distribution for Development Usage

To solve the development distribution problem, we need to hook up a custom script the right way. First, we need to connect the hook with a custom script:

**package.json**

```json
{
  ...
  "scripts": {
    ...
    /* Point to the script that generates the missing source. */
    "postinstall": "node lib/post_install.js"
  },
  ...
}
```

Secondly we'll need the script itself:

**lib/post_install.js**

```javascript
#!/usr/bin/env node
// adapted based on rackt/history (MIT)
const spawn = require('child_process').spawn;
const stat = require('fs').stat;

stat('dist-modules', function(error, stat) {
  if (error || !stat.isDirectory()) {
    spawn(
      'npm',
      [
        'i',
        'babel-cli',
        'babel-preset-es2015',
        'babel-preset-react'
      ],
      {
        stdio: [0, 1, 2]
      }
    ).on('close', function(exitCode) {
      spawn('npm', ['run', 'dist-modules'], { stdio: [0, 1, 2] });
    });
  }
});
```

The script may need tweaking to fit your purposes. But it's enough to give you a rough idea. If the `dist_modules` directory is missing, we'll generate it here. That's it.

W> Relying on `postinstall` scripts can be [potentially dangerous](http://blog.npmjs.org/post/141702881055/package-install-scripts-vulnerability). Security minded developers may want to use `npm install --ignore-scripts`. You can set that default through `npm config set ignore-scripts true` if you want. Being a little cautious might not hurt.

## Conclusion

You should now have a basic idea of how to author npm packages. Webpack can help you a lot here. Just picking up `output.libraryTarget` and `externals` help you a lot. These options are useful beyond package authoring. Particularly `externals` comes in handy when you want to exclude certain dependencies outside of your bundles and load them using some other way.
