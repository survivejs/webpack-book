# Hosting on GitHub Pages

A package known as [gh-pages](https://www.npmjs.com/package/gh-pages) allows us host our application on GitHub easily. You point it to your build directory first. It will then pick up the contents and push them to the `gh-pages` branch.

## Setting Up *gh-pages*

To get started, execute

```bash
npm i gh-pages --save-dev
```

We are also going to need an entry point at *package.json*:

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

To make the asset paths work on GitHub Pages, we also need to tweak a webpack setting known as `output.publicPath`. Otherwise they will point at root and that won't work unless you are hosting behind a root domain directly.

`publicPath` gives control over the resulting urls you see at *index.html* for instance. If you are hosting your assets on a CDN, this would be the place to tweak. In this case it's enough to set it to point the GitHub project like this:

```javascript
...

module.exports = function(env) {
  if (env === 'production') {
    return merge(
      common,
      {
        devtool: 'source-map',
        output: {
          path: PATHS.build,
          filename: '[name].[chunkhash].js',
          // This is used for code splitting. The setup
          // will work without but this is useful to set.
leanpub-start-delete
          chunkFilename: '[chunkhash].js'
leanpub-start-delete
leanpub-start-insert
          chunkFilename: '[chunkhash].js',
          // Tweak this to match your GitHub project name
          publicPath: '/webpack-demo/'
leanpub-end-insert
        }
      },
      ...
    };
  }

  ...
};
```

After building (`npm run build`) and deploying (`npm run deploy`), you should have your application from the `build/` directory hosted through GitHub Pages. You should find it at `https://<name>.github.io/<project>` (`github.com/<name>/<project>` at GitHub) assuming everything went fine.

T> If you need a more elaborate setup, you can use the Node.js API that *gh-pages* provides. The default CLI tool it provides is often enough, though.

T> GitHub Pages allows you to choose the branch where you deploy now. It is possible to use the `master` branch even. This is enough for minimal sites that don't need bundling. You can also point below the *./docs* directory within your `master` branch and maintain your site. That is useful for small projects.

## Archiving Old Versions

*gh-pages* provides an `add` option that is useful for archival purposes. This is great especially for documentation sites. The idea goes as follows:

1. Copy the old version of the site in a temporary directory and remove *archive* directory from it. You can name the archival directory as you want.
2. Clean and build the project.
3. Copy the old version below *build/archive/<version>*
4. Set up a script to call *gh-pages* through Node.js like this: `ghpages.publish(path.join(__dirname, 'build'), { add: true }, callback);`. You should capture possible error in that callback.

## Conclusion

The same idea works with other environments too. You can set up *gh-pages* to push into a branch you want. After this step we have a fairly complete development and production setup.

We'll discuss various webpack related techniques in greater detail in the following parts of this book.
