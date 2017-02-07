# Authoring Packages

Even though webpack is useful for bundling applications, it has its uses for package authors as well. You can use it to generate a website for your package and maintain the distribution files using it. It supports the [UMD format](https://github.com/umdjs/umd). UMD is compatible with various environments (CommonJS, AMD, globals) making it good for distribution purposes.

## Anatomy of an npm Package

Most of the available npm packages are small and include just a select few files:

* *index.js* - On small projects, it's enough to have the code at the root. On larger ones, you may want to start splitting it up further.
* *package.json* - npm metadata in JSON format
* *README.md* - README is the most important document of your project. It is written in Markdown format and provides an overview. For simple projects the whole documentation can fit there. It will be shown at the package page at *npmjs.com*.
* *LICENSE* - You should include licensing information within your project. You can refer to it from *package.json*.

In larger projects, you may find the following:

* *CONTRIBUTING.md* - A guide for potential contributors describing how the code should be developed.
* *CHANGELOG.md* - This document describes major changes per version. If you do major API changes, it can be a good idea to cover them here. It is possible to generate the file based on Git commit history, provided you write nice enough commits.
* *.travis.yml* - [Travis CI](https://travis-ci.org/) is a popular continuous integration platform that is free for open source projects. You can run the tests of your package over multiple systems using it. There are other alternatives of course, but Travis is popular.
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

  /* `npm run <name>` - `npm run` to get the available commands */
  "scripts": {
    "start": "webpack-dev-server --env development",

    "test": "jest",
    "test:coverage": "jest --coverage",
    "test:watch": "jest --watch",

    "lint:js": "eslint . --ext .js --ext .jsx --ignore-path .gitignore --ignore-pattern dist --cache",

    "gh-pages": "webpack --env gh-pages",
    "gh-pages:deploy": "gh-pages -d gh-pages",
    "gh-pages:stats": "webpack --env gh-pages --profile --json > stats.json",

    "dist": "webpack" --env dist",
    "dist:min": "webpack --env dist:min",
    "dist:modules": "rm -rf ./dist-modules && babel ./src --out-dir ./dist-modules",

    "pretest": "npm run lint:js",
    "preversion": "npm run test && npm run dist && npm run dist:min && git commit --allow-empty -am \"Update dist\"",
    "prepublish": "npm run dist:modules",
    "postpublish": "npm run gh-pages && npm run gh-pages:deploy",

    /* If your library is installed through Git, you may want to transpile it */
    "postinstall": "node lib/post_install.js"
  },

  /* Entry point for terminal (i.e., <package name>). */
  /* Don't set this unless you intend to allow CLI usage */
  "bin": "bin/index.js",

  /* Entry point (defaults to index.js) */
  "main": "dist-modules/",

  /* ES6 entry point for bundlers to pick up. */
  /* This assumes only standard features are used! */
  "module": "dist/",

  /* Files to include to npm distribution. */
  /* Note that relative patterns like "./src" will fail! */
  "files": [
    "dist/"
  ],

  /* Package dependencies needed to use it (peer deps can work too, see below) */
  "dependencies": { ... },

  /* Package development dependencies needed to develop/compile it */
  "devDependencies": { ... },

  /* Package peer dependencies. The consumer will fix exact versions. */
  /* In npm3 these won't get installed automatically and it's up to the */
  /* user to define which versions to use. */
  /* If you want to include RC versions to the range, consider using */
  /* a pattern such as ^4.0.0-0 */
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

As you can see, *package.json* can contain a lot of information. You can attach non-npm specific metadata there that can be used by tooling. Given this can bloat *package.json*, it may be preferable to keep metadata at files of their own.

T> JSON doesn't support comments even though I'm using them above. There are extended notations, such as [Hjson](http://hjson.org/), that do.

T> If you want something cross-platform, consider using [rimraf](https://www.npmjs.com/package/rimraf) over `rm -rf` as latter won't work on Windows.

## npm Workflow

Working with npm is surprisingly simple. To get started, you will need to use [npm adduser](https://docs.npmjs.com/cli/adduser) (aliased to `npm login`). It allows you to set up an account. After this process has completed, it will create *~/.npmrc* and use that data for authentication. There's also [npm logout](https://docs.npmjs.com/cli/logout) that will clear the credentials.

T> When creating a project, `npm init` respects the values set at *~/.npmrc*. Hence, it may be worth your while to set reasonable defaults there to save some time. If you want to limit your package to a specific scope, use `npm init --scope=<scope>`. As a result, you will get `@<scope>/<package>`. This is handy, especially for personal packages since the default namespace of npm is so crowded.

### Publishing a Package

Provided you have logged in, creating new packages is just a matter of executing `npm publish`. Given that the package name is still available and everything goes fine, you should have something out there! After this, you can install your package through `npm install` or `npm i`.

An alternate way to consume a library is to point at it directly in *package.json*. In that case, you can do `"depName": "<github user>/<project>#<reference>"` where `<reference>` can be either commit hash, tag, or branch. You can point to specific pull requests through `<github user>/<project>#pull/<id>/head`. These techniques can be useful, especially if you need to hack around something quickly and cannot wait for the fix.

T> If you want to see what files will be published to npm, consider using [npm pack](https://docs.npmjs.com/cli/pack) generates a tarball you can examine. [irish-pub](https://www.npmjs.com/package/irish-pub) is another option and it will give you a listing to review. You can also use [publish-diff](https://www.npmjs.com/package/publish-diff) to get a better of the changes that are going to be published.

T> [np](https://www.npmjs.com/package/np) gives an interactive UI for publishing packages. It performs more work by default. [semantic-release](https://www.npmjs.com/package/semantic-release) takes the idea one step further and automates entire process.

### Bumping a Version

In order to bump your package version, you'll just need to invoke one of these commands:

* `npm version <x.y.z>` - Define version yourself.
* `npm version <major|minor|patch>` - Let npm bump the version for you based on SemVer.
* `npm version <premajor|preminor|prepatch|prerelease>` - Same as previous expect this time it will generate `-<prerelease number>` suffix. Example: `v2.1.2-2`.

Invoking any of these will update *package.json* and create a version commit to git automatically. If you execute `npm publish` after doing this, you should have something new out there.

Note that in the example above, I've set up `version`-related hooks to make sure a version will contain a fresh version of a distribution build. I also run tests just in case. It's better to catch potential issues early on after all.

T> Consider using [semantic-release](https://www.npmjs.com/package/semantic-release) if you prefer a more structured approach. It can take some pain out of the release process while automating a part of it. For instance, it is able to detect possible breaking changes and generate changelogs.

T> [dont-break](https://www.npmjs.com/package/dont-break) allows you to run the unit tests of dependent projects against your current code to see if it breaks anything. Sometimes it's easy to overlook some use case that might not be a part of the public API even and break a dependency. *dont-break* helps with that particular problem.

### Respect the SemVer

Even though it is simple to publish new versions out there, it is important to respect the SemVer. Roughly, it states that you should not break backwards compatibility, given certain rules are met. The exact rules were covered in the previous chapter, so I won't cover them again here.

To make it easier to comply with SemVer, [next-ver](https://www.npmjs.com/package/next-ver) can compute the next version you should use and update it for you. [commitizen](https://www.npmjs.com/package/commitizen) goes further and allows changelog generation and automated releases.

Both these tools rely on commit message annotations. On small projects, you might have `fix` or `feat` prefix at your commit titles (e.g., `fix - Allow doodad to work with zero`). You can also communicate the context using `chore(docs)` kind of style to document which part of the project was touched.

This metadata lets the tooling to figure out the types of the changes you made. It can help even with changelog generation and allow automated releases over manual ones. Annotating your commits well is a good practice in any case as it will make it easier to debug your code later.

Given SemVer can be a little tricky to manage, a backwards compatible alternative named [ComVer](https://github.com/staltz/comver) has been developed. The versioning scheme can be described as `<not compatible>.<compatible>`. Every time you make a change that's not compatible with an earlier version, you'll bump the first number. Otherwise you will bump the other.

### Publishing a Prerelease Version

Sometimes, you might want to publish something preliminary for other people to test. There are certain conventions for this. You rarely see *alpha* releases at npm. *beta* and *rc* (release candidate) are common, though. For example, a package might have versions like this:

* v0.5.0-alpha1
* v0.5.0-beta1
* v0.5.0-beta2
* v0.5.0-rc1
* v0.5.0-rc2
* v0.5.0

The initial alpha release will allow the users to try out the upcoming functionality and provide feedback. The beta releases can be considered more stable.

The release candidates (rc) are close to an actual release and won't introduce any new functionality. They are all about refining the release till it's suitable for general consumption.

The workflow in this case is straightforward:

1. `npm version 0.5.0-alpha1` - Update *package.json* as discussed earlier.
2. `npm publish --tag alpha` - Publish the package under *alpha* tag.

In order to consume the test version, your users will have to use `npm install <your package name>@alpha`.

T> It can be useful to utilize [npm link](https://docs.npmjs.com/cli/link) during development. It allows you to link a package as a globally available symbolic link within your system. Node.js will resolve to the linked version unless local `node_modules` happens to contain a version. If you want to remove the link, you should use `npm unlink` or `npm unlink <package>`.

### On Naming Packages

Before starting to develop, it can be a good idea to spend a little bit of time on figuring out a good name for your package. It's not very fun to write a great package just to notice the name has been taken. A good name is easy to find through a search engine, and most importantly, is available at npm.

As of npm 2.7.0 it is possible to create [scoped packages](https://docs.npmjs.com/getting-started/scoped-packages). They follow format `@username/project-name`. Simply follow that when naming your project. This is a good way to grow packages.

T> If you find a good name that appears to be abandoned, contact npm and they'll likely give it you if you ask nicely.

## npm Lifecycle Hooks

npm provides various lifecycle hooks that can be useful. Suppose you are authoring a React component using Babel and some of its goodies. You could let the *package.json* `main` field point at the UMD version as generated above. However, this won't be ideal for those consuming the library through npm.

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

Make sure you execute `npm install babel-cli --save-dev` to include the tool into your project.

You probably don't want the directory content to end up in your Git repository. In order to avoid this and to keep your `git status` clean, consider this sort of `.gitignore`:

```bash
dist-modules/
...
```

Besides `prepublish`, npm provides a set of other hooks. The naming is always the same and follows the pattern `pre<hook>`, `<hook>`, `post<hook>` where `<hook>` can be `publish`, `install`, `test`, `stop`, `start`, `restart`, or `version`. Even though npm will trigger scripts bound to these automatically, you can trigger them explicitly through `npm run` for testing (i.e., `npm run prepublish`).

There are plenty of smaller tricks to learn for advanced usage. Those are better covered by [the official documentation](https://docs.npmjs.com/misc/scripts). Often all you need is just a `prepublish` script for build automation.

### Working Around `prepublish` in npm 3

It is important to note that in npm 3 `prepublish` hook will get triggered also when you run `npm install` on the project locally. Sometimes this can be surprising and counter-productive even.

[in-publish](https://www.npmjs.com/package/in-publish) allows you to tune the behavior and skip the installation step. You need to prepend your script with `in-publish && babel ...` kind of line for this to work. npm 4 and the following versions will fix this confusing behavior.

## Sharing Authorship

As packages evolve, you may want to start developing with others. You could become the new maintainer of some project, or pass the torch to someone else. These things happen as packages evolve.

npm provides a few commands for these purposes. It's all behind `npm owner` namespace. More specifically, you'll find `npm owner ls <package name>`, `npm owner add <user> <package name>` and `npm owner rm <user> <package name>` there. That's about it.

See [npm documentation](https://docs.npmjs.com/cli/owner) for the most up to date information about the topic.

## Package Authoring Techniques

There are a couple of package authoring-related techniques that are good to know. You can set up webpack to generate a UMD build. You can also exclude certain dependencies out of your bundle.

To make it easier to consume your packages, you can also generate a Node.js friendly versions. This technique can be improved further by setting up a script to generate a Node.js friendly version.

### Setting Up UMD

Allowing webpack to output your bundle in the UMD format is simple. Webpack allows you to control the output format using [output.libraryTarget](https://webpack.js.org/configuration/output/#output-librarytarget) field. It defaults to `var`. This means it will set your bundle to a variable defined using the `output.library` field.

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

### Supporting SystemJS

[SystemJS](https://github.com/systemjs/systemjs) is an emerging standard that's starting to get more attention. [webpack-system-register](https://www.npmjs.com/package/webpack-system-register) plugin allows you to wrap your output in a `System.register` call making it compatible with the scheme.

If you want to support SystemJS this way, set up another build target where to generate a bundle for it.

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
},
```

These two fields help you a lot as a package author but there's more to it.

T> If you want to include all modules in *node_modules* by default, it could be interesting to use [webpack-node-externals](https://www.npmjs.com/package/webpack-node-externals) instead. Then you would end up with `externals: [nodeExternals()]` kind of declaration. If you don't need to adapt to different environments, this could be a neat way to go.

T> Given bundling may still be required sometimes, consider using the [bundledDependencies](https://docs.npmjs.com/files/package.json#bundleddependencies) (or just `bundleDependencies`) field. This can be useful if you want to share third-party files not available through npm. There's a great [Stack Overflow answer](http://stackoverflow.com/a/25044361/228885) discussing the topic further.

### Processing Node.js Version through Babel

If you are processing your code through Babel, I suggest you process the Node.js version of the package directly through Babel and skip webpack. The advantage of doing this is that it gives you separate modules that are easier to consume one by one if needed. This avoids having to go through a heavy bundle.

In this case you'll likely want a setup like this:

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

Secondly, we'll need the script itself:

**lib/post_install.js**

```javascript
// Based on rackt/history (MIT)
// Node 4+
var execSync = require('child_process').execSync;
var stat = require('fs').stat;

stat('dist-modules', function(err, stats) {
  // Skip building on Travis
  if (process.env.TRAVIS) {
    return;
  }

  // If dist-modules directory does not exist
  if (err || !stats.isDirectory()) {
    // Install devDependencies
    exec('npm install --only=dev');
    // Build ES5 modules
    exec('npm run dist:modules');
  }
});

function exec(command) {
  execSync(command, {
    // Print stdin/stdout/stderr
    stdio: 'inherit'
  });
}
```

The script may need tweaking to fit your purposes. But it's enough to give you a rough idea. If the `dist-modules` directory is missing, we'll generate it here. That's it.

W> Relying on `postinstall` scripts can be [potentially dangerous](http://blog.npmjs.org/post/141702881055/package-install-scripts-vulnerability). Security minded developers may want to use `npm install --ignore-scripts`. You can set that default through `npm config set ignore-scripts true` if you want. Being a little cautious might not hurt.

### Deprecating, Unpublishing, and Renaming Packages

It is possible that at some point in time your package reaches end of its life. Another package might replace it or it simply might become obsolete. For this purpose npm provides [npm deprecate](https://docs.npmjs.com/cli/deprecate) command. You can state `npm deprecate foo@"< 0.4.0" "Use bar package instead"`.

You can deprecate a range like this or a whole package by skipping the range. Given mistakes happen, you can undeprecate a package by providing an empty message.

Given there's no official way to rename packages, deprecation can be useful. You can publish the package under a new name and let the users know of the new name in your deprecation message.

There is a heavier duty option in the form of [npm unpublish](https://docs.npmjs.com/cli/unpublish). Using `npm unpublish` you can literally pull a package out of the registry. Given this can be potentially dangerous and break code for a lot of people, it has been [restricted to versions that are less than 24 hours old](http://blog.npmjs.org/post/141905368000/changes-to-npms-unpublish-policy). Most likely you don't need the feature at all, but it is good to know it exists.

## Conclusion

You should now have a basic idea of how to author npm packages. Webpack can help you a lot here. Just picking up `output.libraryTarget` and `externals` help you a lot.

These options are useful beyond package authoring. Particularly `externals` comes in handy when you want to exclude certain dependencies outside of your bundles and load them using some other way.
