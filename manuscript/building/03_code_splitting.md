# Code Splitting

Web applications tend to grow big as features are developed. The longer it takes for your application to load, the more frustrating it's to the user. This problem is amplified in a mobile environment where the connections can be slow.

Even though splitting bundles can help a notch, they are not the only solution, and you can still end up having to download a lot of data. Fortunately, it's possible to do better thanks to **code splitting**. It allows loading code lazily as you need it.

You can load more code as the user enters a new view of the application. You can also tie loading to a specific action like scrolling or clicking a button. You could also try to predict what the user is trying to do next and load code based on your guess. This way the functionality would be already there as the user tries to access it.

T> Incidentally, it's possible to implement Google's [PRPL pattern](https://developers.google.com/web/fundamentals/performance/prpl-pattern/) using webpack's lazy loading. PRPL (Push, Render, Pre-cache, Lazy-load) has been designed with mobile web in mind.

## Code Splitting Formats

Code splitting can be done in two primary ways in webpack: through a dynamic `import` or `require.ensure` syntax. The former is used in this project.

The goal is to end up with a split point that gets loaded on demand. There can be splits inside splits, and you can structure an entire application based on splits. The advantage of doing this is that then the initial payload of your application can be smaller than it would be otherwise.

![Code splitting](images/code-splitting.png)

### Dynamic `import`

The [dynamic `import` syntax](https://github.com/tc39/proposal-dynamic-import) isn't in the official language specification yet. Minor tweaks are needed especially at the Babel setup for this reason.

Dynamic imports are defined as `Promise`s:

```javascript
import(/* webpackChunkName: "optional-name" */ "./module").then(
  module => {...}
).catch(
  error => {...}
);
```

{pagebreak}

The optional name allows you to pull multiple split points into a single bundle. As long as they have the same name, they will be grouped. Each split point generates a separate bundle by default.

The interface allows composition, and you could load multiple resources in parallel:

```javascript
Promise.all([
  import("lunr"),
  import("../search_index.json"),
]).then(([lunr, search]) => {
  return {
    index: lunr.Index.load(search.index),
    lines: search.lines,
  };
});
```

The code above creates separate bundles to a request. If you wanted only one, you would have to use naming or define an intermediate module to `import`.

W> The syntax works only with JavaScript after configuring it the right way. If you use another environment you may have to use alternatives covered in the following sections.

T> There's an older syntax, [require.ensure](https://webpack.js.org/api/module-methods/#require-ensure). In practice the new syntax can cover the same functionality. See also [require.include](https://webpack.js.org/api/module-methods/#require-include).

T> [webpack-pwa](https://github.com/webpack/webpack-pwa) illustrates the idea on a larger scale and discusses different shell based approaches. You get back to this topic in the *Multiple Pages* chapter.

{pagebreak}

## Setting Up Code Splitting

To demonstrate the idea of code splitting, you can use dynamic `import`. The Babel setup of the project needs additions to make the syntax work.

### Configuring Babel

Given Babel doesn't support the dynamic `import` syntax out of the box, it needs [@babel/plugin-syntax-dynamic-import](https://www.npmjs.com/package/@babel/plugin-syntax-dynamic-import) to work.

Install it first:

```bash
npm install @babel/plugin-syntax-dynamic-import --save-dev
```

To connect it with the project, adjust the configuration as follows:

**.babelrc**

```json
{
leanpub-start-insert
  "plugins": ["@babel/plugin-syntax-dynamic-import"],
leanpub-end-insert
  ...
}
```

W> If you are using ESLint, you should install `babel-eslint` and set `parser: "babel-eslint"` in addition to `parserOptions.allowImportExportEverywhere: true` at ESLint configuration.

{pagebreak}

### Defining a Split Point Using a Dynamic `import`

The idea can be demonstrated by setting up a module that contains a string that replaces the text of the demo button:

**src/lazy.js**

```javascript
export default "Hello from lazy";
```

You also need to point the application to this file, so the application knows to load it by binding the loading process to click. Whenever the user happens to click the button, you trigger the loading process and replace the content:

**src/component.js**

```javascript
export default (text = "Hello world") => {
  const element = document.createElement("div");

  element.className = "pure-button";
  element.innerHTML = text;
leanpub-start-insert
  element.onclick = () =>
    import("./lazy")
      .then(lazy => {
        element.textContent = lazy.default;
      })
      .catch(err => {
        console.error(err);
      });
leanpub-end-insert

  return element;
};
```

If you open up the application (`npm start`) and click the button, you should see the new text in the button.

![Lazy loaded content](images/lazy.png)

If you run `npm run build`, you should see something:

```bash
Hash: 063e54c36163f79e8c90
Version: webpack 4.1.1
Time: 3185ms
Built at: 3/16/2018 5:04:04 PM
               Asset       Size  Chunks             Chunk Names
leanpub-start-insert
            0.js.map  198 bytes       0  [emitted]
                0.js  156 bytes       0  [emitted]
leanpub-end-insert
             main.js    2.2 KiB       2  [emitted]  main
            main.css   1.27 KiB       2  [emitted]  main
    vendors~main.css   2.27 KiB       1  [emitted]  vendors~main
...
```

That *0.js* is your split point. Examining the file reveals that webpack has wrapped the code in a `webpackJsonp` block and processed the code bit.

T> If you want to adjust the name of the chunk, set `output.chunkFilename`. For example, setting it to `"chunk.[id].js"` would prefix each split chunk with the word "chunk".

T> [bundle-loader](https://www.npmjs.com/package/bundle-loader) gives similar results, but through a loader interface. It supports bundle naming through its `name` option.

T> The *Dynamic Loading* chapter covers other techniques that come in handy when you have to deal with more complicated splits.

{pagebreak}

## Code Splitting in React

The splitting pattern can be wrapped into a React component. Airbnb uses the following solution [as described by Joe Lencioni](https://gist.github.com/lencioni/643a78712337d255f5c031bfc81ca4cf):

```javascript
import React from "react";

// Somewhere in code
<AsyncComponent loader={() => import("./SomeComponent")} />

class AsyncComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = { Component: null };
  }
  componentDidMount() {
    this.props.loader().then(
      Component => this.setState({ Component })
    );
  }
  render() {
    const { Component } = this.state;
    const { Placeholder, ...props } = this.props;

    return Component ? <Component {...props} /> : <Placeholder />;
  }
}
AsyncComponent.propTypes = {
  loader: PropTypes.func.isRequired,
  Placeholder: PropTypes.node.isRequired,
};
```

T> [react-async-component](https://www.npmjs.com/package/react-async-component) wraps the pattern in a `createAsyncComponent` call and provides server side rendering specific functionality. [loadable-components](https://www.npmjs.com/package/loadable-components) is another option.

## Disabling Code Splitting

Although code splitting is good behavior to have by default, it's not correct always, especially on server-side usage. For this reason, it can be disabled as below:

```javascript
const webpack = require("webpack");

...

module.exports = {
  plugins: [
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1,
    }),
  ],
};
```

T> See [Glenn Reyes' detailed explanation](https://medium.com/@glennreyes/how-to-disable-code-splitting-in-webpack-1c0b1754a3c5).

{pagebreak}

## Conclusion

Code splitting is a feature that allows you to push your application a notch further. You can load code when you need it to gain faster initial load times and improved user experience especially in a mobile context where bandwidth is limited.

To recap:

* **Code splitting** comes with extra effort as you have to decide what to split and where. Often, you find good split points within a router. Or you notice that specific functionality is required only when a particular feature is used. Charting is an excellent example of this.
* To use dynamic `import` syntax, both Babel and ESLint require careful tweaks. Webpack supports the syntax out of the box.
* Use naming to pull separate split points into the same bundles.
* The techniques can be used within modern frameworks and libraries like React. You can wrap related logic to a specific component that handles the loading process in a user-friendly manner.
* To disable code splitting, use `webpack.optimize.LimitChunkCountPlugin` with `maxChunks` set to one.

You'll learn to tidy up the build in the next chapter.

T> The *Searching with React* appendix contains a complete example of code splitting. It shows how to set up a static site index that's loaded when the user searches information.
