# Authoring Packages

Even though Webpack is useful for bundling applications, it has its uses for package authors as well. You can use it to output your bundle in the [UMD format](https://github.com/umdjs/umd). It is a format that's compatible with various environments (CommonJS, AMD, globals).

## Setting Up UMD

Allowing Webpack to output your bundle in the UMD format is simple. Webpack allows you to control the output format using [output.libraryTarget](https://webpack.github.io/docs/configuration.html#output-librarytarget) field. It defaults to `var`. This means it will set your bundle to a variable defined using the `output.library` field. There are other options too, but the one we are interested in is `output.libraryTarget: 'umd'`. Consider the example below:

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

## Processing Node.js Version through Babel

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

## Generating Distribution for Development Usage

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
  "devDependencies": {
    ...
    /* You should install sync-exec through `npm i` to get a recent version */
    "sync-exec": "^0.6.2"
  }
}
```

Secondly we'll need the script itself:

**lib/post_install.js**

```javascript
// adapted based on rackt/history (MIT)
// Node 0.10+
var execSync = require('child_process').execSync;
var stat = require('fs').stat;

// Node 0.10 check
if (!execSync) {
  execSync = require('sync-exec');
}

function exec(command) {
  execSync(command, {
    stdio: [0, 1, 2]
  });
}

stat('dist-modules', function(error, stat) {
  // Skip building on Travis
  if (process.env.TRAVIS) {
    return;
  }

  if (error || !stat.isDirectory()) {
    exec('npm i babel-cli babel-preset-es2015 babel-preset-react');
    exec('npm run dist-modules');
  }
});
```

The script may need tweaking to fit your purposes. But it's enough to give you a rough idea. If the `dist_modules` directory is missing, we'll generate it here. That's it.

W> Relying on `postinstall` scripts can be [potentially dangerous](http://blog.npmjs.org/post/141702881055/package-install-scripts-vulnerability). Security minded developers may want to use `npm install --ignore-scripts`. You can set that default through `npm config set ignore-scripts true` if you want. Being a little cautious might not hurt.

## Conclusion

Webpack can do a lot of work for a package author. Just picking up `output.libraryTarget` and `externals` help you a lot. These options are useful beyond package authoring. Particularly `externals` comes in handy when you want to exclude certain dependencies outside of your bundles and load them using some other way.
