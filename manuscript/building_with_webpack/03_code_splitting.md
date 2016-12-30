# Code Splitting

Web applications have the tendency to grow big as features are developed. This can be problematic especially for mobile usage. The longer it takes for your application to load, the more frustrating it is to the user. This problem is amplified in a mobile environment where the connections can be slow.

Even though splitting our bundles can help a notch, they are not the only solution and you may still end up having to download a lot of data. Fortunately it is possible to do better thanks to a technique known as *code splitting*. It allows us to load code lazily as we need it.

T> Incidentally, it is possible to implement Google's [PRPL pattern](https://developers.google.com/web/fundamentals/performance/prpl-pattern/) using lazy loading. PRPL (Push, Render, Pre-cache, Lazy-load) has been designed mobile web in mind and can be implemented using webpack.

![Bundle with a dynamically loaded normal chunk](images/dynamic.png)

## Setting Up Code Splitting

Code splitting can be done in two primary ways in webpack: through a [dynamic import](https://github.com/tc39/proposal-dynamic-import) or `require.ensure` syntax. We'll be using the former in this demo. The syntax isn't in the official specification yet so it will require minor tweaks especially at ESLint and Babel too if you are using that.

### Code Splitting Formats

Dynamic imports look like this:

```javascript
import('./module').then((module) => {...}).catch((error) => {...});
```

The `Promise` based interface allows composition and you could load multiple resources in parallel if you wanted. If you wanted to load multiple through one request, you would have to define an intermediate module where to achieve that.

[require.ensure](https://webpack.github.io/docs/code-splitting.html#commonjs-require-ensure) provides an alternative way:

```javascript
require.ensure(
  // Modules to load, but not execute yet
  ['./load-earlier'],
  (require) => {
    const loadEarlier = require('./load-earlier');

    // Load later on demand and include to the same chunk
    const module1 = require('./module1');
    const module2 = require('./module2');

    ...
  }
);
```

As you can see, `require.ensure` definition is more powerful. The gotcha is that it doesn't support error handling. Often you can achieve what you want through a dynamic `import`, but it's good to know this form exists as well.

T> The formats respect `output.publicPath` option. You can also use `output.chunkFilename` to shape where they output. Example: `chunkFilename: 'scripts/[name].js'`.

### Tweaking ESLint

Given ESLint supports only standard ES6 out of the box, it requires some tweaking to work with dynamic imports. Install *babel-eslint* parser first:

```bash
npm i babel-eslint -D
```

Tweak ESLint configuration as follows:

**.eslintrc.js**

```javascript
module.exports = {
  "env": {
    "browser": true,
    "commonjs": true,
    "es6": true,
    "node": true
  },
  "extends": "eslint:recommended",
leanpub-start-insert
  "parser": "babel-eslint",
leanpub-end-insert
  "parserOptions": {
leanpub-start-delete
    "sourceType": "module"
leanpub-end-delete
leanpub-start-insert
    "sourceType": "module",
    "allowImportExportEverywhere": true
leanpub-end-insert
  },
  ...
}
```

After these changes ESLint won't complain if we write `import` in the middle of our code.

### Defining a Split Point Using a Dynamic `import`

A simple way to illustrate the idea might be to set up a module that contains a string that will replace the text of our demo button. Set up a file as follows:

**app/lazy.js**

```javascript
export default 'Hello from lazy';
```

In practice you could have a lot more code here and you could have additional split points even. This is a good place to extend the demonstration.

We also need to point the application to this file so it knows to load it. A simple way to do this is to bind the loading process to click. Whenever the user happens to click the button, we'll trigger the loading process and replace the button content.

**app/component.js**

```javascript
export default function () {
  const element = document.createElement('h1');

  element.className = 'pure-button';
  element.innerHTML = 'Hello world';
leanpub-start-insert
  element.onclick = () => {
    import('./lazy').then((lazy) => {
      element.textContent = lazy.default;
    }).catch((err) => {
      console.error(err);
    });
  };
leanpub-end-insert

  return element;
}
```

If you open up the application and click the button, you should see the new text in the button.

![Lazy loaded button content](images/lazy.png)

Perhaps the more interesting thing is to see what the build result looks like. If you run `npm run build`, you should see something like this:

```bash
Hash: 14803ace12d1084ce193
Version: webpack 2.2.0-rc.2
Time: 2680ms
                                       Asset       Size  Chunks             Chunk Names
                                        0.js  276 bytes       0  [emitted]
                                      app.js    2.27 kB       1  [emitted]  app
                                   vendor.js     141 kB       2  [emitted]  vendor
    app.788492b4b5beed29cef12fe793f316a0.css    2.22 kB       1  [emitted]  app
                                    0.js.map  277 bytes       0  [emitted]
                                  app.js.map    1.95 kB       1  [emitted]  app
app.788492b4b5beed29cef12fe793f316a0.css.map  117 bytes       1  [emitted]  app
                               vendor.js.map     167 kB       2  [emitted]  vendor
                                  index.html  307 bytes          [emitted]
   [0] ./~/process/browser.js 5.3 kB {2} [built]
   [3] ./~/react/lib/ReactElement.js 11.2 kB {2} [built]
   [7] ./~/react/react.js 56 bytes {2} [built]
...
```

That *0.js* is our split point. Examining the file reveals that webpack has wrapped the code in a `webpackJsonp` block and processed the code bit.

To make the split point name use a hash so it gets invalidated on change, tweak as follows:

**webpack.config.js**

```javascript
...

const common = merge(
  {
    entry: {
      app: PATHS.app
    },
    output: {
      path: PATHS.build,
leanpub-start-insert
      chunkFilename: 'scripts/[name].js',
leanpub-end-insert
      filename: '[name].js'
    },
    ...
  },
  parts.lintCSS(PATHS.app),
  parts.lintJavaScript(PATHS.app)
);

...
```

After this change, you should find the file below *scripts/e0b0c7ed4cbed4fcf3b2.js* or so. The hash may differ, but the idea is the same.

### Defining a Split Point Using `require.ensure`

It is possible to achieve the same with `require.ensure`. Consider the full example below:

```javascript
export default function () {
  const element = document.createElement('h1');

  element.className = 'pure-button';
  element.innerHTML = 'Hello world';
  element.onclick = () => {
    require.ensure([], (require) => {
      element.textContent = require('./lazy').default;
    });
  };

  return element;
}
```

## Dynamic Loading with `require.context`

Beyond the variants above, there's another type of `require` that you should be aware of. [require.context](https://webpack.js.org/configuration/entry-context/#context) is a general form of the above.

Let's say you are writing a static site generator on top of webpack. You could model your site contents within a directory structure. At the simplest level you could have just a `pages/` directory which would contain Markdown files.

Each of these files would have a YAML frontmatter for their metadata. The url of each page could be determined based on the filename. This is enough information to map the directory as a site. Code-wise we would end up with a statement like this somewhere:

```javascript
// Process pages through `yaml-frontmatter-loader` and `json-loader`.
// The first one extracts the frontmatter and the body and the latter
// converts it into a JSON structure we can use later. Markdown hasn't
// been processed yet.
const req = require.context(
  'json-loader!yaml-frontmatter-loader!./pages',
  true, // Load files recursively. Pass false to skip recursion.
  /^\.\/.*\.md$/ // Match files ending with .md.
);
```

`require.context` returns us a function to `require` against. It also knows its module `id` and it provides a `keys()` method for figuring out the contents of the context. To give you a better example, consider the code below:

```javascript
req.keys(); // ['./demo.md', './another-demo.md']

req.id; // 42

// {title: 'Demo', __content: '# Demo page\nDemo content\n\n'}
const demoPage = req('./demo.md');
```

This information is enough for generating an entire site. And this is exactly what I've done with [Antwar](https://github.com/antwarjs/antwar). You can find a more elaborate example in that static site generator.

The technique can be useful for other purposes, such as testing or adding files for webpack to watch. In that case you would set up a `require.context` within a file which you then point to through a webpack `entry`.

T> Note that webpack will also turn statements written in the form `require('./pages/' + pageName + '.md')` into the `require.context` format!

## Dynamic Paths with a Dynamic `import`

The same idea works with dynamic `import`. Instead of passing an absolute path, you can pass a partial one. Webpack will set up a context internally. Here's a brief example:

```javascript
// Set up a target or derive this somehow
const target = 'demo.json';

// Elsewhere in code
import(`indexes/${target}).then(...).catch(...);
```

## Dealing with Dynamic Paths

Given the approaches discussed here rely on static analysis and webpack has to find the files in question, it doesn't work for every possible case. If the files you need are on another server or have to be accessed through a specific end-point, then webpack isn't enough.

Consider using browser-side loaders like [$script.js](https://github.com/ded/script.js/) or [little-loader](https://github.com/walmartlabs/little-loader) on top of webpack in this case.

## Conclusion

Code splitting is one of those features that allows you to push your application a notch further. You can load code when you need it. This gives faster initial load times and helps to improve user experience especially in a mobile context where bandwidth is limited.

It comes with some extra work as you will have to figure out what's possible to split. Often you find good split points within a router. Or you may notice that specific functionality is required only when specific feature is used. Charting is a good example of this.

Just applying `import` or `require.ensure` alone can be very effective. `require.context` has more limited possibilities, but it's a powerful tool especially for tool developers.

T> There's a more complete example of how to use the code splitting technique at the *Searching with React* chapter. You will see how to set up a static site index that's loaded when the user searches information.
