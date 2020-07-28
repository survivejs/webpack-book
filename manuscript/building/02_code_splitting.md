# Code Splitting

Web applications tend to grow big as features are developed. The longer it takes for your site to load, the more frustrating it's to the user. This problem is amplified in a mobile environment where the connections can be slow.

Even though splitting bundles can help a notch, they are not the only solution, and you can still end up having to download a lot of data. Fortunately, it's possible to do better thanks to **code splitting** as it allows loading code lazily when you need it.

You can load more code as the user enters a new view of the application. You can also tie loading to a specific action like scrolling or clicking a button. You could also try to predict what the user is trying to do next and load code based on your guess. This way, the functionality would be already there as the user tries to access it.

T> Incidentally, it's possible to implement Google's [PRPL pattern](https://developers.google.com/web/fundamentals/performance/prpl-pattern/) using webpack's lazy loading. PRPL (Push, Render, Pre-cache, Lazy-load) has been designed with the mobile web in mind.

T> Philip Walton's [idle until urgent technique](https://philipwalton.com/articles/idle-until-urgent/) complements code splitting and lets you optimize application loading performance further. The idea is to defer work to the future until it makes sense to perform.

## Code splitting formats

Code splitting can be done in two primary ways in webpack: through a dynamic `import` or `require.ensure` syntax. The former is used in this project and `require.ensure` is considered the legacy syntax.

The goal is to end up with a split point that gets loaded on demand. There can be splits inside splits, and you can structure an entire application based on splits. The advantage of doing this is that then the initial payload of your site can be smaller than it would be otherwise.

![Code splitting](images/code-splitting.png)

### Dynamic `import`

Dynamic imports are defined as `Promise`s:

```javascript
import(/* webpackChunkName: "optional-name" */ "./module").then(
  module => {...}
).catch(
  error => {...}
);
```

Webpack provides extra control through a comment. In the example, we've renamed the resulting chunk. Giving multiple chunks the same name will group them to the same bundle. In addition `webpackMode`, `webpackPrefetch`, and `webpackPreload` are good to know options as they let you define when the import will get triggered and how the browser should treat it.

Mode lets you define what happens on `import()`. Out of the available options, `weak` is suitable for server side rendering (SSR) as using it means the `Promise` will reject unless the module was loaded another way. In the SSR case, that would be ideal.

Prefetching tells the browser that the resource will be needed in the future while preloading means the browser will need the resource within the current page. Based on these tips the browser can then choose to load the data optimistically. [Webpack documentation explains the available options in greater detail](https://webpack.js.org/api/module-methods/#magic-comments).

T> [webpack.PrefetchPlugin](https://webpack.js.org/plugins/prefetch-plugin/) allows you to prefetch but on the level of any module.

T> `webpackChunkName` accepts `[index]` and `[request]` placeholders in case you want to let webpack define the name or a part of it.

{pagebreak}

The interface allows composition, and you could load multiple resources in parallel:

```javascript
Promise.all([import("lunr"), import("../search_index.json")]).then(
  ([lunr, search]) => {
    return {
      index: lunr.Index.load(search.index),
      lines: search.lines,
    };
  }
);
```

The code above creates separate bundles to a request. If you wanted only one, you would have to use naming or define an intermediate module to `import`.

W> The syntax works only with JavaScript after configuring it the right way. If you use another environment, you may have to use alternatives covered in the following sections.

T> [Webpack 4: import() and CommonJs](https://medium.com/webpack/webpack-4-import-and-commonjs-d619d626b655) article goes into detail on how `import()` works in different cases.

T> There's an older syntax, [require.ensure](https://webpack.js.org/api/module-methods/#require-ensure). In practice the new syntax can cover the same functionality. See also [require.include](https://webpack.js.org/api/module-methods/#require-include).

T> [webpack-pwa](https://github.com/webpack/webpack-pwa) illustrates the idea on a larger scale and discusses different shell-based approaches. You get back to this topic in the _Multiple Pages_ chapter.

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

  element.className = "rounded bg-red-100 border max-w-md m-4 p-4";
  element.innerHTML = text;
  element.onclick = () =>
    import("./lazy")
      .then((lazy) => {
        element.textContent = lazy.default;
      })
      .catch((err) => {
        console.error(err);
      });

  return element;
};
```

If you open up the application (`npm start`) and click the button, you should see the new text in it.

After executing `npm run build`, you should see something:

```bash
Hash: 23034e6ca912f0dace72
Version: webpack 4.43.0
Time: 2708ms
Built at: 07/10/2020 2:48:54 PM
     Asset       Size  Chunks             Chunk Names
leanpub-start-insert
      1.js  127 bytes       1  [emitted]
leanpub-end-insert

index.html  237 bytes          [emitted]
  main.css    8.5 KiB       0  [emitted]  main
   main.js   2.43 KiB       0  [emitted]  main
Entrypoint main = main.css main.js
...
```

That _1.js_ is your split point. Examining the file reveals webpack has wrapped the code in a `webpackJsonp` block and processed the code bit.

T> If you want to adjust the name of the chunk, set `output.chunkFilename`. For example, setting it to `"chunk.[id].js"` would prefix each split chunk with the word "chunk".

T> [bundle-loader](https://www.npmjs.com/package/bundle-loader) gives similar results, but through a loader interface. It supports bundle naming through its `name` option.

T> The _Dynamic Loading_ chapter covers other techniques that come in handy when you have to deal with more complicated splits.

{pagebreak}

## Code splitting in React

There are React specific solutions that wrap the pattern behind a small npm package:

- [@loadable/component](https://www.npmjs.com/package/@loadable/component) wraps the pattern in a `createAsyncComponent` call and provides server side rendering specific functionality.
- [react-imported-component](https://www.npmjs.com/package/react-imported-component) is another full featured solution based on hooks.
- See [React's official documentation](https://reactjs.org/docs/code-splitting.html) to learn about the code splitting APIs included out of the box. The most important ones are `React.lazy` and `React.Suspense`. Currently these don't support server side rendering.

## Disabling code splitting

Although code splitting is a good behavior to have by default, it's not correct always, especially on server-side usage. For this reason, it can be disabled as below:

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

## Controlling code splitting on runtime

Especially in a complex environment with third-party dependencies and an advanced deployment setup, you may want to control where split code is loaded from. [webpack-require-from](https://www.npmjs.com/package/webpack-require-from) has been designed to address the problem, and it's able to rewrite the import paths.

## Machine learning driven prefetching

Often users use an application in a specific way. The fact means that it makes sense to load specific portions of the application even before the user has accessed them. [guess-webpack](https://www.npmjs.com/package/guess-webpack) builds on this idea of prediction based preloading. [Minko Gechev explains the approach in detail in his article](https://blog.mgechev.com/2018/03/18/machine-learning-data-driven-bundling-webpack-javascript-markov-chain-angular-react/).

## Conclusion

Code splitting is a feature that allows you to push your application a notch further. You can load code when you need it to gain faster initial load times and improved user experience especially in a mobile context where bandwidth is limited.

To recap:

- **Code splitting** comes with extra effort as you have to decide what to split and where. Often, you find good split points within a router. Or you notice that specific functionality is required only when a particular feature is used. Charting is an excellent example of this.
- Use naming to pull separate split points into the same bundles.
- The techniques can be used within modern frameworks and libraries like React. You can wrap related logic to a specific component that handles the loading process in a user-friendly manner.
- To disable code splitting, use `webpack.optimize.LimitChunkCountPlugin` with `maxChunks` set to one.

In the next chapter, you'll learn how to split a vendor bundle without through webpack configuration.

T> The _Searching with React_ appendix contains a complete example of code splitting. It shows how to set up a static site index that's loaded when the user searches information.
