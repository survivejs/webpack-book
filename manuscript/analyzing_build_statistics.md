# Analyzing Build Statistics

Analyzing build statistics is a good step towards understanding Webpack better. We can get statistics from it easily and we can visualize them using a tool. This shows us the composition of our bundles.

In order to get suitable output we'll need to do a couple of tweaks to our configuration:

**package.json**

```json
{
  ...
  "scripts": {
leanpub-start-insert
    "stats": "webpack --profile --json > stats.json",
leanpub-end-insert
    ...
  },
  ...
}
```

**webpack.config.js**

```javascript
...

leanpub-start-delete
if(TARGET === 'build') {
leanpub-end-delete
leanpub-start-insert
if(TARGET === 'build' || TARGET === 'stats') {
leanpub-end-insert
  ...
}

...
```

If you execute `npm run stats` now, you should find *stats.json* at your project root after it has finished processing. We can take this file and pass it to [the online tool](http://webpack.github.io/analyse/). Note that the tool works only over HTTP! If your data is sensitive, consider using [the standalone version](https://github.com/webpack/analyse) instead.

Besides helping you to understand your bundle composition, the tool can help you to optimize your output further.

## Conclusion

There isn't a lot more to say about analyzing the build output. To complete our setup, we could make it possible to push our build output to static hosting like GitHub Pages. In practice you would probably use something more sophisticated, but this is enough for demonstrating simple applications and libraries.
