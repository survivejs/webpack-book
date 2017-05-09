# Package Authoring Techniques

To get most out of npm and webpack, consider the techniques below. Webpack can help you here.

## npm Lifecycle Hooks

npm provides a collection of lifecycle hooks. Suppose you are authoring a React component using Babel. In that case, you should generate an ES5 compatible version of the package for npm consumers and point to it through *package.json* `main`. You can achieve this using **babel** command line tool:

```bash
babel ./lib --out-dir ./dist-modules
```

The command walks through the `./lib` directory and writes a processed file to `./dist-modules` for each module it encounters.

Since running that command each time you publish is tedious, you can set up a `prepublish` hook:

**package.json**

```json
"scripts": {
  ...
  "prepublish": "babel ./lib --out-dir ./dist-modules"
},
"main": "dist-modules/",
```

Make sure you execute `npm install babel-cli --save-dev` to include the tool into your project.

To avoid versioning the directory and to keep your `git status` clean, consider adding `dist-modules/` to your *.gitignore*.

Besides `prepublish`, npm provides a set of other hooks. The naming is always the same and follows the pattern `pre<hook>`, `<hook>`, `post<hook>` where `<hook>` can be `publish`, `install`, `test`, `stop`, `start`, `restart`, or `version`. Even though npm triggers scripts bound to these automatically, you can trigger them explicitly through `npm run` for testing (i.e., `npm run prepublish`).

The [the official documentation](https://docs.npmjs.com/misc/scripts) covers a lot of smaller tips related to these hooks. However, often all you need is a `prepublish` script for build automation.

### Working Around `prepublish` in npm 3

In npm 3 `prepublish` hook gets also triggered when you run `npm install` on the project locally. Sometimes this can be surprising and counter-productive even.

[in-publish](https://www.npmjs.com/package/in-publish) allows you to tune the behavior and skip the installation step. You need to prepend your script with `in-publish && babel ...` kind of line for this to work. npm 4 and the following versions fix this confusing behavior.

{pagebreak}

## Avoiding Bundling Dependencies

Since it's not a good idea to bundle your package dependencies, such as React, within the distribution bundle itself, you should let the user inject them. You can configure external dependencies using the `externals` configuration:

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

## Processing Node Version through Babel

If you are processing your code through Babel, you can skip webpack. The advantage of doing this is that it gives you separate modules that are easier to consume one by one if needed.

In this case, a setup as below works:

**package.json**

```json
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
```

What if someone points to a development version of your package directly through GitHub, though? It doesn't work as the `dist-modules` directory is missing. The problem can be fixed using a hook that generates the needed source.

## Generating a Distribution for Development Usage

To solve the development distribution problem, a custom script is required. First, connect the hook with a custom script:

**package.json**

```json
"scripts": {
  ...
  /* Point to the script that generates the missing source. */
  "postinstall": "node lib/postinstall.js"
},
```

Secondly, define a script:

**lib/postinstall.js**

```javascript
/* eslint-disable */
// adapted based on rackt/history (MIT)
// Node 4+
const execSync = require('child_process').execSync;
const fs = require('fs');

// This could be read from package.json
const distDirectory = 'dist-modules';

fs.stat(distDirectory, (error, stat) => {
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

{pagebreak}

## Deprecating, Unpublishing, and Renaming Packages

It's possible that your package reaches the end of its life. Another package could replace it, or it can become obsolete. For this purpose, npm provides [npm deprecate](https://docs.npmjs.com/cli/deprecate) command. You can state `npm deprecate foo@"< 0.4.0" "Use bar package instead"`.

You can deprecate a range or a whole package by skipping the range. Given mistakes happen, you can undeprecate a package by providing an empty message.

Deprecation can be handy if you have to rename a package. You can publish the package under a new name and let the users know of the new name in your deprecation message.

There is a heavier duty option in the form of [npm unpublish](https://docs.npmjs.com/cli/unpublish). Using `npm unpublish` you can pull a package out of the registry. Given this can be potentially dangerous and break the code for a lot of people, it has been [restricted to versions that are less than 24 hours old](http://blog.npmjs.org/post/141905368000/changes-to-npms-unpublish-policy). Most likely you don't need the feature at all, but it's nice to know it exists.

## Sharing Authorship

As packages evolve, you likely want to start developing with others. You could become the new maintainer of a project, or pass the torch to someone else. These things happen as packages evolve.

npm provides certain commands for these purposes. It's all behind `npm owner` namespace. More specifically, there are `npm owner ls <package name>`, `npm owner add <user> <package name>` and `npm owner rm <user> <package name>`. That's about it.

See [npm documentation](https://docs.npmjs.com/cli/owner) for the most up to date information about the topic.

## Conclusion

Both npm and webpack come with techniques of their own. It's possible to bundle packages without webpack. Webpack can generate standalone bundles and project site easily. You can leave a part of the work to Babel and similar tools.

To recap:

* Consider publishing differently packaged versions of the source to account for different usage patterns. Packaged right, your consumers can benefit from features, such as **tree shaking**.
* To make it possible to consume a work in progress package, implement an npm `postinstall` script that builds the project if a distribution version does not exist in the source.
* If a package becomes obsolete, consider deprecating it and let your users know how to upgrade to another solution.

The covered options are valuable beyond package authoring. Mainly `externals` comes in handy when you want to exclude certain dependencies outside of your bundles and load them using another way.
