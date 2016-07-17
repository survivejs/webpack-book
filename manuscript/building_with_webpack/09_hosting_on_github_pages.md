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

To make the asset paths work on GitHub Pages, we also need to tweak a Webpack setting known as `output.publicPath`. It gives us control over the resulting urls you see at *index.html* for instance. If you are hosting your assets on a CDN, this would be the place to tweak. In this case it's enough to set it to point the GitHub project like this:

```javascript
...

// Detect how npm is run and branch based on that
switch(process.env.npm_lifecycle_event) {
  case 'build':
  case 'stats':
    config = merge(
      common,
      {
        devtool: 'source-map',
        output: {
          path: PATHS.build,
leanpub-start-insert
          // Tweak this to match your GitHub project name
          publicPath: '/webpack-demo/'
leanpub-end-insert
          filename: '[name].[chunkhash].js',
          chunkFilename: '[chunkhash].js'
        }
      },
      ...
    );
    break;
  default:
    ...
}
```

If you execute `npm run deploy` now and everything goes fine, you should have your application hosted through GitHub Pages. You should find it at `https://<name>.github.io/<project>` (`github.com/<name>/<project>` at GitHub) assuming it worked.

T> If you need a more elaborate setup, you can use the Node.js API that *gh-pages* provides. The default CLI tool it provides is often enough, though.

## Conclusion

The same idea works with other environments too. You can set up *gh-pages* to push into a branch you want. After this step we have a fairly complete development and production setup.

We'll discuss various Webpack related techniques in greater detail in the following parts of this book.
