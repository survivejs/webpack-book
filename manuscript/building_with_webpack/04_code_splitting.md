# Code Splitting

Web applications have the tendency to grow big as features are developed. The longer it takes for your application to load, the more frustrating it is to the user. This problem is amplified in a mobile environment where the connections can be slow.

Even though splitting our bundles can help a notch, they are not the only solution and you may still end up having to download a lot of data. Fortunately, it is possible to do better thanks to *code splitting*. It allows us to load code lazily as we need it.

T> Incidentally, it is possible to implement Google's [PRPL pattern](https://developers.google.com/web/fundamentals/performance/prpl-pattern/) using lazy loading. PRPL (Push, Render, Pre-cache, Lazy-load) has been designed with mobile web in mind and can be implemented using webpack.

## Code Splitting Formats

Code splitting can be done in two primary ways in webpack: through a [dynamic import](https://github.com/tc39/proposal-dynamic-import) or `require.ensure` syntax. We'll be using the former in this project. The syntax isn't in the official specification yet so it will require minor tweaks especially at ESLint and Babel too if you are using that.

The goal is to end up with a split point that will get loaded on demand. There can be splits inside splits and you can structure an entire application based on splits.

![Bundle with a dynamically loaded normal chunk](images/dynamic.png)

### Dynamic `import`

Dynamic imports look like this:

```javascript
import('./module').then((module) => {...}).catch((error) => {...});
```

The `Promise` based interface allows composition and you could load multiple resources in parallel like this:

```javascript
Promise.all([
  import('lunr'),
  import('../search_index.json'),
]).then(([lunr, search]) => {
  return {
    index: lunr.Index.load(search.index),
    lines: search.lines,
  };
});
```

It is important to note that this will create separate chunks to request. If you wanted only one, you would have to define an intermediate module to `import`.

### `require.ensure`

[require.ensure](https://webpack.js.org/guides/code-splitting-require/#require-ensure-) provides an alternate way:

```javascript
require.ensure(
  // Modules to load, but not execute yet
  ['./load-earlier'],
  () => {
    const loadEarlier = require('./load-earlier');

    // Load later on demand and include to the same chunk
    const module1 = require('./module1');
    const module2 = require('./module2');

    ...
  },
  'optional name'
);
```

As you can see, `require.ensure` definition is more powerful. The gotcha is that it doesn't support error handling. Often you can achieve what you want through a dynamic `import`, but it's good to know this form exists as well.

T> `require.ensure` supports naming. `require.ensure` blocks that have the same name will be pulled into the same output chunk as showcased by [an official example](https://github.com/webpack/webpack/tree/master/examples/named-chunks).

W> `require.ensure` relies on `Promise`s internally. If you use `require.ensure` with older browsers, remember to shim `Promise` using a polyfill such as [es6-promise](https://www.npmjs.com/package/es6-promise).

### `require.include`

The example above could be rewritten using webpack specific `require.include`:

```javascript
require.ensure(
  [],
  () => {
    require.include('./load-earlier');

    const loadEarlier = require('./load-earlier');

    // Load later on demand and include to the same chunk
    const module1 = require('./module1');
    const module2 = require('./module2');

    ...
  }
);
```

If you had nested `require.ensure` definitions, you could pull a module to the parent chunk using either syntax.

T> The formats respect `output.publicPath` option. You can also use `output.chunkFilename` to shape where they output. Example: `chunkFilename: 'scripts/[name].js'`.

## Setting Up Code Splitting

To demonstrate the idea of code splitting, we should pick up one of the formats above and integrate it to our project. Dynamic `import` is enough. Before we can implement the webpack side, ESLint needs a slight tweak.

### Configuring ESLint

Given ESLint supports only standard ES6 out of the box, it requires some tweaking to work with dynamic `import`. Install *babel-eslint* parser first:

```bash
npm install babel-eslint -D
```

Tweak ESLint configuration as follows:

**.eslintrc.js**

```javascript
module.exports = {
  "env": {
    "browser": true,
    "commonjs": true,
    "es6": true,
    "node": true,
  },
  "extends": "eslint:recommended",
leanpub-start-insert
  "parser": "babel-eslint",
leanpub-end-insert
  "parserOptions": {
    "sourceType": "module",
leanpub-start-insert
    "allowImportExportEverywhere": true,
leanpub-end-insert
  },
  ...
}
```

After these changes, ESLint won't complain if we write `import` in the middle of our code.

### Configuring Babel

Given Babel doesn't support the dynamic `import` syntax out of the box, it needs [babel-plugin-syntax-dynamic-import](https://www.npmjs.com/package/babel-plugin-syntax-dynamic-import) in order to work. Install it first:

```bash
npm install babel-plugin-syntax-dynamic-import --save-dev
```

To connect it with the project, adjust the configuration as follows:

**.babelrc**

```json
{
leanpub-start-insert
  "plugins": ["syntax-dynamic-import"],
leanpub-end-insert
  "presets": [
    ...
  ]
}
```

### Defining a Split Point Using a Dynamic `import`

A simple way to illustrate the idea might be to set up a module that contains a string that will replace the text of our demo button. Set up a file as follows:

**app/lazy.js**

```javascript
export default 'Hello from lazy';
```

In practice, you could have a lot more code here and additional split points. This is a good place to extend the demonstration.

We also need to point the application to this file so it knows to load it. A simple way to do this is to bind the loading process to click. Whenever the user happens to click the button, we'll trigger the loading process and replace the content.

**app/component.js**

```javascript
export default function () {
  const element = document.createElement('div');

  element.className = 'fa fa-hand-spock-o fa-1g';
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

If you open up the application (`npm start`) and click the button, you should see the new text in the button.

![Lazy loaded content](images/lazy.png)

Perhaps the more interesting thing is to see what the build result looks like. If you run `npm run build`, you should see something like this:

```bash
Hash: 60cb132200bce915e81d
Version: webpack 2.2.1
Time: 2812ms
                    Asset       Size  Chunks             Chunk Names
                vendor.js     141 kB       2  [emitted]  vendor
  fontawesome-webfont.eot     166 kB          [emitted]
fontawesome-webfont.woff2    77.2 kB          [emitted]
 fontawesome-webfont.woff      98 kB          [emitted]
  fontawesome-webfont.svg   22 bytes          [emitted]
                 logo.png      77 kB          [emitted]
                     0.js  313 bytes       0  [emitted]
                   app.js    2.45 kB       1  [emitted]  app
  fontawesome-webfont.ttf     166 kB          [emitted]
                  app.css  230 bytes       1  [emitted]  app
               vendor.css    3.69 kB       2  [emitted]  vendor
                 0.js.map  235 bytes       0  [emitted]
               app.js.map    2.27 kB       1  [emitted]  app
              app.css.map   84 bytes       1  [emitted]  app
            vendor.js.map     167 kB       2  [emitted]  vendor
           vendor.css.map   87 bytes       2  [emitted]  vendor
               index.html  315 bytes          [emitted]
   [0] ./~/process/browser.js 5.3 kB {2} [built]
   [3] ./~/react/lib/ReactElement.js 11.2 kB {2} [built]
  [18] ./app/component.js 372 bytes {1} [built]
...
```

That *0.js* is our split point. Examining the file reveals that webpack has wrapped the code in a `webpackJsonp` block and processed the code bit.

### Defining a Split Point Using `require.ensure`

It is possible to achieve the same with `require.ensure`. Consider the full example below:

```javascript
export default function () {
  const element = document.createElement('div');

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

T> [bundle-loader](https://www.npmjs.com/package/bundle-loader) gives similar results, but through a loader interface.

T> The *Dynamic Loading* appendix covers other techniques that come in handy when you have to deal with more dynamic splits.

## Code Splitting in React

The splitting pattern can be wrapped into a React component. Airbnb uses the following solution [as described by Joe Lencioni](https://gist.github.com/lencioni/643a78712337d255f5c031bfc81ca4cf):

```javascript
import React from 'react';

...

// Somewhere in code
<AsyncComponent loader={() => import('./SomeComponent')} />

...

// React wrapper for loading
class AsyncComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      Component: null,
    };
  }

  componentDidMount() {
    // Load the component now
    this.props.loader().then(Component => {
      this.setState({ Component });
    });
  }

  render() {
    const { Component } = this.state;
    const { Placeholder } = this.props;

    if (Component) {
      return <Component {...this.props} />;
    }

    return <Placeholder>
  }
}

AsyncComponent.propTypes = {
  // A loader is a function that should return a Promise.
  loader: PropTypes.func.isRequired,

  // A placeholder to render while waiting completion.
  Placeholder: PropTypes.node.isRequired
};
```

T> [react-async-component](https://www.npmjs.com/package/react-async-component) wraps the pattern in a `createAsyncComponent` call and provides server side rendering specific functionality.

## Conclusion

Code splitting is one of those features that allows you to push your application a notch further. You can load code when you need it. This gives faster initial load times and helps to improve user experience especially in a mobile context where bandwidth is limited.

It comes with some extra work as you must figure out what's possible to split. Often, you find good split points within a router. Or you may notice that specific functionality is required only when specific feature is used. Charting is a good example of this.

Just applying `import` or `require.ensure` alone can be effective. `require.context` has more limited possibilities, but it's a powerful tool especially for tool developers.

T> There's a complete example of how to use the code splitting technique in the *Searching with React* appendix. You will see how to set up a static site index that's loaded when the user searches information.

T> [webpack-pwa](https://github.com/webpack/webpack-pwa) illustrates the idea in a larger scale and discusses different shell based approaches.
