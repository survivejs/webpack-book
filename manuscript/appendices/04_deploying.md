# Deploying Applications

A project built with webpack can be deployed to a variety of environments easily. A simple, public project that doesn't rely on a backend can be pushed to GitHub Pages using the *gh-pages* package. In addition there are a variety of webpack plugins that can target other environments, such as S3.

## Deploying with *gh-pages*

[gh-pages](https://www.npmjs.com/package/gh-pages) allows you to host stand-alone applications on GitHub Pages easily. It has to be pointed to a build directory first. It will then pick up the contents and push them to the `gh-pages` branch.

Despite its name, the package works with other services that support hosting from a Git repository as well. But given GitHub is so popular, we can use it to demonstrate the idea. In practice, you would likely have more complicated setup in place that would push the result to some other service through a Continuous Integration system.

## Setting Up *gh-pages*

To get started, execute

```bash
npm install gh-pages --save-dev
```

We are also going to need a script in *package.json*:

**package.json**

```json
{
  ...
  "scripts": {
leanpub-start-insert
    "deploy": "gh-pages -d build",
leanpub-end-insert
    ...
  },
  ...
}
```

To make the asset paths work on GitHub Pages, we also need to tweak the `output.publicPath` field. Otherwise they will point at root and that won't work unless you are hosting behind a domain root (say `survivejs.com`) directly.

`publicPath` gives control over the resulting urls you see at *index.html* for instance. If you are hosting your assets on a CDN, this would be the place to tweak. In this case, it's enough to set it to point the GitHub project like this:

```javascript
...

module.exports = function(env) {
  if (env === 'production') {
    return merge([
      common,
leanpub-start-insert
      {
        output: {
          // Tweak this to match your GitHub project name
          publicPath: '/webpack-demo/',
        },
      },
leanpub-end-insert
      parts.clean(PATHS.build),
      ...
    ]);
  }

  ...
};
```

After building (`npm run build`) and deploying (`npm run deploy`), you should have your application from the `build/` directory hosted through GitHub Pages. You should find it at `https://<name>.github.io/<project>` (`github.com/<name>/<project>` at GitHub) assuming everything went fine.

T> If you need a more elaborate setup, use the Node API that *gh-pages* provides. The default command line tool it provides is enough for simple purposes, though.

T> GitHub Pages allows you to choose the branch where you deploy. It is possible to use the `master` branch even. This is enough for minimal sites that don't need bundling. You can also point below the *./docs* directory within your `master` branch and maintain your site. That is useful for small projects.

## Archiving Old Versions

*gh-pages* provides an `add` option that is useful for archival purposes. This is great, especially for documentation sites. The idea goes as follows:

1. Copy the old version of the site in a temporary directory and remove *archive* directory from it. You can name the archival directory as you want.
2. Clean and build the project.
3. Copy the old version below *build/archive/<version>*
4. Set up a script to call *gh-pages* through Node like this and capture possible errors in the callback:

```javascript
ghpages.publish(path.join(__dirname, 'build'), { add: true }, callback);
```

## Deploying to Other Environments

Even though you can push the problem of deployment outside of webpack, there are a couple webpack specific utilities that may come in handy:

* [webpack-deploy](https://www.npmjs.com/package/webpack-deploy) is a collection of deployment utilities and works even outside of webpack.
* [webpack-s3-sync-plugin](https://www.npmjs.com/package/webpack-s3-sync-plugin) and [webpack-s3-plugin](https://www.npmjs.com/package/webpack-s3-plugin) sync the assets to Amazon S3.
* [ssh-webpack-plugin](https://www.npmjs.com/package/ssh-webpack-plugin) has been designed for deployments over SSH.

## Resolving `output.publicPath` Dynamically

If you don't know `publicPath` beforehand, it's possible to resolve it based on the environment like this:

1. Set `__webpack_public_path__ = window.myDynamicPublicPath;` in the application entry point and resolve it as you see fit.
2. Remove `output.publicPath` setting from your webpack configuration.
3. If you are using ESLint, set it to ignore the global:

**.eslintrc.js**

```javascript
module.exports = {
  ...
  "globals": {
    "__webpack_public_path__": true
  },
  ...
};
```

When you compile, webpack picks up `__webpack_public_path__` and rewrites it so that it points to webpack logic.

## Conclusion

You can deploy your webpack application in multiple ways. The problem can be pushed outside of webpack or you can use a specific plugin to handle it.
