# Authoring Packages

Even though webpack is handy for bundling applications, it has its uses for package authors as well. It allows you to generate the distribution bundles required by npm. You can also generate the package site through webpack.

In this chapter, you learn basic ideas behind authoring npm packages and a couple of webpack specific techniques.

## Anatomy of an npm Package

Most of the available npm packages are small and include only a couple of files:

* *index.js* - On small projects, it's enough to have the code at the root. On larger ones, you likely want to start splitting it up further.
* *package.json* - npm metadata in JSON format
* *README.md* - README is the most important document of your project. It's written in Markdown format and provides an overview. For smallest projects, the full documentation can fit there. It's shown on the package page at *npmjs.com*.
* *LICENSE* - You can include licensing information within your project. You should refer to the license by name from *package.json* as otherwise, npm gives a warning. If you are using a custom license, you can link to it instead. In commercial projects, you should to set `"private": true` to avoid pushing your work to public inadvertently.

In larger projects, you often find the following:

* *CONTRIBUTING.md* - A guide for potential contributors describing how the code should be developed.
* *CHANGELOG.md* - This document describes major changes per version. If you do significant API changes, it can be a good idea to cover them here. It's possible to generate the file based on Git commit history, provided you write nice enough commits.
* *.travis.yml* - [Travis CI](https://travis-ci.org/) is a popular continuous integration platform that is free for open source projects. You can run the tests of your package over multiple systems using it.
* *.gitignore* - Ignore patterns for Git, i.e., which files shouldn't go under version control. You can ignore npm distribution files here, so they don't clutter your repository.
* *.npmignore* - Ignore patterns for npm describe which files shouldn't go to your distribution version. A good alternative is to use the [files](https://docs.npmjs.com/files/package.json#files) field at *package.json*. It allows you to maintain a whitelist of files to include into your distribution version.
* *.eslintignore* - Ignore patterns for ESLint. Again, tool specific.
* *.eslintrc* - Linting rules. You can use *.jshintrc* and such based on your preferences.
* *webpack.config.js* - If you are using a basic setup, you can have the configuration at project root.

Also, you likely have separate directories for the source, tests, demos, documentation, and so on.

T> If you want to decrease the size of your dependencies, consider using a tool like [package-config-checker](https://www.npmjs.com/package/package-config-checker). It can pinpoint packages not using the `files` field correctly. Once you know which ones haven't set it, you can consider making Pull Requests (PRs) to those projects.

## Understanding *package.json*

All packages come with a *package.json* that describes metadata related to them and includes information about the author, links, dependencies, and so on. The [official documentation](https://docs.npmjs.com/files/package.json) covers them in detail.

The example below contains an annotated a part of *package.json* from my [React component boilerplate](https://github.com/survivejs/react-component-boilerplate):

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

  /* `npm run <name>` - `npm run` to get the available commands */
  "scripts": {
    "start": "webpack-dev-server --env development",

    "test": "jest",
    "test:coverage": "jest --coverage",
    "test:watch": "jest --watch",

    "lint:js": "eslint . --ext .js --ext .jsx --ignore-path .gitignore --ignore-pattern dist --cache",

    "gh-pages": "webpack --env gh-pages",
    "gh-pages:deploy": "gh-pages -d gh-pages",
    "gh-pages:stats": "webpack --env gh-pages --json > stats.json",

    "dist:all": "npm run dist && npm run dist:min",
    "dist": "webpack --env dist",
    "dist:min": "webpack --env dist:min",
    "dist:modules": "rimraf ./dist-modules && babel ./src --out-dir ./dist-modules",

    "pretest": "npm run lint:js",
    "preversion": "npm run test && npm run dist:all && git commit --allow-empty -am \"Update dist\"",
    "prepublish": "npm run dist:modules",
    "postpublish": "npm run gh-pages && npm run gh-pages:deploy",

    /* If your library is installed through Git, transpile it */
    "postinstall": "node lib/post_install.js"
  },

  /* Entry point for terminal (i.e., <package name>). */
  /* Don't set this unless you intend to allow Command line usage */
  "bin": "bin/index.js",

  /* Entry point (defaults to index.js) */
  "main": "dist-modules/",

  /* ES6 module based entry point for tree shaking bundlers to pick up. */
  /* Apart from the module format, the code should use ES5 otherwise. */
  "module": "dist/",

  /* Files to include to npm distribution. */
  /* Note that relative patterns like "./src" fail! */
  "files": [
    "dist/"
  ],

  /* Package dependencies needed to use it. */
  /* Peer dependencies can work too, see below. */
  "dependencies": { ... },

  /* Package development dependencies needed to develop/compile it */
  "devDependencies": { ... },

  /* Package peer dependencies. The consumer fixes exact versions. */
  /* In npm3 these don't get installed automatically and it's */
  /* up to the user to define which versions to use. */
  /* If you want to include RC versions to the range, consider */
  /* using a pattern such as ^4.0.0-0 */
  "peerDependencies": {
    "lodash": ">= 3.5.0 < 4.0.0",
    "react": ">= 0.11.2 < 16.0.0"
  },

  /* Links to repository, homepage, and issue tracker */
  "repository": {
    "type": "git",
    "url": "https://github.com/survivejs/react-component-boilerplate.git"
  },
  "homepage": "https://survivejs.github.io/react-component-boilerplate/",
  "bugs": {
    "url": "https://github.com/survivejs/react-component-boilerplate/issues"
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

As you can see, *package.json* can contain a lot of information. You can attach non-npm specific metadata there that can be used by tooling. Given this can bloat *package.json*, it's preferable to keep metadata in files of their own.

T> JSON doesn't support comments even though I'm using them above. There are extended notations, such as [Hjson](http://hjson.org/), that do.

## npm Workflow

To get started, you have to use [npm adduser](https://docs.npmjs.com/cli/adduser). It allows you to set up an account. After this process has completed, it creates a *~/.npmrc* file and use that data for authentication. There's also [npm logout](https://docs.npmjs.com/cli/logout) that clears the credentials.

T> When creating a project, `npm init` respects the values set at *~/.npmrc*. Hence, it's worth your while to set reasonable defaults there to save time. If you want to limit your package to a particular scope, use `npm init --scope=<scope>`. As a result, you get `@<scope>/<package>` which is handy especially for personal packages since the default namespace of npm is so crowded.

### Publishing a Package

Provided you have logged in, creating new packages is only `npm publish` away. Given that the package name is still available and everything goes fine, you should have something out there! After this, you can install your package through `npm install` or `npm i`.

Instead of referring to a package by a name, it can be consumed by pointing to it directly in *package.json*. In that case, you can do `"depName": "<github user>/<project>#<reference>"` where `<reference>` can be either commit hash, tag, or branch. You can point to specific pull requests through `<github user>/<project>#pull/<id>/head`.

T> If you want to see what files are published to npm, consider using [npm pack](https://docs.npmjs.com/cli/pack) generates a tarball you can examine. [irish-pub](https://www.npmjs.com/package/irish-pub) is another option, and it gives you a listing to review. You can also use [publish-diff](https://www.npmjs.com/package/publish-diff) to get a better of the changes that are going to be published.

T> [np](https://www.npmjs.com/package/np) gives an interactive UI for publishing packages. [semantic-release](https://www.npmjs.com/package/semantic-release) takes the idea one step further and automates the entire process.

### What Files to Publish to npm?

Even though a project can contain a lot of files, not all of them should be published. Besides wasting bandwidth, this can leak personal files to a public registry and is the reason why it's a good idea to maintain a [files](https://docs.npmjs.com/files/package.json#files) array at *package.json* and enumerate which files and directories you want to publish.

You can't find an official recommendation on what files to publish. That said, there are points to consider as [discussed in Stack Overflow](https://stackoverflow.com/questions/25124844/should-i-npmignore-my-tests).

At a minimum, you should distribute the source code needed to run the package. If you have code written using the ES6 standard, you should transpile the code so that it does not lose the ES6 module definitions while everything else is converted to ES5. For the tooling to pick it up, you should point to this version of code through *package.json* `module` field. See the *Loading JavaScript* chapter for the Babel setup.

You should point package `main` to a fully compiled version that's compatible with Node.

In addition to the source, you can consider distributing package *README.md* and *LICENSE*. Any metadata that's required by third-party systems, like Travis, can be safely skipped. Full documentation of the package doesn't have to be included as you can point to the package homepage through its metadata instead.

W> Even though it's possible to tell npm what to exclude from `files` through `!src/*.test.js` kind of definitions, [using negation patterns is not recommended](https://github.com/npm/npm/wiki/Files-and-Ignores#details). Instead, you should use *.npmignore* and include `src/*.test.js` kind of pattern there.

### Bumping a Version

To bump your package version, you need to invoke one of these commands:

* `npm version <x.y.z>` - Define version yourself.
* `npm version <major|minor|patch>` - Let npm bump the version for you based on SemVer.
* `npm version <premajor|preminor|prepatch|prerelease>` - Same as previous expect this time it generates `-<prerelease number>` suffix. Example: `v2.1.2-2`.

Invoking any of these updates *package.json* and creates a version commit to git automatically. If you execute `npm publish` after doing this, you should have something new out there.

Note that in the example above, `version`-related hooks have been set to make sure a version contains a fresh version of a distribution build. Tests are run to catch potential issues early on.

T> Consider using [semantic-release](https://www.npmjs.com/package/semantic-release) if you prefer a more structured approach. It can take pain out of the release process while automating a part of it. For instance, it can detect possible breaking changes and generate change logs.

T> [dont-break](https://www.npmjs.com/package/dont-break) allows you to run the unit tests of dependent projects against your current code to see if it breaks anything. Sometimes it's possible to overlook a use case that is not a part of the public API even and break a dependency. *dont-break* helps with that particular problem.

### Respect the SemVer

When publishing new versions, it's important to respect the SemVer. Roughly, it states that you should not break backward compatibility, given certain rules are met. The exact rules were covered in the previous chapter.

To make it easier to comply with SemVer, [next-ver](https://www.npmjs.com/package/next-ver) can compute the next version you should use and update it for you. [commitizen](https://www.npmjs.com/package/commitizen) goes further and allows change log generation and automated releases.

Both these tools rely on commit message annotations. On small projects, you can have `fix` or `feat` prefix at your commit titles (e.g., `fix - Allow doodad to work with zero`). You can also communicate the context using `chore(docs)` kind of style to document which part of the project was touched.

This metadata lets the tooling to figure out the types of the changes you made. It can help even with change log generation and allow automated releases over manual ones. Annotating your commits well is a good practice in any case as it makes it easier to debug your code later.

T> The *Consuming Packages* explains the idea of SemVer in detail.

### Publishing a Pre-Release Version

Sometimes, you want to publish something preliminary for other people to test. You can do this by tagging your release as a pre-release version. For example, a package can have versions like this:

* v0.5.0-alpha1
* v0.5.0-beta1
* v0.5.0-beta2
* v0.5.0-rc1
* v0.5.0-rc2
* v0.5.0

The initial alpha release allows the users to try out the upcoming functionality and provide feedback. The beta releases can be considered more stable.

The release candidates (RC) are close to an actual release and don't introduce any new functionality. They are all about refining the release till it's suitable for general consumption.

The workflow in this case goes like this:

1. `npm version 0.5.0-alpha1` - Update *package.json* as discussed earlier.
2. `npm publish --tag alpha` - Publish the package under *alpha* tag.

To consume the test version, your users have to use `npm install <your package name>@alpha`.

T> [npm link](https://docs.npmjs.com/cli/link) allows you to link a package as a globally available symbolic link within your system. Node resolves to the linked version unless local `node_modules` happens to contain a version. If you want to remove the link, you should use `npm unlink` or `npm unlink <package>`.

### On Naming Packages

Before starting to develop, it can be a good idea to spend time on figuring out a good name for your package. It's not fun to write an excellent package only to notice the name has been taken. A good name is possible to find through a search engine, and most importantly, is available at npm.

As of npm 2.7.0, it's possible to create [scoped packages](https://docs.npmjs.com/getting-started/scoped-packages). They follow format `@username/project-name`. Simply follow that when naming your project.

T> If you find a good name that appears to be abandoned, contact npm. They can give it to you.

## npm Lifecycle Hooks

npm provides a collection of lifecycle hooks. Suppose you are authoring a React component using Babel. In that case, you should generate an ES5 compatible version of the package for npm consumers and point to it through *package.json* `main`. You can achieve this using **babel** command line tool:

```bash
babel ./lib --out-dir ./dist-modules
```

The command walks through the `./lib` directory and writes a processed file to `./dist-modules` for each module it encounters.

Since running that command each time you publish is tedious, you can set up a `prepublish` hook like this:

```json
{
  ...
  "scripts": {
    ...
    "prepublish": "babel ./lib --out-dir ./dist-modules"
  },
  ...
  "main": "dist-modules/",
  ...
}
```

Make sure you execute `npm install babel-cli --save-dev` to include the tool into your project.

To avoid versioning the directory and to keep your `git status` clean, consider this sort of `.gitignore`:

```bash
dist-modules/
...
```

Besides `prepublish`, npm provides a set of other hooks. The naming is always the same and follows the pattern `pre<hook>`, `<hook>`, `post<hook>` where `<hook>` can be `publish`, `install`, `test`, `stop`, `start`, `restart`, or `version`. Even though npm triggers scripts bound to these automatically, you can trigger them explicitly through `npm run` for testing (i.e., `npm run prepublish`).

The [the official documentation](https://docs.npmjs.com/misc/scripts) covers a lot of smaller tips related to these hooks. However, often all you need is a `prepublish` script for build automation.

### Working Around `prepublish` in npm 3

It's important to note that in npm 3 `prepublish` hook gets also triggered when you run `npm install` on the project locally. Sometimes this can be surprising and counter-productive even.

[in-publish](https://www.npmjs.com/package/in-publish) allows you to tune the behavior and skip the installation step. You need to prepend your script with `in-publish && babel ...` kind of line for this to work. npm 4 and the following versions fix this confusing behavior.

## Sharing Authorship

As packages evolve, you likely want to start developing with others. You could become the new maintainer of a project, or pass the torch to someone else. These things happen as packages evolve.

npm provides certain commands for these purposes. It's all behind `npm owner` namespace. More specifically, there are `npm owner ls <package name>`, `npm owner add <user> <package name>` and `npm owner rm <user> <package name>`. That's about it.

See [npm documentation](https://docs.npmjs.com/cli/owner) for the most up to date information about the topic.

## Package Authoring Techniques

A couple of certain package authoring-related techniques are good to know. For example, to make it easier to consume your packages, you can generate a Node friendly versions. This technique can be improved further by setting up a specific script.

### Avoiding Bundling Dependencies

Since it's not a good idea to bundle your package dependencies, such as React, within the distribution bundle itself, you should let the user inject them. You can configure external dependencies using the `externals` configuration. You can control it like this:

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
    root: ['_', 'merge'],
  },
  // Adapt React to different environments.
  'react': {
    commonjs: 'react',
    commonjs2: 'react',
    amd: 'React',
    root: 'React',
  },
  'jquery': 'jquery',
},
```

If you want to include all modules in *node_modules* by default, it's possible to use [webpack-node-externals](https://www.npmjs.com/package/webpack-node-externals) instead. In this case would end up with `externals: [nodeExternals()]` kind of declaration.

T> Given bundling is still be required sometimes, consider using the [bundledDependencies](https://docs.npmjs.com/files/package.json#bundleddependencies) field for sharing third-party files not available through npm. There's a great [Stack Overflow answer](http://stackoverflow.com/a/25044361/228885) discussing the topic further.

### Processing Node Version through Babel

If you are processing your code through Babel, you can skip webpack. The advantage of doing this is that it gives you separate modules that are easier to consume one by one if needed.

In this case, a setup like this works:

**package.json**

```json
{
  ..
  /* `npm run <name>` */
  "scripts": {
    ...
    "dist": "webpack --env dist",
    "dist:min": "webpack --env dist:min",

    /* Process source through Babel! */
    "dist:modules": "babel ./src --out-dir ./dist-modules",

    ...

    "preversion": "npm run test && npm run dist:all && git commit --allow-empty -am \"Update dist\"",
    "prepublish": "npm run dist:modules",
    ...
  },
  /* Point to the Node specific version */
  "main": "dist-modules",
  ...
}
```

What if someone points to a development version of your package directly through GitHub, though? It doesn't work as the `dist-modules` directory is missing. The problem can be fixed using a hook that generates the needed source.

### Generating a Distribution for Development Usage

To solve the development distribution problem, a custom script is required. First, connect the hook with a custom script:

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

Secondly, define a script like this:

**lib/post_install.js**

```javascript
/* eslint-disable */
// adapted based on rackt/history (MIT)
// Node 4+
const execSync = require('child_process').execSync;
const fs = require('fs');

// This could be read from package.json
const distDirectory = 'dist-modules';

fs.stat(distDirectory, function(error, stat) {
  // Skip building on Travis
  if (process.env.TRAVIS) {
    return;
  }

  if (error || !stat.isDirectory()) {
    // Create a directory to avoid getting stuck
    // in postinstall loop
    fs.mkdirSync(distDirectory);
    exec('npm install --only=dev');
    exec('npm run build');
  }
});

function exec(command) {
  execSync(command, {
    // Print stdin/stdout/stderr
    stdio: 'inherit'
  });
}
```

The script needs tweaking to fit your purposes. But it's enough to give you a rough idea. If the `dist-modules` directory is missing, you generate it here.

For the build script to work, you have to remember to include the source of the package to the distribution version and to tweak *package.json* `files` field accordingly.

W> Relying on `postinstall` scripts can be [potentially dangerous](http://blog.npmjs.org/post/141702881055/package-install-scripts-vulnerability). Security-minded developers want to use `npm install --ignore-scripts`. You can set that default through `npm config set ignore-scripts true` if you want. Being cautious does not hurt.

### Deprecating, Unpublishing, and Renaming Packages

It's possible that your package reaches the end of its life. Another package could replace it, or it can become obsolete. For this purpose, npm provides [npm deprecate](https://docs.npmjs.com/cli/deprecate) command. You can state `npm deprecate foo@"< 0.4.0" "Use bar package instead"`.

You can deprecate a range like this or a whole package by skipping the range. Given mistakes happen, you can undeprecate a package by providing an empty message.

Deprecation can be handy if you have to rename a package. You can publish the package under a new name and let the users know of the new name in your deprecation message.

There is a heavier duty option in the form of [npm unpublish](https://docs.npmjs.com/cli/unpublish). Using `npm unpublish` you can pull a package out of the registry. Given this can be potentially dangerous and break the code for a lot of people, it has been [restricted to versions that are less than 24 hours old](http://blog.npmjs.org/post/141905368000/changes-to-npms-unpublish-policy). Most likely you don't need the feature at all, but it's nice to know it exists.

## Conclusion

You should now have a basic idea of how to author npm packages. Webpack can help you a lot here.

To recap:

* It's good to understand what kind of metadata packages contains. They give you insight on their licensing, guidelines, and even quality.
* When publishing packages to npm, remember to respect the SemVer or an equivalent scheme to keep your consumers happy.
* Document the main changes made to your packages using a change log. Documentation comes in handy later as you have to understand when a specific feature was introduced. It also makes it easier to upgrade projects to the most recent features.
* Consider publishing differently packaged versions of the source to account for different usage patterns. Packaged right, your consumers can benefit from features, such as **tree shaking**.
* To make it possible to consume a work in progress package, implement an npm `postinstall` script that builds the project if a distribution version does not exist in the source.
* If a package becomes obsolete, consider deprecating it and let your users know how to upgrade to another solution.

The covered options are valuable beyond package authoring. Mainly `externals` comes in handy when you want to exclude certain dependencies outside of your bundles and load them using another way.
