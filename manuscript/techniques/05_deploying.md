# Deploying Applications

A project built with webpack can be deployed to a variety of environments. A public project that doesn't rely on a backend can be pushed to GitHub Pages using the *gh-pages* package. Also, there are a variety of webpack plugins that can target other environments, such as S3.

## Deploying with *gh-pages*

[gh-pages](https://www.npmjs.com/package/gh-pages) allows you to host stand-alone applications on GitHub Pages easily. It has to be pointed to a build directory first. It picks up the contents and pushes them to the `gh-pages` branch.

Despite its name, the package works with other services that support hosting from a Git repository as well. But given GitHub is so popular, it can be used to demonstrate the idea. In practice, you would likely have more complicated setup in place that would push the result to another service through a Continuous Integration system.

### Setting Up *gh-pages*

To get started, execute

```bash
npm install gh-pages --save-dev
```

{pagebreak}

You are also going to need a script in *package.json*:

**package.json**

```json
"scripts": {
leanpub-start-insert
  "deploy": "gh-pages -d build",
leanpub-end-insert
  ...
},
```

To make the asset paths work on GitHub Pages, `output.publicPath` field has to be adjusted. Otherwise, the asset paths end up pointing at the root, and that doesn't work unless you are hosting behind a domain root (say `survivejs.com`) directly.

`publicPath` gives control over the resulting urls you see at *index.html* for instance. If you are hosting your assets on a CDN, this would be the place to tweak.

In this case, it's enough to set it to point the GitHub project as below:

**webpack.config.js**

```javascript
const productionConfig = merge([
  {
    ...
    output: {
      ...
leanpub-start-delete
      // Needed for code splitting to work in nested paths
      publicPath: "/",
leanpub-end-delete
leanpub-start-insert
      // Tweak this to match your GitHub project name
      publicPath: "/webpack-demo/",
leanpub-end-insert
    },
  },
  ...
]);
```

After building (`npm run build`) and deploying (`npm run deploy`), you should have your application from the `build/` directory hosted on GitHub Pages. You should find it at `https://<name>.github.io/<project>` assuming everything went fine.

T> If you need a more elaborate setup, use the Node API that *gh-pages* provides. The default command line tool it gives is enough for essential purposes, though.

T> GitHub Pages allows you to choose the branch where you deploy. It's possible to use the `master` branch even as it's enough for minimal sites that don't need bundling. You can also point below the *./docs* directory within your `master` branch and maintain your site.

### Archiving Old Versions

*gh-pages* provides an `add` option for archival purposes. The idea goes as follows:

1. Copy the old version of the site in a temporary directory and remove *archive* directory from it. You can name the archival directory as you want.
2. Clean and build the project.
3. Copy the old version below *build/archive/<version>*
4. Set up a script to call *gh-pages* through Node as below and capture possible errors in the callback:

```javascript
ghpages.publish(path.join(__dirname, "build"), { add: true }, cb);
```

## Deploying to Other Environments

Even though you can push the problem of deployment outside of webpack, there are a couple of webpack specific utilities that come in handy:

* [webpack-deploy](https://www.npmjs.com/package/webpack-deploy) is a collection of deployment utilities and works even outside of webpack.
* [webpack-s3-sync-plugin](https://www.npmjs.com/package/webpack-s3-sync-plugin) and [webpack-s3-plugin](https://www.npmjs.com/package/webpack-s3-plugin) sync the assets to Amazon.
* [ssh-webpack-plugin](https://www.npmjs.com/package/ssh-webpack-plugin) has been designed for deployments over SSH.
* [now-loader](https://www.npmjs.com/package/now-loader) operates on resource level and allows you to deploy specific resources to Now hosting service.

T> To get access to the generated files and their paths, consider using [assets-webpack-plugin](https://www.npmjs.com/package/assets-webpack-plugin). The path information allows you to integrate webpack with other environments while deploying.

W> To make sure clients relying on the older bundles still work after deploying a new version, do **not** remove the old files until they are old enough. You can perform a specific check on what to remove when deploying instead of removing every old asset.

## Resolving `output.publicPath` Dynamically

If you don't know `publicPath` beforehand, it's possible to resolve it based on the environment by following these steps:

1. Set `__webpack_public_path__ = window.myDynamicPublicPath;` in the application entry point and resolve it as you see fit.
2. Remove `output.publicPath` setting from your webpack configuration.
3. If you are using ESLint, set it to ignore the global through `globals.__webpack_public_path__: true`.

When you compile, webpack picks up `__webpack_public_path__` and rewrites it so that it points to webpack logic.

## Conclusion

Even though webpack isn't a deployment tool, you can find plugins for it.

To recap:

* It's possible to handle the problem of deployment outside of webpack. You can achieve this in an npm script for example.
* You can configure webpack's `output.publicPath` dynamically. This technique is valuable if you don't know it compile-time and want to decide it later. This is possible through the `__webpack_public_path__ ` global.
