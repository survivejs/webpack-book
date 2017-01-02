# Hosting on GitHub Pages

A package known as [gh-pages](https://www.npmjs.com/package/gh-pages) allows us host our application on GitHub easily. You point it to your build directory first. It will then pick up the contents and push them to the `gh-pages` branch.

Despite its name, the package works with other services that support hosting from a Git repository as well. But given GitHub is so popular, it's good enough for demonstrating the idea.

In practice you would likely have more complicated setup in place that would push the result to some other service through a Continuous Environment (CI) system. The approach discussed here is enough for small projects and demonstrations that can be entirely static.

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

To make the asset paths work on GitHub Pages, we also need to tweak a webpack setting known as `output.publicPath`. Otherwise they will point at root and that won't work unless you are hosting behind a domain root (say `survivejs.com`) directly.

`publicPath` gives control over the resulting urls you see at *index.html* for instance. If you are hosting your assets on a CDN, this would be the place to tweak. In this case it's enough to set it to point the GitHub project like this:

```javascript
...

module.exports = function(env) {
  if (env === 'production') {
    return merge(
      common,
leanpub-start-insert
      {
        output: {
          // Tweak this to match your GitHub project name
          publicPath: '/webpack-demo/'
        }
      },
leanpub-end-insert
      parts.extractBundles([
        {
          name: 'vendor',
          entries: ['react']
        }
      ]),
      parts.clean(PATHS.build),
      parts.generateSourcemaps('source-map'),
      parts.extractCSS(),
      parts.purifyCSS(PATHS.app)
    );
  }

  ...
};
```

After building (`npm run build`) and deploying (`npm run deploy`), you should have your application from the `build/` directory hosted through GitHub Pages. You should find it at `https://<name>.github.io/<project>` (`github.com/<name>/<project>` at GitHub) assuming everything went fine.

T> If you need a more elaborate setup, use the Node.js API that *gh-pages* provides. The default CLI tool it provides is enough for simple purposes, though.

T> GitHub Pages allows you to choose the branch where you deploy. It is possible to use the `master` branch even. This is enough for minimal sites that don't need bundling. You can also point below the *./docs* directory within your `master` branch and maintain your site. That is useful for small projects.

## Archiving Old Versions

*gh-pages* provides an `add` option that is useful for archival purposes. This is great especially for documentation sites. The idea goes as follows:

1. Copy the old version of the site in a temporary directory and remove *archive* directory from it. You can name the archival directory as you want.
2. Clean and build the project.
3. Copy the old version below *build/archive/<version>*
4. Set up a script to call *gh-pages* through Node.js like this: `ghpages.publish(path.join(__dirname, 'build'), { add: true }, callback);`. You should capture possible error in that callback.

## Conclusion

The same idea works with other environments too. You can set up *gh-pages* to push into a branch you want. After this step we have a fairly complete development and production setup.
